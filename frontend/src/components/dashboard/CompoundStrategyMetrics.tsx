import type { ComparisonData } from "@/types/strategy";

interface CompoundStrategyMetricsProps {
  compoundStrategies: ComparisonData["compound_strategies"];
}

export function CompoundStrategyMetrics({
  compoundStrategies,
}: CompoundStrategyMetricsProps) {
  const top = compoundStrategies.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {top.map((row) => (
        <div
          key={row.strategy}
          className="border border-[#1F1F2E] bg-[#0A0A0F] p-3"
        >
          <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
            #{row.ranking} Compound
          </div>
          <div className="mt-1 font-mono text-[13px] text-[#F9FAFB]">
            {row.strategy}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[12px] tabular-nums text-[#9CA3AF]">
            <span>{row.pit_stops} stops</span>
            <span className="text-[#00D2FF]">{row.projected_race_time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
