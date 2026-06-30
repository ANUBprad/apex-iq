import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface TelemetryGaugeProps {
  label: string;
  value: number;
  min?: number;
  max: number;
  unit?: string;
  color?: "red" | "blue" | "green" | "yellow" | "white" | "orange" | "purple";
  className?: string;
  size?: "sm" | "md";
}

const gaugeColors: Record<string, string> = {
  red: "bg-[#E10600]",
  blue: "bg-[#00C8FF]",
  green: "bg-[#00FF85]",
  yellow: "bg-[#FFD400]",
  white: "bg-[#FFFFFF]",
  orange: "bg-[#FF8A00]",
  purple: "bg-[#A855F7]",
};

const textColors: Record<string, string> = {
  red: "text-[#E10600]",
  blue: "text-[#00C8FF]",
  green: "text-[#00FF85]",
  yellow: "text-[#FFD400]",
  white: "text-[#FFFFFF]",
  orange: "text-[#FF8A00]",
  purple: "text-[#A855F7]",
};

export const TelemetryGauge = memo(function TelemetryGauge({
  label,
  value,
  min = 0,
  max,
  unit,
  color = "white",
  className,
  size = "sm",
}: TelemetryGaugeProps) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.12em] text-[#666666] font-medium">
          {label}
        </span>
        <span className={cn("text-xs font-bold font-mono", textColors[color])}>
          {value}
          {unit}
        </span>
      </div>
      <div
        className={cn(
          "bg-[#262626] rounded-full overflow-hidden",
          size === "sm" ? "h-1" : "h-1.5",
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ willChange: "width" }}
          className={cn("h-full rounded-full", gaugeColors[color])}
        />
      </div>
    </div>
  );
});
