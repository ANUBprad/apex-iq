import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function GlassCard({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("apex-glass rounded-lg relative overflow-hidden", className)} {...rest}>
      {children}
    </div>
  );
}
