import { createFileRoute } from "@tanstack/react-router";
import { FloatingPanel, ConfidenceMeter, MetricCard } from "@/components/f1";
import { motion } from "framer-motion";
import { useStrategyQuery } from "@/hooks/useApiQueries";
import { useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] },
  },
};

export const Route = createFileRoute("/strategy-lab")({
  component: StrategyLabPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Strategy Lab" },
      {
        name: "description",
        content:
          "F1 race strategy simulation with tyre degradation modelling, undercut/overcast analysis, and AI-recommended pit windows.",
      },
    ],
  }),
});

const simPhases = [
  {
    label: "Data Ingest",
    desc: "Telemetry & track conditions loaded",
    status: "complete" as const,
  },
  {
    label: "Tyre Model",
    desc: "Degradation curve computed per compound",
    status: "complete" as const,
  },
  {
    label: "Traffic Analysis",
    desc: "Gap matrix & over/undercut simulated",
    status: "active" as const,
  },
  {
    label: "Optimisation",
    desc: "Monte Carlo window search running",
    status: "pending" as const,
  },
  {
    label: "Recommendation",
    desc: "Final strategy ranked by probability",
    status: "pending" as const,
  },
];

function StrategyLabPage() {
  const [view, setView] = useState<"strategy" | "tyre" | "history">("strategy");
  const strategyQuery = useStrategyQuery({
    compound: "Medium",
    tyre_age: 8,
    circuit: "Monza",
    gap_ahead: 1.2,
    gap_behind: 2.1,
    laps_remaining: 53,
  });
  const strategy = strategyQuery.data ?? null;

  const tyreData = [
    { label: "Soft (C5)", laps: 14, wear: 78, temp: 92, color: "bg-[#E10600]" },
    {
      label: "Medium (C3)",
      laps: 22,
      wear: 52,
      temp: 88,
      color: "bg-[#FFD400]",
    },
    { label: "Hard (C1)", laps: 33, wear: 31, temp: 83, color: "bg-[#A0A0A0]" },
    {
      label: "Intermediate",
      laps: 0,
      wear: 10,
      temp: 70,
      color: "bg-[#00C8FF]",
    },
    { label: "Wet", laps: 0, wear: 5, temp: 65, color: "bg-[#00FF85]" },
  ];

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="absolute inset-0 ambient-glow-right pointer-events-none" />
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
              Strategy Lab
            </h1>
            <p className="text-[10px] text-[#666] font-mono mt-1">
              AI-optimised race strategy engine
            </p>
          </div>
          <div className="flex gap-1 rounded-sm bg-[#141414] border border-[#262626] p-0.5">
            {(["strategy", "tyre", "history"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.08em] rounded-sm transition-all ${
                  view === v
                    ? "bg-[#E10600] text-white shadow-lg shadow-[#E10600]/25"
                    : "text-[#666] hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </motion.div>

        {view === "strategy" && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-12 gap-4"
          >
            <div className="col-span-8 space-y-4">
              <FloatingPanel title="Recommended Strategy">
                {strategy ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
                          {strategy.action}
                        </span>
                        <p className="text-[10px] text-[#666] font-mono mt-1 leading-relaxed">
                          {strategy.reasoning}
                        </p>
                      </div>
                      <ConfidenceMeter value={strategy.confidence} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-sm bg-[#141414]/60 border border-[#262626]">
                        <span className="text-[9px] text-[#666] font-mono block">
                          Optimal Pit Lap
                        </span>
                        <span className="text-sm font-bold font-mono tabular-nums text-white">
                          Lap {strategy.optimal_pit_lap}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-sm bg-[#141414]/60 border border-[#262626]">
                        <span className="text-[9px] text-[#666] font-mono block">
                          Pit Window Score
                        </span>
                        <span className="text-sm font-bold font-mono tabular-nums text-white">
                          {strategy.pit_window_score}/100
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-sm bg-[#141414]/60 border border-[#262626]">
                      <p className="text-[10px] text-[#A0A0A0] leading-relaxed">
                        {strategy.pit_window_analysis}
                      </p>
                    </div>
                    {strategy.engine_briefing && (
                      <div className="p-3 rounded-sm bg-[#E10600]/5 border border-[#E10600]/20">
                        <span className="text-[9px] text-[#E10600] font-mono tracking-[0.08em] uppercase">
                          Engine Briefing
                        </span>
                        <p className="text-[10px] text-[#A0A0A0] mt-1">
                          {strategy.engine_briefing}
                        </p>
                      </div>
                    )}
                    <div className="text-[9px] text-[#666] font-mono flex gap-4 pt-2 border-t border-[#262626]/40">
                      <span>
                        Fuel: {strategy.fuel_needed} kg (Δ
                        {strategy.fuel_delta > 0 ? "+" : ""}
                        {strategy.fuel_delta})
                      </span>
                      <span>Traffic: {strategy.traffic_status}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-[#666] font-mono text-center py-8">
                    {strategyQuery.isLoading
                      ? "Simulating strategies..."
                      : "No strategy data"}
                  </div>
                )}
              </FloatingPanel>
            </div>

            <div className="col-span-4 space-y-3">
              <FloatingPanel variant="compact" title="Simulation Pipeline">
                <div className="space-y-2">
                  {simPhases.map((phase) => (
                    <motion.div
                      key={phase.label}
                      variants={fadeUp}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          phase.status === "complete"
                            ? "bg-[#00FF85]"
                            : phase.status === "active"
                              ? "bg-[#00C8FF] animate-pulse"
                              : "bg-[#262626]"
                        }`}
                      />
                      <div className="flex-1">
                        <span className="text-[10px] text-white font-medium">
                          {phase.label}
                        </span>
                        <p className="text-[8px] text-[#666] font-mono">
                          {phase.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FloatingPanel>

              <FloatingPanel variant="compact" title="Key Metrics">
                <div className="space-y-2">
                  <MetricCard
                    label="Optimal Window"
                    value="Lap 18-24"
                    trend="up"
                    ariaLabel="Optimal pit window"
                  />
                  <MetricCard
                    label="Undercut Delta"
                    value="+1.4s"
                    trend="up"
                    ariaLabel="Undercut advantage"
                  />
                  <MetricCard
                    label="Traffic Factor"
                    value="Medium"
                    trend="neutral"
                    ariaLabel="Traffic risk factor"
                  />
                </div>
              </FloatingPanel>
            </div>
          </motion.div>
        )}

        {view === "tyre" && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-12 gap-4"
          >
            <div className="col-span-12">
              <FloatingPanel title="Tyre Degradation Model">
                <div className="grid grid-cols-5 gap-4">
                  {tyreData.map((tyre) => (
                    <motion.div
                      key={tyre.label}
                      variants={fadeUp}
                      whileHover={{ y: -2 }}
                      className="p-3 rounded-sm bg-[#141414]/60 border border-[#262626] hover:border-[#333] transition-all"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${tyre.color} mb-2`}
                      />
                      <p className="text-xs text-white font-medium mb-1">
                        {tyre.label}
                      </p>
                      <div className="space-y-1 text-[9px] font-mono text-[#666]">
                        <div className="flex justify-between">
                          <span>Laps</span>
                          <span className="text-white">{tyre.laps}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wear</span>
                          <span className="text-white">{tyre.wear}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temp</span>
                          <span className="text-white">{tyre.temp}°C</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[#262626]/40">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#666] font-mono">
                      Optimum Compound
                    </span>
                    <span className="text-xs font-mono text-[#FFD400] font-bold">
                      Medium (C3)
                    </span>
                  </div>
                </div>
              </FloatingPanel>
            </div>
          </motion.div>
        )}

        {view === "history" && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-12 gap-4"
          >
            <div className="col-span-12">
              <FloatingPanel title="Historical Strategy Performance">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Wins", value: 7, total: 12 },
                    { label: "Podiums", value: 10, total: 12 },
                    { label: "Best Finish", value: "1st", total: 0 },
                    { label: "Avg Start Pos", value: "4.2", total: 0 },
                  ].map((s) => (
                    <motion.div
                      key={s.label}
                      variants={fadeUp}
                      className="p-3 rounded-sm bg-[#141414]/60 border border-[#262626]"
                    >
                      <span className="text-[9px] text-[#666] font-mono block mb-1">
                        {s.label}
                      </span>
                      <span className="text-lg font-bold font-mono tabular-nums text-white">
                        {s.value}
                        {s.total > 0 && (
                          <span className="text-[9px] text-[#666] font-mono ml-1">
                            / {s.total}
                          </span>
                        )}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </FloatingPanel>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
