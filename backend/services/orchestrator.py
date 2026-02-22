import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any, Optional

from .brd_agent import generate_brd
from .gap_agent import analyze_gaps
from .data_model_agent import generate_data_model
from .compliance_agent import analyze_compliance
from .architecture_agent import generate_architecture
from .conflict_agent import analyze_conflicts
from ..config import GEMINI_25_PRO_MODEL_ID, GEMINI_PRO_MODEL_ID, GEMINI_FLASH_MODEL_ID


def _compute_health_score(brd_dict: dict, gaps_dict: dict, compliance_dict: dict) -> int:
    """
    Compute a 0-100 project health score based on:
    - Functional requirement count (up to 40pts — more = more complete)
    - KPI count (up to 20pts)
    - Gap risks count (inverted — fewer risks = higher score, up to 20pts)
    - PII/sensitive field count from compliance (inverted — fewer = healthier, up to 20pts)
    """
    score = 0

    # Functional requirements (max 40 pts — 4 pts each up to 10)
    fr_count = len(brd_dict.get("functional_requirements", []))
    score += min(fr_count * 4, 40)

    # KPIs (max 20 pts — 4 pts each up to 5)
    kpi_count = len(brd_dict.get("key_performance_indicators", []))
    score += min(kpi_count * 4, 20)

    # Gap risks (max 20 pts — deduct 4 per risk, inverted)
    risk_count = len(gaps_dict.get("risks", [])) if gaps_dict else 0
    score += max(20 - risk_count * 4, 0)

    # PII exposure (max 20 pts — deduct 3 per PII field, inverted)
    pii_count = len(compliance_dict.get("pii_fields", [])) if compliance_dict else 0
    score += max(20 - pii_count * 3, 0)

    return min(score, 100)


def orchestrate_brd_generation(
    idea: str,
    user_id: str,
    context_data: Optional[str] = None,
    context_data_2: Optional[str] = None,
    selected_model: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Orchestrates the full BRD generation pipeline with partial parallelism.

    Step 1 (sequential): Generate BRD from Channel 1. If Channel 2 provided, also generate BRD 2.
    Step 2 (parallel): Gap analysis + Data model + Architecture + [Conflict Detection if 2 channels] run concurrently.
    Step 3 (sequential): Compliance analysis runs on the data model output.
    Step 4 (sequential): Compute project health score.
    """
    start_time = time.time()
    models_used = set()

    print(f"[Orchestrator] Starting for user={user_id}, idea={idea[:60]}...")
    has_two_channels = bool(context_data_2)

    # ------- Step 1: BRD (sequential — all other agents depend on this) -------
    print("[Orchestrator] Step 1: Generating BRD (Channel 1) with gemini-2.5-pro...")
    t0 = time.time()
    brd, noise_stats = generate_brd(idea, context_data, selected_model)
    models_used.add(GEMINI_25_PRO_MODEL_ID)
    print(f"[Orchestrator] BRD done in {time.time() - t0:.1f}s")

    # If second channel provided, also generate its BRD
    brd_2 = None
    if has_two_channels:
        print("[Orchestrator] Step 1b: Generating BRD (Channel 2) with gemini-2.5-pro...")
        t0b = time.time()
        brd_2, _ = generate_brd(idea, context_data_2, selected_model)
        models_used.add(GEMINI_25_PRO_MODEL_ID)
        print(f"[Orchestrator] BRD 2 done in {time.time() - t0b:.1f}s")

    # ------- Step 2: Parallel agents -------
    print("[Orchestrator] Step 2: Running Gap, DataModel, Architecture (+ Conflicts) in parallel...")
    t1 = time.time()

    results = {}
    errors = {}

    def run_gap():
        return ("gaps", analyze_gaps(brd))

    def run_data_model():
        return ("data_model", generate_data_model(brd))

    def run_architecture():
        return ("architecture", generate_architecture(brd))

    def run_conflicts():
        return ("conflicts", analyze_conflicts(brd, brd_2))

    tasks = [run_gap, run_data_model, run_architecture]
    if has_two_channels:
        tasks.append(run_conflicts)

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(fn): fn.__name__ for fn in tasks}
        for future in as_completed(futures):
            try:
                key, value = future.result()
                results[key] = value
            except Exception as e:
                task_name = futures[future]
                print(f"[Orchestrator] ❌ {task_name} failed: {e}")
                errors[task_name] = str(e)

    models_used.add(GEMINI_PRO_MODEL_ID)
    models_used.add(GEMINI_25_PRO_MODEL_ID)
    print(f"[Orchestrator] Parallel step done in {time.time() - t1:.1f}s")

    # Fallback if data_model failed (compliance depends on it)
    data_model = results.get("data_model")
    if data_model is None:
        raise RuntimeError(f"Critical agent failed — data_model: {errors.get('data_model', 'unknown error')}")

    # ------- Step 3: Compliance (depends on data model) -------
    print("[Orchestrator] Step 3: Running Compliance analysis...")
    t2 = time.time()
    compliance = analyze_compliance(data_model)
    models_used.add(GEMINI_FLASH_MODEL_ID)
    print(f"[Orchestrator] Compliance done in {time.time() - t2:.1f}s")

    total_ms = int((time.time() - start_time) * 1000)
    print(f"[Orchestrator] ✅ Complete in {total_ms}ms")

    # ------- Step 4: Compute health score and confidence -------
    brd_dict = brd.model_dump()
    gaps_dict = results.get("gaps", {}).model_dump() if results.get("gaps") else {}
    compliance_dict = compliance.model_dump()
    health_score = _compute_health_score(brd_dict, gaps_dict, compliance_dict)

    # Confidence score (0.5–0.98): derived from health, context quality, and signal strength
    def _compute_confidence(
        health: int,
        noise_stats: dict,
        had_context: bool,
        context_len: int,
    ) -> float:
        base = 0.50
        health_factor = (health / 100.0) * 0.25  # up to +0.25
        relevant_pct = noise_stats.get("estimated_relevant_pct") or 0
        signal_factor = (relevant_pct / 100.0) * 0.15  # up to +0.15
        context_factor = 0.08 if had_context else 0.0
        size_factor = min(context_len / 50_000, 1.0) * 0.05 if had_context else 0.0  # more context = slight boost
        raw = base + health_factor + signal_factor + context_factor + size_factor
        return round(min(max(raw, 0.50), 0.98), 2)

    had_context = bool(context_data and len(context_data) > 100)
    context_len = len(context_data) if context_data else 0
    confidence_score = _compute_confidence(
        health_score,
        noise_stats or {},
        had_context,
        context_len,
    )

    metadata = {
        "confidence_score": confidence_score,
        "tokens_used": 0,
        "models_consulted": sorted(list(models_used)),
        "processing_time_ms": total_ms,
        "primary_model": GEMINI_25_PRO_MODEL_ID,
        "health_score": health_score,
        "noise_stats": noise_stats,
        "channel_count": 2 if has_two_channels else 1,
    }

    return {
        "brd": brd_dict,
        "gaps": gaps_dict,
        "data_model": data_model.model_dump(),
        "compliance": compliance_dict,
        "architecture": results.get("architecture", {}).model_dump() if results.get("architecture") else None,
        "conflicts": results.get("conflicts", {}).model_dump() if results.get("conflicts") else None,
        "metadata": metadata,
    }
