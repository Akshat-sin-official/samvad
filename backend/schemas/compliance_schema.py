from pydantic import BaseModel, Field
from typing import List

class ComplianceSchema(BaseModel):
    pii_fields: List[str] = Field(description="List of fields identified as Personally Identifiable Information.")
    financial_fields: List[str] = Field(description="List of fields identified as sensitive financial data.")
    recommended_encryption: List[str] = Field(description="Encryption recommendations for sensitive data (at rest/in transit).")
    retention_policy_suggestions: List[str] = Field(description="Suggested data retention periods.")
    access_control_recommendations: List[str] = Field(description="Recommended access controls for different user roles.")
