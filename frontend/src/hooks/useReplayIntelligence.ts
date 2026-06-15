import { useEffect, useState } from "react";

import { getReplayIntelligence, type ReplayIntelligence } from "@/lib/api";

export function useReplayIntelligence(lap: number, totalLaps: number) {
  const [data, setData] = useState<ReplayIntelligence | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getReplayIntelligence(lap, totalLaps);
        setData(result);
      } catch {
        setData(null);
      }
    }

    load();
  }, [lap, totalLaps]);

  return data;
}
