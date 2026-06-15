import { useHistoricalRaces } from "@/hooks/useHistoricalRaces";

interface Props {
  circuit: string;
}

export function HistoricalRaceArchive({ circuit }: Props) {
  const { races, loading } = useHistoricalRaces(circuit);

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Historical Race Archive
      </header>

      {loading ? (
        <div className="mt-4 text-[#9CA3AF]">Loading...</div>
      ) : (
        <div className="mt-4 space-y-3">
          {races.map((race) => (
            <div
              key={`${race.race_name}-${race.season}`}
              className="border border-[#1F1F2E] bg-[#0A0A0F] p-3"
            >
              <div className="font-medium text-[#F9FAFB]">
                {race.race_name} {race.season}
              </div>

              <div className="mt-2 text-[12px] text-[#9CA3AF]">
                Winner: {race.winner}
              </div>

              <div className="text-[12px] text-[#9CA3AF]">
                Strategy: {race.winning_strategy}
              </div>

              <div className="text-[12px] text-[#9CA3AF]">
                Pit Lap: L{race.pit_stop_lap}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
