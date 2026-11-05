import { BookA, MessageSquareOff, TriangleAlert } from "lucide-react";
import { coverageLevel } from "../utils/reliability";

export function NegationNote({ phrases, compact = false }) {
  if (!phrases.length) return null;

  return (
    <div className={compact ? "reliability-note warn compact" : "reliability-note warn"} role="note">
      <MessageSquareOff size={18} aria-hidden="true" />
      <div>
        <strong>Your description mentions symptoms you may not have</strong>
        <p>
          Found:{" "}
          {phrases.map((p, i) => (
            <span key={p}>
              <q>{p}</q>
              {i < phrases.length - 1 ? ", " : ""}
            </span>
          ))}
          .{" "}
          {compact
            ? "The model can’t tell “no fever” from “fever”. Your text is sent exactly as written."
            : "The model does not understand words like “no” or “without”: it reads “no fever” as if fever were mentioned. Your text was analysed exactly as written. If you listed symptoms you don’t have, you may want to remove them and analyse again."}
        </p>
      </div>
    </div>
  );
}

export function CoverageNote({ coverage }) {
  const level = coverageLevel(coverage);
  if (!level) return null;

  const { recognizedWords, totalWords, unrecognizedTerms = [] } = coverage;
  const examples = unrecognizedTerms.slice(0, 8);

  if (level === "ok") {
    return (
      <p className="coverage-line">
        <BookA size={15} aria-hidden="true" />
        The model recognised {recognizedWords} of {totalWords} words in your
        description.
        <span className="coverage-hint">
          {" "}This shows how much of your wording it knows, not how likely the
          result is.
        </span>
      </p>
    );
  }

  return (
    <div className={level === "none" ? "reliability-note danger" : "reliability-note warn"} role="alert">
      <TriangleAlert size={18} aria-hidden="true" />
      <div>
        <strong>
          {level === "none"
            ? "None of your words are known to the model"
            : "The model recognised only a few of your words"}
        </strong>
        <p>
          {recognizedWords} of {totalWords} words are in its vocabulary.{" "}
          {level === "none"
            ? "This result is not based on anything in your description."
            : "This result may not reflect what you described."}{" "}
          Try plain English symptom words such as “fever”, “cough” or “rash”.
          This is about vocabulary only, not a confidence score.
        </p>
        {examples.length > 0 && (
          <p className="unknown-terms">
            Not recognised:{" "}
            {examples.map((term) => (
              <code key={term}>{term}</code>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
