#!/usr/bin/env python3
"""
Step 1 — Inspect the Enron emails CSV before writing extraction logic.
Run from project root: python scripts/inspect_enron_csv.py
"""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = PROJECT_ROOT / "dataset" / "emails" / "emails.csv"


def main():
    if not CSV_PATH.exists():
        print(f"File not found: {CSV_PATH}")
        return 1

    try:
        import pandas as pd
    except ImportError:
        print("Install pandas: pip install pandas")
        return 1

    print("=== COLUMNS ===\n")
    df_sample = pd.read_csv(CSV_PATH, nrows=1000)
    print(list(df_sample.columns))
    print("\n=== DTYPES ===\n")
    print(df_sample.dtypes)
    print("\n=== HEAD (first 3 rows, message truncated to 300 chars) ===\n")
    for i, row in df_sample.head(3).iterrows():
        print(f"--- Row {i} ---")
        for c in df_sample.columns:
            val = row[c]
            if isinstance(val, str) and len(val) > 300:
                val = val[:300] + "..."
            print(f"  {c}: {repr(val)}")
        print()
    print("=== COLUMN SUMMARY (n=1000) ===\n")
    for c in df_sample.columns:
        lens = df_sample[c].astype(str).str.len()
        print(f"  {c}: median len={lens.median():.0f}, max len={lens.max()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
