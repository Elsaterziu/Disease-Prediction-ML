import { describe, expect, it } from "vitest";
import { DISEASE_NAMES_SQ, diseaseName } from "./diseaseNames";
import { MESSAGES } from "./messages";

describe("interface text", () => {
  it("has an Albanian text for every English key", () => {
    const missing = Object.keys(MESSAGES.en).filter((key) => !MESSAGES.sq[key]);
    expect(missing).toEqual([]);
  });

  it("uses the same {placeholders} in both languages", () => {
    const vars = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    for (const key of Object.keys(MESSAGES.en)) {
      expect(vars(MESSAGES.sq[key]), key).toBe(vars(MESSAGES.en[key]));
    }
  });
});

describe("disease names", () => {
  it("has an Albanian name for all 24 model labels", () => {
    expect(Object.keys(DISEASE_NAMES_SQ)).toHaveLength(24);
  });

  it("keeps the original label in English", () => {
    expect(diseaseName("drug reaction", "en")).toBe("Drug reaction");
    expect(diseaseName("drug reaction", "sq")).toBe("Reaksion ndaj barnave");
    expect(diseaseName("Unknown label", "sq")).toBe("Unknown label");
  });
});
