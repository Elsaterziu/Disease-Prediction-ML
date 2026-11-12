import { SYMPTOM_CATEGORIES, SYMPTOMS_BY_ID } from "../data/symptomCatalog";

// Language-specific pieces. Albanian drafts are translated to English by
// src/translation/sqToEn.js before they reach the model.
const LANGUAGE = {
  en: {
    and: "and",
    // Sentence openers per category group; the last one repeats if needed.
    openers: ["I have", "I also have", "In addition, I have", "On top of that, I have", "I also have"],
    alsoHave: [/^I have\b/, "I also have"],
  },
  sq: {
    and: "dhe",
    openers: ["Kam", "Gjithashtu kam"],
    alsoHave: [/^Kam\b/, "Gjithashtu kam"],
  },
};

const pick = (lang) => LANGUAGE[lang] ?? LANGUAGE.en;
const textFor = (symptom, lang) => (lang === "sq" ? symptom.sq : symptom);

// "a" -> "a", "a, b" -> "a and b", "a, b, c" -> "a, b and c"
function joinList(items, and) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

function asSentence(text) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const capitalised = trimmed[0].toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalised) ? capitalised : `${capitalised}.`;
}

// Builds a plain description from the selected symptom ids and an optional
// free-text addition. Symptoms are grouped by category, in catalog order, so
// related complaints end up in the same sentence:
//   "I have a high fever and chills. I also have a cough. <details>"
//   "Kam temperaturë të lartë dhe të dridhura. Gjithashtu kam kollë."
export function buildSymptomDescription(selectedIds, extraDetails = "", lang = "en") {
  const selected = new Set(selectedIds);
  const { openers, and } = pick(lang);

  const sentences = SYMPTOM_CATEGORIES.map((category) =>
    category.symptoms
      .filter((symptom) => selected.has(symptom.id))
      .map((symptom) => textFor(symptom, lang).phrase)
  )
    .filter((phrases) => phrases.length > 0)
    .map((phrases, index) => `${openers[Math.min(index, openers.length - 1)]} ${joinList(phrases, and)}.`);

  const details = asSentence(extraDetails);
  if (details) sentences.push(details);

  return sentences.join(" ");
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Albanian is compared without ë/ç so "kolle" still matches "Kollë".
const fold = (s) => s.toLowerCase().replace(/ë/g, "e").replace(/ç/g, "c");

// A symptom counts as mentioned when its label ("Fever"), drafted phrase
// ("a high fever") or one of its aliases appears as whole words.
function isMentioned(symptom, haystack, lang) {
  const { label, phrase, aliases } = textFor(symptom, lang);
  return [label, phrase, ...aliases].some((term) =>
    new RegExp(`(^|[^\\p{L}])${escapeRegex(fold(term))}($|[^\\p{L}])`, "u").test(haystack)
  );
}

// Selected symptoms that do not appear to be mentioned in the (possibly
// edited) text. Heavily rephrased symptoms may also be reported here, so
// callers should word this as "may not be reflected".
export function symptomsMissingFromText(selectedIds, text, lang = "en") {
  const haystack = fold(text).replace(/\s+/g, " ");
  return selectedIds.filter(
    (id) => SYMPTOMS_BY_ID[id] && !isMentioned(SYMPTOMS_BY_ID[id], haystack, lang)
  );
}

// True when the optional "Anything else?" note is not part of the text.
export function detailsMissingFromText(details, text) {
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.!?\s]+$/, "").trim();
  const note = normalize(details);
  return note !== "" && !normalize(text).includes(note);
}

// Appends sentences for the given symptoms and note to existing text without
// changing anything the user wrote.
export function appendSymptoms(text, ids, details = "", lang = "en") {
  const [pattern, replacement] = pick(lang).alsoHave;
  const addition = buildSymptomDescription(ids, details, lang).replace(pattern, replacement);
  if (!addition) return text;
  const base = text.trimEnd();
  if (!base) return buildSymptomDescription(ids, details, lang);
  return `${/[.!?]$/.test(base) ? base : `${base}.`} ${addition}`;
}
