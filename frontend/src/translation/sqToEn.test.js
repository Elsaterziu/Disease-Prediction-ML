// Tests for the Albanian -> English symptom translator.
//
// These check that the TRANSLATOR keeps the meaning of each Albanian
// sentence (every expected English text was checked by hand). They do NOT
// measure the model's accuracy for Albanian patients.

import { describe, expect, it } from "vitest";
import { SYMPTOM_CATEGORIES } from "../data/symptomCatalog";
import { buildSymptomDescription } from "../utils/symptomText";
import vocabulary from "./modelVocabulary.json";
import { BODY_PARTS, SYMPTOM_PHRASES } from "./sqMedicalDictionary";
import { translateSymptoms } from "./sqToEn";

const VOCAB = new Set(vocabulary);

// [category, Albanian input, expected status, expected English, extra checks]
const CASES = [
  // A. Common symptoms
  ["common", "Kam temperaturë, dhimbje koke dhe kollë.", "ok", "I have fever, headache and cough."],
  ["common", "Kam të përziera dhe të vjella.", "ok", "I have nausea and vomiting."],
  ["common", "Kam diarre dhe dhimbje barku.", "ok", "I have diarrhea and stomach pain."],
  ["common", "Kam skuqje të lëkurës dhe kruajtje.", "ok", "I have skin rash and itching."],
  ["common", "Kam dhimbje nyjesh dhe nyje të enjtura.", "ok", "I have joint pain and swollen joints."],
  ["common", "Kam teshtitje dhe rrjedhje hundësh.", "ok", "I have sneezing and runny nose."],
  ["common", "Kam marramendje dhe shikim të turbullt.", "ok", "I have dizziness and blurred vision."],
  ["common", "Kam urinim të shpeshtë dhe djegie gjatë urinimit.", "ok", "I have frequent urination and burning when urinating."],

  // B. Full sentences
  ["sentence", "Prej dy ditësh kam temperaturë të lartë, më dhemb fyti dhe kollitem shumë.", "ok", "I have high fever, sore throat and cough for 2 days."],
  ["sentence", "Më dhemb koka dhe barku prej 3 ditësh.", "ok", "I have headache and stomach pain for 3 days."],
  ["sentence", "Jam e lodhur, kam humbur peshë dhe kam etje të madhe.", "ok", "I have fatigue, weight loss and excessive thirst."],
  ["sentence", "Që nga dje kam ethe dhe të dridhura gjatë natës.", "ok", "I have fever and chills since yesterday."],
  ["sentence", "Kam dhimbje të forta koke dhe më vjen për të vjellë.", "ok", "I have severe headache and nausea."],
  ["sentence", "Lëkura më kruhet dhe kam njolla të kuqe në lëkurë.", "ok", "I have itching and red spots."],
  ["sentence", "Kam kollë të thatë dhe vështirësi në frymëmarrje.", "ok", "I have dry cough and shortness of breath."],
  ["sentence", "Kam dhimbje gjoksi dhe zemra më rreh shpejt.", "ok", "I have chest pain and palpitations."],

  // C. Synonyms and Kosovo expressions
  ["dialect", "Kam zjarrmi dhe kollë.", "ok", "I have fever and cough."],
  ["dialect", "Kom temperaturë të naltë.", "ok", "I have high fever."],
  ["dialect", "Ma dhemb koka shumë.", "ok", "I have headache."],
  ["dialect", "M'dhemb fyti dhe kollem.", "ok", "I have sore throat and cough."],
  ["dialect", "Jam i lodhun dhe nuk më zën gjumi.", "ok", "I have fatigue and trouble sleeping."],
  ["dialect", "Më janë zënë hundët dhe teshtij shpesh.", "ok", "I have congestion and sneezing."],
  ["dialect", "Më vjen me vjell dhe kam bark të fryrë.", "ok", "I have nausea and bloating."],
  ["dialect", "Kam kabzllëk prej një jave.", "ok", "I have constipation for 1 week."],
  ["dialect", "Më mardhin dhe kam temperaturë.", "ok", "I have chills and fever."],
  ["dialect", "Nuk ndihem mirë dhe kam dhimbje trupi.", "ok", "I have body pain. I feel unwell."],

  // D. Negation: negated symptoms are left out of the model text
  ["negation", "Nuk kam temperaturë.", "unclear", "", { excluded: ["fever"], reasons: ["onlyNegated"] }],
  ["negation", "S'kam temperaturë.", "unclear", "", { excluded: ["fever"], reasons: ["onlyNegated"] }],
  ["negation", "Kam kollë, por nuk kam temperaturë.", "ok", "I have cough.", { excluded: ["fever"] }],
  ["negation", "Kam dhimbje koke pa temperaturë.", "ok", "I have headache.", { excluded: ["fever"] }],
  ["negation", "Nuk kam as temperaturë as kollë.", "unclear", "", { excluded: ["fever", "cough"], reasons: ["onlyNegated"] }],
  ["negation", "Kam rrjedhje hundësh, nuk kam kollë dhe nuk kam temperaturë.", "ok", "I have runny nose.", { excluded: ["cough", "fever"] }],
  ["negation", "Nuk kam oreks.", "ok", "I have loss of appetite.", { excluded: [] }],
  ["negation", "Nuk kam temperaturë dhe nuk kam oreks.", "ok", "I have loss of appetite.", { excluded: ["fever"] }],
  ["negation", "Jo vetëm kollë, kam edhe temperaturë.", "ok", "I have cough and fever.", { excluded: [] }],
  ["negation", "Nuk e di.", "unclear", "", { reasons: ["negationUnclear"] }],
  ["negation", "Kam kollë. Temperaturë nuk kam.", "unclear", "I have cough and fever.", { reasons: ["negationUnclear"] }],
  ["negation", "Kam kollë but no fever", "ok", "I have cough.", { excluded: ["fever"] }],

  // E. Small spelling mistakes and missing ë/ç
  ["spelling", "Kam temperatur dhe koll", "confirm", "I have fever and cough."],
  ["spelling", "Kam marramndje", "confirm", "I have dizziness."],
  ["spelling", "Kam dhimbje koek dhe temperture", "confirm", "I have headache and fever."],
  ["spelling", "Kam te perzjera", "confirm", "I have nausea."],
  ["spelling", "Kam temperature te larte, dhimbje koke dhe te perziera", "ok", "I have high fever, headache and nausea."],
  ["spelling", "KAM KOLLË DHE TEMPERATURË", "ok", "I have cough and fever."],

  // F. Mixed Albanian / English
  ["mixed", "Kam fever dhe sore throat", "ok", "I have fever and sore throat."],
  ["mixed", "Kam kollë and runny nose", "ok", "I have cough and runny nose."],
  ["mixed", "Kam headache dhe të përziera", "ok", "I have headache and nausea."],
  ["mixed", "I have a high fever and a cough.", "english", "I have a high fever and a cough."],

  // G. Not understood: must ask for clarification instead of predicting
  ["unknown", "Kam gripi dhe kollë.", "unclear", "I have cough.", { unknown: ["gripi"], reasons: ["unknown"] }],
  ["unknown", "Më ka zënë një sëmundje e çuditshme.", "unclear", "", { reasons: ["unknown"] }],
  ["unknown", "Kam qwzx plorb.", "unclear", "", { unknown: ["qwzx", "plorb"] }],
  ["unknown", "Ndoshta kam temperaturë.", "unclear", "I have fever.", { reasons: ["uncertain"] }],
  ["unknown", "Kam dhimbje veshi.", "unclear", "I have pain.", { unknown: ["veshi"] }],
  // Translated literally (urination OR bowel movements), never interpreted.
  ["sentence", "Shkoj shpesh në banjo.", "ok", "I have a frequent need to go to the bathroom."],
  ["unknown", "Kam shkuar te mjeku dje.", "unclear", "", { reasons: ["noSymptom"] }],
  ["unknown", "Jam i dobët.", "unclear", "", { unknown: ["dobët"] }],
];

describe("Albanian test sentences (translator behaviour, not model accuracy)", () => {
  it("has at least 50 sentences across 7 categories", () => {
    expect(CASES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(CASES.map((c) => c[0])).size).toBe(7);
  });

  it.each(CASES)("[%s] %s", (_category, input, status, english, extra = {}) => {
    const r = translateSymptoms(input);
    expect(r.status).toBe(status);
    expect(r.english).toBe(english);
    if (extra.excluded) expect(r.excluded.map((e) => e.en)).toEqual(extra.excluded);
    if (extra.unknown) expect(r.unknown).toEqual(extra.unknown);
    if (extra.reasons) for (const reason of extra.reasons) expect(r.reasons).toContain(reason);
  });
});

describe("negation safety", () => {
  it("never sends a negated symptom to the model", () => {
    for (const [, input] of CASES) {
      const r = translateSymptoms(input);
      for (const e of r.excluded) expect(r.english).not.toContain(e.en);
    }
  });

  it("blocks when only absent symptoms are mentioned", () => {
    const r = translateSymptoms("Nuk kam kollë dhe nuk kam temperaturë.");
    expect(r.status).toBe("unclear");
    expect(r.english).toBe("");
  });

  it("lists the original Albanian words that were negated", () => {
    expect(translateSymptoms("Kam kollë, por nuk kam temperaturë.").negatedPhrases).toEqual(["temperaturë"]);
  });
});

describe("phrases reported in the practical system test", () => {
  it.each([
    ["Më djeg kur urinoj dhe më duhet të shkoj shpesh në tualet.", "I have burning when urinating and a frequent need to go to the bathroom."],
    ["Kam kollë me gëlbazë të verdhë, temperaturë dhe dhimbje gjoksi.", "I have cough, yellow phlegm, fever and chest pain."],
    ["Kam skuqje që më kruhet në krahë, por nuk kam temperaturë.", "I have skin rash and itching."],
    ["Kam skuqje dhe kruajtje në lëkurë, por nuk kam temperaturë.", "I have skin rash and itching."],
    ["Kam dhimbje barku dhe më është prerë oreksi.", "I have stomach pain and loss of appetite."],
  ])("%s", (sq, en) => {
    const r = translateSymptoms(sq);
    expect(r.status).toBe("ok");
    expect(r.english).toBe(en);
  });

  it("does not interpret 'tualet' as urination or diarrhea", () => {
    const r = translateSymptoms("Shkoj shpesh në tualet.");
    expect(r.english).not.toMatch(/urinat|diarr/);
  });

  it("a location word alone is not a symptom", () => {
    expect(translateSymptoms("Kam lëkurë.").reasons).toContain("noSymptom");
  });
});

describe("equivalence with English", () => {
  it.each([
    ["Kam temperaturë, dhimbje koke dhe kollë.", "I have fever, headache and cough."],
    ["Kam të përziera dhe të vjella.", "I have nausea and vomiting."],
    ["Kam temperature, dhimbje koke dhe kolle", "I have fever, headache and cough."],
    ["Kam temperaturë, dhimbje koke dhe kollë, por nuk kam diarre.", "I have fever, headache and cough."],
  ])("%s -> same model input as %s", (sq, en) => {
    expect(translateSymptoms(sq).english).toBe(en);
  });
});

describe("dictionary", () => {
  it("only produces English words the model knows", () => {
    const outputs = [...SYMPTOM_PHRASES.map(([, en]) => en), ...BODY_PARTS.map(([, en]) => en), "severe", "have", "for", "days", "since", "yesterday"];
    const unknown = outputs.flatMap((p) => p.toLowerCase().match(/\b\w\w+\b/g).filter((w) => !VOCAB.has(w)));
    expect([...new Set(unknown)]).toEqual([]);
  });

  it("does not translate ambiguous words", () => {
    for (const word of ["fshikëza", "nxirje", "zihem", "grip", "ftohje"]) {
      expect(translateSymptoms(`Kam ${word}.`).status).toBe("unclear");
    }
  });
});

describe("symptom catalog in Albanian", () => {
  const all = SYMPTOM_CATEGORIES.flatMap((c) => c.symptoms);

  it("has Albanian text for all 52 symptoms", () => {
    expect(all).toHaveLength(52);
    for (const s of all) expect(s.sq.label && s.sq.phrase).toBeTruthy();
  });

  it.each(all.map((s) => [s.id, s.sq.phrase]))("%s: 'Kam %s.' translates cleanly", (_id, phrase) => {
    const r = translateSymptoms(`Kam ${phrase}.`);
    expect(r.status).toBe("ok");
    expect(r.corrections).toEqual([]);
    expect(r.english.startsWith("I have ")).toBe(true);
  });

  it("an Albanian draft with every symptom translates without problems", () => {
    const draft = buildSymptomDescription(all.map((s) => s.id), "", "sq");
    expect(translateSymptoms(draft).status).toBe("ok");
  });
});
