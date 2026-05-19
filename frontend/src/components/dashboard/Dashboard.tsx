import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useStrategy } from "@/hooks/useStrategy";
import { RaceControlPanel } from "./RaceControlPanel";
import { AIEngineerPanel } from "./AIEngineerPanel";
import { TelemetryCharts } from "./TelemetryCharts";
import { StrategyDecisionCard } from "./StrategyDecisionCard";
import { LiveMetricsGrid } from "./LiveMetricsGrid";
import { LapTimeComparison } from "./LapTimeComparison";
import { TyreRing } from "@/components/ui-apex/TyreRing";
import { MetricCard } from "@/components/ui-apex/MetricCard";
import { TelemetryGraph } from "@/components/ui-apex/TelemetryGraph";

export function Dashboard() {
  const { strategy, run, loading } = useStrategy();
  const [seed, setSeed] = useState(1);

  const handleRun = async () => {
    setSeed(Math.random() * 1000);
    await run();
  };

  // Mock telemetry data for real-time graph
  const telemetryData = useMemo(
    () =>
      Array.from({ length: 120 }).map((_, i) => ({
        time: i,
        speed: 280 + Math.sin(i / 20) * 40,
        throttle: 50 + Math.sin(i / 15) * 35,
        brake: Math.max(0, Math.sin(i / 25) * 70),
        gear: 4 + Math.floor(Math.cos(i / 10) * 3),
      })),
    []
  );

  // Mock lap data
  const currentLapTime = 84234; // ms (1M24.234)
  const bestLapTime = 84000; // ms (1M24.000)
  const sectors = [
    { name: "Sector 1", current: 23456, best: 23400 },
    { name: "Sector 2", current: 24651, best: 24500 },
    { name: "Sector 3", current: 36127, best: 36100 },
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Main 3-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg p-lg h-full">
        {/* LEFT PANEL - Strategy Control (20%) */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="h-screen overflow-y-auto">
            <RaceControlPanel onRun={handleRun} loading={loading} />
          </div>
        </motion.div>

        {/* CENTER PANEL - Live Intelligence (50%) */}
        <motion.div
          className="lg:col-span-6 space-y-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Strategy Decision (Large) */}
          <div className="bg-bg-elevated border border-border-subtle rounded-sm p-lg">
            <StrategyDecisionCard strategy={strategy} />
          </div>

          {/* Lap Time Comparison */}
          <LapTimeComparison
            currentTime={currentLapTime}
            bestTime={bestLapTime}
            sectors={sectors}
            currentLap={13}
            totalLaps={50}
          />

          {/* Live Telemetry Graph */}
          <TelemetryGraph data={telemetryData} />

          {/* Live Metrics Grid */}
          <div className="bg-bg-elevated border border-border-subtle rounded-sm p-lg">
            <div className="text-label-md text-cyan-electric mb-lg">Live Metrics</div>
            <LiveMetricsGrid seed={seed} />
          </div>

          {/* Tyre Status Grid */}
          <div className="bg-bg-elevated border border-border-subtle rounded-sm p-lg">
            <div className="text-label-md text-cyan-electric mb-lg">Tyre Status</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <TyreRing
                position="FL"
                compound="medium"
                temperature={87}
                wear={65}
                frontTemp={85}
                centerTemp={87}
                rearTemp={89}
              />
              <TyreRing
                position="FR"
                compound="medium"
                temperature={89}
                wear={63}
                frontTemp={88}
                centerTemp={89}
                rearTemp={90}
              />
              <TyreRing
                position="RL"
                compound="medium"
                temperature={92}
                wear={68}
                frontTemp={91}
                centerTemp={92}
                rearTemp={93}
              />
              <TyreRing
                position="RR"
                compound="medium"
                temperature={94}
                wear={70}
                frontTemp={93}
                centerTemp={94}
                rearTemp={95}
              />
            </div>
          </div>

          {/* Analysis Charts */}
          <div className="bg-bg-elevated border border-border-subtle rounded-sm p-lg">
            <div className="text-label-md text-cyan-electric mb-lg">Analysis</div>
            <TelemetryCharts seed={seed} />
          </div>
        </motion.div>

        {/* RIGHT PANEL - AI Engineer (30%) */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="h-screen overflow-y-auto">
            <AIEngineerPanel strategy={strategy} />
          </div>
        </motion.div>
      </div>

      {/* Responsive: Stack on mobile */}
      <style>{`
        @media (max-width: 1024px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
