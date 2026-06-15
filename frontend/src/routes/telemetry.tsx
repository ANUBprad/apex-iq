import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  getReplayIntelligence,
  getStrategy,
  getStrategyComparison,
  simulate,
  type ReplayIntelligence,
  type StrategyInput,
} from "@/lib/api";
import {
  CIRCUITS,
  COMPOUNDS,
  WEATHER_OPTIONS,
  type WeatherOption,
} from "@/lib/apex-data";
import {
  mapComparison,
  mapSimulation,
  mapStrategy,
} from "@/lib/strategy-mappers";
import { TelemetrySection } from "@/components/dashboard/TelemetrySection";
import { TelemetryGraph } from "@/components/ui-apex/TelemetryGraph";

export const Route = createFileRoute("/telemetry")({
  component: TelemetryPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Telemetry Center" },
      {
        name: "description",
        content:
          "Live race data intelligence engine -- tyre temperatures, stint analysis, and degradation modelling.",
      },
    ],
  }),
});

const DEFAULT_INPUT: StrategyInput = {
  compound: "MEDIUM",
  tyre_age: 16,
  circuit: "Monaco",
  gap_ahead: 3.4,
  gap_behind: 18.2,
  fuel_load: 54,
  track_temp: 36,
  air_temp: 24,
  laps_remaining: 28,
  weather: "Dry",
  fuel_burn_rate: 1.85,
  rain_prob: 10,
};

function MetricCard({
  label,
  value,
  accent = "text-[#F9FAFB]",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="border border-[#1F1F2E] bg-[#111118] p-4">
      <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        {label}
      </div>
      <div className={`mt-2 font-mono text-[18px] ${accent}`}>{value}</div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
          {label}
        </span>
        <span className="font-mono text-[12px] text-[#E5E7EB]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#00D2FF]"
      />
    </label>
  );
}

function TelemetryPage() {
  const [input, setInput] = useState<StrategyInput>(DEFAULT_INPUT);
  const [currentLap, setCurrentLap] = useState(22);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replay, setReplay] = useState<ReplayIntelligence | null>(null);
  const [strategy, setStrategy] = useState<ReturnType<
    typeof mapStrategy
  > | null>(null);
  const [simulationData, setSimulationData] = useState<ReturnType<
    typeof mapSimulation
  > | null>(null);
  const [comparison, setComparison] = useState<ReturnType<
    typeof mapComparison
  > | null>(null);

  const circuit = useMemo(
    () => CIRCUITS.find((item) => item.name === input.circuit) ?? CIRCUITS[0],
    [input.circuit],
  );
  const totalLaps = circuit.laps;
  const compoundData =
    COMPOUNDS.find((item) => item.id === input.compound) ?? COMPOUNDS[1];

  const telemetryFeed = useMemo(() => {
    if (!simulationData) {
      return [];
    }

    const throttleBias = replay?.recommendation.includes("PUSH") ? 7 : -4;
    const brakeBias = simulationData.stay_out_loss > 2 ? 10 : 4;
    const baseSpeed =
      308 - circuit.pitLoss * 0.8 + compoundData.gripBase * 0.18;

    return Array.from({ length: 24 }, (_, index) => {
      const time = index * 5;
      const wave = Math.sin(index / 2.6);
      return {
        time,
        speed: +(
          baseSpeed -
          simulationData.stay_out_loss * 0.8 +
          wave * 4
        ).toFixed(1),
        throttle: +Math.max(
          42,
          Math.min(100, 84 + throttleBias + wave * 8),
        ).toFixed(1),
        brake: +Math.max(4, Math.min(58, 18 + brakeBias - wave * 6)).toFixed(1),
        gear: Math.max(3, Math.min(8, 6 + Math.round(wave * 2))),
      };
    });
  }, [circuit.pitLoss, compoundData.gripBase, replay, simulationData]);

  async function runTelemetry(
    nextInput: StrategyInput = input,
    nextLap: number = currentLap,
  ) {
    const nextCircuit =
      CIRCUITS.find((item) => item.name === nextInput.circuit) ?? CIRCUITS[0];
    const lapsRemaining = Math.max(1, nextCircuit.laps - nextLap);
    const payload: StrategyInput = {
      ...nextInput,
      tyre_age: Math.min(nextInput.tyre_age, nextLap),
      laps_remaining: lapsRemaining,
    };

    setLoading(true);
    setError(null);

    try {
      const [strategyRes, simulationRes, comparisonRes, replayRes] =
        await Promise.all([
          getStrategy(payload),
          simulate(payload),
          getStrategyComparison(payload),
          getReplayIntelligence(nextLap, nextCircuit.laps),
        ]);

      setStrategy(mapStrategy(strategyRes, simulationRes));
      setSimulationData(mapSimulation(simulationRes));
      setComparison(mapComparison(comparisonRes));
      setReplay(replayRes);
    } catch {
      setStrategy(null);
      setSimulationData(null);
      setComparison(null);
      setReplay(null);
      setError(
        "Telemetry feed is unavailable. Verify the backend and refresh the session.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void runTelemetry(DEFAULT_INPUT, 22);
    // Initial analysis gives the page a meaningful first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F9FAFB]">
      <Navbar />
      <main className="mx-auto max-w-[1700px] px-4 pb-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-wrap items-end justify-between gap-4 pt-4"
        >
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
              Live Race Data Intelligence
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#F9FAFB] md:text-3xl">
              Telemetry Center
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] text-[#9CA3AF]">
              Trace live stint health, pace delta, undercut timing, and replay
              intelligence from the same backend signals driving the Strategy
              Control Room.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="border border-[#1F1F2E] bg-[#111118] px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
              {input.circuit}
            </span>
            <span className="border border-[#00D2FF]/20 bg-[#00D2FF]/5 px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-[#00D2FF]">
              {loading ? "Refreshing" : "Feed Online"}
            </span>
          </div>
        </motion.div>

        <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
          <section className="space-y-4 border border-[#1F1F2E] bg-[#111118] p-5">
            <header className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
              Session Controls
            </header>

            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                Circuit
              </label>
              <select
                value={input.circuit}
                onChange={(event) => {
                  const nextCircuit =
                    CIRCUITS.find((item) => item.name === event.target.value) ??
                    CIRCUITS[0];
                  setInput((previous) => ({
                    ...previous,
                    circuit: event.target.value,
                    laps_remaining: Math.max(1, nextCircuit.laps - currentLap),
                  }));
                }}
                className="w-full border border-[#1F1F2E] bg-[#0A0A0F] px-3 py-2 text-[13px] text-[#F9FAFB]"
              >
                {CIRCUITS.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.flag} {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                Compound
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COMPOUNDS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setInput((previous) => ({
                        ...previous,
                        compound: item.id,
                      }))
                    }
                    className={`border px-2 py-2 text-[10px] uppercase tracking-[0.1em] ${
                      input.compound === item.id
                        ? "border-transparent text-white"
                        : "border-[#1F1F2E] bg-[#0A0A0F] text-[#9CA3AF]"
                    }`}
                    style={
                      input.compound === item.id
                        ? { backgroundColor: item.color }
                        : undefined
                    }
                  >
                    {item.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <Slider
              label="Current Lap"
              value={currentLap}
              min={1}
              max={totalLaps}
              onChange={(value) => {
                setCurrentLap(value);
                setInput((previous) => ({
                  ...previous,
                  laps_remaining: Math.max(1, totalLaps - value),
                }));
              }}
            />
            <Slider
              label="Tyre Age"
              value={input.tyre_age}
              min={0}
              max={40}
              suffix=" laps"
              onChange={(value) =>
                setInput((previous) => ({ ...previous, tyre_age: value }))
              }
            />
            <Slider
              label="Gap Ahead"
              value={input.gap_ahead}
              min={0}
              max={15}
              step={0.1}
              suffix="s"
              onChange={(value) =>
                setInput((previous) => ({ ...previous, gap_ahead: value }))
              }
            />
            <Slider
              label="Gap Behind"
              value={input.gap_behind}
              min={0}
              max={25}
              step={0.1}
              suffix="s"
              onChange={(value) =>
                setInput((previous) => ({ ...previous, gap_behind: value }))
              }
            />
            <Slider
              label="Fuel Load"
              value={input.fuel_load ?? 55}
              min={5}
              max={110}
              suffix="kg"
              onChange={(value) =>
                setInput((previous) => ({ ...previous, fuel_load: value }))
              }
            />

            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                Weather
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WEATHER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setInput((previous) => ({
                        ...previous,
                        weather: option as WeatherOption,
                      }))
                    }
                    className={`border px-2 py-2 text-[10px] uppercase tracking-[0.1em] ${
                      input.weather === option
                        ? "border-[#00D2FF]/30 bg-[#00D2FF]/10 text-[#00D2FF]"
                        : "border-[#1F1F2E] bg-[#0A0A0F] text-[#9CA3AF]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void runTelemetry()}
              disabled={loading}
              className="w-full border border-[#00D2FF]/30 bg-[#00D2FF]/10 px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-[#00D2FF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing Telemetry" : "Run Telemetry Analysis"}
            </button>
          </section>

          <div className="space-y-4">
            {error && (
              <div className="border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-[13px] text-[#FCA5A5]">
                {error}
              </div>
            )}

            <section className="border border-[#1F1F2E] bg-[#111118] p-5">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                    Live Feed Summary
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[#F9FAFB]">
                    {replay?.recommendation ?? "Awaiting telemetry response"}
                  </div>
                </div>
                <div className="text-[12px] text-[#9CA3AF]">
                  Lap {currentLap} / {totalLaps}
                </div>
              </header>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Replay Insight"
                  value={replay?.insight ?? "No replay insight"}
                  accent="text-[#E5E7EB]"
                />
                <MetricCard
                  label="Undercut Window"
                  value={replay ? `${replay.undercut_probability}%` : "—"}
                  accent="text-[#00D2FF]"
                />
                <MetricCard
                  label="Traffic Risk"
                  value={replay?.traffic_risk ?? "—"}
                  accent={
                    replay?.traffic_risk === "MEDIUM"
                      ? "text-[#F59E0B]"
                      : "text-[#10B981]"
                  }
                />
                <MetricCard
                  label="Compound Grip"
                  value={`${compoundData.gripBase.toFixed(1)}%`}
                  accent="text-[#10B981]"
                />
              </div>
            </section>

            {loading && !strategy && (
              <section className="border border-[#1F1F2E] bg-[#111118] p-6 text-[13px] text-[#9CA3AF]">
                Building telemetry projection from live strategy signals...
              </section>
            )}

            {!loading && simulationData && comparison && strategy ? (
              <>
                <TelemetryGraph data={telemetryFeed} />
                <TelemetrySection
                  simulation={simulationData}
                  reasoning={strategy.reasoning}
                  comparison={comparison}
                  fuelBurnRate={input.fuel_burn_rate}
                />
              </>
            ) : !loading && !error ? (
              <section className="border border-dashed border-[#1F1F2E] bg-[#111118] p-8 text-center">
                <div className="text-lg font-semibold text-[#9CA3AF]">
                  No Telemetry Session Loaded
                </div>
                <p className="mt-2 text-[13px] text-[#9CA3AF]">
                  Run an analysis to populate telemetry charts, replay insight,
                  and stint health.
                </p>
              </section>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
