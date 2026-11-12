import { ArrowRight, Boxes, Cpu, Monitor, Server } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Figure, SourceNote } from "../components/ui";
import { DATASET, LIME_EXAMPLES, OVERFITTING, SOURCES, SVM_TUNING } from "../data/researchResults";
import { diseaseName } from "../i18n/diseaseNames";
import { useLanguage } from "../i18n/languageContext";
import "./Methodology.css";

// Loaded on demand so the chart library stays out of the main bundle
// (this page is not lazy-loaded itself).
const SplitAccuracyChart = lazy(() => import("../components/charts/SplitAccuracyChart"));

const SECTION_IDS = [
  "about", "dataset", "preparation", "models", "tuning", "augmentation", "explainability", "architecture", "generalization", "limitations",
];
const ARCH_ICONS = [Monitor, Server, Cpu, Boxes];
const n = (v) => v.toLocaleString("en-US");
const p1 = (v) => `${(v * 100).toFixed(1)}%`;
const p2 = (v) => `${(v * 100).toFixed(2)}%`;
const O = OVERFITTING;
const GAP = ((O.svm.train - O.svm.test) * 100).toFixed(2);
const CV = `${p1(O.groupCv.mean)} ± ${(O.groupCv.std * 100).toFixed(1)}%`;
const AGREE = p1(O.unseen.agree / O.unseen.labelled);

// Page text in both languages. Numbers come from researchResults.js.
const COPY = {
  en: {
    eyebrow: "About & methodology",
    title: "How Symptom2Disease was built, and where it falls short.",
    lead: "The data, models and evaluation behind every result, plus the limits you should keep in mind when reading one.",
    toc: "On this page",
    sections: ["About the project", "Dataset", "Preparing the data", "Models compared", "Tuning", "Augmentation", "Explainability", "Architecture", "Overfitting and Generalization Analysis", "Limitations"],
    about: [
      "Symptom2Disease began as a bachelor’s thesis in machine learning. The question was simple: how well can a classical, explainable text classifier map a patient-style description of symptoms to a disease, and can it show its reasoning?",
      "The result is a working end-to-end system: a trained model, a prediction service, and this interface. It is an educational and research tool. It has not been clinically validated and must not be used to make medical decisions.",
    ],
    facts: ["raw descriptions", "unique after cleaning", "disease labels"],
    dataset: `The study uses the public ${DATASET.name} dataset: short, first-person English descriptions of symptoms, each labelled with one disease. Exact duplicate texts were removed before any modelling.`,
    prep1:
      "Many descriptions are close paraphrases of each other. A random split would place near-identical texts in both training and evaluation data and inflate the scores. Texts with a similarity of 0.85 or higher were therefore linked into groups, and the data was split with GroupShuffleSplit so that no group appears in more than one split.",
    splitAria: `Training ${DATASET.trainSamples}, validation ${DATASET.validationSamples}, test ${DATASET.testSamples} descriptions`,
    splits: ["Training", "Validation", "Test"],
    defs: [
      ["Training", "Fits the models."],
      ["Validation", "Compares models, tunes hyperparameters and evaluates augmentation."],
      ["Test", "Used once, for the final evaluation of the selected model only."],
    ],
    prep2:
      "Text becomes numbers through a lower-cased TF-IDF vectoriser, which weights each word by how often it appears in a description relative to how common it is overall. The vectoriser is part of each model pipeline, so it only ever learns from training data.",
    models:
      "Five scikit-learn classifiers were trained as TF-IDF → classifier pipelines with a fixed random seed (42, where applicable). Quality is reported mainly as Macro F1, the unweighted mean F1 across all conditions, so every disease counts equally.",
    modelList: [
      ["Support Vector Machine (LinearSVC)", "Finds a maximum-margin linear boundary per class. Well suited to sparse, high-dimensional TF-IDF features. Selected as the final model."],
      ["Logistic Regression", "A linear probabilistic classifier and a strong, interpretable baseline for text."],
      ["K-Nearest Neighbours", "Predicts from the most similar training descriptions in TF-IDF space."],
      ["Random Forest", "An ensemble of decision trees; captures non-linear interactions but is less suited to very sparse input."],
      ["Neural Network (MLP)", "A multi-layer perceptron on TF-IDF features; the most flexible model in the comparison."],
    ],
    finalModel: "Final model",
    tuning1:
      "Each model was tuned with GridSearchCV using a 3-fold StratifiedGroupKFold on the training set, which keeps the near-duplicate groups intact across folds, with Macro F1 as the objective. The best configuration was then scored on the validation set.",
    tuning2: `The selected LinearSVC uses C = ${SVM_TUNING.bestParameters.C}, single words as features (ngram_range = (1, 1)) and min_df = 1.`,
    aug1: `To test whether more varied phrasing improves generalisation, ${DATASET.augmentationCandidates} new training descriptions were generated by controlled, rule-based phrase replacement, for example “I have been experiencing” → “I have”.`,
    aug2:
      "Generated texts were checked for missing values, duplicates, unchanged texts, invalid labels and exact overlap with the validation and test sets. A preliminary language review was started, but a complete human review of their meaning was not finished. Augmentation did not improve the SVM, so the final model uses the original training data.",
    xaiLead: "Two complementary methods explain the model’s behaviour.",
    liveTitle: "Live word contributions",
    live:
      "LinearSVC is a linear model, so its score for a class is a sum of per-word terms. For each word in your description, the symptom check can show TF-IDF value × class coefficient for the predicted condition. It is exact for this model and cheap to compute on every request. Values are decision-score contributions, not probabilities.",
    liveAlt: "Bar chart of SVM word contributions for a validation example predicted as Migraine",
    liveCaption: "Word contributions for a validation description correctly matched to Migraine.",
    limeTitle: "LIME (offline analysis)",
    lime:
      "LIME removes words from a description and fits a simple local model to see which removals change the outcome. Because LinearSVC has no probability output, LIME was applied to a softmax of the SVM decision scores; these are not calibrated probabilities. One correct and one incorrect validation prediction were analysed.",
    limeAlt: "LIME explanation: actual {a}, predicted {p}",
    limeCaption: "{kind}: actual “{a}”, predicted “{p}”.",
    limeKinds: { "Correct prediction": "Correct prediction", "Incorrect prediction": "Incorrect prediction" },
    archLead: "A request travels through four layers and back.",
    arch: [
      ["React frontend", "Collects and checks the description, shows the result."],
      ["ASP.NET Core 8 API", "POST /api/prediction validates input and forwards it."],
      ["Flask ML service", "POST /predict validates the input, rewrites medical terms in plain words, excludes negated symptoms, runs the model and checks for a sufficient match before returning a result with word contributions."],
      ["Trained pipeline", "TF-IDF + LinearSVC, loaded from a joblib file."],
    ],
    gen: {
      lead: "To check for overfitting, the final SVM was compared across the training, validation and test sets and evaluated with group cross-validation (5 × 5 folds on the training and validation data, keeping similar texts in the same fold). The test set was not used to choose anything.",
      facts: ["Training accuracy", "Validation accuracy", "Test accuracy", "Group cross-validation"],
      splits: ["Training", "Validation", "Test"],
      chart: { metric: "Accuracy (SVM)", band: "Group cross-validation, mean ± SD", axis: "Accuracy" },
      chartAria: "Accuracy of the final SVM: training {train}, validation {val}, test {test}; group cross-validation {cv}",
      gap: "The model fits the training data perfectly, which is expected with sparse TF-IDF features. The gap of {gap} percentage points between training and test accuracy shows no strong signs of overfitting within the original dataset, but it does not guarantee generalisation to new data.",
      unseenTitle: "Unseen data evaluation",
      unseen: "The model was then tested with {cases} new synthetic descriptions that were not used in training, written in other styles: everyday language, negations, ambiguous and out-of-scope cases.",
      unseenFacts: ["Original test accuracy", "Unseen data agreement"],
      unseenSub: "{n} cases with proposed labels",
      unseenNote: "The results show the limits of generalisation to descriptions that differ from the original dataset. The texts are synthetic, their labels have not been clinically verified, and {agree} is not a clinical accuracy. The drop is not definitive proof of overfitting: the new texts also differ in length and style.",
      improveTitle: "Improvements after practical testing",
      improve: "Testing the real application led to four application-level changes: input validation, normalisation of medical terms (e.g. “pyrexia” → “fever”), negation handling in Albanian and English, and abstention when there is no sufficient match with the model’s classes.",
      examples: [
        ["“What time does the pharmacy close on Sundays?”", "Before: Chicken pox. Now: rejected, no symptoms found."],
        ["“I have an uneven spine, one shoulder is higher than the other, and I experience back pain.” (scoliosis, not among the 24 conditions)", "Now: No reliable match."],
      ],
      unchanged: "The SVM model and the TF-IDF vectoriser were not changed and there was no retraining. The checks only decide which text reaches the model and when no condition is shown.",
    },
    limits: [
      ["Not a diagnostic tool.", "Educational and research use only; never a basis for medical decisions."],
      ["Closed set of conditions.", `The model was trained on a closed set of ${DATASET.classes} conditions. The system can withhold a prediction when it identifies no symptoms or finds no sufficient match. However, symptoms of conditions outside this set can overlap with the existing classes and still produce a prediction.`],
      ["No confidence score.", "LinearSVC does not produce calibrated probabilities, so no certainty is shown."],
      ["Small, uniform dataset.", `With ${n(DATASET.cleanSamples)} short descriptions in a similar style, the high scores may not carry over to real clinical language.`],
      ["Small test set.", `${DATASET.testSamples} test descriptions (4–10 per condition) mean a single error moves per-condition scores noticeably.`],
      ["Word-based reasoning.", "The TF-IDF + LinearSVC model does not understand negation directly. The system therefore uses a preliminary step to identify and exclude negated symptoms; unclear cases require clarification. Severity and timing are not understood either."],
      ["Input checks can reject valid descriptions.", "Symptoms are identified with a controlled vocabulary and the match check uses a threshold set on development data, so some valid descriptions are withheld, for example colloquial phrases such as “burning up”. In independent tests this happened for 11 of 49 valid descriptions."],
      ["The model reads English only.", "Albanian symptom descriptions are translated into English with a controlled dictionary. The feature has been tested technically with prepared cases, while professional verification of the medical terminology remains a limitation of the system. The model’s accuracy on translated Albanian text has not been evaluated."],
    ],
  },
  sq: {
    eyebrow: "Rreth projektit dhe metodologjia",
    title: "Si u ndërtua Symptom2Disease dhe ku i ka kufijtë.",
    lead: "Të dhënat, modelet dhe vlerësimi pas çdo rezultati, si dhe kufizimet që duhen mbajtur parasysh kur lexohet një rezultat.",
    toc: "Në këtë faqe",
    sections: ["Rreth projektit", "Dataset-i", "Përgatitja e të dhënave", "Modelet e krahasuara", "Optimizimi", "Augmentimi", "Shpjegueshmëria", "Arkitektura", "Analiza e Overfitting dhe Generalization", "Kufizimet"],
    about: [
      "Symptom2Disease filloi si temë bachelor në machine learning. Pyetja ishte e thjeshtë: sa mirë mund ta lidhë një klasifikues tekstesh klasik dhe i shpjegueshëm përshkrimin e simptomave të një pacienti me një sëmundje, dhe a mund ta tregojë arsyetimin e tij?",
      "Rezultati është një sistem i plotë që funksionon: një model i trajnuar, një shërbim parashikimi dhe kjo ndërfaqe. Është mjet edukativ dhe kërkimor. Nuk është validuar klinikisht dhe nuk duhet përdorur për vendime mjekësore.",
    ],
    facts: ["përshkrime fillestare", "unike pas pastrimit", "etiketa sëmundjesh"],
    dataset: `Studimi përdor dataset-in publik ${DATASET.name}: përshkrime të shkurtra simptomash në anglisht, në vetën e parë, secili me një sëmundje. Tekstet e dyfishta u hoqën para çdo modelimi.`,
    prep1:
      "Shumë përshkrime janë parafrazime të afërta të njëri-tjetrit. Një ndarje e rastësishme do t’i vendoste tekstet pothuajse identike edhe në trajnim edhe në vlerësim dhe do t’i fryente rezultatet. Prandaj tekstet me ngjashmëri 0.85 ose më shumë u bashkuan në grupe, dhe të dhënat u ndanë me GroupShuffleSplit, që asnjë grup të mos jetë në më shumë se një pjesë.",
    splitAria: `Trajnim ${DATASET.trainSamples}, validation ${DATASET.validationSamples}, test ${DATASET.testSamples} përshkrime`,
    splits: ["Trajnimi", "Validation", "Test"],
    defs: [
      ["Trajnimi", "Trajnon modelet."],
      ["Validation", "Krahason modelet, optimizon hiperparametrat dhe vlerëson augmentimin."],
      ["Test", "Përdoret një herë, vetëm për vlerësimin përfundimtar të modelit të zgjedhur."],
    ],
    prep2:
      "Teksti kthehet në numra me një vektorizues TF-IDF me shkronja të vogla, i cili i jep peshë çdo fjale sipas sa shpesh shfaqet në përshkrim krahasuar me sa e zakonshme është në përgjithësi. Vektorizuesi është pjesë e pipeline-it të çdo modeli, prandaj mëson vetëm nga të dhënat e trajnimit.",
    models:
      "Pesë klasifikues të scikit-learn u trajnuan si pipeline TF-IDF → klasifikues me seed të fiksuar (42, kur zbatohet). Cilësia raportohet kryesisht me Macro F1, mesataren e F1 për të gjitha sëmundjet, që çdo sëmundje të ketë peshë të barabartë.",
    modelList: [
      ["Support Vector Machine (LinearSVC)", "Gjen kufirin linear me hapësirën më të madhe për çdo klasë. I përshtatshëm për veçori TF-IDF të shumta dhe të rralla. U zgjodh si modeli përfundimtar."],
      ["Logistic Regression", "Klasifikues linear probabilistik dhe bazë e fortë dhe e shpjegueshme për tekste."],
      ["K-Nearest Neighbours", "Parashikon nga përshkrimet më të ngjashme të trajnimit në hapësirën TF-IDF."],
      ["Random Forest", "Grup pemësh vendimi; kap ndërveprime jolineare, por është më pak i përshtatshëm për të dhëna shumë të rralla."],
      ["Neural Network (MLP)", "Perceptron me shumë shtresa mbi veçoritë TF-IDF; modeli më fleksibël në krahasim."],
    ],
    finalModel: "Modeli përfundimtar",
    tuning1:
      "Çdo model u optimizua me GridSearchCV, me 3-fold StratifiedGroupKFold në të dhënat e trajnimit, që i mban të plota grupet e teksteve të ngjashme, dhe me Macro F1 si objektiv. Konfigurimi më i mirë u vlerësua pastaj në validation.",
    tuning2: `LinearSVC i zgjedhur përdor C = ${SVM_TUNING.bestParameters.C}, fjalë të veçuara si veçori (ngram_range = (1, 1)) dhe min_df = 1.`,
    aug1: `Për të provuar nëse formulimi më i larmishëm e përmirëson përgjithësimin, ${DATASET.augmentationCandidates} përshkrime të reja trajnimi u krijuan me zëvendësim të kontrolluar frazash me rregulla, për shembull “I have been experiencing” → “I have”.`,
    aug2:
      "Tekstet e krijuara u kontrolluan për vlera që mungojnë, dublikate, tekste të pandryshuara, etiketa të pavlefshme dhe mbivendosje me validation dhe test. U nis një rishikim paraprak gjuhësor, por rishikimi i plotë i kuptimit të tyre nga njeriu nuk u përfundua. Augmentimi nuk e përmirësoi SVM-në, prandaj modeli përfundimtar përdor të dhënat origjinale.",
    xaiLead: "Dy metoda plotësuese e shpjegojnë sjelljen e modelit.",
    liveTitle: "Kontributet e fjalëve në kohë reale",
    live:
      "LinearSVC është model linear, prandaj pikët e tij për një klasë janë shuma e kontributeve të fjalëve. Për çdo fjalë të përshkrimit, kontrolli i simptomave tregon vlerën TF-IDF × koeficientin e klasës për sëmundjen e parashikuar. Është i saktë për këtë model dhe llogaritet shpejt në çdo kërkesë. Vlerat janë kontribute në pikët e vendimit, jo probabilitete. Për tekstet në shqip, shpjegimi tregohet mbi përkthimin në anglisht që analizoi modeli.",
    liveAlt: "Grafik me kontributet e fjalëve të SVM-së për një shembull validation të parashikuar si Migrenë",
    liveCaption: "Kontributet e fjalëve për një përshkrim validation të përputhur saktë me Migrenën.",
    limeTitle: "LIME (analizë jashtë sistemit)",
    lime:
      "LIME heq fjalë nga një përshkrim dhe përshtat një model të thjeshtë lokal për të parë cilat heqje e ndryshojnë rezultatin. Meqë LinearSVC nuk jep probabilitete, LIME u zbatua mbi softmax-in e pikëve të vendimit të SVM-së; këto nuk janë probabilitete të kalibruara. U analizuan një parashikim i saktë dhe një i gabuar nga validation.",
    limeAlt: "Shpjegim LIME: reale {a}, e parashikuar {p}",
    limeCaption: "{kind}: reale “{a}”, e parashikuar “{p}”.",
    limeKinds: { "Correct prediction": "Parashikim i saktë", "Incorrect prediction": "Parashikim i gabuar" },
    archLead: "Një kërkesë kalon nëpër katër shtresa dhe kthehet.",
    arch: [
      ["React frontend", "Merr dhe kontrollon përshkrimin, e përkthen nga shqipja kur duhet dhe tregon rezultatin."],
      ["ASP.NET Core 8 API", "POST /api/prediction validon kërkesën dhe e përcjell."],
      ["Shërbimi Flask ML", "POST /predict validon input-in, normalizon terminologjinë mjekësore, përjashton simptomat e mohuara, ekzekuton modelin dhe kontrollon përputhjen para se të kthejë rezultatin me kontributet e fjalëve."],
      ["Pipeline i trajnuar", "TF-IDF + LinearSVC, i ngarkuar nga një skedar joblib."],
    ],
    gen: {
      lead: "Për të kontrolluar overfitting-un, SVM përfundimtar u krahasua në të dhënat e trajnimit, validation dhe test, dhe u vlerësua me cross-validation sipas grupeve (5 × 5 fold-e në trajnim dhe validation, ku tekstet e ngjashme mbeten në të njëjtin fold). Test set-i nuk u përdor për asnjë zgjedhje.",
      facts: ["Saktësia në trajnim", "Saktësia në validation", "Saktësia në test", "Cross-validation sipas grupeve"],
      splits: ["Trajnimi", "Validation", "Test"],
      chart: { metric: "Saktësia (SVM)", band: "Cross-validation sipas grupeve, mesatarja ± SD", axis: "Saktësia" },
      chartAria: "Saktësia e SVM përfundimtar: trajnim {train}, validation {val}, test {test}; cross-validation sipas grupeve {cv}",
      gap: "Modeli i përshtatet plotësisht të dhënave të trajnimit, gjë e pritshme me veçori TF-IDF të rralla. Diferenca prej {gap} pikë përqindjeje ndërmjet trajnimit dhe testit nuk tregon shenja të forta të overfitting-ut brenda dataset-it origjinal, por kjo nuk garanton përgjithësim me të dhëna të reja.",
      unseenTitle: "Vlerësimi me të dhëna të reja (Unseen Data)",
      unseen: "Modeli u testua më pas me {cases} përshkrime të reja sintetike që nuk u përdorën gjatë trajnimit, të shkruara në stile të tjera: gjuhë e përditshme, mohime, raste të paqarta dhe jashtë fushës.",
      unseenFacts: ["Saktësia në test-in origjinal", "Përputhja me të dhëna të reja"],
      unseenSub: "{n} raste me etiketa të propozuara",
      unseenNote: "Rezultatet tregojnë kufizime të përgjithësimit me përshkrime që ndryshojnë nga dataset-i origjinal. Tekstet janë sintetike, etiketat nuk janë verifikuar klinikisht dhe {agree} nuk është saktësi klinike. Rënia nuk është provë definitive e overfitting-ut: tekstet e reja ndryshojnë edhe në gjatësi dhe stil.",
      improveTitle: "Përmirësimet pas testimit praktik",
      improve: "Testimi i aplikacionit real çoi në katër ndryshime në nivel aplikacioni: validimi i input-it, normalizimi i terminologjisë mjekësore (p.sh. “pyrexia” → “fever”), trajtimi i mohimeve në shqip dhe anglisht, dhe refuzimi i parashikimit (abstention) kur mungon përputhja e mjaftueshme me klasat e modelit.",
      examples: [
        ["“What time does the pharmacy close on Sundays?”", "Më parë: Lia e dhenve (Chicken pox). Tani: refuzohet, nuk u gjetën simptoma."],
        ["“I have an uneven spine, one shoulder is higher than the other, and I experience back pain.” (skoliozë, jo mes 24 sëmundjeve)", "Tani: No reliable match (nuk u gjet përputhje e besueshme)."],
      ],
      unchanged: "Modeli SVM dhe vektorizuesi TF-IDF nuk u ndryshuan dhe nuk pati ritrajnim. Kontrollet vendosin vetëm cili tekst i dërgohet modelit dhe kur nuk shfaqet asnjë sëmundje.",
    },
    limits: [
      ["Nuk është mjet diagnostikues.", "Vetëm për qëllime edukative dhe kërkimore; kurrë bazë për vendime mjekësore."],
      ["Grup i mbyllur sëmundjesh.", `Modeli është trajnuar për një grup të mbyllur prej ${DATASET.classes} sëmundjesh. Sistemi mund të refuzojë një parashikim kur nuk identifikon simptoma ose kur mungon përputhja e mjaftueshme. Megjithatë, simptomat e sëmundjeve jashtë këtij grupi mund të mbivendosen me klasat ekzistuese dhe të prodhojnë ende një parashikim.`],
      ["Pa nivel besueshmërie.", "LinearSVC nuk jep probabilitete të kalibruara, prandaj nuk tregohet siguri."],
      ["Dataset i vogël dhe i njëtrajtshëm.", `Me ${n(DATASET.cleanSamples)} përshkrime të shkurtra në stil të ngjashëm, rezultatet e larta mund të mos vlejnë për gjuhën reale klinike.`],
      ["Test i vogël.", `${DATASET.testSamples} përshkrime testi (4–10 për sëmundje) bëjnë që një gabim i vetëm të ndryshojë dukshëm rezultatet për sëmundje.`],
      ["Arsyetim i bazuar në fjalë.", "Modeli TF-IDF + LinearSVC nuk e kupton drejtpërdrejt mohimin. Për këtë arsye, sistemi përdor një mekanizëm paraprak për të identifikuar dhe përjashtuar simptomat e mohuara. Rastet e paqarta kërkojnë sqarim. Modeli nuk e kupton as rëndësinë apo kohëzgjatjen e simptomave."],
      ["Kontrolli i input-it mund të refuzojë përshkrime të vlefshme.", "Simptomat identifikohen me një fjalor të kontrolluar dhe kontrolli i përputhjes përdor një prag të përcaktuar në të dhëna zhvillimi, prandaj disa përshkrime të vlefshme refuzohen, p.sh. shprehje të përditshme si “burning up”. Në testet e pavarura kjo ndodhi për 11 nga 49 përshkrime të vlefshme."],
      ["Modeli kupton vetëm anglisht.", "Përkthimi i simptomave nga gjuha shqipe në anglisht realizohet përmes një fjalori të kontrolluar. Funksionaliteti është testuar teknikisht përmes rasteve të përgatitura, ndërsa verifikimi profesional i terminologjisë mjekësore mbetet një kufizim i sistemit. Saktësia e modelit për tekste të përkthyera nga shqipja nuk është vlerësuar."],
    ],
  },
};

const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (_, k) => vars[k]);

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function Methodology() {
  const { lang } = useLanguage();
  const c = COPY[lang];
  const active = useActiveSection(SECTION_IDS);
  const heading = (i) => c.sections[i];

  return (
    <div className="container about-page">
      <header className="page-head">
        <span className="eyebrow">{c.eyebrow}</span>
        <h1>{c.title}</h1>
        <p>{c.lead}</p>
      </header>

      <div className="about-layout">
        <nav className="toc" aria-label={c.toc}>
          <span className="toc-title">{c.toc}</span>
          <ol>
            {SECTION_IDS.map((id, i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={active === id ? "active" : ""}
                  aria-current={active === id ? "location" : undefined}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {heading(i)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="article">
          <section id="about">
            <h2>{heading(0)}</h2>
            <p className="lede">{c.about[0]}</p>
            <p>{c.about[1]}</p>
          </section>

          <section id="dataset">
            <h2>{heading(1)}</h2>
            <div className="fact-row">
              <div>
                <strong>{n(DATASET.rawSamples)}</strong>
                <span>{c.facts[0]}</span>
              </div>
              <div>
                <strong>{n(DATASET.cleanSamples)}</strong>
                <span>{c.facts[1]}</span>
              </div>
              <div>
                <strong>{DATASET.classes}</strong>
                <span>{c.facts[2]}</span>
              </div>
            </div>
            <p>{c.dataset}</p>
          </section>

          <section id="preparation">
            <h2>{heading(2)}</h2>
            <p>{c.prep1}</p>

            <div className="split-bar" role="img" aria-label={c.splitAria}>
              <div className="seg train" style={{ flexGrow: DATASET.trainSamples }}>
                <strong>{c.splits[0]}</strong>
                <span>{DATASET.trainSamples} · ~70%</span>
              </div>
              <div className="seg val" style={{ flexGrow: DATASET.validationSamples }}>
                <strong>{c.splits[1]}</strong>
                <span>{DATASET.validationSamples}</span>
              </div>
              <div className="seg test" style={{ flexGrow: DATASET.testSamples }}>
                <strong>{c.splits[2]}</strong>
                <span>{DATASET.testSamples}</span>
              </div>
            </div>

            <dl className="def-list">
              {c.defs.map(([term, text]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>

            <p>{c.prep2}</p>
          </section>

          <section id="models">
            <h2>{heading(3)}</h2>
            <p>{c.models}</p>
            <ol className="model-list">
              {c.modelList.map(([name, text], i) => (
                <li key={name}>
                  <h3 data-final-label={i === 0 ? c.finalModel : undefined}>{name}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="tuning">
            <h2>{heading(4)}</h2>
            <p>{c.tuning1}</p>
            <p>{c.tuning2}</p>
            <SourceNote>{SOURCES.svmTuning}</SourceNote>
          </section>

          <section id="augmentation">
            <h2>{heading(5)}</h2>
            <p>{c.aug1}</p>
            <p>{c.aug2}</p>
            <SourceNote>docs/augmentation_evaluation_report.txt</SourceNote>
          </section>

          <section id="explainability">
            <h2>{heading(6)}</h2>
            <p>{c.xaiLead}</p>

            <h3>{c.liveTitle}</h3>
            <p>{c.live}</p>
            <Figure
              src="/figures/svm_word_contributions.png"
              alt={c.liveAlt}
              caption={c.liveCaption}
              source={SOURCES.wordContributions}
            />

            <h3>{c.limeTitle}</h3>
            <p>{c.lime}</p>
            <div className="figure-pair">
              {LIME_EXAMPLES.map((example) => {
                const vars = {
                  kind: c.limeKinds[example.kind] ?? example.kind,
                  a: diseaseName(example.actual, lang),
                  p: diseaseName(example.predicted, lang),
                };
                return (
                  <Figure
                    key={example.kind}
                    src={example.image}
                    alt={fill(c.limeAlt, vars)}
                    caption={fill(c.limeCaption, vars)}
                  />
                );
              })}
            </div>
            <SourceNote>{SOURCES.lime}</SourceNote>
          </section>

          <section id="architecture">
            <h2>{heading(7)}</h2>
            <p>{c.archLead}</p>
            <ol className="arch-flow">
              {c.arch.map(([name, detail], i) => {
                const Icon = ARCH_ICONS[i];
                return (
                  <li key={name}>
                    <span className="arch-icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <strong>{name}</strong>
                    <span>{detail}</span>
                    {i < c.arch.length - 1 && <ArrowRight className="arch-arrow" size={18} aria-hidden="true" />}
                  </li>
                );
              })}
            </ol>
          </section>

          <section id="generalization">
            <h2>{heading(8)}</h2>
            <p>{c.gen.lead}</p>
            <div className="fact-row cols-4">
              {[
                "100%",
                p2(O.svm.validation),
                p2(O.svm.test),
                <>
                  {p1(O.groupCv.mean)}
                  <small> ± {(O.groupCv.std * 100).toFixed(1)}%</small>
                </>,
              ].map((value, i) => (
                <div key={c.gen.facts[i]}>
                  <strong>{value}</strong>
                  <span>{c.gen.facts[i]}</span>
                </div>
              ))}
            </div>
            <Suspense fallback={<div className="chart-block" style={{ height: 248 }} />}>
              <SplitAccuracyChart
                rows={[O.svm.train, O.svm.validation, O.svm.test].map((value, i) => ({ split: c.gen.splits[i], value }))}
                band={O.groupCv}
                labels={{
                  ...c.gen.chart,
                  aria: fill(c.gen.chartAria, {
                    train: "100%", val: p2(O.svm.validation), test: p2(O.svm.test), cv: CV,
                  }),
                }}
              />
            </Suspense>
            <p>{fill(c.gen.gap, { gap: GAP })}</p>
            <SourceNote>{SOURCES.overfitting}</SourceNote>

            <h3>{c.gen.unseenTitle}</h3>
            <p>{fill(c.gen.unseen, { cases: O.unseen.cases })}</p>
            <div className="fact-row cols-2">
              <div>
                <strong>{p2(O.svm.test)}</strong>
                <span>{c.gen.unseenFacts[0]}</span>
              </div>
              <div>
                <strong>{AGREE}</strong>
                <span>
                  {c.gen.unseenFacts[1]} · {fill(c.gen.unseenSub, { n: O.unseen.labelled })}
                </span>
              </div>
            </div>
            <p>{fill(c.gen.unseenNote, { agree: AGREE })}</p>
            <SourceNote>{SOURCES.unseen}</SourceNote>

            <h3>{c.gen.improveTitle}</h3>
            <p>{c.gen.improve}</p>
            <dl className="def-list examples-list">
              {c.gen.examples.map(([input, outcome]) => (
                <div key={input}>
                  <dt lang="en">{input}</dt>
                  <dd>{outcome}</dd>
                </div>
              ))}
            </dl>
            <p>{c.gen.unchanged}</p>
            <SourceNote>{SOURCES.systemTesting}</SourceNote>
          </section>

          <section id="limitations">
            <h2>{heading(9)}</h2>
            <ul className="limit-list">
              {c.limits.map(([title, text]) => (
                <li key={title}>
                  <strong>{title}</strong> {text}
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}

export default Methodology;
