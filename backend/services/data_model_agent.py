from ..schemas.data_schema import DataModelSchema
from ..schemas.brd_schema import BRDSchema
from ..utils.ai_helper import generate_structured_response
from ..config import GEMINI_PRO_MODEL_ID

PROMPT_TEMPLATE = """
As a Senior Database Architect, design a normalized data model (Entities, Fields, Types) based on the following Business Requirements Document.
Ensure the entities are well-named and related appropriately (though relations are not explicitly modeled here, the fields should hint at them - e.g. Foreign Keys).
Identify sensitive data fields.

Business Requirements Document:
{brd_json}

Your task is to:
1. Identify all key BUSINESS ENTITIES.
2. For each entity, define relevant FIELDS, their TYPES, descriptions, and SENSITIVITY (Public, Internal, Confidential, Restricted).

Output must be strict JSON matching the following schema:
{schema}

Do not include markdown or explanations outside the JSON block.
"""

def generate_data_model(brd: BRDSchema) -> DataModelSchema:
    prompt = PROMPT_TEMPLATE.format(brd_json=brd.json(), schema=DataModelSchema.schema_json())
    return generate_structured_response(prompt, DataModelSchema, GEMINI_PRO_MODEL_ID)
