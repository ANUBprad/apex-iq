import { motion } from "framer-motion";
import { CIRCUITS } from "@/lib/apex-data";

function CircuitMapMark() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <path
        d="M18 52 C26 30, 46 22, 60 28 C74 34, 76 18, 92 20 C104 22, 108 38, 100 48 C92 58, 76 58, 70 66 C62 74, 42 72, 32 64 C24 58, 20 58, 18 52 Z"
        fill="none"
        stroke="rgba(0,217,255,0.65)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 53 C31 36, 47 30, 59 34 C71 38, 76 24, 90 26 C100 28, 102 40, 96 47 C88 56, 74 56, 67 63 C59 70, 44 68, 35 62 C28 57, 25 57, 24 53 Z"
        fill="none"
        stroke="rgba(220,20,60,0.35)"
        strokeWidth="1.4"
        strokeDasharray="5 6"
      />
    </svg>
  );
}

export function CircuitIntelligence() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-cyan-electric/80 mb-2">
            Circuit Intelligence
          </div>
          <h2 className="font-grotesk font-semibold text-[28px] md:text-[40px] text-foreground tracking-[-0.03em] leading-[1.05]">
            Interactive circuit database
          </h2>
          <p className="mt-4 text-[14px] md:text-[15px] text-muted-foreground leading-[1.8] max-w-2xl">
            Explore pit loss, degradation characteristics, and strategy tendencies by track — designed for fast scanning and deeper dives.
          </p>
        </motion.div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CIRCUITS.slice(0, 12).map((c, i) => {
            const overtake =
              c.deg === "High" ? "Hard" : c.deg === "Low" ? "Very Hard" : "Medium";
            return (
              <motion.button
                type="button"
                key={c.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.02, duration: 0.45 }}
                className="text-left rounded-lg border border-border bg-card/60 backdrop-blur p-5 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                      {c.flag} · {c.laps} LAPS
                    </div>
                    <div className="mt-2 font-grotesk text-[16px] font-semibold text-foreground">{c.name}</div>
                  </div>
                  <div className="h-12 w-20 rounded-md border border-border bg-background/40 overflow-hidden">
                    <CircuitMapMark />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border bg-background/40 p-3">
                    <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                      Pit Loss
                    </div>
                    <div className="mt-2 font-mono text-[13px] text-cyan-electric tabular-nums">{c.pitLoss.toFixed(1)}s</div>
                  </div>
                  <div className="rounded-md border border-border bg-background/40 p-3">
                    <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                      Tyre Stress
                    </div>
                    <div
                      className={[
                        "mt-2 font-mono text-[13px] tabular-nums",
                        c.deg === "High" ? "text-red-ferrari" : c.deg === "Low" ? "text-green-telemetry" : "text-cyan-electric",
                      ].join(" ")}
                    >
                      {c.deg}
                    </div>
                  </div>
                  <div className="rounded-md border border-border bg-background/40 p-3">
                    <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                      Deg Rate
                    </div>
                    <div className="mt-2 font-mono text-[13px] text-foreground tabular-nums">{c.degRate.toFixed(2)} s/lap</div>
                  </div>
                  <div className="rounded-md border border-border bg-background/40 p-3">
                    <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                      Overtake
                    </div>
                    <div className="mt-2 font-mono text-[13px] text-muted-foreground tabular-nums">{overtake}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
