import React,{ useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
}) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-4 h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const commonAxisProps = {
      stroke: "#374151",
      tick: { fill: "#6B7280", fontSize: 12 },
      tickLine: { stroke: "#374151" },
    };

    // Calculate min and max values for Y-axis
    const values = data.flatMap(d => 
      Object.entries(d)
        .filter(([key]) => key !== 'name')
        .map(([, value]) => Number(value))
    );
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const yAxisPadding = maxValue * 0.1; // Add 10% padding

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
              domain={[minValue - yAxisPadding, maxValue + yAxisPadding]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1F2937"
              vertical={false}
            />
            <XAxis dataKey="name" {...commonAxisProps} />
            <YAxis
              {...commonAxisProps}
              // domain={[minValue - yAxisPadding, maxValue + yAxisPadding]}
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
                  />
                ))
            ) : (
              <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
            )}
            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                }}
                formatter={(value) => (
                  <span className="text-gray-400">{value}</span>
                )}
              />
            )}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1F2937"
              vertical={false}
            />
            <XAxis dataKey="name" {...commonAxisProps} />
            <YAxis 
              {...commonAxisProps}
              domain={[minValue - yAxisPadding, maxValue + yAxisPadding]}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              fill="url(#colorGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-200">{title}</h3>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
        {metric && (
          <div className="text-right">
            <span className="text-lg font-semibold text-cyan-400">
              {metric}
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
