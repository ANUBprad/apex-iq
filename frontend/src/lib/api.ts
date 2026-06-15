import type { PitWindowPoint } from "@/types/strategy";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ============================================================================
// Input & Response Types
// ============================================================================

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
  fuel_burn_rate?: number;
}

export interface StrategyApiResponse {
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
  pit_window_analysis: PitWindowPoint[];
}

export interface SimulationApiResponse {
  stay_out_loss: number;
  pit_loss: number;
  undercut_gain: number;
  undercut_possible: boolean;
}

export interface StrategyComparisonApiResponse {
  recommended: string;
  expected_advantage: number;
  strategy_confidence: number;
  strategy_risk: string;
  risk_score: number;
  traffic_risk: number;
  weather_risk: number;
  fuel_risk: number;
  analysis: string;
  compound_strategies: {
    strategy: string;
    pit_stops: number;
    race_time: number;
  }[];
  strategies: {
    name: string;
    pit_stops: number;
    race_time: number;
    risk: string;
  }[];
}

export interface HistoricalRace {
  race_name: string;
  circuit: string;
  season: number;
  winner: string;
  winning_strategy: string;
  pit_stop_lap: number;
  safety_cars: number;
  weather: string;
  total_laps: number;
  average_pace: number;
  strategy_success_score: number;
}

export interface HistoricalComparisonResponse {
  circuit?: string;
  strategy?: string;
  historical_strategy: string;
  similarity: number;
  success_rate: number;
  historical_wins: number;
  historical_races?: number;
  average_finish?: number | null;
  recommendation?: string;
}

export interface ScenarioResponse {
  scenario: string;
  recommendation: string;
  advantage: number;
  confidence: number;
  reasoning: string;
}

export interface PitAccuracyResponse {
  predicted_lap: number;
  historical_average: number | null;
  difference: number | null;
  accuracy: number;
  message?: string;
}

export interface SafetyCarResponse {
  pit_now_gain: number;
  pit_under_sc_gain: number;
  delta: number;
  recommendation: string;
  confidence: number;
}

export interface RainStrategyResponse {
  rain_probability: number;
  expected_lap: number;
  crossover_lap: number;
  recommended_compound: string;
  confidence: number;
}

export interface MonteCarloResponse {
  win_probability: number;
  podium_probability: number;
  average_finish: number;
  best_case: number;
  worst_case: number;
  simulations: number;
}

export interface RaceOutcomeResponse {
  projected_finish: string;
  podium_probability: number;
  overtake_probability: number;
  pit_risk: number;
  championship_points: number;
}

export interface DriverProfile {
  name: string;
  team?: string;
  aggression: number;
  tyre_management: number;
  overtake_efficiency: number;
  wet_weather_skill: number;
  consistency: number;
  racecraft: number;
}

export interface TeamDNA {
  name: string;
  aggression: number;
  undercut_bias: number;
  risk_tolerance: number;
  tyre_focus: number;
  weather_adaptability: number;
}

export interface LearningAnalysis {
  cases: number;
  success_rate: number;
  recommended: string;
}

export interface ReplayIntelligence {
  lap: number;
  recommendation: string;
  insight: string;
  undercut_probability: number;
  traffic_risk: string;
}

export interface AIStrategyCoreResponse {
  action: string;
  confidence: number;
  reasons: string[];
  recommended_strategy: string;
  risk: string;
}

// ============================================================================
// Utilities
// ============================================================================

function toApiPayload(input: StrategyInput): Record<string, unknown> {
  const { rain_prob, safety_car_prob, ...rest } = input;
  return {
    ...rest,
    rain_probability: rain_prob ?? 0,
  };
}

async function fetchApi<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: StrategyInput | Record<string, unknown>,
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) {
    throw new Error(`API error [${res.status}]: ${endpoint}`);
  }
  return res.json();
}

// ============================================================================
// Core Strategy APIs
// ============================================================================

export async function getStrategy(
  payload: StrategyInput,
): Promise<StrategyApiResponse> {
  return fetchApi<StrategyApiResponse>(
    "/strategy",
    "POST",
    toApiPayload(payload),
  );
}

export async function getStrategyComparison(
  payload: StrategyInput,
): Promise<StrategyComparisonApiResponse> {
  return fetchApi<StrategyComparisonApiResponse>(
    "/strategy-comparison",
    "POST",
    toApiPayload(payload),
  );
}

export async function simulate(
  payload: StrategyInput,
): Promise<SimulationApiResponse> {
  return fetchApi<SimulationApiResponse>(
    "/simulate",
    "POST",
    toApiPayload(payload),
  );
}

// ============================================================================
// Historical Data
// ============================================================================

export async function getHistoricalRaces(
  circuit: string,
): Promise<HistoricalRace[]> {
  return fetchApi<HistoricalRace[]>(
    `/historical/${encodeURIComponent(circuit)}`,
  );
}

export async function getHistoricalComparison(
  circuit: string,
  strategy: string,
): Promise<HistoricalComparisonResponse> {
  return fetchApi<HistoricalComparisonResponse>(
    `/historical-comparison/${encodeURIComponent(circuit)}/${encodeURIComponent(strategy)}`,
  );
}

// ============================================================================
// Driver & Team Intelligence
// ============================================================================

export async function getDriverProfile(driver: string): Promise<DriverProfile> {
  return fetchApi<DriverProfile>(`/driver/${encodeURIComponent(driver)}`);
}

export async function getTeamDNA(team: string): Promise<TeamDNA> {
  return fetchApi<TeamDNA>(`/team/${encodeURIComponent(team)}`);
}

// ============================================================================
// Pit Stop Analysis
// ============================================================================

export async function getPitAccuracy(
  circuit: string,
  lap: number,
): Promise<PitAccuracyResponse> {
  return fetchApi<PitAccuracyResponse>(
    `/pit-accuracy/${encodeURIComponent(circuit)}/${lap}`,
  );
}

// ============================================================================
// Scenario & Condition Analysis
// ============================================================================

export async function runScenario(
  payload: StrategyInput & { scenario: string },
): Promise<ScenarioResponse> {
  return fetchApi<ScenarioResponse>("/scenario-analysis", "POST", payload);
}

export async function getSafetyCarAnalysis(
  payload: StrategyInput,
): Promise<SafetyCarResponse> {
  return fetchApi<SafetyCarResponse>(
    "/safety-car-analysis",
    "POST",
    toApiPayload(payload),
  );
}

export async function getRainStrategy(
  payload: StrategyInput,
): Promise<RainStrategyResponse> {
  return fetchApi<RainStrategyResponse>(
    "/rain-strategy",
    "POST",
    toApiPayload(payload),
  );
}

// ============================================================================
// Advanced Analytics
// ============================================================================

export async function getMonteCarlo(
  payload: StrategyInput,
): Promise<MonteCarloResponse> {
  return fetchApi<MonteCarloResponse>(
    "/monte-carlo",
    "POST",
    toApiPayload(payload),
  );
}

export async function getRaceOutcome(
  payload: StrategyInput,
): Promise<RaceOutcomeResponse> {
  return fetchApi<RaceOutcomeResponse>(
    "/race-outcome",
    "POST",
    toApiPayload(payload),
  );
}

export async function getAIStrategyCore(
  payload: Record<string, unknown>,
): Promise<AIStrategyCoreResponse> {
  return fetchApi<AIStrategyCoreResponse>("/ai-strategy-core", "POST", payload);
}

// ============================================================================
// Learning & Replay
// ============================================================================

export async function getLearningAnalysis(
  circuit: string,
  tyre: string,
): Promise<LearningAnalysis> {
  return fetchApi<LearningAnalysis>(
    `/learning/${encodeURIComponent(circuit)}/${encodeURIComponent(tyre)}`,
  );
}

export async function getReplayIntelligence(
  lap: number,
  totalLaps: number,
): Promise<ReplayIntelligence> {
  return fetchApi<ReplayIntelligence>(
    `/replay-intelligence/${lap}/${totalLaps}`,
  );
}
