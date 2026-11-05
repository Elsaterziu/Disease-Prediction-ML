import { ArrowRight, Boxes, Cpu, Monitor, Server } from "lucide-react";
import { useEffect, useState } from "react";
import { Figure, SourceNote } from "../components/ui";
import { DATASET, LIME_EXAMPLES, SOURCES, SVM_TUNING } from "../data/researchResults";
import "./Methodology.css";

const SECTIONS = [
  { id: "about", label: "About the project" },
  { id: "dataset", label: "Dataset" },
  { id: "preparation", label: "Preparing the data" },
  { id: "models", label: "Models compared" },
  { id: "tuning", label: "Tuning" },
  { id: "augmentation", label: "Augmentation" },
  { id: "explainability", label: "Explainability" },
  { id: "architecture", label: "Architecture" },
  { id: "limitations", label: "Limitations" },
];

const MODELS = [
  ["Support Vector Machine (LinearSVC)", "Finds a maximum-margin linear boundary per class. Well suited to sparse, high-dimensional TF-IDF features. Selected as the final model."],
  ["Logistic Regression", "A linear probabilistic classifier and a strong, interpretable baseline for text."],
  ["K-Nearest Neighbours", "Predicts from the most similar training descriptions in TF-IDF space."],
  ["Random Forest", "An ensemble of decision trees; captures non-linear interactions but is less suited to very sparse input."],
  ["Neural Network (MLP)", "A multi-layer perceptron on TF-IDF features; the most flexible model in the comparison."],
];

const ARCHITECTURE = [
  { icon: Monitor, name: "React frontend", detail: "Collects and checks the description, shows the result." },
  { icon: Server, name: "ASP.NET Core 8 API", detail: "POST /api/prediction validates input and forwards it." },
  { icon: Cpu, name: "Flask ML service", detail: "POST /predict runs the model and computes word contributions." },
  { icon: Boxes, name: "Trained pipeline", detail: "TF-IDF + LinearSVC, loaded from a joblib file." },
];

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const SECTION_IDS = SECTIONS.map((s) => s.id);

function Methodology() {
  const active = useActiveSection(SECTION_IDS);

  return (
    <div className="container about-page">
      <header className="page-head">
        <span className="eyebrow">About &amp; methodology</span>
        <h1>How Symptom2Disease was built, and where it falls short.</h1>
        <p>
          The data, models and evaluation behind every result, plus the limits
          you should keep in mind when reading one.
        </p>
      </header>

      <div className="about-layout">
        <nav className="toc" aria-label="On this page">
          <span className="toc-title">On this page</span>
          <ol>
            {SECTIONS.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={active === section.id ? "active" : ""}
                  aria-current={active === section.id ? "location" : undefined}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="article">
          <section id="about">
            <h2>About the project</h2>
            <p className="lede">
              Symptom2Disease began as a bachelor’s thesis in machine learning.
              The question was simple: how well can a classical, explainable
              text classifier map a patient-style description of symptoms to a
              disease, and can it show its reasoning?
            </p>
            <p>
              The result is a working end-to-end system: a trained model, a
              prediction service, and this interface. It is an educational and
              research tool. It has not been clinically validated and must not
              be used to make medical decisions.
            </p>
          </section>

          <section id="dataset">
            <h2>Dataset</h2>
            <div className="fact-row">
              <div>
                <strong>{DATASET.rawSamples.toLocaleString()}</strong>
                <span>raw descriptions</span>
              </div>
              <div>
                <strong>{DATASET.cleanSamples.toLocaleString()}</strong>
                <span>unique after cleaning</span>
              </div>
              <div>
                <strong>{DATASET.classes}</strong>
                <span>disease labels</span>
              </div>
            </div>
            <p>
              The study uses the public <strong>{DATASET.name}</strong> dataset:
              short, first-person English descriptions of symptoms, each
              labelled with one disease. Exact duplicate texts were removed
              before any modelling.
            </p>
          </section>

          <section id="preparation">
            <h2>Preparing the data</h2>
            <p>
              Many descriptions are close paraphrases of each other. A random
              split would place near-identical texts in both training and
              evaluation data and inflate the scores. Texts with a similarity
              of 0.85 or higher were therefore linked into groups, and the data
              was split with <code>GroupShuffleSplit</code> so that no group
              appears in more than one split.
            </p>

            <div className="split-bar" role="img" aria-label={`Training ${DATASET.trainSamples}, validation ${DATASET.validationSamples}, test ${DATASET.testSamples} descriptions`}>
              <div className="seg train" style={{ flexGrow: DATASET.trainSamples }}>
                <strong>Training</strong>
                <span>{DATASET.trainSamples} · ~70%</span>
              </div>
              <div className="seg val" style={{ flexGrow: DATASET.validationSamples }}>
                <strong>Validation</strong>
                <span>{DATASET.validationSamples}</span>
              </div>
              <div className="seg test" style={{ flexGrow: DATASET.testSamples }}>
                <strong>Test</strong>
                <span>{DATASET.testSamples}</span>
              </div>
            </div>

            <dl className="def-list">
              <div>
                <dt>Training</dt>
                <dd>Fits the models.</dd>
              </div>
              <div>
                <dt>Validation</dt>
                <dd>Compares models, tunes hyperparameters and evaluates augmentation.</dd>
              </div>
              <div>
                <dt>Test</dt>
                <dd>Used once, for the final evaluation of the selected model only.</dd>
              </div>
            </dl>

            <p>
              Text becomes numbers through a lower-cased <strong>TF-IDF</strong>{" "}
              vectoriser, which weights each word by how often it appears in a
              description relative to how common it is overall. The vectoriser
              is part of each model pipeline, so it only ever learns from
              training data.
            </p>
          </section>

          <section id="models">
            <h2>Models compared</h2>
            <p>
              Five scikit-learn classifiers were trained as{" "}
              <code>TF-IDF → classifier</code> pipelines with a fixed random
              seed (42, where applicable). Quality is reported mainly as{" "}
              <strong>Macro F1</strong>, the unweighted mean F1 across all
              conditions, so every disease counts equally.
            </p>
            <ol className="model-list">
              {MODELS.map(([name, text]) => (
                <li key={name}>
                  <h3>{name}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="tuning">
            <h2>Tuning</h2>
            <p>
              Each model was tuned with <code>GridSearchCV</code> using a{" "}
              <strong>3-fold StratifiedGroupKFold</strong> on the training set,
              which keeps the near-duplicate groups intact across folds, with
              Macro F1 as the objective. The best configuration was then scored
              on the validation set.
            </p>
            <p>
              The selected LinearSVC uses <code>C = {SVM_TUNING.bestParameters.C}</code>,
              single words as features (<code>ngram_range = (1, 1)</code>) and{" "}
              <code>min_df = 1</code>.
            </p>
            <SourceNote>{SOURCES.svmTuning}</SourceNote>
          </section>

          <section id="augmentation">
            <h2>Augmentation</h2>
            <p>
              To test whether more varied phrasing improves generalisation,{" "}
              {DATASET.augmentationCandidates} new training descriptions were
              generated by controlled, rule-based phrase replacement, for
              example “I have been experiencing” → “I have”.
            </p>
            <p>
              Generated texts were checked for missing values, duplicates,
              unchanged texts, invalid labels and exact overlap with the
              validation and test sets, then reviewed manually for meaning.
              Augmentation did not improve the SVM, so the final model uses the
              original training data.
            </p>
            <SourceNote>docs/augmentation_evaluation_report.txt</SourceNote>
          </section>

          <section id="explainability">
            <h2>Explainability</h2>
            <p>Two complementary methods explain the model’s behaviour.</p>

            <h3>Live word contributions</h3>
            <p>
              LinearSVC is a linear model, so its score for a class is a sum of
              per-word terms. For each word in your description, the symptom
              check can show <code>TF-IDF value × class coefficient</code> for
              the predicted condition. It is exact for this model and cheap to
              compute on every request. Values are decision-score
              contributions, not probabilities.
            </p>
            <Figure
              src="/figures/svm_word_contributions.png"
              alt="Bar chart of SVM word contributions for a validation example predicted as Migraine"
              caption="Word contributions for a validation description correctly matched to Migraine."
              source={SOURCES.wordContributions}
            />

            <h3>LIME (offline analysis)</h3>
            <p>
              LIME removes words from a description and fits a simple local
              model to see which removals change the outcome. Because LinearSVC
              has no probability output, LIME was applied to a softmax of the
              SVM decision scores; these are not calibrated probabilities. One
              correct and one incorrect validation prediction were analysed.
            </p>
            <div className="figure-pair">
              {LIME_EXAMPLES.map((example) => (
                <Figure
                  key={example.kind}
                  src={example.image}
                  alt={`LIME explanation: actual ${example.actual}, predicted ${example.predicted}`}
                  caption={`${example.kind}: actual “${example.actual}”, predicted “${example.predicted}”.`}
                />
              ))}
            </div>
            <SourceNote>{SOURCES.lime}</SourceNote>
          </section>

          <section id="architecture">
            <h2>Architecture</h2>
            <p>A request travels through four layers and back.</p>
            <ol className="arch-flow">
              {ARCHITECTURE.map((layer, i) => {
                const Icon = layer.icon;
                return (
                  <li key={layer.name}>
                    <span className="arch-icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <strong>{layer.name}</strong>
                    <span>{layer.detail}</span>
                    {i < ARCHITECTURE.length - 1 && (
                      <ArrowRight className="arch-arrow" size={18} aria-hidden="true" />
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          <section id="limitations">
            <h2>Limitations</h2>
            <ul className="limit-list">
              <li>
                <strong>Not a diagnostic tool.</strong> Educational and research
                use only; never a basis for medical decisions.
              </li>
              <li>
                <strong>Closed set of answers.</strong> It always returns one of
                the {DATASET.classes} known conditions, even when the true cause
                is not among them or the text is unrelated.
              </li>
              <li>
                <strong>No confidence score.</strong> LinearSVC does not produce
                calibrated probabilities, so no certainty is shown.
              </li>
              <li>
                <strong>Small, uniform dataset.</strong> With{" "}
                {DATASET.cleanSamples.toLocaleString()} short descriptions in a
                similar style, the high scores may not carry over to real
                clinical language.
              </li>
              <li>
                <strong>Small test set.</strong> {DATASET.testSamples} test
                descriptions (4–10 per condition) mean a single error moves
                per-condition scores noticeably.
              </li>
              <li>
                <strong>Word-based reasoning.</strong> The model counts words;
                it does not understand negation, severity or timing (“no fever”
                still contains “fever”).
              </li>
              <li>
                <strong>English only.</strong> Other languages are largely
                outside its vocabulary.
              </li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}

export default Methodology;
