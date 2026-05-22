import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlowButton } from "@/components/ui-apex/GlowButton";
import { CIRCUITS, COMPOUNDS, type CompoundId } from "@/lib/apex-data";
import { Loader as Loader2 } from "lucide-react";
import { simulate, type StrategyInput, type SimulationResult } from "@/lib/api";

export const Route = createFileRoute("/simulations")({
  component: SimulationsPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Race Simulations" },
      { name: "description", content: "Run race strategy, undercut and weather impact simulations through the APEXiq engine." },
    ],
  }),
});

const tipStyle = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 6, fontFamily: "Inter", fontSize: 12, color: "#1A1D29" };

interface SimHistoryEntry {
  id: number;
  timestamp: Date;
  circuit: string;
  compound: string;
  result: SimulationResult;
  input: StrategyInput;
}

function buildSimCharts(result: SimulationResult) {
  const base = 78.4;
  const laps = 30;

  const racePaceChart = Array.from({ length: laps }, (_, i) => ({
    lap: i + 1,
    pace: +(base + result.stay_out_loss * 0.04 * i + (Math.random() - 0.5) * 0.3).toFixed(3),
  }));

  const undercutChart = Array.from({ length: 8 }, (_, i) => ({
    lap: i + 1,
    fresh: +(base - 0.8 * Math.log(i + 1) + Math.random() * 0.2).toFixed(3),
    old: +(base + result.stay_out_loss * 0.15 * i + Math.random() * 0.15).toFixed(3),
  }));

  const pitLossChart = Array.from({ length: 6 }, (_, i) => ({
    lap: i + 1,
    stayOut: +(result.stay_out_loss * (i + 1) / 6).toFixed(2),
    pitNow: +(result.pit_loss * (1 - i * 0.05)).toFixed(2),
  }));

  return { racePaceChart, undercutChart, pitLossChart };
}

interface SimConfig {
  title: string;
  desc: string;
  tag: string;
}

function SimCard({ config, i, onRun, loading, result }: {
  config: SimConfig;
  i: number;
  onRun: () => void;
  loading: boolean;
  result: SimulationResult | null;
}) {
  const charts = result ? buildSimCharts(result) : null;

  const confidence = result
    ? Math.min(0.95, Math.max(0.2, 1 - Math.abs(result.stay_out_loss - result.pit_loss) / Math.max(result.stay_out_loss, result.pit_loss, 1)))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, duration: 0.4 }}
      className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
    >
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.5px]">{config.tag}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${result ? "bg-[#10B981]" : "bg-[#D1D5DB]"}`} />
        </div>
        <h3 className="font-inter font-bold text-lg text-[#1A1D29] mb-2">{config.title}</h3>
        <p className="text-[13px] text-[#6B7280] leading-[1.6] mb-4 flex-1">{config.desc}</p>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 mb-4"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-[#E5E7EB] rounded-md p-2.5 bg-white">
                  <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-1">Stay Out Loss</div>
                  <div className="font-mono text-lg font-semibold text-[#F59E0B] tabular-nums">{result.stay_out_loss.toFixed(2)}s</div>
                </div>
                <div className="border border-[#E5E7EB] rounded-md p-2.5 bg-white">
                  <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-1">Pit Loss</div>
                  <div className="font-mono text-lg font-semibold text-[#0EA5E9] tabular-nums">{result.pit_loss.toFixed(2)}s</div>
                </div>
              </div>

              <div className={`rounded-md border p-2.5 ${result.undercut_possible ? "border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.05)]" : "border-[#E5E7EB] bg-white"}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">Undercut</span>
                  <span className={`font-inter text-[13px] font-semibold ${result.undercut_possible ? "text-[#10B981]" : "text-[#9CA3AF]"}`}>
                    {result.undercut_possible ? "OPEN" : "CLOSED"}
                  </span>
                </div>
                <div className="font-mono text-lg font-semibold text-[#0EA5E9] tabular-nums mt-1">
                  +{result.undercut_gain.toFixed(2)}s
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">Model Confidence</span>
                  <span className="font-mono text-[11px] font-semibold text-[#1A1D29] tabular-nums">{Math.round(confidence * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F1F3F7] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-[#0EA5E9] rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Stay Out", loss: result.stay_out_loss, color: "text-[#F59E0B]" },
                  { label: "Pit Now", loss: result.pit_loss, color: "text-[#0EA5E9]" },
                ].map((opt) => (
                  <div key={opt.label} className="border border-[#E5E7EB] rounded-md p-2 bg-white">
                    <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-0.5">{opt.label}</div>
                    <div className={`font-mono text-[12px] font-semibold tabular-nums ${opt.color}`}>
                      {opt.loss.toFixed(2)}s loss
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-[#E5E7EB] rounded-md p-3 mb-4 bg-white"
            >
              <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-1">Simulation Output</div>
              <div className="font-mono text-2xl font-semibold text-[#D1D5DB]">--</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini chart */}
        {charts && (
          <div className="h-[100px] mb-4">
            <ResponsiveContainer>
              {config.title === "Undercut Calculator" ? (
                <AreaChart data={charts.undercutChart}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="lap" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} domain={["dataMin - 0.3", "dataMax + 0.3"]} reversed />
                  <Tooltip contentStyle={tipStyle} />
                  <Area type="monotone" dataKey="fresh" stroke="#0EA5E9" fill="transparent" strokeWidth={1.5} animationDuration={600} />
                  <Area type="monotone" dataKey="old" stroke="#EF4444" fill="transparent" strokeWidth={1.5} strokeDasharray="4 2" animationDuration={600} />
                </AreaChart>
              ) : config.title === "Pit Loss Comparison" ? (
                <BarChart data={charts.pitLossChart}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="lap" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tipStyle} />
                  <Bar dataKey="stayOut" fill="rgba(245,158,11,0.6)" animationDuration={600} radius={[2,2,0,0]} />
                  <Bar dataKey="pitNow" fill="rgba(14,165,233,0.6)" animationDuration={600} radius={[2,2,0,0]} />
                </BarChart>
              ) : (
                <AreaChart data={charts.racePaceChart}>
                  <defs>
                    <linearGradient id={`sim-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="lap" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} domain={["dataMin - 0.2", "dataMax + 0.2"]} reversed />
                  <Tooltip contentStyle={tipStyle} />
                  <Area type="monotone" dataKey="pace" stroke="#0EA5E9" fill={`url(#sim-${i})`} strokeWidth={1.5} animationDuration={600} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        <GlowButton
          onClick={onRun}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 !py-2.5"
        >
          {loading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Computing</>
          ) : result ? (
            "Re-run Simulation"
          ) : (
            "Run Simulation"
          )}
        </GlowButton>
      </div>
    </motion.div>
  );
}

function SimHistory({ history }: { history: SimHistoryEntry[] }) {
  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6"
    >
      <div className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-[0.5px] mb-3">Simulation History</div>
      <div className="space-y-1.5">
        {history.slice().reverse().map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 border border-[#E5E7EB] rounded-md p-2.5 bg-white">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-inter text-[13px] font-semibold text-[#1A1D29]">{entry.circuit}</span>
                <span className="font-mono text-[10px] text-[#9CA3AF]">{entry.compound}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="font-mono text-[10px] text-[#F59E0B] tabular-nums">Stay: {entry.result.stay_out_loss.toFixed(2)}s</span>
                <span className="font-mono text-[10px] text-[#0EA5E9] tabular-nums">Pit: {entry.result.pit_loss.toFixed(2)}s</span>
                <span className={`font-mono text-[10px] tabular-nums ${entry.result.undercut_possible ? "text-[#10B981]" : "text-[#9CA3AF]"}`}>
                  UC: {entry.result.undercut_gain.toFixed(2)}s
                </span>
              </div>
            </div>
            <div className="font-mono text-[10px] text-[#9CA3AF] shrink-0">
              {entry.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SimulationsPage() {
  const [results, setResults] = useState<(SimulationResult | null)[]>([null, null, null]);
  const [loading, setLoading] = useState([false, false, false]);
  const [history, setHistory] = useState<SimHistoryEntry[]>([]);

  const sims: SimConfig[] = [
    {
      title: "Race Strategy",
      desc: "Configure starting compound, stint count and circuit to project total race time across all pit windows.",
      tag: "MOD-01 · STRATEGY",
    },
    {
      title: "Undercut Calculator",
      desc: "Set gap, pit delta and degradation rate to predict undercut window gain against the car ahead.",
      tag: "MOD-02 · UNDERCUT",
    },
    {
      title: "Pit Loss Comparison",
      desc: "Compare stay-out loss versus pit-stop loss across laps to identify the optimal pit window.",
      tag: "MOD-03 · PIT LOSS",
    },
  ];

  const runSim = async (index: number) => {
    setLoading((prev) => { const n = [...prev]; n[index] = true; return n; });

    const input: StrategyInput = {
      compound: "MEDIUM",
      tyre_age: 12,
      circuit: "Monaco",
      gap_ahead: 4,
      gap_behind: 18,
    };

    try {
      const result = await simulate(input);
      setResults((prev) => { const n = [...prev]; n[index] = result; return n; });
      setHistory((prev) => [...prev, { id: Date.now(), timestamp: new Date(), circuit: input.circuit, compound: input.compound, result, input }]);
    } catch {
      setResults((prev) => { const n = [...prev]; n[index] = null; return n; });
    } finally {
      setLoading((prev) => { const n = [...prev]; n[index] = false; return n; });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20 px-4 pb-10 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 pt-4"
        >
          <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.5px] mb-1">Engine Modules</div>
          <h1 className="font-grotesk font-semibold text-2xl md:text-3xl text-foreground">
            Simulations
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {sims.map((s, i) => (
            <SimCard
              key={s.title}
              config={s}
              i={i}
              onRun={() => runSim(i)}
              loading={loading[i]}
              result={results[i]}
            />
          ))}
        </div>

        <SimHistory history={history} />
      </main>
      <Footer />
    </div>
  );
}
