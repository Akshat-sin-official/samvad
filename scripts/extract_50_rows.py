"""
Extract the first 50 rows from dataset/emails/emails.csv and write to emails_50.csv.
Reads only the first few MB so it works with the large source file.
"""
import csv
import io
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC = PROJECT_ROOT / "dataset" / "emails" / "emails.csv"
DST = PROJECT_ROOT / "dataset" / "emails" / "emails_50.csv"
MAX_BYTES = 5 * 1024 * 1024  # 5 MB — enough for 50 rows
NUM_ROWS = 50


def main():
    if not SRC.exists():
        print(f"Source not found: {SRC}")
        return 1
    print(f"Reading first {NUM_ROWS} rows from {SRC.name} (max {MAX_BYTES // (1024*1024)} MB)...")
    with open(SRC, "rb") as f:
        raw = f.read(MAX_BYTES)
    text = raw.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    fieldnames = reader.fieldnames
    if not fieldnames:
        print("No header in CSV")
        return 1
    rows = []
    for i, row in enumerate(reader):
        if i >= NUM_ROWS:
            break
        rows.append(row)
    print(f"Got {len(rows)} rows. Writing to {DST.name} ...")
    DST.parent.mkdir(parents=True, exist_ok=True)
    with open(DST, "w", newline="", encoding="utf-8") as out:
        w = csv.DictWriter(out, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)
    print(f"Done. {DST} ({len(rows)} rows).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
