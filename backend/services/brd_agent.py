from ..services.vertex_client import generate_content
from ..schemas.brd_schema import BRDSchema
from ..utils.ai_helper import generate_structured_response
from ..config import GEMINI_PRO_MODEL_ID

PROMPT_TEMPLATE = """
You are an expert Business Analyst. Your task is to convert the following raw business idea into a structured Business Requirements Document (BRD).

Make reasonable assumptions where necessary to create a comprehensive document, but explicitly list them.
Identify potential risks associated with the implementation.
Define clear functional and non-functional requirements.

Raw Idea:
{idea}

Output must be strictly in JSON using the following schema:
{schema}

Format your response as a valid JSON object. Do not include markdown or explanations outside the JSON block.
"""

def generate_brd(idea: str) -> BRDSchema:
    prompt = PROMPT_TEMPLATE.format(idea=idea, schema=BRDSchema.schema_json())
    return generate_structured_response(prompt, BRDSchema, GEMINI_PRO_MODEL_ID)
