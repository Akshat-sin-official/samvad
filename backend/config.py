import os
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("PROJECT_ID", "your-project-id")
LOCATION = os.getenv("LOCATION", "us-central1")
GEMINI_PRO_MODEL_ID = "gemini-1.5-pro-001"
GEMINI_FLASH_MODEL_ID = "gemini-1.5-flash-001"
