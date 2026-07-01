import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ConfidenceMeterProps {
  value: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showValue?: boolean;
}

const heights = { sm: "h-1", md: "h-1.5", lg: "h-2" };

function confidenceColor(value: number): string {
  if (value >= 0.8) return "bg-[#00FF85]";
  if (value >= 0.6) return "bg-[#00C8FF]";
  if (value >= 0.4) return "bg-[#FFD400]";
  return "bg-[#E10600]";
}

export const ConfidenceMeter = memo(function ConfidenceMeter({
  value,
  label,
  size = "md",
  className,
  showValue = true,
}: ConfidenceMeterProps) {
  const pct = Math.round(value * 100);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-[10px] uppercase tracking-[0.12em] text-[#666666] font-medium">
              {label}
            </span>
          )}
          {showValue && (
            <span
              className={cn(
                "text-[11px] font-bold font-mono",
                confidenceColor(value),
              )}
            >
              {pct}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-[#262626] rounded-full overflow-hidden",
          heights[size],
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ willChange: "width" }}
          className={cn("h-full rounded-full", confidenceColor(value))}
        />
      </div>
    </div>
  );
});
