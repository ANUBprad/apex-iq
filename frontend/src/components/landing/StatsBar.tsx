import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 94.2, suffix: "%", label: "Tyre model accuracy", decimals: 1 },
  { value: 20, suffix: "+", label: "Calibrated circuits", decimals: 0 },
  { value: 200, suffix: "ms", label: "Strategy latency", prefix: "<", decimals: 0 },
  { value: 5, suffix: "", label: "Compound profiles", decimals: 0 },
];

function AnimatedStat({
  value,
  suffix,
  prefix = "",
  decimals = 0,
}: {
  value: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();

  return (
    <span ref={ref} className="font-orbitron font-black text-3xl md:text-4xl text-white tabular-nums">
      {prefix}
      {formatted}
      <span className="text-apex-red">{suffix}</span>
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="relative border-y border-white/5 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8"
      >
        {STATS.map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -2 }}
            className="text-center group"
          >
            <AnimatedStat
              value={s.value}
              suffix={s.suffix}
              prefix={s.prefix}
              decimals={s.decimals}
            />
            <div className="mt-2 font-space-grotesk text-[10px] tracking-[0.25em] text-white/45 uppercase group-hover:text-apex-red/80 transition-colors">
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
