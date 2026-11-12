import { afterEach, describe, expect, it, vi } from "vitest";
import { predictDisease, validateSymptoms } from "./predictionApi";

afterEach(() => vi.unstubAllGlobals());

describe("input validation (same rules as the Flask API)", () => {
  it.each([
    ["sore", "Please describe your symptoms in more detail."],
    ["a b", "Please describe your symptoms in more detail."],
    ["I have cough.", "Please describe your symptoms in more detail."],
    ["I have a cough and a fever", ""],
    ["word ".repeat(1001), "Symptom description is too long."],
  ])("%j", (text, expected) => {
    expect(validateSymptoms(text)).toBe(expected);
  });
});

describe("prediction request", () => {
  it("posts { symptoms } to /api/prediction and returns the JSON", async () => {
    const body = { predictedDisease: "Migraine", explanation: { positiveWords: [], negativeWords: [] } };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(predictDisease("  I have a headache  ")).resolves.toEqual(body);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/prediction$/);
    expect(JSON.parse(options.body)).toEqual({ symptoms: "I have a headache" });
  });

  it("passes the API's error message through", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Prediction service is unavailable." }), { status: 503 })
    ));
    await expect(predictDisease("I have a headache")).rejects.toThrow("Prediction service is unavailable.");
  });

  it("explains when the server cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(predictDisease("I have a headache")).rejects.toThrow(/Could not connect to the server/);
  });
});
