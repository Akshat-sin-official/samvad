import os
from pathlib import Path

from dotenv import load_dotenv

_backend_dir = Path(__file__).resolve().parent
load_dotenv(_backend_dir / ".env")

# Firebase auth project — where your Firebase Auth / Firestore live
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", os.getenv("PROJECT_ID", "your-project-id"))

# GCP project where Cloud Run and Vertex AI are enabled
VERTEX_PROJECT_ID = os.getenv("VERTEX_PROJECT_ID", os.getenv("PROJECT_ID", "your-project-id"))

LOCATION = os.getenv("LOCATION", "us-central1")

# --- Model IDs ---
# NOTE: gemini-2.5-pro-preview-03-25 requires project allowlisting.
# Using gemini-2.0-flash-001 (GA, always available) for BRD and Architecture.
# Upgrade GEMINI_25_PRO_MODEL_ID once your project is allowlisted.
GEMINI_25_PRO_MODEL_ID = "gemini-2.0-flash-001"   # TODO: upgrade to gemini-2.5-pro-preview-03-25
GEMINI_PRO_MODEL_ID = "gemini-2.0-flash-001"
GEMINI_FLASH_MODEL_ID = "gemini-2.0-flash-lite-001"
