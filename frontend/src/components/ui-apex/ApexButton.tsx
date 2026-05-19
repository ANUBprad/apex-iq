import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ApexButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
}

const variantStyles = {
  primary:
    "bg-red-ferrari hover:bg-red-ferrari/90 text-white border border-red-ferrari shadow-glow-red-sm hover:shadow-glow-red",
  secondary:
    "bg-transparent text-cyan-electric border border-cyan-electric hover:bg-cyan-electric/10 shadow-glow-cyan-sm hover:shadow-glow-cyan",
  ghost:
    "bg-transparent text-text-primary border border-border-subtle hover:border-border-visible hover:bg-bg-interactive",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-label-sm",
  md: "px-4 py-2 text-label-md",
  lg: "px-6 py-3 text-label-lg",
};

export function ApexButton({
  variant = "primary",
  size = "md",
  children,
  isLoading = false,
  disabled,
  className,
  ...props
}: ApexButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "font-rajdhani uppercase rounded-sm transition-all duration-fast",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:enabled:-translate-y-0.5",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
