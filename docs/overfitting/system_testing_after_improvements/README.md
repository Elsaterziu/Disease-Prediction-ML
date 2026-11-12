# Testimi i sistemit pas përmirësimeve të input-it

**Data:** 2026-11-12
**Sistemi i testuar:** React (5173) → ASP.NET Core (5080) → Flask (5000) → kontrolli i input-it → TF-IDF → SVM.

Modeli SVM, TF-IDF, dataset-et, notebook-ët 01–11, `unseen_v1` dhe rezultatet e mëparshme **nuk u ndryshuan**. Përmirësimet janë vetëm në nivel aplikacioni. Ato vendosin cili tekst i dërgohet modelit dhe kur nuk shfaqet asnjë sëmundje.

> Këto rezultate **nuk janë përmirësim i Accuracy së modelit**. Modeli mbetet i njëjti. Ndryshon vetëm sjellja e sistemit ndaj input-eve të panjohura, të paqarta ose jashtë fushës.

---

## 1. Zgjidhja e implementuar

Kontrolli kryesor është në **Flask** (`ml-api/`), para TF-IDF. Prandaj vlen edhe për kërkesat direkte në API: ASP.NET thjesht e përcjell përgjigjen pa ndryshim.

| Hapi | Moduli | Çfarë bën |
|---|---|---|
| 1. Normalizimi i termave mjekësorë | `input_checks.py` + `symptom_lexicon.py` | 47 terma (p.sh. *pyrexia → fever*) zëvendësohen me fjalë që modeli i njeh. Një test kontrollon që çdo zëvendësim përdor fjalë nga fjalori i modelit. 10 terma janë shënuar "kërkon verifikim profesional" (`medical_terms_review.csv`). Termat me pamje mjekësore që nuk njihen nuk hamendësohen: përdoruesit i kërkohet sqarim. |
| 2. Identifikimi i simptomave | `symptom_lexicon.py` | Fjalor i kontrolluar, i ndërtuar nga katalogu "Select symptoms", nga fjalori i përkthyesit shqip dhe nga shprehjet e teksteve të trajnimit. Simptomat identifikohen me fraza ("runny nose") dhe me kombinime pjesë trupi + fjalë simptome brenda së njëjtës fjali ("my knee hurts"). Nuk ka lista që bllokojnë fjalë si "pharmacy". |
| 3. Mohimi në anglisht | `input_checks.py` | I njëjti parim si në shqip: simptomat pas *no / not / without / don't…* **hiqen** nga teksti që i dërgohet modelit. Pjesa tjetër mbetet fjalë për fjalë. Frazat si *no appetite, can't sleep, doesn't go away, haven't been able to* trajtohen si simptoma të pranishme. Mohimi i paqartë ("No fever and cough") ose pasiguria ("not sure if…") → sqarim. Vetëm simptoma të mohuara → sqarim. |
| 4. Vendimi për input-in | `input_checks.py` | `valid` (të paktën një simptomë specifike), `no_symptoms`, ose `needs_clarification` (arsye: `negationUnclear`, `uncertain`, `onlyNegated`, `insufficient`, `conditionOnly`, `unknownTerms`). Vetëm `valid` vazhdon te modeli. |
| 5. Abstenimi | `match_check.py` + `resources/symptom_class_support.json` | Pas parashikimit kontrollohet nëse të paktën një simptomë e identifikuar është tipike për klasën e parashikuar, pra shfaqet në ≥10% të përshkrimeve të **trajnimit** të asaj klase. Nëse jo → `no_reliable_match` dhe sëmundja nuk shfaqet. |
| 6. Ndërfaqja | `SymptomAnalysis.jsx` | Pamje e re për *No symptoms found*, *Please clarify* dhe *No reliable match*, në anglisht dhe shqip. Te parashikimet shfaqen termat e normalizuar, simptomat e përjashtuara dhe teksti që analizoi modeli. Shpjegimi i modelit, Vocabulary Coverage dhe paralajmërimi "Educational prediction only. Not a medical diagnosis." mbeten. |

### Si u përcaktua pragu i abstenimit
- Pragu u vendos **vetëm** me të dhëna zhvillimi: Validation split dhe `unseen_v1`. Grupi i pavarur dhe Test split nuk u përdorën.
- Rregulli u përcaktua para se të shiheshin rezultatet: *pragu më i lartë nga {0.05, 0.10, 0.15, 0.20} që refuzon ≤5% të Validation dhe ≤10% të rasteve të reja brenda fushës*.

| Pragu | Validation refuzohen | `unseen_v1` brenda fushës | `unseen_v1` jashtë fushës |
|---|---|---|---|
| 0.05 | 0.0% | 6.2% | 35.7% |
| **0.10 (zgjedhur)** | **4.0%** | **6.2%** | **50.0%** |
| 0.15 | 6.2% | 6.2% | 57.1% |
| 0.20 | 9.6% | 12.5% | 57.1% |

Treguesit e krahasuar në zhvillim (AUROC, brenda fushës kundrejt jashtë fushës):

| Treguesi | AUROC | Përdorimi |
|---|---|---|
| Mbështetja e simptomave | 0.79 | përdoret për vendimin |
| Ngjashmëria me tekstet e trajnimit | 0.74 | nuk përdoret |
| Top decision score | 0.70 | nuk përdoret |
| Margin | 0.59 | nuk përdoret |

Decision score dhe margin nuk përdoren si probabilitet ose si prag. Të dhënat e kalibrimit janë në `abstention_calibration_dev.csv`.

---

## 2. Rrjedha e re

1. Përdoruesi shkruan në shqip ose anglisht.
2. **Shqip:** përkthyesi i kontrolluar në frontend tregon përkthimin, heq simptomat e mohuara dhe bllokon kur nuk kupton (si më parë, me fjalor të zgjeruar). **Anglisht:** teksti dërgohet ashtu siç është.
3. Flask: normalizon termat mjekësorë → identifikon simptomat e pranishme dhe të mohuara → vendos `valid` / `no_symptoms` / `needs_clarification`.
4. Nëse input-i nuk është `valid` → kthehet mesazhi, **pa sëmundje**.
5. Nëse është `valid` → teksti i kontrolluar (pa mohimet) kalon te TF-IDF + SVM, të pandryshuar.
6. Kontrolli i abstenimit: nëse asnjë simptomë nuk është tipike për klasën e parashikuar → `no_reliable_match`, pa sëmundje.
7. Përndryshe shfaqet parashikimi, me shpjegimin, Vocabulary Coverage dhe paralajmërimin.

---

## 3. Rezultatet

### 3.1 Testet e kërkuara (11 + 1 variant)

| Test | Input | Rezultati real | Vlerësimi |
|---|---|---|---|
| T01 | What time does the pharmacy close on Sundays? | *No symptoms found* | ✔ |
| T02 | I need to book a flight to Prishtina next month. | *No symptoms found* | ✔ |
| T03 | Dysuria haematuria pyrexia nocturia | normalizohet në "pain during urination, blood in urine, fever, urination during the night" → Urinary tract infection | ✔ normalizim |
| T04 | Very thirsty and urinating often, but no burning when I pee and no fever. | dërgohet "Very thirsty and urinating often." → Urinary tract infection; shfaqet "burning when I pee", "fever" të përjashtuara | ✔ mohimi hiqet (parashikimi mbetet UTI për shkak të "urinating often") |
| T05 | I have an uneven spine, one shoulder is higher than the other, and I experience back pain. | *No reliable match* | ✔ pa rregull të posaçëm: "back pain" nuk është tipike për klasën që zgjodhi modeli |
| T06 | I have fever, headache and cough. | analizë normale → Bronchial Asthma | ✔ analizohet |
| T07 | Ku mund ta blej një biletë avioni për muajin tjetër? | bllokohet nga përkthyesi: "Nuk u gjet asnjë simptomë e njohur" | ✔ |
| T08 | Kam temperaturë të lartë, dhimbje koke dhe dhimbje pas syve. | përkthehet → Ethet dengue | ✔ |
| T09 | Kam kollë, por nuk kam temperaturë. | "temperaturë" përjashtohet; teksti "I have cough." **bllokohet nga rregulli ekzistues i gjatësisë** (15 shkronja) | ⚠ temperatura nuk dërgohet, por nuk ka analizë |
| T09b | Kam kollë dhe dhimbje fyti, por nuk kam temperaturë. | dërgohet "I have cough and sore throat." → Alergji | ✔ mohimi në shqip |
| T10a | I have a fever and a cough, and my sinuses feel all gunky. | analizohet → Common Cold | ✔ vazhdon me fjalë të panjohura |
| T10b | My spleen feels weird and floopy. | *No symptoms found* | ✔ pa sëmundje (pritej sqarim; rezultati është po pa sëmundje) |

### 3.2 Grupi i pavarur `system_validation_v1` (84 raste)
- Grupi u shkrua dhe u ngri me SHA-256 **para** implementimit dhe nuk u përdor për zhvillim.
- "Para" për anglishten është llogaritur offline me modelin e njëjtë dhe rregullat e vjetra: sistemi shfaqte gjithmonë sëmundje, përveç teksteve shumë të shkurtra ose pa asnjë fjalë të njohur.

| Metrika | Anglisht para | Anglisht pas | Shqip pas | Gjithsej pas |
|---|---|---|---|---|
| Input-e të pavlefshme (pa lidhje / të paqarta) të refuzuara saktë | 0 / 20 | **18 / 20** | 4 / 4 | **22 / 24** |
| Input-e të vlefshme të pranuara (shfaqet sëmundje) | 42 / 42 | **35 / 42** | 3 / 7 | **38 / 49** |
| Input-e të vlefshme të refuzuara gabimisht | 0 / 42 | **7 / 42** | 4 / 7 | **11 / 49** |
| Raste jashtë fushës që ende marrin parashikim | 10 / 10 | **2 / 10** | 0 / 1 | **2 / 11** |

**Detaje:**
- **Tekste të pavlefshme që morën ende sëmundje (2):**
  - "I'm tired of waiting for the bus every morning." → Chicken pox ("tired" njihet si simptomë);
  - "The meeting gave me a headache, there were so many slides." → Chicken pox (idiomë).
- **Të vlefshme në anglisht të refuzuara (7):** të gjitha me *No reliable match*. P.sh. "got the chills and I'm burning up", "it stings when I wee…", "Arthralgia with morning stiffness in both hands." Në 6 rastet me etiketë të propozuar, parashikimi i fshehur i modelit **ishte i gabuar** në 6/6. Abstenimi pra fshehu kryesisht parashikime të gabuara, por përdoruesi nuk merr përgjigje.
- **Të vlefshme në shqip të bllokuara (4):** nga fjalori i përkthyesit ("Sytë e mi janë të verdhë…", "Kam humbur oreksin…", "marr frymë thellë") dhe nga rregulli i gjatësisë ("Kam temperaturë, por jo kollë." → "I have fever.").
- **Jashtë fushës me parashikim (2):**
  - "The front of my neck is swollen, I feel nervous, my heart races and I'm losing weight." → Peptic ulcer disease;
  - "Sharp pain in the lower right abdomen with fever and loss of appetite." → Peptic ulcer disease.

  Simptomat mbivendosen me klasat e mbështetura.

**Vetëm për informacion (jo qëllim):** te 39 rastet anglisht me etiketë të propozuar, përputhja ishte 18/39 para. Pas: 20/33 te rastet ku shfaqet sëmundje, dhe 6 raste u abstenuan.

### 3.3 Krahasimi para/pas në 50 rastet e mëparshme (`before_after_previous50.csv`)

| | Para | Pas |
|---|---|---|
| Raste ku shfaqet sëmundje | 37 | 32 |
| Input-e pa klasë të saktë (pa lidhje, të paqarta, jashtë fushës) që marrin sëmundje | 11 | **3** |
| Input-e me etiketë të propozuar ku shfaqet sëmundje | 26 | **29** |

Ndryshimet kryesore:
- 4 tekstet pa lidhje (farmacia, fluturimi, makina, fjalëkalimi) → *No symptoms found*.
- "I just don't feel well lately." dhe "I have pain sometimes…" → sqarim.
- Gurët në veshka mbeten UTI; rasti me humbje shijeje dhe nuhatjeje mbetet Diabetes.
- "Dysuria haematuria pyrexia nocturia" → më parë rezultati fshihej; tani normalizohet dhe analizohet.
- Shqip: 5 përshkrime që më parë bllokoheshin tani përkthehen dhe analizohen (`SQ-02`, `SQ-03`, `SQ-04`, `SQ-04b`, `SQ-05`).
- Në 23 raste teksti i dërguar te modeli është identik me më parë dhe sëmundja shfaqet. Në të 23 parashikimi është i njëjti (0 ndryshime): modeli nuk ka ndryshuar.

**Efekt anësor i vërejtur:** `SQ-03` ("…kollë me gëlbazë të verdhë…") tani përkthehet edhe me "yellow phlegm". Modeli e lidh "yellow" me Verdhëzën dhe parashikimi bëhet Verdhëz. Përkthimi është besnik ndaj tekstit, por fjalët shtesë mund të ndikojnë modelin.

---

## 4. Kufizimet që mbeten

- **Jashtë fushës:** sëmundjet me simptoma të ngjashme me klasat e mbështetura (p.sh. gurë në veshka → UTI, tiroide → ulçerë) ende marrin parashikim. Mekanizmi nuk mund t'i dallojë të gjitha.
- **Refuzime të gabuara:** abstenimi refuzoi 7/42 përshkrime të vlefshme në anglisht (17%), më shumë se 6% në zhvillim. Pragu u përcaktua në të dhëna të vogla.
- **Fjalori i kontrolluar** nuk mbulon të gjitha shprehjet e përditshme ("burning up", "wiped out", "wee") dhe idiomat ("tired of waiting", "gave me a headache").
- **Mohimi me rregulla** nuk i kap të gjitha strukturat gjuhësore. Disa formulime të qarta kërkojnë sqarim.
- **Shqip:** fjalori i përkthyesit mbetet i kufizuar dhe rregulli i gjatësisë minimale (15 shkronja, 3 fjalë) bllokon përkthime me një simptomë ("I have cough.").
- **Verifikimi:** termat mjekësorë, fjalori i simptomave dhe etiketat e testeve **nuk janë verifikuar klinikisht**. 10 terma janë shënuar për verifikim profesional.
- **Pavarësia e testit:** rastet e pavarura i shkroi i njëjti autor (AI) që shkroi rregullat, megjithëse para tyre. Tekste të shkruara nga persona të tjerë do të ishin test më i fortë.
- **Modeli** mbetet bag-of-words dhe saktësia e tij nuk ka ndryshuar.

---

## 5. Skedarët

| Skedari | Përmbajtja |
|---|---|
| `results_all.csv` | të gjitha 146 rastet: teksti, gjuha, teksti i dërguar, statusi, sëmundja ose mesazhi, simptomat, mohimet, termat, coverage, fjalët kryesore, screenshot |
| `independent_results.csv` | grupi i pavarur me sjelljen e pritur, "para" offline dhe parashikimet e fshehura të abstenimit |
| `before_after_previous50.csv` | krahasimi para/pas për 50 rastet e mëparshme |
| `summary.json` | të gjitha metrikat |
| `abstention_calibration_dev.csv` | treguesit e abstenimit në të dhënat e zhvillimit |
| `medical_terms_review.csv` | 47 termat e normalizuar, me shënimin për verifikim |
| `raw_results.json` | përgjigjet e plota të API-t |
| `screenshots/required/` | testet e kërkuara |
| `screenshots/previous50/` | 50 rastet e mëparshme |
| `screenshots/independent/` | 84 rastet e pavarura |
