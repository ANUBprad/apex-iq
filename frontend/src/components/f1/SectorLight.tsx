import { cn } from "@/lib/utils";
import { motion, type Transition } from "framer-motion";

interface SectorLightProps {
  sector: 1 | 2 | 3;
  color: "green" | "purple" | "yellow" | "white";
  className?: string;
  animated?: boolean;
}

const sectorColors = {
  green: "bg-[#00FF85] shadow-[0_0_8px_rgba(0,255,133,0.4)]",
  purple: "bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.4)]",
  yellow: "bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,0.4)]",
  white: "bg-[#FFFFFF] shadow-[0_0_8px_rgba(255,255,255,0.2)]",
};

export function SectorLight({
  sector,
  color,
  className,
  animated = true,
}: SectorLightProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-[10px] uppercase tracking-[0.12em] text-[#666666] font-mono">
        S{sector}
      </span>
      <motion.div
        initial={animated ? { scale: 0 } : false}
        animate={animated ? { scale: 1 } : undefined}
        transition={
          animated
            ? ({ type: "spring", stiffness: 300, damping: 15 } as Transition)
            : undefined
        }
        className={cn(
          "w-2.5 h-2.5 rounded-full transition-all duration-300",
          sectorColors[color],
        )}
      />
    </div>
  );
}
