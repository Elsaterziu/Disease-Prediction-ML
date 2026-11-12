// Albanian names for the model's 24 class labels. Display only: the model's
// original labels are never changed and are shown alongside in Albanian mode.
// These translations still need checking by a medical professional.
export const DISEASE_NAMES_SQ = {
  Acne: "Akne",
  Arthritis: "Artrit",
  "Bronchial Asthma": "Astmë bronkiale",
  "Cervical spondylosis": "Spondilozë cervikale",
  "Chicken pox": "Varicela (Lia e dhenve)",
  "Common Cold": "Ftohje e zakonshme",
  Dengue: "Ethet dengue",
  "Dimorphic Hemorrhoids": "Hemorroide",
  "Fungal infection": "Infeksion kërpudhor",
  Hypertension: "Hipertension",
  Impetigo: "Impetigo",
  Jaundice: "Verdhëz",
  Malaria: "Malarie",
  Migraine: "Migrenë",
  Pneumonia: "Pneumoni",
  Psoriasis: "Psoriazë",
  Typhoid: "Tifo",
  "Varicose Veins": "Variçe",
  allergy: "Alergji",
  diabetes: "Diabet",
  "drug reaction": "Reaksion ndaj barnave",
  "gastroesophageal reflux disease": "Sëmundja e refluksit gastroezofageal",
  "peptic ulcer disease": "Ulçera peptike",
  "urinary tract infection": "Infeksion i rrugëve urinare",
};

const capitalise = (label) => (label ? label[0].toUpperCase() + label.slice(1) : "");

// Display name for a class label. In Albanian, falls back to the original
// label when no translation exists.
export function diseaseName(label, lang) {
  if (lang === "sq" && DISEASE_NAMES_SQ[label]) return DISEASE_NAMES_SQ[label];
  return capitalise(label);
}

// True when an Albanian name exists, so the original can be shown beside it.
export const hasAlbanianName = (label) => Boolean(DISEASE_NAMES_SQ[label]);
