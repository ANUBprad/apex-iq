import { AnimatePresence, motion } from "framer-motion";

const BRIEF = [
  {
    id: "deg",
    node: (
      <>
        Tyre degradation exceeds{" "}
        <span className="text-red-ferrari font-semibold">target threshold</span>
        .
      </>
    ),
  },
  {
    id: "window",
    node: (
      <>
        Pit window optimal between{" "}
        <span className="text-cyan-electric font-semibold">laps 18 and 21</span>
        .
      </>
    ),
  },
  {
    id: "undercut",
    node: (
      <>
        Undercut opportunity{" "}
        <span className="text-cyan-electric font-semibold">available</span>.
      </>
    ),
  },
  {
    id: "traffic",
    node: (
      <>
        Traffic model predicts{" "}
        <span className="text-green-telemetry font-semibold">clean rejoin</span>
        .
      </>
    ),
  },
  {
    id: "weather",
    node: (
      <>
        Weather risk{" "}
        <span className="text-warning font-semibold">increasing</span> after lap
        35.
      </>
    ),
  },
] as const;

export function AIRaceEngineer() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <div>
            <div className="text-[12px] tracking-[0.18em] uppercase text-muted-foreground font-medium">
              AI RACE ENGINEER
            </div>
            <h2 className="mt-4 font-grotesk font-semibold text-[38px] md:text-[44px] lg:text-[48px] tracking-[-0.03em] text-foreground leading-[1.15]">
              Briefing panel. Not a chatbot.
            </h2>
            <p className="mt-5 text-[16px] text-muted-foreground leading-[1.7] max-w-[700px]">
              APEXiq surfaces actionable calls like an engineer in your headset
              — concise, contextual, and written for the pit wall.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="rounded-xl border border-border bg-card/60 backdrop-blur p-8 md:p-10 relative"
          >
            <div className="absolute top-8 right-8 rounded-md border border-[rgba(6,182,212,0.35)] bg-[rgba(6,182,212,0.12)] px-4 py-2">
              <div className="text-[11px] tracking-[0.12em] uppercase text-cyan-electric font-semibold">
                CONFIDENCE
              </div>
              <div className="mt-1 font-mono text-[14px] font-semibold tabular-nums text-foreground">
                0.71
              </div>
            </div>

            <div className="text-[12px] tracking-[0.12em] uppercase text-muted-foreground font-semibold">
              ENGINEER BRIEFING
            </div>
            <div className="mt-4 font-grotesk text-[24px] md:text-[28px] font-semibold tracking-[-0.02em] text-foreground">
              Lap 16 · Strategy Call
            </div>

            <div className="mt-6 rounded-lg border border-border bg-background/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                  ENG_BRIEF_V1
                </div>
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                  CH-STRAT
                </div>
              </div>
              <div className="p-5">
                <ul className="space-y-3 text-[15px] text-foreground leading-[1.85]">
                  {BRIEF.map((t) => (
                    <li key={t.id} className="flex gap-3">
                      <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-cyan-electric/80 shrink-0" />
                      <span>{t.node}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="rounded-xl border border-border bg-card/60 backdrop-blur p-8 md:p-10"
          >
            <div className="text-[12px] tracking-[0.12em] uppercase text-muted-foreground font-semibold">
              RATIONALE SNAPSHOT
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  k: "TYRE FORECAST",
                  v: "Cliff approaching",
                  c: "text-red-ferrari",
                },
                {
                  k: "TRAFFIC",
                  v: "Clean gap in 11s",
                  c: "text-cyan-electric",
                },
                {
                  k: "WEATHER",
                  v: "Trend: increasing",
                  c: "text-muted-foreground",
                },
                {
                  k: "ALTERNATE",
                  v: "Extend 3 laps",
                  c: "text-muted-foreground",
                },
              ].map((row) => (
                <div
                  key={row.k}
                  className="rounded-lg border border-border bg-background/40 p-5"
                >
                  <div className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground font-semibold">
                    {row.k}
                  </div>
                  <div
                    className={`mt-2 font-grotesk text-[16px] md:text-[18px] font-semibold leading-[1.35] ${row.c}`}
                  >
                    {row.v}
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key="rationale"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-8 text-[14px] text-muted-foreground leading-[1.65]"
              >
                The briefing panel is designed to slot into the command center:
                decision, window, risk, and the minimum rationale required to
                act.
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
