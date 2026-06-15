import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Scenario = "Stay Out" | "Pit Now" | "Undercut" | "Overcut";

function buildProjection(seed: number) {
  const laps = 22;
  const base = 7.5;
  return Array.from({ length: laps }, (_, i) => {
    const t = i + 1;
    const wobble = (Math.sin(i / 3) + Math.cos(i / 5)) * 0.12 * seed;
    return {
      lap: t,
      stay: base + i * 0.06 + wobble,
      pit: base + i * 0.03 + wobble - 0.35,
      undercut: base + i * 0.028 + wobble - 0.48,
      overcut: base + i * 0.042 + wobble - 0.22,
    };
  });
}

const tipStyle = {
  background: "#1A1A1A",
  border: "1px solid #333333",
  borderRadius: 6,
  fontFamily: "JetBrains Mono",
  fontSize: 12,
  color: "#F5F5F5",
} as const;

export function SimulationEngine() {
  const [scenario, setScenario] = useState<Scenario>("Pit Now");
  const data = useMemo(() => buildProjection(0.9), []);

  const lines: {
    key: keyof (typeof data)[number];
    label: Scenario;
    color: string;
  }[] = [
    { key: "stay", label: "Stay Out", color: "rgba(245,245,245,0.8)" },
    { key: "pit", label: "Pit Now", color: "rgba(0,217,255,0.9)" },
    { key: "undercut", label: "Undercut", color: "rgba(220,20,60,0.9)" },
    { key: "overcut", label: "Overcut", color: "rgba(57,255,20,0.9)" },
  ];

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
              Simulation Engine
            </div>
            <h2 className="mt-4 font-grotesk font-semibold text-[28px] md:text-[40px] tracking-[-0.03em] text-foreground leading-[1.05]">
              “What happens if I pit now?”
            </h2>
            <p className="mt-5 text-[14px] md:text-[15px] text-muted-foreground leading-[1.8] max-w-2xl">
              Compare scenarios instantly — stay out, pit now, undercut, overcut
              — with projected deltas and outcome confidence.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(lines.map((l) => l.label) as Scenario[]).map((s) => {
              const active = s === scenario;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScenario(s)}
                  className={[
                    "px-3 h-9 rounded-md border font-rajdhani text-[12px] tracking-[0.18em] uppercase transition-colors",
                    active
                      ? "border-border bg-card text-foreground"
                      : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-4 items-start">
          <div className="rounded-lg border border-border bg-card/60 backdrop-blur p-4">
            <div className="flex items-center justify-between px-2 pt-1 pb-3">
              <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-muted-foreground">
                Position / Delta Projection (sample)
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Next window: L18–L21
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 10, right: 14, left: -8, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#333333"
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.35}
                  />
                  <XAxis
                    dataKey="lap"
                    stroke="#696969"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#696969"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tipStyle} />

                  {lines.map((l) => (
                    <Line
                      key={l.key}
                      type="monotone"
                      dataKey={l.key}
                      stroke={l.color}
                      dot={false}
                      strokeWidth={scenario === l.label ? 2.5 : 1.6}
                      opacity={scenario === l.label ? 1 : 0.35}
                      isAnimationActive
                      animationDuration={650}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/60 backdrop-blur p-6">
            <div className="font-rajdhani text-[12px] tracking-[0.22em] uppercase text-muted-foreground">
              Scenario Brief
            </div>
            <div className="mt-4 grid gap-3">
              {[
                { k: "Primary", v: scenario, c: "text-foreground" },
                {
                  k: "Projected Delta",
                  v:
                    scenario === "Undercut"
                      ? "+1.6s"
                      : scenario === "Pit Now"
                        ? "+1.1s"
                        : scenario === "Overcut"
                          ? "+0.6s"
                          : "+0.2s",
                  c: "text-cyan-electric",
                },
                {
                  k: "Risk",
                  v:
                    scenario === "Stay Out"
                      ? "Low"
                      : scenario === "Overcut"
                        ? "High"
                        : "Medium",
                  c: "text-muted-foreground",
                },
                {
                  k: "Confidence",
                  v:
                    scenario === "Undercut"
                      ? "61%"
                      : scenario === "Pit Now"
                        ? "68%"
                        : scenario === "Overcut"
                          ? "54%"
                          : "73%",
                  c: "text-muted-foreground",
                },
              ].map((row) => (
                <div
                  key={row.k}
                  className="rounded-md border border-border bg-background/40 p-3"
                >
                  <div className="font-rajdhani text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                    {row.k}
                  </div>
                  <div
                    className={`mt-2 font-mono text-[13px] tabular-nums ${row.c}`}
                  >
                    {row.v}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 text-[13px] text-muted-foreground leading-[1.65]">
              Run scenario modelling to understand the trade-off between
              immediate pit loss, warm-up delta, and traffic risk — before
              committing.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
