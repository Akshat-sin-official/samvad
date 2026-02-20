from pydantic import BaseModel, Field
from typing import List


class Microservice(BaseModel):
    name: str = Field(description="Name of the microservice or component (e.g., 'AuthService', 'APIGateway').")
    description: str = Field(description="What this component is responsible for.")
    tech_stack: List[str] = Field(description="Technologies used (e.g., ['FastAPI', 'PostgreSQL']).")


class CloudResource(BaseModel):
    resource: str = Field(description="Name of the cloud resource (e.g., 'Cloud Run', 'Firestore').")
    type: str = Field(description="Category: Compute, Database, Storage, Networking, Security, etc.")
    justification: str = Field(description="Why this resource was selected for this system.")


class ArchitectureSchema(BaseModel):
    diagram_mermaid: str = Field(
        description=(
            "A valid Mermaid.js graph (flowchart LR or TD) string showing the high-level system architecture. "
            "Use concise node labels. Example: 'flowchart LR\\n  Client-->APIGateway\\n  APIGateway-->AuthService'. "
            "Escape all newlines as \\\\n in the JSON string."
        )
    )
    microservices: List[Microservice] = Field(
        description="List of key system components or microservices that make up the system."
    )
    cloud_infrastructure: List[CloudResource] = Field(
        description="List of recommended cloud infrastructure resources."
    )
