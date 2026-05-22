import { motion, AnimatePresence } from "framer-motion";
import type { Strategy } from "@/hooks/useStrategy";

const RISK_COLORS: Record<string, string> = {
  LOW: "text-[#10B981]",
  MEDIUM: "text-[#F59E0B]",
  HIGH: "text-[#EF4444]",
};

const RISK_BG: Record<string, string> = {
  LOW: "bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.2)]",
  MEDIUM: "bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.2)]",
  HIGH: "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)]",
};

function AnimatedValue({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="font-mono text-lg font-semibold text-[#1A1D29] tabular-nums"
    >
      {value > 0 ? "+" : ""}{value.toFixed(1)}{suffix && <span className="text-[#6B7280] ml-0.5 text-[13px]">{suffix}</span>}
    </motion.span>
  );
}

export function StrategyDecisionCard({ strategy, error }: { strategy: Strategy | null; error: string | null }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
        <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">Current Race Decision</span>
      </div>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 text-center"
          >
            <div className="font-inter text-lg font-semibold text-[#F59E0B]">
              Engine Offline
            </div>
            <div className="mt-2 text-[13px] text-[#9CA3AF]">
              {error}
            </div>
          </motion.div>
        ) : !strategy ? (
          <motion.div
            key="awaiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8 text-center"
          >
            <div className="font-inter text-xl font-semibold text-[#9CA3AF] animate-pulse">
              Awaiting Input
            </div>
            <div className="mt-2 text-[13px] text-[#9CA3AF]">
              Run strategy analysis to receive recommendation
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={strategy.action}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Primary action */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="px-4 py-2 bg-[#0EA5E9] rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h1 className="font-inter font-bold text-3xl md:text-4xl text-white tracking-tight leading-none">
                  {strategy.action}
                </h1>
              </div>
              <div className="font-mono font-semibold text-2xl text-[#10B981] tabular-nums">
                {Math.round(strategy.confidence * 100)}%
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">Confidence</span>
                <span className="font-mono text-[12px] font-semibold text-[#1A1D29] tabular-nums">{Math.round(strategy.confidence * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#F1F3F7] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strategy.confidence * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-[#0EA5E9] rounded-full"
                />
              </div>
            </div>

            {/* Result metrics */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="border border-[#E5E7EB] rounded-md p-2.5 bg-[#F8F9FB]">
                <div className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-1">Est. Gain</div>
                <AnimatedValue value={strategy.estimatedGain} suffix="s" />
              </div>
              <div className="border border-[#E5E7EB] rounded-md p-2.5 bg-[#F8F9FB]">
                <div className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-1">Est. Loss</div>
                <AnimatedValue value={strategy.estimatedLoss} suffix="s" />
              </div>
              <div className={`border rounded-md p-2.5 ${RISK_BG[strategy.riskLevel] || "border-[#E5E7EB] bg-[#F8F9FB]"}`}>
                <div className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-1">Risk Level</div>
                <div className={`font-inter text-lg font-bold ${RISK_COLORS[strategy.riskLevel] || "text-[#1A1D29]"}`}>
                  {strategy.riskLevel}
                </div>
              </div>
              <div className="border border-[#E5E7EB] rounded-md p-2.5 bg-[#F8F9FB]">
                <div className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-1">Pit Window</div>
                <div className="font-mono text-sm font-semibold text-[#0EA5E9] tabular-nums">
                  {strategy.pitWindow}
                </div>
              </div>
            </div>

            {/* Explanation */}
            <p className="mt-3 text-[14px] text-[#6B7280] leading-[1.6]">{strategy.explanation}</p>

            {/* Strategy comparison table */}
            {strategy.comparisons && strategy.comparisons.length > 0 && (
              <div className="mt-5">
                <div className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-[0.5px] mb-2">Strategy Comparison</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {strategy.comparisons.map((c, i) => {
                    const isActive = c.option === strategy.action || (strategy.action.includes("UNDERCUT") && c.option === "UNDERCUT");
                    return (
                      <motion.div
                        key={c.option}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
                        className={`rounded-md border p-2.5 ${isActive ? "border-[#0EA5E9] bg-[rgba(14,165,233,0.05)]" : "border-[#E5E7EB] bg-[#F8F9FB]"}`}
                      >
                        <div className={`text-[10px] font-semibold uppercase tracking-[0.5px] mb-2 ${isActive ? "text-[#0EA5E9]" : "text-[#6B7280]"}`}>
                          {c.option}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[11px] text-[#6B7280]">Gain</span>
                            <span className="font-mono text-[11px] font-semibold text-[#10B981] tabular-nums">
                              {c.expectedGain > 0 ? "+" : ""}{c.expectedGain.toFixed(1)}s
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[11px] text-[#6B7280]">Loss</span>
                            <span className="font-mono text-[11px] font-semibold text-[#EF4444] tabular-nums">
                              {c.expectedLoss.toFixed(1)}s
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[11px] text-[#6B7280]">Risk</span>
                            <span className="font-mono text-[11px] font-semibold text-[#1A1D29] tabular-nums">
                              {Math.round(c.risk * 100)}%
                            </span>
                          </div>
                          <div className="mt-1">
                            <div className="h-[3px] rounded-full bg-[#F1F3F7] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${c.confidence * 100}%` }}
                                transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                                className={`h-full rounded-full ${isActive ? "bg-[#0EA5E9]" : "bg-[#D1D5DB]"}`}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
