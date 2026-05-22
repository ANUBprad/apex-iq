import { motion } from "framer-motion";

const OUTPUTS = [
  "Tyre degradation exceeds target threshold.",
  "Pit window optimal between laps 18 and 21.",
  "Undercut opportunity available.",
  "Traffic model predicts clean rejoin.",
  "Weather risk increasing after lap 35.",
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
          className="flex items-end justify-between gap-6 flex-wrap"
        >
          <div>
            <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-cyan-electric/80">
              AI Race Engineer
            </div>
            <h2 className="mt-4 font-grotesk font-semibold text-[28px] md:text-[40px] tracking-[-0.03em] text-foreground leading-[1.05]">
              Briefing panel. Not a chatbot.
            </h2>
            <p className="mt-5 text-[14px] md:text-[15px] text-muted-foreground leading-[1.8] max-w-2xl">
              APEXiq surfaces actionable calls like an engineer in your headset — concise, contextual, and written for the
              pit wall.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-4 items-start">
          <div className="rounded-lg border border-border bg-card/60 backdrop-blur p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-muted-foreground">
                  Engineer Briefing
                </div>
                <div className="mt-2 font-grotesk text-[18px] font-semibold text-foreground">Lap 16 · Strategy Call</div>
              </div>
              <div className="rounded-md border border-[rgba(0,217,255,0.22)] bg-[rgba(0,217,255,0.06)] px-3 py-2">
                <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-cyan-electric">
                  Confidence
                </div>
                <div className="font-mono text-[14px] text-foreground tabular-nums mt-1">0.71</div>
              </div>
            </div>

            <div className="mt-5 rounded-md border border-border bg-background/40 overflow-hidden">
              <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                  ENG_BRIEF.v1
                </div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                  CH-STRAT
                </div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {OUTPUTS.map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-cyan-electric/80 shrink-0" />
                      <span className="text-[13px] text-foreground/90 leading-[1.65]">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/60 backdrop-blur p-6">
            <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-muted-foreground">
              Rationale Snapshot
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {[
                { k: "Tyre Forecast", v: "Cliff approaching", c: "text-red-ferrari" },
                { k: "Traffic", v: "Clean gap in 11s", c: "text-cyan-electric" },
                { k: "Weather", v: "Trend: increasing", c: "text-muted-foreground" },
                { k: "Alternate", v: "Extend 3 laps", c: "text-muted-foreground" },
              ].map((row) => (
                <div key={row.k} className="rounded-md border border-border bg-background/40 p-3">
                  <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{row.k}</div>
                  <div className={`mt-2 font-mono text-[13px] tabular-nums ${row.c}`}>{row.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 text-[13px] text-muted-foreground leading-[1.65]">
              The briefing panel is designed to slot into the command center: decision, window, risk, and the minimum
              rationale required to act.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

