import type { RaceOutcomeResponse } from "@/lib/api";

interface Props {
  outcome: RaceOutcomeResponse;
}

export function RaceOutcomePredictor({ outcome }: Props) {
  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Race Outcome Predictor
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Projected Finish
          </div>

          <div className="mt-1 font-mono text-xl text-[#10B981]">
            {outcome.projected_finish}
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Podium Chance
          </div>

          <div className="mt-1 font-mono text-[#00D2FF]">
            {outcome.podium_probability}%
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Overtake Probability
          </div>

          <div className="mt-1 font-mono text-[#F59E0B]">
            {outcome.overtake_probability}%
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">Pit Risk</div>

          <div className="mt-1 font-mono text-[#EF4444]">
            {outcome.pit_risk}%
          </div>
        </div>
      </div>

      <div className="mt-4 border border-[#10B981]/20 bg-[#10B981]/5 p-4">
        <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
          Championship Impact
        </div>

        <div className="mt-1 font-mono text-[#10B981]">
          +{outcome.championship_points} pts
        </div>
      </div>
    </section>
  );
}
