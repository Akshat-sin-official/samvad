import sys
import os

# Mock google.cloud and vertexai to avoid import errors in this environment
from unittest.mock import MagicMock
sys.modules["google"] = MagicMock()
sys.modules["google.cloud"] = MagicMock()
sys.modules["google.cloud.aiplatform"] = MagicMock()
sys.modules["vertexai"] = MagicMock()
sys.modules["vertexai.generative_models"] = MagicMock()
sys.modules["vertexai.preview"] = MagicMock()
sys.modules["vertexai.preview.generative_models"] = MagicMock()

try:
    from backend.main import app
    print("Successfully imported backend.main.app")
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
