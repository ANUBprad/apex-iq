import { useReplayIntelligence } from "@/hooks/useReplayIntelligence";

interface Props {
  lap: number;
  totalLaps: number;
}

export function ReplayInsights({ lap, totalLaps }: Props) {
  const data = useReplayIntelligence(lap, totalLaps);
  if (!data) return null;

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        Replay Intelligence
      </header>

      <div className="mt-3 font-mono text-[#00D2FF]">Lap {lap}</div>

      <div className="mt-4 border-l-2 border-[#00D2FF] pl-3">
        <div className="text-[13px] text-[#F9FAFB]">{data.insight}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Recommendation
          </div>

          <div className="mt-2 font-mono text-[#00D2FF]">
            {data.recommendation}
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Traffic Risk
          </div>

          <div className="mt-2 font-mono text-[#F9FAFB]">
            {data.traffic_risk}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[12px]">
          <span>Undercut Probability</span>
          <span>{data.undercut_probability}%</span>
        </div>

        <div className="mt-2 h-2 bg-[#1F1F2E]">
          <div
            className="h-full bg-[#00D2FF]"
            style={{ width: `${data.undercut_probability}%` }}
          />
        </div>
      </div>
    </section>
  );
}
