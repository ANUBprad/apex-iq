import { createFileRoute } from "@tanstack/react-router";
import { FloatingPanel, StatusDot } from "@/components/f1";
import { motion } from "framer-motion";
import { useMemoryQuery } from "@/hooks/useApiQueries";

export const Route = createFileRoute("/memory")({
  component: MemoryPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Memory" },
      {
        name: "description",
        content:
          "Race session memory & context store. Browse persistent memory entries, agent context, and confidence metrics.",
      },
      { property: "og:title", content: "APEXiq · Memory" },
      {
        property: "og:description",
        content:
          "Race session memory & context store. Browse persistent memory entries, agent context, and confidence metrics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "APEXiq · Memory" },
      {
        name: "twitter:description",
        content:
          "Race session memory & context store. Browse persistent memory entries, agent context, and confidence metrics.",
      },
    ],
  }),
});

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

const confidenceColors: Record<string, string> = {
  high: "#00FF85",
  medium: "#FFD400",
  low: "#E10600",
};

const confidenceDotColors: Record<string, "green" | "yellow" | "red"> = {
  high: "green",
  medium: "yellow",
  low: "red",
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function MemoryPage() {
  const { memories } = useMemoryQuery();

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="absolute inset-0 ambient-glow-left pointer-events-none" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-[1] p-5 space-y-4"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
            Memory
          </h1>
          <p className="text-[10px] text-[#666] mt-0.5">
            Race session memory & context store
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingPanel
            title="Memory Entries"
            titleRight={
              <span className="text-[#666] font-mono text-[10px] tabular-nums">
                {memories?.length ?? 0} entries
              </span>
            }
          >
            {memories && memories.length > 0 ? (
              <div className="space-y-2">
                {memories.map((m) => (
                  <motion.div
                    key={m.id}
                    variants={fadeUp}
                    whileHover={{ y: -2 }}
                    className="p-3 rounded-sm bg-[#101010] border border-[#262626] hover:border-[#333] transition-colors cursor-default"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusDot
                            color={confidenceDotColors[m.confidence] ?? "white"}
                            size="sm"
                          />
                          <span className="text-xs text-white font-medium capitalize truncate">
                            {m.agent.replace(/_/g, " ")}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-[#666] px-1.5 py-0.5 rounded-sm bg-[#1A1A1A] border border-[#262626]">
                            {m.context_type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#A0A0A0] leading-relaxed line-clamp-2">
                          {m.content}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[9px] text-[#666] font-mono tabular-nums">
                          {formatTimestamp(m.timestamp)}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] text-[#666]">
                          <span
                            className="inline-block w-1 h-1 rounded-full animate-pulse"
                            style={{
                              backgroundColor:
                                confidenceColors[m.confidence] ?? "#666",
                            }}
                          />
                          <span className="font-mono tabular-nums">
                            {m.access_count}
                          </span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[11px] text-[#666]">
                  No memory entries found
                </p>
                <p className="text-[9px] text-[#666] mt-1">
                  Sessions will populate memory as agents process race data
                </p>
              </div>
            )}
          </FloatingPanel>
        </motion.div>
      </motion.div>
    </div>
  );
}
