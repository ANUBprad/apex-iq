import { cn } from "@/lib/utils";
import type { ComparisonData } from "@/types/strategy";
import { riskIndicator } from "@/components/ui/RiskPill";

interface CompoundStrategyTableProps {
  strategies: ComparisonData["strategies"];
}

function rankLabel(rank: number): string {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}

function advantageColor(advantage: string): string {
  if (advantage === "BASELINE") return "text-[#10B981]";
  if (advantage.startsWith("+")) return "text-[#10B981]";
  return "text-[#EF4444]";
}

export function CompoundStrategyTable({
  strategies,
}: CompoundStrategyTableProps) {
  if (strategies.length === 0) {
    return (
      <div className="border border-[#1F1F2E] bg-[#111118] p-6 text-center text-[13px] text-[#9CA3AF]">
        No strategies available.
      </div>
    );
  }

  return (
    <section className="overflow-hidden border border-[#1F1F2E] bg-[#111118]">
      <header className="border-b border-[#1F1F2E] px-5 py-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
          Strategy Comparison
        </span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#1F1F2E] text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
              <th className="px-4 py-2.5 font-medium">Rank</th>
              <th className="px-4 py-2.5 font-medium">Strategy</th>
              <th className="px-4 py-2.5 font-medium">Pit Stops</th>
              <th className="px-4 py-2.5 font-medium">Race Time</th>
              <th className="px-4 py-2.5 font-medium">Advantage</th>
              <th className="px-4 py-2.5 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {strategies.map((row) => (
              <tr
                key={`${row.name}-${row.ranking}`}
                className={cn(
                  "border-b border-[#1F1F2E] transition-colors last:border-0 hover:bg-[#0A0A0F]/80",
                  row.is_recommended && "bg-[#10B981]/6",
                )}
              >
                <td className="px-4 py-3 font-mono text-[12px] tabular-nums text-[#9CA3AF]">
                  {rankLabel(row.ranking)}
                </td>
                <td className="px-4 py-3 font-mono text-[#F9FAFB]">
                  {row.name}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-[#E5E7EB]">
                  {row.pit_stops}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-[#00D2FF]">
                  {row.race_time}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 font-mono tabular-nums",
                    advantageColor(row.advantage),
                  )}
                >
                  {row.advantage}
                </td>
                <td className="px-4 py-3 font-mono text-[12px]">
                  {riskIndicator(row.risk)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
