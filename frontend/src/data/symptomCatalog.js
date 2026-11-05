// Symptom options for the "Select symptoms" text-entry assistant.
//
// This list is NOT a clinical instrument and the model never receives it as
// structured features. Each `phrase` is only inserted into an English sentence
// that is then sent to the free-text prediction API. Phrases use words that
// occur in the Symptom2Disease training descriptions so the TF-IDF vocabulary
// recognises them; that is the only criterion used to choose them.
//
// `phrase` must read naturally after "I have ...".

export const SYMPTOM_CATEGORIES = [
  {
    id: "general",
    label: "General",
    symptoms: [
      { id: "fever", label: "Fever", phrase: "a high fever", aliases: ["temperature"] },
      { id: "chills", label: "Chills", phrase: "chills", aliases: ["shivering", "cold"] },
      { id: "fatigue", label: "Fatigue", phrase: "constant tiredness and fatigue", aliases: ["tired", "exhausted", "tiredness"] },
      { id: "weakness", label: "General weakness", phrase: "general weakness", aliases: ["weak"] },
      { id: "weight-loss", label: "Weight loss", phrase: "unexplained weight loss", aliases: ["losing weight"] },
      { id: "appetite", label: "Loss of appetite", phrase: "a loss of appetite", aliases: ["not hungry", "eating"] },
      { id: "sweating", label: "Heavy sweating", phrase: "heavy sweating", aliases: ["sweat", "perspiring"] },
      { id: "hunger", label: "Excessive hunger", phrase: "excessive hunger", aliases: ["hungry"] },
    ],
  },
  {
    id: "head",
    label: "Head & Neurological",
    symptoms: [
      { id: "headache", label: "Headache", phrase: "a headache", aliases: ["head pain", "migraine"] },
      { id: "dizziness", label: "Dizziness", phrase: "dizziness", aliases: ["dizzy", "lightheaded"] },
      { id: "blurred-vision", label: "Blurred vision", phrase: "blurred vision", aliases: ["eyesight", "sight"] },
      { id: "eye-pain", label: "Pain behind the eyes", phrase: "pain behind my eyes", aliases: ["eye"] },
      { id: "balance", label: "Trouble with balance", phrase: "trouble keeping my balance", aliases: ["unsteady"] },
      { id: "concentration", label: "Difficulty concentrating", phrase: "difficulty concentrating", aliases: ["focus"] },
    ],
  },
  {
    id: "respiratory",
    label: "Respiratory",
    symptoms: [
      { id: "cough", label: "Cough", phrase: "a cough", aliases: ["coughing"] },
      { id: "breath", label: "Shortness of breath", phrase: "shortness of breath", aliases: ["breathing", "breathless"] },
      { id: "chest-pain", label: "Chest pain", phrase: "chest pain", aliases: ["chest"] },
      { id: "runny-nose", label: "Runny nose", phrase: "a runny nose", aliases: ["nose"] },
      { id: "sneezing", label: "Sneezing", phrase: "frequent sneezing", aliases: ["sneeze"] },
      { id: "sore-throat", label: "Sore throat", phrase: "a sore throat", aliases: ["throat"] },
      { id: "phlegm", label: "Phlegm or mucus", phrase: "phlegm and mucus", aliases: ["sputum"] },
      { id: "wheezing", label: "Wheezing", phrase: "wheezing when I breathe", aliases: ["whistling"] },
    ],
  },
  {
    id: "digestive",
    label: "Digestive",
    symptoms: [
      { id: "nausea", label: "Nausea", phrase: "nausea", aliases: ["sick", "queasy"] },
      { id: "vomiting", label: "Vomiting", phrase: "vomiting", aliases: ["throwing up"] },
      { id: "stomach-pain", label: "Stomach pain", phrase: "stomach pain", aliases: ["abdominal", "belly", "abdomen"] },
      { id: "diarrhea", label: "Diarrhea", phrase: "diarrhea", aliases: ["diarrhoea", "loose stool"] },
      { id: "constipation", label: "Constipation", phrase: "constipation", aliases: [] },
      { id: "acid-reflux", label: "Acid reflux", phrase: "acid reflux", aliases: ["reflux"] },
      { id: "heartburn", label: "Heartburn", phrase: "heartburn", aliases: ["burning chest"] },
      { id: "indigestion", label: "Indigestion", phrase: "indigestion", aliases: ["digestion", "bloating"] },
      { id: "bowel-bleeding", label: "Painful, bleeding bowel movements", phrase: "pain and bleeding during bowel movements", aliases: ["anus", "stool", "blood"] },
    ],
  },
  {
    id: "urinary",
    label: "Urinary",
    symptoms: [
      { id: "dark-urine", label: "Dark urine", phrase: "dark urine", aliases: ["urine colour", "urine color"] },
      { id: "burning-urination", label: "Burning when urinating", phrase: "a burning feeling when urinating", aliases: ["pee", "urination"] },
      { id: "frequent-urination", label: "Frequent urination", phrase: "frequent urination", aliases: ["pee", "urinating"] },
    ],
  },
  {
    id: "skin",
    label: "Skin",
    symptoms: [
      { id: "rash", label: "Skin rash", phrase: "a skin rash", aliases: ["rash"] },
      { id: "itching", label: "Itching", phrase: "itchy skin", aliases: ["itch", "itchy"] },
      { id: "red-spots", label: "Red spots", phrase: "red spots on my skin", aliases: ["spots"] },
      { id: "blisters", label: "Blisters", phrase: "blisters", aliases: ["bumps"] },
      { id: "scaly-patches", label: "Dry, scaly patches", phrase: "dry, scaly patches on my skin", aliases: ["flaky", "scales"] },
      { id: "yellow-skin", label: "Yellowish skin", phrase: "yellowish skin", aliases: ["yellow", "jaundice"] },
      { id: "pimples", label: "Pimples and blackheads", phrase: "pimples and blackheads", aliases: ["acne", "zits"] },
      { id: "pus-sores", label: "Pus-filled sores", phrase: "sores filled with pus", aliases: ["pus", "sore"] },
      { id: "swollen-veins", label: "Swollen veins in the legs", phrase: "swollen veins in my legs", aliases: ["veins", "varicose"] },
      { id: "bruises", label: "Bruising", phrase: "bruises on my skin", aliases: ["bruise"] },
    ],
  },
  {
    id: "musculoskeletal",
    label: "Musculoskeletal",
    symptoms: [
      { id: "joint-pain", label: "Joint pain", phrase: "joint pain", aliases: ["joints", "arthritis"] },
      { id: "swollen-joints", label: "Swollen joints", phrase: "swollen joints", aliases: ["swelling"] },
      { id: "muscle-pain", label: "Muscle pain", phrase: "aching muscles", aliases: ["muscles", "aches"] },
      { id: "muscle-weakness", label: "Muscle weakness", phrase: "muscle weakness", aliases: ["weak muscles"] },
      { id: "back-pain", label: "Back pain", phrase: "back pain", aliases: ["back"] },
      { id: "neck-pain", label: "Neck pain", phrase: "neck pain", aliases: ["neck"] },
      { id: "stiffness", label: "Stiffness", phrase: "stiffness when I move", aliases: ["stiff"] },
      { id: "leg-cramps", label: "Leg cramps", phrase: "cramps in my legs", aliases: ["cramp", "legs"] },
    ],
  },
];

export const SYMPTOMS_BY_ID = Object.fromEntries(
  SYMPTOM_CATEGORIES.flatMap((category) =>
    category.symptoms.map((symptom) => [
      symptom.id,
      { ...symptom, categoryId: category.id },
    ])
  )
);
