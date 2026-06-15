import type { ComparisonData, StrategyReasoning } from "@/types/strategy";

interface AIStrategicInsightsProps {
  comparison: ComparisonData;
  reasoning: StrategyReasoning;
}

export function AIStrategicInsights({
  comparison,
  reasoning,
}: AIStrategicInsightsProps) {
  const insights = [
    `Recommended strategy remains ${comparison.recommended_strategy}.`,
    `Expected race advantage: ${comparison.expected_advantage}.`,
    `Traffic outlook: ${reasoning.traffic_impact}.`,
    `Fuel analysis: ${reasoning.fuel_analysis}.`,
    `Pit window: ${reasoning.pit_window_analysis}.`,
  ];

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        AI Strategic Insights
      </header>

      <div className="mt-4 space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="border-l-2 border-[#00D2FF] pl-3">
            <div className="text-[13px] text-[#E5E7EB]">{insight}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[#1F1F2E] pt-4">
        <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
          Strategy Confidence
        </div>

        <div className="mt-2 h-2 bg-[#1F1F2E] overflow-hidden">
          <div
            className="h-full bg-[#00D2FF]"
            style={{
              width: `${comparison.confidence}%`,
            }}
          />
        </div>

        <div className="mt-2 font-mono text-[12px] text-[#00D2FF]">
          {comparison.confidence}% confidence
        </div>
      </div>
    </section>
  );
}
