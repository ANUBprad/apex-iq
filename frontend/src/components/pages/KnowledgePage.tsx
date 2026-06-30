import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FloatingPanel } from "@/components/f1";
import { useQuery } from "@tanstack/react-query";
import { getHistorical, getKnowledgeArticles } from "@/lib/api";
import {
  useHistoricalQuery,
  useV3MetricsQuery,
  useMemoryRecallQuery,
  useCircuitMemoryQuery,
  useCircuitsQuery,
} from "@/hooks/useApiQueries";

const filters = [
  "All",
  "race_analysis",
  "tyre_analysis",
  "safety_car",
  "strategy",
  "weather",
  "fuel_analysis",
];

export function KnowledgePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: circuits } = useCircuitsQuery();
  const circuitList = circuits?.map((c) => c.name) ?? [];

  const metricsQuery = useV3MetricsQuery();
  const historicalQuery = useHistoricalQuery(selectedCircuit ?? "");
  const memoryRecallQuery = useMemoryRecallQuery(
    debouncedSearch,
    selectedCircuit ?? undefined,
  );
  const circuitMemoryQuery = useCircuitMemoryQuery(selectedCircuit ?? "");

  const articlesQuery = useQuery({
    queryKey: ["knowledge-articles"],
    queryFn: () => getKnowledgeArticles(),
    staleTime: 300_000,
  });
  const articles = articlesQuery.data ?? [];

  const circuitDocCounts = useQuery({
    queryKey: ["circuit-doc-counts"],
    queryFn: async () => {
      const results: Record<string, number> = {};
      const names = circuits?.map((c) => c.name) ?? [
        "Monaco",
        "Silverstone",
        "Spa",
        "Bahrain",
        "Monza",
        "Singapore",
        "Suzuka",
      ];
      for (const c of names) {
        try {
          const data = await getHistorical(c);
          results[c] = (Array.isArray(data) ? data : []).length;
        } catch {
          results[c] = 0;
        }
      }
      return results;
    },
    staleTime: 300_000,
    enabled: circuits !== undefined,
  });

  const filtered =
    debouncedSearch || memoryRecallQuery.data
      ? articles.filter(
          (a) =>
            (activeFilter === "All" || a.type === activeFilter) &&
            (a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              a.circuit.toLowerCase().includes(debouncedSearch.toLowerCase())),
        )
      : articles.filter(
          (a) => activeFilter === "All" || a.type === activeFilter,
        );

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="absolute inset-0 ambient-glow-left pointer-events-none" />
      <div className="relative z-[1] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
              Knowledge Base
            </h1>
            <p className="text-[10px] text-[#666] mt-0.5">
              Intelligence database —
              {articlesQuery.isLoading
                ? " loading..."
                : articlesQuery.data
                  ? `${articles.length} articles`
                  : "cached"}
              {metricsQuery.data && (
                <span className="ml-2 text-[#666]">
                  · {metricsQuery.data.agents_available} agents
                </span>
              )}
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search knowledge base..."
            aria-label="Search knowledge base"
            className="w-64 bg-[#101010] border border-[#262626] rounded-sm px-3 py-1.5 text-xs text-white placeholder:text-[#666] focus:outline-none focus:border-[#E10600]/50"
          />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-9">
            {memoryRecallQuery.isLoading && (
              <div className="mb-4 text-[10px] text-[#00C8FF] font-mono">
                Searching memory...
              </div>
            )}

            {selectedCircuit && circuitMemoryQuery.data ? (
              <div className="mb-4">
                <button
                  onClick={() => setSelectedCircuit(null)}
                  className="text-[10px] text-[#00C8FF] font-mono hover:underline mb-2"
                >
                  ← Back to all articles
                </button>
                <FloatingPanel
                  variant="compact"
                  title={`Memory: ${selectedCircuit}`}
                >
                  <div className="text-[10px] text-[#A0A0A0] font-mono max-h-60 overflow-auto">
                    {circuitMemoryQuery.data.entries.length > 0 ? (
                      circuitMemoryQuery.data.entries.map((e, i) => (
                        <div
                          key={i}
                          className="py-1 border-b border-[#262626]/50 last:border-0"
                        >
                          <span className="text-white">{e.query}</span>
                          <span className="text-[#666] ml-2">
                            · {e.timestamp}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[#666]">
                        No memory entries for this circuit
                      </span>
                    )}
                  </div>
                </FloatingPanel>
              </div>
            ) : selectedCircuit && historicalQuery.data ? (
              <div className="mb-4">
                <button
                  onClick={() => setSelectedCircuit(null)}
                  className="text-[10px] text-[#00C8FF] font-mono hover:underline mb-2"
                >
                  ← Back to all articles
                </button>
                <FloatingPanel
                  variant="compact"
                  title={`Historical: ${selectedCircuit}`}
                >
                  <div className="text-[10px] text-[#A0A0A0] font-mono overflow-auto max-h-60">
                    {historicalQuery.data && historicalQuery.data.length > 0
                      ? historicalQuery.data.map((race, i) => (
                          <div
                            key={i}
                            className="py-1 border-b border-[#262626]/50 last:border-0"
                          >
                            <span className="text-white">
                              {race.winner ?? "—"}
                            </span>
                            <span className="text-[#666] ml-2">
                              · S{race.season} · {race.circuit}
                            </span>
                          </div>
                        ))
                      : "No historical data available"}
                  </div>
                </FloatingPanel>
              </div>
            ) : null}

            {!selectedCircuit && (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <FloatingPanel
                      variant="compact"
                      className="hover-lift cursor-pointer group h-full"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-[#E10600] text-[10px] mt-0.5">
                            ◎
                          </span>
                          <span className="text-xs text-white font-medium group-hover:text-[#E10600] transition-colors ml-2">
                            {article.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#666] leading-relaxed mt-1 flex-1">
                          {article.summary}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] mt-2 pt-2 border-t border-[#262626]/50">
                          <span className="text-[#E10600]">
                            {article.circuit}
                          </span>
                          <span className="text-[#666]">·</span>
                          <span className="text-[#A0A0A0]">
                            {article.type.replace(/_/g, " ")}
                          </span>
                          <span className="ml-auto text-[#666] font-mono">
                            {article.date}
                          </span>
                        </div>
                      </div>
                    </FloatingPanel>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-3 space-y-3">
            <FloatingPanel variant="compact" title="Filter by Type">
              <div className="space-y-0.5 text-xs">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`w-full text-left px-2 py-1.5 rounded-sm transition-colors ${activeFilter === f ? "bg-[#E10600]/10 text-[#E10600] font-medium" : "text-[#A0A0A0] hover:bg-[#101010] hover:text-white"}`}
                  >
                    {f === "All" ? "All" : f.replace(/_/g, " ")}
                    {f !== "All" && (
                      <span className="float-right text-[#666] font-mono">
                        {articles.filter((a) => a.type === f).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </FloatingPanel>
            <FloatingPanel variant="compact" title="Circuits Indexed">
              <div className="space-y-1 text-xs">
                {circuitList.map((c) => (
                  <motion.div
                    key={c}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() =>
                      setSelectedCircuit(selectedCircuit === c ? null : c)
                    }
                    className={`flex justify-between py-1 px-1 cursor-pointer rounded-sm transition-colors ${selectedCircuit === c ? "bg-[#E10600]/10 text-[#E10600]" : "hover:bg-[#101010]"}`}
                  >
                    <span
                      className={
                        selectedCircuit === c
                          ? "text-[#E10600]"
                          : "text-[#A0A0A0]"
                      }
                    >
                      {c}
                    </span>
                    <span className="text-[#666] font-mono">
                      {circuitDocCounts.data?.[c] ?? "..."}
                    </span>
                  </motion.div>
                ))}
              </div>
            </FloatingPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
