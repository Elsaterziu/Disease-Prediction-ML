// Symptom options for the "Select symptoms" text-entry assistant.
//
// This list is NOT a clinical instrument and the model never receives it as
// structured features. Each `phrase` is only inserted into an English sentence
// that is then sent to the free-text prediction API. Phrases use words that
// occur in the Symptom2Disease training descriptions so the TF-IDF vocabulary
// recognises them; that is the only criterion used to choose them.
//
// `phrase` must read naturally after "I have ...".
// `sq` holds the Albanian label/phrase/aliases. The Albanian phrase reads
// naturally after "Kam ..." and is translated by src/translation/sqToEn.js,
// so every Albanian phrase must exist in the translation dictionary.

const s = (id, label, phrase, aliases, sq) => ({ id, label, phrase, aliases, sq });

export const SYMPTOM_CATEGORIES = [
  {
    id: "general",
    label: "General",
    labelSq: "Të përgjithshme",
    symptoms: [
      s("fever", "Fever", "a high fever", ["temperature"], { label: "Temperaturë", phrase: "temperaturë të lartë", aliases: ["ethe", "zjarrmi"] }),
      s("chills", "Chills", "chills", ["shivering", "cold"], { label: "Të dridhura", phrase: "të dridhura", aliases: ["dridhje"] }),
      s("fatigue", "Fatigue", "constant tiredness and fatigue", ["tired", "exhausted", "tiredness"], { label: "Lodhje", phrase: "lodhje të vazhdueshme", aliases: ["i lodhur", "e lodhur"] }),
      s("weakness", "General weakness", "general weakness", ["weak"], { label: "Dobësi e përgjithshme", phrase: "dobësi", aliases: ["pafuqi", "i dobët"] }),
      s("weight-loss", "Weight loss", "unexplained weight loss", ["losing weight"], { label: "Humbje peshe", phrase: "humbje peshe", aliases: ["peshë"] }),
      s("appetite", "Loss of appetite", "a loss of appetite", ["not hungry", "eating"], { label: "Humbje oreksi", phrase: "humbje oreksi", aliases: ["oreks", "ushqim"] }),
      s("sweating", "Heavy sweating", "heavy sweating", ["sweat", "perspiring"], { label: "Djersitje e tepërt", phrase: "djersitje", aliases: ["djersë"] }),
      s("hunger", "Excessive hunger", "excessive hunger", ["hungry"], { label: "Uri e tepërt", phrase: "uri të madhe", aliases: ["i uritur"] }),
    ],
  },
  {
    id: "head",
    label: "Head & Neurological",
    labelSq: "Koka dhe sistemi nervor",
    symptoms: [
      s("headache", "Headache", "a headache", ["head pain", "migraine"], { label: "Dhimbje koke", phrase: "dhimbje koke", aliases: ["kokë", "koka"] }),
      s("dizziness", "Dizziness", "dizziness", ["dizzy", "lightheaded"], { label: "Marramendje", phrase: "marramendje", aliases: ["trullosje", "mendtë"] }),
      s("blurred-vision", "Blurred vision", "blurred vision", ["eyesight", "sight"], { label: "Shikim i turbullt", phrase: "shikim të turbullt", aliases: ["shikim", "sy"] }),
      s("eye-pain", "Pain behind the eyes", "pain behind my eyes", ["eye"], { label: "Dhimbje pas syve", phrase: "dhimbje pas syve", aliases: ["sy"] }),
      s("balance", "Trouble with balance", "trouble keeping my balance", ["unsteady"], { label: "Probleme me ekuilibrin", phrase: "probleme me ekuilibrin", aliases: ["ekuilibër"] }),
      s("concentration", "Difficulty concentrating", "difficulty concentrating", ["focus"], { label: "Vështirësi në përqendrim", phrase: "vështirësi në përqendrim", aliases: ["përqendrim"] }),
    ],
  },
  {
    id: "respiratory",
    label: "Respiratory",
    labelSq: "Frymëmarrja",
    symptoms: [
      s("cough", "Cough", "a cough", ["coughing"], { label: "Kollë", phrase: "kollë", aliases: ["kollitem"] }),
      s("breath", "Shortness of breath", "shortness of breath", ["breathing", "breathless"], { label: "Vështirësi në frymëmarrje", phrase: "vështirësi në frymëmarrje", aliases: ["frymë", "ajër"] }),
      s("chest-pain", "Chest pain", "chest pain", ["chest"], { label: "Dhimbje gjoksi", phrase: "dhimbje gjoksi", aliases: ["gjoks"] }),
      s("runny-nose", "Runny nose", "a runny nose", ["nose"], { label: "Rrjedhje hundësh", phrase: "rrjedhje hundësh", aliases: ["hundë"] }),
      s("sneezing", "Sneezing", "frequent sneezing", ["sneeze"], { label: "Teshtitje", phrase: "teshtitje", aliases: ["teshtij"] }),
      s("sore-throat", "Sore throat", "a sore throat", ["throat"], { label: "Dhimbje fyti", phrase: "dhimbje fyti", aliases: ["fyt"] }),
      s("phlegm", "Phlegm or mucus", "phlegm and mucus", ["sputum"], { label: "Gëlbazë ose mukozë", phrase: "gëlbazë", aliases: ["mukozë", "sekrecione"] }),
      s("wheezing", "Wheezing", "wheezing when I breathe", ["whistling"], { label: "Fishkëllimë në gjoks", phrase: "fishkëllimë", aliases: ["fishkëllimë"] }),
    ],
  },
  {
    id: "digestive",
    label: "Digestive",
    labelSq: "Sistemi tretës",
    symptoms: [
      s("nausea", "Nausea", "nausea", ["sick", "queasy"], { label: "Të përziera", phrase: "të përziera", aliases: ["nauze"] }),
      s("vomiting", "Vomiting", "vomiting", ["throwing up"], { label: "Të vjella", phrase: "të vjella", aliases: ["vjell"] }),
      s("stomach-pain", "Stomach pain", "stomach pain", ["abdominal", "belly", "abdomen"], { label: "Dhimbje barku", phrase: "dhimbje barku", aliases: ["stomak", "bark"] }),
      s("diarrhea", "Diarrhea", "diarrhea", ["diarrhoea", "loose stool"], { label: "Diarre", phrase: "diarre", aliases: ["barkqitje"] }),
      s("constipation", "Constipation", "constipation", [], { label: "Kapsllëk", phrase: "kapsllëk", aliases: [] }),
      s("acid-reflux", "Acid reflux", "acid reflux", ["reflux"], { label: "Refluks acid", phrase: "refluks acid", aliases: ["refluks"] }),
      s("heartburn", "Heartburn", "heartburn", ["burning chest"], { label: "Urthë", phrase: "urthë", aliases: ["djegie stomaku"] }),
      s("indigestion", "Indigestion", "indigestion", ["digestion", "bloating"], { label: "Tretje e vështirë", phrase: "vështirësi në tretje", aliases: ["tretje"] }),
      s("bowel-bleeding", "Painful, bleeding bowel movements", "pain and bleeding during bowel movements", ["anus", "stool", "blood"], { label: "Dhimbje dhe gjak gjatë jashtëqitjes", phrase: "dhimbje dhe gjak gjatë jashtëqitjes", aliases: ["gjak", "jashtëqitje"] }),
    ],
  },
  {
    id: "urinary",
    label: "Urinary",
    labelSq: "Sistemi urinar",
    symptoms: [
      s("dark-urine", "Dark urine", "dark urine", ["urine colour", "urine color"], { label: "Urinë e errët", phrase: "urinë të errët", aliases: ["urinë"] }),
      s("burning-urination", "Burning when urinating", "a burning feeling when urinating", ["pee", "urination"], { label: "Djegie gjatë urinimit", phrase: "djegie gjatë urinimit", aliases: ["urinim"] }),
      s("frequent-urination", "Frequent urination", "frequent urination", ["pee", "urinating"], { label: "Urinim i shpeshtë", phrase: "urinim të shpeshtë", aliases: ["urinoj shpesh"] }),
    ],
  },
  {
    id: "skin",
    label: "Skin",
    labelSq: "Lëkura",
    symptoms: [
      s("rash", "Skin rash", "a skin rash", ["rash"], { label: "Skuqje e lëkurës", phrase: "skuqje të lëkurës", aliases: ["skuqje"] }),
      s("itching", "Itching", "itchy skin", ["itch", "itchy"], { label: "Kruajtje", phrase: "kruajtje", aliases: ["kruhem"] }),
      s("red-spots", "Red spots", "red spots on my skin", ["spots"], { label: "Njolla të kuqe", phrase: "njolla të kuqe", aliases: ["pika të kuqe"] }),
      s("blisters", "Blisters", "blisters", ["bumps"], { label: "Flluska", phrase: "flluska", aliases: ["fshikëza"] }),
      s("scaly-patches", "Dry, scaly patches", "dry, scaly patches on my skin", ["flaky", "scales"], { label: "Lëkurë e thatë me luspa", phrase: "lëkurë të thatë me luspa", aliases: ["luspa"] }),
      s("yellow-skin", "Yellowish skin", "yellowish skin", ["yellow", "jaundice"], { label: "Zverdhje e lëkurës", phrase: "zverdhje të lëkurës", aliases: ["e verdhë"] }),
      s("pimples", "Pimples and blackheads", "pimples and blackheads", ["acne", "zits"], { label: "Puçrra dhe pika të zeza", phrase: "puçrra dhe pika të zeza", aliases: ["akne", "puçrra"] }),
      s("pus-sores", "Pus-filled sores", "sores filled with pus", ["pus", "sore"], { label: "Plagë me qelb", phrase: "plagë me qelb", aliases: ["qelb"] }),
      s("swollen-veins", "Swollen veins in the legs", "swollen veins in my legs", ["veins", "varicose"], { label: "Vena të fryra në këmbë", phrase: "vena të fryra", aliases: ["variçe", "vena"] }),
      s("bruises", "Bruising", "bruises on my skin", ["bruise"], { label: "Mavijosje", phrase: "mavijosje", aliases: ["nxirje"] }),
    ],
  },
  {
    id: "musculoskeletal",
    label: "Musculoskeletal",
    labelSq: "Muskujt dhe kockat",
    symptoms: [
      s("joint-pain", "Joint pain", "joint pain", ["joints", "arthritis"], { label: "Dhimbje nyjesh", phrase: "dhimbje nyjesh", aliases: ["nyje"] }),
      s("swollen-joints", "Swollen joints", "swollen joints", ["swelling"], { label: "Nyje të enjtura", phrase: "nyje të enjtura", aliases: ["enjtje"] }),
      s("muscle-pain", "Muscle pain", "aching muscles", ["muscles", "aches"], { label: "Dhimbje muskujsh", phrase: "dhimbje muskujsh", aliases: ["muskuj"] }),
      s("muscle-weakness", "Muscle weakness", "muscle weakness", ["weak muscles"], { label: "Dobësi e muskujve", phrase: "dobësi të muskujve", aliases: ["muskuj të dobët"] }),
      s("back-pain", "Back pain", "back pain", ["back"], { label: "Dhimbje shpine", phrase: "dhimbje shpine", aliases: ["shpinë", "mesi"] }),
      s("neck-pain", "Neck pain", "neck pain", ["neck"], { label: "Dhimbje qafe", phrase: "dhimbje qafe", aliases: ["qafë"] }),
      s("stiffness", "Stiffness", "stiffness when I move", ["stiff"], { label: "Ngurtësi", phrase: "ngurtësi", aliases: ["shtangim"] }),
      s("leg-cramps", "Leg cramps", "cramps in my legs", ["cramp", "legs"], { label: "Ngërçe në këmbë", phrase: "ngërçe në këmbë", aliases: ["ngërç", "këmbë"] }),
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
