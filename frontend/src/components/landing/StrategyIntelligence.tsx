import { AnimatePresence, motion } from "framer-motion";
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
    label: "BASELINE",
    recommendation: "Hold position. Build tyre delta for clean pit.",
    confidence: 0.72,
    pitWindow: [18, 21],
    gain: "+0.8s",
    risk: "Low",
  },
  undercut: {
    label: "UNDERCUT",
    recommendation: "Pit early to attack gap ahead with warm-up advantage.",
    confidence: 0.66,
    pitWindow: [17, 19],
    gain: "+1.4s",
    risk: "Medium",
  },
  overcut: {
    label: "OVERCUT",
    recommendation:
      "Extend stint. Use clear air + tyre management to offset pit loss.",
    confidence: 0.58,
    pitWindow: [20, 23],
    gain: "+0.9s",
    risk: "High",
  },
};

function RiskPill({ risk }: { risk: "Low" | "Medium" | "High" }) {
  return (
    <span
      className={[
        "inline-flex items-center px-3 py-1.5 rounded-md border",
        "border-[rgba(6,182,212,0.35)] bg-[rgba(6,182,212,0.12)] text-cyan-electric",
        "font-rajdhani text-[11px] tracking-[0.18em] uppercase font-semibold",
      ].join(" ")}
    >
      {risk}
    </span>
  );
}

export function StrategyIntelligence() {
  const [scenario, setScenario] = useState<ScenarioId>("baseline");
  const data = SCENARIOS[scenario];
  const lapTotal = 60;
  const currentLap = 16;

  const windowPct = useMemo(() => {
    const start = data.pitWindow[0];
    const end = data.pitWindow[1];
    const span = lapTotal;
    const a = Math.max(0, Math.min(span, start));
    const b = Math.max(0, Math.min(span, end));
    return { left: (a / span) * 100, width: ((b - a) / span) * 100 };
  }, [data.pitWindow, lapTotal]);

  const currentPct = useMemo(
    () => (currentLap / lapTotal) * 100,
    [currentLap, lapTotal],
  );
  const confidencePct = Math.round(data.confidence * 100);
  const confidenceTone =
    confidencePct >= 75
      ? "bg-green-telemetry"
      : confidencePct >= 60
        ? "bg-cyan-electric"
        : "bg-red-ferrari";
  const confidenceText =
    confidencePct >= 75
      ? "text-green-telemetry"
      : confidencePct >= 60
        ? "text-cyan-electric"
        : "text-red-ferrari";

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-start justify-between gap-6 flex-wrap"
        >
          <div className="flex-1 max-w-[600px]">
            <div className="text-[12px] tracking-[0.18em] uppercase text-muted-foreground font-medium">
              STRATEGY INTELLIGENCE
            </div>
            <h2 className="mt-4 font-grotesk font-semibold text-[38px] md:text-[44px] lg:text-[48px] tracking-[-0.03em] text-foreground leading-[1.15]">
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
                    "px-6 h-10 rounded-md border font-rajdhani text-[12px] tracking-[0.12em] uppercase transition-all duration-150",
                    active
                      ? "border-red-ferrari bg-red-ferrari text-white shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
                      : "border-border bg-transparent text-muted-foreground hover:bg-card/40 hover:border-[rgba(6,182,212,0.35)] hover:text-cyan-electric",
                  ].join(" ")}
                >
                  {SCENARIOS[id].label}
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-[45%_55%] gap-12 w-full">
          {/* Recommendation panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="rounded-xl border border-border bg-card/60 backdrop-blur p-8 md:p-10 relative"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={scenario}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-8 right-8">
                  <RiskPill risk={data.risk} />
                </div>

                <div className="text-[12px] tracking-[0.12em] uppercase text-muted-foreground font-semibold">
                  RECOMMENDED ACTION
                </div>
                <div className="mt-6 font-grotesk text-[20px] md:text-[22px] font-semibold text-foreground leading-[1.45]">
                  {data.recommendation}
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      k: "PIT WINDOW",
                      v: `L${data.pitWindow[0]}–L${data.pitWindow[1]}`,
                      tone: "text-foreground",
                    },
                    {
                      k: "EXPECTED GAIN",
                      v: data.gain,
                      tone: "text-cyan-electric",
                    },
                    {
                      k: "CONFIDENCE",
                      v: `${confidencePct}%`,
                      tone: "text-foreground",
                    },
                  ].map((m) => (
                    <div
                      key={m.k}
                      className="rounded-lg border border-border bg-background/40 p-5 text-center"
                    >
                      <div className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
                        {m.k}
                      </div>
                      <div
                        className={`mt-2 font-mono text-[18px] font-semibold tabular-nums ${m.tone}`}
                      >
                        {m.v}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 border-t border-border pt-7">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="text-[12px] tracking-[0.12em] uppercase text-muted-foreground font-semibold">
                      MODEL CONFIDENCE
                    </div>
                    <div
                      className={`font-mono text-[14px] font-semibold tabular-nums ${confidenceText}`}
                    >
                      {confidencePct}%
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
                    <motion.div
                      key={`${scenario}-conf`}
                      initial={{ width: 0 }}
                      animate={{ width: `${confidencePct}%` }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full ${confidenceTone}`}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Visual timeline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="rounded-xl border border-border bg-card/60 backdrop-blur p-8 md:p-10"
          >
            <div className="flex items-center justify-between">
              <div className="text-[12px] tracking-[0.12em] uppercase text-muted-foreground font-semibold">
                PIT WINDOW VISUALIZATION
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Laps Remaining: 42
              </div>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="h-12 rounded-md border border-border bg-gradient-to-r from-background/40 via-card/40 to-background/40 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center opacity-80">
                    {Array.from({ length: 13 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-full border-r border-border/30 last:border-r-0"
                      />
                    ))}
                  </div>

                  <motion.div
                    key={`${scenario}-win`}
                    className="absolute top-0 bottom-0 bg-[rgba(6,182,212,0.18)] border-l-2 border-r-2 border-cyan-electric flex items-center justify-center"
                    style={{
                      left: `${windowPct.left}%`,
                      width: `${windowPct.width}%`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="font-mono text-[12px] font-semibold text-cyan-electric tabular-nums">
                      L{data.pitWindow[0]}–L{data.pitWindow[1]}
                    </div>
                  </motion.div>

                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-red-ferrari"
                    style={{ left: `${currentPct}%` }}
                    aria-hidden
                  />
                </div>

                <div className="mt-3 flex justify-between text-[10px] font-mono tracking-[0.18em] uppercase text-muted-foreground">
                  <span>L1</span>
                  <span>L{lapTotal}</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: "TRAFFIC RISK",
                    value: scenario === "undercut" ? "Medium" : "Low",
                  },
                  {
                    label: "TYRE FORECAST",
                    value: scenario === "overcut" ? "Declining" : "Stable",
                  },
                  {
                    label: "REJOIN",
                    value: scenario === "undercut" ? "Clean" : "Likely Traffic",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-border bg-background/40 p-5 text-center"
                  >
                    <div className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
                      {m.label}
                    </div>
                    <div className="mt-2 font-mono text-[16px] font-semibold tabular-nums text-foreground">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-[14px] text-muted-foreground leading-[1.65] max-w-[90%]">
                Compare undercut / overcut paths with pit loss, warm-up deltas,
                and traffic projection. The visualization updates as you switch
                scenarios.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
