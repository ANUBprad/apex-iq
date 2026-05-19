import { cn } from "@/lib/utils";

interface ApexCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function ApexCheckbox({ label, checked, onChange, className }: ApexCheckboxProps) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer", className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded-sm border border-border-subtle checked:bg-green-telemetry checked:border-green-telemetry accent-green-telemetry"
      />
      <span className="font-rajdhani text-xs uppercase text-text-primary">
        {label}
      </span>
    </label>
  );
}
