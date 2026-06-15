import { motion } from "framer-motion";
import type { SimulationData } from "@/types/strategy";
import type { StrategyReasoning } from "@/types/strategy";

interface TelemetryIntelligenceProps {
  simulation: SimulationData;
  reasoning: StrategyReasoning;
  fuelBurnRate?: number;
}

function ProgressBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-1.5 bg-[#1F1F2E]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="h-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#1F1F2E] bg-[#0A0A0F] p-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        {title}
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[13px]">
      <span className="text-[#9CA3AF]">{label}</span>
      <span className="font-mono tabular-nums text-[#E5E7EB]">{value}</span>
    </div>
  );
}

function formatLapTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toFixed(3).padStart(6, "0")}`;
}

export function TelemetryIntelligence({
  simulation,
  reasoning,
  fuelBurnRate = 1.92,
}: TelemetryIntelligenceProps) {
  const fuelReserve = Math.max(0, 110 - fuelBurnRate * 30);
  const fuelSafe = fuelReserve > 2;
  const finishFuel = fuelReserve - 5;
  const fuelMode =
    finishFuel > 10 ? "PUSH" : finishFuel > 3 ? "NEUTRAL" : "SAVE";
  const fuelRisk = finishFuel > 10 ? "LOW" : finishFuel > 3 ? "MEDIUM" : "HIGH";
  const currentLapTime = 84 + simulation.stay_out_loss * 0.3;
  const degRate = (simulation.stay_out_loss / 5) * 100;
  const nextLapTime = currentLapTime + degRate * 0.002;
  const lap5Time = currentLapTime + degRate * 0.01;
  const lap10Time = currentLapTime + degRate * 0.02;
  const trend =
    lap10Time - currentLapTime > 1
      ? "DEGRADING"
      : lap10Time - currentLapTime > 0.4
        ? "STABLE"
        : "IMPROVING";
  const projectedBestLap = currentLapTime - simulation.undercut_gain * 0.05;
  const consistency = Math.max(
    60,
    Math.min(99, 100 - simulation.stay_out_loss * 2),
  );
  const driverForm =
    consistency > 90 ? "IMPROVING" : consistency > 75 ? "STABLE" : "DECLINING";
  const pushWindow =
    fuelMode === "PUSH" ? Math.floor(finishFuel / fuelBurnRate) : 0;
  const gripRemaining = Math.max(20, 100 - simulation.stay_out_loss * 12);
  const lifespan = Math.max(5, Math.round(68 / Math.max(degRate, 0.05)));
  const wear5 = Math.min(100, 100 - gripRemaining + degRate * 5);
  const wear10 = Math.min(100, 100 - gripRemaining + degRate * 10);
  const wear15 = Math.min(100, 100 - gripRemaining + degRate * 15);
  const recommendedPit =
    lifespan <= 5
      ? "PIT NOW"
      : lifespan <= 10
        ? `PIT IN ${lifespan - 2} LAPS`
        : "STINT HEALTHY";
  const paceDelta =
    simulation.stay_out_loss > 0
      ? `-${simulation.stay_out_loss.toFixed(2)}s`
      : `+${Math.abs(simulation.undercut_gain).toFixed(2)}s`;

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Telemetry Intelligence
      </header>

      <div className="mt-4 grid gap-3 lg:grid-cols-6">
        <Subsection title="Fuel Strategy">
          <Row label="Burn Rate" value={`${fuelBurnRate.toFixed(2)} kg/lap`} />
          <Row label="Finish Fuel" value={`${finishFuel.toFixed(1)} kg`} />
          <Row label="Mode" value={fuelMode} />
          <Row label="Risk" value={fuelRisk} />
          {fuelMode === "PUSH" && (
            <Row label="Push Window" value={`${pushWindow} laps`} />
          )}
          <ProgressBar
            value={Math.min(100, finishFuel * 5)}
            max={100}
            color={
              fuelMode === "PUSH"
                ? "#10B981"
                : fuelMode === "NEUTRAL"
                  ? "#F59E0B"
                  : "#EF4444"
            }
          />
        </Subsection>

        <Subsection title="Tyre Life">
          <Row label="Grip Remaining" value={`${gripRemaining.toFixed(0)}%`} />
          <Row label="Deg Rate" value={`${degRate.toFixed(2)}%/lap`} />
          <Row label="Lifespan" value={`${lifespan} laps`} />
          <ProgressBar value={gripRemaining} max={100} color="#00D2FF" />
        </Subsection>

        <Subsection title="Performance Trend">
          <Row label="Pace Delta" value={`${paceDelta} vs fastest`} />
          <Row label="Pit Loss" value={`${simulation.pit_loss.toFixed(2)}s`} />
          <Row
            label="Undercut Gain"
            value={`${simulation.undercut_gain.toFixed(2)}s`}
          />
          <Row
            label="Forecast"
            value={reasoning.pit_window_analysis.split("·")[0]?.trim() ?? "—"}
          />
        </Subsection>

        <Subsection title="Lap Delta Forecast">
          <Row label="Next Lap" value={formatLapTime(nextLapTime)} />
          <Row label="+5 Laps" value={formatLapTime(lap5Time)} />
          <Row label="+10 Laps" value={formatLapTime(lap10Time)} />
          <Row label="Trend" value={trend} />
          <ProgressBar
            value={Math.min(100, (lap10Time - currentLapTime) * 40)}
            max={100}
            color={
              trend === "DEGRADING"
                ? "#EF4444"
                : trend === "STABLE"
                  ? "#F59E0B"
                  : "#10B981"
            }
          />
        </Subsection>

        <Subsection title="Driver Performance">
          <Row label="Current Pace" value={formatLapTime(currentLapTime)} />
          <Row label="Best Projected" value={formatLapTime(projectedBestLap)} />
          <Row label="Consistency" value={`${consistency.toFixed(0)}%`} />
          <Row label="Driver Form" value={driverForm} />
          <ProgressBar
            value={consistency}
            max={100}
            color={
              driverForm === "IMPROVING"
                ? "#10B981"
                : driverForm === "STABLE"
                  ? "#F59E0B"
                  : "#EF4444"
            }
          />
        </Subsection>

        <Subsection title="Tyre Forecast">
          <Row label="5 Laps" value={`${wear5.toFixed(0)}% wear`} />
          <Row label="10 Laps" value={`${wear10.toFixed(0)}% wear`} />
          <Row label="15 Laps" value={`${wear15.toFixed(0)}% wear`} />
          <Row label="Action" value={recommendedPit} />
          <ProgressBar
            value={wear10}
            max={100}
            color={
              wear10 > 80 ? "#EF4444" : wear10 > 60 ? "#F59E0B" : "#10B981"
            }
          />
        </Subsection>
      </div>
    </section>
  );
}
