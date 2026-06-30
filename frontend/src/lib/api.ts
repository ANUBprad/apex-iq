const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_KEY = import.meta.env.VITE_API_KEY || "";

async function fetchApi<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `API ${res.status}: ${endpoint}${text ? ` - ${text}` : ""}`,
    );
  }
  return res.json();
}

export interface DashboardAggregateResponse {
  circuit_id: string;
  recommendation: string;
  confidence: number;
  confidence_weights: { source: string; weight: number; value: number }[];
  pit_window: number | null;
  risk_level: string;
  historical_success_rate: number;
  memory_success_rate: number;
  memory_match_count: number;
  win_probability: number;
  win_probability_ml: number;
  podium_probability_ml: number;
  top5_probability_ml: number;
  prediction_explanation: {
    prediction: number;
    factors: { name: string; friendly_name: string; impact: number }[];
    explanation_type: string;
  };
  reasoning: { source: string; detail: string; impact: string }[];
  driver: { id: string; name: string; aggression: number; consistency: number };
  team: { id: string; name: string; risk_tolerance: number };
  strategy: {
    action: string;
    optimal_lap: number;
    confidence: number;
    reasoning: string;
  };
  simulation: {
    win_prob: number;
    podium_prob: number;
    avg_finish: number;
    distribution: { position: number; frequency: number }[];
    best_case: number;
    worst_case: number;
  };
  history: {
    similarity: number;
    historical_strategy: string;
    success_rate: number;
  };
  status: string;
}

export interface SimulationRunRequest {
  circuit_id?: string;
  driver_id?: string;
  compound: string;
  tyre_age: number;
  laps_remaining: number;
  base_position: number;
  gap_ahead?: number;
  gap_behind?: number;
  iterations?: number;
  degradation_rate?: number;
  weather_factor?: number;
  fuel_load?: number;
}

export interface SimulationJobResponse {
  job_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  result: {
    win_prob: number;
    podium_prob: number;
    avg_finish: number;
    best_case: number;
    worst_case: number;
    iteration_count: number;
    execution_time_ms: number;
  } | null;
  error_message: string | null;
}

export interface V3QueryRequest {
  query: string;
  circuit: string;
  total_laps?: number;
  weather?: string;
  include_explainability?: boolean;
}

export interface V3QueryResponse {
  status: string;
  recommendation: Record<string, unknown>;
  confidence: Record<string, unknown>;
  trust_score: Record<string, unknown>;
  explanation: Record<string, unknown>;
  memory_id: string | null;
  errors: string[];
}

export interface V3HealthResponse {
  status: string;
  rag_document_count: number;
  memory_entry_count: number;
  available_sources: string[];
}

export interface StrategyInput {
  compound: string;
  tyre_age: number;
  circuit: string;
  gap_ahead: number;
  gap_behind: number;
  track_temp?: number;
  air_temp?: number;
  rain_probability?: number;
  weather?: string;
  fuel_load?: number;
  fuel_burn_rate?: number;
  laps_remaining: number;
}

export interface StrategyResponse {
  action: string;
  confidence: number;
  reasoning: string;
  engine_briefing: string;
  fuel_delta: number;
  fuel_needed: number;
  fuel_status: string;
  traffic_status: string;
  traffic_risk: string;
  optimal_pit_lap: number;
  pit_window_score: number;
  pit_window_analysis: string;
}

export interface SimulationResponse {
  stay_out_loss: number;
  pit_loss: number;
  undercut_gain: number;
  undercut_possible: boolean;
}

export interface StrategyComparisonItem {
  compound: string;
  action: string;
  confidence: number;
  reasoning: string;
  optimal_pit_lap: number;
  avg_finish?: number;
  win_prob?: number;
  podium_prob?: number;
}

export interface PositionDistributionItem {
  position: number;
  frequency: number;
}

export interface MonteCarloResponse {
  win_probability: number;
  podium_probability: number;
  average_finish: number;
  best_case: number;
  worst_case: number;
  simulations: number;
  position_distribution?: PositionDistributionItem[];
}

export interface RaceOutcomeResponse {
  projected_finish: string;
  podium_probability: number;
  overtake_probability: number;
  pit_risk: number;
  championship_points: number;
}

export interface RainStrategyResponse {
  rain_probability: number;
  expected_lap: number;
  crossover_lap: number;
  recommended_compound: string;
  confidence: number;
}

export interface SafetyCarResponse {
  pit_now_gain: number;
  pit_under_sc_gain: number;
  delta: number;
  recommendation: string;
  confidence: number;
}

export interface DriverProfileResponse {
  name: string;
  team: string | null;
  aggression: number;
  tyre_management: number;
  overtaking: number;
  wet_weather: number;
}

export interface TeamResponse {
  name: string;
  aggression: number;
  undercut_bias: number;
  risk_tolerance: number;
  tyre_focus: number;
  weather_adaptability: number;
}

export interface HistoricalComparisonResponse {
  circuit: string;
  strategy: string;
  historical_strategy: string;
  historical_races: number;
  historical_wins: number;
  success_rate: number;
  similarity: number;
  average_finish: number | null;
  recommendation: string;
}

export interface PitAccuracyResponse {
  circuit: string;
  predicted_lap: number;
  historical_average: number | null;
  difference: number | null;
  accuracy: number;
}

export interface ReplayIntelligenceResponse {
  lap: number;
  recommendation: string;
  insight: string;
  undercut_probability: number;
  traffic_risk: string;
}

export interface LearningResponse {
  cases: number;
  success_rate: number;
  recommended: string;
}

export interface ScenarioAnalysisResponse {
  scenario: string;
  recommendation: string;
  advantage: number;
  confidence: number;
  reasoning: string;
}

export interface V3MetricsResponse {
  rag_documents_indexed: number;
  memory_entries: number;
  agents_available: number;
  pipeline_depth: number;
}

export interface V3MemoryEntry {
  id: string;
  query: string;
  circuit: string;
  recommendation: Record<string, unknown>;
  confidence: number;
  timestamp: string;
}

export interface V3CircuitMemoryResponse {
  circuit: string;
  entries: V3MemoryEntry[];
}

export interface HistoricalRace {
  race_name?: string;
  circuit: string;
  season: number;
  winner?: string;
  events?: { lap: number; type: string; description: string }[];
  winning_strategy?: string;
  pit_stop_lap?: number;
  safety_cars?: number;
  weather?: string;
  total_laps?: number;
  average_pace?: number;
  strategy_success_score?: number;
}

// ─── V2 Endpoints ──────────────────────────────────────────────────────────

export async function getDashboardAggregate(params: {
  circuit_id: string;
  driver_id: string;
  compound: string;
  tyre_age: number;
  laps_remaining: number;
  current_position?: number;
  iterations?: number;
}): Promise<DashboardAggregateResponse> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  return fetchApi(`/api/v2/dashboard/session-summary?${qs}`);
}

export async function runSimulationJob(
  params: SimulationRunRequest,
): Promise<SimulationJobResponse> {
  return fetchApi("/api/v2/simulations/run", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getSimulationJob(
  jobId: string,
): Promise<SimulationJobResponse> {
  return fetchApi(`/api/v2/simulations/${jobId}`);
}

// ─── V3 Intelligence Endpoints ─────────────────────────────────────────────

export async function v3Query(
  payload: V3QueryRequest,
): Promise<V3QueryResponse> {
  return fetchApi("/api/v3/intelligence/query", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function v3Recommend(payload: {
  circuit: string;
  total_laps?: number;
  weather?: string;
  include_explainability?: boolean;
}): Promise<V3QueryResponse> {
  return fetchApi("/api/v3/intelligence/recommend", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function v3Health(): Promise<V3HealthResponse> {
  return fetchApi("/api/v3/intelligence/health");
}

export async function v3Metrics(): Promise<V3MetricsResponse> {
  return fetchApi("/api/v3/intelligence/metrics");
}

export async function v3MemoryRecall(
  query: string,
  circuit?: string,
): Promise<Record<string, unknown>> {
  const qs = new URLSearchParams({ query });
  if (circuit) qs.set("circuit", circuit);
  return fetchApi(`/api/v3/intelligence/memory/recall?${qs}`);
}

export async function v3CircuitMemory(
  circuit: string,
): Promise<V3CircuitMemoryResponse> {
  return fetchApi(`/api/v3/intelligence/memory/${encodeURIComponent(circuit)}`);
}

// ─── V1 Strategy & Simulation Endpoints ────────────────────────────────────

export async function getStrategy(
  input: StrategyInput,
): Promise<StrategyResponse> {
  return fetchApi("/strategy", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getSimulation(
  input: StrategyInput,
): Promise<SimulationResponse> {
  return fetchApi("/simulate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getStrategyComparison(
  input: StrategyInput,
): Promise<Record<string, unknown>> {
  return fetchApi("/strategy-comparison", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getMonteCarlo(
  input: StrategyInput,
): Promise<MonteCarloResponse> {
  return fetchApi("/monte-carlo", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getRaceOutcome(
  input: StrategyInput,
): Promise<RaceOutcomeResponse> {
  return fetchApi("/race-outcome", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getRainStrategy(
  input: StrategyInput,
): Promise<RainStrategyResponse> {
  return fetchApi("/rain-strategy", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getSafetyCarAnalysis(
  input: StrategyInput,
): Promise<SafetyCarResponse> {
  return fetchApi("/safety-car-analysis", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ─── V1 Data Retrieval Endpoints ───────────────────────────────────────────

export async function getHistorical(
  circuit: string,
): Promise<HistoricalRace[]> {
  return fetchApi(`/historical/${encodeURIComponent(circuit)}`);
}

export async function getHistoricalComparison(
  circuit: string,
  strategy: string,
): Promise<HistoricalComparisonResponse> {
  return fetchApi(
    `/historical-comparison/${encodeURIComponent(circuit)}/${encodeURIComponent(strategy)}`,
  );
}

export async function getPitAccuracy(
  circuit: string,
  lap: number,
): Promise<PitAccuracyResponse> {
  return fetchApi(`/pit-accuracy/${encodeURIComponent(circuit)}/${lap}`);
}

export async function getDriverProfile(
  name: string,
): Promise<DriverProfileResponse> {
  return fetchApi(`/driver/${encodeURIComponent(name)}`);
}

export async function getTeamProfile(team: string): Promise<TeamResponse> {
  return fetchApi(`/team/${encodeURIComponent(team)}`);
}

export async function getReplayIntelligence(
  lap: number,
  totalLaps: number,
): Promise<ReplayIntelligenceResponse> {
  return fetchApi(`/replay-intelligence/${lap}/${totalLaps}`);
}

export async function getScenarioAnalysis(payload: {
  scenario: string;
  compound: string;
  tyre_age: number;
  circuit: string;
  gap_ahead: number;
  gap_behind: number;
}): Promise<ScenarioAnalysisResponse> {
  return fetchApi("/scenario-analysis", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getLearningCases(
  circuit: string,
  tyre: string,
): Promise<LearningResponse> {
  return fetchApi(
    `/learning/${encodeURIComponent(circuit)}/${encodeURIComponent(tyre)}`,
  );
}

// ─── System Endpoints ──────────────────────────────────────────────────

export interface SystemHealthResponse {
  status: string;
  version: string;
  uptime: number;
  endpoints: number;
}

export async function getSystemHealth(): Promise<SystemHealthResponse> {
  const data = await fetchApi<MetricsResponse>("/metrics");
  return {
    status: data.uptime_seconds > 0 ? "healthy" : "degraded",
    version: data.version,
    uptime: data.uptime_seconds,
    endpoints: data.endpoints.length,
  };
}

export interface MemoryEntry {
  id: string;
  confidence: string;
  agent: string;
  context_type: string;
  content: string;
  timestamp: string;
  access_count: number;
}

export interface MemoryListResponse {
  memories: MemoryEntry[];
}

export async function getMemoryEntries(): Promise<MemoryListResponse> {
  return fetchApi<MemoryListResponse>("/api/v3/intelligence/memory");
}

export interface MetricsResponse {
  uptime_seconds: number;
  version: string;
  build: string;
  python_version: string;
  endpoints: string[];
  memory_mb: number | null;
}

export async function getMetrics(): Promise<MetricsResponse> {
  return fetchApi("/metrics");
}

// ─── Data Endpoints ─────────────────────────────────────────────────────

export interface RaceOrderDriver {
  position: number;
  name: string;
  gap: string;
  lap: number;
}

export interface RaceOrderResponse {
  drivers: RaceOrderDriver[];
}

export async function getRaceOrder(): Promise<RaceOrderResponse> {
  return fetchApi("/race-order");
}

export interface CircuitData {
  name: string;
  flag: string;
  pitLoss: number;
  deg: string;
  degRate: number;
  laps: number;
  sectors: number[];
}

export async function getCircuits(): Promise<CircuitData[]> {
  return fetchApi("/circuits");
}

export interface CompoundData {
  id: string;
  color: string;
  label: string;
  shortLabel: string;
  degRate: number;
  gripBase: number;
  stintWindow: number[];
  description: string;
}

export async function getCompounds(): Promise<CompoundData[]> {
  return fetchApi("/compounds");
}

export interface DegradationPoint {
  lap: number;
  grip: number;
}

export async function getDegradation(
  compound?: string,
): Promise<DegradationPoint[]> {
  return fetchApi(`/degradation/${compound || "MEDIUM"}`);
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  circuit: string;
  type: string;
  date: string;
  summary: string;
  source: string;
}

export async function getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
  return fetchApi("/knowledge/articles");
}

export interface StatusResponse {
  api: string;
  version: string;
  build: string;
  memory: number | null;
  rag_available: boolean;
}

export interface PipelineComponent {
  label: string;
  value: number;
  desc: string;
  color: string;
}

export interface PipelineHealthResponse {
  components: PipelineComponent[];
}

export async function getPipelineHealth(): Promise<PipelineHealthResponse> {
  return fetchApi("/pipeline-health");
}

export async function getStatus(): Promise<StatusResponse> {
  return fetchApi("/status");
}
