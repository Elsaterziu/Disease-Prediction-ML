"""Unit tests for input_checks.py and match_check.py.

Run from the project root:
    .venv/Scripts/python.exe -m unittest discover -s ml-api/tests -v
"""
import json
import sys
import unittest
from pathlib import Path

ML_API = Path(__file__).resolve().parents[1]
ROOT = ML_API.parent
sys.path.insert(0, str(ML_API))

import symptom_lexicon as lex  # noqa: E402
from input_checks import analyze_input  # noqa: E402
from match_check import check_match  # noqa: E402

VOCABULARY = set(json.loads((ROOT / "frontend" / "src" / "translation" / "modelVocabulary.json").read_text()))


def analyze(text):
    return analyze_input(text, VOCABULARY)


class UnrelatedText(unittest.TestCase):
    def test_no_symptoms(self):
        for text in [
            "What time does the pharmacy close on Sundays?",
            "I need to book a flight to Prishtina next month.",
            "Can you recommend a good recipe for vegetable soup?",
        ]:
            with self.subTest(text=text):
                result = analyze(text)
                self.assertEqual(result["status"], "no_symptoms")
                self.assertEqual(result["textForModel"], "")

    def test_words_like_pharmacy_are_not_blocked(self):
        # No word list blocks a description: symptoms decide.
        result = analyze("I have a fever and a cough, the pharmacy gave me syrup.")
        self.assertEqual(result["status"], "valid")


class ValidSymptoms(unittest.TestCase):
    def test_plain_description_is_sent_unchanged(self):
        text = "I have fever, headache and cough."
        result = analyze(text)
        self.assertEqual(result["status"], "valid")
        self.assertEqual(result["textForModel"], text)

    def test_body_part_with_symptom_word(self):
        for text in ["My knee hurts when I climb stairs.", "There is pain in my chest.", "My eyes look yellow."]:
            with self.subTest(text=text):
                self.assertEqual(analyze(text)["status"], "valid")

    def test_unknown_words_do_not_block_identified_symptoms(self):
        result = analyze("I have a fever and my zorblat feels weird.")
        self.assertEqual(result["status"], "valid")

    def test_training_descriptions_are_accepted(self):
        import pandas as pd
        train = pd.read_csv(ROOT / "data" / "processed" / "train.csv")
        statuses = [analyze(t)["status"] for t in train["text"]]
        self.assertEqual(statuses.count("valid"), len(statuses))

    def test_frontend_phrases_are_never_rejected_as_unrelated(self):
        # Every phrase the "Select symptoms" catalog or the Albanian translator
        # can send must be analysed, or (general words only) lead to a request
        # for more detail - never to "no symptoms".
        phrases = json.loads((ML_API / "tests" / "frontend_phrases.json").read_text(encoding="utf-8"))
        general = {"general weakness", "weakness", "feel unwell", "body pain", "swelling", "pain", "stiffness"}
        for phrase in phrases["catalog"] + phrases["albanian"]:
            with self.subTest(phrase=phrase):
                result = analyze(f"I have {phrase}.")
                if phrase in general:
                    self.assertEqual(result["reasons"], ["insufficient"])
                elif phrase == "acne":  # a class name, not a symptom description
                    self.assertEqual(result["reasons"], ["conditionOnly"])
                else:
                    self.assertEqual(result["status"], "valid")


class Clarification(unittest.TestCase):
    def test_general_words_only(self):
        for text in ["I just don't feel well lately.", "My body hurts and I am worried.", "I feel sick today."]:
            with self.subTest(text=text):
                self.assertEqual(analyze(text)["reasons"], ["insufficient"])

    def test_condition_name_only(self):
        self.assertEqual(analyze("I think I have diabetes.")["reasons"], ["conditionOnly"])

    def test_uninterpretable_medical_term(self):
        result = analyze("I was told I have costochondritis.")
        self.assertEqual(result["reasons"], ["unknownTerms"])
        self.assertIn("costochondritis", result["uninterpretedTerms"])

    def test_uncertain_symptom(self):
        self.assertEqual(analyze("I'm not sure if I have a fever.")["reasons"], ["uncertain"])


class Negation(unittest.TestCase):
    def test_mentor_example(self):
        result = analyze("Very thirsty and urinating often, but no burning when I pee and no fever.")
        self.assertEqual(result["status"], "valid")
        self.assertEqual(result["textForModel"], "Very thirsty and urinating often.")
        self.assertEqual(result["negatedSymptoms"], ["burning when I pee", "fever"])
        self.assertNotIn("fever", result["textForModel"])

    def test_subject_and_auxiliary_removed_with_negation(self):
        result = analyze("Runny nose, sneezing and a sore throat, but I do not have a fever or any chest pain.")
        self.assertEqual(result["textForModel"], "Runny nose, sneezing and a sore throat.")
        self.assertEqual(result["negatedSymptoms"], ["fever", "chest pain"])

    def test_only_negated_symptoms(self):
        for text in ["No fever, no cough.", "I don't have any pain at all."]:
            with self.subTest(text=text):
                result = analyze(text)
                self.assertEqual(result["reasons"], ["onlyNegated"])
                self.assertEqual(result["textForModel"], "")

    def test_unclear_scope_asks_for_clarification(self):
        result = analyze("I have no fever and a cough.")
        self.assertEqual(result["reasons"], ["negationUnclear"])

    def test_negative_phrases_that_describe_present_symptoms(self):
        for text, symptom in [("I have no appetite and my stomach hurts.", "no appetite"),
                              ("I can't sleep and I feel exhausted.", "can't sleep"),
                              ("The headache doesn't go away.", "headache")]:
            with self.subTest(text=text):
                result = analyze(text)
                self.assertEqual(result["status"], "valid")
                self.assertIn(symptom, result["presentSymptoms"])
                self.assertEqual(result["negatedSymptoms"], [])

    def test_inability_is_not_negation(self):
        text = "I haven't been able to eat much due to nausea and vomiting."
        result = analyze(text)
        self.assertEqual(result["status"], "valid")
        self.assertEqual(result["textForModel"], text)


class MedicalTerms(unittest.TestCase):
    def test_mentor_example(self):
        result = analyze("Dysuria haematuria pyrexia nocturia")
        self.assertEqual(result["status"], "valid")
        self.assertEqual(result["textForModel"],
                         "pain during urination, blood in urine, fever, urination during the night")
        self.assertEqual([m["term"] for m in result["medicalTerms"]], ["Dysuria", "haematuria", "pyrexia", "nocturia"])

    def test_replacements_only_use_model_vocabulary(self):
        # A replacement the model cannot read would have no effect.
        for term, (plain, _, _) in lex.MEDICAL_TERMS.items():
            with self.subTest(term=term):
                missing = [w for w in plain.split() if len(w) > 1 and w not in VOCABULARY]
                # "hives" is documented as not in the vocabulary (needsReview).
                if term != "urticaria":
                    self.assertEqual(missing, [])

    def test_negated_medical_term(self):
        result = analyze("Cough and dyspnea, no pyrexia.")
        self.assertEqual(result["negatedSymptoms"], ["fever"])
        self.assertEqual(result["textForModel"], "Cough and shortness of breath.")


class Abstention(unittest.TestCase):
    def test_supported_symptom(self):
        match = check_match("urinary tract infection", ["urinary_symptoms"])
        self.assertTrue(match["reliable"])

    def test_no_supported_symptom(self):
        match = check_match("Psoriasis", ["urinary_symptoms"])
        self.assertFalse(match["reliable"])
        self.assertEqual(match["unsupportedSymptoms"], ["urinary_symptoms"])


if __name__ == "__main__":
    unittest.main()
