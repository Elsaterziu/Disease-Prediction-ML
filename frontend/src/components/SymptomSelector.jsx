import {
  AlertTriangle,
  Bone,
  Brain,
  Check,
  Droplet,
  Hand,
  Info,
  LayoutGrid,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Thermometer,
  Utensils,
  Wand2,
  Wind,
  X,
} from "lucide-react";
import { useId, useState } from "react";
import { SYMPTOM_CATEGORIES, SYMPTOMS_BY_ID } from "../data/symptomCatalog";
import { useLanguage } from "../i18n/languageContext";
import { MAX_LENGTH } from "../services/predictionApi";
import { detailsMissingFromText, symptomsMissingFromText } from "../utils/symptomText";

const CATEGORY_ICONS = {
  general: Thermometer,
  head: Brain,
  respiratory: Wind,
  digestive: Utensils,
  urinary: Droplet,
  skin: Hand,
  musculoskeletal: Bone,
};

// Search ignores ë/ç so "kolle" finds "Kollë".
const fold = (s) => s.toLowerCase().replace(/ë/g, "e").replace(/ç/g, "c");

function matches(symptom, query) {
  if (!query) return true;
  const q = fold(query);
  return [symptom.label, symptom.phrase, ...symptom.aliases, symptom.sq.label, symptom.sq.phrase, ...symptom.sq.aliases]
    .some((text) => fold(text).includes(q));
}

function SymptomSelector({
  selectedIds,
  onToggle,
  onClear,
  extraDetails,
  onExtraDetailsChange,
  reviewText,
  onReviewTextChange,
  reviewEdited,
  onRegenerate,
  onAppendMissing,
}) {
  const { lang, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [confirmRegen, setConfirmRegen] = useState(false);
  const ids = useId();
  const query = search.trim().toLowerCase();
  const selected = new Set(selectedIds);
  const labelOf = (symptom) => (lang === "sq" ? symptom.sq.label : symptom.label);
  const categoryLabel = (c) => (lang === "sq" ? c.labelSq : c.label);

  const missingIds = reviewEdited ? symptomsMissingFromText(selectedIds, reviewText, lang) : [];
  const noteMissing = reviewEdited && detailsMissingFromText(extraDetails, reviewText);
  const hasMismatch = missingIds.length > 0 || noteMissing;
  const missingSymptomsTitle =
    missingIds.length === 1 ? t("sel.missing.one") : t("sel.missing.many", { n: missingIds.length });

  // A search always looks across every category.
  const activeCategory = query ? "all" : category;

  const visibleCategories = SYMPTOM_CATEGORIES.filter(
    (c) => activeCategory === "all" || c.id === activeCategory
  )
    .map((c) => ({ ...c, visible: c.symptoms.filter((s) => matches(s, query)) }))
    .filter((c) => c.visible.length > 0);

  return (
    <div className="symptom-selector">
      <p className="selector-notice">
        <Info size={16} aria-hidden="true" />
        <span>{t("sel.notice")}</span>
      </p>

      <div className="selector-step">
        <div className="selector-step-head">
          <span className="step-badge">1</span>
          <h3>{t("sel.pick")}</h3>
        </div>

        <div className="search-field">
          <Search size={18} aria-hidden="true" />
          <label htmlFor={`${ids}-search`} className="sr-only">
            {t("sel.searchLabel")}
          </label>
          <input
            id={`${ids}-search`}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("sel.searchPlaceholder")}
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label={t("sel.clearSearch")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="category-pills" role="group" aria-label={t("sel.filter")}>
          <button
            type="button"
            className={activeCategory === "all" ? "cat-pill active" : "cat-pill"}
            aria-pressed={activeCategory === "all"}
            onClick={() => setCategory("all")}
            disabled={Boolean(query)}
          >
            <LayoutGrid size={15} aria-hidden="true" /> {t("sel.all")}
          </button>
          {SYMPTOM_CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.id];
            const count = c.symptoms.filter((s) => selected.has(s.id)).length;
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                className={active ? "cat-pill active" : "cat-pill"}
                aria-pressed={active}
                onClick={() => setCategory(active ? "all" : c.id)}
                disabled={Boolean(query)}
              >
                <Icon size={15} aria-hidden="true" />
                {categoryLabel(c)}
                {count > 0 && (
                  <span className="cat-count" aria-label={t("sel.countSelected", { n: count })}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="symptom-groups">
          {visibleCategories.length === 0 && (
            <p className="no-match">{t("sel.noMatch", { q: search.trim() })}</p>
          )}

          {visibleCategories.map((c) => (
            <fieldset key={c.id} className="symptom-group">
              <legend>{categoryLabel(c)}</legend>
              <div className="chip-list">
                {c.visible.map((symptom) => {
                  const on = selected.has(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      type="button"
                      className={on ? "symptom-chip on" : "symptom-chip"}
                      aria-pressed={on}
                      onClick={() => onToggle(symptom.id)}
                    >
                      {on ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
                      {labelOf(symptom)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="selected-tray" aria-live="polite">
          <div className="tray-head">
            <span>
              <strong>{selectedIds.length}</strong> {t("sel.selected")}
            </span>
            {selectedIds.length > 0 && (
              <button type="button" className="link-button" onClick={onClear}>
                {t("sel.clearAll")}
              </button>
            )}
          </div>
          {selectedIds.length > 0 && (
            <ul className="selected-list">
              {selectedIds.map((id) => (
                <li key={id}>
                  {labelOf(SYMPTOMS_BY_ID[id])}
                  <button
                    type="button"
                    onClick={() => onToggle(id)}
                    aria-label={t("sel.remove", { name: labelOf(SYMPTOMS_BY_ID[id]) })}
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label htmlFor={`${ids}-extra`} className="composer-label small-label">
          {t("sel.extra")} <span className="optional">{t("sel.optional")}</span>
        </label>
        <textarea
          id={`${ids}-extra`}
          className="composer-textarea short"
          value={extraDetails}
          onChange={(event) => onExtraDetailsChange(event.target.value)}
          placeholder={t("sel.extraPlaceholder")}
          rows={2}
          maxLength={1000}
        />
      </div>

      <div className={reviewEdited ? "selector-step review edited" : "selector-step review"}>
        <div className="selector-step-head">
          <span className="step-badge">2</span>
          <h3>
            <label htmlFor={`${ids}-review`}>{t("sel.review")}</label>
          </h3>
          <span className={reviewEdited ? "review-status edited" : "review-status"}>
            {reviewEdited ? (
              <>
                <PencilLine size={13} aria-hidden="true" /> {t("sel.status.edited")}
              </>
            ) : (
              <>
                <Wand2 size={13} aria-hidden="true" /> {t("sel.status.drafted")}
              </>
            )}
          </span>
        </div>
        <p className="review-help" id={`${ids}-review-help`}>
          {reviewEdited ? t("sel.help.edited") : t("sel.help.drafted")}
        </p>

        {hasMismatch && (
          <div className="sync-warning" role="status">
            <AlertTriangle size={17} aria-hidden="true" />
            <div>
              <strong>
                {missingIds.length > 0 && noteMissing
                  ? t("sel.missing.both", { symptoms: missingSymptomsTitle })
                  : noteMissing
                    ? t("sel.missing.note")
                    : t("sel.missing.symptoms", { symptoms: missingSymptomsTitle })}
              </strong>
              <p>
                {missingIds.length > 0 && `${missingIds.map((id) => labelOf(SYMPTOMS_BY_ID[id])).join(", ")}. `}
                {t("sel.missing.body")}
              </p>
              <div className="sync-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={onAppendMissing}>
                  <Plus size={15} aria-hidden="true" /> {t("sel.addToText")}
                </button>
                {!confirmRegen && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmRegen(true)}>
                    <RefreshCw size={15} aria-hidden="true" /> {t("sel.regenerate")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {reviewEdited && !hasMismatch && !confirmRegen && (
          <button
            type="button"
            className="btn btn-ghost btn-sm regen-button"
            onClick={() => setConfirmRegen(true)}
          >
            <RefreshCw size={15} aria-hidden="true" /> {t("sel.regenerate")}
          </button>
        )}

        {confirmRegen && (
          <div className="regen-confirm" role="alertdialog" aria-labelledby={`${ids}-regen`}>
            <p id={`${ids}-regen`}>{t("sel.confirmRegen")}</p>
            <div className="sync-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setConfirmRegen(false);
                  onRegenerate();
                }}
              >
                {t("sel.replace")}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmRegen(false)}>
                {t("sel.keep")}
              </button>
            </div>
          </div>
        )}

        <textarea
          id={`${ids}-review`}
          className="composer-textarea review-text"
          value={reviewText}
          onChange={(event) => onReviewTextChange(event.target.value)}
          placeholder={t("sel.reviewPlaceholder")}
          rows={4}
          maxLength={MAX_LENGTH}
          aria-describedby={`${ids}-review-help`}
        />
      </div>
    </div>
  );
}

export default SymptomSelector;
