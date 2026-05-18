import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { genDegCurve } from "@/lib/apex-data";
import { Activity, Gauge, Timer, TrendingDown } from "lucide-react";

const data = genDegCurve(0.5);

const STATS = [
  { icon: Gauge, label: "Peak Grip", value: "98.4%", tone: "text-apex-cyan" },
  { icon: TrendingDown, label: "Deg / Lap", value: "0.12s", tone: "text-apex-red" },
  { icon: Timer, label: "Stint Window", value: "L8 – L22", tone: "text-apex-amber" },
  { icon: Activity, label: "Confidence", value: "94.2%", tone: "text-white" },
];

export function TelemetryPreview() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-end justify-between flex-wrap gap-3"
        >
          <div>
            <div className="font-space-grotesk text-[10px] tracking-[0.4em] text-apex-red uppercase mb-2">
              // Live Telemetry Engine
            </div>
            <h2 className="font-orbitron font-bold text-2xl md:text-3xl text-white tracking-wider">
              Real-time degradation modelling
            </h2>
          </div>
          <div className="flex items-center gap-2 font-space-grotesk text-[10px] tracking-[0.3em] uppercase text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-apex-red pulse-dot" />
            Streaming · 12.4 Hz
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="apex-glass rounded-xl relative overflow-hidden"
        >
          <div className="scan-line" />

          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-apex-red/70" />
                <span className="w-2 h-2 rounded-full bg-apex-amber/70" />
                <span className="w-2 h-2 rounded-full bg-apex-cyan/70" />
              </div>
              <div className="font-orbitron text-[10px] tracking-[0.3em] text-white/70">
                TYRE_DEG.MODEL <span className="text-apex-red">v3.2</span>
              </div>
            </div>
            <div className="flex gap-3 font-space-grotesk text-[10px] tracking-widest uppercase">
              <span className="flex items-center gap-1.5 text-white/70"><span className="w-2 h-2 rounded-sm bg-apex-red" /> Soft</span>
              <span className="flex items-center gap-1.5 text-white/70"><span className="w-2 h-2 rounded-sm bg-apex-amber" /> Medium</span>
              <span className="flex items-center gap-1.5 text-white/70"><span className="w-2 h-2 rounded-sm bg-white/80" /> Hard</span>
            </div>
          </div>

          <div>
            {/* Chart */}
            <div className="p-4 relative">
              <div className="absolute top-4 left-6 font-orbitron text-[9px] tracking-[0.3em] text-apex-red/80 z-10">
                GRIP %
              </div>
              <div className="absolute bottom-6 right-6 font-orbitron text-[9px] tracking-[0.3em] text-white/40 z-10">
                LAP →
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g-soft" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.62 0.25 27)" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="oklch(0.62 0.25 27)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g-med" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.85 0.18 90)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="oklch(0.85 0.18 90)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g-hard" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.6)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
                    <XAxis dataKey="lap" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,30,30,0.3)", borderRadius: 6, fontFamily: "Rajdhani", fontSize: 12 }}
                      labelStyle={{ color: "#fff", fontFamily: "Orbitron", fontSize: 10, letterSpacing: "0.1em" }}
                    />
                    <ReferenceLine y={50} stroke="rgba(255,30,30,0.25)" strokeDasharray="3 3" label={{ value: "CLIFF", fill: "rgba(255,30,30,0.6)", fontSize: 9, fontFamily: "Orbitron", position: "insideTopRight" }} />
                    <Area type="monotone" dataKey="soft" stroke="oklch(0.62 0.25 27)" strokeWidth={2} fill="url(#g-soft)" animationDuration={1600} />
                    <Area type="monotone" dataKey="medium" stroke="oklch(0.85 0.18 90)" strokeWidth={1.5} fill="url(#g-med)" animationDuration={1800} />
                    <Area type="monotone" dataKey="hard" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} fill="url(#g-hard)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats strip below chart */}
            <div className="border-t border-white/5 bg-black/30 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                  className="border border-white/5 rounded-md p-2.5 bg-black/40 hover:border-apex-red/30 transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className={`w-3 h-3 ${s.tone}`} />
                    <span className="font-space-grotesk text-[9px] tracking-[0.2em] uppercase text-white/50">{s.label}</span>
                  </div>
                  <div className={`font-orbitron text-base font-bold ${s.tone}`}>{s.value}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
