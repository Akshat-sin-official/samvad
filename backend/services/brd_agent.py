from ..services.vertex_client import generate_content
from ..schemas.brd_schema import BRDSchema
from ..utils.ai_helper import generate_structured_response
from ..config import GEMINI_25_PRO_MODEL_ID

PROMPT_TEMPLATE = """
You are an elite Business Analyst and Product Strategist.
Your task is to analyze raw, noisy communication data (emails, meeting transcripts, slack messages) and extract the core architectural and business requirements to build a comprehensive Business Requirements Document (BRD).

You must aggressively FILTER OUT noise (lunch plans, casual talk, off-topic discussions) and synthesize only the actual project decisions, features, and stakeholder needs.

Guiding Directions from User:
{idea}

Raw Communication Data to Analyze:
{context_data}

Your task:
1. Generate a catchy 4-5 word PROJECT TITLE based on the core project being discussed.
2. Write a sharp, clear PROBLEM STATEMENT that frames the pain point and opportunity being solved by the team.
3. Define 4–6 concrete BUSINESS OBJECTIVES that are measurable based on the data.
4. Clearly delineate what is IN SCOPE and OUT OF SCOPE.
5. Identify all USER ROLES who will interact with the system or were mentioned as stakeholders.
6. List 8–12 specific FUNCTIONAL REQUIREMENTS extracted from the data.
7. List 5–8 NON-FUNCTIONAL REQUIREMENTS (performance, security, scalability, etc.) mentioned or heavily implied.
8. Outline key DATA REQUIREMENTS (types of data, retention, processing needs).
9. Define 4–6 KPIs to measure project success.
10. List ASSUMPTIONS made.
11. Identify 4–6 key project RISKS.

Output must be strict JSON matching the following schema:
{schema}

Do not include markdown, commentary, or any text outside the JSON block.
"""


def generate_brd(idea: str, context_data: str = None) -> BRDSchema:
    # If no explicitly uploaded data is passed, fallback to an empty string so the prompt doesn't break
    context_str = context_data if context_data else "(No additional file data provided. Generate purely based on guiding directions.)"
    prompt = PROMPT_TEMPLATE.format(idea=idea, context_data=context_str, schema=BRDSchema.model_json_schema())
    return generate_structured_response(prompt, BRDSchema, GEMINI_25_PRO_MODEL_ID)
