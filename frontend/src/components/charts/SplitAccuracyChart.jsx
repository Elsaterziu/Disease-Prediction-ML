import {
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, axisTick } from "../../utils/chartTheme";
import { pct } from "../../utils/format";

function SplitTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{point.split}</strong>
      <span>
        <i style={{ background: CHART.series1 }} />
        {point.metric}: {pct(point.value)}
      </span>
    </div>
  );
}

// Accuracy of the final model on each split, with the group cross-validation
// mean ± standard deviation as a shaded band. Dots on a zoomed axis, like the
// other charts, so small differences are not exaggerated by bar lengths.
function SplitAccuracyChart({ rows, band, labels }) {
  const points = rows.map((row) => ({ ...row, metric: labels.metric }));
  const domain = [0.96, 1];
  const ticks = [0.96, 0.97, 0.98, 0.99, 1];

  return (
    <div className="chart-block">
      <div className="chart-legend" aria-hidden="true">
        <span>
          <i className="dot" style={{ background: CHART.series1 }} />
          {labels.metric}
        </span>
        <span>
          <i className="swatch" style={{ background: CHART.series2, opacity: 0.25 }} />
          {labels.band}
        </span>
      </div>

      <div className="chart-frame" style={{ height: rows.length * 52 + 60 }} role="img" aria-label={labels.aria}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
            <CartesianGrid stroke={CHART.grid} horizontal={false} />
            <ReferenceArea
              x1={band.mean - band.std}
              x2={band.mean + band.std}
              fill={CHART.series2}
              fillOpacity={0.15}
              stroke="none"
              ifOverflow="extendDomain"
            />
            <XAxis
              type="number"
              dataKey="value"
              domain={domain}
              ticks={ticks}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              tick={axisTick}
              stroke={CHART.grid}
              label={{ value: labels.axis, position: "insideBottom", offset: -14, fill: CHART.axis, fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="split"
              allowDuplicatedCategory={false}
              reversed
              width={110}
              tick={axisTick}
              stroke={CHART.grid}
              tickLine={false}
            />
            <Tooltip content={<SplitTooltip />} cursor={false} />
            <Scatter
              data={points}
              shape={({ cx, cy }) => (
                <circle cx={cx} cy={cy} r={9} fill={CHART.series1} stroke={CHART.surface} strokeWidth={2} />
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SplitAccuracyChart;
