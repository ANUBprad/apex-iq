import { cn } from "@/lib/utils";

interface ApexSelectOption {
  value: string;
  label: string;
  color?: string;
}

interface ApexSelectProps {
  label?: string;
  options: ApexSelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ApexSelect({ label, options, value, onChange, className }: ApexSelectProps) {
  return (
    <div className={cn("select-wrapper", className)}>
      {label && (
        <label className="font-rajdhani text-xs uppercase text-green-telemetry mb-2 block">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex-1 py-2 px-3 rounded-sm font-rajdhani text-xs uppercase transition-all duration-200",
                isActive
                  ? "text-white border-red-ferrari"
                  : "bg-bg-elevated border border-border-subtle text-text-primary hover:border-border-visible"
              )}
              style={isActive ? { background: opt.color ?? "#DC143C", borderColor: opt.color ?? "#DC143C" } : {}}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
