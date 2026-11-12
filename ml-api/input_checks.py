"""Input checks applied to a description BEFORE it reaches TF-IDF + SVM.

The trained model and the TF-IDF vectorizer are not changed. This module only
decides which text is sent to them, or that nothing should be sent:

1. Medical terms ("pyrexia") are rewritten in plain words the model knows.
2. Symptoms are identified with a controlled vocabulary (symptom_lexicon.py).
3. Negated symptoms ("no fever") are found and removed from the text that is
   sent, so the bag-of-words model does not count them as present. The rest of
   the text is kept word for word.
4. The description is classed as:
     "valid"               - at least one specific symptom is present
     "no_symptoms"         - nothing that looks like a symptom
     "needs_clarification" - see `reasons`

Reasons for "needs_clarification":
    "negationUnclear"  - it is not clear which symptoms are negated ("no fever and cough")
    "uncertain"        - a symptom is mentioned with doubt ("not sure if I have a fever")
    "onlyNegated"      - every symptom mentioned is absent
    "insufficient"     - only general words such as "sick", "pain" or "hurts"
    "conditionOnly"    - a condition name without symptoms ("I think I have diabetes")
    "unknownTerms"     - medical-looking terms that cannot be interpreted safely
"""

import re

import symptom_lexicon as lex

TOKEN_RE = re.compile(r"[a-z0-9]+(?:'[a-z]+)?|[.;:!?,]")
BREAK_PUNCT = {".", ";", ":", "!", "?"}


def _tokenize(text):
    # Same length as the input, so character offsets map back to the text.
    lowered = text.lower().replace("’", "'").replace("`", "'")
    return [(m.group(0), m.start(), m.end()) for m in TOKEN_RE.finditer(lowered)]


def _phrase_tokens(phrase):
    return tuple(t for t, _, _ in _tokenize(phrase) if t not in BREAK_PUNCT and t != ",")


def _build_index(entries):
    """entries: (phrase, kind, concept) -> {first token: [(tokens, kind, concept)]}, longest first."""
    index = {}
    for phrase, kind, concept in entries:
        tokens = _phrase_tokens(phrase)
        index.setdefault(tokens[0], []).append((tokens, kind, concept))
    for items in index.values():
        items.sort(key=lambda item: len(item[0]), reverse=True)
    return index


_SPECIFIC_WORDS = {p for phrases in lex.SPECIFIC_PHRASES.values() for p in phrases}
_SYMPTOM_INDEX = _build_index(
    [(p, "specific", c) for c, phrases in lex.SPECIFIC_PHRASES.items() for p in phrases]
    + [(p, "general", "general") for p in lex.GENERAL_PHRASES if p not in _SPECIFIC_WORDS]
    + [(p, "condition", p) for p in lex.CONDITION_NAMES]
)
_PRESENT_NEGATIVE_INDEX = _build_index([(p, "present", p) for p in lex.PRESENT_NEGATIVE_PHRASES])
_UNCERTAIN_INDEX = _build_index([(p, "uncertain", p) for p in lex.UNCERTAIN_PHRASES])
_MEDICAL_RE = re.compile(
    r"\b(" + "|".join(sorted(map(re.escape, lex.MEDICAL_TERMS), key=len, reverse=True)) + r")\b",
    re.IGNORECASE,
)
_LEXICON_WORDS = (
    {t for tokens in _SYMPTOM_INDEX.values() for entry in tokens for t in entry[0]}
    | set(lex.BODY_PARTS) | lex.BODY_SYMPTOM_WORDS | lex.URINATION_WORDS
)


def _match_at(index, words, i):
    for tokens, kind, concept in index.get(words[i], []):
        if tuple(words[i:i + len(tokens)]) == tokens:
            return tokens, kind, concept
    return None


def normalize_medical_terms(text):
    """Rewrites known medical terms in plain words. Returns (text, replacements)."""
    replacements = []

    def replace(match):
        term = match.group(0)
        plain, review, note = lex.MEDICAL_TERMS[term.lower()]
        if not any(r["term"].lower() == term.lower() for r in replacements):
            replacements.append({"term": term, "replacement": plain, "needsReview": review, "note": note})
        return f"\x00{plain}\x01"

    # Terms written one after another ("dysuria haematuria") become a list.
    marked = re.sub(r"\x01\s+\x00", ", ", _MEDICAL_RE.sub(replace, text))
    return marked.replace("\x00", "").replace("\x01", ""), replacements


def _clean(text):
    """Tidies the text after negated parts were removed ("often, but and ." -> "often.")."""
    patterns = [
        (r"\s+([,.;:!?])", r"\1"),
        (r"([.!?])(?:\s*[.!?;,])+", r"\1"),
        (r"\b(?:and|but|or|nor|with|while|so|then|also)\s*(?=[,.;:!?]|$)", ""),
        (r"[,;:]+\s*(?=[.!?]|$)", ""),
        (r"^\s*(?:and|but|or|nor)\b\s*", ""),
        (r"([.!?;]\s+)(?:and|but|or|nor)\b\s*", r"\1"),
        (r",\s*,", ","),
        (r"\s{2,}", " "),
    ]
    previous = None
    while previous != text:
        previous = text
        for pattern, repl in patterns:
            text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
    text = text.strip(" ,;:")
    return text[:1].upper() + text[1:] if text else text


def analyze_input(text, vocabulary=frozenset()):
    """Analyses an English description. `vocabulary` is the model's TF-IDF vocabulary."""
    normalized, medical_terms = normalize_medical_terms(text.strip())
    tokens = _tokenize(normalized)
    words = [t for t, _, _ in tokens]
    n = len(words)

    # Clause number of every token; co-occurrence and negation stay inside a clause.
    clause, clause_of = 0, []
    for w in words:
        if w in BREAK_PUNCT or w in lex.CLAUSE_BREAK_WORDS:
            clause += 1
        clause_of.append(clause)

    # ---- 1. Phrase matches (longest first, no overlaps) -----------------------
    matches, owner = [], [None] * n
    shielded = set()  # tokens of "no appetite", "can't sleep", "doesn't go away"...
    i = 0
    while i < n:
        present = _match_at(_PRESENT_NEGATIVE_INDEX, words, i)
        if present:
            shielded.update(range(i, i + len(present[0])))
        found = _match_at(_SYMPTOM_INDEX, words, i)
        if found:
            tokens_, kind, concept = found
            match = {"kind": kind, "concept": concept, "positions": list(range(i, i + len(tokens_)))}
            matches.append(match)
            for k in match["positions"]:
                owner[k] = match
            i += len(tokens_)
            continue
        i += 1

    # ---- 2. Body part + symptom word in the same clause ("my knee hurts") -----
    def free_symptom_word(k, allowed):
        return words[k] in allowed and (owner[k] is None or owner[k]["kind"] == "general")

    for b in range(n):
        if owner[b] is not None:
            continue
        if words[b] in lex.BODY_PARTS:
            part = lex.BODY_PARTS[words[b]]
            allowed, concept = lex.BODY_SYMPTOM_WORDS, lex.BODY_CONCEPTS.get(part, f"{part}_symptom")
        elif words[b] in lex.URINATION_WORDS:
            allowed, concept = lex.URINATION_QUALIFIERS, "urinary_symptoms"
        else:
            continue
        candidates = [k for k in range(max(0, b - lex.WINDOW), min(n, b + lex.WINDOW + 1))
                      if k != b and clause_of[k] == clause_of[b] and free_symptom_word(k, allowed)]
        if not candidates:
            continue
        k = min(candidates, key=lambda c: abs(c - b))
        if owner[k] is not None:  # a general word becomes part of a specific symptom
            matches.remove(owner[k])
            for p in owner[k]["positions"]:
                owner[p] = None
        # "my body hurts" is still too general to match a condition.
        kind = "general" if concept == "body_symptom" else "specific"
        match = {"kind": kind, "concept": concept, "positions": sorted([b, k])}
        matches.append(match)
        owner[b] = owner[k] = match

    symptom_positions = {p for m in matches if m["kind"] in ("specific", "general") for p in m["positions"]}

    # ---- 3. Negation and uncertainty scopes -----------------------------------
    scopes, scope_of = [], [None] * n
    current, uncertain_active, uncertain_hits = None, False, []

    def close():
        nonlocal current
        current = None

    i = 0
    while i < n:
        w = words[i]
        nxt = words[i + 1] if i + 1 < n else ""
        if w in BREAK_PUNCT or w in lex.CLAUSE_BREAK_WORDS:
            close()
            uncertain_active = False
            i += 1
            continue
        if w == ",":
            if current is not None:
                rest = []
                for later in words[i + 1:]:
                    if later in BREAK_PUNCT or later in lex.CLAUSE_BREAK_WORDS:
                        break
                    rest.append(later)
                if not ({"or", "nor"} & set(rest)):
                    close()
            i += 1
            continue
        if i in shielded:
            i += 1
            continue
        unsure = _match_at(_UNCERTAIN_INDEX, words, i)
        if unsure:
            uncertain_active = True
            i += len(unsure[0])
            continue
        positive = ((w == "i" and nxt in lex.POSITIVE_VERBS) or w in lex.POSITIVE_STARTERS
                    or (w == "there" and nxt in {"is", "are"}) or (w == "and" and nxt in lex.POSITIVE_VERBS))
        if positive:
            close()
            i += 1
            continue
        is_negator = w in lex.NEGATORS or any(tuple(words[i:i + len(p)]) == p for p in lex.NEGATOR_PHRASES)
        if is_negator:
            if current is None:
                start = i
                while (start > 0 and words[start - 1] in lex.NEGATION_LEAD_WORDS
                       and clause_of[start - 1] == clause_of[i] and start - 1 not in symptom_positions):
                    start -= 1
                current = {"start": start, "last": i, "has_symptom": False, "and_pending": False,
                           "ambiguous": False}
                scopes.append(current)
            else:
                current["and_pending"] = False
            scope_of[i] = current
            i += 1
            continue
        if current is not None:
            if w == "and" and current["has_symptom"] and nxt not in lex.NEGATORS:
                current["and_pending"] = True
            scope_of[i] = current
            current["last"] = i
            if i in symptom_positions:
                current["has_symptom"] = True
                if current["and_pending"]:
                    current["ambiguous"] = True
        if uncertain_active and i in symptom_positions:
            uncertain_hits.append(i)
        i += 1

    def surface(positions):
        return normalized[tokens[positions[0]][1]:tokens[positions[-1]][2]]

    present, negated, conditions = [], [], []
    for m in sorted(matches, key=lambda m: m["positions"][0]):
        if m["kind"] == "condition":
            conditions.append(surface(m["positions"]))
            continue
        in_scope = [scope_of[p] is not None for p in m["positions"]]
        m["negated"] = all(in_scope)
        (negated if m["negated"] else present).append(m)

    # ---- 4. Text sent to the model: negated parts removed ---------------------
    removable = [s for s in scopes if s["has_symptom"] and not s["ambiguous"]]
    excluded, pieces, cursor = [], [], 0
    for s in removable:
        start, end = tokens[s["start"]][1], tokens[s["last"]][2]
        excluded.append(normalized[start:end])
        pieces.append(normalized[cursor:start])
        cursor = end
    pieces.append(normalized[cursor:])
    text_for_model = _clean("".join(pieces)) if removable else normalized

    uninterpreted = []
    for w in words:
        if (len(w) >= 6 and w not in vocabulary and w not in _LEXICON_WORDS
                and w.endswith(lex.MEDICAL_SUFFIXES) and w not in uninterpreted):
            uninterpreted.append(w)

    # ---- 5. Decision ----------------------------------------------------------
    specific_present = [m for m in present if m["kind"] == "specific"]
    general_present = [m for m in present if m["kind"] == "general"]
    reasons = []
    if any(s["ambiguous"] for s in scopes):
        reasons.append("negationUnclear")
    if uncertain_hits:
        reasons.append("uncertain")

    if reasons:
        status = "needs_clarification"
    elif specific_present:
        status = "valid"
    elif negated and not general_present:
        status, reasons = "needs_clarification", ["onlyNegated"]
    elif general_present:
        status, reasons = "needs_clarification", ["insufficient"]
    elif conditions:
        status, reasons = "needs_clarification", ["conditionOnly"]
    elif uninterpreted:
        status, reasons = "needs_clarification", ["unknownTerms"]
    else:
        status = "no_symptoms"

    return {
        "status": status,
        "reasons": reasons,
        "textForModel": text_for_model if status == "valid" else "",
        "normalizedText": normalized,
        "medicalTerms": medical_terms,
        "presentSymptoms": [surface(m["positions"]) for m in present],
        "negatedSymptoms": [surface(m["positions"]) for m in negated],
        "excludedText": excluded,
        "conditionMentions": conditions,
        "uninterpretedTerms": uninterpreted,
        "concepts": sorted({m["concept"] for m in specific_present}),
    }
