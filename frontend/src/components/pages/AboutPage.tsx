import { FloatingPanel } from "@/components/f1";
import { motion } from "framer-motion";
import { useMetricsQuery, useV3MetricsQuery } from "@/hooks/useApiQueries";

const teamMembers = [
  {
    name: "Strategy Core",
    role: "Monte Carlo Simulation Engine",
    initials: "SC",
    color: "#E10600",
  },
  {
    name: "Intelligence Pipeline",
    role: "V3 AI Recommendation System",
    initials: "IP",
    color: "#00C8FF",
  },
  {
    name: "Memory Graph",
    role: "ChromaDB Vector Store",
    initials: "MG",
    color: "#A855F7",
  },
  {
    name: "Telemetry API",
    role: "Race Data Integration",
    initials: "TA",
    color: "#00FF85",
  },
];

const versionHistory = [
  {
    version: "v5.0.0",
    date: "2025",
    tag: "Current",
    highlights:
      "Full V3 Intelligence · RAG Pipeline · Memory Graph · Premium UI Redesign",
  },
  {
    version: "v4.2.0",
    date: "2024",
    tag: "Production",
    highlights:
      "Celery Job Queue · Simulation Refinement · Historical Data Integration",
  },
  {
    version: "v3.0.0",
    date: "2024",
    tag: "Stable",
    highlights: "Monte Carlo Simulation · V2 API · Race Center Dashboard",
  },
  {
    version: "v2.0.0",
    date: "2023",
    tag: "Legacy",
    highlights: "Telemetry Processing · Data Pipeline · Initial API",
  },
  {
    version: "v1.0.0",
    date: "2023",
    tag: "Alpha",
    highlights: "Initial Release · Core Architecture",
  },
];

const techStack = [
  {
    category: "Frontend",
    items:
      "React · TanStack Router · TanStack Query · Framer Motion · Tailwind CSS v4 · Vite",
  },
  {
    category: "Backend",
    items: "FastAPI · Celery · Redis · ChromaDB · PostgreSQL",
  },
  {
    category: "AI/ML",
    items: "Groq API · LangChain · Sentence Transformers · RAG Pipeline",
  },
  {
    category: "Infrastructure",
    items: "Docker · Cloudflare Workers · GitHub Actions",
  },
];

export function AboutPage() {
  const { data: metrics } = useMetricsQuery();
  const { data: v3Metrics } = useV3MetricsQuery();
  const coreMetrics = [
    {
      label: "API Endpoints",
      value: metrics?.endpoints?.length?.toLocaleString() ?? "—",
      unit: "registered",
    },
    {
      label: "Uptime",
      value: metrics ? `${Math.floor(metrics.uptime_seconds / 3600)}h` : "—",
      unit: "online",
    },
    {
      label: "AI Documents",
      value: v3Metrics?.rag_documents_indexed?.toLocaleString() ?? "—",
      unit: "indexed",
    },
    {
      label: "Memory Entries",
      value: v3Metrics?.memory_entries?.toLocaleString() ?? "—",
      unit: "stored",
    },
  ];

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="absolute inset-0 ambient-glow pointer-events-none" />
      <div className="relative z-[1] p-5 space-y-4">
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-3xl font-bold text-[#E10600] font-[family-name:var(--font-heading)] tracking-tight">
              APEX<span className="text-white">iq</span>
            </span>
          </motion.div>
          <p className="text-[10px] text-[#666] mt-1">
            Intelligent Race Strategy Platform · Version 5.0.0
          </p>
          <p className="text-[10px] text-[#666] mt-3 max-w-2xl mx-auto leading-relaxed">
            APEXiq combines Monte Carlo simulation, real-time telemetry
            processing, and AI-powered strategy optimization to deliver
            race-winning decisions. Built for data-driven race engineering at
            every level.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4 space-y-4">
            <FloatingPanel variant="compact" title="System Architecture">
              <div className="text-[10px] space-y-3">
                {[
                  {
                    layer: "Presentation",
                    tech: "React · TanStack Router · Framer Motion",
                  },
                  { layer: "API Gateway", tech: "FastAPI · REST · WebSocket" },
                  { layer: "Simulation", tech: "Celery · Monte Carlo · NumPy" },
                  { layer: "Intelligence", tech: "Groq · LangChain · RAG" },
                  { layer: "Storage", tech: "PostgreSQL · ChromaDB · Redis" },
                ].map((l, i) => (
                  <motion.div
                    key={l.layer}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-0.5 bg-[#E10600]" />
                      <span className="text-white font-medium">{l.layer}</span>
                    </div>
                    <p className="text-[#666] ml-4">{l.tech}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingPanel>
            <FloatingPanel variant="compact" title="Tech Stack">
              <div className="space-y-2">
                {techStack.map((t, i) => (
                  <motion.div
                    key={t.category}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="border-b border-[#262626]/50 pb-1.5 last:border-0"
                  >
                    <span className="text-[10px] text-[#E10600] font-medium">
                      {t.category}
                    </span>
                    <p className="text-[10px] text-[#A0A0A0]">{t.items}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingPanel>
          </div>

          <div className="col-span-5 space-y-4">
            <FloatingPanel variant="compact" title="Version History">
              <div className="space-y-1">
                {versionHistory.map((v, i) => (
                  <motion.div
                    key={v.version}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`p-2 rounded-sm ${v.tag === "Current" ? "bg-[#E10600]/5 border border-[#E10600]/20" : "border border-transparent"}`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-white font-mono font-medium">
                        {v.version}
                      </span>
                      <span className="text-[9px] text-[#E10600] font-mono">
                        {v.tag}
                      </span>
                      <span className="text-[9px] text-[#666] font-mono ml-auto">
                        {v.date}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#666]">{v.highlights}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingPanel>
            <FloatingPanel variant="compact" title="Core Metrics">
              <div className="grid grid-cols-2 gap-3">
                {coreMetrics.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="text-center p-2 rounded-sm bg-[#101010] border border-[#262626]"
                  >
                    <span className="text-lg font-bold text-white font-mono">
                      {m.value}
                    </span>
                    <span className="block text-[9px] text-[#666]">
                      {m.unit}
                    </span>
                    <span className="block text-[9px] text-[#E10600]">
                      {m.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </FloatingPanel>
          </div>

          <div className="col-span-3 space-y-4">
            <FloatingPanel variant="compact" title="Core Systems">
              <div className="space-y-2">
                {teamMembers.map((m, i) => (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2 p-1.5 rounded-sm bg-[#101010]/50"
                  >
                    <div
                      className="w-6 h-6 rounded-sm flex items-center justify-center text-[8px] font-bold"
                      style={{
                        backgroundColor: `${m.color}20`,
                        color: m.color,
                        border: `1px solid ${m.color}40`,
                      }}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <span className="text-[10px] text-white block">
                        {m.name}
                      </span>
                      <span className="text-[8px] text-[#666]">{m.role}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FloatingPanel>
            <FloatingPanel variant="compact" title="License">
              <p className="text-[10px] text-[#A0A0A0] leading-relaxed">
                APEXiq is proprietary race strategy software. All rights
                reserved. Unauthorized reproduction or distribution prohibited.
              </p>
              <p className="text-[10px] text-[#666] mt-2">
                © 2023-2025 APEXiq Systems
              </p>
            </FloatingPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
