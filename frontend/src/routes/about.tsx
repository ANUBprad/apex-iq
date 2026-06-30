import { motion } from "framer-motion";
import { createFileRoute } from "@tanstack/react-router";
import { FloatingPanel, StatusDot } from "@/components/f1";
import { useSystemHealthQuery } from "@/hooks/useApiQueries";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] },
  },
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] },
  },
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

const techStack = [
  "React 19",
  "TypeScript",
  "TanStack Router",
  "TanStack Query",
  "Framer Motion",
  "Tailwind CSS",
  "FastAPI",
  "LangGraph",
  "LangChain",
  "Python 3.12",
  "ChromaDB",
  "Redis",
  "Docker",
];

const versionHistory = [
  {
    version: "v2.5.0",
    date: "2026-06-15",
    description:
      "Real-time pipeline health monitoring, V3 intelligence RAG memory, multi-agent orchestration.",
  },
  {
    version: "v2.4.0",
    date: "2026-05-01",
    description:
      "Monte Carlo simulations, race outcome predictions, wet-weather strategy engine.",
  },
  {
    version: "v2.3.0",
    date: "2026-03-20",
    description:
      "Pit window analysis, undercut detection, historical comparison dashboard.",
  },
  {
    version: "v2.2.0",
    date: "2026-02-10",
    description:
      "Driver & team profiling, safety car analysis, replay intelligence.",
  },
  {
    version: "v2.1.0",
    date: "2026-01-05",
    description:
      "Strategy timeline visualisation, confidence scoring, tyre degradation curves.",
  },
  {
    version: "v2.0.0",
    date: "2025-12-01",
    description:
      "Complete UI overhaul with F1 design system, realtime dashboards, API v2.",
  },
  {
    version: "v1.0.0",
    date: "2025-10-15",
    description:
      "Initial release — core strategy engine, basic dashboards, circuit catalogue.",
  },
];

function AboutPage() {
  const { data: health } = useSystemHealthQuery();

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="ambient-glow-right pointer-events-none fixed inset-0" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-[1] p-5 space-y-4"
      >
        <motion.div variants={slideIn} className="mb-1">
          <h1 className="text-[28px] font-bold tracking-tight text-white">
            About
          </h1>
          <p className="text-[13px] text-[#999999] mt-0.5">
            APEXiq — AI-powered F1 intelligence platform
          </p>
        </motion.div>

        {/* System Health */}
        <motion.div variants={fadeUp} whileHover={{ y: -2 }}>
          <FloatingPanel title="System Health" variant="glow-red">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              <motion.div variants={fadeUp} className="flex items-center gap-2">
                <StatusDot
                  color={health?.status === "healthy" ? "green" : "red"}
                  size="lg"
                />
                <span className="text-sm text-white font-medium capitalize">
                  {health?.status ?? "loading..."}
                </span>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="flex items-baseline gap-6 text-[13px]"
              >
                <div>
                  <span className="text-[#666666]">Version</span>{" "}
                  <span className="tabular-nums font-mono text-white">
                    {health?.version ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[#666666]">Uptime</span>{" "}
                  <span className="tabular-nums font-mono text-white">
                    {health?.uptime != null ? formatUptime(health.uptime) : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[#666666]">Endpoints</span>{" "}
                  <span className="tabular-nums font-mono text-white">
                    {health?.endpoints ?? "—"}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </FloatingPanel>
        </motion.div>

        {/* Technology Stack */}
        <motion.div variants={fadeUp} whileHover={{ y: -2 }}>
          <FloatingPanel title="Technology Stack" variant="default">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-wrap gap-x-5 gap-y-1"
            >
              {techStack.map((tech) => (
                <motion.span
                  key={tech}
                  variants={fadeUp}
                  className="text-[13px] text-[#CCCCCC]"
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>
          </FloatingPanel>
        </motion.div>

        {/* Version History */}
        <motion.div variants={fadeUp} whileHover={{ y: -2 }}>
          <FloatingPanel title="Version History" variant="default">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {versionHistory.map((entry) => (
                <motion.div
                  key={entry.version}
                  variants={fadeUp}
                  className="flex items-start gap-3 pb-2 border-b border-[#262626] last:border-0"
                >
                  <span className="tabular-nums font-mono text-[13px] text-[#E10600] shrink-0 w-[4.5rem]">
                    {entry.version}
                  </span>
                  <span className="tabular-nums font-mono text-[11px] text-[#666666] shrink-0 w-[5.5rem] pt-0.5">
                    {entry.date}
                  </span>
                  <span className="text-[13px] text-[#CCCCCC] leading-snug">
                    {entry.description}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </FloatingPanel>
        </motion.div>
      </motion.div>
    </div>
  );
}

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "APEXiq · About" },
      {
        name: "description",
        content:
          "About APEXiq — AI race intelligence operating system. System architecture, version history, and tech stack.",
      },
      { property: "og:title", content: "APEXiq · About" },
      {
        property: "og:description",
        content:
          "About APEXiq — AI race intelligence operating system. System architecture, version history, and tech stack.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "APEXiq · About" },
      {
        name: "twitter:description",
        content:
          "About APEXiq — AI race intelligence operating system. System architecture, version history, and tech stack.",
      },
    ],
  }),
});
