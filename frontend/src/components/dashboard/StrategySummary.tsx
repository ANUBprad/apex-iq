import { cn } from "@/lib/utils";
import type { ComparisonData } from "@/types/strategy";
import { GemMeter } from "@/components/ui/GemMeter";

interface StrategySummaryProps {
  comparison: ComparisonData;
}

function severityTint(confidence: number) {
  if (confidence >= 75) return "bg-[#10B981]/6 border-[#10B981]/20";
  if (confidence >= 55) return "bg-[#F59E0B]/6 border-[#F59E0B]/20";
  return "bg-[#EF4444]/6 border-[#EF4444]/20";
}

function buildActionLine(comparison: ComparisonData): string {
  const compound = comparison.compound_strategies[0]?.strategy;
  const base = comparison.recommended_strategy.toUpperCase();
  if (compound) return `${base} • ${compound}`;
  return base;
}

export function StrategySummary({ comparison }: StrategySummaryProps) {
  console.log("StrategySummary", comparison);

  const riskPct = comparison.risk_score;

  return (
    <section
      className={cn(
        "border border-[#1F1F2E] bg-[#111118] p-5",
        "border-l-[2px] border-l-[#00D2FF]",
        severityTint(comparison.confidence),
      )}
    >
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Recommended Strategy
      </header>

      <h2 className="mt-3 font-mono text-[18px] font-semibold leading-tight tracking-tight text-[#F9FAFB]">
        {buildActionLine(comparison)}
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <GemMeter
          value={comparison.confidence}
          variant="confidence"
          label="Confidence"
        />
        <GemMeter
          value={riskPct}
          variant="risk"
          label={`Risk: ${comparison.strategy_risk}`}
          pulse={riskPct > 60}
        />
      </div>

      <div className="mt-4 grid gap-3 border-t border-[#1F1F2E] pt-4 sm:grid-cols-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
            Expected Advantage
          </div>
          <div className="mt-1 font-mono text-[16px] tabular-nums text-[#10B981]">
            {comparison.expected_advantage.startsWith("-") ||
            comparison.expected_advantage.startsWith("+")
              ? comparison.expected_advantage
              : `+${comparison.expected_advantage}`}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
            Race-Winning Path
          </div>
          <div className="mt-1 font-mono text-[16px] tabular-nums text-[#E5E7EB]">
            {comparison.confidence}% probability
          </div>
        </div>
      </div>
    </section>
  );
}
