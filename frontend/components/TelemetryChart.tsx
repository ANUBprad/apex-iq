"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { lap: 1, pace: 91.2 },
  { lap: 2, pace: 90.8 },
  { lap: 3, pace: 91.5 },
  { lap: 4, pace: 92.4 },
  { lap: 5, pace: 93.1 },
  { lap: 6, pace: 94.0 },
  { lap: 7, pace: 95.2 },
  { lap: 8, pace: 96.4 },
  { lap: 9, pace: 97.8 },
  { lap: 10, pace: 99.1 },
];

export default function TelemetryChart() {
  return (
    <div className="telemetry-card p-5 h-[320px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Live Telemetry
          </p>

          <h2 className="text-2xl font-bold mt-1">
            Tyre Degradation
          </h2>
        </div>

        <div className="text-right">
          <p className="text-xs text-zinc-500">Current Pace</p>

          <h2 className="text-3xl font-bold text-red-500">
            +0.82s
          </h2>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <XAxis dataKey="lap" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="pace"
            stroke="#ff1e1e"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}