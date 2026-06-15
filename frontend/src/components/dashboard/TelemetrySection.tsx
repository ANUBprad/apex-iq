import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type {
  SimulationData,
  StrategyReasoning,
  ComparisonData,
  StrategyData,
} from "@/types/strategy";
import type { MonteCarloResponse } from "@/lib/api";
import { SessionIntelligence } from "./SessionIntelligence";

interface TelemetrySectionProps {
  simulation: SimulationData;
  reasoning: StrategyReasoning;
  comparison: ComparisonData;
  strategy?: StrategyData;
  monteCarlo?: MonteCarloResponse | null;
  fuelBurnRate?: number;
}

const tipStyle = {
  background: "#111118",
  border: "1px solid #1F1F2E",
  borderRadius: 0,
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 12,
  color: "#E5E7EB",
};

function ChartFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#1F1F2E] bg-[#0A0A0F] p-3">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        {title}
      </div>
      <div className="h-[150px]">{children}</div>
    </div>
  );
}

function safeMetric(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export function TelemetrySection({
  simulation,
  reasoning,
  comparison,
  strategy,
  monteCarlo,
}: TelemetrySectionProps) {
  // Real data mapping
  const pitWindowPoints = strategy?.pit_window.points ?? [];

  const riskEvolution = [
    { label: "Traffic", value: comparison.risk_breakdown.traffic_risk },
    { label: "Weather", value: comparison.risk_breakdown.weather_risk },
    { label: "Fuel", value: comparison.risk_breakdown.fuel_risk },
    { label: "Tyre Deg", value: comparison.risk_breakdown.tyre_deg_risk },
  ];

  const simulationDelta = [
    { label: "Stay Out Loss", value: safeMetric(simulation.stay_out_loss) },
    { label: "Pit Loss", value: safeMetric(simulation.pit_loss) },
    { label: "Undercut Gain", value: safeMetric(simulation.undercut_gain) },
  ];

  const mcTrends = monteCarlo
    ? [
        { name: "Win", prob: monteCarlo.win_probability },
        { name: "Podium", prob: monteCarlo.podium_probability },
        {
          name: "Avg Finish",
          prob: (1 - monteCarlo.average_finish / 20) * 100,
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <section className="border border-[#1F1F2E] bg-[#111118] p-5">
        <header className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
            Backend Telemetry Stream
          </span>
          <span className="border border-[#00D2FF]/20 bg-[#00D2FF]/5 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#00D2FF]">
            Live Simulation Data
          </span>
        </header>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ChartFrame title="Pit Window Analysis (ML Score)">
            <ResponsiveContainer>
              <AreaChart data={pitWindowPoints}>
                <CartesianGrid stroke="#1F1F2E" vertical={false} />
                <XAxis
                  dataKey="lap"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#00D2FF"
                  fill="rgba(0,210,255,0.1)"
                />
                {strategy && (
                  <ReferenceLine
                    x={strategy.pit_window.optimal_lap}
                    stroke="#10B981"
                    label={{
                      position: "top",
                      value: "OPT",
                      fill: "#10B981",
                      fontSize: 10,
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ChartFrame title="Risk Attribution Evolution">
            <ResponsiveContainer>
              <BarChart data={riskEvolution}>
                <CartesianGrid stroke="#1F1F2E" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Bar dataKey="value" fill="#EF4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ChartFrame title="Strategic Deltas (Seconds)">
            <ResponsiveContainer>
              <BarChart data={simulationDelta} layout="vertical">
                <CartesianGrid stroke="#1F1F2E" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  dataKey="label"
                  type="category"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                  width={80}
                />
                <Tooltip contentStyle={tipStyle} />
                <Bar dataKey="value" fill="#F59E0B" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>

          <ChartFrame title="Monte Carlo Probabilities">
            <ResponsiveContainer>
              <LineChart data={mcTrends}>
                <CartesianGrid stroke="#1F1F2E" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Line
                  type="monotone"
                  dataKey="prob"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#10B981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </div>
      </section>

      <SessionIntelligence
        simulation={simulation}
        reasoning={reasoning}
        comparison={comparison}
      />
    </div>
  );
}
