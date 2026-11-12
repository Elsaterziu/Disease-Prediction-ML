import {
  ArrowRight,
  Check,
  Lightbulb,
  ListChecks,
  PenLine,
  Plus,
  ScanText,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import OutcomeGrid from "../components/charts/OutcomeGrid";
import { Eyebrow } from "../components/ui";
import {
  DATASET,
  FINAL_TEST,
  TEST_CLASSIFICATION_REPORT,
} from "../data/researchResults";
import { SYMPTOMS_BY_ID } from "../data/symptomCatalog";
import { diseaseName } from "../i18n/diseaseNames";
import { useLanguage } from "../i18n/languageContext";
import { pct } from "../utils/format";
import { buildSymptomDescription } from "../utils/symptomText";
import "./Home.css";

// Purely illustrative sentence for the hero animation. No prediction is
// shown; it demonstrates that the model works by weighting words. It stays
// in English in both languages because the model reads English.
const DEMO_TOKENS = [
  "I", "have", "had", "a", "high", { w: "fever" }, "and", { w: "chills" },
  "for", "three", "days,", "with", "a", "pounding", { w: "headache" },
  "and", "aching", { w: "joints." },
];
const DEMO_WORDS = DEMO_TOKENS.filter((t) => typeof t !== "string").map((t) =>
  t.w.replace(/\W/g, "")
);
const DEMO_SENTENCE = DEMO_TOKENS.map((token) =>
  typeof token === "string"
    ? token
    : { ...token, order: DEMO_WORDS.indexOf(token.w.replace(/\W/g, "")) }
);

const STEP_ICONS = [PenLine, ScanText, Lightbulb];
const PREVIEW_CHIPS = ["fever", "chills", "headache", "cough", "joint-pain", "rash"];
const PREVIEW_SELECTED = ["fever", "chills", "headache"];

const COPY = {
  en: {
    eyebrow: "Text-based symptom matching",
    h1a: "Describe how you feel.",
    h1b: "See what the words point to.",
    lead: `Symptom2Disease reads a plain-English description of your symptoms, matches it to the closest of ${DATASET.classes} conditions, and shows you which words shaped that match.`,
    start: "Start a symptom check",
    how: "How it works",
    facts: ["Test accuracy", "Conditions", "Explanations", "Word-level"],
    readingTitle: "How a description is read",
    illustration: "Illustration",
    picked: "Words picked up",
    howEyebrow: "How it works",
    howTitle: "Three steps. No account needed.",
    steps: [
      ["Describe", "Write in your own words, or build a description from 52 common symptoms."],
      ["Match", "A linear SVM trained on patient-style descriptions compares your wording with 24 conditions."],
      ["Understand", "See the closest match and, if you want, the words that pushed towards or away from it."],
    ],
    waysEyebrow: "Two ways in",
    waysTitle: "Write it freely, or build it from a list.",
    waysText:
      "Not sure how to put it into words? Pick symptoms from categories like Respiratory, Digestive or Skin and Symptom2Disease drafts a sentence for you. You can edit it before anything is analysed.",
    waysList: [
      "Free-text input up to 5,000 characters",
      "52 searchable symptoms in 7 categories",
      "Always review the exact text that is sent",
    ],
    waysLink: "Open the symptom check",
    previewHead: "Select symptoms",
    drafted: "Drafted for you",
    coverageEyebrow: "Coverage",
    coverageTitle: `${DATASET.classes} conditions it can recognise`,
    coverageText: "The model always answers with one of these. If a condition isn’t on the list, Symptom2Disease cannot name it.",
    perfEyebrow: "Measured, not assumed",
    perfTitle: "accuracy on descriptions it had never seen",
    perfText: `After choosing and tuning the model, it was tested once on ${FINAL_TEST.testSamples} held-out descriptions. ${FINAL_TEST.correct} were matched correctly. Macro F1, which weighs every condition equally, was ${pct(FINAL_TEST.macroF1)}.`,
    perfCaveat:
      "These descriptions come from the same dataset and writing style as the training data, so real-world wording may perform worse.",
    perfLink: "Explore model comparison",
    useEyebrow: "Use it wisely",
    useTitle: "What Symptom2Disease is, and what it isn’t.",
    isTitle: "It is",
    is: [
      "A way to explore how symptom wording relates to conditions",
      "Open about the exact words behind each result",
      "Evaluated on text it never saw during training",
    ],
    isntTitle: "It isn’t",
    isnt: [
      "A diagnosis, medical advice or a treatment plan",
      "Aware of conditions beyond its 24 labels",
      "Able to judge severity, urgency or confidence",
    ],
    methodLink: "Read about the methodology",
    ctaTitle: "Curious what your description points to?",
  },
  sq: {
    eyebrow: "Përputhje e simptomave nga teksti",
    h1a: "Përshkruani si ndiheni.",
    h1b: "Shihni nga çfarë drejtohen fjalët.",
    lead: `Symptom2Disease lexon përshkrimin e simptomave tuaja në shqip ose anglisht, e përputh me më të afërtën nga ${DATASET.classes} sëmundje dhe ju tregon cilat fjalë ndikuan në këtë përputhje.`,
    start: "Fillo kontrollin e simptomave",
    how: "Si funksionon",
    facts: ["Saktësia në test", "Sëmundje", "Shpjegime", "Për çdo fjalë"],
    readingTitle: "Si lexohet një përshkrim",
    illustration: "Ilustrim",
    picked: "Fjalët e kapura",
    howEyebrow: "Si funksionon",
    howTitle: "Tre hapa. Pa llogari.",
    steps: [
      ["Përshkruani", "Shkruani me fjalët tuaja ose ndërtoni përshkrimin nga 52 simptoma të zakonshme."],
      ["Përputhja", "Një SVM linear, i trajnuar me përshkrime pacientësh, i krahason fjalët tuaja me 24 sëmundje."],
      ["Kuptoni", "Shihni përputhjen më të afërt dhe, nëse doni, fjalët që e shtynë rezultatin drejt saj ose larg saj."],
    ],
    waysEyebrow: "Dy mënyra",
    waysTitle: "Shkruajeni lirshëm ose ndërtojeni nga lista.",
    waysText:
      "Nuk jeni i sigurt si ta shprehni? Zgjidhni simptoma nga kategori si Frymëmarrja, Sistemi tretës ose Lëkura dhe Symptom2Disease harton një fjali për ju. Mund ta ndryshoni para se të analizohet.",
    waysList: [
      "Tekst i lirë deri në 5,000 karaktere",
      "52 simptoma të kërkueshme në 7 kategori",
      "Rishikoni gjithmonë tekstin e saktë që dërgohet",
    ],
    waysLink: "Hap kontrollin e simptomave",
    previewHead: "Zgjidh simptomat",
    drafted: "Hartuar për ju",
    coverageEyebrow: "Mbulimi",
    coverageTitle: `${DATASET.classes} sëmundje që mund t’i njohë`,
    coverageText: "Modeli përgjigjet gjithmonë me njërën prej tyre. Nëse një sëmundje nuk është në listë, Symptom2Disease nuk mund ta emërtojë.",
    perfEyebrow: "E matur, jo e supozuar",
    perfTitle: "saktësi në përshkrime që modeli nuk i kishte parë kurrë",
    perfText: `Pas zgjedhjes dhe optimizimit, modeli u testua një herë me ${FINAL_TEST.testSamples} përshkrime të veçuara. ${FINAL_TEST.correct} u përputhën saktë. Macro F1, që i jep peshë të barabartë çdo sëmundjeje, ishte ${pct(FINAL_TEST.macroF1)}.`,
    perfCaveat:
      "Këto përshkrime vijnë nga i njëjti dataset dhe stil me të dhënat e trajnimit, prandaj me gjuhë reale rezultati mund të jetë më i dobët. Saktësia për tekste të përkthyera nga shqipja nuk është matur.",
    perfLink: "Shiko krahasimin e modeleve",
    useEyebrow: "Përdoreni me kujdes",
    useTitle: "Çfarë është Symptom2Disease dhe çfarë nuk është.",
    isTitle: "Është",
    is: [
      "Një mënyrë për të parë si lidhen fjalët e simptomave me sëmundjet",
      "I hapur për fjalët e sakta pas çdo rezultati",
      "I vlerësuar me tekste që nuk i pa gjatë trajnimit",
    ],
    isntTitle: "Nuk është",
    isnt: [
      "Diagnozë, këshillë mjekësore ose plan trajtimi",
      "I aftë të njohë sëmundje jashtë 24 etiketave të tij",
      "I aftë të gjykojë rëndësinë, urgjencën ose besueshmërinë",
    ],
    methodLink: "Lexoni për metodologjinë",
    ctaTitle: "Doni të shihni me çfarë përputhet përshkrimi juaj?",
  },
};

function Home() {
  const { lang } = useLanguage();
  const c = COPY[lang];
  const conditions = TEST_CLASSIFICATION_REPORT.map((row) => diseaseName(row.label, lang)).sort((a, b) =>
    a.localeCompare(b, lang)
  );
  const chipLabel = (id) => (lang === "sq" ? SYMPTOMS_BY_ID[id].sq.label : SYMPTOMS_BY_ID[id].label);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <h1>
              {c.h1a}
              <br />
              <span>{c.h1b}</span>
            </h1>
            <p className="hero-lead">{c.lead}</p>
            <div className="hero-actions">
              <Link to="/analysis" className="btn btn-accent btn-lg">
                {c.start}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a href="#how" className="btn btn-ghost btn-lg">
                {c.how}
              </a>
            </div>

            <dl className="hero-facts">
              <div>
                <dt>{c.facts[0]}</dt>
                <dd>{pct(FINAL_TEST.accuracy, 1)}</dd>
              </div>
              <div>
                <dt>{c.facts[1]}</dt>
                <dd>{DATASET.classes}</dd>
              </div>
              <div>
                <dt>{c.facts[2]}</dt>
                <dd>{c.facts[3]}</dd>
              </div>
            </dl>
          </div>

          <div className="reading-card" aria-hidden="true">
            <div className="reading-card-head">
              <span className="reading-dot" />
              {c.readingTitle}
              <span className="reading-tag">{c.illustration}</span>
            </div>
            <p className="reading-text" lang="en">
              {DEMO_SENTENCE.map((token, i) => {
                if (typeof token === "string") return <span key={i}>{token} </span>;
                return (
                  <span key={i}>
                    <mark style={{ animationDelay: `${0.6 + token.order * 0.45}s` }}>{token.w}</mark>{" "}
                  </span>
                );
              })}
            </p>
            <div className="reading-scan" />
            <div className="reading-weights">
              <span className="reading-label">{c.picked}</span>
              <div className="reading-words">
                {DEMO_WORDS.map((word, i) => (
                  <span key={word} style={{ animationDelay: `${0.8 + i * 0.45}s` }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="section how">
        <div className="container">
          <div className="section-intro">
            <Eyebrow>{c.howEyebrow}</Eyebrow>
            <h2>{c.howTitle}</h2>
          </div>

          <ol className="steps">
            {c.steps.map(([title, text], i) => {
              const Icon = STEP_ICONS[i];
              return (
                <li key={title}>
                  <div className="step-marker">
                    <Icon size={22} aria-hidden="true" />
                    <span className="step-num">0{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ---------- Two ways ---------- */}
      <section className="section ways">
        <div className="container ways-grid">
          <div className="ways-copy">
            <Eyebrow>{c.waysEyebrow}</Eyebrow>
            <h2>{c.waysTitle}</h2>
            <p>{c.waysText}</p>
            <ul className="check-list">
              {c.waysList.map((item) => (
                <li key={item}>
                  <Check size={18} aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
            <Link to="/analysis" className="text-link">
              {c.waysLink} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="ways-preview" aria-hidden="true">
            <div className="preview-head">
              <ListChecks size={16} /> {c.previewHead}
            </div>
            <div className="preview-chips">
              {PREVIEW_CHIPS.map((id) => (
                <span key={id} className={PREVIEW_SELECTED.includes(id) ? "pchip on" : "pchip"}>
                  {PREVIEW_SELECTED.includes(id) ? <Check size={13} /> : <Plus size={13} />}
                  {chipLabel(id)}
                </span>
              ))}
            </div>
            <div className="preview-arrow">
              <ArrowRight size={16} /> {c.drafted}
            </div>
            <p className="preview-text">{buildSymptomDescription(PREVIEW_SELECTED, "", lang)}</p>
          </div>
        </div>
      </section>

      {/* ---------- Conditions ---------- */}
      <section className="section conditions">
        <div className="container">
          <div className="section-intro center">
            <Eyebrow>{c.coverageEyebrow}</Eyebrow>
            <h2>{c.coverageTitle}</h2>
            <p>{c.coverageText}</p>
          </div>
          <ul className="condition-cloud">
            {conditions.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Performance ---------- */}
      <section className="section performance">
        <div className="container perf-grid">
          <div className="perf-copy">
            <Eyebrow>{c.perfEyebrow}</Eyebrow>
            <h2>
              <span className="perf-number">{pct(FINAL_TEST.accuracy)}</span>
              {c.perfTitle}
            </h2>
            <p>{c.perfText}</p>
            <p className="perf-caveat">{c.perfCaveat}</p>
            <Link to="/models" className="text-link">
              {c.perfLink} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <OutcomeGrid correct={FINAL_TEST.correct} incorrect={FINAL_TEST.incorrect} />
        </div>
      </section>

      {/* ---------- Is / isn't ---------- */}
      <section className="section honesty">
        <div className="container">
          <div className="section-intro">
            <Eyebrow>{c.useEyebrow}</Eyebrow>
            <h2>{c.useTitle}</h2>
          </div>
          <div className="honesty-grid">
            <div className="honesty-col is">
              <h3>{c.isTitle}</h3>
              <ul>
                {c.is.map((item) => (
                  <li key={item}>
                    <Check size={18} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="honesty-col isnt">
              <h3>{c.isntTitle}</h3>
              <ul>
                {c.isnt.map((item) => (
                  <li key={item}>
                    <X size={18} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link to="/methodology" className="text-link">
            {c.methodLink} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta-band">
        <div className="container cta-inner">
          <h2>{c.ctaTitle}</h2>
          <Link to="/analysis" className="btn btn-accent btn-lg">
            {c.start}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;
