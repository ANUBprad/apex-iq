import { useStrategyLearning } from "@/hooks/useStrategyLearning";

interface Props {
  circuit: string;
  tyre: string;
}

export function StrategyLearningCenter({ circuit, tyre }: Props) {
  const data = useStrategyLearning(circuit, tyre);
  if (!data) return null;

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        Strategy Learning Engine
      </header>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Similar Cases
          </div>

          <div className="mt-2 font-mono text-lg text-[#00D2FF]">
            {data.cases}
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Success Rate
          </div>

          <div className="mt-2 font-mono text-lg text-[#10B981]">
            {data.success_rate}%
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Recommendation
          </div>

          <div className="mt-2 font-mono text-sm text-[#F9FAFB]">
            {data.recommended}
          </div>
        </div>
      </div>
    </section>
  );
}
