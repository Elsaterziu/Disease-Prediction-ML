import { BookA, MessageSquareOff, TriangleAlert } from "lucide-react";
import { Fragment } from "react";
import { useLanguage } from "../i18n/languageContext";
import { coverageLevel } from "../utils/reliability";

// Words shown as code chips. A real space separates them, so copied text and
// screen readers do not run the words together ("duhetshkojtualet").
export function TermList({ terms }) {
  return terms.map((term, i) => (
    <Fragment key={term}>
      {i > 0 && " "}
      <code>{term}</code>
    </Fragment>
  ));
}

export function NegationNote({ phrases, compact = false, excluded = false }) {
  const { t } = useLanguage();
  if (!phrases.length) return null;

  return (
    <div className={compact ? "reliability-note warn compact" : "reliability-note warn"} role="note">
      <MessageSquareOff size={18} aria-hidden="true" />
      <div>
        <strong>{excluded ? t("note.excl.title") : t("note.neg.title")}</strong>
        <p>
          {t("note.neg.found")}{" "}
          {phrases.map((p, i) => (
            <span key={p}>
              <q>{p}</q>
              {i < phrases.length - 1 ? ", " : ""}
            </span>
          ))}
          .{" "}
          {excluded
            ? compact ? t("note.excl.short") : t("note.excl.long")
            : compact ? t("note.neg.short") : t("note.neg.long")}
        </p>
      </div>
    </div>
  );
}

export function CoverageNote({ coverage }) {
  const { t } = useLanguage();
  const level = coverageLevel(coverage);
  if (!level) return null;

  const { recognizedWords: r, totalWords: total, unrecognizedTerms = [] } = coverage;
  const examples = unrecognizedTerms.slice(0, 8);

  if (level === "ok") {
    return (
      <p className="coverage-line">
        <BookA size={15} aria-hidden="true" />
        {t("note.cov.ok", { r, t: total })}
        <span className="coverage-hint">{t("note.cov.okHint")}</span>
      </p>
    );
  }

  return (
    <div className={level === "none" ? "reliability-note danger" : "reliability-note warn"} role="alert">
      <TriangleAlert size={18} aria-hidden="true" />
      <div>
        <strong>{level === "none" ? t("note.cov.noneTitle") : t("note.cov.lowTitle")}</strong>
        <p>
          {t("note.cov.count", { r, t: total })}{" "}
          {level === "none" ? t("note.cov.noneText") : t("note.cov.lowText")} {t("note.cov.tip")}
        </p>
        {examples.length > 0 && (
          <p className="unknown-terms">
            {t("an.notRecognised")} <TermList terms={examples} />
          </p>
        )}
      </div>
    </div>
  );
}
