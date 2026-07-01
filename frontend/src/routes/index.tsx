import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useRef, useMemo } from "react";
import { LandingHero } from "@/components/landing/LandingHero";
import { usePipelineHealthQuery } from "@/hooks/useApiQueries";

const COPYRIGHT_YEAR = new Date().getFullYear().toString();

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "APEXiq · AI Race Intelligence OS" },
      {
        name: "description",
        content:
          "AI-powered Formula 1 race engineering and motorsport intelligence platform — strategy optimization, telemetry analysis, and simulation.",
      },
      { property: "og:title", content: "APEXiq · AI Race Intelligence OS" },
      {
        property: "og:description",
        content:
          "AI-powered Formula 1 race engineering and motorsport intelligence platform — strategy optimization, telemetry analysis, and simulation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "APEXiq · AI Race Intelligence OS" },
      {
        name: "twitter:description",
        content:
          "AI-powered Formula 1 race engineering and motorsport intelligence platform — strategy optimization, telemetry analysis, and simulation.",
      },
    ],
  }),
});

function SectionHeader({
  label,
  title,
  subtitle,
  align = "center",
}: {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className={`mb-16 ${align === "center" ? "text-center" : ""}`}
    >
      {label && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 text-[9px] tracking-[0.2em] uppercase text-[#E10600] font-medium mb-3"
        >
          <span className="w-4 h-px bg-[#E10600]/40" />
          {label}
          <span className="w-4 h-px bg-[#E10600]/40" />
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[family-name:var(--font-heading)] tracking-tight"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <p className="text-sm text-[#666] mt-4 max-w-lg mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

function GlassFeatureCard({
  title,
  desc,
  icon,
  color,
  index,
}: {
  title: string;
  desc: string;
  icon: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4 }}
      className="group relative bg-[#0A0A0A] border border-[#1E1E1E] p-6 hover:bg-[#0D0D0D] transition-all duration-500 rounded-sm overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-sm ring-1 ring-[#E10600]/20" />
      </div>
      <motion.span
        whileHover={{ scale: 1.15 }}
        className={`text-lg ${color} mb-3 block relative z-[1]`}
      >
        {icon}
      </motion.span>
      <h3 className="text-sm font-semibold text-white mb-1.5 font-[family-name:var(--font-heading)] relative z-[1]">
        {title}
      </h3>
      <p className="text-xs text-[#666] leading-relaxed relative z-[1]">
        {desc}
      </p>
    </motion.div>
  );
}

function PipelineCard({
  label,
  desc,
  color,
  value,
  index,
}: {
  label: string;
  desc: string;
  color: string;
  value: number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -2 }}
      className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-sm p-5 hover:bg-[#0D0D0D] transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-2 h-2 rounded-full ${color} relative`}>
          <div
            className={`absolute inset-0 rounded-full ${color} animate-ping opacity-20`}
          />
        </div>
        <span className="text-xs font-medium text-white">{label}</span>
      </div>
      <p className="text-[10px] text-[#666] leading-relaxed mb-3">{desc}</p>
      <div className="flex items-center gap-3">
        <span className="text-[9px] text-[#555] font-mono w-12">Health</span>
        <div className="flex-1 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${value}%` }}
            viewport={{ once: true }}
            transition={{
              duration: 1.0,
              delay: index * 0.08 + 0.3,
              ease: "easeOut",
            }}
            className={`h-full rounded-full ${color}`}
          />
        </div>
        <span className="text-[9px] text-[#555] font-mono w-8 text-right">
          {value}%
        </span>
      </div>
    </motion.div>
  );
}

function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const { data: pipelineHealth } = usePipelineHealthQuery();
  const healthComponents = pipelineHealth?.components ?? [];
  const particles = useMemo(() => {
    const rng = seededRandom(42);
    return Array.from({ length: 20 }, () => ({
      bg: [
        "rgba(225, 6, 0, 0.3)",
        "rgba(0, 200, 255, 0.2)",
        "rgba(255, 255, 255, 0.1)",
      ][Math.floor(rng() * 3)],
      left: `${rng() * 100}%`,
      top: `${rng() * 100}%`,
      duration: 4 + rng() * 4,
      delay: rng() * 4,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden">
      <LandingHero />

      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: p.bg,
              left: p.left,
              top: p.top,
              willChange: "transform, opacity",
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Features Section */}
      <section
        ref={featuresRef}
        id="features"
        className="relative z-[1] px-6 py-28 sm:py-36"
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="The Engine Room"
            title="Intelligence Pipeline"
            subtitle="Six integrated systems powering the race intelligence platform"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1A1A1A] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E10600]/5 via-transparent to-[#00C8FF]/5 pointer-events-none" />
            {[
              {
                title: "Race Strategy",
                desc: "AI-powered pit window optimization with Monte Carlo simulation across all tyre compounds.",
                icon: "◈",
                color: "text-[#E10600]",
              },
              {
                title: "Telemetry Analysis",
                desc: "Real-time telemetry processing with anomaly detection and degradation modelling.",
                icon: "▤",
                color: "text-[#00C8FF]",
              },
              {
                title: "Simulation Engine",
                desc: "Multi-variable what-if analysis with weather evolution, safety car probability, and traffic modelling.",
                icon: "▶",
                color: "text-[#00FF85]",
              },
              {
                title: "Knowledge Base",
                desc: "Vector-embedded historical race data with hybrid retrieval and semantic reranking.",
                icon: "◎",
                color: "text-[#FFD400]",
              },
              {
                title: "Confidence Engine",
                desc: "Multi-signal confidence scoring combining RAG context, simulation fidelity, and historical precedent.",
                icon: "◇",
                color: "text-[#A855F7]",
              },
              {
                title: "Memory System",
                desc: "Persistent strategy memory with TTL-based retention, similarity search, and outcome tracking.",
                icon: "◉",
                color: "text-[#FF8A00]",
              },
            ].map((feature, i) => (
              <GlassFeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Visualization */}
      <section className="relative z-[1] px-6 py-28 sm:py-36 carbon-fiber">
        <div className="absolute inset-0 ambient-glow pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-[1]">
          <SectionHeader
            title="System Architecture"
            subtitle="End-to-end intelligence pipeline health monitoring"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {(healthComponents.length > 0 ? healthComponents : []).map(
              (item, i) => (
                <PipelineCard key={item.label} {...item} index={i} />
              ),
            )}
          </div>
        </div>
      </section>

      {/* Pipeline Steps */}
      <section className="relative z-[1] px-6 py-28 sm:py-36">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            title="Backend Pipeline"
            subtitle="Six-stage intelligence flow from query to decision"
          />
          <div className="flex flex-col md:flex-row items-stretch gap-px bg-[#1A1A1A] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E10600]/5 via-transparent to-[#FF8A00]/5 pointer-events-none" />
            {[
              { num: "1", title: "Query Router", color: "text-[#E10600]" },
              { num: "2", title: "RAG Retrieval", color: "text-[#00C8FF]" },
              { num: "3", title: "Simulation", color: "text-[#00FF85]" },
              { num: "4", title: "Confidence", color: "text-[#FFD400]" },
              { num: "5", title: "Memory", color: "text-[#A855F7]" },
              { num: "6", title: "Decision", color: "text-[#FF8A00]" },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.05,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -3 }}
                className="flex-1 bg-[#0A0A0A] border border-[#1E1E1E] p-5 text-center hover:bg-[#0D0D0D] transition-all duration-300 group cursor-default relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.span
                  whileHover={{ scale: 1.15 }}
                  className={`text-base font-bold ${step.color} font-mono relative z-[1]`}
                >
                  {step.num.padStart(2, "0")}
                </motion.span>
                <h3
                  className={`text-xs font-semibold ${step.color} mt-2 relative z-[1]`}
                >
                  {step.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-[1] border-t border-[#1A1A1A] carbon-fiber-dark">
        <div className="px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-[#E10600] to-[#E10600]/80 rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-[8px]">AQ</span>
                </div>
                <span className="text-[10px] text-[#555] tracking-[0.12em] uppercase font-medium">
                  APEXiq Race Intelligence OS
                </span>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-[9px] text-[#444] font-mono tracking-wide">
                  {pipelineHealth ? "v4.5.0" : "v4.5.0"}
                </span>
                <span className="flex items-center gap-1.5 text-[9px] text-[#00FF85] font-mono">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-[#00FF85] animate-ping opacity-40" />
                    <span className="relative rounded-full bg-[#00FF85] w-1.5 h-1.5" />
                  </span>
                  System Online
                </span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[8px] text-[#333] tracking-wide">
                &copy; {COPYRIGHT_YEAR} APEXiq. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                {["Docs", "Status", "API"].map((item) => (
                  <span
                    key={item}
                    className="text-[8px] text-[#444] tracking-wide hover:text-[#666] transition-colors cursor-pointer"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
