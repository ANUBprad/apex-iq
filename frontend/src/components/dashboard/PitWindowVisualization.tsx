import type { PitWindowData } from "@/types/strategy";
import { Timeline } from "@/components/ui/Timeline";

interface PitWindowVisualizationProps {
  pitWindow: PitWindowData;
  currentLap: number;
  totalLaps: number;
}

export function PitWindowVisualization({
  pitWindow,
  currentLap,
  totalLaps,
}: PitWindowVisualizationProps) {
  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Pit Window
      </header>

      <div className="mt-4">
        <Timeline
          totalLaps={totalLaps}
          windowStart={pitWindow.window_start}
          windowEnd={pitWindow.window_end}
          markers={[
            { lap: currentLap, variant: "current", label: `L${currentLap}` },
            {
              lap: pitWindow.optimal_lap,
              variant: "optimal",
              label: `L${pitWindow.optimal_lap}`,
            },
          ]}
        />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
            Early
          </div>
          <div className="mt-1 font-mono text-[13px] text-[#E5E7EB]">
            L{pitWindow.window_start}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em] text-[#00D2FF]">
            Optimal
          </div>
          <div className="mt-1 font-mono text-[14px] font-semibold text-[#00D2FF]">
            L{pitWindow.optimal_lap}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
            Late
          </div>
          <div className="mt-1 font-mono text-[13px] text-[#E5E7EB]">
            L{pitWindow.window_end}
          </div>
        </div>
      </div>

      <p className="mt-3 font-mono text-[12px] text-[#9CA3AF]">
        Window L{pitWindow.window_start} — L{pitWindow.window_end} (
        {pitWindow.window_end - pitWindow.window_start + 1}-lap span)
      </p>
    </section>
  );
}
