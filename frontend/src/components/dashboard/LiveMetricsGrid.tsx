import { motion } from "framer-motion";
import type { Strategy, SimulationData } from "@/hooks/useStrategy";

const STATUS_COLORS = {
  good: "#10B981",
  ok: "#0EA5E9",
  warn: "#F59E0B",
  crit: "#EF4444",
} as const;

interface MetricItem {
  label: string;
  unit: string;
  getValue: (s: Strategy | null, sim: SimulationData | null) => { value: string; status: keyof typeof STATUS_COLORS } | null;
}

const METRICS: MetricItem[] = [
  {
    label: "Est. Gain",
    unit: "s",
    getValue: (_, sim) => sim ? { value: sim.undercutGain.toFixed(2), status: sim.undercutGain > 0 ? "good" : "warn" } : null,
  },
  {
    label: "Pit Loss",
    unit: "s",
    getValue: (_, sim) => sim ? { value: sim.pitLoss.toFixed(1), status: sim.pitLoss > 25 ? "crit" : sim.pitLoss > 20 ? "warn" : "ok" } : null,
  },
  {
    label: "Stay Out Loss",
    unit: "s",
    getValue: (_, sim) => sim ? { value: sim.stayOutLoss.toFixed(2), status: sim.stayOutLoss > 3 ? "warn" : "ok" } : null,
  },
  {
    label: "Undercut",
    unit: "",
    getValue: (_, sim) => sim ? { value: sim.undercutPossible ? "OPEN" : "CLOSED", status: sim.undercutPossible ? "good" : "crit" } : null,
  },
  {
    label: "Confidence",
    unit: "%",
    getValue: (s) => s ? { value: Math.round(s.confidence * 100).toString(), status: s.confidence > 0.7 ? "good" : s.confidence > 0.4 ? "ok" : "warn" } : null,
  },
  {
    label: "Risk Level",
    unit: "",
    getValue: (s) => s ? { value: s.riskLevel, status: s.riskLevel === "LOW" ? "good" : s.riskLevel === "MEDIUM" ? "warn" : "crit" } : null,
  },
  {
    label: "Pit Window",
    unit: "",
    getValue: (s) => s ? { value: s.pitWindow === "Not available" ? "N/A" : s.pitWindow, status: s.pitWindow !== "Not available" ? "ok" : "warn" } : null,
  },
  {
    label: "Action",
    unit: "",
    getValue: (s) => s ? { value: s.action.length > 10 ? s.action.slice(0, 10) : s.action, status: s.confidence > 0.6 ? "good" : "warn" } : null,
  },
];

export function LiveMetricsGrid({ strategy, simulation }: { strategy: Strategy | null; simulation: SimulationData | null }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {METRICS.map((m, i) => {
        const result = m.getValue(strategy, simulation);
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">{m.label}</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: result ? STATUS_COLORS[result.status] : "#D1D5DB" }} />
            </div>
            {result ? (
              <motion.div
                key={result.value}
                initial={{ scale: 1.03, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-xl font-semibold text-[#1A1D29] tabular-nums leading-none"
              >
                {result.value}
                {m.unit && <span className="text-[11px] text-[#9CA3AF] ml-1 font-inter font-medium">{m.unit}</span>}
              </motion.div>
            ) : (
              <div className="font-mono text-xl font-semibold text-[#D1D5DB] leading-none">
                --
                {m.unit && <span className="text-[11px] text-[#E5E7EB] ml-1 font-inter font-medium">{m.unit}</span>}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
