// Exports the English symptom phrases the frontend can send to the API, so the
// backend tests can check that the input checks never reject them:
//   - phrases of the "Select symptoms" catalog (src/data/symptomCatalog.js)
//   - English output of the Albanian translation dictionary
// Read-only. Run from the project root:
//   node frontend/scripts/export_frontend_phrases.mjs
import { writeFileSync } from "node:fs";
import { SYMPTOM_CATEGORIES } from "../src/data/symptomCatalog.js";
import { BODY_PARTS, SYMPTOM_PHRASES } from "../src/translation/sqMedicalDictionary.js";

const catalog = SYMPTOM_CATEGORIES.flatMap((c) => c.symptoms.map((s) => s.phrase));
const albanian = [...new Set([...SYMPTOM_PHRASES.map(([, en]) => en), ...BODY_PARTS.map(([, en]) => en)])];

const out = new URL("../../ml-api/tests/frontend_phrases.json", import.meta.url);
writeFileSync(out, JSON.stringify({ catalog, albanian }, null, 1));
console.log(`catalog: ${catalog.length}, albanian: ${albanian.length} -> ${out.pathname}`);
