import type { StrategyData, ComparisonData } from "@/types/strategy";
import type {
  MonteCarloResponse,
  RaceOutcomeResponse,
  HistoricalComparisonResponse,
  DriverProfile,
  TeamDNA,
  LearningAnalysis,
} from "@/lib/api";

interface Props {
  strategy: StrategyData;
  comparison: ComparisonData;
  monteCarlo: MonteCarloResponse | null;
  outcome: RaceOutcomeResponse | null;
  historical: HistoricalComparisonResponse | null;
  driver: DriverProfile | null;
  team: TeamDNA | null;
  learning: LearningAnalysis | null;
}

export function AIStrategyCore({
  strategy,
  comparison,
  monteCarlo,
  outcome,
  historical,
  driver,
  team,
  learning,
}: Props) {
  // Logic for rejecting alternatives
  const alternatives = comparison.strategies.filter((s) => !s.is_recommended);
  const bestAlternative = alternatives[0];

  return (
    <section className="space-y-4 border border-[#00D2FF]/30 bg-[#111118] p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#00D2FF] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00D2FF]">
            AI Strategy Core Engine
          </span>
        </div>
        <span className="font-mono text-[12px] text-[#9CA3AF]">
          Confidence: {comparison.confidence}%
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Primary Reasoning */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-[#F9FAFB]">
              Recommended: {comparison.recommended_strategy}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#9CA3AF]">
              {strategy.reasoning.pit_window_analysis}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase text-[#00D2FF]">
              Selection Logic
            </h4>
            <div className="border-l-2 border-[#10B981] bg-[#10B981]/5 p-3 text-[13px] text-[#E5E7EB]">
              {strategy.engine_briefing.race_engineer_briefing.split("\n")[0]}
            </div>
            {bestAlternative && (
              <div className="border-l-2 border-[#EF4444] bg-[#EF4444]/5 p-3 text-[13px] text-[#9CA3AF]">
                Rejected {bestAlternative.name}: Advantage delta of{" "}
                {bestAlternative.advantage} creates unmanaged risk in{" "}
                {comparison.strategy_risk} conditions.
              </div>
            )}
          </div>
        </div>

        {/* Intelligence Signals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0A0A0F] p-3 border border-[#1F1F2E]">
            <div className="text-[10px] uppercase text-[#9CA3AF]">
              Success Prob
            </div>
            <div className="mt-1 font-mono text-xl text-[#10B981]">
              {monteCarlo?.win_probability ??
                outcome?.podium_probability ??
                "--"}
              %
            </div>
          </div>
          <div className="bg-[#0A0A0F] p-3 border border-[#1F1F2E]">
            <div className="text-[10px] uppercase text-[#9CA3AF]">
              Hist. Similarity
            </div>
            <div className="mt-1 font-mono text-xl text-[#00D2FF]">
              {historical?.similarity ?? "--"}%
            </div>
          </div>
          <div className="bg-[#0A0A0F] p-3 border border-[#1F1F2E]">
            <div className="text-[10px] uppercase text-[#9CA3AF]">
              Driver Bias
            </div>
            <div className="mt-1 font-mono text-[13px] text-[#F9FAFB]">
              {driver?.aggression && driver.aggression > 70
                ? "Aggressive"
                : "Calculated"}
            </div>
          </div>
          <div className="bg-[#0A0A0F] p-3 border border-[#1F1F2E]">
            <div className="text-[10px] uppercase text-[#9CA3AF]">Team DNA</div>
            <div className="mt-1 font-mono text-[13px] text-[#F9FAFB]">
              {team?.risk_tolerance && team.risk_tolerance > 60
                ? "Risk-Taker"
                : "Conservative"}
            </div>
          </div>
        </div>
      </div>

      {/* Deep Context */}
      <div className="mt-4 grid gap-4 border-t border-[#1F1F2E] pt-4 md:grid-cols-3">
        <div className="space-y-1">
          <span className="text-[10px] uppercase text-[#9CA3AF]">
            Historical Evidence
          </span>
          <p className="text-[12px] text-[#E5E7EB]">
            {historical?.recommendation ??
              "No historical parallel found for this specific compound delta."}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase text-[#9CA3AF]">
            Learning Engine
          </span>
          <p className="text-[12px] text-[#E5E7EB]">
            Based on {learning?.cases ?? 0} similar race scenarios, success rate
            for {learning?.recommended ?? "current"} is{" "}
            {learning?.success_rate ?? 0}%.
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase text-[#9CA3AF]">
            Risk Attribution
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {strategy.engine_briefing.strategic_risks.map((risk) => (
              <span
                key={risk}
                className="bg-[#EF4444]/10 border border-[#EF4444]/20 px-2 py-0.5 text-[9px] text-[#EF4444] uppercase"
              >
                {risk}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
