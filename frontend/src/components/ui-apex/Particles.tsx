import { useMemo } from "react";

export function Particles({ count = 28 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 8,
        dur: 8 + Math.random() * 10,
        cyan: Math.random() > 0.7,
      })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: d.cyan
              ? "oklch(0.82 0.15 215 / 0.7)"
              : "oklch(0.62 0.25 27 / 0.7)",
            boxShadow: d.cyan
              ? "0 0 8px oklch(0.82 0.15 215 / 0.6)"
              : "0 0 8px oklch(0.62 0.25 27 / 0.6)",
            animation: `drift ${d.dur}s ease-in-out ${d.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
