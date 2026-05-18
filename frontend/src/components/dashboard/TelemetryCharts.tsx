import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { useMemo } from "react";
import { genDegCurve, genPaceDelta, genPitWindow, genUndercut, genFuel, genSector } from "@/lib/apex-data";

const tipStyle = { background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,30,30,0.3)", borderRadius: 6, fontFamily: "Rajdhani", fontSize: 12 };

function ChartFrame({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-black/50 border border-apex-red/15 rounded-lg p-4 relative overflow-hidden"
    >
      <div className="font-orbitron text-[10px] tracking-[0.3em] text-apex-red mb-2">{title}</div>
      <div className="h-[180px]">{children}</div>
    </motion.div>
  );
}

export function TelemetryCharts({ seed }: { seed: number }) {
  const deg = useMemo(() => genDegCurve(seed), [seed]);
  const pace = useMemo(() => genPaceDelta(), [seed]);
  const pit = useMemo(() => genPitWindow(), [seed]);
  const uc = useMemo(() => genUndercut(), [seed]);
  const fuel = useMemo(() => genFuel(), [seed]);
  const sector = useMemo(() => genSector(), [seed]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ChartFrame title="TYRE DEGRADATION CURVE">
        <ResponsiveContainer>
          <AreaChart data={deg}>
            <defs>
              <linearGradient id="d-soft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.25 27)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.62 0.25 27)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="lap" stroke="rgba(255,255,255,0.4)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
            <Tooltip contentStyle={tipStyle} />
            <Area type="monotone" dataKey="soft" stroke="oklch(0.62 0.25 27)" fill="url(#d-soft)" strokeWidth={2} animationDuration={1400} />
            <Area type="monotone" dataKey="medium" stroke="oklch(0.85 0.18 90)" fill="transparent" strokeWidth={1.5} animationDuration={1600} />
            <Area type="monotone" dataKey="hard" stroke="rgba(255,255,255,0.7)" fill="transparent" strokeWidth={1.5} animationDuration={1800} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="LAP PACE DELTA" delay={0.05}>
        <ResponsiveContainer>
          <LineChart data={pace}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="lap" stroke="rgba(255,255,255,0.4)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
            <Tooltip contentStyle={tipStyle} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
            <Line type="monotone" dataKey="delta" stroke="oklch(0.62 0.25 27)" strokeWidth={2} dot={false} animationDuration={1500} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="PIT WINDOW PROBABILITY" delay={0.1}>
        <ResponsiveContainer>
          <BarChart data={pit}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="lap" stroke="rgba(255,255,255,0.4)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
            <Tooltip contentStyle={tipStyle} />
            <Bar dataKey="prob" fill="oklch(0.62 0.25 27)" animationDuration={1400} radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="UNDERCUT ADVANTAGE" delay={0.15}>
        <ResponsiveContainer>
          <AreaChart data={uc}>
            <defs>
              <linearGradient id="u-cyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.82 0.15 215)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="oklch(0.82 0.15 215)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="lap" stroke="rgba(255,255,255,0.4)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
            <Tooltip contentStyle={tipStyle} />
            <Area type="monotone" dataKey="gain" stroke="oklch(0.82 0.15 215)" fill="url(#u-cyan)" strokeWidth={2} animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="FUEL LOAD CURVE" delay={0.2}>
        <ResponsiveContainer>
          <LineChart data={fuel}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="lap" stroke="rgba(255,255,255,0.4)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
            <Tooltip contentStyle={tipStyle} />
            <Line type="monotone" dataKey="fuel" stroke="oklch(0.78 0.18 60)" strokeWidth={2} dot={false} animationDuration={1500} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="SECTOR PACE COMPARISON" delay={0.25}>
        <ResponsiveContainer>
          <RadarChart data={sector}>
            <PolarGrid stroke="rgba(255,255,255,0.15)" />
            <PolarAngleAxis dataKey="axis" stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 11, fontFamily: "Orbitron" }} />
            <PolarRadiusAxis stroke="rgba(255,255,255,0.2)" tick={false} />
            <Radar dataKey="optimal" stroke="oklch(0.82 0.15 215)" fill="oklch(0.82 0.15 215)" fillOpacity={0.15} animationDuration={1500} />
            <Radar dataKey="current" stroke="oklch(0.62 0.25 27)" fill="oklch(0.62 0.25 27)" fillOpacity={0.35} animationDuration={1700} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}
