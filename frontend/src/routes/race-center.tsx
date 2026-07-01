import { createFileRoute } from "@tanstack/react-router";
import {
  MetricCard,
  SectorLight,
  RaceClock,
  ConfidenceMeter,
  FloatingPanel,
  StatusDot,
} from "@/components/f1";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  useStrategyComparisonMutation,
  useReplayIntelligenceQuery,
  useRaceOutcomeMutation,
  useMonteCarloMutation,
  useV3Query,
  useCircuitsQuery,
  useRaceOrderQuery,
} from "@/hooks/useApiQueries";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] },
  },
};

const swimLane = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
  },
};

export const Route = createFileRoute("/race-center")({
  component: RaceCenterPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Race Center" },
      {
        name: "description",
        content:
          "Real-time F1 race engineering dashboard with strategy recommendations, timing tower, telemetry gauges, and Monte Carlo simulation.",
      },
    ],
  }),
});

function AnimatedValue({
  value,
  suffix = "",
}: {
  value: number | string;
  suffix?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="font-mono tabular-nums"
    >
      {value}
      {suffix}
    </motion.span>
  );
}

interface PositionBarProps {
  position: number;
  label: string;
  value: string | number;
  color?: string;
}

function PositionBar({
  position,
  label,
  value,
  color = "#E10600",
}: PositionBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: position * 0.05 }}
      className="flex items-center gap-3 py-1.5 px-2 rounded-sm hover:bg-[#141414] transition-colors group cursor-pointer"
    >
      <span className="w-5 text-[10px] font-bold text-[#666] font-mono text-right">
        P{position}
      </span>
      <div
        className="w-0.5 h-6 rounded-full"
        style={{ backgroundColor: position <= 3 ? color : "#262626" }}
      />
      <span className="text-[11px] text-white font-medium flex-1">{label}</span>
      <span className="text-[10px] text-[#666] font-mono tabular-nums">
        {value}
      </span>
    </motion.div>
  );
}

function RaceCenterPage() {
  const { data: circuits, isLoading: circuitsLoading } = useCircuitsQuery();
  const raceOrderQuery = useRaceOrderQuery();
  const circuit = circuits?.[0];
  const totalLaps = circuit?.laps ?? 0;
  const currentLap = raceOrderQuery.data?.drivers?.[0]?.lap ?? 0;
  const [selectedView, setSelectedView] = useState<
    "telemetry" | "strategy" | "prediction"
  >("telemetry");
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const strategyComparison = useStrategyComparisonMutation();
  const outcomeQuery = useRaceOutcomeMutation();
  const monteCarloQuery = useMonteCarloMutation();
  const replayQuery = useReplayIntelligenceQuery(currentLap, totalLaps);
  const v3Query = useV3Query();

  useEffect(() => {
    if (!circuit) return;
    strategyComparison.mutate({
      compound: "MEDIUM",
      tyre_age: 12,
      circuit: circuit.name,
      gap_ahead: 1.2,
      gap_behind: 0.8,
      laps_remaining: totalLaps - currentLap,
      fuel_load: 85,
    });
    outcomeQuery.mutate({
      compound: "MEDIUM",
      tyre_age: 12,
      circuit: circuit.name,
      gap_ahead: 1.2,
      gap_behind: 0.8,
      laps_remaining: totalLaps - currentLap,
    });
    monteCarloQuery.mutate({
      compound: "MEDIUM",
      tyre_age: 12,
      circuit: circuit.name,
      gap_ahead: 1.2,
      gap_behind: 0.8,
      laps_remaining: totalLaps - currentLap,
    });
  }, [
    circuit?.name,
    circuit,
    totalLaps,
    currentLap,
    strategyComparison,
    outcomeQuery,
    monteCarloQuery,
  ]);

  const mcResult = monteCarloQuery.data;
  const outcomeResult = outcomeQuery.data;
  const compData = strategyComparison.data;

  const comparisonStrats =
    compData && typeof compData === "object" && !Array.isArray(compData)
      ? Object.entries(compData as Record<string, unknown>)
          .slice(0, 3)
          .map(([k, v]) => ({
            name: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            time:
              typeof v === "object" && v !== null
                ? ((v as Record<string, unknown>).time as string) || "—"
                : "—",
            risk: (typeof v === "object" && v !== null
              ? (v as Record<string, unknown>).risk
              : "low") as "low" | "medium" | "high",
            conf:
              typeof v === "object" && v !== null
                ? Number((v as Record<string, unknown>).confidence ?? 0)
                : 0,
            active: false,
          }))
      : [];

  const pitRisk = outcomeResult?.pit_risk ?? 0;
  const positionDistribution = mcResult?.position_distribution ?? [];

  if (circuitsLoading) {
    return (
      <div className="min-h-screen carbon-fiber flex items-center justify-center">
        <div className="text-[10px] text-[#666] font-mono">
          Loading circuits...
        </div>
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="min-h-screen carbon-fiber flex items-center justify-center">
        <div className="text-[10px] text-[#666] font-mono">
          No circuit data available
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="absolute inset-0 ambient-glow pointer-events-none" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-[1] p-5 space-y-4"
      >
        <motion.div
          variants={item}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
              Race Center
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-[#666] font-mono tracking-[0.08em]">
                {circuit.name.toUpperCase()} · GRAND PRIX
              </span>
              <div className="flex items-center gap-1.5">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-[#00FF85]"
                />
                <span className="text-[9px] text-[#00FF85] font-mono tracking-[0.1em]">
                  LIVE
                </span>
              </div>
              <span className="text-[10px] text-[#666] font-mono">
                {elapsed}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["telemetry", "strategy", "prediction"] as const).map((view) => (
              <motion.button
                key={view}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedView(view)}
                className={`text-[10px] px-3 py-1.5 rounded-sm font-medium uppercase tracking-[0.1em] transition-all duration-200 ${
                  selectedView === view
                    ? "bg-[#E10600] text-white shadow-lg shadow-[#E10600]/20"
                    : "bg-[#101010] text-[#666] border border-[#262626] hover:text-[#A0A0A0] hover:border-[#333]"
                }`}
              >
                {view}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none"
        >
          {[
            { label: "Track", value: "—", color: "orange" as const },
            { label: "Weather", value: "—", color: "yellow" as const },
            { label: "Wind", value: "—", color: "blue" as const },
            {
              label: "Fuel",
              value: outcomeResult
                ? `${Math.round(74 - currentLap * 0.4)} kg`
                : "—",
              color: "white" as const,
            },
            { label: "Tyre", value: "—", color: "yellow" as const },
            {
              label: "Lap",
              value: `${currentLap}/${totalLaps}`,
              color: "white" as const,
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="bg-[#141414]/80 border border-[#262626] rounded-sm px-3 py-2 min-w-[90px]"
            >
              <MetricCard
                label={metric.label}
                value={metric.value}
                color={metric.color}
                animate={false}
              />
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 space-y-4">
            <motion.div variants={swimLane}>
              <FloatingPanel
                title="AI Recommendation"
                variant="glow-red"
                className="relative overflow-hidden apex-border-red"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#E10600]/5 to-transparent pointer-events-none" />
                <div className="flex items-start justify-between relative">
                  <div className="space-y-3 flex-1">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-[#666] font-medium">
                        {strategyComparison.isPending
                          ? "Analyzing race conditions..."
                          : "Primary Strategy"}
                      </span>
                      <motion.h2
                        key={comparisonStrats[0]?.name ?? "loading"}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                        className="text-2xl font-bold text-white font-[family-name:var(--font-heading)] mt-0.5 tracking-tight"
                      >
                        {comparisonStrats[0]?.name ??
                          (strategyComparison.isPending ? "Computing..." : "—")}
                      </motion.h2>
                    </div>
                    <div className="flex items-center gap-5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[#666]">Projected Finish</span>
                        <span className="text-white font-mono tabular-nums">
                          {outcomeResult ? outcomeResult.projected_finish : "—"}
                        </span>
                      </div>
                      <div className="w-px h-3 bg-[#262626]" />
                      <div className="flex items-center gap-2">
                        <span className="text-[#666]">Overtake</span>
                        <span className="text-[#00C8FF] font-mono tabular-nums">
                          {outcomeResult
                            ? `${outcomeResult.overtake_probability.toFixed(0)}%`
                            : "—"}
                        </span>
                      </div>
                      <div className="w-px h-3 bg-[#262626]" />
                      <div className="flex items-center gap-2">
                        <span className="text-[#666]">Pit Risk</span>
                        <span
                          className={`font-mono tabular-nums ${pitRisk > 50 ? "text-[#E10600]" : "text-[#FFD400]"}`}
                        >
                          {outcomeResult ? `${pitRisk.toFixed(0)}%` : "—"}
                        </span>
                      </div>
                    </div>
                    {monteCarloQuery.isPending && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[11px] text-[#666] flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse-dot" />
                        Running Monte Carlo simulation...
                      </motion.p>
                    )}
                  </div>
                  <div className="w-28 shrink-0 ml-4">
                    <ConfidenceMeter
                      value={
                        comparisonStrats[0]?.conf
                          ? comparisonStrats[0].conf / 100
                          : 0
                      }
                      label="Confidence"
                      size="lg"
                    />
                  </div>
                </div>
              </FloatingPanel>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
              >
                {selectedView === "telemetry" && (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-3 gap-4"
                  >
                    <motion.div variants={item}>
                      <FloatingPanel variant="compact" title="Race Metrics">
                        <div className="space-y-3">
                          {mcResult ? (
                            <>
                              {[
                                {
                                  label: "Win Probability",
                                  value: `${mcResult.win_probability.toFixed(1)}%`,
                                  color: "#00FF85",
                                },
                                {
                                  label: "Podium Probability",
                                  value: `${mcResult.podium_probability.toFixed(1)}%`,
                                  color: "#00C8FF",
                                },
                                {
                                  label: "Average Finish",
                                  value: `P${mcResult.average_finish.toFixed(1)}`,
                                  color: "#FFF",
                                },
                                {
                                  label: "Simulations",
                                  value: mcResult.simulations.toLocaleString(),
                                  color: "#666",
                                },
                              ].map((m) => (
                                <div
                                  key={m.label}
                                  className="flex justify-between items-center py-1 border-b border-[#262626]/40 last:border-0"
                                >
                                  <span className="text-[10px] text-[#666] font-medium">
                                    {m.label}
                                  </span>
                                  <span
                                    className="text-xs font-bold font-mono tabular-nums"
                                    style={{ color: m.color }}
                                  >
                                    <AnimatedValue value={m.value} />
                                  </span>
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="text-[10px] text-[#666] py-6 text-center font-mono">
                              {monteCarloQuery.isPending
                                ? "Loading simulation data..."
                                : "Awaiting telemetry stream"}
                            </div>
                          )}
                        </div>
                      </FloatingPanel>
                    </motion.div>

                    <motion.div variants={item}>
                      <FloatingPanel
                        variant="compact"
                        title="Position Distribution"
                      >
                        <div className="space-y-0.5">
                          {positionDistribution.length > 0 ? (
                            positionDistribution
                              .slice(0, 10)
                              .reverse()
                              .map(
                                (p: {
                                  position: number;
                                  frequency: number;
                                }) => (
                                  <motion.div
                                    key={p.position}
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    transition={{
                                      delay: p.position * 0.02,
                                      duration: 0.4,
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="w-5 text-[9px] text-[#666] font-mono text-right">
                                      P{p.position}
                                    </span>
                                    <div className="flex-1 h-2 bg-[#1A1A1A] rounded-sm overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                          width: `${(p.frequency / Math.max(...positionDistribution.map((x: { frequency: number }) => x.frequency))) * 100}%`,
                                        }}
                                        transition={{
                                          delay: p.position * 0.03,
                                          duration: 0.6,
                                          ease: "easeOut",
                                        }}
                                        className={`h-full rounded-sm ${p.position <= 3 ? "bg-[#00FF85]" : p.position <= 6 ? "bg-[#00C8FF]" : "bg-[#262626]"}`}
                                      />
                                    </div>
                                    <span className="w-8 text-[9px] text-[#666] font-mono text-right">
                                      {p.frequency}
                                    </span>
                                  </motion.div>
                                ),
                              )
                          ) : (
                            <div className="text-[10px] text-[#666] py-6 text-center font-mono">
                              {monteCarloQuery.isPending
                                ? "Simulating..."
                                : "No distribution data"}
                            </div>
                          )}
                        </div>
                      </FloatingPanel>
                    </motion.div>

                    <motion.div variants={item}>
                      <FloatingPanel variant="compact" title="Race Outcome">
                        <div className="space-y-3">
                          {outcomeResult ? (
                            <>
                              {[
                                {
                                  label: "Projected Finish",
                                  value: outcomeResult.projected_finish,
                                  color: "#FFF",
                                },
                                {
                                  label: "Overtake Probability",
                                  value: `${outcomeResult.overtake_probability.toFixed(0)}%`,
                                  color: "#00C8FF",
                                },
                                {
                                  label: "Podium Probability",
                                  value: `${outcomeResult.podium_probability.toFixed(1)}%`,
                                  color: "#00FF85",
                                },
                                {
                                  label: "Championship Points",
                                  value: outcomeResult.championship_points,
                                  color: "#FFD400",
                                },
                              ].map((m) => (
                                <div
                                  key={m.label}
                                  className="flex justify-between items-center py-1 border-b border-[#262626]/40 last:border-0"
                                >
                                  <span className="text-[10px] text-[#666] font-medium">
                                    {m.label}
                                  </span>
                                  <span
                                    className="text-xs font-bold font-mono tabular-nums"
                                    style={{ color: m.color }}
                                  >
                                    <AnimatedValue value={m.value} />
                                  </span>
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="text-[10px] text-[#666] py-6 text-center font-mono">
                              {outcomeQuery.isPending
                                ? "Predicting outcome..."
                                : "No prediction available"}
                            </div>
                          )}
                        </div>
                      </FloatingPanel>
                    </motion.div>
                  </motion.div>
                )}

                {selectedView === "strategy" && (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="bg-[#141414] border border-[#262626] rounded-md p-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00C8FF]" />
                      <span className="text-[11px] uppercase tracking-[0.12em] text-[#666] font-medium">
                        Strategy Comparison
                      </span>
                      {strategyComparison.isPending && (
                        <span className="text-[9px] text-[#666] font-mono ml-auto">
                          computing...
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {comparisonStrats.length > 0 ? (
                        comparisonStrats.map((s, i) => (
                          <motion.div
                            key={i}
                            variants={item}
                            whileHover={{ x: 3 }}
                            className={`flex items-center justify-between p-3 rounded-sm transition-all duration-200 ${
                              i === 0
                                ? "bg-[#E10600]/5 border border-[#E10600]/20"
                                : "bg-[#101010] border border-[#262626]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 3,
                                }}
                                className={`w-2 h-2 rounded-full ${i === 0 ? "bg-[#E10600]" : "bg-[#666]"}`}
                              />
                              <div>
                                <span
                                  className={`text-xs font-medium ${i === 0 ? "text-white" : "text-[#A0A0A0]"}`}
                                >
                                  {s.name}
                                </span>
                                <span className="text-[10px] text-[#666] ml-2 font-mono">
                                  {s.time}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${
                                  s.risk === "low"
                                    ? "bg-[#00FF85]/10 text-[#00FF85]"
                                    : s.risk === "medium"
                                      ? "bg-[#FFD400]/10 text-[#FFD400]"
                                      : "bg-[#E10600]/10 text-[#E10600]"
                                }`}
                              >
                                {s.risk.toUpperCase()}
                              </span>
                              <span className="w-12 text-right text-xs font-bold text-[#00C8FF] font-mono tabular-nums">
                                {s.conf}%
                              </span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-[10px] text-[#666] text-center py-6 font-mono">
                          {strategyComparison.isPending
                            ? "Computing strategy comparison..."
                            : "No strategy data available"}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {selectedView === "prediction" && (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    <FloatingPanel title="Race Prediction">
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          {
                            label: "Win Probability",
                            value: mcResult
                              ? mcResult.win_probability.toFixed(1)
                              : "—",
                            unit: "%",
                            color: "text-[#00FF85]",
                          },
                          {
                            label: "Podium",
                            value: mcResult
                              ? mcResult.podium_probability.toFixed(1)
                              : "—",
                            unit: "%",
                            color: "text-[#00C8FF]",
                          },
                          {
                            label: "Expected Finish",
                            value: mcResult
                              ? `P${Math.round(mcResult.average_finish)}`
                              : "—",
                            color: "text-white",
                          },
                          {
                            label: "Pit Risk",
                            value: outcomeResult
                              ? outcomeResult.pit_risk.toFixed(0)
                              : "—",
                            unit: "%",
                            color:
                              pitRisk > 50
                                ? "text-[#E10600]"
                                : "text-[#FFD400]",
                          },
                        ].map((p) => (
                          <motion.div
                            key={p.label}
                            variants={item}
                            className="text-center p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                          >
                            <span className="text-[9px] text-[#666] block mb-1.5 uppercase tracking-[0.08em] font-medium">
                              {p.label}
                            </span>
                            <span
                              className={`text-xl font-bold font-mono tabular-nums ${p.color}`}
                            >
                              <AnimatedValue
                                value={p.value}
                                suffix={p.unit ?? ""}
                              />
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </FloatingPanel>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="col-span-4 space-y-4">
            <motion.div variants={swimLane}>
              <FloatingPanel variant="compact" title="Race Progress">
                <RaceClock
                  currentLap={currentLap}
                  totalLaps={totalLaps}
                  elapsed={elapsed}
                  sector={
                    replayQuery.data ? `Sector ${replayQuery.data.lap}` : "—"
                  }
                />
              </FloatingPanel>
            </motion.div>

            <motion.div variants={swimLane}>
              <FloatingPanel variant="compact" title="Live Timing">
                <div className="space-y-px">
                  {raceOrderQuery.data?.drivers ? (
                    raceOrderQuery.data.drivers.map((driver) => (
                      <PositionBar
                        key={driver.position}
                        position={driver.position}
                        label={driver.name}
                        value={driver.gap}
                        color="#E10600"
                      />
                    ))
                  ) : (
                    <div className="text-[10px] text-[#666] py-6 text-center font-mono">
                      {raceOrderQuery.isLoading
                        ? "Loading race order..."
                        : "No race order data"}
                    </div>
                  )}
                </div>
              </FloatingPanel>
            </motion.div>

            <motion.div variants={swimLane}>
              <FloatingPanel variant="compact" title="Sector Performance">
                <div className="space-y-2">
                  {replayQuery.data ? (
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="space-y-2"
                    >
                      <motion.div
                        variants={item}
                        className="flex items-center justify-between"
                      >
                        <SectorLight
                          sector={1}
                          color={
                            replayQuery.data.undercut_probability > 70
                              ? "purple"
                              : "white"
                          }
                        />
                        <span
                          className="text-[10px] font-mono"
                          style={{
                            color:
                              replayQuery.data.undercut_probability > 70
                                ? "#A855F7"
                                : "#666",
                          }}
                        >
                          {replayQuery.data.recommendation}
                        </span>
                      </motion.div>
                      <motion.div
                        variants={item}
                        className="flex justify-between text-[10px] pt-2 border-t border-[#262626]/40"
                      >
                        <span className="text-[#666]">Traffic</span>
                        <span
                          className={`font-mono ${replayQuery.data.traffic_risk === "low" ? "text-[#00FF85]" : "text-[#E10600]"}`}
                        >
                          {replayQuery.data.traffic_risk.toUpperCase()}
                        </span>
                      </motion.div>
                      <motion.div
                        variants={item}
                        className="flex justify-between text-[10px]"
                      >
                        <span className="text-[#666]">Undercut Prob</span>
                        <span className="text-[#A855F7] font-mono">
                          {replayQuery.data.undercut_probability}%
                        </span>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="text-[10px] text-[#666] text-center py-4 font-mono">
                      {replayQuery.isLoading
                        ? "Loading sector data..."
                        : "No sector data available"}
                    </div>
                  )}
                </div>
              </FloatingPanel>
            </motion.div>

            <motion.div variants={swimLane}>
              <FloatingPanel variant="compact" title="Live AI Engineer">
                <div className="flex items-start gap-2">
                  <StatusDot color="blue" size="md" className="mt-0.5" />
                  <p className="text-xs text-[#A0A0A0] leading-relaxed">
                    {v3Query.data?.explanation
                      ? ((v3Query.data.explanation as Record<string, string>)
                          .summary ?? "Analyzing race conditions...")
                      : "Ready for analysis. Configure race parameters."}
                  </p>
                </div>
                {mcResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-[#262626]/50 space-y-1.5"
                  >
                    <span className="text-[9px] uppercase tracking-[0.12em] text-[#666] font-medium">
                      Simulation Summary
                    </span>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#666]">Best Case</span>
                      <span className="text-[#00FF85] font-mono tabular-nums">
                        P{mcResult.best_case}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#666]">Worst Case</span>
                      <span className="text-[#E10600] font-mono tabular-nums">
                        P{mcResult.worst_case}
                      </span>
                    </div>
                  </motion.div>
                )}
              </FloatingPanel>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
