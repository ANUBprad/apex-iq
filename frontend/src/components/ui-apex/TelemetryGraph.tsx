import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TelemetryDataPoint {
  time: number;
  speed?: number;
  throttle?: number;
  brake?: number;
  gear?: number;
}

interface TelemetryGraphProps {
  data: TelemetryDataPoint[];
  className?: string;
}

const METRIC_COLORS: Record<string, string> = {
  speed: "#F5F5F5",
  throttle: "#00D9FF",
  brake: "#DC143C",
  gear: "#39FF14",
};

const METRIC_LABELS: Record<string, string> = {
  speed: "Speed",
  throttle: "Throttle",
  brake: "Brake",
  gear: "Gear",
};

export function TelemetryGraph({ data, className }: TelemetryGraphProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<
    Record<string, boolean>
  >({
    speed: true,
    throttle: true,
    brake: true,
    gear: false,
  });

  const toggleMetric = (key: string) => {
    setSelectedMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (data.length === 0) {
    return (
      <div
        className={`bg-bg-elevated border border-border-subtle rounded-sm p-6 ${className ?? ""}`}
      >
        <div className="font-rajdhani text-sm uppercase tracking-wide text-text-primary">
          Live Telemetry
        </div>
        <div className="mt-6 text-sm text-text-secondary">
          No telemetry samples are available for this session.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-bg-elevated border border-border-subtle rounded-sm p-6 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="font-rajdhani text-sm uppercase tracking-wide text-text-primary">
          Live Telemetry (Last 120s)
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" opacity={0.3} />

          <XAxis
            stroke="#696969"
            tick={{ fill: "#696969", fontSize: 11 }}
            type="number"
            dataKey="time"
            domain={["dataMin", "dataMax"]}
          />
          <YAxis
            stroke="#696969"
            tick={{ fill: "#696969", fontSize: 11 }}
            orientation="left"
          />

          <Tooltip
            contentStyle={{
              background: "#1A1A1A",
              border: "1px solid #333333",
              borderRadius: "4px",
            }}
            labelStyle={{ color: "#F5F5F5" }}
            formatter={(value: number) => value.toFixed(1)}
          />

          {selectedMetrics.speed && (
            <Line
              type="monotone"
              dataKey="speed"
              stroke={METRIC_COLORS.speed}
              dot={false}
              isAnimationActive={false}
              strokeWidth={2}
              name="Speed"
            />
          )}

          {selectedMetrics.throttle && (
            <Line
              type="monotone"
              dataKey="throttle"
              stroke={METRIC_COLORS.throttle}
              dot={false}
              isAnimationActive={false}
              strokeWidth={2}
              name="Throttle"
            />
          )}

          {selectedMetrics.brake && (
            <Line
              type="monotone"
              dataKey="brake"
              stroke={METRIC_COLORS.brake}
              dot={false}
              isAnimationActive={false}
              strokeWidth={2}
              name="Brake"
            />
          )}

          {selectedMetrics.gear && (
            <Line
              type="monotone"
              dataKey="gear"
              stroke={METRIC_COLORS.gear}
              dot={false}
              isAnimationActive={false}
              strokeWidth={2}
              name="Gear"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend / Toggle row */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        {Object.keys(selectedMetrics).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleMetric(key)}
            className="flex items-center gap-2 cursor-pointer transition-opacity"
            style={{ opacity: selectedMetrics[key] ? 1 : 0.35 }}
          >
            <div
              className="w-3 h-0.5 rounded-sm"
              style={{ background: METRIC_COLORS[key] }}
            />
            <span className="font-rajdhani uppercase text-text-primary">
              {METRIC_LABELS[key]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
