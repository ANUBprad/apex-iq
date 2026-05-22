import { motion } from "framer-motion";
import { useMemo } from "react";
import { TelemetryGraph } from "@/components/ui-apex/TelemetryGraph";

function buildSampleTelemetry() {
  const n = 140;
  const base = 290;
  return Array.from({ length: n }, (_, i) => {
    const t = i;
    const phase = i / 12;
    const speed = base + Math.sin(phase) * 28 + Math.sin(i / 4) * 6;
    const throttle = Math.max(0, Math.min(100, 78 + Math.sin(phase + 0.5) * 22));
    const brake = Math.max(0, Math.min(100, 22 + Math.sin(phase + 2.1) * 26));
    return { time: t, speed, throttle, brake };
  });
}

export function TelemetryIntelligence() {
  const data = useMemo(() => buildSampleTelemetry(), []);

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-end justify-between gap-6 flex-wrap"
        >
          <div>
            <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-cyan-electric/80">
              Telemetry Intelligence
            </div>
            <h2 className="mt-4 font-grotesk font-semibold text-[28px] md:text-[40px] tracking-[-0.03em] text-foreground leading-[1.05]">
              Engineering-grade traces, not dashboard widgets.
            </h2>
            <p className="mt-5 text-[14px] md:text-[15px] text-muted-foreground leading-[1.8] max-w-2xl">
              Speed, throttle, brake, tyre wear and fuel trends — designed for engineers, strategists, and sim racers who
              need clean signal, fast.
            </p>
          </div>

          <div className="rounded-md border border-border bg-card/50 backdrop-blur px-3 py-2">
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
              Preview dataset · Sample session
            </div>
          </div>
        </motion.div>

        <div className="mt-10">
          <TelemetryGraph data={data} />
        </div>
      </div>
    </section>
  );
}

