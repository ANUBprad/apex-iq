const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export interface SimulationRunRequest {
  circuit_id: string;
  driver_id: string;
  compound: string;
  tyre_age: number;
  laps_remaining: number;
  gap_ahead?: number;
  gap_behind?: number;
  base_position?: number;
  iterations?: number;
}

export interface SimulationRunResponse {
  job_id: string;
  status: string;
}

export interface SimulationResultData {
  win_prob: number;
  podium_prob: number;
  avg_finish: number;
  best_case: number;
  worst_case: number;
  iteration_count: number;
  execution_time_ms: number;
}

export interface SimulationJobStatusResponse {
  job_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  result: SimulationResultData | null;
  error_message: string | null;
}

export async function runSimulation(
  params: SimulationRunRequest,
): Promise<SimulationRunResponse> {
  const res = await fetch(`${API_BASE}/api/v2/simulations/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Simulation run error [${res.status}]`);
  return res.json();
}

export async function getSimulationJob(
  jobId: string,
): Promise<SimulationJobStatusResponse> {
  const res = await fetch(`${API_BASE}/api/v2/simulations/${jobId}`);
  if (!res.ok) throw new Error(`Simulation job status error [${res.status}]`);
  return res.json();
}
