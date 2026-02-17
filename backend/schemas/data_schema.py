from pydantic import BaseModel, Field
from typing import List, Optional

class DataField(BaseModel):
    field_name: str
    type: str = Field(description="Data type (e.g., String, Integer, Date).")
    description: str = Field(description="Description of what this field stores.")
    sensitivity: str = Field(description="Sensitivity level (e.g., Public, Internal, Confidential, Restricted).", default="Internal")

class Entity(BaseModel):
    entity_name: str
    fields: List[DataField]

class DataModelSchema(BaseModel):
    entities: List[Entity] = Field(description="List of data entities in the system.")
