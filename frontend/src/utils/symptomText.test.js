import { describe, expect, it } from "vitest";
import {
  appendSymptoms,
  buildSymptomDescription,
  detailsMissingFromText,
  symptomsMissingFromText,
} from "./symptomText";

describe("English drafts (unchanged behaviour)", () => {
  it("groups symptoms by category", () => {
    expect(buildSymptomDescription(["fever", "chills", "cough"])).toBe(
      "I have a high fever and chills. I also have a cough."
    );
  });

  it("adds the optional note as its own sentence", () => {
    expect(buildSymptomDescription(["cough"], "it started on monday")).toBe("I have a cough. It started on monday.");
  });

  it("finds symptoms missing from edited text, accepting the label word", () => {
    expect(symptomsMissingFromText(["fever", "cough"], "I have had a fever since Monday.")).toEqual(["cough"]);
    expect(symptomsMissingFromText(["rash"], "I had a bike crash")).toEqual(["rash"]);
  });

  it("appends without changing the user's words", () => {
    expect(appendSymptoms("My throat hurts", ["cough"])).toBe("My throat hurts. I also have a cough.");
    expect(appendSymptoms("I have had a fever for days.", [], "It started on Monday.")).toBe(
      "I have had a fever for days. It started on Monday."
    );
  });

  it("detects a missing note", () => {
    expect(detailsMissingFromText("It started on Monday.", "I have a fever.")).toBe(true);
    expect(detailsMissingFromText("", "I have a fever.")).toBe(false);
  });
});

describe("Albanian drafts", () => {
  it("builds a natural Albanian sentence", () => {
    expect(buildSymptomDescription(["fever", "chills", "cough"], "", "sq")).toBe(
      "Kam temperaturë të lartë dhe të dridhura. Gjithashtu kam kollë."
    );
  });

  it("matches Albanian text with or without ë", () => {
    expect(symptomsMissingFromText(["fever", "cough"], "kam temperature prej dje", "sq")).toEqual(["cough"]);
  });

  it("appends in Albanian", () => {
    expect(appendSymptoms("Kam temperaturë.", ["cough"], "", "sq")).toBe("Kam temperaturë. Gjithashtu kam kollë.");
  });
});
