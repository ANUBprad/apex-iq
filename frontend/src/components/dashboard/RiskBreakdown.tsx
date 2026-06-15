import type { ComparisonData } from "@/types/strategy";
import { GemMeter } from "@/components/ui/GemMeter";
import { cn } from "@/lib/utils";

interface RiskBreakdownProps {
  comparison: ComparisonData;
  trafficDetail?: string;
}

const RISK_ROWS: {
  key: keyof ComparisonData["risk_breakdown"];
  label: string;
  hint?: (comparison: ComparisonData) => string;
}[] = [
  { key: "traffic_risk", label: "Traffic Risk" },
  { key: "weather_risk", label: "Weather Risk" },
  { key: "fuel_risk", label: "Fuel Risk" },
  { key: "tyre_deg_risk", label: "Tyre Deg Risk" },
];

function overallSeverity(score: number, label: string) {
  if (label.toUpperCase() === "HIGH" || score >= 70) return "text-[#EF4444]";
  if (label.toUpperCase() === "MEDIUM" || score >= 35) return "text-[#F59E0B]";
  return "text-[#10B981]";
}

export function RiskBreakdown({
  comparison,
  trafficDetail,
}: RiskBreakdownProps) {
  const { risk_breakdown: risks, risk_score, strategy_risk } = comparison;

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Risk Breakdown
      </header>

      <div className="mt-4 space-y-3">
        {RISK_ROWS.map(({ key, label }) => {
          const value = risks[key];
          const hint = key === "traffic_risk" ? trafficDetail : undefined;
          return (
            <div
              key={key}
              className="group grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[#1F1F2E] pb-3 last:border-0"
              title={hint}
            >
              <div className="text-[13px] text-[#E5E7EB]">{label}</div>
              <GemMeter
                value={value}
                variant="risk"
                showValue
                pulse={value > 60}
                className="justify-end"
              />
            </div>
          );
        })}
      </div>

      <footer
        className={cn(
          "mt-4 border-t border-[#1F1F2E] pt-3 font-mono text-[14px] tabular-nums",
          overallSeverity(risk_score, strategy_risk),
        )}
      >
        Overall: {strategy_risk} ({risk_score}%)
      </footer>
    </section>
  );
}
