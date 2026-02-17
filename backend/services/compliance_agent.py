from ..schemas.compliance_schema import ComplianceSchema
from ..schemas.data_schema import DataModelSchema
from ..utils.ai_helper import generate_structured_response
from ..config import GEMINI_FLASH_MODEL_ID

PROMPT_TEMPLATE = """
As a Global Security & Compliance Officer (GDPR, CCPA, HIPAA expert), review the following normalized data model and flag compliance risks.

Data Model:
{data_model_json}

Your task is to:
1. Identify all Personally Identifiable Information (PII).
2. Identify all sensitive FINANCIAL data.
3. Recommend specific ENCRYPTION methods (e.g., AES-256 at rest, TLS 1.3 in transit) for these sensitive fields.
4. Suggest RETENTION POLICIES (e.g., 7 years for financial records, 30 days for logs).
5. Outline ACCESS CONTROL best practices for this data (e.g., RBAC, MFA).

Output must be strict JSON matching the following schema:
{schema}

Do not include markdown or explanations outside the JSON block.
"""

def analyze_compliance(data_model: DataModelSchema) -> ComplianceSchema:
    prompt = PROMPT_TEMPLATE.format(data_model_json=data_model.json(), schema=ComplianceSchema.schema_json())
    return generate_structured_response(prompt, ComplianceSchema, GEMINI_FLASH_MODEL_ID)
