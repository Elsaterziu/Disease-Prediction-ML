import { ArrowRight, Check, CircleHelp, Languages, SpellCheck } from "lucide-react";
import { useId } from "react";
import { useLanguage } from "../i18n/languageContext";
import { TermList } from "./ReliabilityNotes";

// Shows, in Albanian mode, exactly what will be sent to the model and blocks
// the analysis when the description could not be understood.
function TranslationPreview({ translation, confirmed, onConfirmChange }) {
  const { t } = useLanguage();
  const id = useId();
  const { status, english, items, unknown, corrections, excluded, reasons, uncertainWords } = translation;

  if (status === "empty") return null;

  if (status === "english") {
    return (
      <p className="translation-preview english" role="status">
        <Languages size={16} aria-hidden="true" />
        {t("tr.english")}
      </p>
    );
  }

  if (status === "unclear") {
    const understood = items.some((i) => i.kind === "symptom" || i.kind === "english");
    return (
      <div className="translation-preview unclear" role="alert">
        <CircleHelp size={18} aria-hidden="true" />
        <div>
          <strong>{t("tr.unclearTitle")}</strong>
          {unknown.length > 0 && (
            <p className="unknown-terms">
              {t("tr.unknown")} <TermList terms={unknown} />
            </p>
          )}
          {reasons.includes("noSymptom") && !understood && <p>{t("tr.noSymptom")}</p>}
          {reasons.includes("onlyNegated") && <p>{t("tr.onlyNegated")}</p>}
          {reasons.includes("negationUnclear") && <p>{t("tr.negationUnclear")}</p>}
          {reasons.includes("uncertain") && <p>{t("tr.uncertain", { words: uncertainWords.join(", ") })}</p>}
          {reasons.includes("unknown") && <p>{t("tr.unclearHelp")}</p>}
        </div>
      </div>
    );
  }

  const symptoms = items.filter((i) => (i.kind === "symptom" || i.kind === "english") && !i.negated);

  return (
    <div className={status === "confirm" ? "translation-preview confirm" : "translation-preview"} role="status">
      <div className="tp-head">
        <Languages size={16} aria-hidden="true" />
        <strong>{t("tr.title")}</strong>
      </div>
      <p className="tp-english" lang="en">
        {english}
      </p>

      {symptoms.length > 0 && (
        <ul className="tp-items" aria-label={t("tr.understood")}>
          {symptoms.map((item, i) => (
            <li key={`${item.sq}-${i}`} className={item.negated ? "negated" : ""}>
              <span>{item.sq}</span>
              <ArrowRight size={12} aria-hidden="true" />
              <span lang="en">{item.en}</span>
            </li>
          ))}
        </ul>
      )}

      {excluded.length > 0 && (
        <div className="tp-excluded">
          <span>{t("tr.excluded")}</span>
          <ul className="tp-items">
            {excluded.map((item, i) => (
              <li key={`${item.sq}-${i}`} className="negated">
                <s>{item.sq}</s>
                <em>{t("tr.negated")}</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === "confirm" && (
        <div className="tp-confirm">
          <p>
            <SpellCheck size={15} aria-hidden="true" /> {t("tr.corrections")}{" "}
            {corrections
              .filter((c) => c.symptom)
              .map((c) => (
                <span key={c.from} className="tp-fix">
                  <s>{c.from}</s> → {c.to}
                </span>
              ))}
          </p>
          <label htmlFor={`${id}-ok`} className="tp-check">
            <input
              id={`${id}-ok`}
              type="checkbox"
              checked={confirmed}
              onChange={(event) => onConfirmChange(event.target.checked)}
            />
            <Check size={14} aria-hidden="true" /> {t("tr.confirm")}
          </label>
        </div>
      )}

      <p className="tp-note">{t("tr.disclaimer")}</p>
    </div>
  );
}

export default TranslationPreview;
