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
import { conditionName, pct } from "../utils/format";
import { buildSymptomDescription } from "../utils/symptomText";
import "./Home.css";

// Purely illustrative sentence for the hero animation. No prediction is
// shown; it demonstrates that the model works by weighting words.
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

const STEPS = [
  {
    icon: PenLine,
    title: "Describe",
    text: "Write in your own words, or build a description from 52 common symptoms.",
  },
  {
    icon: ScanText,
    title: "Match",
    text: "A linear SVM trained on patient-style descriptions compares your wording with 24 conditions.",
  },
  {
    icon: Lightbulb,
    title: "Understand",
    text: "See the closest match and, if you want, the words that pushed towards or away from it.",
  },
];

const PREVIEW_CHIPS = ["fever", "chills", "headache", "cough", "joint-pain", "rash"];
const PREVIEW_SELECTED = ["fever", "chills", "headache"];

const CONDITIONS = TEST_CLASSIFICATION_REPORT.map((row) => conditionName(row.label)).sort(
  (a, b) => a.localeCompare(b)
);

function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <Eyebrow>Text-based symptom matching</Eyebrow>
            <h1>
              Describe how you feel.
              <br />
              <span>See what the words point to.</span>
            </h1>
            <p className="hero-lead">
              Symptom2Disease reads a plain-English description of your symptoms,
              matches it to the closest of {DATASET.classes} conditions, and shows
              you which words shaped that match.
            </p>
            <div className="hero-actions">
              <Link to="/analysis" className="btn btn-accent btn-lg">
                Start a symptom check
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a href="#how" className="btn btn-ghost btn-lg">
                How it works
              </a>
            </div>

            <dl className="hero-facts">
              <div>
                <dt>Test accuracy</dt>
                <dd>{pct(FINAL_TEST.accuracy, 1)}</dd>
              </div>
              <div>
                <dt>Conditions</dt>
                <dd>{DATASET.classes}</dd>
              </div>
              <div>
                <dt>Explanations</dt>
                <dd>Word-level</dd>
              </div>
            </dl>
          </div>

          <div className="reading-card" aria-hidden="true">
            <div className="reading-card-head">
              <span className="reading-dot" />
              How a description is read
              <span className="reading-tag">Illustration</span>
            </div>
            <p className="reading-text">
              {DEMO_SENTENCE.map((token, i) => {
                if (typeof token === "string") return <span key={i}>{token} </span>;
                return (
                  <span key={i}>
                    <mark style={{ animationDelay: `${0.6 + token.order * 0.45}s` }}>
                      {token.w}
                    </mark>{" "}
                  </span>
                );
              })}
            </p>
            <div className="reading-scan" />
            <div className="reading-weights">
              <span className="reading-label">Words picked up</span>
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
            <Eyebrow>How it works</Eyebrow>
            <h2>Three steps. No account needed.</h2>
          </div>

          <ol className="steps">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title}>
                  <div className="step-marker">
                    <Icon size={22} aria-hidden="true" />
                    <span className="step-num">0{i + 1}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
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
            <Eyebrow>Two ways in</Eyebrow>
            <h2>Write it freely, or build it from a list.</h2>
            <p>
              Not sure how to put it into words? Pick symptoms from categories
              like Respiratory, Digestive or Skin and Symptom2Disease drafts a
              sentence for you. You can edit it before anything is analysed.
            </p>
            <ul className="check-list">
              <li>
                <Check size={18} aria-hidden="true" /> Free-text input up to 5,000 characters
              </li>
              <li>
                <Check size={18} aria-hidden="true" /> 52 searchable symptoms in 7 categories
              </li>
              <li>
                <Check size={18} aria-hidden="true" /> Always review the exact text that is sent
              </li>
            </ul>
            <Link to="/analysis" className="text-link">
              Open the symptom check <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="ways-preview" aria-hidden="true">
            <div className="preview-head">
              <ListChecks size={16} /> Select symptoms
            </div>
            <div className="preview-chips">
              {PREVIEW_CHIPS.map((id) => (
                <span
                  key={id}
                  className={PREVIEW_SELECTED.includes(id) ? "pchip on" : "pchip"}
                >
                  {PREVIEW_SELECTED.includes(id) ? <Check size={13} /> : <Plus size={13} />}
                  {SYMPTOMS_BY_ID[id].label}
                </span>
              ))}
            </div>
            <div className="preview-arrow">
              <ArrowRight size={16} /> Drafted for you
            </div>
            <p className="preview-text">{buildSymptomDescription(PREVIEW_SELECTED)}</p>
          </div>
        </div>
      </section>

      {/* ---------- Conditions ---------- */}
      <section className="section conditions">
        <div className="container">
          <div className="section-intro center">
            <Eyebrow>Coverage</Eyebrow>
            <h2>{DATASET.classes} conditions it can recognise</h2>
            <p>
              The model always answers with one of these. If a condition isn’t
              on the list, Symptom2Disease cannot name it.
            </p>
          </div>
          <ul className="condition-cloud">
            {CONDITIONS.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Performance ---------- */}
      <section className="section performance">
        <div className="container perf-grid">
          <div className="perf-copy">
            <Eyebrow>Measured, not assumed</Eyebrow>
            <h2>
              <span className="perf-number">{pct(FINAL_TEST.accuracy)}</span>
              accuracy on descriptions it had never seen
            </h2>
            <p>
              After choosing and tuning the model, it was tested once on{" "}
              {FINAL_TEST.testSamples} held-out descriptions.{" "}
              {FINAL_TEST.correct} were matched correctly. Macro F1, which weighs
              every condition equally, was {pct(FINAL_TEST.macroF1)}.
            </p>
            <p className="perf-caveat">
              These descriptions come from the same dataset and writing style as
              the training data, so real-world wording may perform worse.
            </p>
            <Link to="/models" className="text-link">
              Explore model comparison <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <OutcomeGrid correct={FINAL_TEST.correct} incorrect={FINAL_TEST.incorrect} />
        </div>
      </section>

      {/* ---------- Is / isn't ---------- */}
      <section className="section honesty">
        <div className="container">
          <div className="section-intro">
            <Eyebrow>Use it wisely</Eyebrow>
            <h2>What Symptom2Disease is, and what it isn’t.</h2>
          </div>
          <div className="honesty-grid">
            <div className="honesty-col is">
              <h3>It is</h3>
              <ul>
                <li><Check size={18} aria-hidden="true" />A way to explore how symptom wording relates to conditions</li>
                <li><Check size={18} aria-hidden="true" />Open about the exact words behind each result</li>
                <li><Check size={18} aria-hidden="true" />Evaluated on text it never saw during training</li>
              </ul>
            </div>
            <div className="honesty-col isnt">
              <h3>It isn’t</h3>
              <ul>
                <li><X size={18} aria-hidden="true" />A diagnosis, medical advice or a treatment plan</li>
                <li><X size={18} aria-hidden="true" />Aware of conditions beyond its 24 labels</li>
                <li><X size={18} aria-hidden="true" />Able to judge severity, urgency or confidence</li>
              </ul>
            </div>
          </div>
          <Link to="/methodology" className="text-link">
            Read about the methodology <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta-band">
        <div className="container cta-inner">
          <h2>Curious what your description points to?</h2>
          <Link to="/analysis" className="btn btn-accent btn-lg">
            Start a symptom check
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;
