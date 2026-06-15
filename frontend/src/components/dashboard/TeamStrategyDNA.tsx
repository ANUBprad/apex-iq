import { useTeamDNA } from "@/hooks/useTeamDNA";

interface Props {
  team: string;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[11px]">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="mt-1 h-2 bg-[#1F1F2E]">
        <div className="h-full bg-[#00D2FF]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function TeamStrategyDNA({ team }: Props) {
  const dna = useTeamDNA(team);
  if (!dna) return null;

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        Team Strategy DNA
      </header>

      <div className="mt-3 text-lg font-semibold text-[#F9FAFB]">
        {dna.name}
      </div>

      <div className="mt-4 space-y-4">
        <Metric label="Aggression" value={dna.aggression} />
        <Metric label="Undercut Bias" value={dna.undercut_bias} />
        <Metric label="Risk Tolerance" value={dna.risk_tolerance} />
        <Metric label="Tyre Focus" value={dna.tyre_focus} />
        <Metric label="Weather Adaptability" value={dna.weather_adaptability} />
      </div>
    </section>
  );
}
