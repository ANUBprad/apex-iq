import { motion } from "framer-motion";
import { ChevronRight, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GlowButton } from "@/components/ui-apex/GlowButton";

export function CTASection() {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative max-w-4xl mx-auto apex-glass rounded-2xl p-10 md:p-14 text-center overflow-hidden"
      >
        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-apex-red/20 blur-[100px] pointer-events-none"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 apex-grid-bg opacity-[0.04] pointer-events-none"
          aria-hidden
        />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-apex-cyan/30 bg-apex-cyan/5 mb-6"
          >
            <Zap className="w-3 h-3 text-apex-cyan" />
            <span className="font-space-grotesk text-[10px] tracking-[0.3em] text-apex-cyan uppercase">
              Race-ready intelligence
            </span>
          </motion.div>

          <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white tracking-wider leading-tight">
            Deploy strategy intelligence
            <br />
            <span className="text-apex-red apex-text-glow">before lights out</span>
          </h2>

          <p className="mt-5 font-inter text-sm md:text-base text-white/50 max-w-lg mx-auto leading-relaxed">
            Join engineering teams using APEXiq for live pit windows, compound modelling,
            and AI-assisted race calls — from practice to chequered flag.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link to="/dashboard">
              <GlowButton pulse className="flex items-center gap-2">
                Open Control Room <ChevronRight className="w-4 h-4" />
              </GlowButton>
            </Link>
            <Link to="/about">
              <GlowButton variant="outline" className="flex items-center gap-2">
                View Architecture <ChevronRight className="w-4 h-4" />
              </GlowButton>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
