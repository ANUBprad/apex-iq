import { CIRCUITS } from "@/lib/apex-data";
import { MetricCard } from "@/components/ui/MetricCard";
import { RiskPill } from "@/components/ui/RiskPill";

interface CircuitIntelligenceProps {
  circuitName: string;
  safetyCarProb?: number;
  rainProb?: number;
}

function degStatus(deg: string): "favorable" | "unfavorable" | "neutral" {
  if (deg === "Low") return "favorable";
  if (deg === "High") return "unfavorable";
  return "neutral";
}

function overtakeDifficulty(deg: string): string {
  if (deg === "Low") return "Hard";
  if (deg === "High") return "Easy";
  return "Medium";
}

export function CircuitIntelligence({
  circuitName,
  safetyCarProb = 0,
  rainProb = 0,
}: CircuitIntelligenceProps) {
  const circuit = CIRCUITS.find((c) => c.name === circuitName) ?? CIRCUITS[0];
  const drs = circuit.deg === "High" ? "Yes" : "Limited";

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Circuit Intelligence — {circuit.flag} {circuit.name}
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard
          label="Pit Loss"
          value={circuit.pitLoss.toFixed(1)}
          unit="s"
          status="neutral"
        />
        <MetricCard
          label="Safety Car Prob."
          value={safetyCarProb}
          unit="%"
          status={safetyCarProb > 30 ? "unfavorable" : "neutral"}
        />
        <MetricCard
          label="Tyre Deg"
          value={circuit.degRate}
          unit="%/lap"
          status={degStatus(circuit.deg)}
          sub={`Track deg: ${circuit.deg}`}
        />
        <div className="border border-[#1F1F2E] bg-[#0A0A0F] p-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
            Overtake Difficulty
          </div>
          <div className="mt-2">
            <RiskPill level={overtakeDifficulty(circuit.deg)} />
          </div>
        </div>
        <div className="border border-[#1F1F2E] bg-[#0A0A0F] p-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
            DRS Window
          </div>
          <div className="mt-2">
            <RiskPill level={drs} />
          </div>
        </div>
        <MetricCard
          label="Rain Probability"
          value={rainProb}
          unit="%"
          status={rainProb > 40 ? "unfavorable" : "favorable"}
        />
      </div>
    </section>
  );
}
