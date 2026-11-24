# Disease Prediction from Symptom Descriptions

Bachelor thesis project. The system takes a free-text description of symptoms (in **English or Albanian**) and predicts which of **24 conditions** it most closely matches. The model is a TF-IDF + Linear SVM classifier trained on the Symptom2Disease dataset.

> **Disclaimer:** This is an academic project. It is not a medical device and must not be used for diagnosis. Always consult a medical professional.

## Architecture

```
React (Vite, :5173)  →  ASP.NET Core API (:5080)  →  Flask ML API (:5000)  →  input checks → TF-IDF → SVM
```

| Folder | Contents |
|---|---|
| `notebooks/` | Full ML pipeline: exploration, preprocessing, training, tuning, augmentation, explainability, final evaluation, overfitting and unseen-data analysis (01–11) |
| `data/` | Raw datasets, processed train/validation/test splits, external unseen and system-validation sets |
| `models/` | Trained models (`svm_tuned_validation.joblib`, `mlp_tuned_validation.joblib`) and result tables |
| `ml-api/` | Flask service that loads the SVM model, validates the input and returns predictions |
| `backend/ThesisAPI/` | ASP.NET Core 8 Web API that sits between the frontend and the Flask service |
| `frontend/` | React app: symptom analysis, model comparison, methodology pages, English/Albanian UI |
| `docs/` | Reports, figures and evaluation results (explainability, final evaluation, overfitting, system testing) |

## Methodology

1. **Data**: Symptom2Disease dataset (1,200 descriptions, 24 conditions). Group-aware split into train / validation / test (803 / 178 / 172) with no overlap between splits.
2. **Models compared**: Linear SVM, Logistic Regression, MLP, KNN and Random Forest, all on TF-IDF features. Hyperparameters were tuned on the validation set only.
3. **Data augmentation** was tested and its impact analysed. The final model is trained on the original data.
4. **Explainability**: LIME explanations and SVM word contributions.
5. **Overfitting and generalization**: learning and regularization curves, repeated group cross-validation, and evaluation on new unseen descriptions.
6. **Input validation**: the API rejects text that is not a symptom description or is out of scope, instead of always returning a disease.

## Results

Final model: **tuned LinearSVC**, evaluated once on the held-out test set (172 samples):

| Metric | Value |
|---|---|
| Accuracy | 98.84% (170 / 172) |
| Macro precision | 98.94% |
| Macro recall | 98.36% |
| Macro F1 | 98.52% |

On new, synthetic descriptions written outside the dataset (`data/external/unseen_v1.csv`, not clinically verified), agreement is much lower (about 50–60%). This shows the limits of the dataset. See [`docs/overfitting/README.md`](docs/overfitting/README.md) for the full analysis.

## Running locally

**Requirements:** Python 3.10+, .NET 8 SDK, Node.js 20+.

### 1. Flask ML API (port 5000)

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate   |   Linux/macOS: source .venv/bin/activate
pip install -r ml-api/requirements.txt
python ml-api/app.py
```

### 2. ASP.NET Core API (port 5080)

```bash
cd backend/ThesisAPI
dotnet run --urls http://localhost:5080
```

### 3. React frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The API base URL can be changed with `VITE_API_URL` (see `frontend/.env.example`).

### Tests

```bash
# Frontend (Vitest)
cd frontend && npm test

# ML API (from the repository root)
python -m unittest discover -s ml-api/tests -v
```

## Notebooks

| # | Notebook |
|---|---|
| 01 | Data exploration |
| 02 | Data preprocessing and splitting |
| 03 | Data augmentation |
| 04 | Model training (baselines) |
| 05 | Hyperparameter tuning |
| 06 | Augmentation evaluation |
| 07 | Augmentation impact analysis |
| 08 | Model explainability (LIME) |
| 09 | Final model evaluation |
| 10 | Overfitting analysis |
| 11 | Unseen data evaluation |

## Author

**Elsa Terziu**, Bachelor Thesis, UBT
