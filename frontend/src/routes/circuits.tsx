import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CIRCUITS } from "@/lib/apex-data";

export const Route = createFileRoute("/circuits")({
  component: CircuitsPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Circuit Intelligence" },
      { name: "description", content: "Explore circuits with pit loss, degradation characteristics, and strategy context." },
    ],
  }),
});

function CircuitMiniMap() {
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

function CircuitsPage() {
  const [selected, setSelected] = useState<(typeof CIRCUITS)[number] | null>(null);
  const selectedData = useMemo(() => selected, [selected]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-20 px-4 pb-10 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 flex items-end justify-between flex-wrap gap-3 pt-4"
        >
          <div>
            <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.5px] mb-1">
              Circuit Database
            </div>
            <h1 className="font-grotesk font-semibold text-2xl md:text-3xl text-foreground">
              Circuit Intelligence
            </h1>
          </div>
          <div className="rounded-md border border-border bg-card/40 px-3 py-2">
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
              Dataset · sample
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-4">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {CIRCUITS.map((c, i) => {
              const active = selected?.name === c.name;
              return (
                <motion.button
                  key={c.name}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.01, duration: 0.35 }}
                  onClick={() => setSelected(c)}
                  className={[
                    "text-left rounded-lg border p-5 transition-colors",
                    active ? "border-[rgba(0,217,255,0.35)] bg-card" : "border-border bg-card/60 hover:bg-card/80",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                        {c.flag} · {c.laps} LAPS
                      </div>
                      <div className="mt-2 font-grotesk text-[16px] font-semibold text-foreground">{c.name}</div>
                    </div>
                    <div className="h-12 w-20 rounded-md border border-border bg-background/40 overflow-hidden">
                      <CircuitMiniMap />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-md border border-border bg-background/40 p-3">
                      <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Pit Loss</div>
                      <div className="mt-2 font-mono text-[13px] text-cyan-electric tabular-nums">{c.pitLoss.toFixed(1)}s</div>
                    </div>
                    <div className="rounded-md border border-border bg-background/40 p-3">
                      <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Tyre Stress</div>
                      <div
                        className={[
                          "mt-2 font-mono text-[13px] tabular-nums",
                          c.deg === "High" ? "text-red-ferrari" : c.deg === "Low" ? "text-green-telemetry" : "text-cyan-electric",
                        ].join(" ")}
                      >
                        {c.deg}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="rounded-lg border border-border bg-card/60 backdrop-blur p-5 h-fit sticky top-24">
            <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-muted-foreground">
              Circuit Brief
            </div>
            {selectedData ? (
              <>
                <div className="mt-3 font-grotesk text-[18px] font-semibold text-foreground">{selectedData.name}</div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { k: "Pit Loss", v: `${selectedData.pitLoss.toFixed(1)}s`, c: "text-cyan-electric" },
                    { k: "Laps", v: `${selectedData.laps}`, c: "text-foreground" },
                    { k: "Tyre Stress", v: selectedData.deg, c: selectedData.deg === "High" ? "text-red-ferrari" : selectedData.deg === "Low" ? "text-green-telemetry" : "text-cyan-electric" },
                    { k: "Deg Rate", v: `${selectedData.degRate.toFixed(2)} s/lap`, c: "text-muted-foreground" },
                  ].map((row) => (
                    <div key={row.k} className="rounded-md border border-border bg-background/40 p-3">
                      <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{row.k}</div>
                      <div className={`mt-2 font-mono text-[13px] tabular-nums ${row.c}`}>{row.v}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-md border border-border bg-background/40 p-3">
                  <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Sector Splits (s)</div>
                  <div className="mt-2 flex gap-2">
                    {selectedData.sectors.map((s, idx) => (
                      <div key={idx} className="flex-1 rounded-md border border-border bg-card/50 p-2">
                        <div className="font-mono text-[10px] text-muted-foreground">S{idx + 1}</div>
                        <div className="font-mono text-[12px] text-foreground tabular-nums">{s.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-[13px] text-muted-foreground leading-[1.65]">
                  Select a circuit to view modelled characteristics and strategy context. Detailed analytics can extend this panel into a full
                  deep-dive page.
                </div>
              </>
            ) : (
              <div className="mt-4 text-[13px] text-muted-foreground leading-[1.65]">
                Select a circuit to view pit loss, degradation characteristics, and sector context.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

