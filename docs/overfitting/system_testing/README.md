# Testimi praktik i sistemit me të dhëna të reja

**Data:** 2026-11-12
**Çfarë u testua:** aplikacioni real, nga faqja *Symptom Analysis*:
React (5173) → ASP.NET Core (5080) → Flask (5000) → TF-IDF → SVM (`models/svm_tuned_validation.joblib`).

Për çdo rast, teksti u shkrua në fushën e faqes dhe u shtyp butoni *Analyze / Analizo*. Për këtë u përdor një shfletues i automatizuar (Playwright me Microsoft Edge). U regjistruan:

- çfarë shfaq faqja;
- kërkesa dhe përgjigjja e saktë e `/api/prediction`;
- një screenshot i faqes.

Modeli, TF-IDF, dataset-et, notebook-ët dhe kodi i aplikacionit **nuk u ndryshuan**.

## Rastet

| Burimi | Raste |
|---|---|
| `data/external/unseen_v1.csv` (anglisht, të ngrira) | 30 |
| Raste shtesë për këtë test (nuk janë pjesë e `unseen_v1`) | 20: 2 në anglisht, 18 në shqip |
| **Gjithsej** | **50** |

Rastet shtesë:

- `EN-X01`: vetëm terma mjekësorë që modeli nuk i njeh, për të testuar rastin "asnjë fjalë e njohur";
- `EN-X02`: tekst shumë i shkurtër;
- `SQ-*`: raste në shqip. Katër prej tyre (`SQ-02b`, `SQ-03b`, `SQ-04b`, `SQ-05b`) janë riformulime më të thjeshta pas një bllokimi, siç do vepronte një përdorues real.

Të gjitha etiketat janë **të propozuara dhe jo të verifikuara klinikisht**.

## Skedarët

| Skedari | Përmbajtja |
|---|---|
| `system_test_results.csv` | tabela e plotë: teksti, gjuha, teksti i dërguar, parashikimi, coverage, fjalët e panjohura, shpjegimi, paralajmërimet, pranim/bllokim, krahasimi me notebook-un |
| `raw_results.json` | të dhënat e papërpunuara, përfshirë përgjigjen JSON të API-t |
| `system_test_summary.json` | përmbledhja numerike |
| `screenshots/<case_id>.png` | screenshot i faqes për çdo rast (50) |

---

## Rezultatet kryesore

| | Raste |
|---|---|
| Pranohet dhe shfaqet një sëmundje | 37 |
| Dërgohet, por ndërfaqja nuk e shfaq rezultatin (asnjë fjalë e njohur) | 1 |
| Bllokohet në ndërfaqe para se të dërgohet | 12 (1 anglisht, 11 shqip) |
| Aplikacioni = modeli offline për të njëjtin tekst | **38/38** |
| Aplikacioni = notebook 11 për rastet anglisht nga `unseen_v1` | **30/30** |

Rezultatet kundrejt etiketës së propozuar:

- 15 përputhen;
- 11 nuk përputhen;
- 11 tekste pa klasë të saktë marrin prapë një sëmundje;
- 12 nuk kanë parashikim (u bllokuan);
- 1 rast ka parashikim nga API, por ndërfaqja nuk e shfaq.

### Shembuj tipikë

| Rasti | Teksti | Rezultati në ndërfaqe | Paralajmërimi |
|---|---|---|---|
| EN-U013 | "Sudden very high fever, a pounding headache, pain behind my eyes…" | Dengue ✔ | – (16/17 fjalë të njohura) |
| EN-U005 | "…tightness in my chest and a whistling sound when I breathe out…" | Allergy ✘ (Asthma) | – ; fjalët kryesore: *running, night, breathe* |
| EN-U065 | "fever won't go away for days, tummy hurts and I'm weak" | Chicken pox ✘ (Typhoid) | – ; "tummy" nuk njihet |
| EN-U091 | "I just don't feel well lately." | Diabetes | vetëm paralajmërim mohimi; fjala kryesore: *feel* |
| EN-U099 | gurë në veshka (jashtë 24 klasave) | Urinary tract infection | – |
| EN-U113 | "What time does the pharmacy close on Sundays?" | Chicken pox | **asnjë**; 5/8 fjalë të njohura (*what, time, the*) |
| EN-U114 | "I need to book a flight to Prishtina next month." | Diabetes | ⚠ "recognised only a few of your words" (3/8) |
| EN-U118 | "I forgot my password and cannot log in to my account." | GERD | **asnjë**; fjalët kryesore: *in, my, to* |
| EN-U080 | "Very thirsty and urinating often, but no burning when I pee and no fever." | UTI ✘ (diabetes) | ⚠ mohim: "no burning…, no fever" |
| EN-X01 | "Dysuria haematuria pyrexia nocturia" | **nuk shfaqet**: "We couldn't analyze this description" | API ktheu *drug reaction* (0/4 fjalë), por faqja e fsheh |
| EN-X02 | "I feel sick" | **bllokohet**: "Please describe your symptoms in more detail." | – |
| SQ-01 | "Kam temperaturë të lartë, dhimbje koke të fortë dhe dhimbje pas syve." | Ethet dengue ✔ | përkthimi tregohet para dërgimit |
| SQ-02 | "Më djeg kur urinoj dhe më duhet të shkoj shpesh në tualet." | **bllokohet** | fjalë të panjohura: *duhet, shkoj, tualet* |
| SQ-02b | "Më djeg kur urinoj dhe urinoj shpesh." | Infeksion i rrugëve urinare ✔ | – |
| SQ-04b | "Kam skuqje dhe kruajtje në lëkurë, por nuk kam temperaturë." | **bllokohet** | "lëkurë" nuk njihet; "temperaturë" do të hiqej si e mohuar |
| SQ-08 | "Ku mund ta blej një biletë avioni për muajin tjetër?" | **bllokohet** | "Nuk u gjet asnjë simptomë e njohur" |
| SQ-09 | "Ndoshta kam grip, nuk jam i sigurt." | **bllokohet** | fjalë pasigurie ("Ndoshta"), mohim i paqartë |
| SQ-10 | "Kam temperatur te larte dhe kolle te forte." | Astmë bronkiale ✘ | korrigjim drejtshkrimor që duhet konfirmuar; "të fortë" humbet në përkthim |
| SQ-13 | "Nuk kam temperaturë dhe nuk kam kollë." | **bllokohet** | "Përmendët vetëm simptoma që nuk i keni." |

---

## Analiza

### 1. Çfarë ndodh kur përdoruesi shkruan simptoma që modeli nuk i njeh?

Modeli i **injoron** fjalët që nuk janë në fjalorin e tij (1,382 fjalë) dhe vendos vetëm me fjalët e mbetura.

- Kur të paktën disa fjalë njihen, rezultati shfaqet normalisht. Shpesh fjalët e njohura janë fjalë të përgjithshme si "the", "in", "my", "feel" dhe "days", ndaj rezultati mund të mos ketë lidhje me simptomat. P.sh. te "fever won't go away for days, tummy hurts", fjala "tummy" injorohet dhe rezultati është Chicken pox.
- Kur **asnjë** fjalë nuk njihet (`EN-X01`), API prapë kthen një sëmundje (*drug reaction*), por ndërfaqja **nuk e shfaq**. Në vend të saj tregon "We couldn't analyze this description" dhe listën e fjalëve të panjohura. Kjo është mbrojtja e vetme e plotë.

### 2. A jep modeli gjithmonë një sëmundje edhe kur input-i nuk është i vlefshëm?

**Po, modeli gjithmonë jep njërën nga 24 klasat.** Ai nuk ka opsion "nuk e di".

- Në anglisht, **11 nga 11** tekste pa klasë të saktë (të paqarta, jashtë 24 klasave, pa lidhje me simptomat) morën një sëmundje në ekran. P.sh. pyetja për farmacinë → Chicken pox; fjalëkalimi i harruar → GERD.
- Bllokohen vetëm:
  - tekstet nën 15 karaktere ose nën 3 fjalë;
  - tekstet ku asnjë fjalë nuk njihet (rezultati fshihet);
  - në shqip, tekstet që përkthyesi nuk i kupton.
- Paralajmërimi i mbulimit të ulët shfaqet vetëm kur njihen më pak se 3 fjalë ose më pak se 50% e fjalëve. Nga 4 tekstet pa lidhje me simptomat, vetëm 1 e mori (`EN-U114`). Te 3 të tjerët, fjalët e zakonshme ("what", "time", "my", "in") e kalojnë kufirin, ndaj nuk shfaqet asnjë paralajmërim.

### 3. A e informon ndërfaqja përdoruesin për kufizimet e modelit?

Pjesërisht. Çfarë funksionon:

- Titulli i rezultatit është "Closest match among 24 conditions… It is not a diagnosis". Çdo rezultat ka edhe "Educational prediction only. Not a medical diagnosis.", dhe footer-i e përsërit.
- Rreshti i mbulimit ("The model recognised X of Y words… not how likely the result is") shfaqet gjithmonë.
- Mohimet zbulohen në anglisht dhe përdoruesi paralajmërohet që modeli "reads 'no fever' as if fever were mentioned" (3/3 raste).
- "Why this result?" tregon fjalët që ndikuan. Kjo e bën të dukshëm një rezultat të pabazuar, p.sh. *What, time, the* për Chicken pox.

Çfarë mungon:

- Për tekste jashtë fushës ose pa lidhje, rezultati shfaqet me të njëjtin dizajn si një rezultat i mirë, pa asnjë sinjal që teksti nuk është përshkrim simptomash.
- Nuk ka masë besueshmërie, dhe me qëllim nuk shfaqet asnjë përqindje.
- Mbulimi i lartë i fjalorit nuk do të thotë që rezultati është i saktë. P.sh. `EN-U091` "I just don't feel well lately." ka 100% mbulim dhe jep Diabetes.

### 4. A përputhen rezultatet e aplikacionit me rezultatet e notebook-ut?

**Po, plotësisht.**

- Për 30 rastet anglisht nga `unseen_v1`, parashikimi në aplikacion është i njëjtë me notebook 11 (30/30).
- Për të 38 tekstet e dërguara, i njëjti tekst i dhënë modelit offline jep të njëjtën klasë (38/38).

Pra rruga React → ASP.NET → Flask nuk e ndryshon tekstin dhe nuk shton gabime. Rezultatet e notebook-ut (p.sh. ~56% përputhje te `unseen_v1`) vlejnë edhe për aplikacionin real.

### 5. Si reagon sistemi në shqip kur përkthyesi nuk i njeh simptomat?

Përkthyesi shqip → anglisht është i kontrolluar dhe **nuk hamendëson**. Kur has një fjalë të panjohur, ai **bllokon** analizën: butoni çaktivizohet dhe faqja tregon fjalët e panjohura dhe një sugjerim për riformulim. Asnjë tekst nuk i dërgohet modelit.

- Nga 18 rastet në shqip, **11 u bllokuan**.
  - Kjo është e mirë për tekstet pa lidhje (`SQ-08`), të pasigurta (`SQ-09`), me vetëm mohime (`SQ-13`) ose jashtë fushës (`SQ-07`): sistemi nuk jep sëmundje të rreme, ndryshe nga versioni anglisht.
  - Por bllokohen edhe përshkrime të vlefshme për shkak të fjalëve të zakonshme që mungojnë në fjalor: "lëkurë", "verdhë", "tualet", "kruhet", "oreksi", "qafa", "këto".
- Kur përshkrimi riformulohet me fjalë të thjeshta, përkthimi shfaqet para dërgimit dhe rezultati është i arsyeshëm (`SQ-02b`, `SQ-03b`, `SQ-12`).
- Simptomat e mohuara në shqip **hiqen** nga teksti i dërguar, dhe përdoruesi njoftohet.
- Gabimet drejtshkrimore korrigjohen vetëm pas konfirmimit nga përdoruesi (`SQ-10`).
- Teksti anglisht i shkruar në modalitetin shqip dërgohet pa përkthim (`SQ-11`).
- Kur përkthimi kalon, modeli prapë mund të gabojë, sepse teksti i përkthyer është i shkurtër dhe i thjeshtë: "I have high fever and cough." → Astmë bronkiale; "I have stomach pain and weakness." → Cervical spondylosis.

---

## Përfundim

1. Aplikacioni sillet njëlloj si modeli në notebook. Kufizimet e gjetura në analizën e overfitting-ut vlejnë drejtpërdrejt për sistemin real.
2. Në anglisht, sistemi **jep gjithmonë një sëmundje**, edhe për pyetje që s'kanë lidhje me shëndetin. Bllokohen vetëm tekstet shumë të shkurtra dhe tekstet ku asnjë fjalë nuk njihet.
3. Paralajmërimet ekzistuese (mbulimi, mohimi, disclaimer, "why this result") janë të dobishme, por nuk i kapin tekstet jashtë fushës që përmbajnë fjalë të zakonshme.
4. Në shqip, sistemi është shumë më i kujdesshëm: bllokon kur nuk kupton. Kjo shmang rezultatet e rreme, por bllokon edhe shumë përshkrime të vlefshme për shkak të fjalorit të kufizuar të përkthyesit.

**Kufizimet e testit:**

- 50 raste;
- etiketat nuk janë të verifikuara klinikisht;
- rastet shqip janë shkruar për këtë test;
- u testua vetëm modaliteti "Shkruaj simptomat", jo "Zgjidh simptomat".

---

## Raste për demonstrim para mentorit

Të gjitha janë riprodhuar në aplikacion dhe kanë screenshot në `screenshots/`.

| # | Çfarë tregon | Gjuha | Teksti për ta shkruar | Pritet |
|---|---|---|---|---|
| 1 | Rast që funksionon | EN | Sudden very high fever, a pounding headache, pain behind my eyes and my bones and joints ache terribly. | Dengue |
| 2 | Formulim i përditshëm që dështon | EN | fever won't go away for days, tummy hurts and I'm weak | Chicken pox ("tummy" e panjohur) |
| 3 | Tekst pa lidhje → prapë sëmundje, pa paralajmërim | EN | What time does the pharmacy close on Sundays? | Chicken pox; "Why this result?" tregon *What, time, the* |
| 4 | Paralajmërimi i mbulimit të ulët | EN | I need to book a flight to Prishtina next month. | Diabetes + paralajmërim (3/8 fjalë) |
| 5 | Asnjë fjalë e njohur → rezultati fshihet | EN | Dysuria haematuria pyrexia nocturia | "We couldn't analyze this description" |
| 6 | Mohimi nuk kuptohet nga modeli | EN | Very thirsty and urinating often, but no burning when I pee and no fever. | UTI + paralajmërim mohimi |
| 7 | Sëmundje jashtë 24 klasave | EN | Sudden severe pain in my lower back that moves to my groin, and there is blood in my urine. | Urinary tract infection |
| 8 | Shqip që funksionon (me përkthim të dukshëm) | SQ | Kam temperaturë të lartë, dhimbje koke të fortë dhe dhimbje pas syve. | Ethet dengue |
| 9 | Shqip: fjalë të panjohura → bllokim | SQ | Më djeg kur urinoj dhe më duhet të shkoj shpesh në tualet. | Bllokohet; pastaj riformulo në "Më djeg kur urinoj dhe urinoj shpesh." → Infeksion urinar |
| 10 | Shqip: tekst pa lidhje → bllokim (krahaso me #3) | SQ | Ku mund ta blej një biletë avioni për muajin tjetër? | Bllokohet: "Nuk u gjet asnjë simptomë e njohur" |

Rendi i sugjeruar: 1 → 2 → 3 → 4 → 5 → 6 → 8 → 9 → 10. Ky rend tregon së pari që sistemi funksionon, pastaj kufizimet e modelit, dhe në fund ndryshimin mes sjelljes në anglisht dhe në shqip.
