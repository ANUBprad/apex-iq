import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StrategyTimelineProps {
  laps: number;
  pitStops: { lap: number; compound: string }[];
  currentLap?: number;
  className?: string;
}

const compoundColors: Record<string, string> = {
  soft: "bg-[#E10600]",
  medium: "bg-[#FFD400]",
  hard: "bg-[#666666]",
  inter: "bg-[#00FF85]",
  wet: "bg-[#00C8FF]",
};

const compoundLabels: Record<string, string> = {
  soft: "S",
  medium: "M",
  hard: "H",
  inter: "I",
  wet: "W",
};

export function StrategyTimeline({
  laps,
  pitStops,
  currentLap,
  className,
}: StrategyTimelineProps) {
  if (pitStops.length === 0) return null;

  const segments = [
    {
      from: 1,
      to: pitStops[0]?.lap ?? laps,
      compound: pitStops[0]?.compound ?? "medium",
    },
  ];
  for (let i = 0; i < pitStops.length; i++) {
    const nextLap = pitStops[i + 1]?.lap ?? laps;
    segments.push({
      from: pitStops[i].lap + 1,
      to: nextLap,
      compound: pitStops[i].compound,
    });
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1 h-8 relative">
        {segments.map((seg, i) => {
          const pct = ((seg.to - seg.from + 1) / laps) * 100;
          return (
            <motion.div
              key={i}
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: `${pct}%`,
                opacity: currentLap && seg.to < currentLap ? 0.5 : 1,
              }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={cn(
                "h-3 rounded-sm flex items-center justify-center relative",
                compoundColors[seg.compound] || "bg-[#666666]",
              )}
            >
              <span className="text-[9px] font-bold text-[#050505] font-mono">
                {compoundLabels[seg.compound] || seg.compound[0]}
              </span>
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-[#666666] font-mono">
        <span>L1</span>
        {pitStops.map((ps, i) => (
          <span key={i}>PIT L{ps.lap}</span>
        ))}
        <span>L{laps}</span>
      </div>
    </div>
  );
}
