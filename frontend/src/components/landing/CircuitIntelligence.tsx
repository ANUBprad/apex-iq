import { motion } from "framer-motion";
import { CIRCUITS } from "@/lib/apex-data";

export function CircuitIntelligence() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="font-space-grotesk text-[10px] tracking-[0.4em] text-apex-red uppercase mb-3">
            // Circuit Intelligence
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl text-white tracking-wider">
            20+ Calibrated Circuits
          </h2>
        </motion.div>
      </div>

      <div className="overflow-x-auto pb-6 scrollbar-thin">
        <div className="flex gap-4 px-6 min-w-max">
          {CIRCUITS.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="apex-glass rounded-lg p-5 min-w-[220px] cursor-pointer relative group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{c.flag}</span>
                <span className="font-space-grotesk text-[9px] tracking-[0.2em] text-apex-red uppercase">Calibrated</span>
              </div>
              <div className="font-orbitron font-bold text-white text-lg tracking-wide mb-3">{c.name}</div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <div className="font-space-grotesk text-[9px] tracking-widest text-white/40 uppercase">Pit Loss</div>
                  <div className="font-rajdhani font-bold text-apex-cyan text-lg">{c.pitLoss}s</div>
                </div>
                <div>
                  <div className="font-space-grotesk text-[9px] tracking-widest text-white/40 uppercase">Deg</div>
                  <div className="font-rajdhani font-bold text-apex-amber text-lg">{c.deg}</div>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-apex-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
