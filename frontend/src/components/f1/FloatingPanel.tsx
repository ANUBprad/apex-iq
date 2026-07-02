import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FloatingPanelProps {
  children: ReactNode;
  className?: string;
  variant?:
    | "default"
    | "accent"
    | "success"
    | "warning"
    | "danger"
    | "subtle"
    | "strong";
  accentColor?: string;
}

const variants = {
  default: "glass-panel border-[#222] bg-[#0D0D0D]/70",
  accent: "glass-panel border-[#E10600]/20 bg-[#E10600]/5",
  success: "glass-panel border-[#00FF85]/20 bg-[#00FF85]/5",
  warning: "glass-panel border-[#FF8800]/20 bg-[#FF8800]/5",
  danger: "glass-panel border-[#E10600]/30 bg-[#E10600]/10",
  subtle: "bg-transparent border-[#1A1A1A]",
  strong: "bg-[#111] border-[#222] shadow-lg",
};

export function FloatingPanel({
  children,
  className,
  variant = "default",
  accentColor,
}: FloatingPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "rounded-sm border p-5 transition-all duration-300",
        variants[variant],
        className,
      )}
      style={
        accentColor
          ? ({
              borderColor: `${accentColor}22`,
              background: `${accentColor}08`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
