import { cn } from "@/lib/utils";

interface ApexSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  accentColor?: string;
}

export function ApexSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
  className,
  accentColor = "#39FF14",
}: ApexSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("slider-wrapper", className)}>
      <label className="flex justify-between items-center mb-2">
        <span className="font-rajdhani text-xs uppercase text-green-telemetry">
          {label}
        </span>
        <span className="font-orbitron text-white text-sm">
          {value}{suffix}
        </span>
      </label>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-1 bg-bg-base rounded-sm appearance-none cursor-pointer accent-green-telemetry"
        style={{
          background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${pct}%, #0F0F0F ${pct}%, #0F0F0F 100%)`,
        }}
      />
    </div>
  );
}
