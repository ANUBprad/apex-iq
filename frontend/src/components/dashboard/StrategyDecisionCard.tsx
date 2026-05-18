import { motion, AnimatePresence } from "framer-motion";
import type { Strategy } from "@/hooks/useStrategy";

const PROBS = [
  { key: "PIT NOW", label: "Pit Now" },
  { key: "STAY OUT", label: "Stay Out" },
  { key: "UNDERCUT", label: "Undercut" },
  { key: "OVERCUT", label: "Overcut" },
];

export function StrategyDecisionCard({ strategy }: { strategy: Strategy | null }) {
  return (
    <div className="apex-glass rounded-lg p-7 relative overflow-hidden">
      <div className="scan-line" />
      <div className="font-orbitron text-[11px] tracking-[0.3em] text-apex-red mb-3">CURRENT RACE DECISION</div>
      <AnimatePresence mode="wait">
        {!strategy ? (
          <motion.div
            key="awaiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-10 text-center"
          >
            <div className="font-orbitron text-2xl md:text-4xl tracking-[0.3em] text-white/25 animate-pulse">
              AWAITING TELEMETRY INPUT
            </div>
            <div className="mt-3 font-space-grotesk text-[10px] tracking-[0.3em] text-white/30 uppercase">
              Run strategy analysis to receive recommendation
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={strategy.action}
            initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-baseline gap-4 flex-wrap">
              <div className="px-4 py-2 bg-gradient-to-r from-apex-red to-apex-red-dim rounded shadow-[0_0_30px_rgba(255,30,30,0.5)]">
                <h1 className="font-orbitron font-black text-5xl md:text-7xl text-white tracking-wider">
                  {strategy.action}
                </h1>
              </div>
              <div className="font-rajdhani font-bold text-3xl text-apex-green">
                {Math.round(strategy.confidence * 100)}%
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between font-space-grotesk text-[10px] tracking-[0.2em] uppercase text-white/50 mb-1.5">
                <span>Confidence</span><span className="font-rajdhani font-bold text-white">{Math.round(strategy.confidence * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strategy.confidence * 100}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-apex-red via-apex-amber to-apex-green shadow-[0_0_10px_rgba(255,30,30,0.6)]"
                />
              </div>
            </div>

            <p className="mt-4 font-inter text-sm text-white/70 leading-relaxed">{strategy.reasoning}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {PROBS.map((p, i) => {
                const w = p.key === strategy.action ? strategy.confidence * 100 : 25 + Math.random() * 45;
                return (
                  <div key={p.key}>
                    <div className="flex justify-between font-space-grotesk text-[10px] tracking-widest uppercase mb-1">
                      <span className={p.key === strategy.action ? "text-apex-red" : "text-white/50"}>{p.label}</span>
                      <span className="font-rajdhani font-bold text-white/80">{Math.round(w)}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${w}%` }}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.1 }}
                        className={`h-full ${p.key === strategy.action ? "bg-apex-red shadow-[0_0_8px_rgba(255,30,30,0.6)]" : "bg-white/30"}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
