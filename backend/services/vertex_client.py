import vertexai
from vertexai.generative_models import GenerativeModel, Part, FinishReason
import vertexai.preview.generative_models as generative_models
from ..config import PROJECT_ID, LOCATION

def init_vertex():
    vertexai.init(project=PROJECT_ID, location=LOCATION)

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
