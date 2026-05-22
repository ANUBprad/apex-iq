import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RaceControlPanel } from "@/components/dashboard/RaceControlPanel";
import { StrategyDecisionCard } from "@/components/dashboard/StrategyDecisionCard";
import { TelemetryCharts } from "@/components/dashboard/TelemetryCharts";
import { LiveMetricsGrid } from "@/components/dashboard/LiveMetricsGrid";
import { AIEngineerPanel } from "@/components/dashboard/AIEngineerPanel";
import { useStrategy } from "@/hooks/useStrategy";
import type { StrategyInput } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Strategy Control Room" },
      { name: "description", content: "Live strategy control room -- telemetry, AI engineer, and pit window prediction for Formula 1 race weekends." },
    ],
  }),
});

function DashboardPage() {
  const { strategy, simulation, loading, error, run } = useStrategy();

  const handleRun = (input: StrategyInput) => {
    run(input);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-16 px-4 pb-8 max-w-[1700px] mx-auto">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2 pt-4">
          <div>
            <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.5px] mb-1">Live Race Session</div>
            <h1 className="font-grotesk font-semibold text-2xl text-foreground">Strategy Control Room</h1>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-md border border-border bg-card/40 text-[12px] font-semibold text-muted-foreground uppercase">FP3</span>
            <span className="px-3 py-1 rounded-md border border-[rgba(0,217,255,0.2)] bg-[rgba(0,217,255,0.06)] text-[12px] font-semibold text-cyan-electric uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-telemetry" /> Live
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_300px] gap-4 h-[calc(100vh-140px)] min-h-[700px]">
          <RaceControlPanel onRun={handleRun} loading={loading} />
          <div className="overflow-y-auto pr-0.5 space-y-4">
            <StrategyDecisionCard strategy={strategy} error={error} />
            <TelemetryCharts strategy={strategy} simulation={simulation} />
            <LiveMetricsGrid strategy={strategy} simulation={simulation} />
          </div>
          <AIEngineerPanel strategy={strategy} simulation={simulation} error={error} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
