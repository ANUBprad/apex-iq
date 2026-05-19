import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  delta?: string | number;
  className?: string;
  color?: "primary" | "cyan" | "green" | "neutral";
}

const colorStyles = {
  primary: "border-red-ferrari shadow-glow-red-sm",
  cyan: "border-cyan-electric shadow-glow-cyan-sm",
  green: "border-green-telemetry shadow-glow-green-sm",
  neutral: "border-border-subtle",
};

export function MetricCard({
  label,
  value,
  unit,
  icon,
  trend,
  delta,
  className,
  color = "neutral",
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-elevated border rounded-sm p-lg transition-all duration-normal",
        "hover:bg-bg-interactive hover:border-border-visible",
        colorStyles[color],
        className
      )}
    >
      {/* Header: Label + Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-label-xs text-green-telemetry">{label}</span>
        {icon && <div className="text-cyan-electric">{icon}</div>}
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-metric-xl text-text-primary">{value}</span>
        {unit && <span className="text-body-xs text-text-secondary">{unit}</span>}
      </div>

      {/* Delta/Trend */}
      {delta && (
        <div
          className={cn(
            "text-label-xs font-rajdhani flex items-center gap-1",
            trend === "up" && "text-red-ferrari",
            trend === "down" && "text-green-telemetry",
            trend === "neutral" && "text-text-tertiary"
          )}
        >
          {trend === "up" && "▲"}
          {trend === "down" && "▼"}
          {delta}
        </div>
      )}
    </div>
  );
}
