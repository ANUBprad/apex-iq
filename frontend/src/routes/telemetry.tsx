import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TelemetryCharts } from "@/components/dashboard/TelemetryCharts";

export const Route = createFileRoute("/telemetry")({
  component: TelemetryPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Telemetry Center" },
      { name: "description", content: "Live race data intelligence engine — tyre temperatures, stint analysis, and degradation modelling." },
    ],
  }),
});

const TYRES = [
  { id: "FL", temp: 98 },
  { id: "FR", temp: 104 },
  { id: "RL", temp: 92 },
  { id: "RR", temp: 110 },
];

function TyreRing({ id, temp }: { id: string; temp: number }) {
  const pct = Math.min(1, (temp - 60) / 80);
  const color = temp > 105 ? "oklch(0.62 0.25 27)" : temp > 95 ? "oklch(0.78 0.18 60)" : "oklch(0.82 0.15 215)";
  const c = 2 * Math.PI * 56;
  return (
    <div className="apex-glass rounded-lg p-5 flex flex-col items-center">
      <div className="font-space-grotesk text-[10px] tracking-[0.3em] text-white/50 mb-2">{id}</div>
      <svg width={140} height={140} className="-rotate-90">
        <circle cx={70} cy={70} r={56} stroke="rgba(255,255,255,0.08)" strokeWidth={8} fill="none" />
        <motion.circle
          cx={70} cy={70} r={56} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round"
          initial={{ strokeDasharray: c, strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * pct }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="-mt-24 font-rajdhani font-bold text-3xl text-white">{temp}°</div>
      <div className="mt-16 font-space-grotesk text-[10px] tracking-widest uppercase text-white/40">Surface temp</div>
    </div>
  );
}

function TelemetryPage() {
  return (
    <div className="min-h-screen bg-background apex-radial-bg">
      <Navbar />
      <main className="pt-28 px-6 max-w-[1500px] mx-auto pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="font-space-grotesk text-[10px] tracking-[0.4em] text-apex-red uppercase mb-3">// Live Race Data Intelligence</div>
          <h1 className="font-orbitron font-black text-5xl md:text-6xl text-white tracking-wider apex-text-glow">TELEMETRY CENTER</h1>
          <div className="mt-2 h-px w-32 bg-gradient-to-r from-apex-red to-transparent" />
        </motion.div>

        <section className="mb-10">
          <div className="font-orbitron text-xs tracking-[0.3em] text-apex-red mb-4">TYRE TEMPERATURE RINGS</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TYRES.map((t) => <TyreRing key={t.id} {...t} />)}
          </div>
        </section>

        <section>
          <div className="font-orbitron text-xs tracking-[0.3em] text-apex-red mb-4">CHART INTELLIGENCE GRID</div>
          <TelemetryCharts seed={1} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
