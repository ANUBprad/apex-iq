import { useEffect, useState } from "react";
import { getAIStrategyCore, type AIStrategyCoreResponse } from "@/lib/api";

export function useAIStrategyCore(payload: Record<string, unknown> | null) {
  const [data, setData] = useState<AIStrategyCoreResponse | null>(null);
  useEffect(() => {
    async function load() {
      try {
        if (!payload) {
          setData(null);
          return;
        }

        const result = await getAIStrategyCore(payload);
        setData(result);
      } catch {
        setData(null);
      }
    }
    void load();
  }, [payload]);

  return data;
}
