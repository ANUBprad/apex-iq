import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2, Check } from "lucide-react";

type InputState = "idle" | "error" | "validating" | "success";

interface ApexInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  inputState?: InputState;
}

const stateStyles: Record<InputState, string> = {
  idle: "border-border-subtle focus:border-cyan-electric focus:shadow-[0_0_8px_rgba(0,217,255,0.2)]",
  error: "border-red-ferrari focus:border-red-ferrari focus:shadow-[0_0_8px_rgba(220,20,60,0.2)]",
  validating: "border-cyan-electric/50 focus:border-cyan-electric",
  success: "border-green-telemetry focus:border-green-telemetry focus:shadow-[0_0_8px_rgba(57,255,20,0.2)]",
};

export const ApexInput = forwardRef<HTMLInputElement, ApexInputProps>(
  ({ label, hint, error, inputState, className, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const resolvedState: InputState = error ? "error" : inputState ?? "idle";

    return (
      <div className="input-wrapper">
        {label && (
          <label
            htmlFor={id}
            className="font-rajdhani text-xs uppercase text-green-telemetry mb-2 block"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "w-full px-3 py-2 bg-bg-base border rounded-sm font-orbitron text-white",
              "focus:outline-none transition-all duration-200",
              stateStyles[resolvedState],
              resolvedState === "validating" && "pr-8",
              resolvedState === "success" && "pr-8",
              className
            )}
            {...props}
          />
          {resolvedState === "validating" && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-cyan-electric animate-spin" />
            </div>
          )}
          {resolvedState === "success" && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Check className="w-4 h-4 text-green-telemetry" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-ferrari mt-1 font-rajdhani">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-secondary mt-1">{hint}</p>
        )}
      </div>
    );
  }
);

ApexInput.displayName = "ApexInput";
