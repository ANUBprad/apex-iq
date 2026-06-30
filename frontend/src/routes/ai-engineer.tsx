import { createFileRoute } from "@tanstack/react-router";
import { FloatingPanel, ConfidenceMeter } from "@/components/f1";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useV3Query, useV3MetricsQuery } from "@/hooks/useApiQueries";

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

export const Route = createFileRoute("/ai-engineer")({
  component: AIEngineerPage,
  head: () => ({
    meta: [
      { title: "APEXiq · AI Engineer" },
      {
        name: "description",
        content:
          "AI-powered F1 race engineer console. Ask questions, get strategy recommendations, and explore reasoning chains.",
      },
      { property: "og:title", content: "APEXiq · AI Engineer" },
      {
        property: "og:description",
        content:
          "AI-powered F1 race engineer console. Ask questions, get strategy recommendations, and explore reasoning chains.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "APEXiq · AI Engineer" },
      {
        name: "twitter:description",
        content:
          "AI-powered F1 race engineer console. Ask questions, get strategy recommendations, and explore reasoning chains.",
      },
    ],
  }),
});

type ChatMessage = { role: "engineer" | "user"; msg: string; time: string };

function createInitialMessage(): ChatMessage {
  return {
    role: "engineer",
    msg: "APEXiq AI Engineer initialized. All systems nominal. How can I assist with race strategy today?",
    time: "",
  };
}

const suggestions = [
  "Best strategy for Monaco wet race",
  "Compare soft vs medium at Silverstone",
  "Risk assessment for Spa",
  "What if safety car at lap 15",
];

const pipelineStages = [
  { name: "Query Analysis", key: "query" },
  { name: "Knowledge Retrieval", key: "retrieval" },
  { name: "Simulation Run", key: "simulation" },
  { name: "Risk Assessment", key: "risk" },
  { name: "Confidence Scoring", key: "confidence" },
];

function AIEngineerPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createInitialMessage(),
  ]);
  const v3Mutation = useV3Query();
  const metricsQuery = useV3MetricsQuery();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev[0]?.time === "") {
        const now = new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return [{ ...prev[0], time: now }, ...prev.slice(1)];
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || v3Mutation.isPending) return;
    const time = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setMessages((prev) => [...prev, { role: "user", msg: input, time }]);
    v3Mutation.mutate(
      { query: input, circuit: "monaco", include_explainability: true },
      {
        onSuccess: (data) => {
          const t = new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          const msg =
            (data.recommendation as Record<string, string>)?.strategy ||
            (data.recommendation as Record<string, string>)?.recommendation ||
            "Analysis complete. Check panel for details.";
          setMessages((prev) => [
            ...prev,
            {
              role: "engineer",
              msg:
                typeof msg === "string"
                  ? msg
                  : "Analysis complete. Check panel for details.",
              time: t,
            },
          ]);
        },
        onError: (err) => {
          const t = new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setMessages((prev) => [
            ...prev,
            {
              role: "engineer",
              msg: `Error: ${err.message}. Verify backend is running.`,
              time: t,
            },
          ]);
        },
      },
    );
    setInput("");
  };

  const metrics = metricsQuery.data;
  const confBreakdown = v3Mutation.data?.confidence as
    | Record<string, number>
    | undefined;

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="absolute inset-0 ambient-glow-right pointer-events-none" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-[1] p-5 space-y-4"
      >
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
              AI Engineer Console
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-[#00C8FF]"
                />
                <span className="text-[9px] text-[#00C8FF] font-mono tracking-[0.1em]">
                  AI ACTIVE
                </span>
              </div>
              <span className="text-[10px] text-[#666] font-mono">
                v5.0 · {metrics?.agents_available ?? 0} agents
              </span>
              {metricsQuery.isLoading && (
                <span className="text-[9px] text-[#666]">loading...</span>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7 space-y-3">
            <motion.div variants={fadeUp}>
              <FloatingPanel
                title="Session"
                className="h-[calc(100vh-260px)] flex flex-col"
              >
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  <AnimatePresence>
                    {messages.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] p-2.5 rounded-sm text-xs leading-relaxed ${
                            m.role === "user"
                              ? "bg-[#E10600]/10 border border-[#E10600]/20 text-white"
                              : "bg-[#101010] border border-[#262626] text-[#A0A0A0]"
                          }`}
                        >
                          {m.time && (
                            <span className="block text-[8px] text-[#666] font-mono tabular-nums mb-1">
                              {m.time}
                            </span>
                          )}
                          {m.msg}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {v3Mutation.isPending && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-[#101010] border border-[#262626] p-2.5 rounded-sm flex items-center gap-2">
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-xs text-[#666]"
                        >
                          Processing via AI pipeline
                        </motion.span>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              animate={{ y: [0, -3, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                              className="w-1 h-1 rounded-full bg-[#00C8FF]"
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="mt-3 space-y-2 shrink-0">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      (e.preventDefault(), handleSubmit())
                    }
                    placeholder="Ask the AI Engineer..."
                    rows={2}
                    disabled={v3Mutation.isPending}
                    className="w-full bg-[#101010] border border-[#262626] rounded-sm px-3 py-2 text-xs text-white placeholder:text-[#666] focus:outline-none focus:border-[#00C8FF]/50 resize-none disabled:opacity-50 font-mono"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => setInput(s)}
                          disabled={v3Mutation.isPending}
                          className="text-[10px] text-[#666] border border-[#262626] rounded-sm px-2 py-1 hover:border-[#666] hover:text-[#A0A0A0] transition-colors disabled:opacity-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={v3Mutation.isPending || !input.trim()}
                      className="bg-[#00C8FF] text-black px-4 py-1.5 rounded-sm text-xs font-bold hover:bg-[#00C8FF]/80 transition-colors disabled:opacity-50 uppercase tracking-[0.08em] shrink-0"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </FloatingPanel>
            </motion.div>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-3">
            <motion.div variants={fadeUp}>
              <FloatingPanel title="Intelligence Pipeline">
                <div className="space-y-1">
                  {pipelineStages.map((stage, i) => {
                    const stageStatus =
                      stage.key === "risk" || stage.key === "confidence"
                        ? v3Mutation.data
                          ? "complete"
                          : "idle"
                        : v3Mutation.isPending
                          ? "active"
                          : v3Mutation.data
                            ? "complete"
                            : "idle";
                    return (
                      <motion.div
                        key={stage.key}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -2 }}
                        className="flex items-center gap-3 p-2 rounded-sm bg-[#101010] border border-[#262626]/50 hover:border-[#333] transition-all"
                      >
                        <motion.span
                          animate={
                            stageStatus === "active"
                              ? { scale: [1, 1.4, 1] }
                              : {}
                          }
                          transition={{
                            duration: 1.5,
                            repeat: stageStatus === "active" ? Infinity : 0,
                          }}
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            stageStatus === "active"
                              ? "bg-[#00C8FF]"
                              : stageStatus === "complete"
                                ? "bg-[#00FF85]"
                                : "bg-[#666]"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-white font-medium">
                            {stage.name}
                          </span>
                        </div>
                        {stageStatus === "active" && (
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="text-[9px] text-[#00C8FF] font-mono"
                          >
                            RUNNING
                          </motion.span>
                        )}
                        {stageStatus === "complete" && (
                          <span className="text-[9px] text-[#00FF85] font-mono">
                            DONE
                          </span>
                        )}
                        {stageStatus === "idle" && (
                          <span className="text-[9px] text-[#666] font-mono">
                            STANDBY
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </FloatingPanel>
            </motion.div>

            <motion.div variants={fadeUp}>
              <FloatingPanel title="Confidence & Sources">
                <ConfidenceMeter
                  value={confBreakdown?.overall ?? 0}
                  label="Overall Confidence"
                  size="md"
                />
                <div className="mt-3 space-y-2">
                  <ConfidenceMeter
                    value={
                      confBreakdown?.rag ??
                      confBreakdown?.knowledge_retrieval ??
                      0
                    }
                    label="RAG Retrieval"
                    size="sm"
                  />
                  <ConfidenceMeter
                    value={confBreakdown?.simulation ?? 0}
                    label="Simulation"
                    size="sm"
                  />
                  <ConfidenceMeter
                    value={confBreakdown?.historical ?? 0}
                    label="Historical"
                    size="sm"
                  />
                  <ConfidenceMeter
                    value={confBreakdown?.memory ?? 0}
                    label="Memory"
                    size="sm"
                  />
                </div>
                {v3Mutation.data?.trust_score && (
                  <div className="mt-4 pt-3 border-t border-[#262626]/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#A0A0A0]">
                        Trust Score
                      </span>
                      <span className="text-xs text-[#00C8FF] font-mono tabular-nums">
                        {(v3Mutation.data.trust_score as Record<string, number>)
                          ?.score ?? 0}
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-[#262626]/50">
                  <span className="text-[9px] uppercase tracking-[0.12em] text-[#666] font-medium">
                    Response Latency
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#A0A0A0]">
                      Total pipeline
                    </span>
                    <span className="text-xs text-white font-mono tabular-nums">
                      {v3Mutation.data
                        ? `${metrics?.pipeline_depth ?? 0} stages`
                        : "—"}
                    </span>
                  </div>
                </div>
              </FloatingPanel>
            </motion.div>

            <motion.div variants={fadeUp}>
              <FloatingPanel title="Source Context">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Simulation", active: true },
                    {
                      label: "RAG",
                      active: (metrics?.rag_documents_indexed ?? 0) > 0,
                    },
                    {
                      label: "Historical",
                      active: (metrics?.rag_documents_indexed ?? 0) > 0,
                    },
                    {
                      label: "Memory",
                      active: (metrics?.memory_entries ?? 0) > 0,
                    },
                    { label: "Telemetry", active: false },
                  ].map((src) => (
                    <span
                      key={src.label}
                      className={`text-[10px] px-2 py-1 rounded-sm font-mono ${
                        src.active
                          ? "bg-[#00C8FF]/10 text-[#00C8FF] border border-[#00C8FF]/30"
                          : "bg-[#101010] text-[#666] border border-[#262626]"
                      }`}
                    >
                      {src.label}
                      {src.active && (
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="ml-1 inline-block w-1 h-1 rounded-full bg-[#00C8FF]"
                        />
                      )}
                    </span>
                  ))}
                </div>
              </FloatingPanel>
            </motion.div>

            <motion.div variants={fadeUp}>
              <FloatingPanel variant="compact" title="Evidence Sources">
                <div className="space-y-2 text-xs">
                  {[
                    {
                      label: "Simulation Runs",
                      value: "—",
                      color: "text-white",
                    },
                    {
                      label: "Historical Races",
                      value: String(metrics?.rag_documents_indexed ?? 0),
                      color: "text-white",
                    },
                    {
                      label: "Memory Entries",
                      value: String(metrics?.memory_entries ?? 0),
                      color: "text-white",
                    },
                    {
                      label: "Confidence Threshold",
                      value: "—",
                      color: "text-[#00FF85]",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`flex justify-between py-1 ${
                        i < 3 ? "border-b border-[#262626]/50" : ""
                      }`}
                    >
                      <span className="text-[#A0A0A0]">{item.label}</span>
                      <span className={`${item.color} font-mono tabular-nums`}>
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </FloatingPanel>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
