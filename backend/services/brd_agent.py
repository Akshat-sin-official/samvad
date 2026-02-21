from ..services.vertex_client import generate_content
from ..schemas.brd_schema import BRDSchema
from ..utils.ai_helper import generate_structured_response
from ..config import GEMINI_25_PRO_MODEL_ID

PROMPT_TEMPLATE = """
You are a world-class Senior Business Analyst and Product Strategist.

Convert the following raw product idea into a comprehensive, production-ready Business Requirements Document (BRD).
Be thorough, precise, and assume a sophisticated technical and business audience.
Make reasonable assumptions where necessary but list them explicitly.

Raw Idea:
{idea}

Your task:
1. Generate a catchy 4-5 word PROJECT TITLE based on the core idea.
2. Write a sharp, clear PROBLEM STATEMENT that frames the pain point and opportunity.
3. Define 4–6 concrete BUSINESS OBJECTIVES that are measurable.
4. Clearly delineate what is IN SCOPE and OUT OF SCOPE.
5. Identify all USER ROLES who will interact with the system.
6. List 8–12 specific FUNCTIONAL REQUIREMENTS.
7. List 5–8 NON-FUNCTIONAL REQUIREMENTS (performance, security, scalability, etc.).
8. Outline key DATA REQUIREMENTS (types of data, retention, processing needs).
9. Define 4–6 KPIs to measure project success.
10. List ASSUMPTIONS made.
11. Identify 4–6 key project RISKS.

Output must be strict JSON matching the following schema:
{schema}

Do not include markdown, commentary, or any text outside the JSON block.
"""


def generate_brd(idea: str) -> BRDSchema:
    prompt = PROMPT_TEMPLATE.format(idea=idea, schema=BRDSchema.model_json_schema())
    return generate_structured_response(prompt, BRDSchema, GEMINI_25_PRO_MODEL_ID)
