import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FloatingPanelProps {
  title?: string;
  children: React.ReactNode;
  variant?:
    | "default"
    | "compact"
    | "glass"
    | "glass-edge"
    | "glow-red"
    | "glow-blue"
    | "bordered";
  className?: string;
  titleRight?: React.ReactNode;
  id?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-[#141414] border-[#262626] p-4 hover:border-[#333]",
  compact: "bg-[#141414] border-[#262626] p-3 hover:border-[#333]",
  glass: "glass-panel p-4",
  "glass-edge": "glass-panel glass-panel-edge p-4",
  "glow-red":
    "bg-[#141414] border-[#E10600]/30 glow-red hover:border-[#E10600]/50",
  "glow-blue":
    "bg-[#141414] border-[#00C8FF]/30 glow-blue hover:border-[#00C8FF]/50",
  bordered: "bg-[#141414] border-[#E10600] hover:border-[#E10600]/80",
};

export const FloatingPanel = memo(function FloatingPanel({
  title,
  children,
  variant = "default",
  className,
  titleRight,
  id,
}: FloatingPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
      className={cn(
        "rounded-md border transition-all duration-250",
        variantStyles[variant] || variantStyles.default,
        className,
      )}
      id={id}
    >
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] uppercase tracking-[0.12em] text-[#666666] font-medium">
            {title}
          </h3>
          {titleRight}
        </div>
      )}
      {children}
    </motion.div>
  );
});
