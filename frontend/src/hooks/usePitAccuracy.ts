import { useEffect, useState } from "react";

import { getPitAccuracy, type PitAccuracyResponse } from "@/lib/api";

export function usePitAccuracy(circuit: string, predictedLap: number) {
  const [data, setData] = useState<PitAccuracyResponse | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const result = await getPitAccuracy(circuit, predictedLap);

        setData(result);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [circuit, predictedLap]);

  return {
    data,
    loading,
  };
}
