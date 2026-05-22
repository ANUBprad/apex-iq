import { motion } from "framer-motion";

const ITEMS = [
  { title: "Tyre degradation", desc: "Stint-by-stint grip decay is non-linear and temperature-sensitive." },
  { title: "Pit timing", desc: "Pit windows are constrained by traffic, tyre warm-up, and track position." },
  { title: "Traffic", desc: "A clean rejoin can be worth more than raw pace — and it changes every lap." },
  { title: "Weather", desc: "Track evolution shifts braking points, degradation, and crossover decisions." },
  { title: "Safety cars", desc: "VSC/SC probabilities rewrite the optimal plan mid-stint." },
  { title: "Outcome uncertainty", desc: "Strategy is a probability game — you need scenarios, not guesses." },
] as const;

export function Problem() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start"
        >
          <div>
            <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-cyan-electric/80">
              The Problem
            </div>
            <h2 className="mt-4 font-grotesk font-semibold text-[28px] md:text-[40px] tracking-[-0.03em] text-foreground leading-[1.05]">
              Race strategy is a moving target.
            </h2>
            <p className="mt-5 text-[14px] md:text-[15px] text-muted-foreground leading-[1.8] max-w-2xl">
              Every lap is a new constraint set — tyres, traffic, weather, and safety car risk. The job isn’t
              “choose a plan”. It’s continuously comparing scenarios and executing the best option with the
              least regret.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {ITEMS.map((it, i) => (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.03, duration: 0.45 }}
                className="rounded-lg border border-border bg-card/60 backdrop-blur p-4"
              >
                <div className="font-rajdhani text-[12px] uppercase tracking-[0.14em] text-foreground">
                  {it.title}
                </div>
                <div className="mt-2 text-[13px] text-muted-foreground leading-[1.6]">{it.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
