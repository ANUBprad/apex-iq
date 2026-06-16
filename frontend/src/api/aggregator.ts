const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export interface DriverSummary {
  id: string;
  name: string;
  aggression: number;
  consistency: number;
}

export interface TeamSummary {
  id: string;
  name: string;
  risk_tolerance: number;
}

export interface StrategySummary {
  action: string;
  optimal_lap: number;
  confidence: number;
  reasoning: string;
}

export interface SimulationSummary {
  win_prob: number;
  podium_prob: number;
  avg_finish: number;
}

export interface HistorySummary {
  similarity: number;
  historical_strategy: string;
  success_rate: number;
}

export interface DashboardAggregateResponse {
  driver: DriverSummary;
  team: TeamSummary;
  strategy: StrategySummary;
  simulation?: SimulationSummary | null;
  history: HistorySummary;
  status: string;
}

export interface DashboardAggregateParams {
  circuit_id: string;
  driver_id: string;
  compound: string;
  tyre_age: number;
  laps_remaining: number;
}

export async function getDashboardAggregate(
  params: DashboardAggregateParams,
): Promise<DashboardAggregateResponse> {
  const searchParams = new URLSearchParams({
    circuit_id: params.circuit_id,
    driver_id: params.driver_id,
    compound: params.compound,
    tyre_age: String(params.tyre_age),
    laps_remaining: String(params.laps_remaining),
  });

  const res = await fetch(
    `${API_BASE}/api/v2/dashboard/session-summary?${searchParams}`,
  );
  if (!res.ok) {
    throw new Error(`Dashboard aggregator error [${res.status}]`);
  }
  return res.json();
}
