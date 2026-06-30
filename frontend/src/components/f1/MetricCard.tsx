import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  color?: "red" | "blue" | "green" | "yellow" | "orange" | "white" | "purple";
  className?: string;
  animate?: boolean;
  id?: string;
}

const colorMap: Record<string, string> = {
  red: "text-[#E10600]",
  blue: "text-[#00C8FF]",
  green: "text-[#00FF85]",
  yellow: "text-[#FFD400]",
  orange: "text-[#FF8A00]",
  white: "text-[#FFFFFF]",
  purple: "text-[#A855F7]",
};

const trendIcon: Record<string, string> = {
  up: "▲",
  down: "▼",
  stable: "◆",
};

const trendColor: Record<string, string> = {
  up: "text-[#00FF85]",
  down: "text-[#E10600]",
  stable: "text-[#666666]",
};

export const MetricCard = memo(function MetricCard({
  label,
  value,
  unit,
  trend,
  color = "white",
  className,
  animate = true,
  id,
}: MetricCardProps) {
  const Wrapper = animate ? motion.div : "div";
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: "easeOut" },
      }
    : {};

  return (
    <Wrapper
      className={cn("flex flex-col gap-0.5 min-w-0", className)}
      {...animProps}
      id={id}
    >
      <span className="text-[10px] uppercase tracking-[0.12em] text-[#666666] font-medium truncate">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-lg font-bold font-[family-name:var(--font-mono)] leading-none tabular-nums",
            colorMap[color],
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[10px] text-[#666666] font-mono">{unit}</span>
        )}
        {trend && (
          <span
            className={cn("text-[10px]", trendColor[trend])}
            aria-label={`${trend} trend`}
          >
            {trendIcon[trend]}
          </span>
        )}
      </div>
    </Wrapper>
  );
});

interface AnimatedCounterProps {
  value: number;
  label?: string;
  color?: string;
  className?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  label,
  color = "white",
  className,
  suffix,
  decimals = 1,
}: AnimatedCounterProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {label && (
        <span className="text-[10px] uppercase tracking-[0.12em] text-[#666666] font-medium">
          {label}
        </span>
      )}
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "text-2xl font-bold font-[family-name:var(--font-mono)] leading-none",
          color,
        )}
      >
        {value.toFixed(decimals)}
        {suffix}
      </motion.span>
    </div>
  );
}
