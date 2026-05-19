import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface ApexSearchProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function ApexSearch({ className, ...props }: ApexSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <input
        type="search"
        placeholder="Search strategies..."
        className="w-full px-3 py-2 pl-8 bg-bg-elevated border border-border-subtle rounded-sm text-white placeholder-text-tertiary focus:border-cyan-electric focus:outline-none focus:shadow-[0_0_8px_rgba(0,217,255,0.2)] transition-all duration-200"
        {...props}
      />
      <svg
        className="absolute left-2 top-2.5 w-4 h-4 text-text-secondary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
