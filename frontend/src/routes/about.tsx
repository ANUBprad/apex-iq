import { createFileRoute } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Flag,
  Radio,
  Gauge,
  Thermometer,
  Wind,
  Droplets,
  Headphones,
  Cpu,
  LineChart,
  Wrench,
  Trophy,
  Timer,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Race Weekend Briefing" },
      {
        name: "description",
        content:
          "Inside the APEXiq pit wall — the people, the process, and the engineering philosophy behind a modern Formula 1 race strategy intelligence platform.",
      },
    ],
  }),
});

/* ───────────────────── DATA ───────────────────── */

const SESSIONS = [
  { code: "FP1", label: "Free Practice 1", time: "FRI 12:30", state: "complete" },
  { code: "FP2", label: "Free Practice 2", time: "FRI 16:00", state: "complete" },
  { code: "FP3", label: "Free Practice 3", time: "SAT 11:30", state: "complete" },
  { code: "QUA", label: "Qualifying", time: "SAT 15:00", state: "live" },
  { code: "RACE", label: "Grand Prix", time: "SUN 14:00", state: "upcoming" },
] as const;

const TRACK_CONDITIONS = [
  { icon: Thermometer, label: "Track temp", value: "42°C", tone: "text-apex-amber" },
  { icon: Thermometer, label: "Ambient", value: "27°C", tone: "text-apex-cyan" },
  { icon: Wind, label: "Wind", value: "11 kph", tone: "text-white/80" },
  { icon: Droplets, label: "Humidity", value: "38%", tone: "text-apex-cyan" },
];

const PIT_WALL = [
  {
    icon: Headphones,
    role: "Strategy Lead",
    name: "Race-Calls Module",
    bio: "Owns pit-window arbitrage, undercut/overcut detection, and safety-car branching across 10⁴ simulations per decision.",
    code: "STR-01",
  },
  {
    icon: Gauge,
    role: "Performance Engineer",
    name: "Tyre & Stint Model",
    bio: "Compound-aware degradation curves fused with thermal load, slip ratio and stint history across all five Pirelli compounds.",
    code: "PRF-02",
  },
  {
    icon: Cpu,
    role: "ML Architect",
    name: "Inference Pipeline",
    bio: "Sub-200ms feature engineering, gradient-boosted ensembles, and a low-latency feature store running on the edge.",
    code: "MLA-03",
  },
  {
    icon: Radio,
    role: "Race Engineer",
    name: "AI Copilot",
    bio: "GPT-class reasoning that translates raw telemetry into driver-friendly radio output and engineer-grade rationale.",
    code: "ENG-04",
  },
];

const LAP_TIMELINE = [
  { lap: "L01", note: "Lights out · clean getaway from P3", dot: "border-apex-cyan" },
  { lap: "L08", note: "Undercut window opens · DRS train forming ahead", dot: "border-apex-amber" },
  { lap: "L14", note: "BOX BOX · Medium → Hard, 2.3s stop", dot: "border-apex-red" },
  { lap: "L23", note: "VSC deployed · strategy re-evaluated in 180ms", dot: "border-apex-amber" },
  { lap: "L41", note: "Overtake into T6 · gap to leader 1.4s", dot: "border-apex-cyan" },
  { lap: "L57", note: "Chequered flag · P1 confirmed", dot: "border-apex-green" },
] as const;

const CHAMPIONSHIP = [
  { pos: 1, team: "APEXiq Strategy", pts: 487, delta: "+0" },
  { pos: 2, team: "Legacy Spreadsheets", pts: 312, delta: "-175" },
  { pos: 3, team: "Manual Pit Wall", pts: 268, delta: "-219" },
  { pos: 4, team: "Static Dashboards", pts: 154, delta: "-333" },
];

const STATS = [
  { v: 23, suffix: "", label: "Calibrated circuits" },
  { v: 12.4, suffix: "M", label: "Telemetry frames / race" },
  { v: 94.2, suffix: "%", label: "Model accuracy" },
  { v: 180, suffix: "ms", label: "Decision latency", prefix: "<" },
];

/* ───────────────────── HELPERS ───────────────────── */

function CountUp({
  to,
  suffix = "",
  prefix = "",
}: {
  to: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {Number.isInteger(to) ? Math.round(v) : v.toFixed(1)}
      {suffix}
    </span>
  );
}

function SectionLabel({ code, title }: { code: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="font-mono text-[10px] tracking-[0.4em] text-apex-red uppercase">
        {code}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-apex-red/40 via-white/10 to-transparent" />
      <span className="font-space-grotesk text-[11px] tracking-[0.3em] text-white/50 uppercase">
        {title}
      </span>
    </div>
  );
}

/* ───────────────────── PAGE ───────────────────── */

function AboutPage() {
  return (
    <div className="min-h-screen bg-background apex-radial-bg">
      <Navbar />

      <main className="pt-28 px-6 max-w-[1280px] mx-auto pb-24">
        {/* ───── HERO BRIEFING ───── */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 md:p-12 mb-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          <div className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-apex-red/15 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 w-[360px] h-[360px] rounded-full bg-apex-cyan/10 blur-[80px]" />
          <div className="pointer-events-none absolute inset-0 apex-grid-bg opacity-[0.03]" />

          <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-10 items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-apex-red/30 bg-apex-red/[0.06] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-apex-red pulse-dot" />
                <span className="font-mono text-[10px] tracking-[0.35em] text-apex-red uppercase">
                  Race Weekend · Briefing 03
                </span>
              </div>
              <h1 className="font-orbitron font-bold text-[44px] md:text-[64px] leading-[0.95] tracking-[0.02em] text-white">
                INSIDE THE
                <br />
                <span className="text-apex-red apex-text-glow">PIT WALL</span>
              </h1>
              <p className="mt-6 font-inter text-[15px] md:text-base text-white/55 leading-[1.7] max-w-xl">
                APEXiq is built like a race team — not a SaaS dashboard. Every module is a
                specialist on the pit wall, every decision is a sub-second call, and every
                stat traces back to a real lap on a real circuit.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 bg-white/[0.03]">
                  <MapPin className="w-3.5 h-3.5 text-apex-cyan" strokeWidth={1.8} />
                  <span className="font-mono text-[10px] tracking-[0.25em] text-white/70 uppercase">
                    Circuit · Spa-Francorchamps
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 h-8 rounded-full border border-apex-amber/30 bg-apex-amber/[0.05]">
                  <Flag className="w-3.5 h-3.5 text-apex-amber" strokeWidth={1.8} />
                  <span className="font-mono text-[10px] tracking-[0.25em] text-apex-amber uppercase">
                    Round 14 / 24
                  </span>
                </div>
              </div>
            </div>

            {/* Track conditions panel */}
            <div className="relative rounded-xl border border-white/[0.06] bg-black/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
                  Track Conditions
                </span>
                <span className="font-mono text-[10px] text-apex-green tracking-[0.2em]">
                  ● LIVE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TRACK_CONDITIONS.map((c) => (
                  <div
                    key={c.label}
                    className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3"
                  >
                    <c.icon className={`w-4 h-4 mb-2 ${c.tone}`} strokeWidth={1.6} />
                    <div className="font-orbitron text-lg text-white tabular-nums leading-none">
                      {c.value}
                    </div>
                    <div className="mt-1.5 font-mono text-[9px] tracking-[0.25em] text-white/40 uppercase">
                      {c.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ───── SESSION TIMELINE ───── */}
        <section className="mb-14">
          <SectionLabel code="// 01" title="Race Weekend Schedule" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SESSIONS.map((s, i) => {
              const isLive = s.state === "live";
              const isDone = s.state === "complete";
              return (
                <motion.div
                  key={s.code}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative rounded-xl border p-4 ${
                    isLive
                      ? "border-apex-red/40 bg-apex-red/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_30px_-10px_rgba(255,30,30,0.4)]"
                      : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`font-orbitron text-xs tracking-[0.2em] ${
                        isLive ? "text-apex-red" : isDone ? "text-white/40" : "text-white/70"
                      }`}
                    >
                      {s.code}
                    </span>
                    {isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-apex-red pulse-dot" />
                    )}
                    {isDone && (
                      <span className="font-mono text-[9px] tracking-[0.2em] text-white/30">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="font-space-grotesk text-[13px] text-white/85 leading-tight">
                    {s.label}
                  </div>
                  <div className="mt-2 font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
                    {s.time}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ───── TEAM RADIO QUOTE ───── */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 rounded-xl border border-white/[0.06] bg-gradient-to-r from-apex-red/[0.04] via-transparent to-apex-cyan/[0.04] p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5"
        >
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-apex-red/30 bg-apex-red/[0.06]">
              <Radio className="w-4 h-4 text-apex-red" strokeWidth={1.8} />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-apex-red uppercase">
                Team Radio
              </div>
              <div className="font-space-grotesk text-[11px] text-white/40">
                Channel 04 · Strategy
              </div>
            </div>
          </div>
          <div className="md:border-l md:border-white/[0.08] md:pl-6">
            <p className="font-space-grotesk text-[15px] md:text-base text-white/85 leading-[1.6] italic">
              “Box this lap, box this lap — undercut window is open, Hamilton is on
              degrading mediums and traffic clears in sector two.”
            </p>
            <div className="mt-2 font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
              — Strategy Lead · Lap 14 of 57
            </div>
          </div>
        </motion.section>

        {/* ───── PIT WALL CREW ───── */}
        <section className="mb-14">
          <SectionLabel code="// 02" title="The Pit Wall Crew" />
          <div className="grid md:grid-cols-2 gap-4">
            {PIT_WALL.map((p, i) => (
              <motion.article
                key={p.code}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.005] p-6 overflow-hidden"
              >
                <div className="pointer-events-none absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full bg-apex-red/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/10">
                      <p.icon className="w-5 h-5 text-apex-cyan" strokeWidth={1.6} />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.3em] text-apex-red uppercase">
                        {p.role}
                      </div>
                      <div className="font-orbitron text-[15px] text-white tracking-wide mt-0.5">
                        {p.name}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.25em] text-white/30 uppercase">
                    {p.code}
                  </span>
                </div>
                <p className="relative font-inter text-[13.5px] text-white/55 leading-[1.7]">
                  {p.bio}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ───── RACE TIMELINE + CHAMPIONSHIP ───── */}
        <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6 mb-14">
          {/* Lap-by-lap */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <SectionLabel code="// 03" title="Lap-By-Lap Engineering" />
            <ol className="relative space-y-4 pl-6">
              <span className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-apex-red/40 via-white/10 to-transparent" />
              {LAP_TIMELINE.map((l, i) => (
                <motion.li
                  key={l.lap}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="relative flex items-start gap-4"
                >
                  <span
                    className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 ${l.dot} bg-background`}
                  />
                  <span className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase w-10 shrink-0 mt-1">
                    {l.lap}
                  </span>
                  <span className="font-space-grotesk text-[13.5px] text-white/80 leading-[1.55]">
                    {l.note}
                  </span>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Championship */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-apex-amber" strokeWidth={1.8} />
                <span className="font-mono text-[10px] tracking-[0.35em] text-apex-amber uppercase">
                  Constructors
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
                After R13
              </span>
            </div>
            <div className="space-y-2">
              {CHAMPIONSHIP.map((c) => {
                const leader = c.pos === 1;
                return (
                  <div
                    key={c.team}
                    className={`flex items-center gap-4 rounded-lg px-3 py-2.5 border ${
                      leader
                        ? "border-apex-red/30 bg-apex-red/[0.06]"
                        : "border-white/[0.05] bg-white/[0.015]"
                    }`}
                  >
                    <span
                      className={`font-orbitron text-sm w-6 tabular-nums ${
                        leader ? "text-apex-red" : "text-white/40"
                      }`}
                    >
                      P{c.pos}
                    </span>
                    <span className="flex-1 font-space-grotesk text-[13px] text-white/85">
                      {c.team}
                    </span>
                    <span className="font-orbitron text-sm text-white tabular-nums">
                      {c.pts}
                    </span>
                    <span
                      className={`font-mono text-[10px] tracking-[0.2em] tabular-nums w-12 text-right ${
                        leader ? "text-apex-green" : "text-white/30"
                      }`}
                    >
                      {c.delta}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───── CONTROL LOOP / SYSTEM ARCHITECTURE ───── */}
        <section className="mb-14">
          <SectionLabel code="// 04" title="Control Loop" />
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3 font-orbitron text-[13px] tracking-wider">
              {[
                { name: "Telemetry", icon: LineChart, border: "border-apex-cyan/30", bg: "bg-apex-cyan/[0.05]", text: "text-apex-cyan" },
                { name: "Feature Store", icon: Cpu, border: "border-apex-cyan/30", bg: "bg-apex-cyan/[0.05]", text: "text-apex-cyan" },
                { name: "ML Inference", icon: Wrench, border: "border-apex-amber/30", bg: "bg-apex-amber/[0.05]", text: "text-apex-amber" },
                { name: "Strategy Engine", icon: Timer, border: "border-apex-red/30", bg: "bg-apex-red/[0.05]", text: "text-apex-red" },
                { name: "Pit Wall", icon: Radio, border: "border-apex-red/30", bg: "bg-apex-red/[0.05]", text: "text-apex-red" },
              ].map((n, i, a) => (
                <div key={n.name} className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-md border ${n.border} ${n.bg} text-white`}
                  >
                    <n.icon className={`w-3.5 h-3.5 ${n.text}`} strokeWidth={1.8} />
                    <span className="text-[12px] tracking-[0.15em]">{n.name}</span>
                  </div>
                  {i < a.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-white/30" strokeWidth={2} />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-6 font-inter text-[13.5px] text-white/50 leading-[1.7] max-w-3xl">
              Telemetry from 23 calibrated circuits streams into a low-latency feature
              store, feeds gradient-boosted tyre and pace models, and converges on a
              ranked strategy decision in under 180 milliseconds — the same loop, every
              lap, every race.
            </p>
          </div>
        </section>

        {/* ───── SEASON STATS ───── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.005] p-6 text-center"
            >
              <div className="font-orbitron font-medium text-[40px] text-white leading-none">
                <CountUp to={s.v} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div className="mt-3 font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
                {s.label}
              </div>
            </motion.div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}