import { useEffect, useState } from "react";
import { getLearningAnalysis, type LearningAnalysis } from "@/lib/api";

export function useStrategyLearning(circuit: string, tyre: string) {
  const [data, setData] = useState<LearningAnalysis | null>(null);
  useEffect(() => {
    async function load() {
      try {
        const result = await getLearningAnalysis(circuit, tyre);
        setData(result);
      } catch {
        setData(null);
      }
    }
    load();
  }, [circuit, tyre]);

  return data;
}
