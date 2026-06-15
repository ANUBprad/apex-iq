import { useEffect, useState } from "react";
import {
  getHistoricalComparison,
  type HistoricalComparisonResponse,
} from "@/lib/api";

export function useHistoricalComparison(circuit: string, strategy: string) {
  const [data, setData] = useState<HistoricalComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!strategy) return;

    async function load() {
      setLoading(true);

      try {
        const result = await getHistoricalComparison(circuit, strategy);
        setData(result);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [circuit, strategy]);

  return { data, loading };
}
