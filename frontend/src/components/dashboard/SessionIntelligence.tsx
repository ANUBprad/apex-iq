import type {
  SimulationData,
  StrategyReasoning,
  ComparisonData,
} from "@/types/strategy";

interface SessionIntelligenceProps {
  simulation: SimulationData;
  reasoning: StrategyReasoning;
  comparison: ComparisonData;
}

function StatusBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="border border-[#1F1F2E] bg-[#0A0A0F] p-3">
      <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        {label}
      </div>
      <div
        className="mt-2 font-mono text-[13px] font-semibold"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}

export function SessionIntelligence({
  simulation,
  reasoning,
  comparison,
}: SessionIntelligenceProps) {
  if (!comparison) {
    return null;
  }

  const tyreState =
    simulation.stay_out_loss < 1
      ? "OPTIMAL"
      : simulation.stay_out_loss < 3
        ? "MANAGE"
        : "CRITICAL";
  const fuelState = reasoning.fuel_analysis.includes("PUSH")
    ? "PUSH"
    : reasoning.fuel_analysis.includes("SAVE")
      ? "SAVE"
      : "NEUTRAL";
  const trackState = reasoning.traffic_impact.includes("HIGH")
    ? "TRAFFIC"
    : "CLEAR";
  const strategyState = comparison.expected_advantage.includes("-")
    ? "DEFEND"
    : "ATTACK";
  const health = Math.max(
    0,
    100 -
      comparison.risk_score * 0.4 -
      comparison.risk_breakdown.traffic_risk * 0.2 -
      comparison.risk_breakdown.weather_risk * 0.2,
  );
  const healthLabel =
    health > 80
      ? "EXCELLENT"
      : health > 60
        ? "GOOD"
        : health > 40
          ? "WATCH"
          : "CRITICAL";
  const alerts: string[] = [];

  if (simulation.stay_out_loss > 2) {
    alerts.push("Tyre wear threshold approaching");
  }

  if (simulation.undercut_possible) {
    alerts.push("Undercut opportunity available");
  }

  if (reasoning.fuel_analysis.includes("PUSH")) {
    alerts.push("Fuel margin healthy");
  }

  if (reasoning.traffic_impact.includes("HIGH")) {
    alerts.push("Traffic expected after stop");
  }

  if (alerts.length === 0) {
    alerts.push("No active telemetry alerts. Strategy posture remains stable.");
  }

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Session Intelligence
      </header>

      {/* Status Grid */}

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <StatusBadge label="Tyre Window" value={tyreState} color="#00D2FF" />
        <StatusBadge label="Fuel Window" value={fuelState} color="#10B981" />
        <StatusBadge label="Track Status" value={trackState} color="#F59E0B" />
        <StatusBadge
          label="Strategy State"
          value={strategyState}
          color="#EF4444"
        />
      </div>

      {/* Health Score */}
      <div className="mt-5 border border-[#1F1F2E] bg-[#0A0A0F] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
            Telemetry Health
          </span>

          <span className="font-mono text-[18px] font-semibold text-[#F9FAFB]">
            {health.toFixed(0)}/100
          </span>
        </div>

        <div className="mt-3 h-2 bg-[#1F1F2E]">
          <div
            className="h-full"
            style={{
              width: `${health}%`,
              background:
                health > 80 ? "#10B981" : health > 60 ? "#F59E0B" : "#EF4444",
            }}
          />
        </div>

        <div className="mt-2 text-[12px] text-[#9CA3AF]">
          Status: {healthLabel}
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-5">
        <div className="mb-3 text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
          Strategic Alerts
        </div>

        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert}
              className="border-l-2 border-[#00D2FF] bg-[#0A0A0F] px-3 py-2 text-[13px] text-[#E5E7EB]"
            >
              {alert}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
