const API_BASE = "http://127.0.0.1:8000";

export interface StrategyInput {
  compound: string;
  tyre_age: number;
  circuit: string;
  gap_ahead: number;
  gap_behind: number;
  fuel_load?: number;
  track_temp?: number;
  air_temp?: number;
  laps_remaining?: number;
  weather?: string;
  safety_car_prob?: number;
  rain_prob?: number;
}

export interface StrategyResult {
  action: string;
  confidence: number;
  reasoning: string;
  estimated_gain?: number;
  estimated_loss?: number;
  risk_level?: string;
  pit_window?: string;
  explanation?: string;
  comparisons?: StrategyComparison[];
}

export interface StrategyComparison {
  option: string;
  expected_gain: number;
  expected_loss: number;
  risk: number;
  confidence: number;
}

export interface SimulationResult {
  stay_out_loss: number;
  pit_loss: number;
  undercut_gain: number;
  undercut_possible: boolean;
}

export async function getStrategy(payload: StrategyInput): Promise<StrategyResult> {
  const res = await fetch(`${API_BASE}/strategy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Strategy API error: ${res.status}`);
  return res.json();
}

export async function simulate(payload: StrategyInput): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Simulation API error: ${res.status}`);
  return res.json();
}
