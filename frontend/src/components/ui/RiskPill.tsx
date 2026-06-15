import { cn } from "@/lib/utils";
import type { RiskPillProps } from "@/types/ui";

function levelStyles(level: string) {
  const l = level.toUpperCase();
  if (l === "LOW" || l.includes("✓✓")) {
    return "border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]";
  }
  if (l === "MEDIUM" || l === "MODERATE" || l.includes("✓")) {
    return "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]";
  }
  return "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]";
}

export function RiskPill({ level, className }: RiskPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em]",
        levelStyles(level),
        className,
      )}
    >
      {level}
    </span>
  );
}

export function riskIndicator(risk: string): string {
  const r = risk.toUpperCase();
  if (r === "LOW") return "✓✓";
  if (r === "MEDIUM") return "✓";
  return "✗✗";
}
