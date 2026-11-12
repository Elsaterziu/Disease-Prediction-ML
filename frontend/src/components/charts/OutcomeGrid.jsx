import { useLanguage } from "../../i18n/languageContext";

// One square per held-out test description: correct vs. misclassified.
// Values come from the final evaluation (no sampling or rounding).
function OutcomeGrid({ correct, incorrect, compact = false }) {
  const { t } = useLanguage();
  const total = correct + incorrect;
  const cells = Array.from({ length: total }, (_, i) => i >= correct);

  return (
    <div className={compact ? "outcome-grid compact" : "outcome-grid"}>
      <div
        className="outcome-cells"
        role="img"
        aria-label={t("outcome.aria", { correct, total, incorrect })}
      >
        {cells.map((wrong, i) => (
          <span key={i} className={wrong ? "cell wrong" : "cell"} />
        ))}
      </div>
      <div className="outcome-legend" aria-hidden="true">
        <span>
          <i className="cell" /> {t("outcome.correct")} · {correct}
        </span>
        <span>
          <i className="cell wrong" /> {t("outcome.wrong")} · {incorrect}
        </span>
      </div>
    </div>
  );
}

export default OutcomeGrid;
