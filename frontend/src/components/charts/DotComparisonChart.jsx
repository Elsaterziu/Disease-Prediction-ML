import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, axisTick } from "../../utils/chartTheme";
import { pct } from "../../utils/format";

function DotTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <strong>{point.model}</strong>
      <span>
        <i style={{ background: point.color }} />
        {point.series}: {pct(point.value)}
      </span>
    </div>
  );
}

// Dot plot comparing two conditions per model. Dots encode position, not
// length, so a zoomed axis does not exaggerate differences the way a
// truncated bar chart would.
function DotComparisonChart({ rows, seriesA, seriesB, metricLabel }) {
  const toPoints = (series, color) =>
    rows.map((row) => ({
      model: row.model,
      value: series.get(row),
      series: series.label,
      color,
    }));

  const pointsA = toPoints(seriesA, CHART.series1);
  const pointsB = toPoints(seriesB, CHART.series2);

  const values = [...pointsA, ...pointsB].map((p) => p.value);
  const min = Math.max(0, Math.floor((Math.min(...values) - 0.005) * 50) / 50);
  const domain = [min, 1];
  const ticks = [];
  for (let t = Math.round(min * 100); t <= 100; t += 2) ticks.push(t / 100);

  return (
    <div className="chart-block">
      <div className="chart-legend" aria-hidden="true">
        <span>
          <i className="dot" style={{ background: CHART.series1 }} />
          {seriesA.label}
        </span>
        <span>
          <i className="diamond" style={{ background: CHART.series2 }} />
          {seriesB.label}
        </span>
      </div>

      <div className="chart-frame" style={{ height: rows.length * 52 + 60 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
            <CartesianGrid stroke={CHART.grid} horizontal={false} />
            <XAxis
              type="number"
              dataKey="value"
              domain={domain}
              ticks={ticks}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              tick={axisTick}
              stroke={CHART.grid}
              label={{
                value: metricLabel,
                position: "insideBottom",
                offset: -14,
                fill: CHART.axis,
                fontSize: 12,
              }}
            />
            <YAxis
              type="category"
              dataKey="model"
              allowDuplicatedCategory={false}
              reversed
              width={150}
              tick={axisTick}
              stroke={CHART.grid}
              tickLine={false}
            />
            <Tooltip content={<DotTooltip />} cursor={false} />
            {/* Series A is drawn larger so identical values stay visible
                as a ring around series B. */}
            <Scatter
              name={seriesA.label}
              data={pointsA}
              shape={({ cx, cy }) => (
                <circle
                  cx={cx}
                  cy={cy}
                  r={9}
                  fill={CHART.series1}
                  stroke={CHART.surface}
                  strokeWidth={2}
                />
              )}
            />
            <Scatter
              name={seriesB.label}
              data={pointsB}
              shape={({ cx, cy }) => (
                <path
                  d={`M${cx},${cy - 6.5}L${cx + 6.5},${cy}L${cx},${cy + 6.5}L${cx - 6.5},${cy}Z`}
                  fill={CHART.series2}
                  stroke={CHART.surface}
                  strokeWidth={1.5}
                />
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DotComparisonChart;
