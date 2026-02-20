import json
import re
from typing import Type, TypeVar, Optional
from pydantic import BaseModel, ValidationError
from ..services.vertex_client import generate_content, init_vertex
from ..config import GEMINI_PRO_MODEL_ID

T = TypeVar("T", bound=BaseModel)


def extract_json(text: str) -> Optional[str]:
    """Extracts a JSON block from text output, handling various model response formats."""
    # 1. Explicit ```json ... ``` block
    match = re.search(r"```json\s*\n(.*?)\n```", text, re.DOTALL)
    if match:
        return match.group(1).strip()

    # 2. Any ``` ... ``` block
    match = re.search(r"```\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        candidate = match.group(1).strip()
        if candidate.startswith("{"):
            return candidate

    # 3. Fallback: outermost { ... }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]

    return None


def generate_structured_response(
    prompt: str,
    schema_model: Type[T],
    model_name: str = GEMINI_PRO_MODEL_ID,
    retry_count: int = 2,
) -> T:
    """
    Calls Vertex AI, extracts JSON from the response, validates it against
    the given Pydantic schema. Retries up to `retry_count` times with an
    error-correction prompt on failure.
    """
    # Ensure Vertex is initialized (idempotent)
    init_vertex()

    last_error: Optional[Exception] = None

    for attempt in range(retry_count + 1):
        try:
            raw = generate_content(model_name, prompt)
            json_str = extract_json(raw)

            if not json_str:
                raise ValueError(f"No JSON block found in model response. Raw (first 500 chars): {raw[:500]}")

            data = json.loads(json_str)
            return schema_model(**data)

        except (json.JSONDecodeError, ValidationError, ValueError) as e:
            last_error = e
            if attempt < retry_count:
                print(f"[ai_helper] Attempt {attempt + 1} failed: {e}. Retrying with error-correction prompt...")
                prompt = (
                    f"The previous response was invalid JSON or did not match the schema.\n"
                    f"Error: {str(e)}\n\n"
                    f"Original prompt:\n{prompt}\n\n"
                    f"Please respond with ONLY a valid JSON object matching the schema. No markdown, no explanations."
                )
            else:
                raise RuntimeError(
                    f"Failed to get a valid structured response after {retry_count + 1} attempts. "
                    f"Last error: {last_error}"
                ) from last_error
