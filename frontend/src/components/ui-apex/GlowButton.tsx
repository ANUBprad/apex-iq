import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outline";
  pulse?: boolean;
  children: ReactNode;
}

export function GlowButton({ variant = "filled", pulse, className, children, ...rest }: Props) {
  if (variant === "outline") {
    return (
      <button
        {...rest}
        className={cn(
          "font-orbitron uppercase tracking-widest text-sm px-6 py-3 rounded-md",
          "border border-apex-red text-apex-red bg-transparent",
          "transition-all duration-300 hover:bg-apex-red/15 hover:shadow-[0_0_25px_rgba(255,30,30,0.4)]",
          className
        )}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      {...rest}
      className={cn(
        "apex-btn-glow font-orbitron uppercase tracking-widest text-sm px-6 py-3 rounded-md text-white",
        pulse && "animate-pulse-glow",
        className
      )}
    >
      {children}
    </button>
  );
}
