import type { ComparisonData } from "@/types/strategy";
import type { PitWindowData } from "@/types/strategy";

interface StrategyTimelineProps {
  comparison: ComparisonData;
  pitWindow: PitWindowData;
  currentLap: number;
  totalLaps: number;
}

const COMPOUND_COLORS: Record<string, string> = {
  SOFT: "#EF4444",
  MEDIUM: "#F59E0B",
  HARD: "#9CA3AF",
  INTER: "#10B981",
  WET: "#00D2FF",
};

function compoundColor(strategy: string): string {
  const key = Object.keys(COMPOUND_COLORS).find((c) =>
    strategy.toUpperCase().includes(c),
  );
  return key ? COMPOUND_COLORS[key] : "#00D2FF";
}

export function StrategyTimeline({
  comparison,
  pitWindow,
  currentLap,
  totalLaps,
}: StrategyTimelineProps) {
  const topCompound = comparison.compound_strategies[0];
  const segments = [
    {
      label: `L1–L${Math.max(1, pitWindow.window_start - 1)}`,
      title: "Current Stint",
      note: "Stay",
      color: "#F59E0B",
    },
    {
      label: `L${pitWindow.window_start}–L${pitWindow.window_end}`,
      title: "Pit Window",
      note: "Window opens",
      color: "#00D2FF",
    },
    {
      label: `L${pitWindow.optimal_lap}`,
      title: topCompound?.strategy ?? comparison.recommended_strategy,
      note: "Pit stop",
      color: compoundColor(topCompound?.strategy ?? ""),
      isPit: true,
    },
    {
      label: `L${pitWindow.optimal_lap + 1}–L${totalLaps}`,
      title: "Push Stint",
      note: comparison.recommended_strategy.includes("UNDERCUT")
        ? "Undercut gain builds"
        : "Finish",
      color: "#10B981",
    },
  ];

  const progressPct = Math.min(100, (currentLap / totalLaps) * 100);

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Strategy Timeline
      </header>

      <div className="relative mt-4">
        <div
          className="absolute left-0 top-0 h-full w-px bg-[#00D2FF]/40"
          style={{ left: `${progressPct}%` }}
        />
        <div className="space-y-3">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="grid grid-cols-[100px_1fr] gap-3 items-start"
            >
              <div className="font-mono text-[11px] tabular-nums text-[#9CA3AF]">
                {seg.label}
              </div>
              <div
                className="border-l-2 pl-3"
                style={{ borderColor: seg.color }}
              >
                <div className="flex items-center gap-2">
                  {seg.isPit ? (
                    <span className="inline-block h-2 w-2 rotate-45 bg-[#00D2FF]" />
                  ) : null}
                  <span className="text-[13px] font-medium text-[#F9FAFB]">
                    {seg.title}
                  </span>
                </div>
                <div className="mt-0.5 text-[12px] text-[#9CA3AF]">
                  {seg.note}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
        <span className="flex items-center gap-1">
          <span className="h-px w-4 bg-[#9CA3AF]" /> Stay
        </span>
        <span className="flex items-center gap-1">
          <span className="h-px w-4 bg-[#10B981]" /> Gain
        </span>
        <span className="flex items-center gap-1">
          <span className="h-px w-4 bg-[#EF4444]" /> Loss risk
        </span>
      </div>
    </section>
  );
}
