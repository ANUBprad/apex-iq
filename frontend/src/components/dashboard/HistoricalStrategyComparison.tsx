import { useHistoricalComparison } from "@/hooks/useHistoricalComparison";

interface Props {
  circuit: string;
  strategy: string;
}

export function HistoricalStrategyComparison({ circuit, strategy }: Props) {
  const { data, loading } = useHistoricalComparison(circuit, strategy);

  if (loading) {
    return (
      <section className="border border-[#1F1F2E] bg-[#111118] p-5">
        Loading...
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        Historical Strategy Comparison
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">Current</div>

          <div className="mt-2 font-mono text-[#00D2FF]">{strategy}</div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Historical Winner
          </div>

          <div className="mt-2 font-mono text-[#10B981]">
            {data.historical_strategy}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[12px]">
          <span>Similarity</span>
          <span>{data.similarity}%</span>
        </div>

        <div className="mt-2 h-2 bg-[#1F1F2E]">
          <div
            className="h-full bg-[#00D2FF]"
            style={{
              width: `${data.similarity}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Success Rate
          </div>

          <div className="mt-2 font-mono text-[#F9FAFB]">
            {data.success_rate}%
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Historical Wins
          </div>

          <div className="mt-2 font-mono text-[#F9FAFB]">
            {data.historical_wins}
          </div>
        </div>
      </div>
      {data.recommendation && (
        <div className="mt-4 border-l-2 border-[#00D2FF] bg-[#0A0A0F] px-3 py-2 text-[12px] text-[#9CA3AF]">
          {data.recommendation}
        </div>
      )}
    </section>
  );
}
