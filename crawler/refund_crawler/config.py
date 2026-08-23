import json, pathlib
ROOT = pathlib.Path(__file__).parent.parent
MERCHANTS_JSON = ROOT / "merchants.json"
OUTPUT_DIR = ROOT / "output"
MARKDOWN_DIR = OUTPUT_DIR / "markdown"
POLICIES_JSONL = OUTPUT_DIR / "policies.jsonl"
NEXT_JSON = pathlib.Path(__file__).parent.parent.parent / "src" / "lib" / "refund-policies.json"

def load_merchants():
    with open(MERCHANTS_JSON, encoding="utf-8") as f:
        return json.load(f)
