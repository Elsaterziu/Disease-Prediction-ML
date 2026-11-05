import {
  AlertCircle,
  ArrowRight,
  Check,
  Lightbulb,
  ListChecks,
  PenLine,
  Quote,
  RotateCcw,
  SearchX,
  ShieldAlert,
  SlidersHorizontal,
  SquarePen,
  WifiOff,
} from "lucide-react";
import { useRef, useState } from "react";
import ContributionList from "../components/ContributionList";
import HighlightedText from "../components/HighlightedText";
import { LogoMark } from "../components/Logo";
import { CoverageNote, NegationNote } from "../components/ReliabilityNotes";
import SymptomSelector from "../components/SymptomSelector";
import { Disclosure, SegmentedControl } from "../components/ui";
import {
  MAX_LENGTH,
  predictDisease,
  validateSymptoms,
} from "../services/predictionApi";
import { conditionName } from "../utils/format";
import { coverageLevel, detectNegations } from "../utils/reliability";
import {
  appendSymptoms,
  buildSymptomDescription,
  detailsMissingFromText,
  symptomsMissingFromText,
} from "../utils/symptomText";
import "./SymptomAnalysis.css";

const INPUT_MODES = [
  { value: "write", label: "Write symptoms", icon: PenLine },
  { value: "select", label: "Select symptoms", icon: ListChecks },
];

// Free-form demonstration inputs written for this page (not taken from the
// dataset). Selecting one only fills the text box; the prediction always
// comes from the live API.
const EXAMPLES = [
  "I have severe headaches, blurred vision and nausea that get worse in bright light.",
  "My skin has red, itchy patches with dry silvery scales on my elbows and knees.",
  "I have a high fever with chills, strong pain behind my eyes and aching joints.",
];

const STEPS = ["Describe", "Review", "Result"];

function Stepper({ current }) {
  return (
    <ol className="stepper" aria-label="Progress">
      {STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={label} className={state} aria-current={state === "current" ? "step" : undefined}>
            <span className="stepper-dot">
              {state === "done" ? <Check size={14} aria-hidden="true" /> : i + 1}
            </span>
            <span className="stepper-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function EmptyResult() {
  return (
    <div className="result-empty">
      <div className="empty-art" aria-hidden="true">
        <span className="line w80" />
        <span className="line w40" />
        <span className="line w60 lit" />
        <span className="line w70" />
      </div>
      <h2>Your result will appear here</h2>
      <p>
        Symptom2Disease compares your description with 24 conditions and shows
        the closest match.
      </p>
      <div className="writing-tips">
        <span>Descriptions work best when they mention</span>
        <ul>
          <li>what you feel</li>
          <li>where it is</li>
          <li>how long it has lasted</li>
        </ul>
      </div>
    </div>
  );
}

function LoadingResult({ text }) {
  return (
    <div className="result-loading" role="status">
      <div className="loading-head">
        <span className="loading-orb" aria-hidden="true" />
        <span>Reading your description…</span>
      </div>
      <p className="loading-text" aria-hidden="true">
        {text}
      </p>
      <div className="skeleton" aria-hidden="true">
        <span className="sk w40" />
        <span className="sk w70 tall" />
        <span className="sk w90" />
      </div>
    </div>
  );
}

function RequestError({ message, onRetry }) {
  return (
    <div className="result-error" role="alert">
      <span className="error-icon" aria-hidden="true">
        <WifiOff size={22} />
      </span>
      <h2>We couldn’t get a result</h2>
      <p>{message}</p>
      <button type="button" className="btn btn-primary btn-sm" onClick={onRetry}>
        <RotateCcw size={16} aria-hidden="true" /> Try again
      </button>
    </div>
  );
}

// Shown instead of a result when the model recognised none of the words:
// the API still returns a class, but it is not based on the description.
function UnanalyzableResult({ coverage, onEdit, onReset }) {
  const terms = coverage.unrecognizedTerms?.slice(0, 8) ?? [];

  return (
    <div className="result-unanalyzable" role="alert">
      <span className="error-icon" aria-hidden="true">
        <SearchX size={22} />
      </span>
      <h2>We couldn’t analyze this description</h2>
      <p>
        Please describe your symptoms using clear English. None of the words
        you used are known to the model, so it cannot match them to a
        condition.
      </p>
      {terms.length > 0 && (
        <p className="unknown-terms">
          Not recognised:{" "}
          {terms.map((term) => (
            <code key={term}>{term}</code>
          ))}
        </p>
      )}
      <p className="unanalyzable-tip">
        For example: “I have a fever, a sore throat and a runny nose.”
      </p>
      <div className="result-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={onEdit}>
          <SquarePen size={16} aria-hidden="true" /> Edit description
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
          <RotateCcw size={16} aria-hidden="true" /> Start over
        </button>
      </div>
    </div>
  );
}

function ResultCard({ result, text, onEdit, onReset }) {
  const positiveWords = result.explanation?.positiveWords ?? [];
  const negativeWords = result.explanation?.negativeWords ?? [];
  const hasExplanation = positiveWords.length > 0 || negativeWords.length > 0;
  const name = conditionName(result.predictedDisease);
  const negations = detectNegations(text);

  return (
    <article className="result-card" aria-labelledby="result-title">
      <header className="result-head">
        <span className="result-kicker">
          <LogoMark size={20} /> Closest match among 24 conditions
        </span>
        <h2 id="result-title" className="result-name">
          {name}
        </h2>
        <p>
          The condition whose descriptions best match the words you used. It
          is not a diagnosis.
        </p>
      </header>

      <div className="result-body">
        <CoverageNote coverage={result.vocabularyCoverage} />
        <NegationNote phrases={negations} />

        <Disclosure
          icon={Lightbulb}
          title="Why this result?"
          subtitle="Optional · see which of your words shaped it"
          className="why"
        >
          {hasExplanation ? (
            <>
              <HighlightedText
                text={text}
                positiveWords={positiveWords}
                negativeWords={negativeWords}
              />
              <div className="hl-legend">
                <span>
                  <mark className="hl pos">word</mark> pushed towards {name}
                </span>
                <span>
                  <mark className="hl neg">word</mark> pushed away from it
                </span>
              </div>

              <Disclosure
                icon={SlidersHorizontal}
                title="Technical details"
                subtitle="SVM decision-score contributions"
                className="subtle"
              >
                <p className="tech-note">
                  Each value is the word’s TF-IDF weight multiplied by the
                  LinearSVC coefficient for {name}. They are contributions to a
                  decision score, not probabilities or clinical importance.
                </p>
                <div className="contribution-grid">
                  <ContributionList title="Supporting words" words={positiveWords} positive />
                  <ContributionList title="Opposing words" words={negativeWords} positive={false} />
                </div>
              </Disclosure>
            </>
          ) : (
            <p className="muted small">
              None of your words are in the model’s vocabulary, so there is
              nothing to highlight.
            </p>
          )}
        </Disclosure>

        {result.disclaimer && (
          <p className="result-disclaimer">
            <ShieldAlert size={16} aria-hidden="true" />
            {result.disclaimer}
          </p>
        )}

        <div className="result-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
            <SquarePen size={16} aria-hidden="true" /> Edit description
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            <RotateCcw size={16} aria-hidden="true" /> New check
          </button>
        </div>
      </div>
    </article>
  );
}

function SymptomAnalysis() {
  const composerRef = useRef(null);
  // Identifies the latest request; responses to older ones are discarded.
  const latestRequest = useRef(0);
  const [mode, setMode] = useState("write");
  const [symptoms, setSymptoms] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [extraDetails, setExtraDetails] = useState("");
  const [reviewDraft, setReviewDraft] = useState("");
  const [reviewEdited, setReviewEdited] = useState(false);
  const [result, setResult] = useState(null);
  const [analyzedText, setAnalyzedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");

  // In select mode the review text follows the selection until the user
  // edits it by hand; after that their wording is kept.
  const generatedText = buildSymptomDescription(selectedIds, extraDetails);
  const reviewText = reviewEdited ? reviewDraft : generatedText;
  const inputText = mode === "write" ? symptoms : reviewText;
  // Shown while typing; the text itself is never altered.
  const inputNegations = detectNegations(inputText);

  // A request in flight no longer matches the text once the input changes.
  const cancelPendingRequest = () => {
    latestRequest.current += 1;
    setLoading(false);
  };

  const resetOutcome = () => {
    cancelPendingRequest();
    setResult(null);
    setError("");
    setRequestError("");
  };

  const updateSymptoms = (value) => {
    setSymptoms(value);
    resetOutcome();
  };

  const toggleSymptom = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
    resetOutcome();
  };

  const updateExtraDetails = (value) => {
    setExtraDetails(value);
    resetOutcome();
  };

  const updateReviewText = (value) => {
    setReviewDraft(value);
    setReviewEdited(true);
    resetOutcome();
  };

  const regenerateReview = () => {
    setReviewEdited(false);
    resetOutcome();
  };

  // Adds selected symptoms and the note that are missing from the edited text
  // as new sentences at the end; the user's own wording is left untouched.
  const appendMissingSymptoms = () => {
    const missing = symptomsMissingFromText(selectedIds, reviewText);
    const note = detailsMissingFromText(extraDetails, reviewText) ? extraDetails : "";
    updateReviewText(appendSymptoms(reviewText, missing, note));
  };

  const clearInput = () => {
    if (mode === "write") {
      updateSymptoms("");
      return;
    }
    setSelectedIds([]);
    setExtraDetails("");
    setReviewEdited(false);
    resetOutcome();
  };

  const startOver = () => {
    setSymptoms("");
    setSelectedIds([]);
    setExtraDetails("");
    setReviewEdited(false);
    resetOutcome();
    composerRef.current?.scrollIntoView({ block: "start" });
  };

  // Focuses the box holding the text that is actually sent.
  const focusComposer = () => {
    const field = composerRef.current?.querySelector("#symptoms, .review-text");
    field?.scrollIntoView({ block: "center" });
    field?.focus({ preventScroll: true });
  };

  const changeMode = (value) => {
    cancelPendingRequest();
    setMode(value);
    setError("");
  };

  const runPrediction = async () => {
    setError("");
    setRequestError("");
    setResult(null);

    const validationError = validateSymptoms(inputText);

    if (validationError) {
      setError(validationError);
      return;
    }

    latestRequest.current += 1;
    const requestId = latestRequest.current;

    setLoading(true);
    setAnalyzedText(inputText.trim());

    try {
      const data = await predictDisease(inputText);
      if (requestId === latestRequest.current) setResult(data);
    } catch (err) {
      if (requestId === latestRequest.current) {
        setRequestError(err.message || "Could not connect to the server.");
      }
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  };

  const handlePredict = (event) => {
    event.preventDefault();
    runPrediction();
  };

  const step = result || loading || requestError ? 2 : inputText.trim() ? 1 : 0;

  let resultView = <EmptyResult />;
  if (loading) resultView = <LoadingResult text={analyzedText} />;
  else if (requestError) resultView = <RequestError message={requestError} onRetry={runPrediction} />;
  else if (result && coverageLevel(result.vocabularyCoverage) === "none")
    resultView = (
      <UnanalyzableResult
        coverage={result.vocabularyCoverage}
        onEdit={focusComposer}
        onReset={startOver}
      />
    );
  else if (result)
    resultView = (
      <ResultCard result={result} text={analyzedText} onEdit={focusComposer} onReset={startOver} />
    );

  return (
    <div className="container analysis-page">
      <header className="page-head analysis-head">
        <div>
          <span className="eyebrow">Symptom check</span>
          <h1>What do your symptoms point to?</h1>
          <p>
            Describe them in your own words or pick them from a list. Your text
            is matched against 24 conditions.
          </p>
        </div>
        <Stepper current={step} />
      </header>

      <div className="analysis-grid">
        <section className="composer" ref={composerRef} aria-label="Describe your symptoms">
          <SegmentedControl
            label="Input method"
            options={INPUT_MODES}
            value={mode}
            onChange={changeMode}
            size="lg"
          />

          <form onSubmit={handlePredict} noValidate className="composer-form">
            {mode === "write" ? (
              <div className="write-mode">
                <label htmlFor="symptoms" className="composer-label">
                  Describe your symptoms
                </label>
                <textarea
                  id="symptoms"
                  className="composer-textarea"
                  value={symptoms}
                  onChange={(event) => updateSymptoms(event.target.value)}
                  placeholder="For example: I’ve had a sore throat and a runny nose for two days, and I keep sneezing."
                  rows={7}
                  maxLength={MAX_LENGTH}
                  aria-describedby="symptoms-help"
                  required
                />

                <div className="examples">
                  <span className="examples-label">Or start from an example</span>
                  <div className="example-list">
                    {EXAMPLES.map((example) => (
                      <button
                        key={example}
                        type="button"
                        className="example"
                        onClick={() => updateSymptoms(example)}
                      >
                        <Quote size={14} aria-hidden="true" />
                        <span>{example}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <SymptomSelector
                selectedIds={selectedIds}
                onToggle={toggleSymptom}
                onClear={() => {
                  setSelectedIds([]);
                  resetOutcome();
                }}
                extraDetails={extraDetails}
                onExtraDetailsChange={updateExtraDetails}
                reviewText={reviewText}
                onReviewTextChange={updateReviewText}
                reviewEdited={reviewEdited}
                onRegenerate={regenerateReview}
                onAppendMissing={appendMissingSymptoms}
              />
            )}

            <NegationNote phrases={inputNegations} compact />

            {error && (
              <p className="inline-error" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                {error}
              </p>
            )}

            <div className="action-bar">
              <span className="action-meta" id="symptoms-help">
                {mode === "select" && inputText.trim() && (
                  <span className="sends-label">
                    Sends: {reviewEdited ? "your edited text" : "the drafted text"} ·{" "}
                  </span>
                )}
                {inputText.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()} ·
                at least 3 words, in English
              </span>
              <div className="action-buttons">
                {inputText && !loading && (
                  <button type="button" className="btn btn-ghost" onClick={clearInput}>
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !inputText.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> Analyzing
                    </>
                  ) : (
                    <>
                      Analyze <ArrowRight size={17} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        <aside className="result-col" aria-live="polite">
          {resultView}
        </aside>
      </div>
    </div>
  );
}

export default SymptomAnalysis;
