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
          "font-rajdhani font-semibold text-[13px] tracking-[0.08em] uppercase px-5 py-2.5 rounded-md",
          "border border-border text-cyan-electric bg-transparent",
          "transition-all duration-200 hover:bg-accent hover:border-[rgba(0,217,255,0.35)] hover:text-cyan-electric",
          "active:scale-[0.98]",
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
        "bg-red-ferrari font-rajdhani font-semibold text-[13px] tracking-[0.08em] uppercase px-5 py-2.5 rounded-md text-white",
        "shadow-glow-red-sm",
        "transition-all duration-200 hover:brightness-110 hover:shadow-glow-red",
        "active:scale-[0.98]",
        "disabled:bg-border disabled:text-muted-foreground disabled:cursor-not-allowed disabled:shadow-none",
        className
      )}
    >
      {children}
    </button>
  );
}
