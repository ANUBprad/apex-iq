import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CIRCUITS, COMPOUNDS } from "@/lib/apex-data";

export const Route = createFileRoute("/circuits")({
  component: CircuitsPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Circuit Intelligence" },
      {
        name: "description",
        content:
          "Explore circuits with pit loss, degradation characteristics, and strategy context.",
      },
    ],
  }),
});

function CircuitOutline({ variant = "mini" }: { variant?: "mini" | "panel" }) {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <path
        d="M18 52 C26 30, 46 22, 60 28 C74 34, 76 18, 92 20 C104 22, 108 38, 100 48 C92 58, 76 58, 70 66 C62 74, 42 72, 32 64 C24 58, 20 58, 18 52 Z"
        fill="none"
        stroke="rgba(6,182,212,0.78)"
        strokeWidth={variant === "panel" ? 3 : 2}
        strokeLinejoin="round"
      />
      <path
        d="M24 53 C31 36, 47 30, 59 34 C71 38, 76 24, 90 26 C100 28, 102 40, 96 47 C88 56, 74 56, 67 63 C59 70, 44 68, 35 62 C28 57, 25 57, 24 53 Z"
        fill="none"
        stroke="rgba(239,68,68,0.32)"
        strokeWidth={variant === "panel" ? 2 : 1.4}
        strokeDasharray="5 6"
      />
    </svg>
  );
}

function Gauge({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "cyan" | "green" | "amber";
}) {
  const pct = Math.max(0, Math.min(100, value));
  const bar =
    tone === "cyan"
      ? "from-cyan-electric/75 to-cyan-electric/10"
      : tone === "green"
        ? "from-green-telemetry/75 to-green-telemetry/10"
        : tone === "amber"
          ? "from-warning/75 to-warning/10"
          : "from-red-ferrari/75 to-red-ferrari/10";
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
          {label}
        </div>
        <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {Math.round(pct)}%
        </div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-border/40 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const pts = values.map((v, i) => `${i * 25},${60 - v}`).join(" ");
  return (
    <svg viewBox="0 0 100 60" className="w-full h-14">
      <polyline
        points={pts}
        fill="none"
        stroke="rgba(6,182,212,0.7)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points={pts}
        fill="none"
        stroke="rgba(239,68,68,0.22)"
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function CircuitsPage() {
  const [selected, setSelected] = useState<(typeof CIRCUITS)[number] | null>(
    null,
  );
  const selectedData = useMemo(() => selected, [selected]);
  const circuits = useMemo(() => CIRCUITS.slice(0, 20), []);
  const split = Boolean(selectedData);

  useEffect(() => {
    if (!selectedData) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedData]);

  const derived = useMemo(() => {
    if (!selectedData) return null;
    const base =
      selectedData.deg === "High" ? 70 : selectedData.deg === "Low" ? 32 : 52;
    const overtake = Math.round(
      Math.max(10, Math.min(95, base + (selectedData.pitLoss < 21 ? -6 : 6))),
    );
    const degradation = Math.round(
      Math.max(
        10,
        Math.min(
          95,
          selectedData.degRate * 60 +
            (selectedData.deg === "High"
              ? 20
              : selectedData.deg === "Low"
                ? -10
                : 8),
        ),
      ),
    );
    const safetyCar = Math.round(
      Math.max(
        8,
        Math.min(
          92,
          selectedData.pitLoss * 2.2 + (selectedData.deg === "High" ? 10 : 0),
        ),
      ),
    );
    const temp = Math.round(
      Math.max(15, Math.min(90, 35 + selectedData.degRate * 28)),
    );
    const tempTrend = temp >= 62 ? "↑" : temp <= 38 ? "↓" : "→";
    const compoundIds =
      selectedData.deg === "High"
        ? ["HARD", "MEDIUM"]
        : selectedData.deg === "Low"
          ? ["SOFT", "MEDIUM"]
          : ["MEDIUM", "HARD"];
    const compounds = COMPOUNDS.filter((c) => compoundIds.includes(c.id));
    const speedProfile = selectedData.sectors.map((s) =>
      Math.round(Math.max(10, Math.min(50, 52 - s))),
    );
    const gForce = selectedData.sectors.map((s) =>
      Math.round(Math.max(10, Math.min(50, 18 + (s - 18) * 1.4))),
    );
    return {
      overtake,
      degradation,
      safetyCar,
      temp,
      tempTrend,
      compounds,
      speedProfile,
      gForce,
    };
  }, [selectedData]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-20 px-4 pb-10 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 pt-4"
        >
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.5px] mb-1">
                Circuit Database
              </div>
              <h1 className="font-grotesk font-semibold text-[40px] md:text-[48px] text-foreground tracking-[-0.03em] leading-[1.02]">
                Circuit Intelligence
              </h1>
              <div className="mt-3 text-[14px] md:text-[15px] text-muted-foreground leading-[1.8] max-w-2xl">
                Click on any circuit to know about it.
              </div>
            </div>
            <div className="rounded-md border border-border bg-card/40 px-3 py-2">
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                Dataset · sample
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          layout
          transition={{
            layout: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
          }}
          className={split ? "grid gap-6 lg:grid-cols-2" : "grid gap-6"}
        >
          <motion.div
            layout
            transition={{
              layout: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
            }}
            className={split ? "sm:block hidden" : "block"}
          >
            <div
              className={[
                "grid w-full gap-6 p-6 rounded-xl border border-border bg-card/40 backdrop-blur",
                split
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
              ].join(" ")}
            >
              {circuits.map((c, i) => {
                const active = selectedData?.name === c.name;
                return (
                  <motion.button
                    key={c.name}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.05,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    onClick={() =>
                      setSelected((prev) => (prev?.name === c.name ? null : c))
                    }
                    className={[
                      "text-left rounded-xl border p-6 bg-card/60 backdrop-blur transition-all duration-150",
                      "hover:shadow-[0_12px_32px_rgba(0,0,0,0.14)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)] hover:scale-[1.02]",
                      active
                        ? "border-2 border-red-ferrari shadow-[0_0_20px_rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.04)]"
                        : "border-border",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
                          {c.flag} · {c.laps} LAPS
                        </div>
                        <div className="mt-2 font-grotesk text-[20px] md:text-[22px] font-semibold text-foreground">
                          {c.name}
                        </div>
                      </div>
                      <div className="h-12 w-20 rounded-md border border-border bg-background/40 overflow-hidden">
                        <CircuitOutline />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-background/40 p-3">
                        <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                          Lap Count
                        </div>
                        <div className="mt-2 font-mono text-[13px] text-foreground tabular-nums">
                          {c.laps}
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-background/40 p-3">
                        <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                          Pit Loss
                        </div>
                        <div className="mt-2 font-mono text-[13px] text-cyan-electric tabular-nums">
                          {c.pitLoss.toFixed(1)}s
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <AnimatePresence initial={false}>
            {selectedData && derived && (
              <>
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
                  onClick={() => setSelected(null)}
                />

                <motion.aside
                  key={selectedData.name}
                  initial={{ x: 600, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 600, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={[
                    "z-50 sm:z-auto",
                    "fixed inset-0 sm:static",
                    "bg-background sm:bg-transparent",
                    "sm:rounded-none",
                  ].join(" ")}
                >
                  <div className="h-full sm:h-auto sm:sticky sm:top-24 sm:rounded-xl sm:border sm:border-border sm:bg-card/60 sm:backdrop-blur sm:p-6 p-5 overflow-y-auto">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-muted-foreground">
                          Circuit Brief
                        </div>
                        <div className="mt-2 font-grotesk text-[28px] md:text-[32px] font-semibold tracking-[-0.03em] text-foreground">
                          {selectedData.name}
                        </div>
                        <div className="mt-1 text-[14px] text-muted-foreground">
                          {selectedData.flag}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="h-10 w-10 rounded-md border border-border bg-background/40 hover:bg-background/60 transition-colors flex items-center justify-center text-muted-foreground"
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>

                    <div className="mt-6 rounded-xl border border-border bg-card/40 p-5">
                      <div className="mx-auto w-full max-w-[520px] aspect-[3/2] rounded-lg border border-border bg-background/40 overflow-hidden p-4">
                        <CircuitOutline variant="panel" />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-background/40 p-4">
                        <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                          Pit Loss
                        </div>
                        <div className="mt-2 font-mono text-[16px] text-cyan-electric tabular-nums">
                          {selectedData.pitLoss.toFixed(1)}s
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-background/40 p-4">
                        <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                          Tyre Stress
                        </div>
                        <div
                          className={[
                            "mt-2 font-mono text-[16px] tabular-nums",
                            selectedData.deg === "High"
                              ? "text-red-ferrari"
                              : selectedData.deg === "Low"
                                ? "text-green-telemetry"
                                : "text-cyan-electric",
                          ].join(" ")}
                        >
                          {selectedData.deg}
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-background/40 p-4">
                        <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                          Tyre Degradation
                        </div>
                        <div className="mt-2 font-mono text-[16px] tabular-nums text-foreground">
                          {derived.degradation}%
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-background/40 p-4">
                        <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                          Track Temp Tendency
                        </div>
                        <div className="mt-2 font-mono text-[16px] tabular-nums text-foreground">
                          {derived.tempTrend} {derived.temp}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Gauge
                        label="Overtaking Difficulty"
                        value={derived.overtake}
                        tone="red"
                      />
                      <Gauge
                        label="Safety Car Probability"
                        value={derived.safetyCar}
                        tone="cyan"
                      />
                      <Gauge
                        label="Degradation Factor"
                        value={derived.degradation}
                        tone={selectedData.deg === "High" ? "amber" : "green"}
                      />
                    </div>

                    <div className="mt-6 rounded-xl border border-border bg-card/40 p-5">
                      <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-muted-foreground">
                        Strategy Insights
                      </div>
                      <div className="mt-4">
                        <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                          Suggested Compounds
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {derived.compounds.map((c) => (
                            <div
                              key={c.id}
                              className="px-3 py-1.5 rounded-md border border-border bg-background/40 text-[11px] font-semibold tracking-[0.14em] uppercase text-foreground flex items-center gap-2"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: c.color }}
                              />
                              {c.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                          Sector Breakdown
                        </div>
                        <div className="mt-2 flex gap-2">
                          {selectedData.sectors.map((s, idx) => (
                            <div
                              key={idx}
                              className="flex-1 rounded-md border border-border bg-background/40 p-3"
                            >
                              <div className="font-mono text-[10px] text-muted-foreground">
                                S{idx + 1}
                              </div>
                              <div className="mt-1 font-mono text-[12px] text-foreground tabular-nums">
                                {s.toFixed(1)}s
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-border bg-card/40 p-5">
                      <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-muted-foreground">
                        Telemetry Visuals
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-border bg-background/40 p-4">
                          <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                            Speed Profile
                          </div>
                          <div className="mt-2">
                            <Sparkline values={derived.speedProfile} />
                          </div>
                        </div>
                        <div className="rounded-lg border border-border bg-background/40 p-4">
                          <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                            G-Force Distribution
                          </div>
                          <div className="mt-2">
                            <Sparkline values={derived.gForce} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
