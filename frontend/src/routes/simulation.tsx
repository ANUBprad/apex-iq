import { createFileRoute } from "@tanstack/react-router";
import {
  FloatingPanel,
  MetricCard,
  ConfidenceMeter,
  TelemetryGauge,
} from "@/components/f1";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  useSimulationQueryEnabled,
  useMonteCarloMutation,
  useRaceOutcomeMutation,
} from "@/hooks/useApiQueries";
import type { SimulationResponse, StrategyInput } from "@/lib/api";

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

export const Route = createFileRoute("/simulation")({
  component: SimulationPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Simulation Engine" },
      {
        name: "description",
        content:
          "F1 race simulation engine. Monte Carlo analysis, pit strategy optimisation, and race outcome prediction powered by AI.",
      },
      { property: "og:title", content: "APEXiq · Simulation Engine" },
      {
        property: "og:description",
        content:
          "F1 race simulation engine. Monte Carlo analysis, pit strategy optimisation, and race outcome prediction powered by AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "APEXiq · Simulation Engine" },
      {
        name: "twitter:description",
        content:
          "F1 race simulation engine. Monte Carlo analysis, pit strategy optimisation, and race outcome prediction powered by AI.",
      },
    ],
  }),
});

const params = {
  compound: "Medium" as const,
  tyre_age: 8,
  circuit: "Monza",
  gap_ahead: 1.2,
  gap_behind: 2.1,
  laps_remaining: 53,
};

function SimulationPage() {
  const [activeTab, setActiveTab] = useState<
    "simulation" | "monte-carlo" | "outcome"
  >("simulation");
  const [simParams, setSimParams] = useState<StrategyInput | null>(null);

  const simulation = useSimulationQueryEnabled(
    simParams ?? {
      compound: "Medium",
      tyre_age: 8,
      circuit: "Monza",
      gap_ahead: 1.2,
      gap_behind: 2.1,
      laps_remaining: 53,
    },
    !!simParams,
  );
  const monteCarlo = useMonteCarloMutation();
  const outcome = useRaceOutcomeMutation();

  const simData = simulation.data as SimulationResponse | undefined;
  const mcData = monteCarlo.data;
  const outcomeData = outcome.data;
  const isPending =
    simulation.isFetching || monteCarlo.isPending || outcome.isPending;

  const runAll = () => {
    const input: StrategyInput = {
      compound: "Medium",
      tyre_age: 8,
      circuit: "Monza",
      gap_ahead: 1.2,
      gap_behind: 2.1,
      laps_remaining: 53,
    };
    setSimParams(input);
    monteCarlo.mutateAsync({ ...params });
    outcome.mutateAsync({ ...params });
  };

  const tabs = [
    { id: "simulation" as const, label: "Pit Simulation" },
    { id: "monte-carlo" as const, label: "Monte Carlo" },
    { id: "outcome" as const, label: "Race Outcome" },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-[1] p-5 space-y-4"
      >
        {/* Hero — Scenario Explorer */}
        <motion.div
          variants={fadeUp}
          className="mb-3 rounded-sm border border-[#A855F7]/20 bg-gradient-to-r from-[#A855F7]/5 via-transparent to-[#A855F7]/5 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-[2px] h-8 rounded-full bg-[#A855F7]" />
                <div>
                  <h1 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
                    Simulation
                  </h1>
                  <p className="text-[10px] text-[#555] mt-0.5">
                    Pit strategy · Monte Carlo · Race outcome prediction
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={runAll}
              disabled={isPending}
              className="h-8 px-4 bg-[#A855F7] text-white text-[10px] font-mono font-medium rounded-sm hover:bg-[#A855F7]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>RUNNING...</span>
                </>
              ) : (
                <>
                  <span>▶</span>
                  <span>RUN ALL</span>
                </>
              )}
            </motion.button>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {["Weather", "Safety Car", "Virtual Safety Car", "Red Flag"].map(
              (scenario) => (
                <div
                  key={scenario}
                  className="rounded-sm bg-[#141414] border border-[#262626] p-2 text-center"
                >
                  <span className="text-[10px] text-[#A855F7] font-mono tracking-wide uppercase">
                    {scenario}
                  </span>
                </div>
              ),
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`text-[10px] px-3 py-1.5 rounded-sm font-medium uppercase tracking-[0.1em] transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#E10600] text-white shadow-lg shadow-[#E10600]/20"
                  : "bg-[#111] text-[#666] border border-[#222] hover:text-[#A0A0A0] hover:border-[#444]"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        <motion.div variants={container} className="grid grid-cols-12 gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
              className="col-span-12 space-y-4"
            >
              {activeTab === "simulation" && (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-12 gap-4"
                >
                  <motion.div
                    variants={fadeUp}
                    className="col-span-12 md:col-span-8"
                  >
                    <FloatingPanel
                      title="Pit Strategy Simulation"
                      variant="glow-red"
                    >
                      {simData ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <motion.div
                            whileHover={{ y: -2 }}
                            className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                          >
                            <MetricCard
                              label="Stay Out Loss"
                              value={`${simData.stay_out_loss.toFixed(2)}s`}
                              color="red"
                            />
                          </motion.div>
                          <motion.div
                            whileHover={{ y: -2 }}
                            className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                          >
                            <MetricCard
                              label="Pit Loss"
                              value={`${simData.pit_loss.toFixed(2)}s`}
                              color="yellow"
                            />
                          </motion.div>
                          <motion.div
                            whileHover={{ y: -2 }}
                            className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                          >
                            <MetricCard
                              label="Undercut Gain"
                              value={`${simData.undercut_gain.toFixed(2)}s`}
                              color="green"
                            />
                          </motion.div>
                          <motion.div
                            whileHover={{ y: -2 }}
                            className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                          >
                            <MetricCard
                              label="Undercut Possible"
                              value={simData.undercut_possible ? "YES" : "NO"}
                              color={
                                simData.undercut_possible ? "green" : "red"
                              }
                            />
                          </motion.div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#666] py-8 text-center font-mono">
                          {simulation.isFetching
                            ? "Computing pit simulation..."
                            : 'Press "Run All" to simulate'}
                        </div>
                      )}
                      {simulation.isError && (
                        <div className="mt-3 text-[10px] text-[#E10600] font-mono p-2 rounded-sm bg-[#E10600]/5 border border-[#E10600]/20">
                          {simulation.error.message}
                        </div>
                      )}
                    </FloatingPanel>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    className="col-span-12 md:col-span-4"
                  >
                    <FloatingPanel title="Parameters" variant="compact">
                      <div className="space-y-2">
                        <TelemetryGauge
                          label="Compound"
                          value={3}
                          max={5}
                          unit=" · Medium"
                          color="yellow"
                        />
                        <TelemetryGauge
                          label="Tyre Age"
                          value={8}
                          max={30}
                          unit=" laps"
                          color="blue"
                        />
                        <TelemetryGauge
                          label="Gap Ahead"
                          value={1.2}
                          max={5}
                          unit="s"
                          color="green"
                        />
                        <TelemetryGauge
                          label="Gap Behind"
                          value={2.1}
                          max={5}
                          unit="s"
                          color="red"
                        />
                        <TelemetryGauge
                          label="Laps Remaining"
                          value={53}
                          max={78}
                          unit=" laps"
                          color="white"
                        />
                      </div>
                    </FloatingPanel>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "monte-carlo" && (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-12 gap-4"
                >
                  <motion.div
                    variants={fadeUp}
                    className="col-span-12 md:col-span-8"
                  >
                    <FloatingPanel
                      title="Monte Carlo Simulation"
                      variant="glow-blue"
                    >
                      {mcData ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <motion.div
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                            >
                              <MetricCard
                                label="Expected Position"
                                value={`P${Math.round(mcData.average_finish)}`}
                                color="white"
                              />
                            </motion.div>
                            <motion.div
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                            >
                              <MetricCard
                                label="Win Probability"
                                value={`${mcData.win_probability.toFixed(1)}%`}
                                color="green"
                              />
                            </motion.div>
                            <motion.div
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                            >
                              <MetricCard
                                label="Podium Probability"
                                value={`${mcData.podium_probability.toFixed(1)}%`}
                                color="blue"
                              />
                            </motion.div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <motion.div
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                            >
                              <span className="text-[9px] uppercase tracking-[0.12em] text-[#666] font-medium">
                                Best Case
                              </span>
                              <span className="block mt-1 text-lg font-bold text-[#00FF85] font-mono tabular-nums">
                                P{mcData.best_case}
                              </span>
                            </motion.div>
                            <motion.div
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                            >
                              <span className="text-[9px] uppercase tracking-[0.12em] text-[#666] font-medium">
                                Worst Case
                              </span>
                              <span className="block mt-1 text-lg font-bold text-[#E10600] font-mono tabular-nums">
                                P{mcData.worst_case}
                              </span>
                            </motion.div>
                          </div>
                          <div className="text-[10px] text-[#666] font-mono text-center">
                            {mcData.simulations.toLocaleString()} simulations
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#666] py-8 text-center font-mono">
                          {monteCarlo.isPending
                            ? "Running Monte Carlo..."
                            : 'Press "Run All" to simulate'}
                        </div>
                      )}
                      {monteCarlo.isError && (
                        <div className="mt-3 text-[10px] text-[#E10600] font-mono p-2 rounded-sm bg-[#E10600]/5 border border-[#E10600]/20">
                          {monteCarlo.error.message}
                        </div>
                      )}
                    </FloatingPanel>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    className="col-span-12 md:col-span-4"
                  >
                    <FloatingPanel title="Position Distribution">
                      {mcData?.position_distribution &&
                      mcData.position_distribution.length > 0 ? (
                        <div className="space-y-1">
                          {mcData.position_distribution
                            .slice(0, 10)
                            .reverse()
                            .map((p) => (
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
                                      width: `${
                                        (p.frequency /
                                          Math.max(
                                            ...mcData.position_distribution.map(
                                              (x) => x.frequency,
                                            ),
                                          )) *
                                        100
                                      }%`,
                                    }}
                                    transition={{
                                      delay: p.position * 0.03,
                                      duration: 0.6,
                                      ease: "easeOut",
                                    }}
                                    className={`h-full rounded-sm ${
                                      p.position <= 3
                                        ? "bg-[#00FF85]"
                                        : p.position <= 6
                                          ? "bg-[#00C8FF]"
                                          : "bg-[#262626]"
                                    }`}
                                  />
                                </div>
                                <span className="w-8 text-[9px] text-[#666] font-mono text-right">
                                  {p.frequency}
                                </span>
                              </motion.div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#666] py-6 text-center font-mono">
                          {monteCarlo.isPending
                            ? "Simulating..."
                            : "No distribution data"}
                        </div>
                      )}
                    </FloatingPanel>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "outcome" && (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-12 gap-4"
                >
                  <motion.div
                    variants={fadeUp}
                    className="col-span-12 md:col-span-8"
                  >
                    <FloatingPanel
                      title="Race Outcome Prediction"
                      variant="glow-red"
                    >
                      {outcomeData ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <motion.div
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                            >
                              <MetricCard
                                label="Projected Finish"
                                value={outcomeData.projected_finish}
                                color="white"
                              />
                            </motion.div>
                            <motion.div
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                            >
                              <MetricCard
                                label="Points"
                                value={outcomeData.championship_points}
                                color="green"
                              />
                            </motion.div>
                            <motion.div
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                            >
                              <MetricCard
                                label="Overtake %"
                                value={`${outcomeData.overtake_probability.toFixed(0)}%`}
                                color="blue"
                              />
                            </motion.div>
                            <motion.div
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors"
                            >
                              <MetricCard
                                label="Podium %"
                                value={`${outcomeData.podium_probability.toFixed(1)}%`}
                                color="purple"
                              />
                            </motion.div>
                          </div>
                          <div className="flex items-center gap-4 pt-2 border-t border-[#262626]/50">
                            <span className="text-[9px] uppercase tracking-[0.12em] text-[#666] font-medium">
                              Pit Risk
                            </span>
                            <div className="flex-1">
                              <ConfidenceMeter
                                value={outcomeData.pit_risk / 100}
                                size="sm"
                                showValue
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#666] py-8 text-center font-mono">
                          {outcome.isPending
                            ? "Predicting outcome..."
                            : 'Press "Run All" to predict'}
                        </div>
                      )}
                      {outcome.isError && (
                        <div className="mt-3 text-[10px] text-[#E10600] font-mono p-2 rounded-sm bg-[#E10600]/5 border border-[#E10600]/20">
                          {outcome.error.message}
                        </div>
                      )}
                    </FloatingPanel>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    className="col-span-12 md:col-span-4"
                  >
                    <FloatingPanel title="Circuit Context" variant="compact">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#666]">Circuit</span>
                          <span className="text-white font-mono tabular-nums">
                            Monza
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#666]">Compound</span>
                          <span className="text-[#FFD400] font-mono tabular-nums">
                            Medium
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#666]">Tyre Age</span>
                          <span className="text-white font-mono tabular-nums">
                            8 laps
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#666]">Laps Remaining</span>
                          <span className="text-white font-mono tabular-nums">
                            53
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#666]">Gap Ahead</span>
                          <span className="text-[#00FF85] font-mono tabular-nums">
                            +1.2s
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#666]">Gap Behind</span>
                          <span className="text-[#E10600] font-mono tabular-nums">
                            +2.1s
                          </span>
                        </div>
                      </div>
                    </FloatingPanel>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
