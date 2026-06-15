import { usePitAccuracy } from "@/hooks/usePitAccuracy";

interface Props {
  circuit: string;
  predictedLap: number;
}

export function PitWindowAccuracy({ circuit, predictedLap }: Props) {
  const { data, loading } = usePitAccuracy(circuit, predictedLap);

  if (loading) {
    return (
      <section className="border border-[#1F1F2E] bg-[#111118] p-5">
        Loading...
      </section>
    );
  }

  if (!data) return null;

  const historicalAverageLabel =
    data.historical_average == null
      ? "No archive"
      : `L${data.historical_average}`;
  const differenceLabel =
    data.difference == null ? "Awaiting data" : `${data.difference} laps`;

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        Pit Window Accuracy
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">Predicted</div>

          <div className="mt-2 font-mono text-[#00D2FF] text-lg">
            L{data.predicted_lap}
          </div>
        </div>

        <div className="border border-[#1F1F2E] p-3">
          <div className="text-[10px] uppercase text-[#9CA3AF]">
            Historical Avg
          </div>

          <div className="mt-2 font-mono text-[#10B981] text-lg">
            {historicalAverageLabel}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[12px]">
          <span>Accuracy</span>
          <span>{data.accuracy}%</span>
        </div>

        <div className="mt-2 h-2 bg-[#1F1F2E]">
          <div
            className="h-full bg-[#00D2FF]"
            style={{
              width: `${data.accuracy}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-4 border border-[#1F1F2E] p-3">
        <div className="text-[10px] uppercase text-[#9CA3AF]">Difference</div>

        <div className="mt-2 font-mono text-[#F9FAFB]">{differenceLabel}</div>
      </div>

      {data.message && (
        <div className="mt-4 text-[12px] text-[#9CA3AF]">{data.message}</div>
      )}
    </section>
  );
}
