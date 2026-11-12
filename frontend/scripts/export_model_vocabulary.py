"""Export the fitted TF-IDF vocabulary for the frontend translator.

Read-only: loads the trained pipeline and writes the sorted list of words the
vectorizer knows. Nothing in the model or vectorizer is changed.

Run from the project root:
    python frontend/scripts/export_model_vocabulary.py
"""

import json
from pathlib import Path

import joblib

ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT / "models" / "svm_tuned_validation.joblib"
OUT_PATH = ROOT / "frontend" / "src" / "translation" / "modelVocabulary.json"

model = joblib.load(MODEL_PATH)
vocabulary = sorted(model.named_steps["tfidf"].vocabulary_)

OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
OUT_PATH.write_text(json.dumps(vocabulary, indent=0), encoding="utf-8")
print(f"Wrote {len(vocabulary)} words to {OUT_PATH}")
