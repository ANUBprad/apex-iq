import { useAIStrategyCore } from "@/hooks/useAIStrategyCore";

interface Props {
  payload: Record<string, unknown> | null;
}

export function ExecutiveAIStrategy({ payload }: Props) {
  const data = useAIStrategyCore(payload);
  if (!data) return null;
  return (
    <section className="border border-[#00D2FF]/30 bg-[#111118] p-5">
      <header className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        AI Strategy Core
      </header>

      <div className="mt-3 text-2xl font-bold text-[#00D2FF]">
        {data.action}
      </div>

      <div className="mt-2 text-[13px] text-[#E5E7EB]">
        {data.recommended_strategy}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[12px]">
          <span>Confidence</span>
          <span>{data.confidence}%</span>
        </div>

        <div className="mt-2 h-2 bg-[#1F1F2E]">
          <div
            className="h-full bg-[#00D2FF]"
            style={{
              width: `${data.confidence}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {data.reasons.map((reason) => (
          <div
            key={reason}
            className="border-l-2 border-[#00D2FF] pl-3 text-[12px] text-[#9CA3AF]"
          >
            {reason}
          </div>
        ))}
      </div>

      <div className="mt-4 border border-[#1F1F2E] p-3">
        <div className="text-[10px] uppercase text-[#9CA3AF]">Risk</div>

        <div className="mt-1 font-mono text-[#F9FAFB]">{data.risk}</div>
      </div>
    </section>
  );
}
