import { cn } from "@/lib/utils";
import type { MetricCardProps } from "@/types/ui";

const statusBorder = {
  favorable: "border-[#10B981]/30",
  unfavorable: "border-[#EF4444]/30",
  neutral: "border-[#1F1F2E]",
} as const;

const statusValue = {
  favorable: "text-[#10B981]",
  unfavorable: "text-[#EF4444]",
  neutral: "text-[#E5E7EB]",
} as const;

export function MetricCard({
  label,
  value,
  unit,
  status = "neutral",
  sub,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn("border bg-[#0A0A0F] p-3", statusBorder[status], className)}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-mono text-[14px] tabular-nums",
          statusValue[status],
        )}
      >
        {value}
        {unit ? (
          <span className="ml-1 text-[12px] text-[#9CA3AF]">{unit}</span>
        ) : null}
      </div>
      {sub ? (
        <div className="mt-1 text-[11px] leading-relaxed text-[#9CA3AF]">
          {sub}
        </div>
      ) : null}
    </div>
  );
}
