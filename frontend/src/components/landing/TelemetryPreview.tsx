import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { genDegCurve } from "@/lib/apex-data";
import { Activity, Gauge, Timer, TrendingDown } from "lucide-react";

const data = genDegCurve(0.5);

const STATS = [
  { icon: Gauge, label: "Peak Grip", value: "98.4%", color: "text-[#0EA5E9]" },
  { icon: TrendingDown, label: "Deg / Lap", value: "0.12s", color: "text-[#EF4444]" },
  { icon: Timer, label: "Stint Window", value: "L8-L22", color: "text-[#F59E0B]" },
  { icon: Activity, label: "Confidence", value: "94.2%", color: "text-[#1A1D29]" },
];

const tipStyle = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 6, fontFamily: "Inter", fontSize: 12, color: "#1A1D29" };

export function TelemetryPreview() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-5 flex items-end justify-between flex-wrap gap-3"
        >
          <div>
            <div className="text-[12px] font-semibold text-[#0EA5E9] uppercase tracking-[0.5px] mb-2">Live Telemetry Engine</div>
            <h2 className="font-inter font-bold text-[24px] md:text-[32px] text-[#1A1D29] tracking-[-0.02em]">
              Real-time degradation modelling
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
            <span className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] uppercase font-medium">Streaming · 12.4 Hz</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border border-[#E5E7EB] bg-[#F8F9FB] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB] bg-white">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]/60" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]/60" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280]/60" />
              </div>
              <div className="font-mono text-[10px] tracking-[0.1em] text-[#6B7280] uppercase">
                TYRE_DEG.MODEL <span className="text-[#0EA5E9]">v3.2</span>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280]"><span className="w-2 h-2 rounded-sm bg-[#EF4444]" /> Soft</span>
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280]"><span className="w-2 h-2 rounded-sm bg-[#F59E0B]" /> Med</span>
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280]"><span className="w-2 h-2 rounded-sm bg-[#6B7280]" /> Hard</span>
            </div>
          </div>

          <div>
            {/* Chart */}
            <div className="p-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g-soft" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g-med" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g-hard" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6B7280" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#6B7280" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="lap" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tipStyle} />
                    <ReferenceLine y={50} stroke="rgba(239,68,68,0.2)" strokeDasharray="3 3" label={{ value: "CLIFF", fill: "#9CA3AF", fontSize: 10, fontFamily: "Inter", position: "insideTopRight" }} />
                    <Area type="monotone" dataKey="soft" stroke="#EF4444" strokeWidth={2} fill="url(#g-soft)" animationDuration={1400} />
                    <Area type="monotone" dataKey="medium" stroke="#F59E0B" strokeWidth={2} fill="url(#g-med)" animationDuration={1600} />
                    <Area type="monotone" dataKey="hard" stroke="#6B7280" strokeWidth={2} fill="url(#g-hard)" animationDuration={1800} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats strip */}
            <div className="border-t border-[#E5E7EB] bg-white p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                  className="border border-[#E5E7EB] rounded-md p-2.5 bg-[#F8F9FB]"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className={`w-3 h-3 ${s.color}`} strokeWidth={1.6} />
                    <span className="text-[11px] font-medium text-[#9CA3AF]">{s.label}</span>
                  </div>
                  <div className={`font-mono text-[13px] font-bold ${s.color}`}>{s.value}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
