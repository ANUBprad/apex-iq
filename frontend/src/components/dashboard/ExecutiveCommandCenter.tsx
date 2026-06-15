import type { ComparisonData } from "@/types/strategy";
import type { RaceOutcomeResponse } from "@/lib/api";
import type { MonteCarloResponse } from "@/lib/api";

interface Props {
  comparison: ComparisonData;
  outcome: RaceOutcomeResponse;
  monteCarlo: MonteCarloResponse;
}

export function ExecutiveCommandCenter({
  comparison,
  outcome,
  monteCarlo,
}: Props) {
  return (
    <section className="border border-[#00D2FF]/30 bg-[#111118] p-6">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#00D2FF]">
        Executive Command Center
      </header>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <div className="text-[10px] uppercase text-[#9CA3AF]">Strategy</div>

          <div className="mt-1 font-mono text-[#10B981]">
            {comparison.recommended_strategy}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-[#9CA3AF]">Confidence</div>

          <div className="mt-1 font-mono text-[#00D2FF]">
            {comparison.confidence}%
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-[#9CA3AF]">Advantage</div>

          <div className="mt-1 font-mono text-[#10B981]">
            {comparison.expected_advantage}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-[#9CA3AF]">Finish</div>

          <div className="mt-1 font-mono text-[#F59E0B]">
            {outcome.projected_finish}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase text-[#9CA3AF]">Win Chance</div>

          <div className="mt-1 font-mono text-[#EF4444]">
            {monteCarlo.win_probability}%
          </div>
        </div>
      </div>
    </section>
  );
}
