from ..schemas.gap_schema import GapSchema
from ..schemas.brd_schema import BRDSchema
from ..utils.ai_helper import generate_structured_response
from ..config import GEMINI_PRO_MODEL_ID

PROMPT_TEMPLATE = """
Review the following Business Requirements Document (BRD) and perform a comprehensive Gap & Risk Analysis.
Identify missing requirements, ambiguous points, and potential risks.

Business Requirements Document:
{brd_json}

Your task is to:
1. Identify MISSING functional or non-functional requirements vital for a complete system.
2. List CLARIFICATION QUESTIONS for stakeholders to resolve ambiguity.
3. Flag significant RISKS (technical, business, or operational).

Output must be strict JSON matching the following schema:
{schema}

Do not include markdown or explanations outside the JSON block.
"""


def analyze_gaps(brd: BRDSchema) -> GapSchema:
    prompt = PROMPT_TEMPLATE.format(brd_json=brd.model_dump_json(), schema=GapSchema.model_json_schema())
    return generate_structured_response(prompt, GapSchema, GEMINI_PRO_MODEL_ID)
