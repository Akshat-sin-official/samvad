from ..schemas.conflict_schema import ConflictSchema
from ..schemas.brd_schema import BRDSchema
from ..utils.ai_helper import generate_structured_response
from ..config import GEMINI_FLASH_MODEL_ID

PROMPT_TEMPLATE = """
You are an expert Cross-Channel Requirements Conflict Analyst.
You have been given two Business Requirements Documents (BRDs) extracted from two different communication channels — for example, an email thread and a meeting transcript — about the same project.

Your task is to identify ALL contradictions and conflicts between these two documents. Be thorough and methodical.

Channel 1 BRD (e.g., Email Thread):
{brd_1_json}

Channel 2 BRD (e.g., Meeting Transcript):
{brd_2_json}

Look for conflicts in:
1. DEADLINES — Does Channel 1 mention different dates than Channel 2?
2. SCOPE — Does one channel include something the other explicitly excludes?
3. STAKEHOLDERS — Are different people identified as owners or approvers?
4. TECHNOLOGY CHOICES — Are different tech stacks, databases, or tools mentioned?
5. BUDGET/RESOURCES — Any contradictory resource or cost assumptions?
6. REQUIREMENTS — Are any requirements in one channel directly contradicted by the other?
7. PRIORITIES — Is the same feature high-priority in one channel but low-priority in another?

For each conflict, rate severity:
- CRITICAL: Different deadlines, contradictory must-have requirements, or conflicting stakeholder authority
- HIGH: Scope disagreements affecting significant effort
- MEDIUM: Technology or approach differences requiring team decision
- LOW: Ambiguity that needs clarification but won't block delivery

Output must be strict JSON matching the following schema:
{schema}

Do not include markdown, commentary, or any text outside the JSON block.
"""


def analyze_conflicts(brd_1: BRDSchema, brd_2: BRDSchema) -> ConflictSchema:
    prompt = PROMPT_TEMPLATE.format(
        brd_1_json=brd_1.model_dump_json(),
        brd_2_json=brd_2.model_dump_json(),
        schema=ConflictSchema.model_json_schema()
    )
    return generate_structured_response(prompt, ConflictSchema, GEMINI_FLASH_MODEL_ID)
