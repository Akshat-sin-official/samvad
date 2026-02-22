#!/usr/bin/env python3
"""
Test loading and simulating data from dataset/emails/emails.csv.

Run from project root:
  python scripts/test_dataset_load.py

Or from backend (with PYTHONPATH):
  cd backend && python -c "from services.dataset_loader import load_email_sample; print(len(load_email_sample()), 'chars')"
"""
import sys
from pathlib import Path

# Run from project root so backend is importable
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.services.dataset_loader import load_email_sample, _DEFAULT_CSV_PATH

def main():
    print("Dataset path:", _DEFAULT_CSV_PATH)
    print("Exists:", _DEFAULT_CSV_PATH.exists())
    print()

    sample = load_email_sample()
    if not sample:
        print("No data loaded (file missing or empty).")
        return 1

    print("Loaded:", len(sample), "characters")
    print("First 400 chars:")
    print("-" * 40)
    print(sample[:400])
    print("-" * 40)
    return 0

if __name__ == "__main__":
    sys.exit(main())
