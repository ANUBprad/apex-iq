import type { ComparisonData } from "@/types/strategy";

interface Props {
  comparison: ComparisonData;
}

function rankColor(rank: number) {
  if (rank === 1) return "text-[#10B981]";
  if (rank === 2) return "text-[#00D2FF]";
  if (rank === 3) return "text-[#F59E0B]";
  return "text-[#9CA3AF]";
}

export function StrategyBattleCenter({ comparison }: Props) {
  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Strategy Battle Center
      </header>

      <div className="mt-4 space-y-2">
        {comparison.strategies.map((strategy) => (
          <div
            key={strategy.name}
            className={`flex items-center justify-between border p-3 ${
              strategy.is_recommended
                ? "border-[#10B981]/30 bg-[#10B981]/5"
                : "border-[#1F1F2E]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`font-mono text-lg font-semibold ${rankColor(
                  strategy.ranking,
                )}`}
              >
                #{strategy.ranking}
              </span>

              <div>
                <div className="font-medium text-[#F9FAFB]">
                  {strategy.name}
                </div>

                <div className="text-[11px] text-[#9CA3AF]">
                  {strategy.pit_stops} stop
                  {strategy.pit_stops !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-[#00D2FF]">
                {strategy.race_time}
              </div>

              <div className="text-[11px] text-[#9CA3AF]">
                {strategy.advantage}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border border-[#10B981]/20 bg-[#10B981]/5 p-4">
        <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
          Winner
        </div>

        <div className="mt-1 font-mono text-lg text-[#10B981]">
          {comparison.recommended_strategy}
        </div>
      </div>
    </section>
  );
}
