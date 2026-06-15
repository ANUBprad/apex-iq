import { useMemo } from "react";

export function useReplayRace() {
  return useMemo(
    () => ({
      race_name: "Monaco GP 2024",
      total_laps: 78,
      events: [
        { lap: 1, type: "START", description: "Race Start" },
        { lap: 28, type: "PIT", description: "Pit Stop" },
        { lap: 45, type: "SC", description: "Safety Car Deployed" },
        { lap: 78, type: "FINISH", description: "Race Finish" },
      ],
    }),
    [],
  );
}
