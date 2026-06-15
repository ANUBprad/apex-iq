import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GemMeterProps } from "@/types/ui";
import { palette, motion as motionTokens } from "@/styles/theme";

function gemColor(
  variant: GemMeterProps["variant"],
  filled: boolean,
  value: number,
) {
  if (!filled) return palette.grid;
  if (variant === "risk") {
    if (value >= 60) return palette.danger;
    if (value >= 35) return palette.caution;
    return palette.success;
  }
  if (variant === "confidence") {
    if (value >= 75) return palette.success;
    if (value >= 55) return palette.caution;
    return palette.danger;
  }
  return palette.primary;
}

export function GemMeter({
  value,
  max = 100,
  gems = 5,
  variant = "neutral",
  label,
  showValue = true,
  pulse = false,
  className,
}: GemMeterProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const filledCount = Math.round((pct / 100) * gems);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: gems }, (_, i) => {
          const filled = i < filledCount;
          const color = gemColor(variant, filled, pct);
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0.3, scale: 0.85 }}
              animate={{
                opacity: filled ? 1 : 0.35,
                scale: filled && pulse && pct >= 60 ? [0.95, 1, 0.95] : 1,
              }}
              transition={{
                opacity: {
                  duration: motionTokens.fast / 1000,
                  delay: i * 0.03,
                },
                scale:
                  pulse && pct >= 60
                    ? { duration: 1.5, repeat: Infinity }
                    : { duration: 0.2 },
              }}
              className="font-mono text-[13px] leading-none"
              style={{ color }}
            >
              {filled ? "◆" : "◇"}
            </motion.span>
          );
        })}
      </div>
      <div className="min-w-0">
        {label ? (
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
            {label}
          </div>
        ) : null}
        {showValue ? (
          <div className="font-mono text-[14px] tabular-nums text-[#E5E7EB]">
            {Math.round(pct)}%
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function riskGemsFromLabel(risk: string): number {
  const r = risk.toUpperCase();
  if (r === "LOW") return 2;
  if (r === "MEDIUM" || r === "MODERATE") return 3;
  return 4;
}
