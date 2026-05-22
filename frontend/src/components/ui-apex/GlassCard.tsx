import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function GlassCard({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border border-[#E5E7EB] bg-[#F8F9FB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]", className)} {...rest}>
      {children}
    </div>
  );
}
