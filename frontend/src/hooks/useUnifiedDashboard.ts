import { useState, useEffect, useCallback } from "react";
import {
  getDashboardAggregate,
  type DashboardAggregateResponse,
  type DashboardAggregateParams,
} from "@/api/aggregator";
import { useStrategy } from "@/hooks/useStrategy";
import type { StrategyInput } from "@/lib/api";

export interface UnifiedDashboardState {
  aggregator: DashboardAggregateResponse | null;
  aggregatorLoading: boolean;
  aggregatorError: string | null;
}

export function useUnifiedDashboard() {
  const [aggregator, setAggregator] =
    useState<DashboardAggregateResponse | null>(null);
  const [aggregatorLoading, setAggregatorLoading] = useState(false);
  const [aggregatorError, setAggregatorError] = useState<string | null>(null);

  const {
    strategy,
    simulation,
    comparison,
    safetyCar,
    rainStrategy,
    monteCarlo,
    raceOutcome,
    loading: strategyLoading,
    error: strategyError,
    run: runStrategy,
  } = useStrategy();

  const run = useCallback(
    async (input: StrategyInput) => {
      runStrategy(input);

      const params: DashboardAggregateParams = {
        circuit_id: input.circuit,
        driver_id: input.driver ?? "max-verstappen",
        compound: input.compound,
        tyre_age: input.tyre_age,
        laps_remaining: input.laps_remaining ?? 20,
      };

      setAggregatorLoading(true);
      setAggregatorError(null);
      setAggregator(null);

      try {
        const result = await getDashboardAggregate(params);
        setAggregator(result);
      } catch (err) {
        setAggregatorError(
          err instanceof Error ? err.message : "Aggregator request failed",
        );
        setAggregator(null);
      } finally {
        setAggregatorLoading(false);
      }
    },
    [runStrategy],
  );

  return {
    aggregator,
    aggregatorLoading,
    aggregatorError,
    strategy,
    simulation,
    comparison,
    safetyCar,
    rainStrategy,
    monteCarlo,
    raceOutcome,
    loading: strategyLoading || aggregatorLoading,
    error: strategyError || aggregatorError,
    run,
  };
}
