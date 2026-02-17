from typing import Dict, Any
from .brd_agent import generate_brd
from .gap_agent import analyze_gaps
from .data_model_agent import generate_data_model
from .compliance_agent import analyze_compliance

def orchestrate_brd_generation(idea: str) -> Dict[str, Any]:
    print(f"Starting orchestration for idea: {idea[:50]}...")

    # Step 1: Generate BRD
    print("Step 1: Generating BRD...")
    brd = generate_brd(idea)

    # Step 2: Gap Analysis (depends on BRD)
    print("Step 2: Performing Gap Analysis...")
    gaps = analyze_gaps(brd)

    # Step 3: Data Model Generation (depends on BRD)
    print("Step 3: Generating Data Model...")
    data_model = generate_data_model(brd)

    # Step 4: Compliance checks (depends on Data Model)
    print("Step 4: Checking Compliance...")
    compliance = analyze_compliance(data_model)

    print("Orchestration complete.")
    
    return {
        "brd": brd.dict(),
        "gaps": gaps.dict(),
        "data_model": data_model.dict(),
        "compliance": compliance.dict()
    }
