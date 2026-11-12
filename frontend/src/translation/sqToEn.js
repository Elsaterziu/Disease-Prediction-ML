// Albanian -> English normalisation of symptom descriptions.
//
// Runs entirely in the browser with a controlled dictionary (no external
// translation service). It never guesses: words it cannot map are reported as
// unknown and the caller must ask the user to clarify instead of predicting.
//
// Negation: the SVM counts words, so "I do not have fever" would still count
// "fever". Negated symptoms are therefore EXCLUDED from the English text sent
// to the model (and listed in `excluded`). When the scope of a negation is not
// clear, the result is "unclear" and nothing should be sent.
//
// Result status:
//   "empty"   - nothing typed
//   "english" - the text has no Albanian words; it is sent unchanged
//   "ok"      - every word was understood; `english` is safe to send
//   "confirm" - understood after correcting likely typos; user must confirm
//   "unclear" - see `reasons`; do not send
//
// Reasons (only when "unclear"):
//   "unknown"         - words not in the dictionary (listed in `unknown`)
//   "noSymptom"       - no symptom found
//   "onlyNegated"     - every symptom mentioned is negated
//   "negationUnclear" - a negation without a clear symptom ("nuk e di")
//   "uncertain"       - hedging words such as "ndoshta" (listed in `uncertainWords`)

import {
  BODY_PARTS,
  CLAUSE_BREAKS,
  DURATION_UNITS,
  ENGLISH_NEGATORS,
  ENGLISH_STOPWORDS,
  EQUIVALENT_TOKENS,
  FILLERS,
  INTENSIFIERS,
  LOCATION_WORDS,
  NEGATION_CANCELLERS,
  NEGATORS,
  NUMBER_WORDS,
  PAIN_TEMPLATES,
  POSITIVE_VERBS,
  SENTENCE_BREAKS,
  SYMPTOM_PHRASES,
  UNCERTAINTY_WORDS,
} from "./sqMedicalDictionary";
import vocabularyList from "./modelVocabulary.json";

const MODEL_VOCABULARY = new Set(vocabularyList);
const ENGLISH_STOP = new Set(ENGLISH_STOPWORDS);

// "Kollë", "kolle" and "KOLLË" all become "kolle"; ç -> c.
export function normalizeWord(word) {
  return word
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const splitPhrase = (phrase) => normalizeWord(phrase).split(/\s+/).filter(Boolean);

// ---- Phrase index: first token -> candidate entries, longest first --------
function buildIndex() {
  const entries = [];
  for (const [variants, en] of SYMPTOM_PHRASES) {
    for (const v of variants) entries.push({ tokens: splitPhrase(v), en });
  }
  for (const [forms, en] of BODY_PARTS) {
    for (const form of forms) {
      for (const template of PAIN_TEMPLATES) {
        entries.push({
          tokens: template.map((t) => (t === "P" ? normalizeWord(form) : t)),
          en,
          severe: template.some((t) => INTENSIFIERS.includes(t) || t === "forta"),
        });
      }
    }
  }
  const index = new Map();
  for (const entry of entries) {
    const list = index.get(entry.tokens[0]) ?? [];
    list.push(entry);
    index.set(entry.tokens[0], list);
  }
  for (const list of index.values()) list.sort((a, b) => b.tokens.length - a.tokens.length);
  return { index, entries };
}

const { index: PHRASE_INDEX, entries: PHRASE_ENTRIES } = buildIndex();

// Spelling variants that are interchangeable inside a phrase (see dictionary).
const GROUP_OF = new Map(EQUIVALENT_TOKENS.flatMap((group, g) => group.map((t) => [t, g])));
const sameToken = (a, b) => a === b || (GROUP_OF.has(a) && GROUP_OF.get(a) === GROUP_OF.get(b));

function phraseCandidates(word) {
  if (!GROUP_OF.has(word)) return PHRASE_INDEX.get(word) ?? [];
  const group = EQUIVALENT_TOKENS[GROUP_OF.get(word)];
  return group.flatMap((t) => PHRASE_INDEX.get(t) ?? []).sort((a, b) => b.tokens.length - a.tokens.length);
}

const SYMPTOM_WORDS = new Set(PHRASE_ENTRIES.flatMap((e) => e.tokens));
// Body part -> English, for "më dhemb koka dhe barku" (the second part inherits the pain).
const BODY_PART_PAIN = new Map(BODY_PARTS.flatMap(([forms, en]) => forms.map((f) => [normalizeWord(f), en])));
const PAIN_PHRASES = new Set([...BODY_PARTS.map(([, en]) => en), "pain"]);
const STRUCTURE_WORDS = new Set([
  ...FILLERS, ...NEGATORS, ...POSITIVE_VERBS, ...INTENSIFIERS, ...CLAUSE_BREAKS, ...SENTENCE_BREAKS,
  ...NEGATION_CANCELLERS, ...UNCERTAINTY_WORDS, ...Object.keys(NUMBER_WORDS), ...Object.keys(DURATION_UNITS),
  ...EQUIVALENT_TOKENS.flat(), ...LOCATION_WORDS, "prej", "qe", "nga", "dje", "sot",
].map(normalizeWord));
const ALBANIAN_WORDS = new Set([...SYMPTOM_WORDS, ...STRUCTURE_WORDS]);
// Albanian words that are not also English model words ("me", "per", "as" are both).
const ALBANIAN_ONLY = new Set([...ALBANIAN_WORDS].filter((w) => !MODEL_VOCABULARY.has(w)));

// ---- Tokenising ------------------------------------------------------------
// Keeps the original spelling for display and a normalised form for matching.
function tokenize(text) {
  const tokens = [];
  const re = /([\p{L}\p{N}]+)|([.!?;:\n]+)|(,)/gu;
  const cleaned = text.replace(/['’`´]/g, " ");
  for (const m of cleaned.matchAll(re)) {
    if (m[1]) tokens.push({ type: "word", surface: m[1], norm: normalizeWord(m[1]) });
    else if (m[2]) tokens.push({ type: "stop" });
    else tokens.push({ type: "comma" });
  }
  return tokens;
}

// ---- Typo correction ---------------------------------------------------------
function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[a.length][b.length];
}

// Returns the closest Albanian word, or null if none or genuinely ambiguous.
// Ties between inflected forms of the same word ("temperature" /
// "temperatura" for "temperatur") are accepted; other ties are not.
function closestAlbanianWord(word) {
  if (word.length < 4) return null;
  const limit = word.length >= 8 ? 2 : 1;
  let bestDistance = Infinity;
  let tied = [];
  for (const candidate of ALBANIAN_WORDS) {
    if (Math.abs(candidate.length - word.length) > limit) continue;
    const d = editDistance(word, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      tied = [candidate];
    } else if (d === bestDistance) {
      tied.push(candidate);
    }
  }
  if (bestDistance > limit || tied.length === 0) return null;
  if (tied.length === 1) return tied[0];
  const stem = Math.min(...tied.map((c) => c.length)) - 1;
  const sameWord = tied.every((c) => c.slice(0, stem) === tied[0].slice(0, stem));
  return sameWord ? tied.sort()[0] : null;
}

const isKnown = (norm) =>
  ALBANIAN_WORDS.has(norm) || MODEL_VOCABULARY.has(norm) || ENGLISH_NEGATORS.includes(norm) || /^\d+$/.test(norm);

// ---- Composing English ---------------------------------------------------------
function joinList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function phraseFor(item) {
  if (item.severe && !/^(high|severe)\b/.test(item.en)) return `severe ${item.en}`;
  return item.en;
}

// Only symptoms that are present are written; negated ones are left out.
function compose(items) {
  const unique = (list) => [...new Set(list)];
  const present = items.filter((i) => !i.negated);
  const feelings = unique(present.filter((i) => i.en.startsWith("feel ")).map(phraseFor));
  const positives = unique(present.filter((i) => i.kind !== "time" && !i.en.startsWith("feel ")).map(phraseFor));
  const times = unique(present.filter((i) => i.kind === "time").map((i) => i.en));

  const sentences = [];
  if (positives.length) {
    sentences.push(`I have ${joinList(positives)}${times.length ? ` ${times.join(" ")}` : ""}.`);
  }
  for (const f of feelings) sentences.push(`I ${f}.`);
  return sentences.join(" ");
}

// ---- Main entry ------------------------------------------------------------------
export function translateSymptoms(text) {
  const result = {
    status: "empty",
    english: "",
    items: [],
    unknown: [],
    corrections: [],
    negatedPhrases: [],
    excluded: [],
    uncertainWords: [],
    reasons: [],
  };
  if (!text.trim()) return result;

  const tokens = tokenize(text);
  const words = tokens.filter((t) => t.type === "word");

  // No Albanian-only word at all: treat as English and send it unchanged.
  // One-letter words ("I", "a", Albanian "e"/"i") are ignored here, as TF-IDF
  // ignores them too.
  if (!words.some((w) => w.norm.length > 1 && ALBANIAN_ONLY.has(w.norm))) {
    return { ...result, status: "english", english: text.trim() };
  }

  // Correct likely typos (unknown words one or two letters away from a known word).
  for (const w of words) {
    if (w.norm.length < 2 || isKnown(w.norm)) continue;
    const fix = closestAlbanianWord(w.norm);
    if (fix) {
      result.corrections.push({ from: w.surface, to: fix, symptom: SYMPTOM_WORDS.has(fix) });
      w.norm = fix;
    }
  }

  const items = result.items;
  const reasons = new Set();
  let negated = false;
  let negationHasSymptom = false;
  let severe = false;
  let painContext = false;
  let englishRun = [];

  const isNegator = (w) => NEGATORS.includes(w) || ENGLISH_NEGATORS.includes(w);

  // A negation must cover at least one recognised symptom before it ends.
  const closeNegation = () => {
    if (negated && !negationHasSymptom) reasons.add("negationUnclear");
    negated = false;
    negationHasSymptom = false;
  };

  const addSymptom = (item) => {
    items.push(item);
    if (item.negated) {
      negationHasSymptom = true;
      result.negatedPhrases.push(item.sq);
      result.excluded.push({ sq: item.sq, en: phraseFor(item) });
    }
  };

  const flushEnglish = () => {
    if (englishRun.length) {
      const words = englishRun.join(" ");
      addSymptom({ kind: "english", sq: words, en: words, negated, severe: false });
      englishRun = [];
    }
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.type !== "word") {
      flushEnglish();
      if (tok.type === "stop") {
        closeNegation();
        painContext = false;
      }
      continue;
    }
    const w = tok.norm;
    const prev = tokens[i - 1]?.type === "word" ? tokens[i - 1].norm : null;
    const next = tokens[i + 1]?.norm;
    const next2 = tokens[i + 2]?.norm;

    // Durations: "prej 3 ditësh", "që nga dje".
    if ((w === "prej" || w === "qe") && (/^\d+$/.test(next ?? "") || NUMBER_WORDS[next]) && DURATION_UNITS[next2]) {
      flushEnglish();
      const n = /^\d+$/.test(next) ? Number(next) : NUMBER_WORDS[next];
      items.push({ kind: "time", en: `for ${n} ${DURATION_UNITS[next2]}${n === 1 ? "" : "s"}`, negated: false });
      i += 2;
      continue;
    }
    if ((w === "qe" && next === "nga" && next2 === "dje") || ((w === "qe" || w === "nga") && next === "dje")) {
      flushEnglish();
      items.push({ kind: "time", en: "since yesterday", negated: false });
      i += w === "qe" && next === "nga" ? 2 : 1;
      continue;
    }

    // Longest dictionary phrase starting here (some contain "nuk", e.g.
    // "nuk kam oreks", and are symptoms rather than negations).
    const match = phraseCandidates(w).find((entry) =>
      entry.tokens.every((t, k) => tokens[i + k]?.type === "word" && sameToken(tokens[i + k].norm, t))
    );
    if (match) {
      flushEnglish();
      const span = tokens.slice(i, i + match.tokens.length).map((t) => t.surface).join(" ");
      // Phrases like "nuk kam oreks" carry their own "nuk" and describe a
      // present symptom; they end any earlier negation instead of joining it.
      const selfNegating = match.tokens.some((t) => NEGATORS.includes(t));
      if (selfNegating) closeNegation();
      addSymptom({
        kind: "symptom",
        sq: span,
        en: match.en,
        negated: selfNegating ? false : negated,
        severe: severe || Boolean(match.severe),
      });
      severe = false;
      painContext = PAIN_PHRASES.has(match.en);
      i += match.tokens.length - 1;
      continue;
    }

    // A bare body part right after a pain phrase: "më dhemb koka dhe barku".
    if (painContext && BODY_PART_PAIN.has(w)) {
      flushEnglish();
      addSymptom({ kind: "symptom", sq: tok.surface, en: BODY_PART_PAIN.get(w), negated, severe });
      continue;
    }

    if (UNCERTAINTY_WORDS.includes(w)) {
      if (!result.uncertainWords.includes(tok.surface)) result.uncertainWords.push(tok.surface);
      reasons.add("uncertain");
      continue;
    }
    // "jo vetëm kollë" = "not only cough": the cough is present.
    if (NEGATION_CANCELLERS.includes(w) && prev && isNegator(prev)) {
      negated = false;
      negationHasSymptom = false;
      continue;
    }
    if (isNegator(w)) {
      flushEnglish();
      if (!negated) {
        negated = true;
        negationHasSymptom = false;
      }
      continue;
    }
    if (POSITIVE_VERBS.includes(w)) {
      flushEnglish();
      if (!(prev && isNegator(prev))) closeNegation();
      continue;
    }
    if (SENTENCE_BREAKS.includes(w)) {
      flushEnglish();
      closeNegation();
      continue;
    }
    if (CLAUSE_BREAKS.includes(w)) {
      flushEnglish();
      continue;
    }
    if (INTENSIFIERS.includes(w)) {
      severe = true;
      continue;
    }
    if (STRUCTURE_WORDS.has(w) || /^\d+$/.test(w) || w.length < 2) continue;

    // English words the model knows (mixed Albanian/English text).
    if (MODEL_VOCABULARY.has(w)) {
      if (!ENGLISH_STOP.has(w)) englishRun.push(w);
      continue;
    }

    flushEnglish();
    if (!result.unknown.includes(tok.surface)) result.unknown.push(tok.surface);
  }
  flushEnglish();
  closeNegation();

  result.english = compose(items);
  const present = items.some((i) => (i.kind === "symptom" || i.kind === "english") && !i.negated);

  if (result.unknown.length) reasons.add("unknown");
  if (!present) reasons.add(result.excluded.length ? "onlyNegated" : "noSymptom");
  result.reasons = [...reasons];

  if (result.reasons.length) result.status = "unclear";
  else if (result.corrections.some((c) => c.symptom)) result.status = "confirm";
  else result.status = "ok";

  return result;
}
