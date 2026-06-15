import type {
  StrategyReasoning,
  EngineBriefing,
  ComparisonData,
} from "@/types/strategy";

interface Props {
  reasoning: StrategyReasoning;
  briefing: EngineBriefing;
  comparison: ComparisonData;
}

export function StrategyExplainability({
  reasoning,
  briefing,
  comparison,
}: Props) {
  const positives: string[] = [];
  const warnings: string[] = [];

  if (reasoning.undercut_gain > 0) {
    positives.push(
      `Undercut gain available (+${reasoning.undercut_gain.toFixed(2)}s)`,
    );
  }

  if (
    reasoning.fuel_analysis.includes("PUSH") ||
    reasoning.fuel_analysis.includes("push")
  ) {
    positives.push("Fuel reserves allow aggressive push laps");
  }

  if (comparison.confidence >= 70) {
    positives.push(`High strategy confidence (${comparison.confidence}%)`);
  }

  if (
    reasoning.traffic_impact.includes("HIGH") ||
    reasoning.traffic_impact.includes("Heavy")
  ) {
    warnings.push("Heavy traffic expected after pit stop");
  }

  if (comparison.strategy_risk !== "LOW") {
    warnings.push(`${comparison.strategy_risk} execution risk`);
  }

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Strategy Explainability
      </header>

      <div className="mt-4 space-y-3">
        {positives.map((item) => (
          <div key={item} className="flex items-start gap-3 text-[13px]">
            <span className="text-[#10B981]">✓</span>
            <span className="text-[#F9FAFB]">{item}</span>
          </div>
        ))}

        {warnings.map((item) => (
          <div key={item} className="flex items-start gap-3 text-[13px]">
            <span className="text-[#F59E0B]">⚠</span>
            <span className="text-[#F9FAFB]">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
