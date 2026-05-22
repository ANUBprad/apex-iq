import { useState, useCallback } from "react";
import { getStrategy, simulate, type StrategyInput, type StrategyResult, type SimulationResult } from "@/lib/api";

export interface Strategy {
  action: string;
  confidence: number;
  reasoning: string;
  estimatedGain: number;
  estimatedLoss: number;
  riskLevel: string;
  pitWindow: string;
  explanation: string;
  comparisons: StrategyComparison[];
}

export interface StrategyComparison {
  option: string;
  expectedGain: number;
  expectedLoss: number;
  risk: number;
  confidence: number;
}

export interface SimulationData {
  stayOutLoss: number;
  pitLoss: number;
  undercutGain: number;
  undercutPossible: boolean;
}

export function useStrategy() {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seed, setSeed] = useState(0);

  const run = useCallback(async (input: StrategyInput) => {
    setLoading(true);
    setError(null);

    try {
      const [strategyRes, simRes] = await Promise.allSettled([
        getStrategy(input),
        simulate(input),
      ]);

      if (strategyRes.status === "fulfilled") {
        const s = strategyRes.value;
        const simData = simRes.status === "fulfilled" ? simRes.value : null;

        const comparisons: StrategyComparison[] = [
          {
            option: "STAY OUT",
            expectedGain: 0,
            expectedLoss: simData?.stay_out_loss ?? 0,
            risk: s.confidence < 0.5 ? 0.7 : 0.3,
            confidence: s.action === "STAY OUT" ? s.confidence : 1 - s.confidence,
          },
          {
            option: "PIT NOW",
            expectedGain: simData ? -(simData.pit_loss) : 0,
            expectedLoss: simData?.pit_loss ?? 0,
            risk: s.confidence < 0.5 ? 0.4 : 0.2,
            confidence: s.action === "PIT NOW" ? s.confidence : 1 - s.confidence,
          },
          {
            option: "UNDERCUT",
            expectedGain: simData?.undercut_gain ?? 0,
            expectedLoss: simData?.pit_loss ?? 0,
            risk: simData?.undercut_possible ? 0.3 : 0.8,
            confidence: s.action.includes("UNDERCUT") ? s.confidence : 0.3,
          },
          {
            option: "OVERCUT",
            expectedGain: simData ? simData.stay_out_loss * 0.3 : 0,
            expectedLoss: simData?.stay_out_loss ?? 0,
            risk: 0.5,
            confidence: s.action === "OVERCUT" ? s.confidence : 0.25,
          },
        ];

        const riskLevel = s.confidence > 0.75 ? "LOW" : s.confidence > 0.5 ? "MEDIUM" : "HIGH";
        const pitWindow = simData?.undercut_possible
          ? `L${input.tyre_age}-L${input.tyre_age + 5}`
          : "Not available";

        setStrategy({
          action: s.action,
          confidence: s.confidence,
          reasoning: s.reasoning,
          estimatedGain: simData?.undercut_gain ?? 0,
          estimatedLoss: simData?.pit_loss ?? 0,
          riskLevel,
          pitWindow,
          explanation: s.reasoning,
          comparisons,
        });

        if (simData) {
          setSimulation({
            stayOutLoss: simData.stay_out_loss,
            pitLoss: simData.pit_loss,
            undercutGain: simData.undercut_gain,
            undercutPossible: simData.undercut_possible,
          });
        }
      } else {
        setError("Strategy engine unavailable. Check backend connection.");
      }
    } catch {
      setError("Strategy engine unavailable. Check backend connection.");
    } finally {
      setSeed(Math.random());
      setLoading(false);
    }
  }, []);

  return { strategy, simulation, loading, error, run, seed };
}
