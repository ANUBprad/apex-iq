import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Cpu } from "lucide-react";
import type { Strategy, SimulationData } from "@/hooks/useStrategy";

interface Msg { id: number; role: "ai" | "user"; text: string; category?: string }

const INITIAL: Msg[] = [
  { id: 1, role: "ai", text: "Systems online. Telemetry engine initialized.", category: "system" },
  { id: 2, role: "ai", text: "Circuit intelligence loaded. Awaiting race parameters.", category: "system" },
  { id: 3, role: "ai", text: "Run a strategy analysis to receive recommendations.", category: "system" },
];

const QUICK = ["Undercut window?", "Tyre deg status", "Safety car impact", "Weather update", "Rival pit cadence"];

function generateStrategyMessages(strategy: Strategy, simulation: SimulationData | null): Msg[] {
  const msgs: Msg[] = [];
  msgs.push({
    id: Date.now(),
    role: "ai",
    text: `Recommendation: ${strategy.action}. Confidence ${Math.round(strategy.confidence * 100)}%. ${strategy.reasoning}`,
    category: "strategy",
  });
  if (simulation) {
    msgs.push({
      id: Date.now() + 1,
      role: "ai",
      text: `Tyre analysis: Stay-out loss projected at ${simulation.stayOutLoss.toFixed(2)}s over next 5 laps. Pit loss is ${simulation.pitLoss.toFixed(2)}s including stationary time.`,
      category: "tyre",
    });
    if (simulation.undercutPossible) {
      msgs.push({
        id: Date.now() + 2,
        role: "ai",
        text: `Undercut window is OPEN. Fresh compound projected to gain ${simulation.undercutGain.toFixed(2)}s against the car ahead. Execute this lap for maximum advantage.`,
        category: "undercut",
      });
    } else {
      msgs.push({
        id: Date.now() + 2,
        role: "ai",
        text: `Undercut window currently CLOSED. Gap too large to capitalise on fresh compound advantage. Monitor rival pit cadence for opportunity.`,
        category: "undercut",
      });
    }
  }
  const riskMsg = strategy.riskLevel === "HIGH"
    ? "Risk assessment: Elevated risk profile. Degradation cliff approaching or traffic rejoin probability high. Consider defensive positioning."
    : strategy.riskLevel === "MEDIUM"
    ? "Risk assessment: Moderate risk. Track evolution and rival behaviour will influence outcome. Maintain monitoring cadence."
    : "Risk assessment: Low risk profile. Model confidence is high and execution window is clear. Proceed with recommended action.";
  msgs.push({ id: Date.now() + 3, role: "ai", text: riskMsg, category: "risk" });
  if (strategy.pitWindow !== "Not available") {
    msgs.push({
      id: Date.now() + 4,
      role: "ai",
      text: `Pit window: ${strategy.pitWindow}. Track position is critical -- box within this window to optimise race time.`,
      category: "pit",
    });
  }
  return msgs;
}

function generateQuickResponse(query: string, strategy: Strategy | null, simulation: SimulationData | null): string {
  if (!strategy || !simulation) {
    return "Awaiting strategy data. Run a strategy analysis first to enable detailed responses.";
  }
  const q = query.toLowerCase();
  if (q.includes("undercut")) {
    return simulation.undercutPossible
      ? `Undercut window is active. Projected gain: ${simulation.undercutGain.toFixed(2)}s. Pit this lap to maximise track position against the car ahead.`
      : `Undercut not viable at current gap. Need ${Math.abs(simulation.undercutGain - simulation.pitLoss).toFixed(2)}s more pace advantage to execute. Monitor rival pit window.`;
  }
  if (q.includes("tyre") || q.includes("deg")) {
    return `Current compound degradation: ${simulation.stayOutLoss.toFixed(2)}s projected loss over next 5 laps. Performance cliff expected as tyre age increases. ${strategy.action === "STAY OUT" ? "Model supports extending stint." : "Model recommends fresh rubber."}`;
  }
  if (q.includes("safety") || q.includes("sc")) {
    return `Safety car probability influences pit timing. If SC deploys within 3 laps, free pit stop eliminates ${simulation.pitLoss.toFixed(1)}s loss. Current recommendation: ${strategy.action}.`;
  }
  if (q.includes("weather") || q.includes("rain")) {
    return "Weather monitoring active. Dry strategy remains optimal unless rain probability exceeds 40%. Compound switch to INTER/WET adds 2.5-4.0s pit delta.";
  }
  if (q.includes("rival") || q.includes("traffic")) {
    return `Rival pit cadence monitoring: Gap ahead ${simulation.undercutPossible ? "within undercut range" : "too large for undercut"}. Track position management is key to strategy execution.`;
  }
  return `Based on current analysis: ${strategy.action} with ${Math.round(strategy.confidence * 100)}% confidence. ${strategy.reasoning}`;
}

export function AIEngineerPanel({ strategy, simulation, error }: { strategy: Strategy | null; simulation: SimulationData | null; error: string | null }) {
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!strategy) return;
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, ...generateStrategyMessages(strategy, simulation)]);
    }, 1200);
    return () => clearTimeout(t);
  }, [strategy, simulation]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const response = generateQuickResponse(text, strategy, simulation);
      setMessages((m) => [...m, { id: Date.now(), role: "ai", text: response, category: "response" }]);
    }, 800);
  };

  return (
    <aside className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#0EA5E9]" strokeWidth={1.8} />
          <h2 className="text-[14px] font-semibold text-[#1A1D29]">AI Race Engineer</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${error ? "bg-[#F59E0B]" : "bg-[#10B981]"}`} />
          <span className={`text-[11px] font-medium ${error ? "text-[#F59E0B]" : "text-[#10B981]"}`}>
            {error ? "Degraded" : "Online"}
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 px-3 py-3 overflow-y-auto space-y-2.5">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={m.role === "ai" ? "flex gap-2" : "flex justify-end"}
            >
              {m.role === "ai" && (
                <div className="w-6 h-6 shrink-0 rounded-md bg-[rgba(14,165,233,0.08)] border border-[rgba(14,165,233,0.15)] flex items-center justify-center mt-0.5">
                  <Bot className="w-3 h-3 text-[#0EA5E9]" strokeWidth={1.8} />
                </div>
              )}
              <div className={`text-[13px] leading-[1.55] rounded-md p-2.5 max-w-[88%] ${
                m.role === "ai"
                  ? "bg-white border border-[#E5E7EB] text-[#1A1D29]"
                  : "bg-[rgba(14,165,233,0.08)] border border-[rgba(14,165,233,0.15)] text-[#0284C7]"
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && (
          <div className="flex gap-2">
            <div className="w-6 h-6 shrink-0 rounded-md bg-[rgba(14,165,233,0.08)] border border-[rgba(14,165,233,0.15)] flex items-center justify-center">
              <Bot className="w-3 h-3 text-[#0EA5E9]" strokeWidth={1.8} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB] typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 border-t border-[#E5E7EB]">
        <div className="flex gap-1 mb-1.5 overflow-x-auto pb-0.5">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-md bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F0F9FF] hover:border-[rgba(14,165,233,0.2)] hover:text-[#0EA5E9] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex gap-1.5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your race engineer..."
            className="flex-1 bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[13px] text-[#1A1D29] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[rgba(14,165,233,0.1)] transition-all"
          />
          <button type="submit" className="bg-[#0EA5E9] w-8 h-8 rounded-md flex items-center justify-center shrink-0 hover:bg-[#0284C7] transition-colors" aria-label="Send">
            <Send className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
          </button>
        </form>
      </div>
    </aside>
  );
}
