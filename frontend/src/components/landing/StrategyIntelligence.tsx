import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type ScenarioId = "baseline" | "undercut" | "overcut";

const SCENARIOS: Record<
  ScenarioId,
  {
    label: string;
    recommendation: string;
    confidence: number;
    pitWindow: [number, number];
    gain: string;
    risk: "Low" | "Medium" | "High";
  }
> = {
  baseline: {
    label: "Baseline",
    recommendation: "Hold position. Build tyre delta for clean pit.",
    confidence: 0.72,
    pitWindow: [18, 21],
    gain: "+0.8s",
    risk: "Low",
  },
  undercut: {
    label: "Undercut",
    recommendation: "Pit early to attack gap ahead with warm-up advantage.",
    confidence: 0.66,
    pitWindow: [17, 19],
    gain: "+1.4s",
    risk: "Medium",
  },
  overcut: {
    label: "Overcut",
    recommendation: "Extend stint. Use clear air + tyre management to offset pit loss.",
    confidence: 0.58,
    pitWindow: [20, 23],
    gain: "+0.9s",
    risk: "High",
  },
};

function RiskPill({ risk }: { risk: "Low" | "Medium" | "High" }) {
  const cls =
    risk === "Low"
      ? "border-[rgba(57,255,20,0.22)] bg-[rgba(57,255,20,0.06)] text-green-telemetry"
      : risk === "Medium"
        ? "border-[rgba(0,217,255,0.22)] bg-[rgba(0,217,255,0.06)] text-cyan-electric"
        : "border-[rgba(220,20,60,0.25)] bg-[rgba(220,20,60,0.08)] text-red-ferrari";
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md border font-rajdhani text-[11px] tracking-[0.18em] uppercase ${cls}`}>
      {risk}
    </span>
  );
}

export function StrategyIntelligence() {
  const [scenario, setScenario] = useState<ScenarioId>("baseline");
  const data = SCENARIOS[scenario];

  const windowPct = useMemo(() => {
    const start = data.pitWindow[0];
    const end = data.pitWindow[1];
    const span = 60; // 0..60 (visual scale)
    const a = Math.max(0, Math.min(span, start));
    const b = Math.max(0, Math.min(span, end));
    return { left: (a / span) * 100, width: ((b - a) / span) * 100 };
  }, [data.pitWindow]);

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
              Strategy Intelligence
            </div>
            <h2 className="mt-4 font-grotesk font-semibold text-[28px] md:text-[40px] tracking-[-0.03em] text-foreground leading-[1.05]">
              Compare plans. Execute with confidence.
            </h2>
          </div>

          <div className="flex gap-2">
            {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => {
              const active = id === scenario;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setScenario(id)}
                  className={[
                    "px-3 h-9 rounded-md border font-rajdhani text-[12px] tracking-[0.18em] uppercase transition-colors",
                    active
                      ? "border-[rgba(220,20,60,0.35)] bg-[rgba(220,20,60,0.10)] text-foreground"
                      : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {SCENARIOS[id].label}
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
          {/* Recommendation panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="rounded-lg border border-border bg-card/60 backdrop-blur p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-muted-foreground">
                  Recommended Action
                </div>
                <div className="mt-3 font-grotesk text-[18px] md:text-[20px] font-semibold text-foreground leading-tight">
                  {data.recommendation}
                </div>
              </div>
              <RiskPill risk={data.risk} />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-md border border-border bg-background/40 p-3">
                <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Pit Window</div>
                <div className="mt-2 font-mono text-[14px] text-foreground tabular-nums">
                  L{data.pitWindow[0]}–L{data.pitWindow[1]}
                </div>
              </div>
              <div className="rounded-md border border-border bg-background/40 p-3">
                <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Expected Gain</div>
                <div className="mt-2 font-mono text-[14px] text-cyan-electric tabular-nums">{data.gain}</div>
              </div>
              <div className="rounded-md border border-border bg-background/40 p-3">
                <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Confidence</div>
                <div className="mt-2 font-mono text-[14px] text-foreground tabular-nums">
                  {Math.round(data.confidence * 100)}%
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between mb-2">
                <span className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                  Model Confidence
                </span>
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  {Math.round(data.confidence * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-border/40 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${data.confidence * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-gradient-to-r from-red-ferrari via-red-ferrari to-cyan-electric"
                />
              </div>
            </div>
          </motion.div>

          {/* Visual timeline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="rounded-lg border border-border bg-card/60 backdrop-blur p-6"
          >
            <div className="flex items-center justify-between">
              <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-muted-foreground">
                Pit Window Visualization
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">Laps Remaining: 42</div>
            </div>

            <div className="mt-6">
              <div className="h-10 rounded-md border border-border bg-background/40 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center">
                  {Array.from({ length: 13 }).map((_, i) => (
                    <div key={i} className="flex-1 h-full border-r border-border/30 last:border-r-0" />
                  ))}
                </div>

                {/* Optimal window */}
                <motion.div
                  className="absolute top-0 bottom-0 rounded-sm bg-[rgba(0,217,255,0.10)] border border-[rgba(0,217,255,0.25)]"
                  style={{ left: `${windowPct.left}%`, width: `${windowPct.width}%` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                />

                {/* Marker */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-red-ferrari/70"
                  style={{ left: "30%" }}
                  aria-hidden
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Traffic Risk", value: scenario === "undercut" ? "Medium" : "Low", color: "text-muted-foreground" },
                  { label: "Tyre Forecast", value: scenario === "overcut" ? "Declining" : "Stable", color: "text-muted-foreground" },
                  { label: "Rejoin", value: scenario === "undercut" ? "Clean" : "Likely Traffic", color: "text-muted-foreground" },
                ].map((m) => (
                  <div key={m.label} className="rounded-md border border-border bg-background/40 p-3">
                    <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{m.label}</div>
                    <div className={`mt-2 font-mono text-[13px] tabular-nums ${m.color}`}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 text-[13px] text-muted-foreground leading-[1.65]">
                Compare undercut / overcut paths with pit loss, warm-up deltas, and traffic projection. The visualization
                updates as you switch scenarios.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

