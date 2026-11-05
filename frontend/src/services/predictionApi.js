const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5080"
).replace(/\/+$/, "");

export const MIN_LENGTH = 15;
export const MIN_WORDS = 3;
export const MAX_LENGTH = 5000;

// Mirrors the checks performed by the Flask API so users get feedback
// before a request is sent. Returns an error message, or "" if valid.
export function validateSymptoms(text) {
  const cleaned = text.trim();

  if (
    cleaned.length < MIN_LENGTH ||
    cleaned.split(/\s+/).length < MIN_WORDS
  ) {
    return "Please describe your symptoms in more detail.";
  }

  if (cleaned.length > MAX_LENGTH) {
    return "Symptom description is too long.";
  }

  return "";
}

export async function predictDisease(symptoms) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/prediction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symptoms: symptoms.trim() }),
    });
  } catch {
    throw new Error(
      "Could not connect to the server. Make sure the ASP.NET Core API and the Flask ML service are running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Prediction request failed.");
  }

  return data;
}
