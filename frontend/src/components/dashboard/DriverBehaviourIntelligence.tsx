import { useDriverProfile } from "@/hooks/useDriverProfile";

interface Props {
  driver: string;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[10px] uppercase text-[#9CA3AF]">{label}</div>

      <div className="mt-1">
        <div className="h-2 bg-[#1F1F2E]">
          <div
            className="h-full bg-[#00D2FF]"
            style={{
              width: `${value}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-1 font-mono text-[12px] text-[#F9FAFB]">{value}</div>
    </div>
  );
}

export function DriverBehaviourIntelligence({ driver }: Props) {
  const profile = useDriverProfile(driver);

  if (!profile) return null;

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        Driver Intelligence
      </header>

      <div className="mt-3 text-lg font-semibold text-[#F9FAFB]">
        {profile.name}
      </div>

      <div className="mt-4 space-y-4">
        <Stat label="Aggression" value={profile.aggression} />

        <Stat label="Tyre Management" value={profile.tyre_management} />

        <Stat label="Overtake Efficiency" value={profile.overtake_efficiency} />

        <Stat label="Wet Weather Skill" value={profile.wet_weather_skill} />

        <Stat label="Consistency" value={profile.consistency} />

        <Stat label="Racecraft" value={profile.racecraft} />
      </div>
    </section>
  );
}
