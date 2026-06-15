import type { MonteCarloResponse } from "@/lib/api";

interface Props {
  monteCarlo: MonteCarloResponse;
}

export function MonteCarloCard({ monteCarlo }: Props) {
  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Monte Carlo Simulator
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Win Probability
          </div>

          <div className="mt-1 font-mono text-[#10B981] text-lg">
            {monteCarlo.win_probability}%
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Podium Chance
          </div>

          <div className="mt-1 font-mono text-[#00D2FF] text-lg">
            {monteCarlo.podium_probability}%
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Average Finish
          </div>

          <div className="mt-1 font-mono text-[#F59E0B] text-lg">
            P{monteCarlo.average_finish}
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">Range</div>

          <div className="mt-1 font-mono text-[#F9FAFB]">
            P{monteCarlo.best_case}
            {" → "}P{monteCarlo.worst_case}
          </div>
        </div>
      </div>

      <div className="mt-4 text-[12px] text-[#9CA3AF]">
        Based on {monteCarlo.simulations} simulated races
      </div>
    </section>
  );
}
