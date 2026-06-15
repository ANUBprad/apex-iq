import { useEffect, useState } from "react";
import { getHistoricalRaces, type HistoricalRace } from "@/lib/api";

export function useHistoricalRaces(circuit: string) {
  const [races, setRaces] = useState<HistoricalRace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const data = await getHistoricalRaces(circuit);
        setRaces(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [circuit]);

  return { races, loading };
}
