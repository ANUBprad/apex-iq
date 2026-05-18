import { motion } from "framer-motion";

const LETTERS = "APEXiq".split("");

export function CinematicLoader({ label = "Initializing Race Telemetry" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background apex-radial-bg overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 apex-grid-bg opacity-[0.05]" />

      {/* Ambient blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-apex-red/20 blur-[120px] ambient-blob" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-apex-red/15 blur-[120px] ambient-blob" style={{ animationDelay: "2s" }} />

      {/* Scan line */}
      <div className="scan-line" style={{ animationDuration: "2.4s" }} />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-apex-red/30 bg-apex-red/5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-apex-red pulse-dot" />
          <span className="font-space-grotesk text-[10px] tracking-[0.3em] text-apex-red uppercase">System Boot</span>
        </motion.div>

        {/* Wordmark */}
        <h1 className="font-orbitron font-black text-5xl md:text-7xl tracking-[0.08em] text-white apex-text-glow flex">
          {LETTERS.map((ch, i) => (
            <motion.span
              key={i}
              initial={{ y: 30, opacity: 0, filter: "blur(8px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        {/* Telemetry pulse rings */}
        <div className="relative w-24 h-24">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute inset-0 rounded-full border border-apex-red"
              style={{
                animation: `loader-ring 2s ease-out ${i * 0.6}s infinite`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-apex-red shadow-[0_0_20px_rgba(255,30,30,0.9)]" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-[280px] md:w-[360px] flex flex-col gap-2">
          <div className="flex justify-between font-space-grotesk text-[10px] tracking-[0.25em] uppercase">
            <span className="text-white/50">{label}</span>
            <span className="text-apex-red loader-percent">--%</span>
          </div>
          <div className="relative h-[2px] bg-white/10 overflow-hidden rounded-full">
            <span className="loader-bar absolute inset-y-0 left-0 bg-gradient-to-r from-apex-red via-apex-red to-apex-cyan shadow-[0_0_12px_rgba(255,30,30,0.7)]" />
          </div>
          <div className="flex justify-between font-mono text-[9px] text-white/30 tracking-widest mt-1">
            <span>SYS://CORE</span>
            <span className="loader-tick">0xA1F3</span>
            <span>NET://OK</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loader-ring {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes loader-bar-anim {
          0% { width: 0%; }
          60% { width: 85%; }
          100% { width: 100%; }
        }
        .loader-bar { animation: loader-bar-anim 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        @keyframes loader-percent-anim {
          0% { content: "00%"; }
          100% { content: "99%"; }
        }
        .loader-percent::before {
          content: "";
          animation: percent-flicker 0.15s steps(1) infinite;
        }
        @keyframes percent-flicker { 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
