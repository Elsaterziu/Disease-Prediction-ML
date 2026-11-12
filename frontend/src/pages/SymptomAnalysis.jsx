import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleHelp,
  Lightbulb,
  ListChecks,
  PenLine,
  Quote,
  RotateCcw,
  SearchX,
  ShieldAlert,
  SlidersHorizontal,
  SpellCheck,
  SquarePen,
  Stethoscope,
  WifiOff,
} from "lucide-react";
import { useRef, useState } from "react";
import ContributionList from "../components/ContributionList";
import HighlightedText from "../components/HighlightedText";
import { LogoMark } from "../components/Logo";
import { CoverageNote, NegationNote, TermList } from "../components/ReliabilityNotes";
import SymptomSelector from "../components/SymptomSelector";
import TranslationPreview from "../components/TranslationPreview";
import { Disclosure, SegmentedControl } from "../components/ui";
import { diseaseName, hasAlbanianName } from "../i18n/diseaseNames";
import { useLanguage } from "../i18n/languageContext";
import {
  MAX_LENGTH,
  predictDisease,
  validateSymptoms,
} from "../services/predictionApi";
import { translateSymptoms } from "../translation/sqToEn";
import { coverageLevel } from "../utils/reliability";
import {
  appendSymptoms,
  buildSymptomDescription,
  detailsMissingFromText,
  symptomsMissingFromText,
} from "../utils/symptomText";
import "./SymptomAnalysis.css";

// Free-form demonstration inputs written for this page (not taken from the
// dataset). Selecting one only fills the text box; the prediction always
// comes from the live API.
const EXAMPLES = {
  en: [
    "I have severe headaches, blurred vision and nausea that get worse in bright light.",
    "My skin has red, itchy patches with dry silvery scales on my elbows and knees.",
    "I have a high fever with chills, strong pain behind my eyes and aching joints.",
  ],
  sq: [
    "Kam dhimbje të forta koke, shikim të turbullt dhe të përziera.",
    "Kam skuqje të lëkurës, kruajtje dhe lëkurë të thatë me luspa.",
    "Kam temperaturë të lartë, të dridhura, dhimbje pas syve dhe dhimbje nyjesh.",
  ],
};

const API_DISCLAIMER = "Educational prediction only. Not a medical diagnosis.";

function Stepper({ current }) {
  const { t } = useLanguage();
  const steps = [t("an.step.describe"), t("an.step.review"), t("an.step.result")];
  return (
    <ol className="stepper" aria-label={t("an.progress")}>
      {steps.map((label, i) => {
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
  const { t } = useLanguage();
  return (
    <div className="result-empty">
      <div className="empty-art" aria-hidden="true">
        <span className="line w80" />
        <span className="line w40" />
        <span className="line w60 lit" />
        <span className="line w70" />
      </div>
      <h2>{t("an.empty.title")}</h2>
      <p>{t("an.empty.text")}</p>
      <div className="writing-tips">
        <span>{t("an.empty.tipsTitle")}</span>
        <ul>
          <li>{t("an.empty.tip1")}</li>
          <li>{t("an.empty.tip2")}</li>
          <li>{t("an.empty.tip3")}</li>
        </ul>
      </div>
    </div>
  );
}

function LoadingResult({ text }) {
  const { t } = useLanguage();
  return (
    <div className="result-loading" role="status">
      <div className="loading-head">
        <span className="loading-orb" aria-hidden="true" />
        <span>{t("an.loading")}</span>
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
  const { t } = useLanguage();
  return (
    <div className="result-error" role="alert">
      <span className="error-icon" aria-hidden="true">
        <WifiOff size={22} />
      </span>
      <h2>{t("an.error.title")}</h2>
      <p>{message}</p>
      <button type="button" className="btn btn-primary btn-sm" onClick={onRetry}>
        <RotateCcw size={16} aria-hidden="true" /> {t("an.retry")}
      </button>
    </div>
  );
}

// Shown instead of a result when the model recognised none of the words:
// the API still returns a class, but it is not based on the description.
function UnanalyzableResult({ coverage, onEdit, onReset }) {
  const { t } = useLanguage();
  const terms = coverage.unrecognizedTerms?.slice(0, 8) ?? [];

  return (
    <div className="result-unanalyzable" role="alert">
      <span className="error-icon" aria-hidden="true">
        <SearchX size={22} />
      </span>
      <h2>{t("an.unan.title")}</h2>
      <p>{t("an.unan.text")}</p>
      {terms.length > 0 && (
        <p className="unknown-terms">
          {t("an.notRecognised")} <TermList terms={terms} />
        </p>
      )}
      <p className="unanalyzable-tip">{t("an.unan.example")}</p>
      <div className="result-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={onEdit}>
          <SquarePen size={16} aria-hidden="true" /> {t("an.edit")}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
          <RotateCcw size={16} aria-hidden="true" /> {t("an.startOver")}
        </button>
      </div>
    </div>
  );
}

// Medical terms the API rewrote in plain words before the analysis.
function MedicalTermsNote({ terms }) {
  const { t } = useLanguage();
  if (!terms?.length) return null;
  return (
    <div className="reliability-note info" role="note">
      <SpellCheck size={18} aria-hidden="true" />
      <div>
        <strong>{t("res.terms.title")}</strong>
        <ul className="term-list">
          {terms.map((m) => (
            <li key={m.term}>
              <code>{m.term}</code> → <span lang="en">{m.replacement}</span>
              {m.needsReview && <em> · {t("res.terms.review")}</em>}
            </li>
          ))}
        </ul>
        <p>{t("res.terms.note")}</p>
      </div>
    </div>
  );
}

// Shown instead of a disease when the API found no symptoms, needs a
// clarification, or abstained because no supported condition matched.
function WithheldResult({ result, onEdit, onReset }) {
  const { t } = useLanguage();
  const analysis = result.inputAnalysis ?? {};
  const reason = result.reasons?.[0];
  const view = {
    no_symptoms: { icon: SearchX, title: t("res.noSym.title"), text: t("res.noSym.text") },
    needs_clarification: {
      icon: CircleHelp,
      title: t("res.clar.title"),
      text: t(`res.clar.${reason}`) === `res.clar.${reason}` ? result.message : t(`res.clar.${reason}`),
    },
    no_reliable_match: { icon: Stethoscope, title: t("res.noMatch.title"), text: t("res.noMatch.text") },
  }[result.status] ?? { icon: CircleHelp, title: t("res.clar.title"), text: result.message };
  const Icon = view.icon;
  const found = result.status === "needs_clarification" && reason === "onlyNegated" ? [] : analysis.presentSymptoms ?? [];

  return (
    <div className={`result-unanalyzable withheld ${result.status}`} role="alert">
      <span className="error-icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <h2>{view.title}</h2>
      <p>{view.text}</p>
      {result.status === "no_reliable_match" && <p className="withheld-why">{t("res.noMatch.why")}</p>}
      {found.length > 0 && (
        <p className="unknown-terms">
          {t("res.found")} <TermList terms={found} />
        </p>
      )}
      {analysis.negatedSymptoms?.length > 0 && (
        <p className="unknown-terms">
          {t("res.negated")} <TermList terms={analysis.negatedSymptoms} />
        </p>
      )}
      {analysis.uninterpretedTerms?.length > 0 && (
        <p className="unknown-terms">
          {t("res.unknownTerms")} <TermList terms={analysis.uninterpretedTerms} />
        </p>
      )}
      <MedicalTermsNote terms={analysis.medicalTerms} />
      {result.status !== "no_reliable_match" && <p className="unanalyzable-tip">{t("an.unan.example")}</p>}
      <p className="result-disclaimer">
        <ShieldAlert size={16} aria-hidden="true" />
        {t("an.disclaimer")}
      </p>
      <div className="result-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={onEdit}>
          <SquarePen size={16} aria-hidden="true" /> {t("an.edit")}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
          <RotateCcw size={16} aria-hidden="true" /> {t("an.startOver")}
        </button>
      </div>
    </div>
  );
}

function ResultCard({ result, text, source, negations, negationsExcluded, onEdit, onReset }) {
  const { lang, t } = useLanguage();
  const positiveWords = result.explanation?.positiveWords ?? [];
  const negativeWords = result.explanation?.negativeWords ?? [];
  const hasExplanation = positiveWords.length > 0 || negativeWords.length > 0;
  const label = result.predictedDisease;
  const name = diseaseName(label, lang);
  const showOriginal = lang === "sq" && hasAlbanianName(label);
  // The API may rewrite medical terms and leave out negated symptoms; the
  // explanation refers to the text it actually analysed.
  const analysis = result.inputAnalysis ?? {};
  const modelText = analysis.textSentToModel || text;
  const typed = source || (modelText !== text ? text : "");
  const excluded = negations.length ? negations : analysis.negatedSymptoms ?? [];

  return (
    <article className="result-card" aria-labelledby="result-title">
      <header className="result-head">
        <span className="result-kicker">
          <LogoMark size={20} /> {t("an.res.kicker")}
        </span>
        <h2 id="result-title" className="result-name">
          {name}
        </h2>
        {showOriginal && (
          <p className="result-original" lang="en">
            {t("an.res.original", { label })}
          </p>
        )}
        <p>{t("an.res.text")}</p>
      </header>

      <div className="result-body">
        <CoverageNote coverage={result.vocabularyCoverage} />
        <NegationNote phrases={excluded} excluded={negationsExcluded || excluded.length > 0} />
        <MedicalTermsNote terms={analysis.medicalTerms} />

        {typed && (
          <div className="analyzed-pair">
            <span>{t("an.res.yourText")}</span>
            <p>{typed}</p>
          </div>
        )}

        <Disclosure icon={Lightbulb} title={t("an.why.title")} subtitle={t("an.why.subtitle")} className="why">
          {hasExplanation ? (
            <>
              {typed && <span className="analyzed-label">{source ? t("an.res.sentText") : t("an.res.analysedText")}</span>}
              <HighlightedText text={modelText} positiveWords={positiveWords} negativeWords={negativeWords} />
              <div className="hl-legend">
                <span>
                  <mark className="hl pos">{t("an.why.word")}</mark> {t("an.why.towards", { name })}
                </span>
                <span>
                  <mark className="hl neg">{t("an.why.word")}</mark> {t("an.why.away")}
                </span>
              </div>

              <Disclosure
                icon={SlidersHorizontal}
                title={t("an.tech.title")}
                subtitle={t("an.tech.subtitle")}
                className="subtle"
              >
                <p className="tech-note">{t("an.tech.text", { name })}</p>
                <div className="contribution-grid">
                  <ContributionList title={t("an.tech.supporting")} words={positiveWords} positive />
                  <ContributionList title={t("an.tech.opposing")} words={negativeWords} positive={false} />
                </div>
              </Disclosure>
            </>
          ) : (
            <p className="muted small">{t("an.why.none")}</p>
          )}
        </Disclosure>

        {result.disclaimer && (
          <p className="result-disclaimer">
            <ShieldAlert size={16} aria-hidden="true" />
            {result.disclaimer === API_DISCLAIMER ? t("an.disclaimer") : result.disclaimer}
          </p>
        )}

        <div className="result-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
            <SquarePen size={16} aria-hidden="true" /> {t("an.edit")}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            <RotateCcw size={16} aria-hidden="true" /> {t("an.newCheck")}
          </button>
        </div>
      </div>
    </article>
  );
}

function SymptomAnalysis() {
  const { lang, t } = useLanguage();
  const isSq = lang === "sq";
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
  const [analyzed, setAnalyzed] = useState({ text: "", source: "", negations: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [confirmedFor, setConfirmedFor] = useState("");

  // In select mode the review text follows the selection until the user
  // edits it by hand; after that their wording is kept.
  const generatedText = buildSymptomDescription(selectedIds, extraDetails, lang);
  const reviewText = reviewEdited ? reviewDraft : generatedText;
  const inputText = mode === "write" ? symptoms : reviewText;

  // Albanian input is translated to English before it reaches the model.
  // English input (and English typed in Albanian mode) is sent unchanged.
  const translation = isSq ? translateSymptoms(inputText) : null;
  let textToSend = inputText;
  let blockReason = "";
  if (isSq) {
    textToSend = translation.english;
    if (translation.status === "unclear") blockReason = "tr.blocked";
    if (translation.status === "confirm" && confirmedFor !== translation.english) blockReason = "tr.confirmFirst";
  }

  // Albanian: negated symptoms are left out of the text sent to the model.
  // English: the text is sent as written and the user is warned instead.
  // English: the API finds negated symptoms, leaves them out and reports them
  // with the result, so nothing is shown before sending.
  const negationsExcluded = isSq && translation.status !== "english";
  const inputNegations = negationsExcluded ? translation.negatedPhrases : [];

  // Messages from validation or the API are English; show Albanian when known.
  const localize = (message) => {
    if (message.startsWith("tr.")) return t(message);
    const key = `err.${message}`;
    const text = t(key);
    return text === key ? message : text;
  };

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
    const missing = symptomsMissingFromText(selectedIds, reviewText, lang);
    const note = detailsMissingFromText(extraDetails, reviewText) ? extraDetails : "";
    updateReviewText(appendSymptoms(reviewText, missing, note, lang));
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

    if (blockReason) {
      setError(blockReason);
      return;
    }

    const validationError = validateSymptoms(textToSend);

    if (validationError) {
      // A translated text can be shorter than what was typed (articles are
      // dropped and negated symptoms removed), so explain that case.
      setError(negationsExcluded && textToSend.trim() ? "tr.tooShort" : validationError);
      return;
    }

    latestRequest.current += 1;
    const requestId = latestRequest.current;

    setLoading(true);
    setAnalyzed({
      text: textToSend.trim(),
      source: isSq && translation.status !== "english" ? inputText.trim() : "",
      negations: inputNegations,
      negationsExcluded,
    });

    try {
      const data = await predictDisease(textToSend);
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
  if (loading) resultView = <LoadingResult text={analyzed.text} />;
  else if (requestError) resultView = <RequestError message={localize(requestError)} onRetry={runPrediction} />;
  else if (result && result.status && result.status !== "prediction")
    resultView = <WithheldResult result={result} onEdit={focusComposer} onReset={startOver} />;
  else if (result && coverageLevel(result.vocabularyCoverage) === "none")
    resultView = (
      <UnanalyzableResult coverage={result.vocabularyCoverage} onEdit={focusComposer} onReset={startOver} />
    );
  else if (result)
    resultView = (
      <ResultCard
        result={result}
        text={analyzed.text}
        source={analyzed.source}
        negations={analyzed.negations}
        negationsExcluded={analyzed.negationsExcluded}
        onEdit={focusComposer}
        onReset={startOver}
      />
    );

  // Shown right under the text box being sent, so it is visible while typing.
  const preview = isSq ? (
    <TranslationPreview
      translation={translation}
      confirmed={confirmedFor === translation.english}
      onConfirmChange={(checked) => setConfirmedFor(checked ? translation.english : "")}
    />
  ) : null;

  const inputModes = [
    { value: "write", label: t("an.mode.write"), icon: PenLine },
    { value: "select", label: t("an.mode.select"), icon: ListChecks },
  ];

  return (
    <div className="container analysis-page">
      <header className="page-head analysis-head">
        <div>
          <span className="eyebrow">{t("an.eyebrow")}</span>
          <h1>{t("an.title")}</h1>
          <p>{t("an.lead")}</p>
        </div>
        <Stepper current={step} />
      </header>

      <div className="analysis-grid">
        <section className="composer" ref={composerRef} aria-label={t("an.composerAria")}>
          <SegmentedControl
            label={t("an.inputMethod")}
            options={inputModes}
            value={mode}
            onChange={changeMode}
            size="lg"
          />

          <form onSubmit={handlePredict} noValidate className="composer-form">
            {mode === "write" ? (
              <div className="write-mode">
                <label htmlFor="symptoms" className="composer-label">
                  {t("an.label")}
                </label>
                <textarea
                  id="symptoms"
                  className="composer-textarea"
                  value={symptoms}
                  onChange={(event) => updateSymptoms(event.target.value)}
                  placeholder={t("an.placeholder")}
                  rows={7}
                  maxLength={MAX_LENGTH}
                  aria-describedby="symptoms-help"
                  required
                />

                {preview}

                <div className="examples">
                  <span className="examples-label">{t("an.examples")}</span>
                  <div className="example-list">
                    {EXAMPLES[lang].map((example) => (
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

            {mode === "select" && preview}

            <NegationNote phrases={inputNegations} excluded={negationsExcluded} compact />

            {error && (
              <p className="inline-error" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                {localize(error)}
              </p>
            )}

            <div className="action-bar">
              <span className="action-meta" id="symptoms-help">
                {mode === "select" && inputText.trim() && (
                  <span className="sends-label">
                    {reviewEdited ? t("an.meta.sendsEdited") : t("an.meta.sendsDrafted")}
                  </span>
                )}
                {inputText.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()} · {t("an.meta.limits")}
                {blockReason && inputText.trim() && <span className="block-reason">{t(blockReason)}</span>}
              </span>
              <div className="action-buttons">
                {inputText && !loading && (
                  <button type="button" className="btn btn-ghost" onClick={clearInput}>
                    {t("an.clear")}
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !inputText.trim() || Boolean(blockReason)}
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> {t("an.analyzing")}
                    </>
                  ) : (
                    <>
                      {t("an.analyze")} <ArrowRight size={17} aria-hidden="true" />
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
