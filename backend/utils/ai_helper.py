import json
import re
from typing import Type, TypeVar, Optional, Dict, Any
from pydantic import BaseModel, ValidationError
from ..services.vertex_client import generate_content
from ..config import GEMINI_PRO_MODEL_ID, GEMINI_FLASH_MODEL_ID

T = TypeVar("T", bound=BaseModel)

def extract_json(text: str) -> Optional[str]:
    """Extracts JSON block from text."""
    match = re.search(r"```json\n(.*?)\n```", text, re.DOTALL)
    if match:
        return match.group(1)
    
    match = re.search(r"```(.*?)\n```", text, re.DOTALL) # looser match
    if match:
       return match.group(1)

    # fallback: try finding first { and last }
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
    return None

def generate_structured_response(
    prompt: str,
    schema_model: Type[T],
    model_name: str = GEMINI_PRO_MODEL_ID,
    retry_count: int = 1
) -> T:
    """
    Generates content from the AI model and validates it against a Pydantic schema.
    Retries once if validation fails.
    """
    
    # 1. First attempt
    try:
        raw_response = generate_content(model_name, prompt)
        json_str = extract_json(raw_response)
        
        if not json_str:
             if raw_response.strip().startswith("{") and raw_response.strip().endswith("}"):
                  json_str = raw_response.strip()
             else:
                  raise ValueError("No JSON found in response")

        data = json.loads(json_str)
        return schema_model(**data)
        
    except (json.JSONDecodeError, ValidationError, ValueError) as e:
        if retry_count > 0:
            print(f"Validation failed: {e}. Retrying...")
            # 2. Retry with error message
            correction_prompt = f"""
            The previous response was invalid JSON or did not match the schema.
            Error: {str(e)}
            
            Original Prompt:
            {prompt}
            
            Please correct the format and return ONLY the valid JSON matching the schema.
            """
            return generate_structured_response(
                correction_prompt,
                schema_model,
                model_name,
                retry_count - 1
            )
        else:
            raise e
