import { motion } from "framer-motion";
import { CIRCUITS } from "@/lib/apex-data";

const DEG_META: Record<string, { color: string; pulse: string }> = {
  Low: { color: "text-green-telemetry", pulse: "bg-green-telemetry" },
  Medium: { color: "text-amber-400", pulse: "bg-amber-400" },
  High: { color: "text-red-ferrari", pulse: "bg-red-ferrari" },
};

function CircuitCard({ c, i }: { c: (typeof CIRCUITS)[number]; i: number }) {
  const deg = DEG_META[c.deg] ?? DEG_META.Medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-lg border border-border-subtle bg-bg-elevated overflow-hidden cursor-pointer transition-colors hover:border-border-visible"
    >
      {/* Top hairline */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-electric/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {/* Bottom hairline */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-ferrari/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Scan line on hover */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="scan-line" />
      </div>

      <div className="relative p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{c.flag}</span>
            <span className="font-rajdhani font-semibold text-text-primary text-sm tracking-wide">
              {c.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-border-subtle bg-bg-base">
            <span className={`w-1 h-1 rounded-full ${deg.pulse} pulse-dot`} />
            <span
              className={`font-mono text-[9px] tracking-[0.2em] uppercase ${deg.color}`}
            >
              {c.deg}
            </span>
          </div>
        </div>

        {/* Data row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-sm bg-bg-base border border-border-subtle px-3 py-2">
            <div className="font-mono text-[8px] tracking-[0.25em] text-text-tertiary uppercase mb-0.5">
              PIT_LOSS
            </div>
            <div className="font-orbitron font-bold text-cyan-electric text-lg tabular-nums leading-none">
              {c.pitLoss}
              <span className="text-xs text-text-tertiary ml-0.5">s</span>
            </div>
          </div>
          <div className="rounded-sm bg-bg-base border border-border-subtle px-3 py-2">
            <div className="font-mono text-[8px] tracking-[0.25em] text-text-tertiary uppercase mb-0.5">
              DEG_INDEX
            </div>
            <div
              className={`font-orbitron font-bold text-lg tabular-nums leading-none ${deg.color}`}
            >
              {c.deg === "High" ? "0.87" : c.deg === "Medium" ? "0.54" : "0.21"}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-[2px] bg-bg-base rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                c.deg === "High"
                  ? "bg-red-ferrari"
                  : c.deg === "Medium"
                    ? "bg-amber-400"
                    : "bg-green-telemetry"
              }`}
              style={{
                width:
                  c.deg === "High" ? "87%" : c.deg === "Medium" ? "54%" : "21%",
              }}
            />
          </div>
          <span className="font-mono text-[8px] tracking-[0.15em] text-text-tertiary">
            CALIBRATED
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function CircuitIntelligence() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 apex-grid-bg opacity-[0.025]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-cyan-electric/5 blur-[120px]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-sm border border-cyan-electric/20 bg-cyan-electric/5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-electric pulse-dot" />
              <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-electric uppercase">
                Circuit Intelligence
              </span>
            </div>
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white tracking-wider leading-[1.05]">
            20+ Calibrated{" "}
            <span className="text-cyan-electric">Circuits</span>
          </h2>
          <p className="mt-4 font-inter text-sm md:text-base text-text-secondary max-w-xl leading-relaxed">
            Per-circuit calibration models — pit loss deltas, degradation
            indices, and surface grip profiles tuned from thousands of laps of
            historical telemetry.
          </p>
        </motion.div>

        {/* Circuit grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {CIRCUITS.map((c, i) => (
            <CircuitCard key={c.name} c={c} i={i} />
          ))}
        </div>

        {/* Bottom terminal line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 flex items-center gap-3 px-4 py-2.5 rounded-sm border border-border-subtle bg-bg-elevated"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-telemetry pulse-dot" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-text-tertiary uppercase">
            All systems nominal · {CIRCUITS.length} circuits loaded · Model v4.0
          </span>
        </motion.div>
      </div>
    </section>
  );
}
