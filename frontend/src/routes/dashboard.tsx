import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RaceControlPanel } from "@/components/dashboard/RaceControlPanel";
import { StrategyDecisionCard } from "@/components/dashboard/StrategyDecisionCard";
import { TelemetryCharts } from "@/components/dashboard/TelemetryCharts";
import { LiveMetricsGrid } from "@/components/dashboard/LiveMetricsGrid";
import { AIEngineerPanel } from "@/components/dashboard/AIEngineerPanel";
import { useStrategy } from "@/hooks/useStrategy";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Strategy Control Room" },
      { name: "description", content: "Live strategy control room — telemetry, AI engineer, and pit window prediction for Formula 1 race weekends." },
    ],
  }),
});

function DashboardPage() {
  const { strategy, loading, run, seed } = useStrategy();

  return (
    <div className="min-h-screen bg-background text-foreground apex-radial-bg">
      <Navbar />
      <div className="pt-20 px-4 pb-10 max-w-[1700px] mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-space-grotesk text-[10px] tracking-[0.4em] text-apex-red uppercase">// Live Race Session</div>
            <h1 className="font-orbitron font-bold text-3xl text-white tracking-wider">Strategy Control Room</h1>
          </div>
          <div className="flex gap-2 font-space-grotesk text-[10px] tracking-[0.2em] uppercase">
            <span className="px-3 py-1 rounded-full border border-apex-cyan/30 bg-apex-cyan/5 text-apex-cyan">Session: FP3</span>
            <span className="px-3 py-1 rounded-full border border-apex-red/30 bg-apex-red/5 text-apex-red flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-apex-red pulse-dot" /> Live
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_360px] gap-4 h-[calc(100vh-180px)] min-h-[800px]">
          <RaceControlPanel onRun={run} loading={loading} />
          <div className="overflow-y-auto pr-1 space-y-4">
            <StrategyDecisionCard strategy={strategy} />
            <TelemetryCharts seed={seed} />
            <LiveMetricsGrid seed={seed} />
          </div>
          <AIEngineerPanel strategy={strategy} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
