import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import type { Strategy, SimulationData } from "@/hooks/useStrategy";

const tipStyle = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 6, fontFamily: "Inter", fontSize: 12, color: "#1A1D29" };

function ChartFrame({ title, children, delay = 0, hasData = true }: { title: string; children: React.ReactNode; delay?: number; hasData?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
    >
      <div className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-2">{title}</div>
      <div className="h-[160px]">
        {hasData ? children : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="font-inter text-sm text-[#9CA3AF]">No data</div>
              <div className="text-[12px] text-[#D1D5DB] mt-1">Awaiting strategy data</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function buildDegCurve(sim: SimulationData) {
  return Array.from({ length: 20 }, (_, i) => ({
    lap: i + 1,
    soft: Math.max(20, 100 - i * (3 + sim.stayOutLoss * 0.3)),
    medium: Math.max(30, 100 - i * (1.8 + sim.stayOutLoss * 0.15)),
    hard: Math.max(45, 100 - i * (1.1 + sim.stayOutLoss * 0.08)),
  }));
}

function buildPaceDelta(sim: SimulationData) {
  return Array.from({ length: 20 }, (_, i) => ({
    lap: i + 1,
    delta: +(Math.sin(i / 4) * sim.stayOutLoss * 0.3 + (i > 10 ? sim.stayOutLoss * 0.05 : 0)).toFixed(3),
  }));
}

function buildPitWindow(strategy: Strategy) {
  if (strategy.pitWindow === "Not available") return [];
  const match = strategy.pitWindow.match(/L(\d+)-L(\d+)/);
  if (!match) return [];
  const start = parseInt(match[1]);
  const end = parseInt(match[2]);
  return Array.from({ length: end - start + 1 }, (_, i) => ({
    lap: start + i,
    prob: Math.max(0, Math.min(100, 60 + Math.sin((i - (end - start) / 2) / 2) * 30)),
  }));
}

function buildUndercut(sim: SimulationData) {
  return Array.from({ length: 12 }, (_, i) => ({
    lap: i + 1,
    gain: +(sim.undercutGain * Math.log(i + 2) / Math.log(14)).toFixed(2),
  }));
}

function buildFuel() {
  return Array.from({ length: 30 }, (_, i) => ({
    lap: i + 1,
    fuel: Math.max(0, 110 - i * 2.1),
  }));
}

function buildSector() {
  return [
    { axis: "S1", current: 92 + Math.random() * 5, optimal: 99 },
    { axis: "S2", current: 88 + Math.random() * 6, optimal: 99 },
    { axis: "S3", current: 90 + Math.random() * 5, optimal: 99 },
  ];
}

export function TelemetryCharts({ strategy, simulation }: { strategy: Strategy | null; simulation: SimulationData | null }) {
  const hasData = !!(strategy && simulation);
  const deg = hasData ? buildDegCurve(simulation!) : [];
  const pace = hasData ? buildPaceDelta(simulation!) : [];
  const pit = hasData ? buildPitWindow(strategy!) : [];
  const uc = hasData ? buildUndercut(simulation!) : [];
  const fuel = hasData ? buildFuel() : [];
  const sector = hasData ? buildSector() : [];

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <ChartFrame title="Tyre Degradation Curve" hasData={hasData}>
        <ResponsiveContainer>
          <AreaChart data={deg}>
            <defs>
              <linearGradient id="d-soft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="lap" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tipStyle} />
            <Area type="monotone" dataKey="soft" stroke="#EF4444" fill="url(#d-soft)" strokeWidth={2} animationDuration={800} />
            <Area type="monotone" dataKey="medium" stroke="#F59E0B" fill="transparent" strokeWidth={2} animationDuration={1000} />
            <Area type="monotone" dataKey="hard" stroke="#6B7280" fill="transparent" strokeWidth={2} animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Lap Pace Delta" delay={0.04} hasData={hasData}>
        <ResponsiveContainer>
          <LineChart data={pace}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="lap" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tipStyle} />
            <ReferenceLine y={0} stroke="#D1D5DB" />
            <Line type="monotone" dataKey="delta" stroke="#0EA5E9" strokeWidth={2} dot={false} animationDuration={800} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Pit Window Probability" delay={0.08} hasData={pit.length > 0}>
        <ResponsiveContainer>
          <BarChart data={pit}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="lap" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tipStyle} />
            <Bar dataKey="prob" fill="rgba(14,165,233,0.6)" animationDuration={800} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Undercut Advantage" delay={0.12} hasData={hasData}>
        <ResponsiveContainer>
          <AreaChart data={uc}>
            <defs>
              <linearGradient id="u-blue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="lap" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tipStyle} />
            <Area type="monotone" dataKey="gain" stroke="#0EA5E9" fill="url(#u-blue)" strokeWidth={2} animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Fuel Load Curve" delay={0.16} hasData={hasData}>
        <ResponsiveContainer>
          <LineChart data={fuel}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="lap" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tipStyle} />
            <Line type="monotone" dataKey="fuel" stroke="#F59E0B" strokeWidth={2} dot={false} animationDuration={800} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Sector Pace Comparison" delay={0.2} hasData={hasData}>
        <ResponsiveContainer>
          <RadarChart data={sector}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="axis" stroke="#6B7280" tick={{ fontSize: 11, fontFamily: "Inter" }} />
            <PolarRadiusAxis stroke="#D1D5DB" tick={false} />
            <Radar dataKey="optimal" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.1} animationDuration={800} />
            <Radar dataKey="current" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} animationDuration={1000} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}
