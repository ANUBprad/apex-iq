import { motion } from "framer-motion";
import { useMemo } from "react";

const METRICS = [
  { label: "Predicted Lap", unit: "s", base: 78.4, range: 0.3, status: "ok" },
  { label: "Tyre Wear", unit: "%", base: 32, range: 8, status: "warn" },
  { label: "Fuel Remaining", unit: "kg", base: 64, range: 4, status: "ok" },
  { label: "Pit Delta", unit: "s", base: 21.4, range: 0.4, status: "ok" },
  { label: "Track Evolution", unit: "%", base: 14, range: 3, status: "ok" },
  { label: "DRS Efficiency", unit: "%", base: 92, range: 4, status: "ok" },
  { label: "Pace Drop-off", unit: "s/lap", base: 0.18, range: 0.05, status: "warn" },
  { label: "Undercut Gain", unit: "s", base: 1.8, range: 0.3, status: "good" },
] as const;

const STATUS = {
  good: "oklch(0.85 0.22 155)",
  ok: "oklch(0.82 0.15 215)",
  warn: "oklch(0.78 0.18 60)",
  crit: "oklch(0.62 0.25 27)",
} as const;

export function LiveMetricsGrid({ seed }: { seed: number }) {
  const values = useMemo(() => METRICS.map((m) => +(m.base + (Math.random() - 0.5) * m.range).toFixed(2)), [seed]);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {METRICS.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04, duration: 0.4 }}
          whileHover={{ y: -3 }}
          className="apex-glass rounded-md p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="font-space-grotesk text-[9px] tracking-[0.2em] text-white/45 uppercase">{m.label}</span>
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: STATUS[m.status as keyof typeof STATUS] }} />
          </div>
          <motion.div
            key={values[i]}
            initial={{ scale: 1.08, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="font-rajdhani font-bold text-3xl text-white mt-2"
          >
            {values[i]}<span className="text-sm text-white/50 ml-1">{m.unit}</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
