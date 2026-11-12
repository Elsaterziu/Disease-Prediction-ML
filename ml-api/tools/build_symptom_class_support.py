"""Builds ml-api/resources/symptom_class_support.json from the TRAINING split only.

For every class it stores the share of its training descriptions that mention each
symptom concept identified by input_checks.py, plus the class sizes. The table is
used by match_check.py to see whether the symptoms in a new description are typical
for the class the model predicts. It is a frequency table, not a model; the
validation and test splits are not read.

Run from the project root:  .venv/Scripts/python.exe ml-api/tools/build_symptom_class_support.py
"""
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "ml-api"))
from input_checks import analyze_input  # noqa: E402

train = pd.read_csv(ROOT / "data" / "processed" / "train.csv")
counts, sizes = defaultdict(Counter), Counter(train["label"])
for text, label in zip(train["text"], train["label"]):
    for concept in analyze_input(text)["concepts"]:
        counts[label][concept] += 1

table = {
    "source": "data/processed/train.csv (training split only)",
    "classSizes": dict(sizes),
    "conceptShare": {
        label: {c: round(n / sizes[label], 4) for c, n in sorted(counts[label].items())}
        for label in sorted(sizes)
    },
}
out = ROOT / "ml-api" / "resources" / "symptom_class_support.json"
out.parent.mkdir(exist_ok=True)
out.write_text(json.dumps(table, indent=1), encoding="utf-8")
print("written", out, "classes:", len(sizes))
