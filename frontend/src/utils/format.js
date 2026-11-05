export const pct = (value, digits = 2) => `${(value * 100).toFixed(digits)}%`;

// Dataset labels mix cases ("Common Cold", "drug reaction"); show them in
// sentence case without changing the words.
export const conditionName = (label) =>
  label ? label[0].toUpperCase() + label.slice(1) : "";

export const dec =(value, digits = 4) => value.toFixed(digits);

// Differences smaller than the 4-decimal rounding of the source files are
// treated as no change.
export const NO_CHANGE = 5e-5;

export const signed = (value, digits = 2) => {
  const points = value * 100;
  if (Math.abs(value) < NO_CHANGE) return "±0.00 pp";
  return `${points > 0 ? "+" : "−"}${Math.abs(points).toFixed(digits)} pp`;
};
