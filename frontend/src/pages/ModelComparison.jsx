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
import { diseaseName } from "../i18n/diseaseNames";
import { useLanguage } from "../i18n/languageContext";
import { dec, NO_CHANGE, pct, signed } from "../utils/format";
import "./ModelComparison.css";

const COPY = {
  en: {
    metrics: { MacroF1: "Macro F1", Accuracy: "Accuracy", macroF1: "Macro F1", accuracy: "Accuracy", precision: "Precision", recall: "Recall" },
    metric: "Metric",
    onValidation: "{m} on the validation set",
    showTable: "Show data table",
    model: "Model",
    sel: {
      title: "Five algorithms, before and after tuning",
      lead: `Each pipeline was trained on ${DATASET.trainSamples} descriptions with default settings, then tuned with GridSearchCV. The tuned LinearSVC scored highest and became the final model.`,
      seriesA: "Default settings",
      seriesB: "Tuned",
      cols: ["Default accuracy", "Tuned accuracy", "Default Macro F1", "Tuned Macro F1", "Δ Macro F1"],
      foot: "Tuned values are stored rounded to four decimals in the source. pp = percentage points.",
      specTitle: "Selected: LinearSVC",
      specLead: "Best configuration found by 3-fold StratifiedGroupKFold search.",
      cv: "CV Macro F1",
      valAcc: "Validation accuracy",
      valF1: "Validation Macro F1",
      params: "Hyperparameters",
    },
    aug: {
      title: "Does more varied phrasing help?",
      lead: `${DATASET.augmentationCandidates} rule-based paraphrases were added to the training data (${DATASET.trainSamples} → ${DATASET.augmentedTrainSamples} descriptions). Every model was retrained and compared on the same validation set.`,
      finding: "Finding",
      findingText:
        "Augmentation left the SVM’s validation results unchanged. Logistic Regression improved slightly, KNN was unchanged, the MLP’s Macro F1 dropped slightly and Random Forest declined. The final model is trained on the original, non-augmented data.",
      seriesA: "Original training data",
      seriesB: "Augmented training data",
      original: "Original {m}",
      augmented: "Augmented {m}",
      change: "Change",
      distTitle: "Where the new training examples went",
      distLead: "Training descriptions per condition, before and after augmentation.",
    },
    cond: {
      title: "Results for each condition",
      lead: "{p} of {n} conditions were classified perfectly on the test set. These {k} were not:",
      precision: "Precision",
      recall: "Recall",
      tests: "{n} test descriptions",
      all: "All 24 conditions",
      allSub: "Precision, recall, F1 and support",
      cols: ["Condition", "Precision", "Recall", "F1", "Support"],
      matrixAlt: "Confusion matrix of the tuned LinearSVC on the test set across 24 conditions",
      matrixCaption: "Confusion matrix on the test set. Off-diagonal cells are errors.",
    },
    err: {
      title: "The {n} mistakes, explained",
      lead: "Every misclassified test description, with the interpretation recorded during error analysis.",
      actual: "Actual",
      predicted: "Predicted",
      interpretations: {},
    },
    tabs: ["Choosing a model", "Augmentation study", "Per condition", "Errors"],
    tabsLabel: "Model comparison sections",
    page: {
      eyebrow: "Model comparison",
      title: "How well does it work?",
      lead: "Five algorithms were compared, one was tuned and tested on descriptions it had never seen. Every figure here comes from the project’s evaluation outputs.",
      finalResult: "Final test result",
      caption: `accuracy for the tuned LinearSVC: ${FINAL_TEST.correct} of ${FINAL_TEST.testSamples} unseen descriptions matched correctly.`,
      macroF1: "Macro F1",
      macroP: "Macro precision",
      macroR: "Macro recall",
      guideVal: "used to compare, tune and run the augmentation study, so slightly optimistic.",
      guideTest: "held out until the end and used once, for the final model only.",
    },
  },
  sq: {
    metrics: { MacroF1: "Macro F1", Accuracy: "Accuracy", macroF1: "Macro F1", accuracy: "Accuracy", precision: "Precision", recall: "Recall" },
    metric: "Metrika",
    onValidation: "{m} në validation",
    showTable: "Shfaq tabelën e të dhënave",
    model: "Modeli",
    sel: {
      title: "Pesë algoritme, para dhe pas optimizimit",
      lead: `Çdo pipeline u trajnua me ${DATASET.trainSamples} përshkrime me parametrat fillestarë, pastaj u optimizua me GridSearchCV. LinearSVC i optimizuar doli i pari dhe u bë modeli përfundimtar.`,
      seriesA: "Parametrat fillestarë",
      seriesB: "I optimizuar",
      cols: ["Accuracy fillestare", "Accuracy pas optimizimit", "Macro F1 fillestar", "Macro F1 pas optimizimit", "Δ Macro F1"],
      foot: "Vlerat pas optimizimit janë ruajtur të rrumbullakosura në katër shifra dhjetore. pp = pikë përqindjeje.",
      specTitle: "I zgjedhur: LinearSVC",
      specLead: "Konfigurimi më i mirë i gjetur me kërkim 3-fold StratifiedGroupKFold.",
      cv: "CV Macro F1",
      valAcc: "Accuracy në validation",
      valF1: "Macro F1 në validation",
      params: "Hiperparametrat",
    },
    aug: {
      title: "A ndihmon formulimi më i larmishëm?",
      lead: `${DATASET.augmentationCandidates} parafrazime të krijuara me rregulla u shtuan në të dhënat e trajnimit (${DATASET.trainSamples} → ${DATASET.augmentedTrainSamples} përshkrime). Çdo model u ritrajnua dhe u krahasua në të njëjtin validation.`,
      finding: "Gjetja",
      findingText:
        "Augmentimi nuk i ndryshoi rezultatet e SVM-së në validation. Logistic Regression u përmirësua pak, KNN mbeti i njëjtë, Macro F1 i MLP-së ra pak dhe Random Forest u dobësua. Modeli përfundimtar është trajnuar me të dhënat origjinale, pa augmentim.",
      seriesA: "Të dhënat origjinale",
      seriesB: "Të dhënat me augmentim",
      original: "{m} origjinale",
      augmented: "{m} me augmentim",
      change: "Ndryshimi",
      distTitle: "Ku shkuan shembujt e rinj të trajnimit",
      distLead: "Përshkrimet e trajnimit për çdo sëmundje, para dhe pas augmentimit.",
    },
    cond: {
      title: "Rezultatet për çdo sëmundje",
      lead: "{p} nga {n} sëmundje u klasifikuan pa gabim në test. Këto {k} jo:",
      precision: "Precision",
      recall: "Recall",
      tests: "{n} përshkrime testi",
      all: "Të 24 sëmundjet",
      allSub: "Precision, recall, F1 dhe numri i teksteve",
      cols: ["Sëmundja", "Precision", "Recall", "F1", "Tekste"],
      matrixAlt: "Matrica e konfuzionit e LinearSVC në test për 24 sëmundje",
      matrixCaption: "Matrica e konfuzionit në test. Qelizat jashtë diagonales janë gabime.",
    },
    err: {
      title: "{n} gabimet, të shpjeguara",
      lead: "Çdo përshkrim testi i klasifikuar gabim, me interpretimin e shënuar gjatë analizës së gabimeve.",
      actual: "Reale",
      predicted: "E parashikuar",
      interpretations: {
        "Non-specific symptoms and possible overlap in textual descriptions.":
          "Simptoma jo specifike dhe mbivendosje e mundshme në përshkrimet me tekst.",
        "Symptoms lack medication context; possible learned statistical associations.":
          "Simptomave u mungon konteksti i barnave; lidhje të mundshme statistikore të mësuara.",
      },
    },
    tabs: ["Zgjedhja e modelit", "Studimi i augmentimit", "Për çdo sëmundje", "Gabimet"],
    tabsLabel: "Seksionet e krahasimit të modeleve",
    page: {
      eyebrow: "Krahasimi i modeleve",
      title: "Sa mirë funksionon?",
      lead: "U krahasuan pesë algoritme; njëri u optimizua dhe u testua me përshkrime që nuk i kishte parë kurrë. Çdo shifër këtu vjen nga rezultatet e vlerësimit të projektit. Testi është bërë me tekste në anglisht.",
      finalResult: "Rezultati përfundimtar në test",
      caption: `accuracy për LinearSVC të optimizuar: ${FINAL_TEST.correct} nga ${FINAL_TEST.testSamples} përshkrime të reja u përputhën saktë.`,
      macroF1: "Macro F1",
      macroP: "Macro precision",
      macroR: "Macro recall",
      guideVal: "përdoret për krahasim, optimizim dhe studimin e augmentimit, prandaj është pak optimist.",
      guideTest: "mbahet veçmas deri në fund dhe përdoret një herë, vetëm për modelin përfundimtar.",
    },
  },
};

const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (_, k) => vars[k]);

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

function ModelSelection({ c }) {
  const [metric, setMetric] = useState("MacroF1");
  const options = ["MacroF1", "Accuracy"].map((value) => ({ value, label: c.metrics[value] }));
  const label = c.metrics[metric];

  return (
    <>
      <PanelHead title={c.sel.title} split="validation">
        {c.sel.lead}
      </PanelHead>

      <div className="viz-card">
        <div className="viz-toolbar">
          <SegmentedControl label={c.metric} options={options} value={metric} onChange={setMetric} />
        </div>
        <DotComparisonChart
          rows={BASELINE_VS_TUNED}
          metricLabel={fill(c.onValidation, { m: label })}
          seriesA={{ label: c.sel.seriesA, get: (row) => row[`baseline${metric}`] }}
          seriesB={{ label: c.sel.seriesB, get: (row) => row[`tuned${metric}`] }}
        />
        <Disclosure icon={Table2} title={c.showTable} className="subtle table-disclosure">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{c.model}</th>
                  {c.sel.cols.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
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
          <p className="table-foot">{c.sel.foot}</p>
          <SourceNote>
            {SOURCES.baseline}, {SOURCES.tuned}
          </SourceNote>
        </Disclosure>
      </div>

      <div className="spec-sheet">
        <div className="spec-title">
          <Trophy size={18} aria-hidden="true" />
          <div>
            <h3>{c.sel.specTitle}</h3>
            <p>{c.sel.specLead}</p>
          </div>
        </div>
        <dl className="spec-grid">
          <div>
            <dt>{c.sel.cv}</dt>
            <dd>{pct(SVM_TUNING.cvMacroF1)}</dd>
            <SplitBadge split="cv" />
          </div>
          <div>
            <dt>{c.sel.valAcc}</dt>
            <dd>{pct(SVM_TUNING.validationAccuracy)}</dd>
            <SplitBadge split="validation" />
          </div>
          <div>
            <dt>{c.sel.valF1}</dt>
            <dd>{pct(SVM_TUNING.validationMacroF1)}</dd>
            <SplitBadge split="validation" />
          </div>
          <div className="spec-params">
            <dt>{c.sel.params}</dt>
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

function AugmentationStudy({ c }) {
  const [metric, setMetric] = useState("macroF1");
  const options = ["macroF1", "accuracy", "precision", "recall"].map((value) => ({ value, label: c.metrics[value] }));
  const label = c.metrics[metric];

  return (
    <>
      <PanelHead title={c.aug.title} split="validation">
        {c.aug.lead}
      </PanelHead>

      <div className="insight">
        <span className="insight-label">{c.aug.finding}</span>
        <p>{c.aug.findingText}</p>
      </div>

      <div className="viz-card">
        <div className="viz-toolbar">
          <SegmentedControl label={c.metric} options={options} value={metric} onChange={setMetric} />
        </div>
        <DotComparisonChart
          rows={AUGMENTATION_RESULTS}
          metricLabel={fill(c.onValidation, { m: label })}
          seriesA={{ label: c.aug.seriesA, get: (row) => row.original[metric] }}
          seriesB={{ label: c.aug.seriesB, get: (row) => row.augmented[metric] }}
        />
        <Disclosure icon={Table2} title={c.showTable} className="subtle table-disclosure">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{c.model}</th>
                  <th>{fill(c.aug.original, { m: label })}</th>
                  <th>{fill(c.aug.augmented, { m: label })}</th>
                  <th>{c.aug.change}</th>
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
        <h3 className="viz-title">{c.aug.distTitle}</h3>
        <p className="viz-sub">{c.aug.distLead}</p>
        <ClassDistributionChart data={CLASS_DISTRIBUTION} />
        <SourceNote>{SOURCES.classDistribution}</SourceNote>
      </div>
    </>
  );
}

function PerCondition({ c, lang }) {
  const imperfect = [...TEST_CLASSIFICATION_REPORT].filter((row) => row.f1 < 1).sort((a, b) => a.f1 - b.f1);
  const perfectCount = TEST_CLASSIFICATION_REPORT.length - imperfect.length;

  return (
    <>
      <PanelHead title={c.cond.title} split="test">
        {fill(c.cond.lead, { p: perfectCount, n: TEST_CLASSIFICATION_REPORT.length, k: imperfect.length })}
      </PanelHead>

      <div className="condition-scores">
        {imperfect.map((row) => (
          <div key={row.label} className="cond-score">
            <div className="cond-score-head">
              <h3>{diseaseName(row.label, lang)}</h3>
              <span className="cond-f1">F1 {dec(row.f1, 2)}</span>
            </div>
            {[
              [c.cond.precision, row.precision],
              [c.cond.recall, row.recall],
            ].map(([name, value]) => (
              <div key={name} className="meter">
                <span>{name}</span>
                <div className="meter-track">
                  <i style={{ width: `${value * 100}%` }} />
                </div>
                <b>{dec(value, 2)}</b>
              </div>
            ))}
            <p className="cond-support">{fill(c.cond.tests, { n: row.support })}</p>
          </div>
        ))}
      </div>

      <div className="split-2">
        <Disclosure icon={Table2} title={c.cond.all} subtitle={c.cond.allSub} className="subtle">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {c.cond.cols.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEST_CLASSIFICATION_REPORT.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{diseaseName(row.label, lang)}</th>
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
          alt={c.cond.matrixAlt}
          caption={c.cond.matrixCaption}
          source={SOURCES.confusionMatrix}
        />
      </div>
    </>
  );
}

function Errors({ c, lang }) {
  return (
    <>
      <PanelHead title={fill(c.err.title, { n: FINAL_TEST.incorrect })} split="test">
        {c.err.lead}
      </PanelHead>

      <div className="error-list">
        {TEST_ERRORS.map((row) => (
          <div key={row.actual} className="error-item">
            <div className="error-path">
              <div>
                <span>{c.err.actual}</span>
                <strong>{diseaseName(row.actual, lang)}</strong>
              </div>
              <ArrowRight size={20} aria-hidden="true" />
              <div className="predicted">
                <span>{c.err.predicted}</span>
                <strong>{diseaseName(row.predicted, lang)}</strong>
              </div>
            </div>
            <p>{c.err.interpretations[row.interpretation] ?? row.interpretation}</p>
          </div>
        ))}
      </div>
      <SourceNote>{SOURCES.errors}</SourceNote>
    </>
  );
}

function ModelComparison() {
  const { lang } = useLanguage();
  const c = COPY[lang];
  const [tab, setTab] = useState("selection");

  const tabs = [
    { value: "selection", label: c.tabs[0], icon: Trophy, content: <ModelSelection c={c} /> },
    { value: "augmentation", label: c.tabs[1], icon: Layers, content: <AugmentationStudy c={c} /> },
    { value: "conditions", label: c.tabs[2], icon: ListOrdered, content: <PerCondition c={c} lang={lang} /> },
    { value: "errors", label: c.tabs[3], icon: SearchX, content: <Errors c={c} lang={lang} /> },
  ];

  return (
    <div className="models-page">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">{c.page.eyebrow}</span>
          <h1>{c.page.title}</h1>
          <p>{c.page.lead}</p>
        </header>

        <section className="scoreboard" aria-labelledby="score-title">
          <div className="score-main">
            <SplitBadge split="test" />
            <h2 id="score-title" className="sr-only">
              {c.page.finalResult}
            </h2>
            <p className="score-number">{pct(FINAL_TEST.accuracy)}</p>
            <p className="score-caption">{c.page.caption}</p>
            <dl className="score-stats">
              <div>
                <dt>{c.page.macroF1}</dt>
                <dd>{pct(FINAL_TEST.macroF1)}</dd>
              </div>
              <div>
                <dt>{c.page.macroP}</dt>
                <dd>{pct(FINAL_TEST.macroPrecision)}</dd>
              </div>
              <div>
                <dt>{c.page.macroR}</dt>
                <dd>{pct(FINAL_TEST.macroRecall)}</dd>
              </div>
            </dl>
            <SourceNote>{SOURCES.finalTest}</SourceNote>
          </div>
          <OutcomeGrid correct={FINAL_TEST.correct} incorrect={FINAL_TEST.incorrect} />
        </section>

        <div className="split-guide">
          <p>
            <SplitBadge split="validation" /> {c.page.guideVal}
          </p>
          <p>
            <SplitBadge split="test" /> {c.page.guideTest}
          </p>
        </div>

        <section className="model-tabs">
          <Tabs tabs={tabs} value={tab} onChange={setTab} label={c.tabsLabel} />
        </section>
      </div>
    </div>
  );
}

export default ModelComparison;
