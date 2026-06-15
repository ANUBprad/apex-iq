import type { RainStrategyResponse } from "@/lib/api";

interface Props {
  rain: RainStrategyResponse;
}

export function RainStrategyCard({ rain }: Props) {
  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Rain Strategy
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Rain Probability
          </div>

          <div className="mt-1 font-mono text-[#00D2FF]">
            {rain.rain_probability}%
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Expected Arrival
          </div>

          <div className="mt-1 font-mono text-[#F9FAFB]">
            Lap {rain.expected_lap}
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Crossover Point
          </div>

          <div className="mt-1 font-mono text-[#F59E0B]">
            Lap {rain.crossover_lap}
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Recommended Tyre
          </div>

          <div className="mt-1 font-mono text-[#10B981]">
            {rain.recommended_compound}
          </div>
        </div>
      </div>

      <div className="mt-4 text-[12px] text-[#9CA3AF]">
        Confidence: {rain.confidence}%
      </div>
    </section>
  );
}
