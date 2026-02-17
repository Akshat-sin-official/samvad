from pydantic import BaseModel, Field
from typing import List, Optional

class BRDSchema(BaseModel):
    problem_statement: str = Field(description="A clear, concise statement of the problem to be solved.")
    business_objectives: List[str] = Field(description="List of high-level business goals.")
    project_scope_in_scope: List[str] = Field(description="List of features and tasks that are included in the project.")
    project_scope_out_of_scope: List[str] = Field(description="List of features and tasks that are explicitly excluded.")
    user_roles: List[str] = Field(description="List of different types of users who will interact with the system.")
    functional_requirements: List[str] = Field(description="List of specific behaviors or functions the system must support.")
    non_functional_requirements: List[str] = Field(description="List of system qualities (performance, security, etc.).")
    data_requirements: List[str] = Field(description="List of data handling, storage, and processing needs.")
    key_performance_indicators: List[str] = Field(description="Metrics to measure the success of the project.")
    assumptions: List[str] = Field(description="List of assumptions made during the requirements gathering phase.")
    risks: List[str] = Field(description="Potential risks that could impact the project success.")
