import { SYMPTOM_CATEGORIES, SYMPTOMS_BY_ID } from "../data/symptomCatalog";

// "a" -> "a", "a, b" -> "a and b", "a, b, c" -> "a, b and c"
function joinList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function asSentence(text) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const capitalised = trimmed[0].toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalised) ? capitalised : `${capitalised}.`;
}

// Sentence openers per category group; the last one repeats if needed.
const OPENERS = ["I have", "I also have", "In addition, I have", "On top of that, I have", "I also have"];

// Builds a plain English description from the selected symptom ids and an
// optional free-text addition. Symptoms are grouped by category, in catalog
// order, so related complaints end up in the same sentence:
//   "I have a high fever and chills. I also have a cough. <details>"
export function buildSymptomDescription(selectedIds, extraDetails = "") {
  const selected = new Set(selectedIds);

  const sentences = SYMPTOM_CATEGORIES.map((category) =>
    category.symptoms
      .filter((symptom) => selected.has(symptom.id))
      .map((symptom) => symptom.phrase)
  )
    .filter((phrases) => phrases.length > 0)
    .map(
      (phrases, index) =>
        `${OPENERS[Math.min(index, OPENERS.length - 1)]} ${joinList(phrases)}.`
    );

  const details = asSentence(extraDetails);
  if (details) sentences.push(details);

  return sentences.join(" ");
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A symptom counts as mentioned when its label ("Fever"), drafted phrase
// ("a high fever") or one of its aliases appears as whole words.
function isMentioned(symptom, haystack) {
  return [symptom.label, symptom.phrase, ...symptom.aliases].some((term) =>
    new RegExp(`\\b${escapeRegex(term.toLowerCase())}\\b`).test(haystack)
  );
}

// Selected symptoms that do not appear to be mentioned in the (possibly
// edited) text. Heavily rephrased symptoms may also be reported here, so
// callers should word this as "may not be reflected".
export function symptomsMissingFromText(selectedIds, text) {
  const haystack = text.toLowerCase().replace(/\s+/g, " ");
  return selectedIds.filter(
    (id) => SYMPTOMS_BY_ID[id] && !isMentioned(SYMPTOMS_BY_ID[id], haystack)
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
export function appendSymptoms(text, ids, details = "") {
  const addition = buildSymptomDescription(ids, details).replace(/^I have\b/, "I also have");
  if (!addition) return text;
  const base = text.trimEnd();
  if (!base) return buildSymptomDescription(ids, details);
  return `${/[.!?]$/.test(base) ? base : `${base}.`} ${addition}`;
}
