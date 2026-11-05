import { ArrowRight, Layers, ListOrdered, SearchX, Table2, Trophy } from "lucide-react";
import { useState } from "react";
import ClassDistributionChart from "../components/charts/ClassDistributionChart";
import DotComparisonChart from "../components/charts/DotComparisonChart";
import OutcomeGrid from "../components/charts/OutcomeGrid";
import {
  Disclosure,
  Figure,
  SegmentedControl,
  SourceNote,
  SplitBadge,
  Tabs,
} from "../components/ui";
import {
  AUGMENTATION_RESULTS,
  BASELINE_VS_TUNED,
  CLASS_DISTRIBUTION,
  DATASET,
  FINAL_TEST,
  SOURCES,
  SVM_TUNING,
  TEST_CLASSIFICATION_REPORT,
  TEST_ERRORS,
} from "../data/researchResults";
import { conditionName, dec, NO_CHANGE, pct, signed } from "../utils/format";
import "./ModelComparison.css";

const TUNING_METRICS = [
  { value: "MacroF1", label: "Macro F1" },
  { value: "Accuracy", label: "Accuracy" },
];

const AUGMENTATION_METRICS = [
  { value: "macroF1", label: "Macro F1" },
  { value: "accuracy", label: "Accuracy" },
  { value: "precision", label: "Precision" },
  { value: "recall", label: "Recall" },
];

function deltaClass(value) {
  if (value >= NO_CHANGE) return "delta up";
  if (value <= -NO_CHANGE) return "delta down";
  return "delta flat";
}

function PanelHead({ title, split, children }) {
  return (
    <div className="panel-head">
      <div>
        <h2>{title}</h2>
        {children && <p>{children}</p>}
      </div>
      {split && <SplitBadge split={split} />}
    </div>
  );
}

function ModelSelection() {
  const [metric, setMetric] = useState("MacroF1");
  const label = TUNING_METRICS.find((m) => m.value === metric).label;

  return (
    <>
      <PanelHead title="Five algorithms, before and after tuning" split="validation">
        Each pipeline was trained on {DATASET.trainSamples} descriptions with
        default settings, then tuned with GridSearchCV. The tuned LinearSVC
        scored highest and became the final model.
      </PanelHead>

      <div className="viz-card">
        <div className="viz-toolbar">
          <SegmentedControl label="Metric" options={TUNING_METRICS} value={metric} onChange={setMetric} />
        </div>
        <DotComparisonChart
          rows={BASELINE_VS_TUNED}
          metricLabel={`${label} on the validation set`}
          seriesA={{ label: "Default settings", get: (row) => row[`baseline${metric}`] }}
          seriesB={{ label: "Tuned", get: (row) => row[`tuned${metric}`] }}
        />
        <Disclosure icon={Table2} title="Show data table" className="subtle table-disclosure">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Default accuracy</th>
                  <th>Tuned accuracy</th>
                  <th>Default Macro F1</th>
                  <th>Tuned Macro F1</th>
                  <th>Δ Macro F1</th>
                </tr>
              </thead>
              <tbody>
                {BASELINE_VS_TUNED.map((row) => {
                  const delta = row.tunedMacroF1 - row.baselineMacroF1;
                  return (
                    <tr key={row.model}>
                      <th scope="row">{row.model}</th>
                      <td>{pct(row.baselineAccuracy)}</td>
                      <td>{pct(row.tunedAccuracy)}</td>
                      <td>{pct(row.baselineMacroF1)}</td>
                      <td>{pct(row.tunedMacroF1)}</td>
                      <td>
                        <span className={deltaClass(delta)}>{signed(delta)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="table-foot">
            Tuned values are stored rounded to four decimals in the source.
            pp = percentage points.
          </p>
          <SourceNote>
            {SOURCES.baseline}, {SOURCES.tuned}
          </SourceNote>
        </Disclosure>
      </div>

      <div className="spec-sheet">
        <div className="spec-title">
          <Trophy size={18} aria-hidden="true" />
          <div>
            <h3>Selected: LinearSVC</h3>
            <p>Best configuration found by 3-fold StratifiedGroupKFold search.</p>
          </div>
        </div>
        <dl className="spec-grid">
          <div>
            <dt>CV Macro F1</dt>
            <dd>{pct(SVM_TUNING.cvMacroF1)}</dd>
            <SplitBadge split="cv" />
          </div>
          <div>
            <dt>Validation accuracy</dt>
            <dd>{pct(SVM_TUNING.validationAccuracy)}</dd>
            <SplitBadge split="validation" />
          </div>
          <div>
            <dt>Validation Macro F1</dt>
            <dd>{pct(SVM_TUNING.validationMacroF1)}</dd>
            <SplitBadge split="validation" />
          </div>
          <div className="spec-params">
            <dt>Hyperparameters</dt>
            <dd>
              {Object.entries(SVM_TUNING.bestParameters).map(([key, value]) => (
                <code key={key}>
                  {key} = {String(value)}
                </code>
              ))}
            </dd>
          </div>
        </dl>
        <SourceNote>{SOURCES.svmTuning}</SourceNote>
      </div>
    </>
  );
}

function AugmentationStudy() {
  const [metric, setMetric] = useState("macroF1");
  const label = AUGMENTATION_METRICS.find((m) => m.value === metric).label;

  return (
    <>
      <PanelHead title="Does more varied phrasing help?" split="validation">
        {DATASET.augmentationCandidates} rule-based paraphrases were added to the
        training data ({DATASET.trainSamples} → {DATASET.augmentedTrainSamples}{" "}
        descriptions). Every model was retrained and compared on the same
        validation set.
      </PanelHead>

      <div className="insight">
        <span className="insight-label">Finding</span>
        <p>
          Augmentation left the SVM’s validation results unchanged. Logistic
          Regression improved slightly, KNN was unchanged, the MLP’s Macro F1
          dropped slightly and Random Forest declined. The final model is
          trained on the original, non-augmented data.
        </p>
      </div>

      <div className="viz-card">
        <div className="viz-toolbar">
          <SegmentedControl label="Metric" options={AUGMENTATION_METRICS} value={metric} onChange={setMetric} />
        </div>
        <DotComparisonChart
          rows={AUGMENTATION_RESULTS}
          metricLabel={`${label} on the validation set`}
          seriesA={{ label: "Original training data", get: (row) => row.original[metric] }}
          seriesB={{ label: "Augmented training data", get: (row) => row.augmented[metric] }}
        />
        <Disclosure icon={Table2} title="Show data table" className="subtle table-disclosure">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Original {label}</th>
                  <th>Augmented {label}</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {AUGMENTATION_RESULTS.map((row) => {
                  const delta = row.augmented[metric] - row.original[metric];
                  return (
                    <tr key={row.model}>
                      <th scope="row">{row.model}</th>
                      <td>{pct(row.original[metric])}</td>
                      <td>{pct(row.augmented[metric])}</td>
                      <td>
                        <span className={deltaClass(delta)}>{signed(delta)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <SourceNote>{SOURCES.augmentation}</SourceNote>
        </Disclosure>
      </div>

      <div className="viz-card">
        <h3 className="viz-title">Where the new training examples went</h3>
        <p className="viz-sub">Training descriptions per condition, before and after augmentation.</p>
        <ClassDistributionChart data={CLASS_DISTRIBUTION} />
        <SourceNote>{SOURCES.classDistribution}</SourceNote>
      </div>
    </>
  );
}

function PerCondition() {
  const imperfect = [...TEST_CLASSIFICATION_REPORT]
    .filter((row) => row.f1 < 1)
    .sort((a, b) => a.f1 - b.f1);
  const perfectCount = TEST_CLASSIFICATION_REPORT.length - imperfect.length;

  return (
    <>
      <PanelHead title="Results for each condition" split="test">
        {perfectCount} of {TEST_CLASSIFICATION_REPORT.length} conditions were
        classified perfectly on the test set. These {imperfect.length} were not:
      </PanelHead>

      <div className="condition-scores">
        {imperfect.map((row) => (
          <div key={row.label} className="cond-score">
            <div className="cond-score-head">
              <h3>{conditionName(row.label)}</h3>
              <span className="cond-f1">F1 {dec(row.f1, 2)}</span>
            </div>
            {[
              ["Precision", row.precision],
              ["Recall", row.recall],
            ].map(([name, value]) => (
              <div key={name} className="meter">
                <span>{name}</span>
                <div className="meter-track">
                  <i style={{ width: `${value * 100}%` }} />
                </div>
                <b>{dec(value, 2)}</b>
              </div>
            ))}
            <p className="cond-support">{row.support} test descriptions</p>
          </div>
        ))}
      </div>

      <div className="split-2">
        <Disclosure icon={Table2} title="All 24 conditions" subtitle="Precision, recall, F1 and support" className="subtle">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Condition</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1</th>
                  <th>Support</th>
                </tr>
              </thead>
              <tbody>
                {TEST_CLASSIFICATION_REPORT.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{conditionName(row.label)}</th>
                    <td>{dec(row.precision, 2)}</td>
                    <td>{dec(row.recall, 2)}</td>
                    <td>{dec(row.f1, 2)}</td>
                    <td>{row.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SourceNote>{SOURCES.classificationReport}</SourceNote>
        </Disclosure>

        <Figure
          src="/figures/svm_final_confusion_matrix.png"
          alt="Confusion matrix of the tuned LinearSVC on the test set across 24 conditions"
          caption="Confusion matrix on the test set. Off-diagonal cells are errors."
          source={SOURCES.confusionMatrix}
        />
      </div>
    </>
  );
}

function Errors() {
  return (
    <>
      <PanelHead title={`The ${FINAL_TEST.incorrect} mistakes, explained`} split="test">
        Every misclassified test description, with the interpretation recorded
        during error analysis.
      </PanelHead>

      <div className="error-list">
        {TEST_ERRORS.map((row) => (
          <div key={row.actual} className="error-item">
            <div className="error-path">
              <div>
                <span>Actual</span>
                <strong>{conditionName(row.actual)}</strong>
              </div>
              <ArrowRight size={20} aria-hidden="true" />
              <div className="predicted">
                <span>Predicted</span>
                <strong>{conditionName(row.predicted)}</strong>
              </div>
            </div>
            <p>{row.interpretation}</p>
          </div>
        ))}
      </div>
      <SourceNote>{SOURCES.errors}</SourceNote>
    </>
  );
}

const TABS = [
  { value: "selection", label: "Choosing a model", icon: Trophy, content: <ModelSelection /> },
  { value: "augmentation", label: "Augmentation study", icon: Layers, content: <AugmentationStudy /> },
  { value: "conditions", label: "Per condition", icon: ListOrdered, content: <PerCondition /> },
  { value: "errors", label: "Errors", icon: SearchX, content: <Errors /> },
];

function ModelComparison() {
  const [tab, setTab] = useState("selection");

  return (
    <div className="models-page">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">Model comparison</span>
          <h1>How well does it work?</h1>
          <p>
            Five algorithms were compared, one was tuned and tested on
            descriptions it had never seen. Every figure here comes from the
            project’s evaluation outputs.
          </p>
        </header>

        <section className="scoreboard" aria-labelledby="score-title">
          <div className="score-main">
            <SplitBadge split="test" />
            <h2 id="score-title" className="sr-only">
              Final test result
            </h2>
            <p className="score-number">{pct(FINAL_TEST.accuracy)}</p>
            <p className="score-caption">
              accuracy for the tuned LinearSVC: {FINAL_TEST.correct} of{" "}
              {FINAL_TEST.testSamples} unseen descriptions matched correctly.
            </p>
            <dl className="score-stats">
              <div>
                <dt>Macro F1</dt>
                <dd>{pct(FINAL_TEST.macroF1)}</dd>
              </div>
              <div>
                <dt>Macro precision</dt>
                <dd>{pct(FINAL_TEST.macroPrecision)}</dd>
              </div>
              <div>
                <dt>Macro recall</dt>
                <dd>{pct(FINAL_TEST.macroRecall)}</dd>
              </div>
            </dl>
            <SourceNote>{SOURCES.finalTest}</SourceNote>
          </div>
          <OutcomeGrid correct={FINAL_TEST.correct} incorrect={FINAL_TEST.incorrect} />
        </section>

        <div className="split-guide">
          <p>
            <SplitBadge split="validation" /> used to compare, tune and run the
            augmentation study, so slightly optimistic.
          </p>
          <p>
            <SplitBadge split="test" /> held out until the end and used once, for
            the final model only.
          </p>
        </div>

        <section className="model-tabs">
          <Tabs tabs={TABS} value={tab} onChange={setTab} label="Model comparison sections" />
        </section>
      </div>
    </div>
  );
}

export default ModelComparison;
