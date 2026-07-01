import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "bar" | "circle" | "title" | "avatar" | "chart";
  width?: string;
  height?: string;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  const base =
    "animate-shimmer bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#141414] rounded-sm";

  const variants: Record<string, string> = {
    text: "h-3 w-full",
    title: "h-5 w-3/5",
    card: "h-24 w-full",
    bar: "h-8 w-full",
    circle: "rounded-full w-8 h-8",
    avatar: "rounded-full w-10 h-10",
    chart: "h-32 w-full rounded-md",
  };

  return (
    <div
      className={cn(base, variants[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div
      className="bg-[#141414]/60 border border-[#262626] rounded-md p-4 space-y-3"
      aria-hidden="true"
    >
      <Skeleton variant="title" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={`${[85, 60, 40][i] || 50}%`} />
      ))}
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div
      className="bg-[#141414]/60 border border-[#262626] rounded-md p-4 space-y-3"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton variant="text" width="120px" />
        <Skeleton variant="text" width="40px" />
      </div>
      <Skeleton variant="chart" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton variant="bar" />
        <Skeleton variant="bar" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
  );
}

export function MetricRowSkeleton() {
  return (
    <div
      className="flex items-center gap-3 p-3 bg-[#141414]/40 border border-[#262626] rounded-md"
      aria-hidden="true"
    >
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
  );
}
