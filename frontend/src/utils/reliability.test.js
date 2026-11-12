import { describe, expect, it } from "vitest";
import { coverageLevel, detectNegations } from "./reliability";

describe("English negation warning (unchanged behaviour)", () => {
  it.each([
    ["I have no fever.", ["no fever"]],
    ["Sore throat without cough.", ["without cough"]],
    ["I am not experiencing headaches.", ["not experiencing headaches"]],
    ["no fever and a bad cough", ["no fever"]],
    ["I have a high fever with chills.", []],
    ["I cannot sleep at night", []],
  ])("%s", (text, expected) => {
    expect(detectNegations(text)).toEqual(expected);
  });
});

describe("vocabulary coverage levels", () => {
  it.each([
    [{ totalWords: 5, recognizedWords: 0, coverage: 0 }, "none"],
    [{ totalWords: 0, recognizedWords: 0, coverage: 0 }, "none"],
    [{ totalWords: 3, recognizedWords: 2, coverage: 0.67 }, "low"],
    [{ totalWords: 10, recognizedWords: 4, coverage: 0.4 }, "low"],
    [{ totalWords: 13, recognizedWords: 12, coverage: 0.92 }, "ok"],
    [undefined, null],
    [{ foo: 1 }, null],
  ])("%j -> %s", (coverage, level) => {
    expect(coverageLevel(coverage)).toBe(level);
  });
});
