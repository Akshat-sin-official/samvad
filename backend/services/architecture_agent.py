from ..services.vertex_client import generate_content
from ..schemas.architecture_schema import ArchitectureSchema
from ..schemas.brd_schema import BRDSchema
from ..utils.ai_helper import generate_structured_response
from ..config import GEMINI_25_PRO_MODEL_ID

PROMPT_TEMPLATE = """
You are a Principal Cloud Architect with deep expertise in distributed systems, microservices, and cloud-native design.

Given the following Business Requirements Document, design a production-grade system architecture.

Business Requirements Document:
{brd_json}

Your task is to:
1. Design the high-level SYSTEM COMPONENTS (microservices, API gateways, databases, message queues, etc.).
   Each component should have a clear responsibility and recommended tech stack.
2. Recommend CLOUD INFRASTRUCTURE resources (compute, databases, storage, networking, security).
   Justify each choice based on the requirements.
3. Create a MERMAID.JS flowchart (flowchart LR) showing how components communicate.
   Keep node labels short. Use --> for connections. Escape newlines as \\n in the JSON string.
   Example format: "flowchart LR\\n  Client-->|HTTPS|APIGateway\\n  APIGateway-->AuthService"

Output must be strict JSON matching the following schema:
{schema}

Do not include markdown or explanations outside the JSON block.
"""


def generate_architecture(brd: BRDSchema) -> ArchitectureSchema:
    prompt = PROMPT_TEMPLATE.format(brd_json=brd.model_dump_json(), schema=ArchitectureSchema.model_json_schema())
    return generate_structured_response(prompt, ArchitectureSchema, GEMINI_25_PRO_MODEL_ID)
