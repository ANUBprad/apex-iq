export interface StrategyReasoning {
  stay_loss: number;
  pit_loss: number;
  undercut_gain: number;
  weather_impact: string;
  traffic_impact: string;
  fuel_analysis: string;
  pit_window_analysis: string;
}

export interface EngineBriefing {
  race_engineer_briefing: string;
  strategic_risks: string[];
  operational_notes: string[];
  recommended_action: string;
}

export interface PitWindowData {
  optimal_lap: number;
  window_start: number;
  window_end: number;
  points: PitWindowPoint[];
}

export interface StrategyData {
  reasoning: StrategyReasoning;
  engine_briefing: EngineBriefing;
  pit_window: PitWindowData;
}

export interface CompoundStrategy {
  strategy: string;
  pit_stops: number;
  projected_race_time: string;
  ranking: number;
}

export interface RiskBreakdownData {
  traffic_risk: number;
  weather_risk: number;
  fuel_risk: number;
  tyre_deg_risk: number;
}

export interface StrategyOption {
  name: string;
  pit_stops: number;
  race_time: string;
  risk: string;
  ranking: number;
  advantage: string;
  is_recommended: boolean;
}

export interface ComparisonData {
  recommended_strategy: string;
  confidence: number;
  expected_advantage: string;
  risk_score: number;
  strategy_risk: string;
  compound_strategies: CompoundStrategy[];
  risk_breakdown: RiskBreakdownData;
  strategies: StrategyOption[];
}

export interface SimulationData {
  stay_out_loss: number;
  pit_loss: number;
  undercut_gain: number;
  undercut_possible: boolean;
}

export interface PitWindowPoint {
  lap: number;
  score: number;
}
