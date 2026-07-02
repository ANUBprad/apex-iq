import { createFileRoute } from "@tanstack/react-router";
import { FloatingPanel, ConfidenceMeter, CardSkeleton } from "@/components/f1";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  useAIEngineerChat,
  useV3MetricsQuery,
  useCircuitsQuery,
  useTelemetryLiveQuery,
} from "@/hooks/useApiQueries";
import type { AIEngineerResponse } from "@/lib/api";

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
          "AI-powered F1 race engineer console with multi-agent intelligence pipeline, conversation memory, and live telemetry context.",
      },
    ],
  }),
});

type ChatMessage = {
  role: "engineer" | "user";
  msg: string;
  time: string;
  data?: AIEngineerResponse;
};

const suggestions = [
  "Best strategy for Monaco wet race",
  "Compare soft vs medium at Silverstone",
  "Risk assessment for Spa",
  "What if safety car at lap 15",
];

const PipelineTimeline = memo(function PipelineTimeline({
  stages,
}: {
  stages: { name: string; status: string }[];
}) {
  return (
    <div className="space-y-1">
      {stages.map((stage, i) => (
        <motion.div
          key={stage.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-2.5 p-1.5 rounded-sm bg-[#101010] border border-[#262626]/50"
        >
          <motion.span
            animate={stage.status === "active" ? { scale: [1, 1.4, 1] } : {}}
            transition={{
              duration: 1.5,
              repeat: stage.status === "active" ? Infinity : 0,
            }}
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              stage.status === "active"
                ? "bg-[#00C8FF]"
                : stage.status === "complete"
                  ? "bg-[#00FF85]"
                  : "bg-[#262626]"
            }`}
          />
          <span
            className={`text-[10px] font-mono ${
              stage.status === "complete"
                ? "text-white"
                : stage.status === "active"
                  ? "text-[#00C8FF]"
                  : "text-[#666]"
            }`}
          >
            {stage.name}
          </span>
          {stage.status === "active" && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-[8px] text-[#00C8FF] font-mono ml-auto"
            >
              RUNNING
            </motion.span>
          )}
          {stage.status === "complete" && (
            <span className="text-[8px] text-[#00FF85] font-mono ml-auto">
              DONE
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
});

const TelemetryContextPanel = memo(function TelemetryContextPanel({
  data,
}: {
  data?: AIEngineerResponse;
}) {
  const tel = data?.telemetry_context;
  if (!tel) return null;

  return (
    <div className="space-y-1.5">
      {[
        { label: "Speed", value: `${tel.speed} km/h`, color: "text-white" },
        { label: "RPM", value: `${tel.rpm}`, color: "text-white" },
        { label: "Gear", value: `${tel.gear}`, color: "text-[#00C8FF]" },
        {
          label: "Throttle",
          value: `${tel.throttle}%`,
          color: "text-[#00FF85]",
        },
        {
          label: "Fuel",
          value: `${tel.fuel_remaining} kg`,
          color: "text-[#FFD400]",
        },
        { label: "Tyre", value: tel.tyre_compound, color: "text-[#FF8A00]" },
        {
          label: "Tyre Wear FL",
          value: `${tel.tyre_wear_fl}%`,
          color: "text-white",
        },
        {
          label: "Tyre Temp FL",
          value: `${tel.tyre_temp_fl}°C`,
          color: "text-white",
        },
        {
          label: "ERS",
          value: `${tel.ers_deployment} MJ`,
          color: "text-[#FFD400]",
        },
        { label: "ERS Mode", value: tel.ers_mode, color: "text-[#00C8FF]" },
        { label: "Track", value: `${tel.track_temp}°C`, color: "text-white" },
        { label: "Air", value: `${tel.air_temp}°C`, color: "text-white" },
        { label: "Status", value: tel.session_status, color: "text-[#00FF85]" },
      ].map((item) => (
        <div key={item.label} className="flex justify-between items-center">
          <span className="text-[9px] text-[#666] font-mono">{item.label}</span>
          <span className={`text-[10px] font-mono font-bold ${item.color}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
});

function SelectControl({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[8px] text-[#666] font-mono uppercase tracking-wider block">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-sm px-2 py-1 text-[10px] text-white font-mono focus:border-[#00C8FF]/50 focus:outline-none disabled:opacity-40 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function AIEngineerPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState("session-init");
  const [circuit, setCircuit] = useState("Monaco");
  const [driver, setDriver] = useState("Max Verstappen");
  const [team, setTeam] = useState("Red Bull");
  const [weather, setWeather] = useState("Dry");
  const totalLaps = 58;

  useEffect(() => {
    setSessionId(Math.random().toString(36).slice(2, 14));
  }, []);

  const chatMutation = useAIEngineerChat();
  const metricsQuery = useV3MetricsQuery();
  const circuitsQuery = useCircuitsQuery();
  const telemetryQuery = useTelemetryLiveQuery();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (
      circuitsQuery.data &&
      circuit in
        Object.keys(
          circuitsQuery.data.reduce(
            (acc: Record<string, boolean>, c: { name: string }) => {
              acc[c.name] = true;
              return acc;
            },
            {},
          ),
        )
    ) {
      // Circuit exists in data
    }
  }, [circuitsQuery.data, circuit]);

  const circuitOptions = useMemo(() => {
    if (!circuitsQuery.data) return [{ value: "Monaco", label: "Monaco" }];
    const names = Object.keys(
      circuitsQuery.data.reduce(
        (acc: Record<string, boolean>, c: { name: string }) => {
          acc[c.name] = true;
          return acc;
        },
        {},
      ),
    );
    return names.map((n) => ({ value: n, label: n }));
  }, [circuitsQuery.data]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || chatMutation.isPending) return;
    const time = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setMessages((prev) => [...prev, { role: "user", msg: input, time }]);
    chatMutation.mutate(
      {
        query: input,
        session_id: sessionId,
        circuit,
        driver,
        team,
        weather,
        total_laps: totalLaps,
      },
      {
        onSuccess: (data) => {
          const t = new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setMessages((prev) => [
            ...prev,
            { role: "engineer", msg: data.recommendation, time: t, data },
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
  }, [
    input,
    chatMutation,
    sessionId,
    circuit,
    driver,
    team,
    weather,
    totalLaps,
  ]);

  const latestData = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].data) return messages[i].data;
    }
    return null;
  }, [messages]);

  const metrics = metricsQuery.data;

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
                {metrics?.agents_available ?? 0} agents ·{" "}
                {metrics?.pipeline_depth ?? 0} stages
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {telemetryQuery.data && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[#141414] border border-[#262626]">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1 h-1 rounded-full bg-[#00FF85]"
                />
                <span className="text-[8px] text-[#666] font-mono">
                  TELEMETRY LIVE
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5 space-y-3">
            <motion.div variants={fadeUp}>
              <FloatingPanel
                variant="glass"
                title="Race Context"
                className="p-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <SelectControl
                    label="Circuit"
                    value={circuit}
                    onChange={setCircuit}
                    options={circuitOptions}
                    disabled={chatMutation.isPending}
                  />
                  <SelectControl
                    label="Driver"
                    value={driver}
                    onChange={setDriver}
                    options={[
                      { value: "Max Verstappen", label: "Verstappen" },
                      { value: "Lewis Hamilton", label: "Hamilton" },
                      { value: "Lando Norris", label: "Norris" },
                    ]}
                    disabled={chatMutation.isPending}
                  />
                  <SelectControl
                    label="Team"
                    value={team}
                    onChange={setTeam}
                    options={[
                      { value: "Red Bull", label: "Red Bull" },
                      { value: "Ferrari", label: "Ferrari" },
                      { value: "McLaren", label: "McLaren" },
                      { value: "Mercedes", label: "Mercedes" },
                    ]}
                    disabled={chatMutation.isPending}
                  />
                  <SelectControl
                    label="Weather"
                    value={weather}
                    onChange={setWeather}
                    options={[
                      { value: "Dry", label: "Dry" },
                      { value: "Light Rain", label: "Light Rain" },
                      { value: "Heavy Rain", label: "Heavy Rain" },
                    ]}
                    disabled={chatMutation.isPending}
                  />
                </div>
              </FloatingPanel>
            </motion.div>

            <motion.div variants={fadeUp}>
              <FloatingPanel
                title="Session"
                className="h-[calc(100vh-320px)] flex flex-col"
              >
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-[11px] text-[#666] font-mono">
                        Ask the AI Engineer anything about race strategy
                      </p>
                      <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => setInput(s)}
                            disabled={chatMutation.isPending}
                            className="text-[9px] text-[#666] border border-[#262626] rounded-sm px-2 py-1 hover:border-[#00C8FF]/30 hover:text-[#00C8FF] transition-colors disabled:opacity-50"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
                          className={`max-w-[90%] p-2.5 rounded-sm text-[11px] leading-relaxed ${
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
                          {m.data && (
                            <div className="mt-2 pt-2 border-t border-[#262626]/50 flex gap-2">
                              <span className="text-[8px] text-[#00FF85] font-mono">
                                CONF {Math.round(m.data.confidence * 100)}%
                              </span>
                              <span
                                className={`text-[8px] font-mono ${
                                  m.data.risk_level === "low"
                                    ? "text-[#00FF85]"
                                    : m.data.risk_level === "high"
                                      ? "text-[#E10600]"
                                      : "text-[#FFD400]"
                                }`}
                              >
                                RISK {m.data.risk_level.toUpperCase()}
                              </span>
                              <span className="text-[8px] text-[#666] font-mono">
                                {m.data.simulation_summary.iterations} sims
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {chatMutation.isPending && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-[#101010] border border-[#262626] p-2.5 rounded-sm flex items-center gap-2">
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-[10px] text-[#666]"
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
                    disabled={chatMutation.isPending}
                    className="w-full bg-[#101010] border border-[#262626] rounded-sm px-3 py-2 text-[11px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#00C8FF]/50 resize-none disabled:opacity-50 font-mono"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => setInput(s)}
                          disabled={chatMutation.isPending}
                          className="text-[9px] text-[#666] border border-[#262626] rounded-sm px-2 py-1 hover:border-[#666] hover:text-[#A0A0A0] transition-colors disabled:opacity-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={chatMutation.isPending || !input.trim()}
                      className="bg-[#00C8FF] text-black px-4 py-1.5 rounded-sm text-[10px] font-bold hover:bg-[#00C8FF]/80 transition-colors disabled:opacity-50 uppercase tracking-[0.08em] shrink-0"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </FloatingPanel>
            </motion.div>
          </div>

          <div className="col-span-12 lg:col-span-7 space-y-3">
            <motion.div variants={fadeUp}>
              <FloatingPanel variant="glass" title="Intelligence Pipeline">
                {latestData?.pipeline_stages ? (
                  <PipelineTimeline stages={latestData.pipeline_stages} />
                ) : (
                  <div className="space-y-1">
                    {[
                      "Knowledge Retrieval",
                      "Simulation Engine",
                      "Historical Analysis",
                      "Telemetry Processing",
                      "Risk Assessment",
                      "Data Synchronization",
                      "Intelligence Fusion",
                    ].map((name) => (
                      <div
                        key={name}
                        className="flex items-center gap-2.5 p-1.5 rounded-sm bg-[#101010] border border-[#262626]/50"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#262626]" />
                        <span className="text-[10px] text-[#666] font-mono">
                          {name}
                        </span>
                        <span className="text-[8px] text-[#666] font-mono ml-auto">
                          STANDBY
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </FloatingPanel>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.div variants={fadeUp}>
                <FloatingPanel variant="compact" title="Confidence & Trust">
                  {latestData ? (
                    <div className="space-y-2">
                      <ConfidenceMeter
                        value={latestData.confidence}
                        label="Overall"
                        size="md"
                      />
                      <div className="space-y-1.5">
                        <ConfidenceMeter
                          value={latestData.confidence_breakdown.rag}
                          label="RAG"
                          size="sm"
                        />
                        <ConfidenceMeter
                          value={latestData.confidence_breakdown.simulation}
                          label="Simulation"
                          size="sm"
                        />
                        <ConfidenceMeter
                          value={latestData.confidence_breakdown.historical}
                          label="Historical"
                          size="sm"
                        />
                        <ConfidenceMeter
                          value={latestData.confidence_breakdown.memory}
                          label="Memory"
                          size="sm"
                        />
                        <ConfidenceMeter
                          value={latestData.confidence_breakdown.telemetry}
                          label="Telemetry"
                          size="sm"
                        />
                      </div>
                      <div className="pt-2 border-t border-[#262626]/50">
                        <div className="flex justify-between">
                          <span className="text-[9px] text-[#666] font-mono">
                            TRUST
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              latestData.risk_level === "low"
                                ? "text-[#00FF85]"
                                : latestData.risk_level === "high"
                                  ? "text-[#E10600]"
                                  : "text-[#FFD400]"
                            }`}
                          >
                            {latestData.risk_level.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <CardSkeleton lines={3} />
                  )}
                </FloatingPanel>
              </motion.div>

              <motion.div variants={fadeUp}>
                <FloatingPanel variant="compact" title="Telemetry Context">
                  {latestData ? (
                    <TelemetryContextPanel data={latestData} />
                  ) : telemetryQuery.data ? (
                    <div className="space-y-1.5">
                      {[
                        {
                          label: "Speed",
                          value: `${telemetryQuery.data.speed} km/h`,
                        },
                        { label: "Gear", value: `${telemetryQuery.data.gear}` },
                        {
                          label: "Throttle",
                          value: `${telemetryQuery.data.throttle}%`,
                        },
                        {
                          label: "Fuel",
                          value: `${telemetryQuery.data.fuel_remaining} kg`,
                        },
                        {
                          label: "ERS",
                          value: `${telemetryQuery.data.ers_deployment} MJ`,
                        },
                        {
                          label: "Session",
                          value: telemetryQuery.data.session.status,
                        },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between">
                          <span className="text-[9px] text-[#666] font-mono">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-white font-mono font-bold">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <CardSkeleton lines={3} />
                  )}
                </FloatingPanel>
              </motion.div>
            </div>

            {latestData && latestData.alternatives.length > 0 && (
              <motion.div variants={fadeUp}>
                <FloatingPanel variant="compact" title="Strategy Comparison">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {latestData.alternatives.map((alt, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-2 rounded-sm border ${
                          i === 0
                            ? "bg-[#00C8FF]/5 border-[#00C8FF]/20"
                            : "bg-[#141414]/60 border-[#262626]"
                        }`}
                      >
                        <span className="text-[9px] text-[#666] font-mono block">
                          {alt.strategy}
                        </span>
                        <span className="text-[10px] text-white font-mono font-bold block mt-0.5">
                          {alt.compound} · Lap {alt.pit_lap}
                        </span>
                        <span className="text-[9px] text-[#666] font-mono block">
                          {alt.estimated_time > 0
                            ? `${alt.estimated_time.toFixed(1)}s`
                            : "N/A"}
                        </span>
                        <span
                          className={`text-[8px] font-mono ${
                            alt.risk === "low"
                              ? "text-[#00FF85]"
                              : alt.risk === "high"
                                ? "text-[#E10600]"
                                : "text-[#FFD400]"
                          }`}
                        >
                          {alt.risk.toUpperCase()} RISK
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </FloatingPanel>
              </motion.div>
            )}

            {latestData && latestData.reasoning_chain.length > 0 && (
              <motion.div variants={fadeUp}>
                <FloatingPanel variant="compact" title="Reasoning Chain">
                  <div className="space-y-1">
                    {latestData.reasoning_chain.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-2 items-start"
                      >
                        <span className="text-[8px] text-[#00C8FF] font-mono shrink-0 mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span className="text-[9px] text-white font-mono font-bold block">
                            {step.step}
                          </span>
                          <span className="text-[9px] text-[#666] font-mono block">
                            {step.detail}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </FloatingPanel>
              </motion.div>
            )}

            {latestData && latestData.knowledge_references.length > 0 && (
              <motion.div variants={fadeUp}>
                <FloatingPanel variant="compact" title="Knowledge References">
                  <div className="space-y-1.5">
                    {latestData.knowledge_references.map((ref, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-2 rounded-sm bg-[#141414]/60 border border-[#262626]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-[#00C8FF] font-mono font-bold">
                            {ref.source}
                          </span>
                          <span className="text-[8px] text-[#666] font-mono">
                            {Math.round(ref.relevance * 100)}% match
                          </span>
                        </div>
                        <p className="text-[9px] text-[#666] font-mono mt-1 line-clamp-2">
                          {ref.excerpt}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </FloatingPanel>
              </motion.div>
            )}

            {latestData && (
              <motion.div variants={fadeUp}>
                <FloatingPanel
                  variant="compact"
                  title="Historical & Simulation"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-[#666] font-mono uppercase tracking-wider">
                        Historical
                      </span>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-[#666] font-mono">
                          Races
                        </span>
                        <span className="text-[10px] text-white font-mono font-bold">
                          {latestData.historical_comparison.total_races}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-[#666] font-mono">
                          Last Winner
                        </span>
                        <span className="text-[10px] text-white font-mono font-bold">
                          {latestData.historical_comparison.recent_winner}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-[#666] font-mono">
                          Last Strategy
                        </span>
                        <span className="text-[10px] text-white font-mono font-bold">
                          {latestData.historical_comparison.recent_strategy}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-[#666] font-mono uppercase tracking-wider">
                        Simulation
                      </span>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-[#666] font-mono">
                          Iterations
                        </span>
                        <span className="text-[10px] text-white font-mono font-bold">
                          {latestData.simulation_summary.iterations}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-[#666] font-mono">
                          Best Strategy
                        </span>
                        <span className="text-[10px] text-[#00FF85] font-mono font-bold">
                          {latestData.simulation_summary.best_strategy}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-[#666] font-mono">
                          Risk Assessed
                        </span>
                        <span className="text-[10px] text-white font-mono font-bold">
                          {latestData.simulation_summary.risk_assessments}
                        </span>
                      </div>
                    </div>
                  </div>
                </FloatingPanel>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { memo } from "react";
