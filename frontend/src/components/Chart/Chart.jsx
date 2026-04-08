import React, { useId } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Chart({
  type,
  data = [],
  title,
  subtitle,
  metric,
  colors = ["#22d3ee"],
  stacked = false,
  showLegend = false,
  height = 200,
  legendLabel = "",
  /** Area/line: lock Y axis at 0 so a flat series (e.g. 120) does not show as 108–132 ticks. */
  yFromZero = false,
}) {
  const gradientId = `chart-grad-${useId().replace(/:/g, "")}`;

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-4 h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    const commonAxisProps = {
      stroke: "#374151",
      tick: { fill: "#6B7280", fontSize: 12 },
      tickLine: { stroke: "#374151" },
    };

    const safeData = data.map((d) => ({
      ...d,
      value: (() => {
        const n = Number(d.value);
        return Number.isFinite(n) ? n : 0;
      })(),
    }));

    /** Single month / first bucket > 0: Recharts needs a prior point at y=0 to draw 0→n. */
    const areaPlotData =
      yFromZero &&
      type === "area" &&
      safeData.length > 0 &&
      safeData[0].value > 0
        ? [{ name: "\u00A0", value: 0 }, ...safeData]
        : safeData;

    const boundsFrom = (plotData) => {
      const values = plotData
        .flatMap((d) =>
          Object.entries(d)
            .filter(([key]) => key !== "name")
            .map(([, value]) => Number(value)),
        )
        .filter((n) => Number.isFinite(n));
      const minValue = values.length ? Math.min(...values) : 0;
      const maxValue = values.length ? Math.max(...values) : 0;
      const yAxisPadding = maxValue * 0.1;
      const yMax = Math.max(maxValue, 0);
      const yTop = yFromZero
        ? yMax + Math.max(yMax * 0.1, 1)
        : maxValue + yAxisPadding;
      const yBottom = yFromZero ? 0 : minValue - yAxisPadding;
      return { yBottom, yTop };
    };

    const { yBottom, yTop } = boundsFrom(
      type === "area" && yFromZero ? areaPlotData : safeData,
    );

    const commonProps = {
      data: type === "area" && yFromZero ? areaPlotData : safeData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1F2937"
              vertical={false}
            />
            <XAxis dataKey="name" {...commonAxisProps} />
            <YAxis
              {...commonAxisProps}
              domain={[yBottom, yTop]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="step"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1F2937"
              vertical={false}
            />
            <XAxis dataKey="name" {...commonAxisProps} />
            <YAxis
              {...commonAxisProps}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            {stacked ? (
              data[0] &&
              Object.keys(data[0])
                .filter((key) => key !== "name")
                .map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={colors[index % colors.length]}
                    stackId="stack"
                    radius={[4, 4, 0, 0]}
                  />
                ))
            ) : (
              <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} maxBarSize={80} />
            )}
            {showLegend && legendLabel && (
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                }}
                payload={[{ value: legendLabel, type: 'square', color: colors[0] }]}
                formatter={(value) => (
                  <span className="text-gray-400">{value}</span>
                )}
              />
            )}
          </BarChart>
        );

      case "area": {
        const grid = (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1F2937"
            vertical={false}
          />
        );
        const axes = (
          <>
            <XAxis dataKey="name" {...commonAxisProps} />
            <YAxis {...commonAxisProps} domain={[yBottom, yTop]} />
          </>
        );
        const defs = (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0.05} />
            </linearGradient>
          </defs>
        );
        // yFromZero (e.g. monthly traffic): stroke on Area alone can sit on the baseline and
        // hide 0 → n segments; overlay Line so the rise from zero is always drawn.
        if (yFromZero) {
          return (
            <ComposedChart {...commonProps}>
              {grid}
              {axes}
              <Tooltip content={<CustomTooltip />} />
              {defs}
              <Area
                type="linear"
                dataKey="value"
                stroke="none"
                strokeWidth={0}
                fill={`url(#${gradientId})`}
                connectNulls
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="value"
                stroke={colors[0]}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                connectNulls
                isAnimationActive={false}
                dot={{ r: 3, fill: colors[0], strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          );
        }
        return (
          <AreaChart {...commonProps}>
            {grid}
            {axes}
            <Tooltip content={<CustomTooltip />} />
            {defs}
            <Area
              type="linear"
              dataKey="value"
              stroke={colors[0]}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              connectNulls
              dot={false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        );
      }

      default:
        return null;
    }
  };

  const formatMetric = (value) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      if (numValue >= 1000000) {
        return `${(numValue / 1000000).toFixed(2)}M+`;
      }
      return numValue.toLocaleString();
    }
    return value;
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-200">{title}</h3>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
        {metric !== undefined && metric !== null && (
          <div className="text-right">
            <span className="text-lg font-semibold text-cyan-400">
              {formatMetric(metric)}
            </span>
          </div>
        )}
      </div>
      <div style={{ width: "100%", height: height || 300 }}>
        <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
      </div>
    </div>
  );
}
