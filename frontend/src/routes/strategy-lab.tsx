import { createFileRoute } from "@tanstack/react-router";
import {
  FloatingPanel,
  ConfidenceMeter,
  MetricCard,
  CardSkeleton,
} from "@/components/f1";
import { motion, AnimatePresence } from "framer-motion";
import {
  useStrategyQuery,
  useCircuitsQuery,
  useCompoundsQuery,
  useDegradationQuery,
  useDriversQuery,
  useTeamsQuery,
  useWeatherOptionsQuery,
  useMonteCarloQuery,
  useRaceOutcomeQuery,
  useSafetyCarQueryEnabled,
  useSimulationQueryEnabled,
  useHistoricalQuery,
  useHistoricalComparisonQuery,
} from "@/hooks/useApiQueries";
import { useState, useMemo, useCallback, useEffect } from "react";
import type { StrategyInput } from "@/lib/api";
import { exportJSON } from "@/lib/export";

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
          "Interactive F1 race strategy simulation with tyre degradation modelling, undercut/overcut analysis, Monte Carlo simulation, and AI-recommended pit windows.",
      },
    ],
  }),
});

interface RaceConfig {
  circuit: string;
  weather: string;
  airTemp: number;
  trackTemp: number;
  driver: string;
  team: string;
  totalLaps: number;
  currentLap: number;
  startingPosition: number;
}

interface StrategyConfig {
  startingTyre: string;
  fuelLoad: number;
  safetyCarProb: number;
  pitCrewSpeed: number;
  aggression: number;
  tyreManagement: number;
  fuelSaving: number;
  drs: number;
}

interface SimConfig {
  monteCarloIterations: number;
  confidenceThreshold: number;
}

const CIRCUIT_LAPS: Record<string, number> = {
  Monza: 53,
  Monaco: 78,
  Silverstone: 52,
  Spa: 44,
  Bahrain: 57,
  Singapore: 62,
  Suzuka: 53,
  Hungary: 70,
  Baku: 51,
  Australia: 58,
};

function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#666] font-mono uppercase tracking-[0.08em]">
          {label}
        </span>
        <span className="text-[11px] text-white font-mono font-bold tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full disabled:opacity-40"
      />
    </div>
  );
}

function SelectControl({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] text-[#666] font-mono uppercase tracking-[0.08em] block">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-sm px-2.5 py-1.5 text-[11px] text-white font-mono focus:border-[#E10600]/50 focus:outline-none disabled:opacity-40 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SimulationProgress({ phase }: { phase: number }) {
  const phases = [
    "Loading circuit data",
    "Computing tyre model",
    "Running traffic analysis",
    "Monte Carlo optimisation",
    "Generating recommendation",
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#666] font-mono uppercase tracking-[0.08em]">
          Simulation Pipeline
        </span>
        <span className="text-[9px] text-[#E10600] font-mono animate-pulse">
          RUNNING
        </span>
      </div>
      {phases.map((p, i) => (
        <motion.div
          key={p}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className="flex items-center gap-2"
        >
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i < phase
                ? "bg-[#00FF85]"
                : i === phase
                  ? "bg-[#00C8FF] animate-pulse"
                  : "bg-[#262626]"
            }`}
          />
          <span
            className={`text-[10px] font-mono transition-colors duration-300 ${
              i <= phase ? "text-white" : "text-[#444]"
            }`}
          >
            {p}
          </span>
        </motion.div>
      ))}
      <div className="pt-1">
        <div className="w-full bg-[#1a1a1a] rounded-full h-1 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#E10600] to-[#00C8FF] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((phase + 1) / phases.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function StrategyLabPage() {
  const [view, setView] = useState<"strategy" | "tyre" | "history">("strategy");
  const [simRunning, setSimRunning] = useState(false);
  const [simPhase, setSimPhase] = useState(0);

  const [race, setRace] = useState<RaceConfig>({
    circuit: "Monza",
    weather: "Dry",
    airTemp: 25,
    trackTemp: 35,
    driver: "Max Verstappen",
    team: "Red Bull",
    totalLaps: 53,
    currentLap: 1,
    startingPosition: 3,
  });

  const [strategy, setStrategy] = useState<StrategyConfig>({
    startingTyre: "MEDIUM",
    fuelLoad: 100,
    safetyCarProb: 20,
    pitCrewSpeed: 85,
    aggression: 75,
    tyreManagement: 80,
    fuelSaving: 50,
    drs: 80,
  });

  const [sim, setSim] = useState<SimConfig>({
    monteCarloIterations: 1000,
    confidenceThreshold: 70,
  });

  const circuitsQuery = useCircuitsQuery();
  const compoundsQuery = useCompoundsQuery();
  const driversQuery = useDriversQuery();
  const teamsQuery = useTeamsQuery();
  const weatherQuery = useWeatherOptionsQuery();

  const circuitOptions = useMemo(() => {
    if (!circuitsQuery.data) return [];
    return Object.keys(circuitsQuery.data).map((c) => ({
      value: c,
      label: c,
    }));
  }, [circuitsQuery.data]);

  const compoundOptions = useMemo(() => {
    if (!compoundsQuery.data) return [];
    return compoundsQuery.data.map((c) => ({
      value: c.id,
      label: `${c.label} (${c.shortLabel})`,
    }));
  }, [compoundsQuery.data]);

  const driverOptions = useMemo(() => {
    if (!driversQuery.data) return [];
    return driversQuery.data.map((d) => ({
      value: d.name,
      label: d.name,
    }));
  }, [driversQuery.data]);

  const teamOptions = useMemo(() => {
    if (!teamsQuery.data) return [];
    return teamsQuery.data.map((t) => ({
      value: t.name,
      label: t.name,
    }));
  }, [teamsQuery.data]);

  const weatherOptions = useMemo(() => {
    if (!weatherQuery.data) return [];
    return weatherQuery.data.map((w) => ({
      value: w,
      label: w,
    }));
  }, [weatherQuery.data]);

  useEffect(() => {
    if (circuitsQuery.data && race.circuit in CIRCUIT_LAPS) {
      setRace((prev) => ({
        ...prev,
        totalLaps: CIRCUIT_LAPS[race.circuit] || 53,
      }));
    }
  }, [race.circuit, circuitsQuery.data]);

  const strategyInput: StrategyInput = useMemo(
    () => ({
      compound: strategy.startingTyre,
      tyre_age: 0,
      circuit: race.circuit,
      gap_ahead: Math.max(0, race.startingPosition - 1) * 0.8,
      gap_behind: Math.max(0, 20 - race.startingPosition) * 0.3,
      track_temp: race.trackTemp,
      air_temp: race.airTemp,
      rain_probability:
        race.weather === "Light Rain"
          ? 50
          : race.weather === "Heavy Rain"
            ? 90
            : 0,
      weather: race.weather,
      fuel_load: strategy.fuelLoad,
      fuel_burn_rate: 1.8 - strategy.fuelSaving * 0.005,
      laps_remaining: race.totalLaps - race.currentLap,
    }),
    [race, strategy],
  );

  const strategyQuery = useStrategyQuery(strategyInput);
  const monteCarloQuery = useMonteCarloQuery(strategyInput, simRunning);
  const raceOutcomeQuery = useRaceOutcomeQuery(strategyInput, simRunning);
  const safetyCarQuery = useSafetyCarQueryEnabled(strategyInput, simRunning);
  const simulationQuery = useSimulationQueryEnabled(strategyInput, simRunning);

  const softDegQuery = useDegradationQuery("SOFT");
  const medDegQuery = useDegradationQuery("MEDIUM");
  const hardDegQuery = useDegradationQuery("HARD");

  const historicalQuery = useHistoricalQuery(race.circuit);
  const histComparisonQuery = useHistoricalComparisonQuery(
    race.circuit,
    strategy.startingTyre,
  );

  const strategyData = strategyQuery.data;
  const monteCarloData = monteCarloQuery.data;
  const raceOutcomeData = raceOutcomeQuery.data;
  const safetyCarData = safetyCarQuery.data;
  const simulationData = simulationQuery.data;

  const runSimulation = useCallback(() => {
    setSimRunning(true);
    setSimPhase(0);
    const timers = [
      setTimeout(() => setSimPhase(1), 400),
      setTimeout(() => setSimPhase(2), 900),
      setTimeout(() => setSimPhase(3), 1500),
      setTimeout(() => setSimPhase(4), 2200),
      setTimeout(() => {
        setSimRunning(false);
        setSimPhase(0);
      }, 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const isDisabled = simRunning;

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
              Interactive F1 race strategy engine — configurable simulation
            </p>
          </div>
          <div className="flex items-center gap-3">
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
            <button
              onClick={runSimulation}
              disabled={simRunning}
              className={`px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.08em] rounded-sm transition-all ${
                simRunning
                  ? "bg-[#262626] text-[#666] cursor-not-allowed"
                  : "bg-[#E10600] text-white shadow-lg shadow-[#E10600]/25 hover:bg-[#cc0500]"
              }`}
            >
              {simRunning ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Simulating
                </span>
              ) : (
                "Run Simulation"
              )}
            </button>
            {strategyData && (
              <button
                onClick={() =>
                  exportJSON(
                    {
                      strategy: strategyData,
                      timestamp: new Date().toISOString(),
                    },
                    `apexiq-strategy-${strategyData.circuit_id}-${Date.now()}`,
                  )
                }
                className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.08em] rounded-sm border border-[#262626] bg-[#101010] text-[#a0a0a0] hover:bg-[#141414] hover:text-white transition-all"
                aria-label="Export strategy report"
              >
                EXPORT ↓
              </button>
            )}
          </div>
        </motion.div>

        {view === "strategy" && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          >
            <div className="col-span-12 lg:col-span-3 space-y-3">
              <FloatingPanel variant="glass" title="Race Configuration">
                <div className="space-y-3">
                  <SelectControl
                    label="Circuit"
                    value={race.circuit}
                    onChange={(v) =>
                      setRace((p) => ({
                        ...p,
                        circuit: v,
                        totalLaps: CIRCUIT_LAPS[v] || 53,
                      }))
                    }
                    options={
                      circuitOptions.length
                        ? circuitOptions
                        : [{ value: "Monza", label: "Monza" }]
                    }
                    disabled={isDisabled}
                  />
                  <SelectControl
                    label="Weather"
                    value={race.weather}
                    onChange={(v) => setRace((p) => ({ ...p, weather: v }))}
                    options={
                      weatherOptions.length
                        ? weatherOptions
                        : [{ value: "Dry", label: "Dry" }]
                    }
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Air Temp"
                    value={race.airTemp}
                    onChange={(v) => setRace((p) => ({ ...p, airTemp: v }))}
                    min={5}
                    max={45}
                    unit="°C"
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Track Temp"
                    value={race.trackTemp}
                    onChange={(v) => setRace((p) => ({ ...p, trackTemp: v }))}
                    min={10}
                    max={60}
                    unit="°C"
                    disabled={isDisabled}
                  />
                  <SelectControl
                    label="Driver"
                    value={race.driver}
                    onChange={(v) => setRace((p) => ({ ...p, driver: v }))}
                    options={
                      driverOptions.length
                        ? driverOptions
                        : [{ value: "Max Verstappen", label: "Max Verstappen" }]
                    }
                    disabled={isDisabled}
                  />
                  <SelectControl
                    label="Team"
                    value={race.team}
                    onChange={(v) => setRace((p) => ({ ...p, team: v }))}
                    options={
                      teamOptions.length
                        ? teamOptions
                        : [{ value: "Red Bull", label: "Red Bull" }]
                    }
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Race Length"
                    value={race.totalLaps}
                    onChange={(v) => setRace((p) => ({ ...p, totalLaps: v }))}
                    min={20}
                    max={80}
                    unit=" laps"
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Current Lap"
                    value={race.currentLap}
                    onChange={(v) => setRace((p) => ({ ...p, currentLap: v }))}
                    min={1}
                    max={race.totalLaps}
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Starting Position"
                    value={race.startingPosition}
                    onChange={(v) =>
                      setRace((p) => ({ ...p, startingPosition: v }))
                    }
                    min={1}
                    max={20}
                    unit="P"
                    disabled={isDisabled}
                  />
                </div>
              </FloatingPanel>

              <FloatingPanel variant="glass" title="Strategy">
                <div className="space-y-3">
                  <SelectControl
                    label="Starting Tyre"
                    value={strategy.startingTyre}
                    onChange={(v) =>
                      setStrategy((p) => ({ ...p, startingTyre: v }))
                    }
                    options={
                      compoundOptions.length
                        ? compoundOptions
                        : [
                            { value: "SOFT", label: "SOFT (S)" },
                            { value: "MEDIUM", label: "MED (M)" },
                            { value: "HARD", label: "HARD (H)" },
                          ]
                    }
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Fuel Load"
                    value={strategy.fuelLoad}
                    onChange={(v) =>
                      setStrategy((p) => ({ ...p, fuelLoad: v }))
                    }
                    min={50}
                    max={110}
                    unit=" kg"
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Safety Car Prob"
                    value={strategy.safetyCarProb}
                    onChange={(v) =>
                      setStrategy((p) => ({ ...p, safetyCarProb: v }))
                    }
                    min={0}
                    max={100}
                    unit="%"
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Pit Crew Speed"
                    value={strategy.pitCrewSpeed}
                    onChange={(v) =>
                      setStrategy((p) => ({ ...p, pitCrewSpeed: v }))
                    }
                    min={50}
                    max={100}
                    unit="%"
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Aggression"
                    value={strategy.aggression}
                    onChange={(v) =>
                      setStrategy((p) => ({ ...p, aggression: v }))
                    }
                    min={0}
                    max={100}
                    unit="%"
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Tyre Management"
                    value={strategy.tyreManagement}
                    onChange={(v) =>
                      setStrategy((p) => ({ ...p, tyreManagement: v }))
                    }
                    min={0}
                    max={100}
                    unit="%"
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Fuel Saving"
                    value={strategy.fuelSaving}
                    onChange={(v) =>
                      setStrategy((p) => ({ ...p, fuelSaving: v }))
                    }
                    min={0}
                    max={100}
                    unit="%"
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="DRS"
                    value={strategy.drs}
                    onChange={(v) => setStrategy((p) => ({ ...p, drs: v }))}
                    min={0}
                    max={100}
                    unit="%"
                    disabled={isDisabled}
                  />
                </div>
              </FloatingPanel>

              <FloatingPanel variant="glass" title="Simulation">
                <div className="space-y-3">
                  <SliderControl
                    label="Monte Carlo Iterations"
                    value={sim.monteCarloIterations}
                    onChange={(v) =>
                      setSim((p) => ({ ...p, monteCarloIterations: v }))
                    }
                    min={100}
                    max={5000}
                    step={100}
                    disabled={isDisabled}
                  />
                  <SliderControl
                    label="Confidence Threshold"
                    value={sim.confidenceThreshold}
                    onChange={(v) =>
                      setSim((p) => ({ ...p, confidenceThreshold: v }))
                    }
                    min={50}
                    max={95}
                    unit="%"
                    disabled={isDisabled}
                  />
                </div>
              </FloatingPanel>
            </div>

            <div className="col-span-12 lg:col-span-9 space-y-4">
              <AnimatePresence mode="wait">
                {simRunning && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FloatingPanel variant="glow-red" title="Simulation Status">
                      <SimulationProgress phase={simPhase} />
                    </FloatingPanel>
                  </motion.div>
                )}
              </AnimatePresence>

              {simRunning && (
                <div className="space-y-4">
                  <CardSkeleton lines={4} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <CardSkeleton lines={2} />
                    <CardSkeleton lines={2} />
                    <CardSkeleton lines={2} />
                  </div>
                </div>
              )}

              {!simRunning && (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  <FloatingPanel
                    variant="glass-edge"
                    title="Recommended Strategy"
                    titleRight={
                      strategyData ? (
                        <ConfidenceMeter
                          value={strategyData.confidence}
                          size="sm"
                        />
                      ) : undefined
                    }
                  >
                    {strategyData ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <span className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
                              {strategyData.action}
                            </span>
                            <p className="text-[10px] text-[#666] font-mono mt-1 leading-relaxed">
                              {strategyData.reasoning}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <div className="p-2.5 rounded-sm bg-[#141414]/60 border border-[#262626]">
                            <span className="text-[9px] text-[#666] font-mono block">
                              Optimal Pit Lap
                            </span>
                            <span className="text-sm font-bold font-mono tabular-nums text-white">
                              Lap {strategyData.optimal_pit_lap}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-sm bg-[#141414]/60 border border-[#262626]">
                            <span className="text-[9px] text-[#666] font-mono block">
                              Pit Window Score
                            </span>
                            <span className="text-sm font-bold font-mono tabular-nums text-white">
                              {strategyData.pit_window_score}/100
                            </span>
                          </div>
                          <div className="p-2.5 rounded-sm bg-[#141414]/60 border border-[#262626]">
                            <span className="text-[9px] text-[#666] font-mono block">
                              Fuel Needed
                            </span>
                            <span className="text-sm font-bold font-mono tabular-nums text-white">
                              {strategyData.fuel_needed} kg
                            </span>
                          </div>
                          <div className="p-2.5 rounded-sm bg-[#141414]/60 border border-[#262626]">
                            <span className="text-[9px] text-[#666] font-mono block">
                              Traffic
                            </span>
                            <span className="text-sm font-bold font-mono tabular-nums text-white">
                              {strategyData.traffic_status}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 rounded-sm bg-[#141414]/60 border border-[#262626]">
                          <span className="text-[9px] text-[#666] font-mono tracking-[0.08em] uppercase block mb-2">
                            Pit Window Analysis
                          </span>
                          <div className="flex items-end gap-0.5 h-12">
                            {strategyData.pit_window_analysis.map((item) => {
                              const maxScore = Math.max(
                                ...strategyData.pit_window_analysis.map(
                                  (x) => x.score,
                                ),
                              );
                              const pct =
                                maxScore > 0
                                  ? (1 - item.score / maxScore) * 100
                                  : 50;
                              return (
                                <div
                                  key={item.lap}
                                  className="flex-1 flex flex-col items-center gap-0.5"
                                >
                                  <div
                                    className="w-full rounded-t-sm min-h-[2px]"
                                    style={{
                                      height: `${Math.max(pct, 5)}%`,
                                      backgroundColor:
                                        item.lap ===
                                        strategyData.optimal_pit_lap
                                          ? "#00FF85"
                                          : "#E10600",
                                      opacity: 0.8,
                                    }}
                                  />
                                  <span className="text-[6px] text-[#666] font-mono">
                                    {item.lap}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-[9px] text-[#666] font-mono mt-2">
                            Optimal: Lap {strategyData.optimal_pit_lap} (score{" "}
                            {strategyData.pit_window_score}/100)
                          </p>
                        </div>
                        {strategyData.engine_briefing && (
                          <div className="p-3 rounded-sm bg-[#E10600]/5 border border-[#E10600]/20">
                            <span className="text-[9px] text-[#E10600] font-mono tracking-[0.08em] uppercase">
                              Engine Briefing
                            </span>
                            <p className="text-[10px] text-[#A0A0A0] mt-1">
                              {strategyData.engine_briefing}
                            </p>
                          </div>
                        )}
                        <div className="text-[9px] text-[#666] font-mono flex gap-4 pt-2 border-t border-[#262626]/40">
                          <span>
                            Fuel: {strategyData.fuel_needed} kg (Δ
                            {strategyData.fuel_delta > 0 ? "+" : ""}
                            {strategyData.fuel_delta})
                          </span>
                          <span>Risk: {strategyData.traffic_risk}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#666] font-mono text-center py-8">
                        {strategyQuery.isLoading
                          ? "Computing strategy..."
                          : "Configure parameters and run simulation"}
                      </div>
                    )}
                  </FloatingPanel>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FloatingPanel variant="compact" title="Race Outcome">
                      {raceOutcomeData ? (
                        <div className="space-y-2">
                          <MetricCard
                            label="Projected Finish"
                            value={raceOutcomeData.projected_finish}
                            color="green"
                          />
                          <MetricCard
                            label="Podium Probability"
                            value={`${raceOutcomeData.podium_probability}%`}
                            color="blue"
                          />
                          <MetricCard
                            label="Overtake Probability"
                            value={`${raceOutcomeData.overtake_probability}%`}
                            color="yellow"
                          />
                          <MetricCard
                            label="Championship Points"
                            value={raceOutcomeData.championship_points}
                            color="orange"
                          />
                        </div>
                      ) : (
                        <CardSkeleton lines={3} />
                      )}
                    </FloatingPanel>

                    <FloatingPanel
                      variant="compact"
                      title="Monte Carlo Analysis"
                    >
                      {monteCarloData ? (
                        <div className="space-y-2">
                          <MetricCard
                            label="Win Probability"
                            value={`${monteCarloData.win_probability}%`}
                            color="green"
                          />
                          <MetricCard
                            label="Podium Probability"
                            value={`${monteCarloData.podium_probability}%`}
                            color="blue"
                          />
                          <MetricCard
                            label="Average Finish"
                            value={`P${monteCarloData.average_finish}`}
                            color="white"
                          />
                          <MetricCard
                            label="Best / Worst"
                            value={`P${monteCarloData.best_case} / P${monteCarloData.worst_case}`}
                            color="yellow"
                          />
                        </div>
                      ) : (
                        <CardSkeleton lines={3} />
                      )}
                    </FloatingPanel>

                    <FloatingPanel
                      variant="compact"
                      title="Safety Car & Undercut"
                    >
                      {safetyCarData && simulationData ? (
                        <div className="space-y-2">
                          <MetricCard
                            label="SC Recommendation"
                            value={safetyCarData.recommendation}
                            color={
                              safetyCarData.recommendation === "PIT_NOW"
                                ? "green"
                                : "yellow"
                            }
                          />
                          <MetricCard
                            label="SC Delta"
                            value={`+${safetyCarData.delta}s`}
                            color="blue"
                          />
                          <MetricCard
                            label="Undercut Possible"
                            value={
                              simulationData.undercut_possible ? "YES" : "NO"
                            }
                            color={
                              simulationData.undercut_possible ? "green" : "red"
                            }
                          />
                          <MetricCard
                            label="Undercut Gain"
                            value={`+${simulationData.undercut_gain.toFixed(1)}s`}
                            color="cyan"
                          />
                        </div>
                      ) : (
                        <CardSkeleton lines={3} />
                      )}
                    </FloatingPanel>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FloatingPanel
                      variant="compact"
                      title="Position Distribution"
                    >
                      {monteCarloData?.position_distribution ? (
                        <div className="flex items-end gap-0.5 h-20">
                          {monteCarloData.position_distribution.map((d) => {
                            const maxFreq = Math.max(
                              ...monteCarloData.position_distribution.map(
                                (x) => x.frequency,
                              ),
                            );
                            const pct =
                              maxFreq > 0 ? (d.frequency / maxFreq) * 100 : 0;
                            return (
                              <div
                                key={d.position}
                                className="flex-1 flex flex-col items-center gap-0.5"
                              >
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${pct}%` }}
                                  transition={{
                                    duration: 0.5,
                                    delay: d.position * 0.03,
                                  }}
                                  className="w-full bg-[#E10600]/60 rounded-t-sm min-h-[1px]"
                                />
                                <span className="text-[7px] text-[#666] font-mono">
                                  {d.position}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-20 flex items-center justify-center">
                          <span className="text-[9px] text-[#666] font-mono">
                            Run simulation to view distribution
                          </span>
                        </div>
                      )}
                    </FloatingPanel>

                    <FloatingPanel
                      variant="compact"
                      title="Strategy Comparison"
                    >
                      {simulationData ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                            <span className="text-[10px] text-[#666] font-mono">
                              Stay Out Loss
                            </span>
                            <span className="text-[11px] text-[#E10600] font-mono font-bold">
                              +{simulationData.stay_out_loss.toFixed(1)}s
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                            <span className="text-[10px] text-[#666] font-mono">
                              Pit Loss
                            </span>
                            <span className="text-[11px] text-[#00C8FF] font-mono font-bold">
                              +{simulationData.pit_loss.toFixed(1)}s
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                            <span className="text-[10px] text-[#666] font-mono">
                              Undercut Gain
                            </span>
                            <span className="text-[11px] text-[#00FF85] font-mono font-bold">
                              +{simulationData.undercut_gain.toFixed(1)}s
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                            <span className="text-[10px] text-[#666] font-mono">
                              Pit Crew Speed
                            </span>
                            <span className="text-[11px] text-[#FFD400] font-mono font-bold">
                              {strategy.pitCrewSpeed}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <CardSkeleton lines={3} />
                      )}
                    </FloatingPanel>
                  </div>
                </motion.div>
              )}
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
              <FloatingPanel variant="glass" title="Tyre Degradation Model">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    {
                      label: "Soft (C5)",
                      data: softDegQuery.data,
                      color: "bg-[#E10600]",
                      textColor: "text-[#E10600]",
                    },
                    {
                      label: "Medium (C3)",
                      data: medDegQuery.data,
                      color: "bg-[#FFD400]",
                      textColor: "text-[#FFD400]",
                    },
                    {
                      label: "Hard (C1)",
                      data: hardDegQuery.data,
                      color: "bg-[#A0A0A0]",
                      textColor: "text-[#A0A0A0]",
                    },
                    {
                      label: "Intermediate",
                      data: null,
                      color: "bg-[#00C8FF]",
                      textColor: "text-[#00C8FF]",
                    },
                    {
                      label: "Wet",
                      data: null,
                      color: "bg-[#00FF85]",
                      textColor: "text-[#00FF85]",
                    },
                  ].map((tyre) => {
                    const gripData = tyre.data;
                    const avgGrip = gripData
                      ? Math.round(
                          gripData.reduce((sum, p) => sum + p.grip, 0) /
                            gripData.length,
                        )
                      : null;
                    const maxLaps = gripData ? gripData.length : 0;
                    const cliffLap = gripData
                      ? gripData.findIndex((p) => p.grip < 60) + 1 || maxLaps
                      : 0;

                    return (
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
                            <span>Avg Grip</span>
                            <span className="text-white">
                              {avgGrip !== null ? `${avgGrip}%` : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cliff Lap</span>
                            <span className="text-white">
                              {cliffLap > 0 ? `Lap ${cliffLap}` : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Stint Window</span>
                            <span className="text-white">
                              {maxLaps > 0 ? `${maxLaps} laps` : "—"}
                            </span>
                          </div>
                        </div>
                        {gripData && (
                          <div className="mt-2 flex items-end gap-px h-10">
                            {gripData
                              .filter(
                                (_, i) =>
                                  i %
                                    Math.max(
                                      1,
                                      Math.floor(gripData.length / 10),
                                    ) ===
                                  0,
                              )
                              .map((p, i) => (
                                <div
                                  key={i}
                                  className="flex-1 rounded-t-sm"
                                  style={{
                                    height: `${(p.grip / 100) * 100}%`,
                                    backgroundColor:
                                      p.grip > 70
                                        ? "#00FF85"
                                        : p.grip > 50
                                          ? "#FFD400"
                                          : "#E10600",
                                    opacity: 0.7,
                                  }}
                                />
                              ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t border-[#262626]/40">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#666] font-mono">
                      Selected Compound
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        strategy.startingTyre === "SOFT"
                          ? "text-[#E10600]"
                          : strategy.startingTyre === "MEDIUM"
                            ? "text-[#FFD400]"
                            : strategy.startingTyre === "HARD"
                              ? "text-[#A0A0A0]"
                              : "text-[#00C8FF]"
                      }`}
                    >
                      {strategy.startingTyre}
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          >
            <div className="col-span-12 lg:col-span-8">
              <FloatingPanel variant="glass" title="Historical Race Data">
                {historicalQuery.data && historicalQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {historicalQuery.data.slice(0, 6).map((race, i) => (
                      <motion.div
                        key={i}
                        variants={fadeUp}
                        className="flex items-center gap-3 p-2.5 rounded-sm bg-[#141414]/60 border border-[#262626] hover:border-[#333] transition-all"
                      >
                        <div className="w-8 h-8 rounded-sm bg-[#1a1a1a] flex items-center justify-center">
                          <span className="text-[10px] font-mono text-[#666]">
                            {race.season}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white font-medium truncate">
                            {race.race_name || race.circuit}
                          </p>
                          <p className="text-[9px] text-[#666] font-mono">
                            Winner: {race.winner || "N/A"} • Strategy:{" "}
                            {race.winning_strategy || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-[#666] font-mono block">
                            {race.weather || "Dry"}
                          </span>
                          <span className="text-[9px] text-[#666] font-mono">
                            SC: {race.safety_cars || 0}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-[#666] font-mono text-center py-8">
                    {historicalQuery.isLoading
                      ? "Loading historical data..."
                      : "No historical data available for this circuit"}
                  </div>
                )}
              </FloatingPanel>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-3">
              <FloatingPanel variant="compact" title="Strategy Performance">
                {histComparisonQuery.data ? (
                  <div className="space-y-2">
                    <MetricCard
                      label="Success Rate"
                      value={`${Math.round(histComparisonQuery.data.success_rate * 100)}%`}
                      color={
                        histComparisonQuery.data.success_rate > 0.6
                          ? "green"
                          : "yellow"
                      }
                    />
                    <MetricCard
                      label="Historical Races"
                      value={histComparisonQuery.data.historical_races}
                      color="blue"
                    />
                    <MetricCard
                      label="Historical Wins"
                      value={histComparisonQuery.data.historical_wins}
                      color="green"
                    />
                    <MetricCard
                      label="Avg Finish"
                      value={
                        histComparisonQuery.data.average_finish
                          ? `P${histComparisonQuery.data.average_finish}`
                          : "N/A"
                      }
                      color="white"
                    />
                    <MetricCard
                      label="Similarity"
                      value={`${Math.round(histComparisonQuery.data.similarity * 100)}%`}
                      color="purple"
                    />
                    <div className="pt-2 border-t border-[#262626]/40">
                      <p className="text-[10px] text-[#A0A0A0] leading-relaxed">
                        {histComparisonQuery.data.recommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <CardSkeleton lines={4} />
                )}
              </FloatingPanel>

              <FloatingPanel variant="compact" title="Race Info">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Circuit
                    </span>
                    <span className="text-[10px] text-white font-mono font-bold">
                      {race.circuit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Total Laps
                    </span>
                    <span className="text-[10px] text-white font-mono font-bold">
                      {race.totalLaps}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Weather
                    </span>
                    <span className="text-[10px] text-white font-mono font-bold">
                      {race.weather}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Driver
                    </span>
                    <span className="text-[10px] text-white font-mono font-bold">
                      {race.driver}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Team
                    </span>
                    <span className="text-[10px] text-white font-mono font-bold">
                      {race.team}
                    </span>
                  </div>
                </div>
              </FloatingPanel>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
