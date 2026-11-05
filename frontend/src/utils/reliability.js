// Input-reliability helpers for the Symptom Analysis page.
// Nothing here changes the text that is sent or the model's prediction;
// it only decides which warnings to show alongside it.

// Words that usually mark a symptom as absent. Expressions of inability
// ("can't sleep") are deliberately excluded because they describe symptoms.
const NEGATORS = [
  "do not", "does not", "did not", "have not", "has not", "free of", "absence of",
  "don't", "doesn't", "didn't", "haven't", "hasn't", "isn't", "aren't", "wasn't", "weren't",
  "without", "never", "denies", "deny", "none", "not", "nor", "no",
];

// Words that end the negated phrase ("no fever and a cough" -> "no fever").
const PHRASE_BREAKS = new Set(["and", "but", "or", "with", "so", "because"]);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const NEGATION_PATTERN = new RegExp(
  `\\b(${NEGATORS.map((n) => escapeRegex(n).replace("'", "['’]").replace(" ", "\\s+")).join("|")})\\b` +
    "((?:\\s+[a-z][a-z'’-]*){1,3})",
  "gi"
);

// Returns the negated phrases found in the text, e.g. ["no fever", "without cough"].
export function detectNegations(text) {
  const phrases = [];

  for (const match of text.matchAll(NEGATION_PATTERN)) {
    const negator = match[1].replace(/\s+/g, " ");
    const words = [];
    for (const word of match[2].trim().split(/\s+/)) {
      if (PHRASE_BREAKS.has(word.toLowerCase())) break;
      words.push(word);
    }
    if (words.length === 0) continue;

    const phrase = `${negator} ${words.join(" ")}`;
    if (!phrases.some((p) => p.toLowerCase() === phrase.toLowerCase())) {
      phrases.push(phrase);
    }
  }

  return phrases.slice(0, 5);
}

// Coverage below these levels triggers a warning. Common words such as
// "have" or "and" are part of the vocabulary, so a low share is a strong
// signal that the description's content words are unknown to the model.
export const MIN_RECOGNIZED_WORDS = 3;
export const MIN_COVERAGE = 0.5;

// "none" | "low" | "ok" | null (no coverage data from the API).
// Text of only symbols, digits or single letters has totalWords === 0, which
// is real data meaning nothing was recognised, so it also counts as "none".
export function coverageLevel(coverage) {
  if (!coverage || typeof coverage.totalWords !== "number") return null;
  if (coverage.totalWords === 0 || coverage.recognizedWords === 0) return "none";
  if (coverage.recognizedWords < MIN_RECOGNIZED_WORDS || coverage.coverage < MIN_COVERAGE) {
    return "low";
  }
  return "ok";
}
