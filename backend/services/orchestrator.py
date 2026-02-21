import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any

from .brd_agent import generate_brd
from .gap_agent import analyze_gaps
from .data_model_agent import generate_data_model
from .compliance_agent import analyze_compliance
from .architecture_agent import generate_architecture
from ..config import GEMINI_25_PRO_MODEL_ID, GEMINI_PRO_MODEL_ID, GEMINI_FLASH_MODEL_ID


def orchestrate_brd_generation(idea: str, user_id: str, context_data: str = None) -> Dict[str, Any]:
    """
    Orchestrates the full BRD generation pipeline with partial parallelism.

    Step 1 (sequential): Generate BRD — the source for all downstream agents.
    Step 2 (parallel): Gap analysis + Data model + Architecture all run concurrently.
    Step 3 (sequential): Compliance analysis runs on the data model output.
    """
    start_time = time.time()
    models_used = set()

    print(f"[Orchestrator] Starting for user={user_id}, idea={idea[:60]}...")

    # ------- Step 1: BRD (sequential — all other agents depend on this) -------
    print("[Orchestrator] Step 1: Generating BRD with gemini-2.5-pro...")
    t0 = time.time()
    brd = generate_brd(idea, context_data)
    models_used.add(GEMINI_25_PRO_MODEL_ID)
    print(f"[Orchestrator] BRD done in {time.time() - t0:.1f}s")

    # ------- Step 2: Parallel agents (all depend only on BRD) -------
    print("[Orchestrator] Step 2: Running Gap, DataModel, Architecture in parallel...")
    t1 = time.time()

    results = {}
    errors = {}

    def run_gap():
        return ("gaps", analyze_gaps(brd))

    def run_data_model():
        return ("data_model", generate_data_model(brd))

    def run_architecture():
        return ("architecture", generate_architecture(brd))

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(run_gap): "gaps",
            executor.submit(run_data_model): "data_model",
            executor.submit(run_architecture): "architecture",
        }
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

    # Build metadata
    metadata = {
        "confidence_score": 0.85,
        "tokens_used": 0,          # Vertex AI SDK v1 does not expose token counts simply
        "models_consulted": sorted(list(models_used)),
        "processing_time_ms": total_ms,
        "primary_model": GEMINI_25_PRO_MODEL_ID,
    }

    return {
        "brd": brd.model_dump(),
        "gaps": results.get("gaps", {}).model_dump() if results.get("gaps") else {},
        "data_model": data_model.model_dump(),
        "compliance": compliance.model_dump(),
        "architecture": results.get("architecture", {}).model_dump() if results.get("architecture") else None,
        "metadata": metadata,
    }
