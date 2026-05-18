import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Cpu } from "lucide-react";
import type { Strategy } from "@/hooks/useStrategy";

interface Msg { id: number; role: "ai" | "user"; text: string }

const INITIAL: Msg[] = [
  { id: 1, role: "ai", text: "APEXiq systems online. Telemetry engine initialized." },
  { id: 2, role: "ai", text: "Circuit intelligence loaded. Awaiting race parameters." },
  { id: 3, role: "ai", text: "Run a strategy analysis to receive real-time recommendations." },
];

const QUICK = ["Analyse undercut", "Tyre temp warning?", "Safety car impact", "Weather update", "Rival strategies"];

export function AIEngineerPanel({ strategy }: { strategy: Strategy | null }) {
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!strategy) return;
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: Date.now(), role: "ai", text: `Recommended action: ${strategy.action}. ${strategy.reasoning}` },
        { id: Date.now() + 1, role: "ai", text: `Projected confidence ${Math.round(strategy.confidence * 100)}%. Telemetry trajectory aligns with model output.` },
      ]);
    }, 1500);
    return () => clearTimeout(t);
  }, [strategy]);

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
      setMessages((m) => [...m, { id: Date.now(), role: "ai", text: "Analyzing telemetry stream — projection nominal. Maintain current strategy unless gap closes below 1.5s." }]);
    }, 1300);
  };

  return (
    <aside className="apex-glass rounded-lg flex flex-col h-full">
      <div className="p-4 border-b border-apex-red/15 flex items-center justify-between">
        <h2 className="font-orbitron text-[11px] tracking-[0.3em] text-apex-red">AI RACE ENGINEER</h2>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-apex-green pulse-dot" />
          <span className="font-space-grotesk text-[9px] tracking-widest text-apex-green uppercase">Online</span>
        </div>
      </div>

      <div className="m-4 apex-glass-cyan rounded-md p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-apex-cyan/15 border border-apex-cyan/40 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-apex-cyan" />
        </div>
        <div>
          <div className="font-orbitron text-sm text-white tracking-wider">APEX-7 STRATEGIST</div>
          <div className="font-space-grotesk text-[9px] tracking-[0.2em] text-apex-cyan uppercase">Neural Race Intelligence v2.4</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 px-4 overflow-y-auto space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={m.role === "ai" ? "flex gap-2" : "flex justify-end"}
            >
              {m.role === "ai" && (
                <div className="w-7 h-7 shrink-0 rounded-md bg-apex-red/15 border border-apex-red/30 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-apex-red" />
                </div>
              )}
              <div className={`font-inter text-xs leading-relaxed rounded-md p-2.5 max-w-[85%] ${
                m.role === "ai"
                  ? "bg-white/5 border-l-2 border-apex-red text-white/80"
                  : "bg-apex-red/15 text-white"
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && (
          <div className="flex gap-2">
            <div className="w-7 h-7 shrink-0 rounded-md bg-apex-red/15 border border-apex-red/30 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-apex-red" />
            </div>
            <div className="bg-white/5 rounded-md p-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-apex-red typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-apex-red/15">
        <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="shrink-0 font-space-grotesk text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-apex-red/15 hover:border-apex-red/40 hover:text-apex-red transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your race engineer..."
            className="flex-1 bg-black/60 border border-white/10 rounded-md px-3 py-2 font-inter text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-apex-red focus:shadow-[0_0_10px_rgba(255,30,30,0.3)] transition-all"
          />
          <button type="submit" className="apex-btn-glow w-9 h-9 rounded-md flex items-center justify-center" aria-label="Send">
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </aside>
  );
}
