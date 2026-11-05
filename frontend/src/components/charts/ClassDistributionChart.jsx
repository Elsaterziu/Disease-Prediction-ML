import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, axisTick } from "../../utils/chartTheme";

function DistributionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <strong>{row.label}</strong>
      <span>
        <i style={{ background: CHART.series1 }} />
        Original: {row.original}
      </span>
      <span>
        <i style={{ background: CHART.series2 }} />
        Added by augmentation: {row.added}
      </span>
      <span className="muted">Total: {row.original + row.added}</span>
    </div>
  );
}

function ClassDistributionChart({ data }) {
  return (
    <div className="chart-block">
      <div className="chart-legend" aria-hidden="true">
        <span>
          <i className="swatch" style={{ background: CHART.series1 }} />
          Original training samples
        </span>
        <span>
          <i className="swatch" style={{ background: CHART.series2 }} />
          Added by augmentation
        </span>
      </div>

      <div className="chart-frame" style={{ height: data.length * 26 + 50 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
            barCategoryGap={4}
          >
            <CartesianGrid stroke={CHART.grid} horizontal={false} />
            <XAxis
              type="number"
              tick={axisTick}
              stroke={CHART.grid}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={170}
              interval={0}
              tick={{ ...axisTick, fontSize: 11 }}
              stroke={CHART.grid}
              tickLine={false}
            />
            <Tooltip
              content={<DistributionTooltip />}
              cursor={{ fill: "rgba(18, 48, 42, 0.05)" }}
            />
            <Bar
              dataKey="original"
              stackId="samples"
              fill={CHART.series1}
              stroke={CHART.surface}
              strokeWidth={1}
            />
            <Bar
              dataKey="added"
              stackId="samples"
              fill={CHART.series2}
              stroke={CHART.surface}
              strokeWidth={1}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ClassDistributionChart;
