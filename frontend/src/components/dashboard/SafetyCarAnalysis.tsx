import type { SafetyCarResponse } from "@/lib/api";

interface Props {
  analysis: SafetyCarResponse;
}

export function SafetyCarAnalysis({ analysis }: Props) {
  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Safety Car Analysis
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">Pit Now</div>

          <div className="mt-1 font-mono text-[#10B981]">
            +{analysis.pit_now_gain}s
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Pit Under SC
          </div>

          <div className="mt-1 font-mono text-[#00D2FF]">
            +{analysis.pit_under_sc_gain}s
          </div>
        </div>
      </div>

      <div className="mt-4 border border-[#1F1F2E] p-3">
        <div className="text-[10px] uppercase text-[#9CA3AF]">Delta</div>

        <div className="mt-1 font-mono text-[#F59E0B]">+{analysis.delta}s</div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase text-[#9CA3AF]">
          Recommendation
        </div>

        <div className="mt-1 font-mono text-[#F9FAFB]">
          {analysis.recommendation}
        </div>
      </div>

      <div className="mt-3 text-[12px] text-[#9CA3AF]">
        Confidence: {analysis.confidence}%
      </div>
    </section>
  );
}
