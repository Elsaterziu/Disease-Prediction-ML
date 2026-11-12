# Analiza e Overfitting dhe Generalization

Ky dokument interpreton rezultatet e dy notebook-ëve të rinj:

- `notebooks/10_overfitting_analysis.ipynb`: overfitting në të dhënat ekzistuese (Train / Validation / Test).
- `notebooks/11_unseen_evaluation.ipynb`: sjellja e modelit me tekste të reja jashtë dataset-it.

Asgjë nga puna e mëparshme nuk u ndryshua: notebook-ët 01–09, modeli përfundimtar SVM, TF-IDF, dataset-et origjinale, Flask, ASP.NET dhe React. Të gjitha rezultatet e reja janë në këtë dosje.

---

## 1. Metodologjia

| Element | Si u bë |
|---|---|
| Modelet | SVM dhe MLP u ngarkuan nga `models/`. LR, KNN dhe RF u rindërtuan me parametrat më të mirë nga notebook 05, vetëm për krahasim. Të pesta përputhen saktësisht me rezultatet e dokumentuara në Validation (`00_reproducibility_check.csv`). |
| Ndarja | E njëjta ndarje sipas grupeve (803 / 178 / 172), pa mbivendosje mes ndarjeve. |
| Test set-i | Nuk u përdor për asnjë zgjedhje. Rezultatet në Test janë vetëm përshkruese. |
| Learning dhe regularization curve | Vetëm me Train, me `StratifiedGroupKFold` (5 fold-e, sipas `group_id`). |
| Variance | 5 përsëritje × 5 fold-e me grupe, në Train + Validation (981 tekste). |
| Unseen | 118 tekste sintetike të reja, të ngrira me SHA-256 para vlerësimit. |

---

## 2. Shenjat e overfitting-ut

### 2.1 Train / Validation / Test (`01_train_val_test.csv`)

| Modeli | Train | Validation | Test | Diferenca Train–Test |
|---|---|---|---|---|
| **SVM (përfundimtar)** | 100% | 99.44% | 98.84% | 1.16 pp |
| Logistic Regression | 100% | 97.75% | 98.84% | 1.16 pp |
| MLP | 100% | 97.75% | 98.84% | 1.16 pp |
| KNN (k=1) | 100% | 97.75% | 97.09% | 2.91 pp |
| Random Forest | 100% | 93.82% | 93.60% | 6.40 pp |

- Të gjitha modelet arrijnë **100% në Train**, pra mësojnë përmendsh të dhënat e trajnimit. Kjo është e pritshme me TF-IDF: ka shumë më shumë veçori (1,382 fjalë) sesa shembuj për klasë (~33), dhe të dhënat janë **linearisht të ndashme**.
- Për SVM, diferenca mes Train dhe Test është e vogël (**1.16 pp**). Brenda këtij dataset-i nuk ka shenja të forta overfitting-u.
- Random Forest ka diferencën më të madhe (6.4 pp). Ai është modeli më pak i përshtatshëm për këtë problem.

### 2.2 Paqëndrueshmëria (`04_group_cv_summary.csv`)

Në 25 ndarje të ndryshme me grupe, SVM ka saktësi **98.04% ± 0.88** (nga 95.41% deri 98.99%). Kjo tregon që:

- rezultati 98.84% në Test është brenda variacionit normal, jo një rast me fat;
- një vlerë realiste brenda këtij dataset-i është rreth **98% ± 1%**, jo 99.44%.

Intervali Wilson 95% për Test (170/172) është **95.9% – 99.7%**; bootstrap jep 97.1% – 100%. Me vetëm 172 tekste, çdo gabim ndryshon saktësinë me 0.58 pp.

### 2.3 Learning curve (`02_learning_curve.png`)

- Train mbetet 100% për çdo madhësi të të dhënave.
- CV Macro F1 rritet nga **60.6%** (64 tekste) në **97.6%** (642 tekste) dhe **ende po rritet** në fund.
- Diferenca Train–CV zvogëlohet me më shumë të dhëna, por nuk zhduket.

Interpretimi: modeli është i kufizuar nga sasia e të dhënave. Më shumë tekste do ta ndihmonin. Kjo nuk është overfitting klasik (ku validimi bie), por tregon që modeli mbështetet shumë në shembujt specifikë që ka parë.

### 2.4 Regularization curve (`03_regularization_curve.png`)

- Me `C = 0.001` (regularizim shumë i fortë), Macro F1 është rreth 73%: **underfitting**.
- Nga `C ≥ 0.316`, Train arrin 100%.
- CV rritet deri në `C = 10` (97.6%) dhe pastaj mbetet e sheshtë. Validation nuk bie për `C` të mëdhenj.
- `C = 10`, i zgjedhur në notebook 05, është edhe vlera më e mirë sipas CV brenda Train. Zgjedhja nuk varet nga Test-i.

Interpretimi: brenda këtij dataset-i, regularizimi më i dobët **nuk** e dëmton performancën. Prandaj overfitting-u nuk duket në kurbë: tekstet e Validation dhe Test janë shumë të ngjashme në stil me ato të Train.

### 2.5 Ngjashmëria Train/Test (`06_similarity_analysis.csv`)

- Edhe pas ndarjes me grupe, **14.5%** e teksteve të Test kanë ngjashmëri kosinus 0.70–0.85 me ndonjë tekst të Train (në Validation vetëm 2.2%).
- Në tekstet e Test me ngjashmëri < 0.70 (147 tekste), SVM ka **98.64%**, pra rezultati nuk vjen vetëm nga tekstet shumë të ngjashme.
- Një klasifikues shumë i thjeshtë "fqinji më i afërt" arrin **94.19%** në Test. Pjesa më e madhe e vështirësisë zgjidhet thjesht duke gjetur tekstin më të ngjashëm.

### 2.6 Analiza e gabimeve (`07_errors_val_test.csv`, `07_cv_confusion_pairs.csv`)

- Gabimet në Validation/Test ndodhin te tekstet me ngjashmëri të ulët me Train.
- Fjalët që shtynë drejt klasës së gabuar janë shpesh **fjalë funksionale** ("can", "my", "want", "do"), jo simptoma. Modeli ka mësuar edhe stilin e shkrimit të dataset-it.
- Ngatërrimet më të shpeshta në CV janë mes klasave me simptoma të përbashkëta: drug reaction ↔ diabetes, Dengue ↔ Typhoid / Chicken pox, peptic ulcer ↔ GERD, Common Cold ↔ allergy.

---

## 3. Si reagon modeli ndaj të dhënave të reja (notebook 11)

### 3.1 Dataset-i `unseen_v1`

- 118 përshkrime **sintetike**, të shkruara nga një asistent AI për këtë projekt, **jo të verifikuara klinikisht**.
- Ngjashmëria maksimale me cilindo nga 1,153 tekstet e dataset-it: **0.432** (mediana 0.143). Nuk janë kopje ose parafrazime.
- Skedari u ngri (SHA-256 në `data/external/unseen_v1.manifest.json`) **para** vlerësimit. Asnjë tekst ose etiketë nuk u ndryshua pas parashikimeve.
- Tekstet janë më të shkurtra se në dataset (mediana 17.5 fjalë për rastet me etiketë, kundrejt 30 në dataset).

| Grupi | Kategoria | Raste |
|---|---|---|
| Me etiketë të propozuar | typical | 48 (2 për klasë) |
| | everyday (gjuhë e përditshme) | 24 (1 për klasë) |
| | negation (me mohime) | 8 |
| Eksploruese | overlapping (simptoma të përbashkëta) | 10 |
| | ambiguous (shumë të paqarta) | 8 |
| | out_of_scope (sëmundje jashtë 24 klasave) | 14 |
| | unrelated (tekste jo mjekësore) | 6 |

### 3.2 Rastet me etiketë të propozuar (`02_labelled_agreement.csv`)

| Kategoria | Përputhja | Wilson 95% |
|---|---|---|
| typical | 58.3% (28/48) | 44.3 – 71.2% |
| everyday | 50.0% (12/24) | 31.4 – 68.6% |
| negation | 62.5% (5/8) | 30.6 – 86.3% |
| **Gjithsej** | **56.3% (45/80)** | **45.3 – 66.6%** |

Krahasuar me **99.44%** në Validation dhe **98.84%** në Test, kjo është një rënie e madhe, rreth **42 pp**.

- 6 klasa i kapi të gjitha (p.sh. Psoriasis, Varicose Veins, GERD, UTI, allergy, Impetigo).
- 5 klasa nuk i kapi asnjëherë (Bronchial Asthma, Cervical spondylosis, Hypertension, drug reaction, Migraine).
- Edhe në gabime, modeli shpesh mbështetet te fjalë funksionale ("the", "of", "on", "some", "get"), njëlloj si në analizën e notebook 10.
- Shembuj: "wheezing… inhaler" → allergy; "headache on one side… bright light" → allergy; "new antibiotics… itchy red rash" → Chicken pox.

### 3.3 Rastet eksploruese

- **Overlapping**: në 9/10 raste parashikimi është një nga klasat e mundshme, por me margin shumë të vogël (mediana 0.14). Kjo është sjellje e arsyeshme.
- **Ambiguous, out_of_scope, unrelated (28 raste)**: modeli **gjithmonë** jep njërën nga 24 klasat, sepse nuk ka opsion "nuk e di". P.sh. "What time does the pharmacy close on Sundays?" → Chicken pox; "My car makes a strange noise when I brake" → Psoriasis.

### 3.4 A e dallon modeli tekstin e panjohur? (`06_score_comparison.csv`)

| Grupi | Margin (mediana) | Mbulimi i fjalorit (mediana) |
|---|---|---|
| Validation | 1.458 | 100% |
| Unseen me etiketë | 0.396 | 90.9% |
| Out of scope | 0.308 | 83.5% |
| Ambiguous | 0.145 | 100% |
| Unrelated | 0.140 | 61.3% |

- Te tekstet e reja, margin-i është shumë më i vogël se në Validation. Modeli është vërtet më pak i sigurt.
- Por margin-i nuk i ndan mirë rastet me etiketë nga ato pa klasë (AUROC **0.67**; top score 0.77). Rastet out_of_scope duken po aq "të sigurta" sa rastet normale.
- Mbulimi i fjalorit është i ulët vetëm te tekstet jo mjekësore.

Këtu nuk u zgjodh dhe nuk u aplikua asnjë prag. Këto shifra janë vetëm përshkruese.

---

## 4. Përfundimi

1. **Brenda dataset-it Symptom2Disease**, SVM nuk tregon overfitting të rëndësishëm: Train 100%, Validation 99.44%, Test 98.84%, CV me grupe 98.0% ± 0.9%. `C = 10` është zgjedhja e duhur sipas CV-së.
2. **100% në Train** dhe learning curve në rritje tregojnë që modeli i mëson përmendsh shembujt dhe varet nga sasia e të dhënave.
3. **Jashtë dataset-it**, me tekste të shkruara ndryshe, përputhja bie në rreth **56%** (interval 45–67%). Kjo tregon që saktësia e lartë vlen për tekste në stilin e Symptom2Disease, jo për gjuhën e lirë të pacientëve në përgjithësi. Ky është kufizimi më i rëndësishëm që del nga kjo analizë.
4. Modeli nuk ka mënyrë të refuzojë tekste jashtë fushës, dhe pasiguria e tij (margin-i) nuk mjafton për t'i dalluar ato në mënyrë të besueshme.

Shkaqet e mundshme (hipoteza, jo të provuara):
- dataset-i ka stil shumë uniform (tekste të gjata, të ngjashme në strukturë);
- vetëm ~33 shembuj për klasë dhe fjalor prej 1,382 fjalësh;
- TF-IDF me fjalë të veçanta nuk kupton sinonime ("tummy" ≠ "stomach") ose kontekst;
- modeli mbështetet edhe në fjalë funksionale.

---

## 5. Kufizimet e kësaj analize

- **Etiketat e `unseen_v1` janë të propozuara nga AI dhe nuk janë verifikuar nga mjek.** Disa raste mund të kenë më shumë se një përgjigje të arsyeshme. Përputhja 56% nuk është "saktësi klinike".
- Tekstet sintetike janë shkruar nga një burim i vetëm, ndaj mund të kenë stilin e vet. Tekste nga pacientë realë mund të japin rezultat tjetër.
- Vetëm 80 raste me etiketë (2–4 për klasë): intervalet janë të gjera dhe rezultatet për klasë janë shumë të pasigurta.
- Test set-i ka vetëm 172 tekste. Ndarjet e Validation dhe Test janë nga i njëjti burim si Train.
- Analiza nuk provon shkakun e rënies; tregon vetëm që ajo ekziston.

**Hapat e mundshëm më tej (nuk janë bërë):** shtimi i teksteve të shkruara nga njerëz dhe verifikimi i etiketave nga një profesionist shëndetësor (`unseen_v2`), dhe testimi i metodave për refuzimin e teksteve jashtë fushës.

---

## 6. Çfarë të përfshihet në temë

- Tabela Train / Validation / Test për 5 modelet dhe shpjegimi që 100% në Train vjen nga të dhënat linearisht të ndashme.
- CV me grupe: **98.0% ± 0.9%** si vlerësim më realist brenda dataset-it, bashkë me intervalin Wilson për Test.
- Learning curve dhe regularization curve (dy figurat), me interpretimin: pa overfitting të dukshëm brenda dataset-it, por me varësi nga sasia e të dhënave.
- Fakti që `C = 10` u konfirmua me CV brenda Train, pa përdorur Test-in.
- Analiza e gabimeve dhe çiftet e klasave që ngatërrohen.
- Vlerësimi `unseen_v1` si **test eksplorues i generalization-it**, i shënuar qartë si sintetik dhe i paverifikuar klinikisht, me rënien në ~56% si kufizim kryesor.
- Fakti që modeli nuk ka opsion "nuk e di" dhe se platforma duhet të mbetet mjet edukativ, jo diagnostik.

Formulim i sugjeruar:

> "Brenda dataset-it Symptom2Disease, modeli SVM arrin 98.84% saktësi në Test dhe 98.0% ± 0.9% në cross-validation me grupe, pa shenja të rëndësishme overfitting-u. Megjithatë, në një grup eksplorues prej 80 përshkrimesh sintetike të shkruara në stil tjetër (me etiketa të paverifikuara klinikisht), përputhja me etiketën e propozuar bie në 56% (95% CI: 45–67%). Kjo tregon që performanca e lartë lidhet ngushtë me stilin e të dhënave të trajnimit dhe nuk mund të përgjithësohet drejtpërdrejt në gjuhën e lirë të pacientëve."

---

## Skedarët

| Skedari | Përmbajtja |
|---|---|
| `00_reproducibility_check.csv` | kontrolli që modelet përputhen me rezultatet e dokumentuara |
| `01_train_val_test.csv/.png` | Train / Validation / Test për 5 modelet |
| `02_learning_curve.csv/.png` | learning curve (SVM, LR) |
| `03_regularization_curve.csv/.png` | regularization curve për `C` |
| `04_group_cv_*.csv`, `04_group_cv_variance.png` | 5×5 CV me grupe |
| `05_test_uncertainty.csv` | Wilson dhe bootstrap për Test |
| `06_similarity_*` | ngjashmëria Train/Test |
| `07_*` | gabimet dhe çiftet e ngatërruara |
| `overfitting_summary.json` | përmbledhja e notebook 10 |
| `unseen/01_unseen_predictions.csv` | parashikimet për 118 rastet |
| `unseen/02_labelled_agreement.csv/.png` | përputhja për kategori |
| `unseen/03_labelled_per_class.csv` | përputhja për klasë |
| `unseen/04_labelled_errors.csv` | gabimet me fjalët kryesore |
| `unseen/05_no_class_prediction_distribution.csv` | çfarë parashikon modeli për tekstet pa klasë |
| `unseen/06_score_comparison.csv`, `unseen/03_score_distributions.png` | margin dhe mbulimi i fjalorit |
| `unseen/unseen_summary.json` | përmbledhja e notebook 11 |
| `../../data/external/unseen_v1.csv` + `.manifest.json` | dataset-i i ngrirë dhe hash-i |
