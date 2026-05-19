import { cn } from "@/lib/utils";

interface ApexToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

export function ApexToggle({ label, enabled, onChange, className }: ApexToggleProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={cn(
            "w-11 h-6 rounded-full transition-all duration-200",
            enabled ? "bg-green-telemetry" : "bg-border-subtle"
          )}
        >
          <div
            className={cn(
              "absolute w-5 h-5 rounded-full bg-bg-base transition-transform duration-200 top-0.5",
              enabled ? "translate-x-6" : "translate-x-0.5"
            )}
          />
        </div>
      </label>
      <span className="font-rajdhani text-xs uppercase text-text-primary">
        {label}
      </span>
    </div>
  );
}
