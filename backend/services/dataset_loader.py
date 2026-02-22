"""
Load and sample from the Enron emails CSV.
- Default: read from local dataset/emails/emails.csv (no Kaggle auth, works in Cloud Run).
- Optional: DATASET_EMAILS_CSV_PATH env to override path (hackathon deployment).
- Optional: if local file is missing and USE_KAGGLE=1, use kagglehub to download
  wcukierski/enron-email-dataset (same byte-limited logic).

Safe for very large files (e.g. 1.43 GB): only the first N bytes are read from disk.
"""
import csv
import io
import os
from pathlib import Path
from typing import Optional

from ..config import DATASET_EMAILS_CSV_PATH as _ENV_CSV_PATH

# Project root: backend/services -> backend -> project root
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent
_DEFAULT_CSV_PATH = _PROJECT_ROOT / "dataset" / "emails" / "emails.csv"

# Kaggle Enron dataset (optional, when USE_KAGGLE=1 and local file missing)
_KAGGLE_DATASET = "wcukierski/enron-email-dataset"
_KAGGLE_CSV_NAME = "emails.csv"

# Read only enough for 50 rows (avoids loading the full 1.43 GB file)
MAX_READ_BYTES = 2 * 1024 * 1024  # 2 MB — enough for 50 emails
MAX_SAMPLE_CHARS = 150_000
MAX_EMAILS = 50
MAX_EMAIL_CHARS = 8_000


def _load_via_kaggle() -> Optional[Path]:
    """If USE_KAGGLE=1 and kagglehub is installed, download dataset and return path to CSV."""
    if os.environ.get("USE_KAGGLE", "").strip().lower() not in ("1", "true", "yes"):
        return None
    try:
        import kagglehub
        root = kagglehub.dataset_download(_KAGGLE_DATASET)
        path = Path(root) / _KAGGLE_CSV_NAME
        if path.exists():
            print(f"[DatasetLoader] Using Kaggle dataset at {path}")
            return path
        # Some versions use different layout
        for p in Path(root).rglob("*.csv"):
            if "email" in p.name.lower():
                print(f"[DatasetLoader] Using Kaggle CSV at {p}")
                return p
    except Exception as e:
        print(f"[DatasetLoader] Kaggle fallback skipped: {e}")
    return None


def load_email_sample(
    csv_path: Optional[Path] = None,
    max_read_bytes: int = MAX_READ_BYTES,
    max_emails: int = MAX_EMAILS,
    max_total_chars: int = MAX_SAMPLE_CHARS,
) -> str:
    """
    Load a sample of emails from the CSV. Uses:
    1. csv_path if provided, else
    2. Local dataset/emails/emails.csv if it exists, else
    3. Kaggle wcukierski/enron-email-dataset if USE_KAGGLE=1 and kagglehub is available.

    For large files (e.g. 1.43 GB), only the first max_read_bytes (default 30 MB) are read.
    """
    path = csv_path or (_DEFAULT_CSV_PATH if not (_ENV_CSV_PATH and _ENV_CSV_PATH.strip()) else Path(_ENV_CSV_PATH.strip()))
    if not path.exists():
        cwd_path = Path.cwd() / "dataset" / "emails" / "emails.csv"
        if cwd_path.exists():
            path = cwd_path
    if not path or not path.exists():
        path = _load_via_kaggle()
    if not path or not path.exists():
        print(f"[DatasetLoader] File not found: {_DEFAULT_CSV_PATH} and {Path.cwd() / 'dataset/emails/emails.csv'} (set USE_KAGGLE=1 for Kaggle fallback)")
        return ""

    chunks: list[str] = []
    total_chars = 0
    count = 0

    try:
        with open(path, "rb") as f:
            raw = f.read(max_read_bytes)
        text = raw.decode("utf-8", errors="replace")
        reader = csv.DictReader(io.StringIO(text))
        if "message" not in (reader.fieldnames or []):
            print("[DatasetLoader] CSV has no 'message' column")
            return ""

        for row in reader:
            if count >= max_emails or total_chars >= max_total_chars:
                break
            msg = row.get("message") or ""
            if not msg.strip():
                continue
            if len(msg) > MAX_EMAIL_CHARS:
                msg = msg[:MAX_EMAIL_CHARS] + "\n[... truncated ...]"
            chunks.append(msg)
            total_chars += len(msg)
            count += 1

        if not chunks:
            print("[DatasetLoader] No rows read (file may be empty or format different)")
            return ""

        out = "\n\n---\n\n".join(chunks)
        print(f"[DatasetLoader] Read first {max_read_bytes / (1024*1024):.0f} MB, got {count} emails, {len(out)} chars from {path.name}")
        return out

    except Exception as e:
        print(f"[DatasetLoader] Error reading {path}: {e}")
        return ""
