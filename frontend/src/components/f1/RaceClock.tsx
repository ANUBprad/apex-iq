import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RaceClockProps {
  currentLap: number;
  totalLaps: number;
  elapsed: string;
  className?: string;
  sector?: string;
}

export function RaceClock({
  currentLap,
  totalLaps,
  elapsed,
  className,
  sector,
}: RaceClockProps) {
  const progress = (currentLap / totalLaps) * 100;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.12em] text-[#666666] font-medium">
          Race Time
        </span>
        <span className="text-sm font-bold font-mono text-[#FFFFFF]">
          {elapsed}
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <motion.span
          key={currentLap}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[32px] font-bold font-mono text-[#FFFFFF] leading-none"
        >
          L{currentLap}
        </motion.span>
        <span className="text-[11px] text-[#666666] font-mono">
          / {totalLaps}
        </span>
      </div>
      {sector && (
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#666666] font-mono">Now in {sector}</span>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-[#00FF85]"
          />
        </div>
      )}
      <div className="h-1.5 bg-[#262626] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#E10600] via-[#E10600]/80 to-[#E10600]/60 rounded-full"
        />
      </div>
    </div>
  );
}
