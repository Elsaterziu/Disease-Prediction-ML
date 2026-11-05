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

function matches(symptom, query) {
  if (!query) return true;
  return [symptom.label, symptom.phrase, ...symptom.aliases].some((text) =>
    text.toLowerCase().includes(query)
  );
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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [confirmRegen, setConfirmRegen] = useState(false);
  const ids = useId();
  const query = search.trim().toLowerCase();
  const selected = new Set(selectedIds);
  const missingIds = reviewEdited ? symptomsMissingFromText(selectedIds, reviewText) : [];
  const noteMissing = reviewEdited && detailsMissingFromText(extraDetails, reviewText);
  const hasMismatch = missingIds.length > 0 || noteMissing;
  const missingSymptomsTitle =
    missingIds.length === 1 ? "1 selected symptom" : `${missingIds.length} selected symptoms`;

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
        <span>
          A writing aid, not a clinical checklist. The model only reads the
          sentence in step 2, never your selections.
        </span>
      </p>

      <div className="selector-step">
        <div className="selector-step-head">
          <span className="step-badge">1</span>
          <h3>Pick what you’re experiencing</h3>
        </div>

        <div className="search-field">
          <Search size={18} aria-hidden="true" />
          <label htmlFor={`${ids}-search`} className="sr-only">
            Search symptoms
          </label>
          <input
            id={`${ids}-search`}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search 52 symptoms: cough, rash, dizzy…"
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="category-pills" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={activeCategory === "all" ? "cat-pill active" : "cat-pill"}
            aria-pressed={activeCategory === "all"}
            onClick={() => setCategory("all")}
            disabled={Boolean(query)}
          >
            <LayoutGrid size={15} aria-hidden="true" /> All
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
                {c.label}
                {count > 0 && (
                  <span className="cat-count" aria-label={`${count} selected`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="symptom-groups">
          {visibleCategories.length === 0 && (
            <p className="no-match">
              No symptoms match “{search.trim()}”. Add it in your own words under
              “Anything else?” below.
            </p>
          )}

          {visibleCategories.map((c) => (
            <fieldset key={c.id} className="symptom-group">
              <legend>{c.label}</legend>
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
                      {symptom.label}
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
              <strong>{selectedIds.length}</strong> selected
            </span>
            {selectedIds.length > 0 && (
              <button type="button" className="link-button" onClick={onClear}>
                Clear all
              </button>
            )}
          </div>
          {selectedIds.length > 0 && (
            <ul className="selected-list">
              {selectedIds.map((id) => (
                <li key={id}>
                  {SYMPTOMS_BY_ID[id].label}
                  <button
                    type="button"
                    onClick={() => onToggle(id)}
                    aria-label={`Remove ${SYMPTOMS_BY_ID[id].label}`}
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label htmlFor={`${ids}-extra`} className="composer-label small-label">
          Anything else? <span className="optional">Optional</span>
        </label>
        <textarea
          id={`${ids}-extra`}
          className="composer-textarea short"
          value={extraDetails}
          onChange={(event) => onExtraDetailsChange(event.target.value)}
          placeholder="For example: It started three days ago and is worse at night."
          rows={2}
          maxLength={1000}
        />
      </div>

      <div className={reviewEdited ? "selector-step review edited" : "selector-step review"}>
        <div className="selector-step-head">
          <span className="step-badge">2</span>
          <h3>
            <label htmlFor={`${ids}-review`}>Review the text that will be analysed</label>
          </h3>
          <span className={reviewEdited ? "review-status edited" : "review-status"}>
            {reviewEdited ? (
              <>
                <PencilLine size={13} aria-hidden="true" /> Edited by you
              </>
            ) : (
              <>
                <Wand2 size={13} aria-hidden="true" /> Drafted from selection
              </>
            )}
          </span>
        </div>
        <p className="review-help" id={`${ids}-review-help`}>
          {reviewEdited
            ? "You edited this text, so selecting symptoms or adding notes no longer changes it. Only this text is sent."
            : "Updates as you pick symptoms. Edit freely; only this exact text is sent."}
        </p>

        {hasMismatch && (
          <div className="sync-warning" role="status">
            <AlertTriangle size={17} aria-hidden="true" />
            <div>
              <strong>
                {missingIds.length > 0 && noteMissing
                  ? `${missingSymptomsTitle} and your “Anything else?” note may not be in your text`
                  : noteMissing
                    ? "Your “Anything else?” note is not in your text"
                    : `${missingSymptomsTitle} may not be in your text`}
              </strong>
              <p>
                {missingIds.length > 0 &&
                  `${missingIds.map((id) => SYMPTOMS_BY_ID[id].label).join(", ")}. `}
                Only the text below is analysed, not your selections or notes.
              </p>
              <div className="sync-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={onAppendMissing}>
                  <Plus size={15} aria-hidden="true" /> Add to my text
                </button>
                {!confirmRegen && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setConfirmRegen(true)}
                  >
                    <RefreshCw size={15} aria-hidden="true" /> Regenerate from selection
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
            <RefreshCw size={15} aria-hidden="true" /> Regenerate from selection
          </button>
        )}

        {confirmRegen && (
          <div className="regen-confirm" role="alertdialog" aria-labelledby={`${ids}-regen`}>
            <p id={`${ids}-regen`}>
              Replace your edited text with a new draft from your selections? Your
              edits will be lost.
            </p>
            <div className="sync-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setConfirmRegen(false);
                  onRegenerate();
                }}
              >
                Replace text
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmRegen(false)}>
                Keep my text
              </button>
            </div>
          </div>
        )}

        <textarea
          id={`${ids}-review`}
          className="composer-textarea review-text"
          value={reviewText}
          onChange={(event) => onReviewTextChange(event.target.value)}
          placeholder="Your description will be drafted here as you pick symptoms."
          rows={4}
          maxLength={MAX_LENGTH}
          aria-describedby={`${ids}-review-help`}
        />
      </div>
    </div>
  );
}

export default SymptomSelector;
