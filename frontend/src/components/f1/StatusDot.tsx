import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatusDotProps {
  color?: "green" | "red" | "blue" | "yellow" | "purple" | "white";
  size?: "sm" | "md" | "lg";
  label?: string;
  animate?: boolean;
  className?: string;
}

const colorMap: Record<string, string> = {
  green: "bg-[#00FF85]",
  red: "bg-[#E10600]",
  blue: "bg-[#00C8FF]",
  yellow: "bg-[#FFD400]",
  purple: "bg-[#A855F7]",
  white: "bg-[#FFFFFF]",
};

const sizeMap: Record<string, string> = {
  sm: "w-1 h-1",
  md: "w-1.5 h-1.5",
  lg: "w-2 h-2",
};

export const StatusDot = memo(function StatusDot({
  color = "green",
  size = "md",
  label,
  animate = true,
  className,
}: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <motion.span
        animate={animate ? { opacity: [1, 0.3, 1] } : undefined}
        transition={
          animate
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        className={cn("rounded-full shrink-0", colorMap[color], sizeMap[size])}
      />
      {label && (
        <span className="text-[10px] text-[#A0A0A0] font-medium">{label}</span>
      )}
    </span>
  );
});
