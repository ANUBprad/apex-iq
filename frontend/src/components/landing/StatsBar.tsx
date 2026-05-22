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
    <span ref={ref} className="font-mono font-bold text-[28px] md:text-[36px] text-[#1A1D29] tabular-nums">
      {prefix}
      {formatted}
      <span className="text-[#0EA5E9]">{suffix}</span>
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="border-y border-[#E5E7EB] bg-[#F8F9FB]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8"
      >
        {STATS.map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -2 }}
            className="text-center"
          >
            <AnimatedStat
              value={s.value}
              suffix={s.suffix}
              prefix={s.prefix}
              decimals={s.decimals}
            />
            <div className="mt-2 text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
