import { cn } from "@/lib/utils";

interface TyreCardProps {
  compound: string;
  age: number;
  temperature: number;
  degradation: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const compoundStyles: Record<
  string,
  { bg: string; border: string; label: string; dot: string }
> = {
  soft: {
    bg: "bg-[#E10600]/10",
    border: "border-[#E10600]/30",
    label: "SOFT",
    dot: "bg-[#E10600]",
  },
  medium: {
    bg: "bg-[#FFD400]/10",
    border: "border-[#FFD400]/30",
    label: "MEDIUM",
    dot: "bg-[#FFD400]",
  },
  hard: {
    bg: "bg-[#666666]/10",
    border: "border-[#666666]/30",
    label: "HARD",
    dot: "bg-[#666666]",
  },
  inter: {
    bg: "bg-[#00FF85]/10",
    border: "border-[#00FF85]/30",
    label: "INTER",
    dot: "bg-[#00FF85]",
  },
  wet: {
    bg: "bg-[#00C8FF]/10",
    border: "border-[#00C8FF]/30",
    label: "WET",
    dot: "bg-[#00C8FF]",
  },
};

export function TyreCard({
  compound,
  age,
  temperature,
  degradation,
  active,
  onClick,
  className,
}: TyreCardProps) {
  const style = compoundStyles[compound.toLowerCase()] || compoundStyles.medium;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1.5 p-3 rounded-md border transition-all duration-200 text-left min-w-[100px] cursor-pointer",
        style.bg,
        style.border,
        active
          ? "ring-1 ring-[#FFFFFF]/20 scale-[1.02]"
          : "opacity-70 hover:opacity-100",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", style.dot)} />
        <span
          className={cn(
            "text-[10px] font-bold tracking-[0.15em]",
            style.border.replace("border-", "text-").replace("/30", ""),
          )}
        >
          {style.label}
        </span>
      </div>
      <span className="text-[11px] text-[#A0A0A0] font-mono">{age} laps</span>
      <div className="flex justify-between text-[10px] text-[#666666]">
        <span>{temperature}°C</span>
        <span>{Math.round(degradation)}% wear</span>
      </div>
    </button>
  );
}
