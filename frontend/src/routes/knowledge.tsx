import { createFileRoute } from "@tanstack/react-router";
import { FloatingPanel, StatusDot } from "@/components/f1";
import { useKnowledgeArticlesQuery } from "@/hooks/useApiQueries";
import { motion } from "framer-motion";

export const Route = createFileRoute("/knowledge")({
  component: KnowledgePage,
  head: () => ({
    meta: [
      { title: "APEXiq · Knowledge Base" },
      {
        name: "description",
        content:
          "F1 technical knowledge base & circuit data — race strategy research, tyre degradation models, and technical documentation.",
      },
      { property: "og:title", content: "APEXiq · Knowledge Base" },
      {
        property: "og:description",
        content:
          "F1 technical knowledge base & circuit data — race strategy research, tyre degradation models, and technical documentation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "APEXiq · Knowledge Base" },
      {
        name: "twitter:description",
        content:
          "F1 technical knowledge base & circuit data — race strategy research, tyre degradation models, and technical documentation.",
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
    transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] as const },
  },
};

const categoryColors: Record<string, string> = {
  race_strategy: "#E10600",
  weather_pattern: "#00C8FF",
  tyre_analysis: "#F59E0B",
  circuit_knowledge: "#A855F7",
  safety_car: "#00FF85",
  driver_insight: "#FF6B6B",
  technical: "#60A5FA",
  default: "#666666",
};

function KnowledgePage() {
  const { data: articles, isLoading } = useKnowledgeArticlesQuery();

  const entries = articles ?? [];

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="absolute inset-0 ambient-glow-right pointer-events-none" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-[1] p-5 space-y-4"
      >
        <div>
          <h1 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
            Knowledge
          </h1>
          <p className="text-[10px] text-[#666] mt-0.5">
            F1 technical knowledge base & circuit data
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <FloatingPanel key={i} variant="compact">
                <div className="animate-pulse space-y-3">
                  <div className="h-3 bg-[#262626] rounded w-3/4" />
                  <div className="h-2 bg-[#262626] rounded w-1/4" />
                  <div className="h-2 bg-[#262626] rounded w-full" />
                  <div className="h-2 bg-[#262626] rounded w-2/3" />
                </div>
              </FloatingPanel>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <FloatingPanel variant="compact">
            <div className="text-center py-8">
              <p className="text-[11px] text-[#666]">
                No knowledge articles available
              </p>
              <p className="text-[9px] text-[#666] mt-1">
                Backend knowledge service is initializing
              </p>
            </div>
          </FloatingPanel>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((article) => {
              return (
                <motion.div
                  key={article.id}
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  className="rounded-md border border-[#262626] bg-[#141414] p-4 transition-all duration-250 hover:border-[#333]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xs text-white font-medium leading-snug">
                      {article.title}
                    </h3>
                    <StatusDot
                      color="green"
                      size="sm"
                      className="shrink-0 mt-0.5"
                    />
                  </div>

                  <span
                    className="inline-block text-[9px] uppercase tracking-[0.08em] font-medium px-1.5 py-0.5 rounded-sm mb-2"
                    style={{
                      color:
                        categoryColors[article.type] || categoryColors.default,
                      backgroundColor: `${categoryColors[article.type] || categoryColors.default}15`,
                    }}
                  >
                    {article.type.replace(/_/g, " ")}
                  </span>

                  <p className="text-[10px] text-[#A0A0A0] leading-relaxed mb-3 line-clamp-3">
                    {article.summary}
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-[#666] mb-2">
                    <span>{article.source}</span>
                    <span className="tabular-nums font-mono">
                      {article.date}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
