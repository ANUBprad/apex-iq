import { useState } from "react";
import { STRATEGIES } from "@/lib/apex-data";

export interface Strategy {
  action: string;
  confidence: number;
  reasoning: string;
}

export function useStrategy() {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState(0);

  const run = () => {
    setLoading(true);
    setTimeout(() => {
      setStrategy(STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)]);
      setSeed(Math.random());
      setLoading(false);
    }, 1800);
  };

  return { strategy, loading, run, seed };
}
