from pydantic import BaseModel, Field
from typing import List

class GapSchema(BaseModel):
    missing_requirements: List[str] = Field(description="List of potential requirements that were overlooked.")
    clarification_questions: List[str] = Field(description="Questions to ask stakeholders to clarify ambiguous points.")
    risk_flags: List[str] = Field(description="High-level risks identified from the current set of requirements.")
