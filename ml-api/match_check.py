"""Decides whether a prediction is shown or the system abstains.

The model always picks one of its 24 classes, even for symptoms of a condition it
was never trained on. After it predicts, this check asks a simple, explainable
question: is at least one of the symptoms identified in the description typical
for the predicted class? "Typical" means it appears in at least SUPPORT_THRESHOLD
of that class's TRAINING descriptions (resources/symptom_class_support.json).
If none is, the prediction is not shown.

The threshold was fixed on development data only (validation split and
unseen_v1; see docs/overfitting/system_testing_after_improvements/), by a rule
set before looking at the results: the largest value in {0.05, 0.10, 0.15, 0.20}
that withholds at most 5% of validation descriptions and at most 10% of new
in-scope descriptions. It is not a probability and not a guarantee that a shown
prediction is correct; many out-of-scope conditions share symptoms with the
supported classes and still receive a prediction.

SVM decision scores and the top-two margin are NOT used for the decision: on the
development data the margin separated in-scope from out-of-scope descriptions
poorly (AUROC 0.59), compared with 0.79 for symptom support.
"""

import json
from pathlib import Path

SUPPORT_THRESHOLD = 0.10
_TABLE = json.loads(
    (Path(__file__).resolve().parent / "resources" / "symptom_class_support.json").read_text(encoding="utf-8")
)
CONCEPT_SHARE = _TABLE["conceptShare"]


def check_match(predicted_class, concepts):
    shares = {c: CONCEPT_SHARE.get(predicted_class, {}).get(c, 0.0) for c in concepts}
    supported = sorted(c for c, s in shares.items() if s >= SUPPORT_THRESHOLD)
    return {
        "reliable": bool(supported),
        "supportedSymptoms": supported,
        "unsupportedSymptoms": sorted(c for c in concepts if c not in supported),
        "threshold": SUPPORT_THRESHOLD,
    }
