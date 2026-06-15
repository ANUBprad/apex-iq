export interface RaceEvent {
  lap: number;
  type: string;
  description: string;
}

export interface ReplayRace {
  race_name: string;
  season: number;
  events: RaceEvent[];
}
