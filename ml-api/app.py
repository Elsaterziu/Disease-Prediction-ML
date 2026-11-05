from flask import Flask, request, jsonify
from pathlib import Path
import joblib
import numpy as np

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

    # Predict disease
    prediction = str(model.predict([symptoms])[0])

    # Explain the prediction
    explanation = explain_prediction(
        symptoms, prediction
    )

    return jsonify({
        "predictedDisease": prediction,
        "explanation": explanation,
        "vocabularyCoverage": vocabulary_coverage(symptoms),
        "disclaimer": (
            "Educational prediction only. "
            "Not a medical diagnosis."
        )
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )