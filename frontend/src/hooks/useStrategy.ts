import { useState, useCallback } from "react";
import {
  getStrategy,
  simulate,
  getStrategyComparison,
  getSafetyCarAnalysis,
  getRainStrategy,
  getMonteCarlo,
  getRaceOutcome,
  type RaceOutcomeResponse,
  type MonteCarloResponse,
  type RainStrategyResponse,
  type SafetyCarResponse,
  type StrategyInput,
} from "@/lib/api";

import type {
  StrategyData,
  ComparisonData,
  SimulationData,
  EngineBriefing,
  StrategyReasoning,
  PitWindowData,
} from "@/types/strategy";
import {
  mapComparison,
  mapSimulation,
  mapStrategy,
} from "@/lib/strategy-mappers";

export type { StrategyData, ComparisonData, SimulationData };

export function useStrategy() {
  const [strategy, setStrategy] = useState<StrategyData | null>(null);
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [safetyCar, setSafetyCar] = useState<SafetyCarResponse | null>(null);
  const [rainStrategy, setRainStrategy] = useState<RainStrategyResponse | null>(
    null,
  );
  const [monteCarlo, setMonteCarlo] = useState<MonteCarloResponse | null>(null);
  const [raceOutcome, setRaceOutcome] = useState<RaceOutcomeResponse | null>(
    null,
  );

  const run = useCallback(async (input: StrategyInput) => {
    setLoading(true);
    setError(null);
    setStrategy(null);
    setSimulation(null);
    setComparison(null);
    setSafetyCar(null);
    setRainStrategy(null);
    setMonteCarlo(null);
    setRaceOutcome(null);

    try {
      const [
        strategyRes,
        simRes,
        comparisonRes,
        safetyCarRes,
        rainStrategyRes,
        monteCarloRes,
        raceOutcomeRes,
      ] = await Promise.allSettled([
        getStrategy(input),
        simulate(input),
        getStrategyComparison(input),
        getSafetyCarAnalysis(input),
        getRainStrategy(input),
        getMonteCarlo(input),
        getRaceOutcome(input),
      ]);

      if (strategyRes.status !== "fulfilled") {
        setStrategy(null);
        setSimulation(null);
        setComparison(null);
        setError("Strategy engine unavailable. Check backend connection.");
        return;
      }

      if (safetyCarRes.status === "fulfilled") {
        setSafetyCar(safetyCarRes.value);
      } else {
        setSafetyCar(null);
      }

      if (rainStrategyRes.status === "fulfilled") {
        setRainStrategy(rainStrategyRes.value);
      } else {
        setRainStrategy(null);
      }

      if (monteCarloRes.status === "fulfilled") {
        setMonteCarlo(monteCarloRes.value);
      }

      if (raceOutcomeRes.status === "fulfilled") {
        setRaceOutcome(raceOutcomeRes.value);
      }

      const strategyApi = strategyRes.value;

      if (simRes.status === "fulfilled") {
        setSimulation(mapSimulation(simRes.value));
        setStrategy(mapStrategy(strategyApi, simRes.value));
      } else {
        setSimulation(null);
        setStrategy(mapStrategy(strategyApi, null));
      }

      if (comparisonRes.status === "fulfilled") {
        setComparison(mapComparison(comparisonRes.value));
      } else {
        setComparison(null);
      }
    } catch {
      setError("Strategy engine unavailable. Check backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    strategy,
    simulation,
    comparison,
    safetyCar,
    rainStrategy,
    monteCarlo,
    raceOutcome,
    loading,
    error,
    run,
  };
}
