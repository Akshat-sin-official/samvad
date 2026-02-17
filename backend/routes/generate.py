from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from ..services.orchestrator import orchestrate_brd_generation
from ..schemas.brd_schema import BRDSchema
from ..schemas.gap_schema import GapSchema
from ..schemas.data_schema import DataModelSchema
from ..schemas.compliance_schema import ComplianceSchema

router = APIRouter()

class GenerateRequest(BaseModel):
    idea: str

class GenerateResponse(BaseModel):
    brd: BRDSchema
    gaps: GapSchema
    data_model: DataModelSchema
    compliance: ComplianceSchema

@router.post("/generate", response_model=GenerateResponse)
def generate_brd_endpoint(request: GenerateRequest):
    try:
        result = orchestrate_brd_generation(request.idea)
        return GenerateResponse(**result)
    except Exception as e:
        print(f"Error generating content: {e}")
        # Return structured error
        raise HTTPException(status_code=500, detail=str(e))
