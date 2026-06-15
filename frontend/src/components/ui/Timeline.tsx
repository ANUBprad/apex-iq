import { cn } from "@/lib/utils";

export interface TimelineMarker {
  lap: number;
  label?: string;
  variant?: "current" | "optimal" | "default";
}

interface TimelineProps {
  totalLaps: number;
  windowStart?: number;
  windowEnd?: number;
  markers?: TimelineMarker[];
  className?: string;
}

export function Timeline({
  totalLaps,
  windowStart,
  windowEnd,
  markers = [],
  className,
}: TimelineProps) {
  const pct = (lap: number) =>
    `${Math.min(100, Math.max(0, (lap / totalLaps) * 100))}%`;

  return (
    <div
      className={cn(
        "relative h-10 border border-[#1F1F2E] bg-[#0A0A0F]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#1F1F2E]" />
      {windowStart != null && windowEnd != null ? (
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 bg-[#00D2FF]/15 border-y border-[#00D2FF]/30"
          style={{
            left: pct(windowStart),
            width: `calc(${pct(windowEnd)} - ${pct(windowStart)})`,
          }}
        />
      ) : null}
      {markers.map((m) => (
        <div
          key={`${m.lap}-${m.variant ?? "default"}`}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(m.lap) }}
        >
          {m.variant === "optimal" ? (
            <span className="pit-marker-pulse block h-2.5 w-2.5 rotate-45 border border-[#00D2FF] bg-[#00D2FF]/80" />
          ) : m.variant === "current" ? (
            <span className="block h-4 w-px bg-[#F9FAFB]" />
          ) : (
            <span className="block h-2 w-2 rounded-full bg-[#9CA3AF]" />
          )}
          {m.label ? (
            <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-[#9CA3AF]">
              {m.label}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
