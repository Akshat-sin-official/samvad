from pydantic import BaseModel, Field
from typing import List, Literal


class ConflictItem(BaseModel):
    description: str = Field(description="Clear description of what the conflict is about.")
    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"] = Field(
        description="Severity rating: CRITICAL (blocks delivery), HIGH (significant rework), MEDIUM (minor rework), LOW (clarification needed)."
    )
    conflict_type: str = Field(description="Category of conflict: deadline, scope, technology, stakeholder, budget, or other.")
    source_1_quote: str = Field(description="The exact quote from the first communication channel (Channel 1) that shows one side of the conflict.")
    source_2_quote: str = Field(description="The exact quote from the second communication channel (Channel 2) that contradicts the first.")
    recommendation: str = Field(description="Suggested action to resolve this conflict.")


class ConflictSchema(BaseModel):
    conflicts: List[ConflictItem] = Field(description="List of all detected conflicts between the two communication channels.")
    critical_count: int = Field(description="Number of conflicts rated CRITICAL.")
    summary: str = Field(description="One-paragraph executive summary of the conflict landscape between the two channels.")
