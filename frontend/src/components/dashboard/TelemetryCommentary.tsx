import type { SimulationData, StrategyReasoning } from "@/types/strategy";

interface Props {
  simulation: SimulationData;
  reasoning: StrategyReasoning;
}

export function TelemetryCommentary({ simulation, reasoning }: Props) {
  const commentary: string[] = [];

  if (simulation.undercut_gain > 5) {
    commentary.push(
      `Strong undercut opportunity detected (+${simulation.undercut_gain.toFixed(2)}s).`,
    );
  }

  if (simulation.stay_out_loss > 2) {
    commentary.push("Tyre degradation is beginning to impact pace.");
  }

  if (reasoning.fuel_analysis.includes("PUSH")) {
    commentary.push("Fuel reserves allow aggressive push laps.");
  }

  if (reasoning.traffic_impact.includes("HIGH")) {
    commentary.push("Traffic risk remains elevated after the stop.");
  }

  if (commentary.length === 0) {
    commentary.push(
      "Telemetry is stable. No critical intervention is required in the current stint.",
    );
  }

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        {" "}
        AI Telemetry Engineer{" "}
      </header>

      <div className="mt-4 space-y-3">
        {commentary.map((line) => (
          <div
            key={line}
            className="border-l-2 border-[#00D2FF] pl-3 text-[13px] text-[#E5E7EB]"
          >
            {" "}
            {line}{" "}
          </div>
        ))}
      </div>
    </section>
  );
}
