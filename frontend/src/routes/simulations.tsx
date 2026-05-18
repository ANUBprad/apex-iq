import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlowButton } from "@/components/ui-apex/GlowButton";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/simulations")({
  component: SimulationsPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Race Simulations" },
      { name: "description", content: "Run race strategy, undercut and weather impact simulations through the APEXiq engine." },
    ],
  }),
});

const SIMS = [
  { title: "Race Strategy", desc: "Configure starting compound, stint count and circuit to project total race time.", out: "Predicted race time", value: "1:32:18.402" },
  { title: "Undercut Calculator", desc: "Set gap, pit delta and degradation rate to predict undercut window gain.", out: "Undercut gain", value: "+1.84s" },
  { title: "Weather Impact", desc: "Toggle rain across lap ranges to project pace delta and compound switch points.", out: "Net pace delta", value: "+3.2s/lap" },
];

function SimCard({ title, desc, out, value, i }: { title: string; desc: string; out: string; value: string; i: number }) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.6 }}
      className="apex-glass rounded-lg p-6 flex flex-col"
    >
      <div className="font-space-grotesk text-[10px] tracking-[0.3em] text-apex-red uppercase mb-2">// Module {i + 1}</div>
      <h3 className="font-orbitron font-bold text-xl text-white tracking-wider mb-3">{title}</h3>
      <p className="font-inter text-sm text-white/60 mb-6 flex-1">{desc}</p>

      <div className="apex-glass-cyan rounded-md p-4 mb-5">
        <div className="font-space-grotesk text-[10px] tracking-[0.2em] text-white/40 uppercase">{out}</div>
        <div className="font-rajdhani font-bold text-3xl text-apex-cyan">
          {done ? value : "—"}
        </div>
      </div>

      <GlowButton
        onClick={() => { setRunning(true); setTimeout(() => { setRunning(false); setDone(true); }, 1500); }}
        disabled={running}
        className="w-full flex items-center justify-center gap-2"
      >
        {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Computing</> : "Run Simulation"}
      </GlowButton>
    </motion.div>
  );
}

function SimulationsPage() {
  return (
    <div className="min-h-screen bg-background apex-radial-bg">
      <Navbar />
      <main className="pt-28 px-6 max-w-[1300px] mx-auto pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="font-space-grotesk text-[10px] tracking-[0.4em] text-apex-red uppercase mb-3">// Engine Modules</div>
          <h1 className="font-orbitron font-black text-5xl text-white tracking-wider apex-text-glow">SIMULATIONS</h1>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {SIMS.map((s, i) => <SimCard key={s.title} {...s} i={i} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
}
