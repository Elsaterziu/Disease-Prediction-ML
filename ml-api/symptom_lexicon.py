"""Controlled English vocabulary used by input_checks.py.

This is NOT a clinical instrument and it is not used by the model. It only decides
whether a description contains identifiable symptoms, which symptoms are negated,
and how a few medical terms are rewritten in plain words before TF-IDF.

Built from the symptom catalog of the "Select symptoms" assistant
(frontend/src/data/symptomCatalog.js), the English output of the Albanian
translation dictionary, and common English symptom wording. Every entry still
needs review by a medical professional before use beyond this thesis.
"""

# ---------------------------------------------------------------------------
# Specific symptoms: one match is enough for a description to be analysed.
# Phrases are matched as whole consecutive words (after lower-casing).
# ---------------------------------------------------------------------------
SPECIFIC_PHRASES = {
    "fever": ["fever", "fevers", "feverish", "high temperature", "a temperature", "running a temperature"],
    "chills": ["chills", "chill", "shivering", "shivers", "shiver", "shaking chills", "rigors"],
    "sweating": ["sweating", "sweats", "night sweats", "perspiring", "perspiration", "heavy sweating"],
    "fatigue": ["fatigue", "fatigued", "tired", "tiredness", "exhausted", "exhaustion", "lethargic",
                "lethargy", "worn out", "lack of energy", "low energy", "no energy"],
    "thirst": ["thirst", "thirsty", "excessive thirst"],
    "headache": ["headache", "headaches", "head ache", "pain behind my eyes", "pain behind the eyes"],
    "dizziness": ["dizzy", "dizziness", "lightheaded", "light headed", "vertigo", "faint", "fainting",
                  "fainted", "passed out", "unsteady", "off balance", "trouble keeping my balance",
                  "lose my balance", "losing my balance"],
    "concentration": ["difficulty concentrating", "trouble concentrating", "can't concentrate",
                      "cannot concentrate", "brain fog", "confusion", "confused"],
    "cough": ["cough", "coughs", "coughing", "coughed"],
    "breathlessness": ["shortness of breath", "short of breath", "breathless", "breathlessness",
                       "out of breath", "can't breathe", "cannot breathe", "difficulty breathing",
                       "trouble breathing", "hard to breathe", "catch my breath", "fast breathing",
                       "rapid breathing"],
    "nasal_symptoms": ["runny nose", "stuffy nose", "blocked nose", "nasal congestion", "congestion",
                       "congested", "sniffles", "sniffling", "nose is running", "nose is runny"],
    "sneezing": ["sneeze", "sneezes", "sneezing", "sneezed"],
    "sore_throat": ["sore throat", "scratchy throat", "itchy throat", "throat pain", "hoarse", "hoarseness",
                    "lost my voice"],
    "phlegm": ["phlegm", "mucus", "sputum", "snot"],
    "wheezing": ["wheeze", "wheezes", "wheezing", "wheezy", "whistling"],
    "nausea": ["nausea", "nauseous", "nauseated", "queasy", "sick to my stomach"],
    "vomiting": ["vomit", "vomits", "vomiting", "vomited", "throwing up", "throw up", "threw up", "puking", "puke"],
    "abdominal_pain": ["stomach ache", "stomachache", "bellyache", "abdominal pain", "stomach pain",
                       "stomach cramps", "belly pain"],
    "diarrhea": ["diarrhea", "diarrhoea", "loose stool", "loose stools", "watery stool", "watery stools"],
    "constipation": ["constipation", "constipated"],
    "reflux": ["acid reflux", "reflux", "heartburn", "regurgitation", "sour taste", "acid taste",
               "burping", "belching", "indigestion", "acidity", "stomach acid"],
    "bloating": ["bloating", "bloated"],
    "appetite_loss": ["loss of appetite", "lost my appetite", "poor appetite", "no appetite", "not hungry",
                      "lack of appetite", "decreased appetite"],
    "hunger": ["excessive hunger", "always hungry", "constantly hungry", "hungry all the time", "hunger",
               "feel hungry", "increased appetite"],
    "weight_loss": ["weight loss", "lost weight", "losing weight", "lose weight"],
    "weight_gain": ["weight gain", "gained weight", "gaining weight"],
    "urinary_symptoms": ["frequent urination", "painful urination", "burning urination", "urinary frequency",
                         "pain during urination", "urination during the night", "blood in urine",
                         "blood in my urine", "dark urine", "cloudy urine"],
    "rash": ["rash", "rashes", "hives", "breakout", "broke out", "redness"],
    "itching": ["itch", "itches", "itching", "itchy", "itchiness"],
    "blisters": ["blister", "blisters", "fluid filled", "fluid-filled"],
    "scaly_skin": ["scaly", "scales", "flaky", "flaking", "peeling", "dry skin", "cracked skin", "silvery"],
    "pimples": ["pimple", "pimples", "blackhead", "blackheads", "zits", "breakouts"],
    "sores": ["sores", "pus", "oozing", "crusts", "crust", "crusty", "crusted", "scabs"],
    "bruising": ["bruise", "bruises", "bruising", "bruised"],
    "bleeding": ["bleeding", "bleed", "bleeds", "bloody"],
    "cramps": ["cramp", "cramps", "cramping"],
    "numbness": ["numb", "numbness", "tingling", "pins and needles"],
    "palpitations": ["palpitations", "heart racing", "racing heart", "heart pounding", "pounding heart"],
    "trouble_sleeping": ["insomnia", "can't sleep", "cannot sleep", "trouble sleeping", "unable to sleep"],
    "muscle_pain": ["body aches", "muscle aches", "aching muscles", "muscle pain", "muscle weakness"],
    "joint_pain": ["joint pain", "joint pains", "swollen joints", "stiff joints", "stiffness when i move"],
    "back_pain": ["back pain", "backache"],
    "neck_pain": ["neck pain", "stiff neck"],
    "chest_pain": ["chest pain", "chest tightness", "tight chest"],
    "swollen_veins": ["swollen veins", "bulging veins", "spider veins", "varicose"],
    "stool_changes": ["black stools", "black stool", "blood in stool", "blood in my stool", "bloody stool"],
    "frequent_toilet": ["go to the bathroom often", "going to the bathroom often", "need to go to the bathroom"],
    "skin_lesions": ["spots", "patches", "bumps", "lumps", "lesions", "plaques", "blotches", "rashy", "bumpy",
                     "scratching", "dents", "pitted"],
    "vision_changes": ["blurred vision", "blurry vision", "double vision", "vision is blurry", "vision blurry",
                       "visual disturbances", "visual disruptions", "lost my vision", "distorted vision"],
    "mood_changes": ["depressed", "irritable", "irritability", "agitated", "agitation", "mood swings",
                     "moods swing", "moods change"],
    "menstrual_changes": ["vaginal discharge", "irregular periods", "menstrual cycle", "monthly cycle"],
    "cognitive": ["trouble focusing", "difficulty focusing", "difficulties focusing", "trouble remembering",
                  "forgetful", "foggy", "drowsy", "drowsiness"],
    "taste_changes": ["bitter taste", "aftertaste", "metallic taste"],
    "cravings": ["cravings", "craving"],
    "temperature_changes": ["body temperature", "body temperatures", "body's temperature"],
}

# ---------------------------------------------------------------------------
# Body parts and the words that, together with one, describe a symptom:
# "my knee hurts", "pain in my chest", "my eyes are yellow".
# Both words must be in the same clause, at most WINDOW words apart.
# ---------------------------------------------------------------------------
WINDOW = 5

BODY_PARTS = {
    "head": "head", "forehead": "head", "temple": "head", "temples": "head",
    "face": "face", "eye": "eyes", "eyes": "eyes", "eyelid": "eyes", "eyelids": "eyes",
    "ear": "ears", "ears": "ears", "nose": "nose", "nostrils": "nose", "mouth": "mouth", "lips": "mouth",
    "tongue": "mouth", "tooth": "teeth", "teeth": "teeth", "gum": "teeth", "gums": "teeth", "jaw": "jaw",
    "throat": "throat", "neck": "neck", "shoulder": "shoulders", "shoulders": "shoulders",
    "arm": "arms", "arms": "arms", "elbow": "joints", "elbows": "joints", "wrist": "joints", "wrists": "joints",
    "hand": "hands", "hands": "hands", "finger": "joints", "fingers": "joints",
    "chest": "chest", "breastbone": "chest", "rib": "chest", "ribs": "chest", "heart": "chest", "lungs": "chest",
    "back": "back", "spine": "back", "stomach": "abdomen", "belly": "abdomen", "tummy": "abdomen",
    "abdomen": "abdomen", "gut": "abdomen", "side": "abdomen", "waist": "back", "hip": "joints", "hips": "joints",
    "groin": "groin", "pelvis": "groin", "bladder": "urinary", "kidney": "urinary", "kidneys": "urinary",
    "bottom": "anus", "anus": "anus", "rectum": "anus", "buttocks": "anus",
    "leg": "legs", "legs": "legs", "thigh": "legs", "thighs": "legs", "knee": "joints", "knees": "joints",
    "calf": "legs", "calves": "legs", "shin": "legs", "ankle": "joints", "ankles": "joints",
    "foot": "feet", "feet": "feet", "heel": "feet", "heels": "feet", "toe": "feet", "toes": "feet",
    "joint": "joints", "joints": "joints", "muscle": "muscles", "muscles": "muscles", "bones": "bones",
    "skin": "skin", "scalp": "skin", "body": "body", "veins": "veins",
    "urine": "urinary", "pee": "urinary", "stool": "stool", "stools": "stool", "bowel": "stool",
    "poop": "stool", "wipe": "stool", "wiping": "stool", "abdominal": "abdomen", "vision": "vision",
    "eyesight": "vision", "sight": "vision", "visual": "vision", "nails": "skin", "mind": "mind", "brain": "mind",
    "appetite": "appetite", "weight": "weight", "bathroom": "toilet", "restroom": "toilet", "toilet": "toilet",
}

# Words that describe a problem with the body part they accompany.
BODY_SYMPTOM_WORDS = {
    "pain", "pains", "painful", "hurt", "hurts", "hurting", "ache", "aches", "aching", "achy", "sore", "soreness",
    "tender", "tenderness", "burning", "burns", "burn", "sting", "stings", "stinging", "throbbing", "pounding",
    "cramps", "cramping", "discomfort", "killing", "stiff", "stiffness", "swollen", "swelling", "puffy",
    "inflamed", "itchy", "itching", "numb", "tingling", "bleeding", "lump", "lumps", "red", "redness",
    "yellow", "yellowish", "yellowing", "watery", "blocked", "runny", "bulging", "twisted", "enlarged",
    "weak", "weakness", "tight", "tightness", "pressure", "heavy", "heaviness", "blurry", "blurred",
    "dark", "cloudy", "smelly", "blood", "racing", "irregular", "fluttering", "spots", "patches", "bumps",
    "rash", "dry", "cracked", "peeling", "flaky", "scaly", "lesions", "sores", "sensitive", "irritated",
    "irritation", "irritating", "protruding", "discomforts", "silver", "peel", "dents", "distorted", "problems",
    "problem", "trouble", "difficulties", "difficulty", "change", "changes", "changed", "odour", "odor", "smell",
    "crimson", "black", "scorching", "foggy", "cloudy", "hazy", "murky", "gained", "gain", "gaining", "lost",
    "losing", "loss", "put", "varies", "frequently", "often", "empty", "sensation", "poor", "increased",
    "decreased",
}

# Urination words need a qualifier ("burning when I pee", "urinating often").
URINATION_WORDS = {"urinate", "urinating", "urination", "pee", "peeing", "pees", "peed", "wee", "weeing"}
URINATION_QUALIFIERS = {
    "burning", "burns", "burn", "pain", "painful", "hurts", "sting", "stings", "stinging", "frequent",
    "frequently", "often", "lot", "constantly", "night", "blood", "dark", "cloudy", "smell", "smells",
    "smelly", "urge", "urgent", "more", "difficult", "difficulty", "urges", "desires", "want", "sensation",
    "bursting", "times", "many", "need", "needing",
}

# ---------------------------------------------------------------------------
# General words: they show the person feels unwell, but on their own they are
# not enough information to match a condition, so the system asks for detail.
# ---------------------------------------------------------------------------
GENERAL_PHRASES = [
    "sick", "ill", "unwell", "pain", "pains", "painful", "hurt", "hurts", "hurting", "ache", "aches",
    "aching", "achy", "sore", "discomfort", "weak", "weakness", "swollen", "swelling", "stiff", "stiffness",
    "uncomfortable", "feel bad", "feel awful", "feel terrible", "feel off", "feeling bad",
    "don't feel well", "do not feel well", "not feeling well", "don't feel good", "not feeling good",
    "feeling unwell", "feel unwell",
]

# ---------------------------------------------------------------------------
# Phrases that contain a negative word but describe a PRESENT symptom or its
# persistence. They never start a negation.
# ---------------------------------------------------------------------------
PRESENT_NEGATIVE_PHRASES = [
    "no appetite", "not hungry", "no energy", "no strength", "not sleeping", "can't sleep", "cannot sleep",
    "unable to sleep", "can't breathe", "cannot breathe", "not able to breathe", "can't eat", "cannot eat",
    "unable to eat", "can't keep food down", "can't keep anything down",
    "don't feel well", "do not feel well", "not feeling well", "don't feel good", "not feeling good",
    "doesn't go away", "does not go away", "won't go away", "not going away", "doesn't stop", "does not stop",
    "won't stop", "never stops", "not getting better", "not improving", "no relief", "nothing helps",
    "haven't been able to", "have not been able to", "hasn't been able to", "not able to", "unable to",
    "can't seem to",
]

# Words that make the following symptoms absent.
NEGATORS = {
    "no", "not", "without", "never", "none", "nor", "neither", "don't", "doesn't", "didn't", "haven't",
    "hasn't", "hadn't", "isn't", "aren't", "wasn't", "weren't", "denies", "deny", "denied",
}
NEGATOR_PHRASES = [("free", "of"), ("absence", "of")]

# A symptom inside these phrases is neither present nor absent: ask the user.
UNCERTAIN_PHRASES = [
    "not sure", "unsure", "not certain", "don't know", "do not know", "no idea", "can't tell", "whether",
    "wondering if",
]

# Words that end a negation ("no fever, but a cough").
CLAUSE_BREAK_WORDS = {"but", "however", "although", "though", "yet", "except", "whereas", "because", "due"}

# Subject and auxiliary words right before a negator are removed with it:
# "but I do not have a fever" -> the whole phrase is left out, not just "not have a fever".
NEGATION_LEAD_WORDS = {"i", "do", "does", "did", "have", "has", "had", "am", "is", "are", "was", "were",
                       "there", "they", "it", "we", "he", "she", "really", "also", "still", "definitely"}

# "I have", "and feel", "there is": a new positive statement ends a negation.
POSITIVE_VERBS = {"have", "am", "get", "feel", "also", "still", "notice", "keep", "experience", "do", "got"}
POSITIVE_STARTERS = {"i've", "i'm", "there's"}

# Condition names are not symptoms ("I think I have diabetes").
CONDITION_NAMES = [
    "acne", "arthritis", "asthma", "spondylosis", "chicken pox", "chickenpox", "common cold", "a cold",
    "dengue", "hemorrhoids", "haemorrhoids", "piles", "fungal infection", "hypertension", "impetigo",
    "jaundice", "malaria", "migraine", "migraines", "pneumonia", "psoriasis", "typhoid", "varicose veins",
    "allergy", "allergies", "diabetes", "drug reaction", "reflux disease", "gerd", "ulcer", "ulcers",
    "urinary tract infection", "uti", "flu", "covid", "infection", "cancer",
]

# ---------------------------------------------------------------------------
# Medical terms rewritten in plain words BEFORE TF-IDF. Every replacement uses
# only words that exist in the model vocabulary (checked by a test). Entries
# marked review=True simplify the clinical meaning and need professional review.
# ---------------------------------------------------------------------------
MEDICAL_TERMS = {
    "dysuria": ("pain during urination", True, "dysuria can also mean burning or difficulty when urinating"),
    "haematuria": ("blood in urine", False, ""),
    "hematuria": ("blood in urine", False, ""),
    "pyrexia": ("fever", False, ""),
    "febrile": ("fever", False, ""),
    "nocturia": ("urination during the night", False, ""),
    "polyuria": ("urinating a lot", True, "polyuria is a large urine volume, not only frequent urination"),
    "urinary frequency": ("frequent urination", False, ""),
    "polydipsia": ("excessive thirst", False, ""),
    "polyphagia": ("excessive hunger", False, ""),
    "dyspnea": ("shortness of breath", False, ""),
    "dyspnoea": ("shortness of breath", False, ""),
    "tachypnea": ("fast breathing", False, ""),
    "tachypnoea": ("fast breathing", False, ""),
    "emesis": ("vomiting", False, ""),
    "pruritus": ("itching", False, ""),
    "urticaria": ("hives", True, "hives are raised itchy welts; 'hives' is not in the model vocabulary"),
    "cephalalgia": ("headache", False, ""),
    "cephalgia": ("headache", False, ""),
    "myalgia": ("muscle pain", False, ""),
    "arthralgia": ("joint pain", False, ""),
    "rhinorrhea": ("runny nose", False, ""),
    "rhinorrhoea": ("runny nose", False, ""),
    "epistaxis": ("bleeding from the nose", False, ""),
    "hemoptysis": ("coughing up blood", False, ""),
    "haemoptysis": ("coughing up blood", False, ""),
    "hematochezia": ("blood in stool", False, ""),
    "haematochezia": ("blood in stool", False, ""),
    "melena": ("black stools", True, "melena means black, tarry stools from bleeding higher in the gut"),
    "melaena": ("black stools", True, "melaena means black, tarry stools from bleeding higher in the gut"),
    "icterus": ("yellow skin", True, "icterus also covers yellowing of the eyes"),
    "dyspepsia": ("indigestion", False, ""),
    "pyrosis": ("heartburn", False, ""),
    "odynophagia": ("pain when swallowing", False, ""),
    "dysphagia": ("difficulty swallowing", False, ""),
    "syncope": ("fainting", False, ""),
    "diaphoresis": ("heavy sweating", False, ""),
    "hyperhidrosis": ("excessive sweating", False, ""),
    "erythema": ("redness", False, ""),
    "edema": ("swelling", False, ""),
    "oedema": ("swelling", False, ""),
    "xerostomia": ("dry mouth", False, ""),
    "paresthesia": ("tingling", True, "paresthesia also includes numbness or pins and needles"),
    "paraesthesia": ("tingling", True, "paraesthesia also includes numbness or pins and needles"),
    "photophobia": ("light hurts my eyes", True, "photophobia is sensitivity or discomfort of the eyes in light"),
    "epigastric": ("upper stomach", True, "the epigastric region is the upper central abdomen"),
    "productive cough": ("cough with phlegm", False, ""),
}

# Unknown words with these endings look like medical terms the system cannot
# interpret safely. They are reported to the user instead of being guessed.
MEDICAL_SUFFIXES = (
    "itis", "osis", "algia", "uria", "emia", "aemia", "rrhea", "rrhoea", "pnea", "pnoea", "plegia",
    "pathy", "ectomy", "phobia", "iasis", "dynia", "megaly", "penia", "ptysis", "phagia", "dipsia",
    "esthesia", "aesthesia", "spasm", "trophy",
)

# Concept names for "body part + symptom word" matches, so they share the name of
# the equivalent phrase ("my neck hurts" and "neck pain" are both "neck_pain").
BODY_CONCEPTS = {
    "urinary": "urinary_symptoms", "neck": "neck_pain", "back": "back_pain", "joints": "joint_pain",
    "chest": "chest_pain", "muscles": "muscle_pain", "abdomen": "abdominal_pain", "veins": "swollen_veins",
    "stool": "stool_changes", "toilet": "frequent_toilet", "vision": "vision_changes",
    "appetite": "appetite_loss", "head": "headache", "body": "body_symptom",
}
