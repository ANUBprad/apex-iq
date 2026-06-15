import type {
  SimulationApiResponse,
  StrategyApiResponse,
  StrategyComparisonApiResponse,
} from "@/lib/api";
import type {
  ComparisonData,
  EngineBriefing,
  PitWindowData,
  SimulationData,
  StrategyData,
  StrategyReasoning,
} from "@/types/strategy";

function extractWeatherImpact(reasoning: string): string {
  const match = reasoning.match(/Weather:\s*([^.]+)/i);
  return match?.[1]?.trim() ?? reasoning;
}

function formatPitWindowAnalysis(strategy: StrategyApiResponse): string {
  const points = strategy.pit_window_analysis ?? [];
  if (points.length === 0) {
    return `Optimal pit lap L${strategy.optimal_pit_lap} (score ${strategy.pit_window_score})`;
  }

  const window = points
    .slice(0, 5)
    .map((point) => `L${point.lap}: ${point.score}`)
    .join(" · ");

  return `Optimal L${strategy.optimal_pit_lap} · ${window}`;
}

function mapEngineBriefing(strategy: StrategyApiResponse): EngineBriefing {
  const notes = strategy.engine_briefing
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        line !== "RACE ENGINEER BRIEFING" &&
        !line.startsWith("Recommended Action:") &&
        !line.startsWith("Confidence:"),
    );

  const strategicRisks: string[] = [];
  if (strategy.traffic_risk) {
    strategicRisks.push(
      `${strategy.traffic_status} — ${strategy.traffic_risk} traffic risk`,
    );
  }
  if (strategy.fuel_status === "FUEL SAVING REQUIRED") {
    strategicRisks.push("Fuel saving required until race end");
  }

  return {
    race_engineer_briefing: notes.join("\n"),
    strategic_risks: strategicRisks,
    operational_notes: notes,
    recommended_action: strategy.action,
  };
}

function mapReasoning(
  strategy: StrategyApiResponse,
  simulation: SimulationApiResponse | null,
): StrategyReasoning {
  return {
    stay_loss: simulation?.stay_out_loss ?? 0,
    pit_loss: simulation?.pit_loss ?? 0,
    undercut_gain: simulation?.undercut_gain ?? 0,
    weather_impact: extractWeatherImpact(strategy.reasoning),
    traffic_impact: `${strategy.traffic_status} — ${strategy.traffic_risk} risk`,
    fuel_analysis: `${strategy.fuel_status} (${strategy.fuel_delta}kg delta)`,
    pit_window_analysis: formatPitWindowAnalysis(strategy),
  };
}

function formatRaceTime(seconds: number): string {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function mapPitWindow(strategy: StrategyApiResponse): PitWindowData {
  const points = strategy.pit_window_analysis ?? [];
  const laps = points.map((point) => point.lap);

  return {
    optimal_lap: strategy.optimal_pit_lap,
    window_start: laps.length
      ? Math.min(...laps)
      : Math.max(1, strategy.optimal_pit_lap - 2),
    window_end: laps.length ? Math.max(...laps) : strategy.optimal_pit_lap + 2,
    points,
  };
}

export function mapStrategy(
  strategy: StrategyApiResponse,
  simulation: SimulationApiResponse | null,
): StrategyData {
  return {
    reasoning: mapReasoning(strategy, simulation),
    engine_briefing: mapEngineBriefing(strategy),
    pit_window: mapPitWindow(strategy),
  };
}

export function mapComparison(
  comparison: StrategyComparisonApiResponse,
): ComparisonData {
  const sortedCompounds = [...comparison.compound_strategies].sort(
    (a, b) => a.race_time - b.race_time,
  );
  const orderedStrategies = [...comparison.strategies].sort(
    (a, b) => a.race_time - b.race_time,
  );
  const fastest = orderedStrategies[0]?.race_time ?? 0;
  const tyreDegRisk = Math.max(
    0,
    comparison.risk_score -
      comparison.traffic_risk -
      comparison.weather_risk -
      comparison.fuel_risk,
  );

  return {
    recommended_strategy: comparison.recommended,
    confidence: comparison.strategy_confidence,
    expected_advantage: `${comparison.expected_advantage}s`,
    risk_score: comparison.risk_score,
    strategy_risk: comparison.strategy_risk,
    compound_strategies: sortedCompounds.map((row, index) => ({
      strategy: row.strategy,
      pit_stops: row.pit_stops,
      projected_race_time: formatRaceTime(row.race_time),
      ranking: index + 1,
    })),
    risk_breakdown: {
      traffic_risk: comparison.traffic_risk,
      weather_risk: comparison.weather_risk,
      fuel_risk: comparison.fuel_risk,
      tyre_deg_risk: tyreDegRisk,
    },
    strategies: orderedStrategies.map((row, index) => {
      const delta = row.race_time - fastest;
      return {
        name: row.name,
        pit_stops: row.pit_stops,
        race_time: formatRaceTime(row.race_time),
        risk: row.risk,
        ranking: index + 1,
        advantage:
          index === 0
            ? "BASELINE"
            : `${delta > 0 ? "-" : "+"}${Math.abs(delta).toFixed(2)}s`,
        is_recommended: row.name === comparison.recommended,
      };
    }),
  };
}

export function mapSimulation(
  simulation: SimulationApiResponse,
): SimulationData {
  return {
    stay_out_loss: simulation.stay_out_loss,
    pit_loss: simulation.pit_loss,
    undercut_gain: simulation.undercut_gain,
    undercut_possible: simulation.undercut_possible,
  };
}
