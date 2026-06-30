import { useQuery, useMutation } from "@tanstack/react-query";
import {
  runSimulationJob,
  getSimulationJob,
  getDashboardAggregate,
  v3Query,
  v3Health,
  v3MemoryRecall,
  v3CircuitMemory,
  v3Metrics,
  getHistorical,
  getHistoricalComparison,
  getDriverProfile,
  getTeamProfile,
  getPitAccuracy,
  getMonteCarlo,
  getRaceOutcome,
  getRainStrategy,
  getSafetyCarAnalysis,
  getStrategy,
  getSimulation,
  getStrategyComparison,
  getReplayIntelligence,
  getScenarioAnalysis,
  getLearningCases,
  getCircuits,
  getCompounds,
  getDegradation,
  getKnowledgeArticles,
  getStatus,
  getMetrics,
  getMemoryEntries,
  getRaceOrder,
  getDrivers,
  getTeams,
  getWeatherOptions,
  type MetricsResponse,
  type CircuitData,
  type RaceOrderResponse,
  type CompoundData,
  type DegradationPoint,
  type KnowledgeArticle,
  type StatusResponse,
  type SimulationRunRequest,
  type DashboardAggregateResponse,
  type V3QueryRequest,
  type V3QueryResponse,
  type V3HealthResponse,
  type V3MetricsResponse,
  type V3CircuitMemoryResponse,
  type StrategyInput,
  type StrategyResponse,
  type SimulationResponse,
  type MonteCarloResponse,
  type RaceOutcomeResponse,
  type RainStrategyResponse,
  type SafetyCarResponse,
  type HistoricalComparisonResponse,
  type PitAccuracyResponse,
  type DriverProfileResponse,
  type TeamResponse,
  type ReplayIntelligenceResponse,
  type ScenarioAnalysisResponse,
  type LearningResponse,
  type HistoricalRace,
  type MemoryListResponse,
  type DriverData,
  type TeamData,
  getPipelineHealth,
  type PipelineHealthResponse,
  getSystemHealth,
  type SystemHealthResponse,
  getTelemetryLive,
  getTelemetryHistory,
  type TelemetrySnapshot,
  aiEngineerChat,
  type AIEngineerRequest,
  type AIEngineerResponse,
} from "@/lib/api";

// ─── V2 Dashboard ──────────────────────────────────────────────────────────

export function useDashboardQuery(params: {
  circuit_id: string;
  driver_id: string;
  compound: string;
  tyre_age: number;
  laps_remaining: number;
  current_position?: number;
}) {
  return useQuery<DashboardAggregateResponse>({
    queryKey: ["dashboard", params],
    queryFn: () => getDashboardAggregate(params),
    retry: 2,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

// ─── V2 Simulations ────────────────────────────────────────────────────────

export function useSimulationMutation() {
  return useMutation({
    mutationFn: (params: SimulationRunRequest) => runSimulationJob(params),
  });
}

export function useSimulationJobQuery(jobId: string | null) {
  return useQuery({
    queryKey: ["simulation-job", jobId],
    queryFn: () => getSimulationJob(jobId!),
    enabled: !!jobId,
    retry: 3,
    refetchInterval: (query) =>
      query.state.data?.status === "completed" ? false : 2000,
  });
}

// ─── V3 Intelligence ───────────────────────────────────────────────────────

export function useV3Query() {
  return useMutation<V3QueryResponse, Error, V3QueryRequest>({
    mutationFn: (payload) => v3Query(payload),
  });
}

export function useV3HealthQuery() {
  return useQuery<V3HealthResponse>({
    queryKey: ["v3-health"],
    queryFn: () => v3Health(),
    retry: 2,
    staleTime: 60_000,
  });
}

export function useV3MetricsQuery() {
  return useQuery<V3MetricsResponse>({
    queryKey: ["v3-metrics"],
    queryFn: () => v3Metrics(),
    retry: 2,
    staleTime: 60_000,
  });
}

export function useMemoryRecallQuery(query: string, circuit?: string) {
  return useQuery({
    queryKey: ["memory-recall", query, circuit],
    queryFn: () => v3MemoryRecall(query, circuit),
    enabled: !!query,
    retry: 1,
  });
}

export function useCircuitMemoryQuery(circuit: string) {
  return useQuery<V3CircuitMemoryResponse>({
    queryKey: ["circuit-memory", circuit],
    queryFn: () => v3CircuitMemory(circuit),
    enabled: !!circuit,
    retry: 1,
    staleTime: 300_000,
  });
}

export function useMemoryQuery() {
  const query = useQuery<MemoryListResponse>({
    queryKey: ["memory-entries"],
    queryFn: () => getMemoryEntries(),
    retry: 2,
    staleTime: 30_000,
  });
  return { memories: query.data?.memories ?? [] };
}

// ─── V1 Historical ─────────────────────────────────────────────────────────

export function useHistoricalQuery(circuit: string) {
  return useQuery<HistoricalRace[]>({
    queryKey: ["historical", circuit],
    queryFn: () => getHistorical(circuit),
    enabled: !!circuit,
    retry: 1,
    staleTime: 300_000,
  });
}

export function useHistoricalComparisonQuery(
  circuit: string,
  strategy: string,
) {
  return useQuery<HistoricalComparisonResponse>({
    queryKey: ["historical-comparison", circuit, strategy],
    queryFn: () => getHistoricalComparison(circuit, strategy),
    enabled: !!circuit && !!strategy,
    retry: 1,
    staleTime: 300_000,
  });
}

// ─── V1 Driver & Team ──────────────────────────────────────────────────────

export function useDriverProfileQuery(name: string) {
  return useQuery<DriverProfileResponse>({
    queryKey: ["driver", name],
    queryFn: () => getDriverProfile(name),
    enabled: !!name,
    retry: 1,
    staleTime: 300_000,
  });
}

export function useTeamProfileQuery(team: string) {
  return useQuery<TeamResponse>({
    queryKey: ["team", team],
    queryFn: () => getTeamProfile(team),
    enabled: !!team,
    retry: 1,
    staleTime: 300_000,
  });
}

// ─── V1 Strategy ───────────────────────────────────────────────────────────

export function useStrategyQuery(params: StrategyInput) {
  return useQuery<StrategyResponse>({
    queryKey: ["strategy", params],
    queryFn: () => getStrategy(params),
    retry: 1,
    staleTime: 15_000,
  });
}

export function useStrategyComparisonMutation() {
  return useMutation({
    mutationFn: (input: StrategyInput) => getStrategyComparison(input),
  });
}

export function useMonteCarloMutation() {
  return useMutation<MonteCarloResponse, Error, StrategyInput>({
    mutationFn: (input) => getMonteCarlo(input),
  });
}

export function useRaceOutcomeMutation() {
  return useMutation<RaceOutcomeResponse, Error, StrategyInput>({
    mutationFn: (input) => getRaceOutcome(input),
  });
}

export function useRainStrategyQuery(params: StrategyInput) {
  return useQuery<RainStrategyResponse>({
    queryKey: ["rain-strategy", params],
    queryFn: () => getRainStrategy(params),
    retry: 1,
    staleTime: 30_000,
  });
}

export function useSafetyCarQuery(params: StrategyInput) {
  return useQuery<SafetyCarResponse>({
    queryKey: ["safety-car", params],
    queryFn: () => getSafetyCarAnalysis(params),
    retry: 1,
    staleTime: 30_000,
  });
}

export function useSimulationQuery(params: StrategyInput) {
  return useQuery<SimulationResponse>({
    queryKey: ["simulation", params],
    queryFn: () => getSimulation(params),
    retry: 1,
    staleTime: 15_000,
  });
}

// ─── V1 Analytics ──────────────────────────────────────────────────────────

export function usePitAccuracyQuery(circuit: string, lap: number) {
  return useQuery<PitAccuracyResponse>({
    queryKey: ["pit-accuracy", circuit, lap],
    queryFn: () => getPitAccuracy(circuit, lap),
    enabled: !!circuit && lap > 0,
    retry: 1,
    staleTime: 300_000,
  });
}

export function useReplayIntelligenceQuery(lap: number, totalLaps: number) {
  return useQuery<ReplayIntelligenceResponse>({
    queryKey: ["replay", lap, totalLaps],
    queryFn: () => getReplayIntelligence(lap, totalLaps),
    enabled: lap > 0 && totalLaps > 0,
    retry: 1,
    staleTime: 15_000,
  });
}

// ─── Telemetry Queries ───────────────────────────────────────────────────

export function useTelemetryLiveQuery(enabled = true) {
  return useQuery<TelemetrySnapshot>({
    queryKey: ["telemetry-live"],
    queryFn: () => getTelemetryLive(),
    enabled,
    refetchInterval: 1000,
    retry: 2,
    staleTime: 500,
  });
}

export function useTelemetryHistoryQuery(count = 60, enabled = true) {
  return useQuery<TelemetrySnapshot[]>({
    queryKey: ["telemetry-history", count],
    queryFn: () => getTelemetryHistory(count),
    enabled,
    refetchInterval: 2000,
    retry: 1,
    staleTime: 1000,
  });
}

// ─── AI Engineer ─────────────────────────────────────────────────────────

export function useAIEngineerChat() {
  return useMutation<AIEngineerResponse, Error, AIEngineerRequest>({
    mutationFn: (payload) => aiEngineerChat(payload),
  });
}

export function useLearningQuery(circuit: string, tyre: string) {
  return useQuery<LearningResponse>({
    queryKey: ["learning", circuit, tyre],
    queryFn: () => getLearningCases(circuit, tyre),
    enabled: !!circuit && !!tyre,
    retry: 1,
    staleTime: 300_000,
  });
}

export function useScenarioAnalysisMutation() {
  return useMutation<
    ScenarioAnalysisResponse,
    Error,
    {
      scenario: string;
      compound: string;
      tyre_age: number;
      circuit: string;
      gap_ahead: number;
      gap_behind: number;
    }
  >({
    mutationFn: (payload) => getScenarioAnalysis(payload),
  });
}

// ─── Data Queries ───────────────────────────────────────────────────────

export function useRaceOrderQuery() {
  return useQuery<RaceOrderResponse>({
    queryKey: ["race-order"],
    queryFn: () => getRaceOrder(),
    staleTime: 10_000,
    refetchInterval: 15_000,
    retry: 2,
  });
}

export function useCircuitsQuery() {
  return useQuery<CircuitData[]>({
    queryKey: ["circuits"],
    queryFn: () => getCircuits(),
    staleTime: 600_000,
    retry: 2,
  });
}

export function useCompoundsQuery() {
  return useQuery<CompoundData[]>({
    queryKey: ["compounds"],
    queryFn: () => getCompounds(),
    staleTime: 600_000,
    retry: 2,
  });
}

export function useDegradationQuery(compound?: string) {
  return useQuery<DegradationPoint[]>({
    queryKey: ["degradation", compound],
    queryFn: () => getDegradation(compound),
    staleTime: 300_000,
    retry: 1,
  });
}

export function useKnowledgeArticlesQuery() {
  return useQuery<KnowledgeArticle[]>({
    queryKey: ["knowledge-articles"],
    queryFn: () => getKnowledgeArticles(),
    staleTime: 300_000,
    retry: 2,
  });
}

export function useStatusQuery() {
  return useQuery<StatusResponse>({
    queryKey: ["status"],
    queryFn: () => getStatus(),
    staleTime: 30_000,
    retry: 2,
    refetchInterval: 30_000,
  });
}

export function usePipelineHealthQuery() {
  return useQuery<PipelineHealthResponse>({
    queryKey: ["pipeline-health"],
    queryFn: () => getPipelineHealth(),
    staleTime: 30_000,
    retry: 2,
    refetchInterval: 60000,
  });
}

export function useMetricsQuery() {
  return useQuery<MetricsResponse>({
    queryKey: ["metrics"],
    queryFn: () => getMetrics(),
    staleTime: 30_000,
    retry: 2,
    refetchInterval: 60_000,
  });
}

export function useSystemHealthQuery() {
  return useQuery<SystemHealthResponse>({
    queryKey: ["system-health"],
    queryFn: () => getSystemHealth(),
    staleTime: 30_000,
    retry: 2,
    refetchInterval: 60_000,
  });
}

// ─── Strategy Lab Queries ─────────────────────────────────────────────────

export function useDriversQuery() {
  return useQuery<DriverData[]>({
    queryKey: ["drivers"],
    queryFn: () => getDrivers(),
    staleTime: 600_000,
    retry: 2,
  });
}

export function useTeamsQuery() {
  return useQuery<TeamData[]>({
    queryKey: ["teams"],
    queryFn: () => getTeams(),
    staleTime: 600_000,
    retry: 2,
  });
}

export function useWeatherOptionsQuery() {
  return useQuery<string[]>({
    queryKey: ["weather-options"],
    queryFn: () => getWeatherOptions(),
    staleTime: 600_000,
    retry: 2,
  });
}

export function useMonteCarloQuery(params: StrategyInput, enabled = true) {
  return useQuery<MonteCarloResponse>({
    queryKey: ["monte-carlo", params],
    queryFn: () => getMonteCarlo(params),
    enabled,
    retry: 1,
    staleTime: 15_000,
  });
}

export function useRaceOutcomeQuery(params: StrategyInput, enabled = true) {
  return useQuery<RaceOutcomeResponse>({
    queryKey: ["race-outcome", params],
    queryFn: () => getRaceOutcome(params),
    enabled,
    retry: 1,
    staleTime: 15_000,
  });
}

export function useSafetyCarQueryEnabled(params: StrategyInput, enabled = true) {
  return useQuery<SafetyCarResponse>({
    queryKey: ["safety-car-lab", params],
    queryFn: () => getSafetyCarAnalysis(params),
    enabled,
    retry: 1,
    staleTime: 15_000,
  });
}

export function useSimulationQueryEnabled(params: StrategyInput, enabled = true) {
  return useQuery<SimulationResponse>({
    queryKey: ["simulation-lab", params],
    queryFn: () => getSimulation(params),
    enabled,
    retry: 1,
    staleTime: 15_000,
  });
}
