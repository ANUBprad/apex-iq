import type { RaceEvent } from "@/types/replay";

interface Props {
  raceName: string;
  totalLaps: number;
  events: RaceEvent[];
  currentLap: number;
  setCurrentLap: (lap: number) => void;
}

export function RaceReplay({
  raceName,
  totalLaps,
  events,
  currentLap,
  setCurrentLap,
}: Props) {
  const activeEvents = events.filter((e) => e.lap <= currentLap);

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        Race Replay
      </header>

      <div className="mt-3 text-lg font-semibold text-[#F9FAFB]">
        {raceName}
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={1}
          max={totalLaps}
          value={currentLap}
          onChange={(e) => setCurrentLap(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mt-3 font-mono text-[#00D2FF]">Lap {currentLap}</div>

      <div className="mt-3 border border-[#1F1F2E] bg-[#0A0A0F] p-3">
        <div className="text-[11px] uppercase text-[#9CA3AF]">Race State</div>

        <div className="mt-2 text-[#F9FAFB]">
          {activeEvents[activeEvents.length - 1]?.description}
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-[#9CA3AF] mb-2">
        {events.map((event) => (
          <span key={event.lap}>L{event.lap}</span>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {activeEvents.map((event) => (
          <div
            key={`${event.type}-${event.lap}`}
            className="border-l-2 border-[#00D2FF] pl-3"
          >
            <div className="text-[12px] text-[#9CA3AF]">Lap {event.lap}</div>

            <div className="text-[13px] text-[#F9FAFB]">
              {event.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
