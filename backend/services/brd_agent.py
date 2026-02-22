from ..schemas.brd_schema import BRDSchema
from ..utils.ai_helper import generate_structured_response
from ..config import GEMINI_25_PRO_MODEL_ID

# Gemini 2.5 Pro has a 2M token context window, but we cap the user upload
# at ~200K chars (~150K tokens) to leave room for the prompt and JSON schema.
MAX_CONTEXT_CHARS = 200_000

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
3. Define 4-6 concrete BUSINESS OBJECTIVES that are measurable based on the data.
4. Clearly delineate what is IN SCOPE and OUT OF SCOPE.
5. Identify all USER ROLES who will interact with the system or were mentioned as stakeholders.
6. Extract STAKEHOLDERS from the communication data with:
   - Name (actual person's name from To/From/CC fields, or role if name unavailable)
   - Role/Title inferred from context or signature
   - Influence level (HIGH/MEDIUM/LOW) based on their authority in the conversation
   - Interest level (HIGH/MEDIUM/LOW) based on how actively they participated
   - Hierarchy level: 1=Executive/Sponsor/CTO, 2=Manager/Lead/PM, 3=Developer/Contributor, 4=End User
   - Source channel where they appeared (email/meeting/chat/idea)
   Always extract at least 4-6 stakeholders. If no specific names are available, infer from roles mentioned.
7. List 8-12 specific FUNCTIONAL REQUIREMENTS extracted from the data. For each requirement:
   - Assign a unique ID like FR-001, FR-002, etc.
   - Write the requirement text clearly.
   - IMPORTANT: If raw communication data was provided, cite the EXACT sentence or phrase from the raw data that this requirement was extracted from in the source_quote field. If no data was provided, set source_quote to null.
8. List 5-8 NON-FUNCTIONAL REQUIREMENTS (performance, security, scalability, etc.) mentioned or heavily implied.
9. Outline key DATA REQUIREMENTS (types of data, retention, processing needs).
10. Define 4-6 KPIs to measure project success.
11. List ASSUMPTIONS made.
12. Identify 4-6 key project RISKS.

Output must be strict JSON matching the following schema:
{schema}

Do not include markdown, commentary, or any text outside the JSON block.
"""


def compute_noise_stats(context_data: str) -> dict:
    """Compute basic noise filtering statistics from raw context data."""
    if not context_data or context_data.startswith("(No additional"):
        return {"words_analyzed": 0, "relevant_word_count": 0, "estimated_relevant_pct": 0}

    words = context_data.split()
    word_count = len(words)

    # Keywords strongly associated with requirements content
    relevance_keywords = {
        "requirement", "must", "shall", "should", "need", "feature", "system",
        "deadline", "stakeholder", "decision", "api", "database", "user", "report",
        "integrate", "performance", "security", "authentication", "authorization",
        "deploy", "implement", "develop", "design", "architecture", "interface",
        "data", "process", "workflow", "milestone", "scope", "objective", "goal",
        "priority", "compliance", "audit", "access", "role", "permission"
    }

    # Count sentences that contain at least one relevance keyword
    sentences = [s.strip() for s in context_data.replace('\n', ' ').split('.') if s.strip()]
    relevant_sentences = [s for s in sentences if any(kw in s.lower() for kw in relevance_keywords)]
    relevant_pct = round((len(relevant_sentences) / max(len(sentences), 1)) * 100)

    return {
        "words_analyzed": word_count,
        "relevant_word_count": sum(len(s.split()) for s in relevant_sentences),
        "estimated_relevant_pct": relevant_pct,
        "total_sentences": len(sentences),
        "relevant_sentences": len(relevant_sentences),
    }


def generate_brd(idea: str, context_data: str = None, selected_model: str = None) -> tuple:
    """
    Generate a BRD from the given idea and optional raw context data.
    Returns a tuple of (BRDSchema, noise_stats_dict).
    """
    model_id = selected_model or GEMINI_25_PRO_MODEL_ID
    # If no explicitly uploaded data is passed, fallback to a placeholder
    if context_data:
        if len(context_data) > MAX_CONTEXT_CHARS:
            context_str = context_data[:MAX_CONTEXT_CHARS] + "\n\n[NOTE: Input was truncated to fit context window. Analysis is based on the first portion of the provided data.]"
            print(f"[BRD Agent] context_data truncated from {len(context_data)} to {MAX_CONTEXT_CHARS} chars")
        else:
            context_str = context_data
    else:
        context_str = "(No additional file data provided. Generate purely based on guiding directions.)"

    noise_stats = compute_noise_stats(context_data)

    prompt = PROMPT_TEMPLATE.format(idea=idea, context_data=context_str, schema=BRDSchema.model_json_schema())
    brd = generate_structured_response(prompt, BRDSchema, model_id)
    return brd, noise_stats
