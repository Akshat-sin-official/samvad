import vertexai
import os
from vertexai.generative_models import GenerativeModel, Part, FinishReason
import vertexai.preview.generative_models as generative_models
from ..config import VERTEX_PROJECT_ID, LOCATION

def init_vertex():
    try:
        creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if creds_path and not os.path.exists(creds_path):
            os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)

        if not VERTEX_PROJECT_ID or VERTEX_PROJECT_ID == "your-project-id":
            raise ValueError(f"VERTEX_PROJECT_ID is not set. Current value: {VERTEX_PROJECT_ID}")

        vertexai.init(project=VERTEX_PROJECT_ID, location=LOCATION)
        print(f"✅ Vertex AI initialized: project={VERTEX_PROJECT_ID}, location={LOCATION}")
    except Exception as e:
        print(f"❌ Failed to initialize Vertex AI: {e}")
        raise

def get_model(model_name: str):
    return GenerativeModel(model_name)

def generate_content(model_name: str, prompt: str, generation_config=None, safety_settings=None):
    model = get_model(model_name)
    responses = model.generate_content(
        prompt,
        generation_config=generation_config,
        safety_settings=safety_settings,
        stream=False,
    )
    return responses.text
