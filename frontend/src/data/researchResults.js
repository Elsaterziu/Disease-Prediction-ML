// Research results transcribed exactly from the project's evaluation outputs.
// Each block names the file it was copied from. Do not round or edit values here;
// formatting happens at display time.

export const SPLITS = {
  validation: {
    key: "validation",
    label: "Validation",
    samples: 178,
    description:
      "Used for model selection, hyperparameter tuning and the augmentation study.",
  },
  test: {
    key: "test",
    label: "Test",
    samples: 172,
    description:
      "Held-out set, evaluated once with the final tuned LinearSVC only.",
  },
};

// docs/augmentation_evaluation_report.txt, data/processed/*.csv,
// data/raw/Symptom2Disease/Symptom2Disease.csv
export const DATASET = {
  name: "Symptom2Disease",
  rawSamples: 1200,
  cleanSamples: 1153,
  classes: 24,
  trainSamples: 803,
  validationSamples: 178,
  testSamples: 172,
  augmentationCandidates: 92,
  augmentedTrainSamples: 895,
};

// models/baseline_results.csv (validation set, default settings)
// models/tuned_results.csv (validation set, after GridSearchCV)
export const BASELINE_VS_TUNED = [
  {
    model: "SVM (LinearSVC)",
    baselineAccuracy: 0.9775280898876404,
    baselineMacroF1: 0.9793353705118412,
    tunedAccuracy: 0.9944,
    tunedMacroF1: 0.9952,
  },
  {
    model: "Neural Network (MLP)",
    baselineAccuracy: 0.9550561797752809,
    baselineMacroF1: 0.9592588978938084,
    tunedAccuracy: 0.9775,
    tunedMacroF1: 0.979,
  },
  {
    model: "Logistic Regression",
    baselineAccuracy: 0.9550561797752809,
    baselineMacroF1: 0.9556507218271925,
    tunedAccuracy: 0.9775,
    tunedMacroF1: 0.9787,
  },
  {
    model: "KNN",
    baselineAccuracy: 0.9044943820224719,
    baselineMacroF1: 0.9077751056562976,
    tunedAccuracy: 0.9775,
    tunedMacroF1: 0.9777,
  },
  {
    model: "Random Forest",
    baselineAccuracy: 0.9382022471910112,
    baselineMacroF1: 0.9385752455605397,
    tunedAccuracy: 0.9382,
    tunedMacroF1: 0.9386,
  },
];

// models/svm_tuning_results.json
export const SVM_TUNING = {
  model: "LinearSVC",
  bestParameters: {
    C: 10,
    "TF-IDF min_df": 1,
    "TF-IDF ngram_range": "(1, 1)",
  },
  cvMacroF1: 0.9577713878394021,
  validationAccuracy: 0.9943820224719101,
  validationMacroF1: 0.9952380952380953,
};

// models/augmentation_all_models_results.csv (validation set)
export const AUGMENTATION_RESULTS = [
  {
    model: "SVM (LinearSVC)",
    original: { accuracy: 0.9943820224719101, precision: 0.9962121212121212, recall: 0.9947916666666666, macroF1: 0.9952380952380953 },
    augmented: { accuracy: 0.9943820224719101, precision: 0.9962121212121212, recall: 0.9947916666666666, macroF1: 0.9952380952380953 },
  },
  {
    model: "Logistic Regression",
    original: { accuracy: 0.9775280898876404, precision: 0.9805194805194807, recall: 0.9809027777777778, macroF1: 0.9786502100840337 },
    augmented: { accuracy: 0.9831460674157303, precision: 0.985479797979798, recall: 0.9855324074074074, macroF1: 0.9845641286817758 },
  },
  {
    model: "KNN",
    original: { accuracy: 0.9775280898876404, precision: 0.9814814814814815, recall: 0.9774305555555557, macroF1: 0.9776984657499365 },
    augmented: { accuracy: 0.9775280898876404, precision: 0.9814814814814815, recall: 0.9774305555555557, macroF1: 0.9776984657499365 },
  },
  {
    model: "Random Forest",
    original: { accuracy: 0.9382022471910112, precision: 0.9457837301587303, recall: 0.9418981481481481, macroF1: 0.9385752455605397 },
    augmented: { accuracy: 0.9325842696629213, precision: 0.9436342592592594, recall: 0.9347222222222221, macroF1: 0.9331343901196844 },
  },
  {
    model: "Neural Network (MLP)",
    original: { accuracy: 0.9775280898876404, precision: 0.9802714646464646, recall: 0.9809027777777778, macroF1: 0.9790289979628216 },
    augmented: { accuracy: 0.9775280898876404, precision: 0.97885101010101, recall: 0.9785879629629631, macroF1: 0.9772456709956711 },
  },
];

// models/augmentation_class_distribution.csv (training set)
export const CLASS_DISTRIBUTION = [
  { label: "Acne", original: 34, added: 1 },
  { label: "Arthritis", original: 29, added: 6 },
  { label: "Bronchial Asthma", original: 33, added: 1 },
  { label: "Cervical spondylosis", original: 34, added: 11 },
  { label: "Chicken pox", original: 33, added: 2 },
  { label: "Common Cold", original: 31, added: 3 },
  { label: "Dengue", original: 33, added: 8 },
  { label: "Dimorphic Hemorrhoids", original: 26, added: 5 },
  { label: "Fungal infection", original: 39, added: 2 },
  { label: "Hypertension", original: 37, added: 10 },
  { label: "Impetigo", original: 36, added: 2 },
  { label: "Jaundice", original: 26, added: 6 },
  { label: "Malaria", original: 28, added: 7 },
  { label: "Migraine", original: 33, added: 6 },
  { label: "Pneumonia", original: 34, added: 2 },
  { label: "Psoriasis", original: 38, added: 3 },
  { label: "Typhoid", original: 34, added: 7 },
  { label: "Varicose Veins", original: 35, added: 2 },
  { label: "allergy", original: 37, added: 1 },
  { label: "diabetes", original: 39, added: 0 },
  { label: "drug reaction", original: 34, added: 2 },
  { label: "gastroesophageal reflux disease", original: 31, added: 0 },
  { label: "peptic ulcer disease", original: 33, added: 1 },
  { label: "urinary tract infection", original: 36, added: 4 },
];

// docs/final_evaluation/svm_final_test_results.csv (test set)
export const FINAL_TEST = {
  model: "Tuned LinearSVC",
  training: "Original data (no augmentation)",
  trainSamples: 803,
  validationSamples: 178,
  testSamples: 172,
  accuracy: 0.9883720930232558,
  macroPrecision: 0.9894179894179894,
  macroRecall: 0.9836309523809524,
  macroF1: 0.9851863822452058,
  weightedF1: 0.9881278092632401,
  correct: 170,
  incorrect: 2,
};

// docs/final_evaluation/svm_classification_report.csv (test set)
export const TEST_CLASSIFICATION_REPORT = [
  { label: "Acne", precision: 1.0, recall: 1.0, f1: 1.0, support: 7 },
  { label: "Arthritis", precision: 1.0, recall: 1.0, f1: 1.0, support: 9 },
  { label: "Bronchial Asthma", precision: 1.0, recall: 1.0, f1: 1.0, support: 9 },
  { label: "Cervical spondylosis", precision: 1.0, recall: 1.0, f1: 1.0, support: 7 },
  { label: "Chicken pox", precision: 1.0, recall: 1.0, f1: 1.0, support: 8 },
  { label: "Common Cold", precision: 0.8888888888888888, recall: 1.0, f1: 0.9411764705882353, support: 8 },
  { label: "Dengue", precision: 1.0, recall: 1.0, f1: 1.0, support: 9 },
  { label: "Dimorphic Hemorrhoids", precision: 1.0, recall: 1.0, f1: 1.0, support: 8 },
  { label: "Fungal infection", precision: 1.0, recall: 1.0, f1: 1.0, support: 5 },
  { label: "Hypertension", precision: 1.0, recall: 1.0, f1: 1.0, support: 6 },
  { label: "Impetigo", precision: 1.0, recall: 1.0, f1: 1.0, support: 7 },
  { label: "Jaundice", precision: 1.0, recall: 1.0, f1: 1.0, support: 6 },
  { label: "Malaria", precision: 1.0, recall: 1.0, f1: 1.0, support: 8 },
  { label: "Migraine", precision: 1.0, recall: 1.0, f1: 1.0, support: 10 },
  { label: "Pneumonia", precision: 1.0, recall: 1.0, f1: 1.0, support: 6 },
  { label: "Psoriasis", precision: 1.0, recall: 1.0, f1: 1.0, support: 7 },
  { label: "Typhoid", precision: 1.0, recall: 1.0, f1: 1.0, support: 10 },
  { label: "Varicose Veins", precision: 1.0, recall: 1.0, f1: 1.0, support: 5 },
  { label: "allergy", precision: 1.0, recall: 0.75, f1: 0.8571428571428571, support: 4 },
  { label: "diabetes", precision: 0.8571428571428571, recall: 1.0, f1: 0.9230769230769231, support: 6 },
  { label: "drug reaction", precision: 1.0, recall: 0.8571428571428571, f1: 0.9230769230769231, support: 7 },
  { label: "gastroesophageal reflux disease", precision: 1.0, recall: 1.0, f1: 1.0, support: 7 },
  { label: "peptic ulcer disease", precision: 1.0, recall: 1.0, f1: 1.0, support: 8 },
  { label: "urinary tract infection", precision: 1.0, recall: 1.0, f1: 1.0, support: 5 },
];

// docs/final_evaluation/svm_error_analysis.csv (test set)
export const TEST_ERRORS = [
  {
    actual: "allergy",
    predicted: "Common Cold",
    interpretation:
      "Non-specific symptoms and possible overlap in textual descriptions.",
  },
  {
    actual: "drug reaction",
    predicted: "diabetes",
    interpretation:
      "Symptoms lack medication context; possible learned statistical associations.",
  },
];

// docs/explainability/lime_explanations_report.txt (validation set)
export const LIME_EXAMPLES = [
  {
    kind: "Correct prediction",
    actual: "Migraine",
    predicted: "Migraine",
    image: "/figures/lime_correct_prediction.png",
  },
  {
    kind: "Incorrect prediction",
    actual: "Chicken pox",
    predicted: "Common Cold",
    image: "/figures/lime_incorrect_prediction.png",
  },
];

export const SOURCES = {
  baseline: "models/baseline_results.csv",
  tuned: "models/tuned_results.csv",
  svmTuning: "models/svm_tuning_results.json",
  augmentation: "models/augmentation_all_models_results.csv",
  classDistribution: "models/augmentation_class_distribution.csv",
  finalTest: "docs/final_evaluation/svm_final_test_results.csv",
  classificationReport: "docs/final_evaluation/svm_classification_report.csv",
  errors: "docs/final_evaluation/svm_error_analysis.csv",
  confusionMatrix: "docs/final_evaluation/svm_final_confusion_matrix.png",
  lime: "docs/explainability/lime_explanations_report.txt",
  wordContributions: "docs/explainability/svm_word_contributions.csv",
};
