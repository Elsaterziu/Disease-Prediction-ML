// Controlled Albanian -> English dictionary for symptom descriptions.
//
// Keys are written WITHOUT ë/ç (the translator strips them before matching),
// so "temperaturë" and "temperature" both match "temperature". Every English
// phrase uses words that exist in the fitted TF-IDF vocabulary (checked by the
// Vitest suite), so the model can actually use the translated words.
//
// Scope: only expressions with one clear meaning. Ambiguous words are left
// out on purpose so the translator asks for clarification instead of
// guessing (see AMBIGUOUS_WORDS below).
//
// NOTE: written for this project. NOT verified by a medical professional or a
// certified translator; entries in NEEDS_REVIEW especially need checking.

// [Albanian variants, English phrase]
export const SYMPTOM_PHRASES = [
  // General
  [["temperature", "temperatura", "zjarrmi", "zjarrmia", "ethe", "ethet"], "fever"],
  [["temperature e larte", "temperature te larte", "temperatura e larte", "ethe te larta", "temperature e nalte", "temperature te nalte"], "high fever"],
  [["te dridhura", "dridhje", "dridhem", "me dridhet trupi", "dridhje te trupit", "mardhij", "me mardhin"], "chills"],
  [["lodhje", "lodhje e madhe", "i lodhur", "e lodhur", "jam i lodhur", "jam e lodhur", "i lodhun", "e lodhun", "jam i lodhun", "jam e lodhun", "lodhem shpejt"], "fatigue"],
  [["lodhje te vazhdueshme", "lodhje e vazhdueshme"], "constant fatigue"],
  [["dobesi", "dobesi e pergjithshme", "pafuqi", "ndihem pa fuqi", "jam pa fuqi"], "weakness"],
  [["humbje peshe", "humbje ne peshe", "kam humbur peshe", "humbur peshe", "kam ra ne peshe"], "weight loss"],
  [["humbje oreksi", "humbje e oreksit", "nuk kam oreks", "s kam oreks", "pa oreks", "nuk kam deshire per ushqim", "nuk me hahet", "me eshte prere oreksi", "me ka rene oreksi", "me ka ikur oreksi", "oreks i dobet"], "loss of appetite"],
  [["djersitje", "djersitje e tepert", "djersitem", "djersitem shume", "djerse"], "sweating"],
  [["uri e tepert", "uri te madhe", "uri e madhe", "jam gjithmone i uritur", "jam gjithmone e uritur"], "excessive hunger"],
  [["etje"], "thirst"],
  [["etje e madhe", "etje e tepert"], "excessive thirst"],
  [["ndihem keq", "ndjehem keq", "nuk ndihem mire", "nuk ndjehem mire", "s ndihem mire", "nuk jam mire", "s jam mire"], "feel unwell"],
  [["dhimbje trupi", "dhimbje ne trup", "me dhemb trupi", "me dhemb i gjithe trupi", "me dhemb krejt trupi"], "body pain"],
  [["enjtje", "enjtje e trupit"], "swelling"],
  [["gjakderdhje"], "bleeding"],
  [["pagjumesi", "nuk mund te fle", "s mund te fle", "nuk fle dot", "nuk me zen gjumi", "s me zen gjumi"], "trouble sleeping"],
  [["rrahje te forta te zemres", "palpitacione", "zemra me rreh shpejt", "me rreh zemra shpejt"], "palpitations"],

  // Head & neurological
  [["kokedhimbje"], "headache"],
  [["dhimbje", "dhimbje te forta", "me dhemb"], "pain"],
  [["marramendje", "marrje mendsh", "me merren mendte", "me vjen rreth koka", "me vjen vertigo", "trullosje"], "dizziness"],
  [["shikim i turbullt", "shikim te turbullt", "shoh turbull", "turbullim i shikimit", "sy te turbullt", "nuk shoh qarte"], "blurred vision"],
  [["dhimbje pas syve", "me dhembin syte nga brenda"], "pain behind my eyes"],
  [["humbje ekuilibri", "humbje e ekuilibrit", "nuk mbaj ekuilibrin", "s mbaj ekuilibrin", "probleme me ekuilibrin"], "trouble keeping my balance"],
  [["veshtiresi ne perqendrim", "nuk mund te perqendrohem", "s mund te perqendrohem", "veshtiresi per tu perqendruar"], "difficulty concentrating"],

  // Respiratory
  [["kolle", "kolla", "kollitem", "kollitje", "kollem"], "cough"],
  [["kolle e thate", "kolle te thate", "kolla e thate"], "dry cough"],
  [["veshtiresi ne frymemarrje", "frymemarrje e veshtire", "me merret fryma", "mungese ajri", "nuk marr fryme mire", "nuk marr dot fryme", "s marr fryme", "me zihet fryma"], "shortness of breath"],
  [["rrjedhje hundesh", "rrjedhje e hundes", "rrjedhje hunde", "me rrjedhin hundet", "hundet me rrjedhin", "me rrjedh hunda", "me pikojne hundet"], "runny nose"],
  [["hunde te zena", "hundet e zena", "hunde te bllokuara", "hunda e zene", "me jane zene hundet"], "congestion"],
  [["teshtij", "teshtitje", "teshtij shpesh", "teshtis"], "sneezing"],
  [["fyt i djegur", "me djeg fyti", "me ka zene fyti"], "sore throat"],
  [["gelbaze", "kelbaze"], "phlegm"],
  [["gelbaze te verdhe", "gelbaze e verdhe"], "yellow phlegm"],
  [["mukoze", "sekrecione"], "mucus"],
  [["fishkellime", "fershellime", "fishkellime ne gjoks"], "wheezing"],

  // Digestive
  [["te perziera", "nauze", "me vjen per te vjelle", "me perzihet", "me vjen me vjell", "mu perzi", "me vjen te vjell"], "nausea"],
  [["te vjella", "vjell", "kam vjelle", "vjellje", "kam vjell"], "vomiting"],
  [["diarre", "barkqitje", "bark i shpeshte"], "diarrhea"],
  [["kapsllek", "kabzllek"], "constipation"],
  [["refluks", "refluks acid", "kthim acidi"], "acid reflux"],
  [["acid ne stomak"], "stomach acid"],
  [["urthe", "djegie stomaku", "djegie ne stomak", "me djeg stomaku"], "heartburn"],
  [["djegie ne gjoks"], "burning in my chest"],
  [["tretje e veshtire", "veshtiresi ne tretje", "dispepsi", "probleme me tretjen"], "indigestion"],
  [["gjak ne jashteqitje", "gjakderdhje gjate jashteqitjes"], "bleeding during bowel movements"],
  [["dhimbje gjate jashteqitjes"], "pain during bowel movements"],
  [["dhimbje dhe gjak gjate jashteqitjes", "gjak dhe dhimbje gjate jashteqitjes"], "pain and bleeding during bowel movements"],
  [["fryrje barku", "bark i fryre", "fryrje e barkut", "me fryhet barku"], "bloating"],

  // Urinary
  [["urine e erret", "urine te erret", "urina e erret"], "dark urine"],
  [["djegie gjate urinimit", "djegie kur urinoj", "me djeg kur urinoj", "dhimbje gjate urinimit"], "burning when urinating"],
  [["urinim i shpeshte", "urinim te shpeshte", "urinoj shpesh"], "frequent urination"],
  // Literal: going to the toilet often can mean urination OR bowel movements, so it is not interpreted.
  [["shkoj shpesh ne tualet", "me duhet te shkoj shpesh ne tualet", "shkoj shpesh ne banjo", "me duhet te shkoj shpesh ne banjo"], "a frequent need to go to the bathroom"],

  // Skin
  [["skuqje", "skuqje e lekures", "skuqje ne lekure", "skuqje te lekures"], "skin rash"],
  [["kruajtje", "kruajtje e lekures", "me ha lekura", "me han lekura", "me kruhet lekura", "lekura me kruhet", "kruhem", "kruajtje ne lekure", "kruajtje te lekures", "me kruhet", "me kruhen", "kruhet"], "itching"],
  [["njolla te kuqe", "pika te kuqe", "njolla te kuqe ne lekure"], "red spots"],
  [["flluska"], "blisters"],
  [["lekure e thate me luspa"], "dry scaly skin"],
  [["luspa", "lekure me luspa"], "scaly skin"],
  [["lekure e thate"], "dry skin"],
  [["lekure e verdhe", "lekura e verdhe", "lekure te verdhe", "zverdhje", "zverdhje e lekures"], "yellow skin"],
  [["sy te verdhe", "syte e verdhe", "syte te verdhe"], "yellow eyes"],
  [["pucrra"], "pimples"],
  [["pika te zeza"], "blackheads"],
  [["akne"], "acne"],
  [["plage me qelb", "plage qe kullojne"], "sores with pus"],
  [["qelb"], "pus"],
  [["venat e fryra", "vena te fryra", "varice", "venat e kembeve te fryra"], "swollen veins in my legs"],
  [["mavijosje", "mavijosje ne lekure"], "bruises"],

  // Musculoskeletal
  [["nyje te enjtura", "nyjet e enjtura", "enjtje e nyjeve", "me jane enjtur nyjet"], "swollen joints"],
  [["dobesi e muskujve", "dobesi ne muskuj", "muskuj te dobet"], "muscle weakness"],
  [["ngurtesi", "shtangim", "ngurtesi kur levizi"], "stiffness"],
  [["qafe e ngrire", "qafe e shtangur", "qafa e ngrire"], "stiff neck"],
  [["ngerce ne kembe", "ngerce ne kembet"], "cramps in my legs"],
  [["ngerce", "kramp", "krampe"], "cramps"],
];

// Body parts used in "dhimbje <part>", "më dhemb <part>" and "<part> më dhemb".
// Albanian inflected forms are listed explicitly.
export const BODY_PARTS = [
  [["koke", "koka", "koken", "kokes"], "headache"],
  [["bark", "barku", "barkun", "barkut", "stomak", "stomaku", "stomakun", "stomakut"], "stomach pain"],
  [["fyt", "fyti", "fytin", "fytit"], "sore throat"],
  [["gjoks", "gjoksi", "gjoksin", "gjoksit"], "chest pain"],
  [["shpine", "shpina", "shpinen", "shpines", "mes", "mesi", "mesin", "mesit"], "back pain"],
  [["qafe", "qafa", "qafen", "qafes"], "neck pain"],
  [["nyje", "nyjet", "nyjeve", "nyjesh", "nyja", "nyjen", "nyjes", "kyce", "kycet", "kyceve"], "joint pain"],
  [["muskuj", "muskujt", "muskujve", "muskujsh", "muskul", "muskuli", "muskulin"], "muscle pain"],
  [["sy", "syte", "syve", "syri", "syrin"], "eye pain"],
  [["kembe", "kembet", "kembeve", "kembesh", "kemba", "kemben", "kembes"], "leg pain"],
  [["krah", "krahe", "krahet", "kraheve", "krahesh", "krahu", "krahun"], "arm pain"],
];

// Templates combining a pain word with a body part (P = body part form).
// Templates containing "forte"/"forta"/"madhe"/"shume" mark the symptom as severe.
export const PAIN_TEMPLATES = [
  ["dhimbje", "P"],
  ["dhimbje", "ne", "P"],
  ["dhimbje", "te", "P"],
  ["dhimbje", "tek", "P"],
  ["dhimbje", "e", "P"],
  ["dhimbje", "te", "forta", "P"],
  ["dhimbje", "e", "forte", "P"],
  ["dhimbje", "te", "forte", "P"],
  ["dhimbje", "e", "madhe", "P"],
  ["me", "dhemb", "P"],
  ["me", "dhembin", "P"],
  ["me", "dhemb", "shume", "P"],
  ["me", "dhembin", "shume", "P"],
  ["po", "me", "dhemb", "P"],
  ["P", "me", "dhemb"],
  ["P", "me", "dhembin"],
];

// Spelling variants that mean the same in a phrase: linking articles change
// with case ("temperaturë e lartë" / "të lartë"; Gheg "t'"), "më" is written
// "ma"/"m'" in Kosovo, and "në" is often shortened to "n'".
export const EQUIVALENT_TOKENS = [
  ["e", "te", "i", "se", "t"],
  ["me", "ma", "m"],
  ["ne", "n"],
];

// Words that make the following symptoms negated ("nuk kam temperaturë").
export const NEGATORS = ["nuk", "s", "pa", "asnje", "as", "jo", "kurre"];
// English negation words in mixed Albanian/English text ("kam kollë but no fever").
export const ENGLISH_NEGATORS = ["no", "not", "without", "never", "don", "doesn", "didn", "haven", "hasn"];
// After a negator these cancel the negation: "jo vetëm kollë" = cough is present.
export const NEGATION_CANCELLERS = ["vetem"];

// Words that make the statement uncertain. The translator does not guess:
// a description containing them is sent back for clarification.
export const UNCERTAINTY_WORDS = ["ndoshta", "mbase", "sikur", "besoj", "ndonjehere"];

// Verbs that start a new, positive statement unless preceded by a negator.
// "kom"/"jom" are the Gheg (Kosovo) forms of "kam"/"jam".
export const POSITIVE_VERBS = ["kam", "kom", "ndiej", "ndjej", "ndihem", "ndjehem", "jam", "jom"];

// Words that intensify the next symptom ("dhimbje e fortë koke").
export const INTENSIFIERS = ["forte", "fort", "rende", "shume", "madhe"];

// Albanian words that carry no symptom meaning and can be dropped safely.
export const FILLERS = [
  "kam", "kom", "ka", "kemi", "kane", "jam", "jom", "je", "eshte", "osht", "jane", "ndihem", "ndjehem", "ndiej", "ndjej",
  "me", "ma", "te", "e", "i", "se", "qe", "si", "nje", "pak", "gjithashtu", "po", "tani", "nga", "per",
  "tek", "ne", "im", "ime", "mi", "mia", "mua", "sidomos", "kohet", "fundit", "dhe", "edhe", "por",
  "ose", "apo", "ndonje", "disa", "goxha", "teper", "vazhdimisht", "shpesh", "perseri", "deri",
  "atehere", "kur", "zakonisht", "gjate", "naten", "diten", "nates", "dites", "mengjes", "mengjesit",
  "mbremje", "mbremjes", "ashtu", "krejt", "pershendetje", "doktor", "doktoresh", "ju", "lutem",
  "faleminderit", "grade", "gradë",
];

// Body-part words that may follow "në" as a location ("skuqje në krahë",
// "kruajtje në lëkurë"). They are skipped, not reported as unknown, so the
// location is simply not translated; they never create a symptom on their own.
export const LOCATION_WORDS = [
  "lekure", "lekura", "lekuren", "lekures", "fytyre", "fytyra", "fytyren", "fytyres", "trup", "trupi", "trupin",
  "trupit", "duar", "duart", "dore", "dora", "doren", "krahe", "krahet", "krahu", "krahun", "kembe", "kembet",
  "kemben", "gishta", "gishtat", "gishtin", "shpine", "shpinen", "qafe", "qafen", "gjoks", "gjoksin", "bark", "barkun",
];

// Words that split a description into separate statements.
export const CLAUSE_BREAKS = ["dhe", "edhe", "ose", "apo"];
export const SENTENCE_BREAKS = ["por", "megjithate", "but"];

// Duration words: "prej 3 ditësh" -> "for 3 days" (Gheg "ditve" included).
export const NUMBER_WORDS = {
  nje: 1, dy: 2, tre: 3, tri: 3, kater: 4, pese: 5, gjashte: 6, shtate: 7, tete: 8, nente: 9, dhjete: 10,
};
export const DURATION_UNITS = {
  dite: "day", ditesh: "day", ditve: "day", dit: "day", jave: "week", javesh: "week", javve: "week", muaj: "month", muajsh: "month",
};

// English words dropped when English and Albanian are mixed in one text.
export const ENGLISH_STOPWORDS = [
  "have", "has", "had", "am", "is", "are", "was", "were", "been", "be", "the", "an", "my", "and",
  "with", "also", "very", "really", "feel", "feeling", "experiencing", "lot", "some", "it", "its",
];

// Deliberately NOT in the dictionary because they have more than one
// meaning; the translator asks the user to rephrase instead.
export const AMBIGUOUS_WORDS = {
  "i dobët / e dobët": "weak OR thin (skinny)",
  "fshikëz": "blister OR bladder",
  "nxirje": "bruise OR darkening / tan",
  "zihem": "choking OR suffocating, not the same as shortness of breath",
  "jam ftohur / ftohje": "a cold (diagnosis-like) OR feeling cold",
  "grip": "flu, a diagnosis, not a symptom",
  "dhëmb (tooth)": "spelled like 'dhemb' (hurts) once ë is dropped",
  "veshi (ear)": "'ear' is not in the model vocabulary",
};

// Translations that need checking by a medical professional or a certified
// translator before the system is used beyond this thesis.
export const NEEDS_REVIEW = [
  ["ethe / ethet", "fever", "can also mean fever with shivering (e.g. malaria fevers)"],
  ["mardhij / më mardhin", "chills", "Kosovo form for feeling cold / shivering"],
  ["trullosje", "dizziness", "can also mean being dazed"],
  ["më ka zënë fyti", "sore throat", "Kosovo expression, may also mean hoarseness"],
  ["skuqje", "skin rash", "can mean redness without a rash"],
  ["shkoj shpesh në tualet / banjo", "a frequent need to go to the bathroom", "translated literally: can mean frequent urination OR diarrhea, so it is not interpreted"],
  ["variçe", "swollen veins in my legs", "varicose veins is also a model class"],
  ["akne", "acne", "Acne is also a model class (disease name, not a symptom)"],
  ["zverdhje", "yellow skin", "yellowing; could refer to eyes"],
  ["krah", "arm pain", "in Gheg 'krah' can also mean shoulder"],
  ["këmbë", "leg pain", "'këmbë' means leg OR foot"],
  ["mes / mesi", "back pain", "waist / lower back"],
  ["ndihem keq / nuk ndihem mirë", "feel unwell", "general malaise, not a specific symptom"],
  ["bark i shpeshtë", "diarrhea", "colloquial expression"],
];
