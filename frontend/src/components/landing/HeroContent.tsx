import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

interface HeroContentProps {
  onEnterMission: () => void;
}

const featureTags = [
  "Race Strategy",
  "Telemetry",
  "Simulation",
  "Knowledge Base",
  "Confidence Engine",
  "Memory System",
];

export function HeroContent({ onEnterMission }: HeroContentProps) {
  const ctaRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [ctaOffset, setCtaOffset] = useState({ x: 0, y: 0 });
  const [ctaHovered, setCtaHovered] = useState(false);

  const handleCtaMove = (e: React.MouseEvent) => {
    const el = ctaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCtaOffset({
      x: (e.clientX - rect.left - rect.width / 2) * 0.15,
      y: (e.clientY - rect.top - rect.height / 2) * 0.15,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{ willChange: "transform, opacity" }}
      className="relative z-10 text-center px-6 max-w-4xl mx-auto"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#E10600]/60 to-transparent mx-auto mb-8"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-[#E10600] to-[#E10600]/80 rounded-sm flex items-center justify-center glow-red">
              <span className="text-white font-bold text-[28px] font-[family-name:var(--font-heading)]">
                AQ
              </span>
            </div>
            <motion.div
              className="absolute -inset-2 rounded-sm border border-[#E10600]/20"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
            APEX<span className="text-[#E10600]">iq</span>
          </h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="flex items-center justify-center gap-3 mb-6"
      >
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-[#00FF85] animate-ping opacity-30" />
          <span className="relative rounded-full bg-[#00FF85] w-2 h-2" />
        </span>
        <span className="text-[10px] tracking-[0.18em] uppercase text-[#888888] font-medium">
          AI Race Intelligence OS
        </span>
        <span className="w-4 h-px bg-[#333]" />
        <span className="text-[10px] font-mono text-[#555]">v5.0</span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="text-lg sm:text-xl text-[#777] mb-10 max-w-2xl mx-auto leading-relaxed font-light"
      >
        Formula 1 race engineering platform — strategy optimization, telemetry
        analysis, and Monte Carlo simulation for the pit wall.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        className="flex items-center justify-center gap-4"
      >
        <motion.button
          ref={ctaRef}
          onClick={onEnterMission}
          onMouseMove={handleCtaMove}
          onMouseEnter={() => setCtaHovered(true)}
          onMouseLeave={() => {
            setCtaOffset({ x: 0, y: 0 });
            setCtaHovered(false);
          }}
          animate={{ x: ctaOffset.x, y: ctaOffset.y }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 12,
            mass: 0.1,
          }}
          className="relative inline-flex items-center gap-2.5 bg-[#E10600] text-white px-8 py-4 rounded-sm text-sm font-medium overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-white/5"
            animate={{ opacity: ctaHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            animate={{ x: ctaHovered ? ["-200%", "200%"] : "-200%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          <span className="relative z-[1]">Enter Mission Control</span>
          <motion.span
            className="relative z-[1]"
            animate={{ x: ctaHovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.span>
        </motion.button>
        <button
          onClick={() => navigate({ to: "/about" })}
          className="relative inline-flex items-center gap-2 border border-[#333] text-[#999] px-8 py-4 rounded-sm text-sm font-medium hover:border-[#555] hover:text-white transition-all duration-300 bg-black/20 backdrop-blur-sm"
        >
          <span>About the System</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2.0 }}
        className="flex flex-wrap justify-center gap-2 mt-10"
      >
        {featureTags.map((tag) => (
          <span
            key={tag}
            className="text-[9px] tracking-[0.12em] uppercase text-[#666] px-3 py-1.5 rounded-sm font-medium border border-[#222] bg-black/30 backdrop-blur-sm hover:border-[#E10600]/30 hover:text-[#AAA] transition-all duration-300"
          >
            {tag}
          </span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.4 }}
        className="mt-16 flex flex-col items-center gap-2"
      >
        <span className="text-[8px] tracking-[0.2em] uppercase text-[#444] font-mono">
          Scroll
        </span>
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#444"
          strokeWidth="1.5"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}
