import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RaceControlPanel } from "@/components/dashboard/RaceControlPanel";
import { StrategySummary } from "@/components/dashboard/StrategySummary";
import { StrategyExplainability } from "@/components/dashboard/StrategyExplainability";
import { CompoundStrategyTable } from "@/components/dashboard/CompoundStrategyTable";
import { CompoundStrategyMetrics } from "@/components/dashboard/CompoundStrategyMetrics";
import { StrategyReasoning } from "@/components/dashboard/StrategyReasoning";
import { TelemetrySection } from "@/components/dashboard/TelemetrySection";
import { AIEngineerPanel } from "@/components/dashboard/AIEngineerPanel";
import { RiskBreakdown } from "@/components/dashboard/RiskBreakdown";
import { PitWindowVisualization } from "@/components/dashboard/PitWindowVisualization";
import { StrategyTimeline } from "@/components/dashboard/StrategyTimeline";
import { CircuitIntelligence } from "@/components/dashboard/CircuitIntelligence";
import { useUnifiedDashboard } from "@/hooks/useUnifiedDashboard";
import type { StrategyInput } from "@/lib/api";
import { CIRCUITS } from "@/lib/apex-data";
import { ScenarioLab } from "@/components/dashboard/ScenarioLab";
import { SafetyCarAnalysis } from "@/components/dashboard/SafetyCarAnalysis";
import { RainStrategyCard } from "@/components/dashboard/RainStrategyCard";
import { MonteCarloCard } from "@/components/dashboard/MonteCarloCard";
import { StrategyBattleCenter } from "@/components/dashboard/StrategyBattleCenter";
import { RaceOutcomePredictor } from "@/components/dashboard/RaceOutcomePredictor";
import { AIStrategicInsights } from "@/components/dashboard/AIStrategicInsights";
import { ExecutiveCommandCenter } from "@/components/dashboard/ExecutiveCommandCenter";
import { HistoricalRaceArchive } from "@/components/dashboard/HistoricalRaceArchive";
import { RaceReplay } from "@/components/dashboard/RaceReplay";
import { useReplayRace } from "@/hooks/useReplayRace";
import { HistoricalStrategyComparison } from "@/components/dashboard/HistoricalStrategyComparison";
import { PitWindowAccuracy } from "@/components/dashboard/PitWindowAccuracy";
import { DriverBehaviourIntelligence } from "@/components/dashboard/DriverBehaviourIntelligence";
import { TeamStrategyDNA } from "@/components/dashboard/TeamStrategyDNA";
import { StrategyLearningCenter } from "@/components/dashboard/StrategyLearningCenter";

import { AIStrategyCore } from "@/components/dashboard/AIStrategyCore";
import { useHistoricalComparison } from "@/hooks/useHistoricalComparison";
import { useStrategyLearning } from "@/hooks/useStrategyLearning";
import type { DriverProfile, TeamDNA } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Strategy Control Room" },
      {
        name: "description",
        content:
          "Live strategy control room — telemetry, AI engineer, and pit window prediction for Formula 1 race weekends.",
      },
    ],
  }),
});

function DashboardPage() {
  const {
    aggregator,
    strategy,
    simulation,
    comparison,
    safetyCar,
    rainStrategy,
    monteCarlo,
    raceOutcome,
    loading,
    error,
    run,
  } = useUnifiedDashboard();
  const [session, setSession] = useState<StrategyInput | null>(null);
  const [replayLap, setReplayLap] = useState(1);

  const handleRun = (input: StrategyInput) => {
    setSession(input);
    run(input);
  };

  const circuit =
    CIRCUITS.find((c) => c.name === (session?.circuit ?? "Monaco")) ??
    CIRCUITS[0];
  const currentLap = session?.tyre_age ?? 12;
  const totalLaps = session?.laps_remaining
    ? currentLap + session.laps_remaining
    : circuit.laps;

  const driverProfile: DriverProfile | null = aggregator?.driver
    ? {
        name: aggregator.driver.name,
        aggression: aggregator.driver.aggression,
        consistency: aggregator.driver.consistency,
        team: aggregator.team?.name ?? "",
        tyre_management: 50,
        overtake_efficiency: 50,
        wet_weather_skill: 50,
        racecraft: 50,
      }
    : null;
  const teamDNA: TeamDNA | null = aggregator?.team
    ? {
        name: aggregator.team.name,
        aggression: 50,
        undercut_bias: 50,
        risk_tolerance: aggregator.team.risk_tolerance,
        tyre_focus: 50,
        weather_adaptability: 50,
      }
    : null;
  const { data: historicalComparison } = useHistoricalComparison(
    session?.circuit ?? "Monaco",
    comparison?.recommended_strategy ?? "",
  );
  const strategyLearning = useStrategyLearning(
    session?.circuit ?? "Monaco",
    session?.compound ?? "MEDIUM",
  );

  const replay = useReplayRace();
  console.log({ strategy, simulation, comparison, aggregator });

  return (
    <div className="dark min-h-screen bg-[#0A0A0F] text-[#F9FAFB]">
      <Navbar />
      <div className="mx-auto max-w-[1800px] px-4 pb-8 pt-16">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 pt-4">
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
              Live Race Session
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#F9FAFB]">
              Strategy Control Room
            </h1>
          </div>
          <div className="flex gap-2">
            <span className="border border-[#1F1F2E] bg-[#111118] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
              FP3
            </span>
            <span className="flex items-center gap-1.5 border border-[#00D2FF]/25 bg-[#00D2FF]/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#00D2FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              Live
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 border border-[#EF4444]/30 bg-[#EF4444]/8 px-4 py-3 text-[13px]">
            {error}
          </div>
        )}

        {loading && !strategy && (
          <div className="mb-4 border border-[#1F1F2E] bg-[#111118] px-4 py-3 text-[13px] text-[#9CA3AF]">
            Running strategy analysis...
          </div>
        )}

        <div className="grid min-h-[700px] h-[calc(100vh-140px)] grid-cols-1 gap-4 xl:grid-cols-[280px_1fr_320px]">
          {/* Left column */}
          <div className="space-y-4 overflow-y-auto">
            <RaceControlPanel onRun={handleRun} loading={loading} />

            <ScenarioLab />

            <CircuitIntelligence
              circuitName={session?.circuit ?? "Monaco"}
              safetyCarProb={session?.safety_car_prob}
              rainProb={session?.rain_prob}
            />

            <HistoricalRaceArchive circuit={session?.circuit ?? "Monaco"} />

            <RaceReplay
              raceName={replay.race_name}
              totalLaps={replay.total_laps}
              events={replay.events}
              currentLap={replayLap}
              setCurrentLap={setReplayLap}
            />

            {comparison && (
              <HistoricalStrategyComparison
                circuit={session?.circuit ?? "Monaco"}
                strategy={comparison.recommended_strategy}
              />
            )}

            {session && (
              <StrategyLearningCenter
                circuit={session.circuit}
                tyre={session.compound}
              />
            )}

            <DriverBehaviourIntelligence driver="Max Verstappen" />

            <TeamStrategyDNA team="Red Bull" />
          </div>

          {/* Center column */}
          <div className="space-y-4 overflow-y-auto pr-0.5">
            {comparison && strategy && (
              <AIStrategyCore
                strategy={strategy}
                comparison={comparison}
                monteCarlo={monteCarlo}
                outcome={raceOutcome}
                historical={historicalComparison}
                driver={driverProfile}
                team={teamDNA}
                learning={strategyLearning}
              />
            )}

            {comparison && raceOutcome && monteCarlo && (
              <ExecutiveCommandCenter
                comparison={comparison}
                outcome={raceOutcome}
                monteCarlo={monteCarlo}
              />
            )}

            {comparison && <StrategySummary comparison={comparison} />}
            {safetyCar && <SafetyCarAnalysis analysis={safetyCar} />}
            {rainStrategy && <RainStrategyCard rain={rainStrategy} />}
            {monteCarlo && <MonteCarloCard monteCarlo={monteCarlo} />}
            {raceOutcome && <RaceOutcomePredictor outcome={raceOutcome} />}

            {strategy && comparison && (
              <StrategyExplainability
                reasoning={strategy.reasoning}
                briefing={strategy.engine_briefing}
                comparison={comparison}
              />
            )}

            {strategy && comparison && (
              <div className="grid gap-4 lg:grid-cols-2">
                <PitWindowVisualization
                  pitWindow={strategy.pit_window}
                  currentLap={currentLap}
                  totalLaps={totalLaps}
                />
                {strategy && (
                  <PitWindowAccuracy
                    circuit={session?.circuit ?? "Monaco"}
                    predictedLap={strategy.pit_window.optimal_lap}
                  />
                )}
                <StrategyTimeline
                  comparison={comparison}
                  pitWindow={strategy.pit_window}
                  currentLap={currentLap}
                  totalLaps={totalLaps}
                />
              </div>
            )}

            {comparison && (
              <>
                <CompoundStrategyTable strategies={comparison.strategies} />
                <CompoundStrategyMetrics
                  compoundStrategies={comparison.compound_strategies}
                />
                <StrategyBattleCenter comparison={comparison} />
                <RiskBreakdown
                  comparison={comparison}
                  trafficDetail={strategy?.reasoning.traffic_impact}
                />
              </>
            )}

            {strategy && <StrategyReasoning reasoning={strategy.reasoning} />}
            {simulation && strategy && comparison && (
              <TelemetrySection
                simulation={simulation}
                reasoning={strategy.reasoning}
                comparison={comparison}
                strategy={strategy}
                monteCarlo={monteCarlo}
              />
            )}

            {comparison && strategy && (
              <AIStrategicInsights
                comparison={comparison}
                reasoning={strategy.reasoning}
              />
            )}

            {!comparison && !strategy && !loading && (
              <div className="border border-dashed border-[#1F1F2E] bg-[#111118] p-10 text-center">
                <div className="text-lg font-semibold text-[#9CA3AF]">
                  Awaiting Input
                </div>
                <p className="mt-2 text-[13px] text-[#9CA3AF]">
                  Configure race parameters and run simulation.
                </p>
              </div>
            )}
          </div>

          {/* Right column */}
          <AIEngineerPanel
            engineBriefing={strategy?.engine_briefing ?? null}
            reasoning={strategy?.reasoning ?? null}
            confidence={comparison?.confidence ?? null}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
