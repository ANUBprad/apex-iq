import { createFileRoute } from "@tanstack/react-router";
import {
  FloatingPanel,
  MetricCard,
  ConfidenceMeter,
  StatusDot,
  TelemetryGauge,
} from "@/components/f1";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  useDriverProfileQuery,
  useTeamProfileQuery,
  useHistoricalQuery,
  useHistoricalComparisonQuery,
  usePitAccuracyQuery,
  useMonteCarloMutation,
  useRaceOutcomeMutation,
  useCircuitsQuery,
} from "@/hooks/useApiQueries";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] },
  },
};

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Analytics" },
      {
        name: "description",
        content:
          "F1 race analytics dashboard with driver performance, team DNA analysis, historical comparisons, and pit accuracy metrics.",
      },
      { property: "og:title", content: "APEXiq · Analytics" },
      {
        property: "og:description",
        content:
          "F1 race analytics dashboard with driver performance, team DNA analysis, historical comparisons, and pit accuracy metrics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "APEXiq · Analytics" },
      {
        name: "twitter:description",
        content:
          "F1 race analytics dashboard with driver performance, team DNA analysis, historical comparisons, and pit accuracy metrics.",
      },
    ],
  }),
});

const DRIVER = "Max Verstappen";
const TEAM = "Red Bull";

function AnalyticsPage() {
  const { data: circuits } = useCircuitsQuery();
  const defaultCircuit = circuits?.[0]?.name ?? "Monaco";
  const [selectedCirc, setSelectedCirc] = useState(defaultCircuit);

  const driverQuery = useDriverProfileQuery(DRIVER);
  const teamQuery = useTeamProfileQuery(TEAM);
  const histQuery = useHistoricalQuery(selectedCirc);
  const comparisonQuery = useHistoricalComparisonQuery(
    selectedCirc,
    "soft-medium",
  );
  const pitAccuracyQuery = usePitAccuracyQuery(selectedCirc, 18);
  const mcMutation = useMonteCarloMutation();
  const outcomeMutation = useRaceOutcomeMutation();

  useEffect(() => {
    mcMutation.mutate({
      compound: "soft",
      tyre_age: 12,
      circuit: selectedCirc,
      gap_ahead: 1.5,
      gap_behind: 0.8,
      laps_remaining: 60,
    });
    outcomeMutation.mutate({
      compound: "soft",
      tyre_age: 12,
      circuit: selectedCirc,
      gap_ahead: 1.5,
      gap_behind: 0.8,
      laps_remaining: 60,
    });
  }, [selectedCirc, mcMutation, outcomeMutation]);

  const driver = driverQuery.data;
  const team = teamQuery.data;
  const hist = histQuery.data ?? [];
  const pitAcc = pitAccuracyQuery.data;
  const outcome = outcomeMutation.data;
  const comparison = comparisonQuery.data;

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="absolute inset-0 ambient-glow-left pointer-events-none" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-[1] p-5 space-y-4"
      >
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
              Analytics
            </h1>
            <p className="text-[10px] text-[#666] mt-0.5">
              Driver & Team Performance Analysis ·{" "}
              <span className="text-[#A0A0A0] font-mono tabular-nums">
                {driver?.name ?? "—"}
              </span>
              {" / "}
              <span className="text-[#A0A0A0] font-mono tabular-nums">
                {team?.name ?? "—"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#00FF85]"
              />
              <span className="text-[9px] text-[#00FF85] font-mono tracking-[0.1em]">
                DATA STREAM
              </span>
            </div>
            <div className="flex gap-1">
              {(circuits ?? []).slice(0, 6).map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCirc(c.name)}
                  className={`text-[9px] px-2 py-1 rounded-sm font-mono ${
                    selectedCirc === c.name
                      ? "bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/30"
                      : "bg-[#101010] text-[#666] border border-[#262626] hover:text-[#A0A0A0]"
                  }`}
                >
                  {c.name.slice(0, 4).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7 space-y-4">
            <motion.div variants={fadeUp} whileHover={{ y: -2 }}>
              <FloatingPanel title="Driver Profile">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <MetricCard
                    label="Name"
                    value={driver?.name ?? "—"}
                    color="white"
                  />
                  <MetricCard label="Nationality" value="—" color="white" />
                  <MetricCard
                    label="Team"
                    value={driver?.team ?? "—"}
                    color="white"
                  />
                  <MetricCard label="Date of Birth" value="—" color="white" />
                  <MetricCard label="Career Wins" value="—" color="green" />
                  <MetricCard label="Career Poles" value="—" color="blue" />
                  <MetricCard label="Championships" value="—" color="yellow" />
                  <MetricCard
                    label="Current Standing"
                    value="—"
                    color="white"
                  />
                </div>
                <div className="mt-4 pt-3 border-t border-[#262626]/50 space-y-2">
                  <TelemetryGauge
                    label="Tyre Management"
                    value={driver?.tyre_management ?? 0}
                    max={100}
                    color="green"
                    size="md"
                  />
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <TelemetryGauge
                      label="Aggression"
                      value={driver?.aggression ?? 0}
                      max={100}
                      color="red"
                    />
                    <TelemetryGauge
                      label="Overtaking"
                      value={driver?.overtaking ?? 0}
                      max={100}
                      color="blue"
                    />
                    <TelemetryGauge
                      label="Wet Weather"
                      value={driver?.wet_weather ?? 0}
                      max={100}
                      color="purple"
                    />
                  </div>
                </div>
              </FloatingPanel>
            </motion.div>

            <motion.div variants={fadeUp}>
              <FloatingPanel title="Performance Metrics">
                <div className="grid grid-cols-4 gap-4">
                  <MetricCard
                    label="Aggression"
                    value={driver?.aggression ?? "—"}
                    unit="%"
                    color="red"
                  />
                  <MetricCard
                    label="Tyre Mgmt"
                    value={driver?.tyre_management ?? "—"}
                    unit="%"
                    color="green"
                  />
                  <MetricCard
                    label="Overtaking"
                    value={driver?.overtaking ?? "—"}
                    unit="%"
                    color="blue"
                  />
                  <MetricCard
                    label="Wet Weather"
                    value={driver?.wet_weather ?? "—"}
                    unit="%"
                    color="purple"
                  />
                </div>
              </FloatingPanel>
            </motion.div>
          </div>

          <div className="col-span-5 space-y-4">
            <motion.div variants={fadeUp} whileHover={{ y: -2 }}>
              <FloatingPanel title="Team Profile">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <MetricCard
                      label="Name"
                      value={team?.name ?? "—"}
                      color="white"
                    />
                    <MetricCard label="Base" value="—" color="white" />
                    <MetricCard label="Team Chief" value="—" color="white" />
                    <MetricCard
                      label="Technical Chief"
                      value="—"
                      color="white"
                    />
                    <MetricCard label="Chassis" value="—" color="white" />
                    <MetricCard label="Power Unit" value="—" color="white" />
                    <MetricCard label="Driver 1" value="—" color="white" />
                    <MetricCard label="Driver 2" value="—" color="white" />
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-[#262626]/50 mt-2">
                    <MetricCard label="Standing" value="—" color="white" />
                    <MetricCard label="Points" value="—" color="green" />
                    <MetricCard label="Wins" value="—" color="yellow" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#262626]/50 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#666] font-medium">
                      Team DNA Confidence
                    </span>
                    <StatusDot color="green" size="sm" />
                  </div>
                  <ConfidenceMeter
                    value={
                      team
                        ? (team.aggression +
                            team.undercut_bias +
                            team.risk_tolerance +
                            team.tyre_focus +
                            team.weather_adaptability) /
                          500
                        : 0
                    }
                    size="md"
                  />
                </div>
              </FloatingPanel>
            </motion.div>

            <motion.div variants={fadeUp}>
              <FloatingPanel title="Team DNA">
                <div className="space-y-2">
                  <TelemetryGauge
                    label="Aggression"
                    value={team?.aggression ?? 0}
                    max={100}
                    color="red"
                  />
                  <TelemetryGauge
                    label="Undercut Bias"
                    value={team?.undercut_bias ?? 0}
                    max={100}
                    color="blue"
                  />
                  <TelemetryGauge
                    label="Risk Tolerance"
                    value={team?.risk_tolerance ?? 0}
                    max={100}
                    color="yellow"
                  />
                  <TelemetryGauge
                    label="Tyre Focus"
                    value={team?.tyre_focus ?? 0}
                    max={100}
                    color="green"
                  />
                  <TelemetryGauge
                    label="Weather Adapt"
                    value={team?.weather_adaptability ?? 0}
                    max={100}
                    color="purple"
                  />
                </div>
              </FloatingPanel>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <motion.div variants={fadeUp}>
              <FloatingPanel title="Pit Stop Analysis">
                <div className="space-y-2">
                  <MetricCard
                    label="Avg Pit Time"
                    value={
                      pitAcc
                        ? `${pitAcc.historical_average?.toFixed(1) ?? "—"}s`
                        : "—"
                    }
                    color="white"
                  />
                  <MetricCard
                    label="Predicted Lap"
                    value={pitAcc ? `L${pitAcc.predicted_lap}` : "—"}
                    color="blue"
                  />
                  <MetricCard
                    label="Accuracy"
                    value={pitAcc ? `${pitAcc.accuracy.toFixed(0)}%` : "—"}
                    color="green"
                  />
                  <MetricCard
                    label="Pit Risk"
                    value={outcome ? `${outcome.pit_risk.toFixed(0)}%` : "—"}
                    color={outcome && outcome.pit_risk > 50 ? "red" : "yellow"}
                  />
                </div>
              </FloatingPanel>
            </motion.div>
          </div>
          <div className="col-span-8">
            <motion.div variants={fadeUp}>
              <FloatingPanel
                title="Historical Comparison"
                titleRight={
                  comparison ? (
                    <span className="text-[9px] text-[#666] font-mono">
                      {comparison.circuit}
                    </span>
                  ) : undefined
                }
              >
                {comparison ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <MetricCard
                      label="Circuit"
                      value={comparison.circuit}
                      color="white"
                    />
                    <MetricCard
                      label="Strategy"
                      value={comparison.strategy}
                      color="white"
                    />
                    <MetricCard
                      label="Historical Wins"
                      value={`${comparison.historical_wins}/${comparison.historical_races}`}
                      color="green"
                    />
                    <MetricCard
                      label="Success Rate"
                      value={`${(comparison.success_rate * 100).toFixed(0)}%`}
                      color="blue"
                    />
                    <MetricCard
                      label="Similarity"
                      value={`${comparison.similarity}%`}
                      color="white"
                    />
                    <MetricCard
                      label="Avg Finish"
                      value={
                        comparison.average_finish
                          ? `P${comparison.average_finish.toFixed(1)}`
                          : "—"
                      }
                      color="yellow"
                    />
                    <p className="text-[10px] text-[#666] col-span-2 pt-1 border-t border-[#262626]/40 mt-1">
                      {comparison.recommendation}
                    </p>
                  </div>
                ) : hist.length > 0 ? (
                  <div className="space-y-1">
                    {hist.slice(0, 5).map((race, i) => (
                      <motion.div
                        key={i}
                        variants={fadeUp}
                        className="flex justify-between py-1 border-b border-[#262626]/40 last:border-0"
                      >
                        <span className="text-[10px] text-[#A0A0A0]">
                          {race.race_name ?? race.circuit}
                        </span>
                        <span className="text-[10px] text-white font-mono tabular-nums">
                          {race.season}
                        </span>
                        <span
                          className={`text-[10px] font-mono tabular-nums ${
                            race.winner ? "text-[#00FF85]" : "text-[#666]"
                          }`}
                        >
                          {race.winner ?? "—"}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-[10px] text-[#666]">
                    No historical data available
                  </div>
                )}
              </FloatingPanel>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
