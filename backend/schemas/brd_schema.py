from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class RequirementItem(BaseModel):
    req_id: str = Field(description="Unique requirement ID, e.g. FR-001, FR-002.")
    text: str = Field(description="The full text of the requirement.")
    source_quote: Optional[str] = Field(
        default=None,
        description="The exact sentence or phrase from the raw communication data that this requirement was extracted from. If generating from idea only, set to null."
    )


class StakeholderItem(BaseModel):
    name: str = Field(description="Person's name or team name (e.g. 'Sarah Johnson', 'Engineering Team', 'Client'). If only a role is known, use the role as name.")
    role: str = Field(description="Their role or title (e.g. 'Product Manager', 'CTO', 'End User', 'Sponsor').")
    influence: Literal["HIGH", "MEDIUM", "LOW"] = Field(description="Influence level over the project outcome.")
    interest: Literal["HIGH", "MEDIUM", "LOW"] = Field(description="Level of interest/involvement in the project.")
    hierarchy_level: int = Field(description="Position in the hierarchy: 1=Executive/Sponsor, 2=Manager/Lead, 3=Developer/Contributor, 4=End User.")
    source_channel: Optional[str] = Field(default=None, description="Which channel they were mentioned in: 'email', 'meeting', 'chat', or 'idea'. Set null if unknown.")


class BRDSchema(BaseModel):
    project_title: str = Field(description="A concise, catchy 4-5 word title for the project based on the idea.")
    problem_statement: str = Field(description="A clear, concise statement of the problem to be solved.")
    business_objectives: List[str] = Field(description="List of high-level business goals.")
    project_scope_in_scope: List[str] = Field(description="List of features and tasks that are included in the project.")
    project_scope_out_of_scope: List[str] = Field(description="List of features and tasks that are explicitly excluded.")
    user_roles: List[str] = Field(description="List of different types of users who will interact with the system.")
    stakeholders: List[StakeholderItem] = Field(description="List of named stakeholders extracted from the communication data. Include everyone mentioned by name, role, or authority. Always include at least 3-5 stakeholders.")
    functional_requirements: List[RequirementItem] = Field(description="List of specific behaviors or functions the system must support, each with a unique ID and optional source quote.")
    non_functional_requirements: List[str] = Field(description="List of system qualities (performance, security, etc.).")
    data_requirements: List[str] = Field(description="List of data handling, storage, and processing needs.")
    key_performance_indicators: List[str] = Field(description="Metrics to measure the success of the project.")
    assumptions: List[str] = Field(description="List of assumptions made during the requirements gathering phase.")
    risks: List[str] = Field(description="Potential risks that could impact the project success.")
