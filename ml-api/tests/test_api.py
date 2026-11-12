"""API tests for POST /predict (Flask test client, no server needed).

Run from the project root:
    .venv/Scripts/python.exe -m unittest discover -s ml-api/tests -v
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import app  # noqa: E402


class PredictEndpoint(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def post(self, symptoms):
        return self.client.post("/predict", json={"symptoms": symptoms})

    def test_existing_validation_is_kept(self):
        self.assertEqual(self.post("short").status_code, 400)
        self.assertEqual(self.client.post("/predict", data="x").status_code, 400)
        self.assertEqual(self.post("x" * 5001).status_code, 400)

    def test_unrelated_text_gets_no_disease(self):
        response = self.post("What time does the pharmacy close on Sundays?")
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["status"], "no_symptoms")
        self.assertNotIn("predictedDisease", data)
        self.assertTrue(data["message"].startswith("Your description does not appear to contain symptoms."))
        self.assertIn("disclaimer", data)

    def test_valid_description_keeps_prediction_and_explanation(self):
        data = self.post("I have a high fever, a pounding headache, pain behind my eyes and aching joints.").get_json()
        self.assertEqual(data["status"], "prediction")
        self.assertIn("predictedDisease", data)
        self.assertIn("positiveWords", data["explanation"])
        self.assertIn("coverage", data["vocabularyCoverage"])
        self.assertEqual(data["disclaimer"], "Educational prediction only. Not a medical diagnosis.")

    def test_negated_symptoms_are_not_sent_to_the_model(self):
        data = self.post("Very thirsty and urinating often, but no burning when I pee and no fever.").get_json()
        self.assertEqual(data["inputAnalysis"]["textSentToModel"], "Very thirsty and urinating often.")
        self.assertEqual(data["inputAnalysis"]["negatedSymptoms"], ["burning when I pee", "fever"])
        words = [w["word"] for w in data.get("explanation", {}).get("positiveWords", [])]
        self.assertNotIn("fever", words)

    def test_clarification_has_no_disease(self):
        data = self.post("No cough, no fever, no headache.").get_json()
        self.assertEqual(data["status"], "needs_clarification")
        self.assertEqual(data["reasons"], ["onlyNegated"])
        self.assertNotIn("predictedDisease", data)

    def test_no_reliable_match_has_no_disease(self):
        # Statuses are mutually exclusive: a withheld result never carries a disease.
        data = self.post("My skin is red, hot and painful after a day at the beach without sunscreen.").get_json()
        if data["status"] == "no_reliable_match":
            self.assertNotIn("predictedDisease", data)
            self.assertTrue(data["message"].startswith("The system could not identify a reliable match"))


if __name__ == "__main__":
    unittest.main()
