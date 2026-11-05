// Chart colors. series1/series2 pass the categorical palette validator on a
// light surface (CVD ΔE 17.5, normal-vision ΔE 21.0, both ≥ 3:1 contrast);
// charts also use shape (circle vs diamond) as a secondary encoding.
// Text uses ink tokens, never series colors.
export const CHART = {
  series1: "#5a5fb0",
  series2: "#2e9c83",
  grid: "#e1e5e3",
  axis: "#5f6a67",
  ink: "#1d2523",
  surface: "#ffffff",
};

export const axisTick = { fill: CHART.axis, fontSize: 12 };
