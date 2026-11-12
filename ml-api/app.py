from flask import Flask, request, jsonify
from pathlib import Path
import joblib
import numpy as np

from input_checks import analyze_input
from match_check import check_match

app = Flask(__name__)

# Load the trained SVM model
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "svm_tuned_validation.joblib"

model = joblib.load(MODEL_PATH)

# Pipeline components
tfidf = model.named_steps["tfidf"]
classifier = model.named_steps["classifier"]

# Same tokenisation the fitted TF-IDF vectorizer uses
analyzer = tfidf.build_analyzer()


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


def explain_prediction(text, predicted_class):
    # Convert text to TF-IDF features
    text_vector = tfidf.transform([text])

    # Find the predicted class index
    class_index = list(classifier.classes_).index(
        predicted_class
    )

    # LinearSVC feature contributions
    coefficients = classifier.coef_[class_index]

    contributions = (
        text_vector.toarray()[0] * coefficients
    )

    feature_names = tfidf.get_feature_names_out()

    # Only words present in the text
    nonzero_indices = np.flatnonzero(
        text_vector.toarray()[0]
    )

    word_scores = [
        {
            "word": str(feature_names[i]),
            "contribution": round(
                float(contributions[i]), 4
            )
        }
        for i in nonzero_indices
    ]

    # Highest positive contributions
    positive_words = sorted(
        [w for w in word_scores if w["contribution"] > 0],
        key=lambda x: x["contribution"],
        reverse=True
    )[:5]

    # Most negative contributions
    negative_words = sorted(
        [w for w in word_scores if w["contribution"] < 0],
        key=lambda x: x["contribution"]
    )[:5]

    return {
        "positiveWords": positive_words,
        "negativeWords": negative_words
    }


def vocabulary_coverage(text):
    # Share of the text's words that exist in the fitted
    # TF-IDF vocabulary. Words outside it are ignored by
    # the model. This is NOT a confidence score.
    tokens = analyzer(text)
    vocabulary = tfidf.vocabulary_

    recognized = [t for t in tokens if t in vocabulary]

    # Unique unrecognised words, in order of appearance
    unrecognized_terms = list(dict.fromkeys(
        t for t in tokens if t not in vocabulary
    ))

    total = len(tokens)

    return {
        "totalWords": total,
        "recognizedWords": len(recognized),
        "coverage": round(len(recognized) / total, 4) if total else 0.0,
        "unrecognizedTerms": unrecognized_terms[:20]
    }


@app.post("/predict")
def predict():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "A valid JSON object is required."
        }), 400

    symptoms = data.get("symptoms")

    if not isinstance(symptoms, str):
        return jsonify({
            "error": "Symptoms must be a text description."
        }), 400

    symptoms = symptoms.strip()

    # Input Validation
    if len(symptoms) < 15:
        return jsonify({
            "error": "Please provide a more detailed symptom description."
        }), 400

    if len(symptoms) > 5000:
        return jsonify({
            "error": "Symptom description is too long."
        }), 400

    if len(symptoms.split()) < 3:
        return jsonify({
            "error": "Please describe your symptoms in more detail."
        }), 400

    # Input checks (input_checks.py): medical terms rewritten in plain
    # words, negated symptoms removed, and no prediction at all when the
    # description has no identifiable symptoms or is unclear.
    analysis = analyze_input(symptoms, tfidf.vocabulary_)

    response = {
        "inputAnalysis": public_analysis(analysis),
        "disclaimer": DISCLAIMER,
    }

    if analysis["status"] != "valid":
        reason = analysis["reasons"][0] if analysis["reasons"] else ""
        response.update({
            "status": analysis["status"],
            "reasons": analysis["reasons"],
            "message": (
                NO_SYMPTOMS_MESSAGE
                if analysis["status"] == "no_symptoms"
                else CLARIFICATION_MESSAGES.get(reason, NO_SYMPTOMS_MESSAGE)
            ),
        })
        return jsonify(response)

    # Only the checked text reaches the unchanged TF-IDF + SVM pipeline.
    text = analysis["textForModel"]
    prediction = str(model.predict([text])[0])

    # Abstention (match_check.py): is any identified symptom typical
    # for the predicted class in the training data?
    match = check_match(prediction, analysis["concepts"])
    response["vocabularyCoverage"] = vocabulary_coverage(text)
    response["matchEvidence"] = {
        "supportedSymptoms": match["supportedSymptoms"],
        "unsupportedSymptoms": match["unsupportedSymptoms"],
    }

    if not match["reliable"]:
        response.update({
            "status": "no_reliable_match",
            "reasons": ["noSupportedSymptom"],
            "message": NO_MATCH_MESSAGE,
        })
        return jsonify(response)

    response.update({
        "status": "prediction",
        "predictedDisease": prediction,
        "explanation": explain_prediction(text, prediction),
    })
    return jsonify(response)


DISCLAIMER = "Educational prediction only. Not a medical diagnosis."

NO_SYMPTOMS_MESSAGE = (
    "Your description does not appear to contain symptoms. "
    "Please describe the symptoms you are experiencing."
)

NO_MATCH_MESSAGE = (
    "The system could not identify a reliable match among the 24 supported "
    "conditions. Please consult a healthcare professional for further evaluation."
)

CLARIFICATION_MESSAGES = {
    "negationUnclear": (
        "It is not clear which symptoms you have and which you do not. "
        "Please write them in separate sentences, e.g. \"I have a cough. I do not have a fever.\""
    ),
    "uncertain": (
        "Your description mentions symptoms you are not sure about. "
        "Please describe only the symptoms you are experiencing."
    ),
    "onlyNegated": (
        "You only mentioned symptoms you do not have. "
        "Please describe the symptoms you are experiencing."
    ),
    "insufficient": (
        "Your description is too general to compare with the supported conditions. "
        "Please describe specific symptoms, where you feel them and how they feel."
    ),
    "conditionOnly": (
        "Your description names a condition but no symptoms. "
        "Please describe the symptoms you are experiencing."
    ),
    "unknownTerms": (
        "Some medical terms in your description could not be interpreted safely. "
        "Please describe the symptoms in plain words."
    ),
}


def public_analysis(analysis):
    # What the user is shown about how the description was read.
    return {
        "textSentToModel": analysis["textForModel"],
        "medicalTerms": analysis["medicalTerms"],
        "presentSymptoms": analysis["presentSymptoms"],
        "negatedSymptoms": analysis["negatedSymptoms"],
        "excludedText": analysis["excludedText"],
        "uninterpretedTerms": analysis["uninterpretedTerms"],
    }


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )