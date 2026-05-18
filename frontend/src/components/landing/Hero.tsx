import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Particles } from "@/components/ui-apex/Particles";
import { GlowButton } from "@/components/ui-apex/GlowButton";
import heroImg from "@/assets/hero-f1.jpg";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center apex-radial-bg">
      {/* Background image with parallax */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.32 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/75 to-black" />
      <div className="absolute inset-0 apex-grid-bg opacity-[0.025]" />

      {/* Ambient glow blobs */}
      <div className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full bg-apex-red/12 blur-[140px] ambient-blob" />
      <div className="absolute -bottom-40 -right-40 w-[640px] h-[640px] rounded-full bg-apex-cyan/8 blur-[140px] ambient-blob" style={{ animationDelay: "4s" }} />

      <Particles count={20} />

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-apex-red pulse-dot" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-white/60 uppercase">Race Weekend · Live</span>
          <span className="w-px h-3 bg-white/15" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-apex-red uppercase">v3.2</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.55, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-orbitron font-bold text-[64px] md:text-[112px] tracking-[0.02em] text-white leading-[0.95]"
        >
          APEX<span className="text-apex-red apex-text-glow">iq</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-space-grotesk text-base md:text-lg text-white/55 tracking-[0.15em] uppercase"
        >
          AI Motorsport Strategy Intelligence
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 font-inter text-[15px] text-white/45 max-w-xl mx-auto leading-[1.7]"
        >
          Real-time race simulations, tyre degradation modelling, and pit strategy optimisation — engineered for the modern Formula 1 pit wall.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          <Link to="/dashboard">
            <GlowButton className="flex items-center gap-2">
              Enter Control Room <ArrowUpRight className="w-4 h-4" strokeWidth={1.8} />
            </GlowButton>
          </Link>
          <Link to="/telemetry">
            <GlowButton variant="outline" className="flex items-center gap-2">
              View Telemetry <ArrowUpRight className="w-4 h-4" strokeWidth={1.8} />
            </GlowButton>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.4em] text-white/35 uppercase">Scroll</span>
        <div className="relative w-px h-12 bg-white/10 overflow-hidden">
          <span className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-3 rounded-full bg-apex-red shadow-[0_0_10px_rgba(255,30,30,0.8)] scroll-down" />
        </div>
      </div>
    </section>
  );
}
