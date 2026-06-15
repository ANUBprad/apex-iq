import type { StrategyReasoning as StrategyReasoningData } from "@/types/strategy";

interface StrategyReasoningProps {
  reasoning: StrategyReasoningData;
}

const FIELDS: {
  key: keyof StrategyReasoningData;
  label: string;
  format?: "seconds";
}[] = [
  { key: "stay_loss", label: "Stay Loss", format: "seconds" },
  { key: "pit_loss", label: "Pit Loss", format: "seconds" },
  { key: "undercut_gain", label: "Undercut Gain", format: "seconds" },
  { key: "weather_impact", label: "Weather Impact" },
  { key: "traffic_impact", label: "Traffic Impact" },
  { key: "fuel_analysis", label: "Fuel Analysis" },
  { key: "pit_window_analysis", label: "Pit Window Analysis" },
];

function formatValue(value: string | number, format?: "seconds") {
  if (format === "seconds" && typeof value === "number") {
    return `${value.toFixed(2)}s`;
  }
  return String(value);
}

export function StrategyReasoning({ reasoning }: StrategyReasoningProps) {
  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Strategy Reasoning
      </header>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {FIELDS.map(({ key, label, format }) => (
          <div
            key={key}
            className="border border-[#1F1F2E] bg-[#0A0A0F] px-3 py-3"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
              {label}
            </div>
            <div className="mt-1 font-mono text-[14px] tabular-nums leading-relaxed text-[#E5E7EB]">
              {formatValue(reasoning[key], format)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
