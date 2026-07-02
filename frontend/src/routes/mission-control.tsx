import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";
import {
  FloatingPanel,
  ConfidenceMeter,
  MetricCard,
  SectorLight,
  StatusDot,
} from "@/components/f1";
import { useMissionControlQuery } from "@/hooks/useApiQueries";
import { exportJSON } from "@/lib/export";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] },
  },
};

export const Route = createFileRoute("/mission-control")({
  component: MissionControlPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Mission Control" },
      {
        name: "description",
        content:
          "Real-time F1 pit wall dashboard orchestrating telemetry, AI engineer, strategy, predictions, and system health into a single synchronized view.",
      },
    ],
  }),
});

function MissionControlPage() {
  const { data, isLoading, isError } = useMissionControlQuery(2000);

  const handleExport = useCallback(() => {
    if (data) {
      exportJSON(data, `apexiq-mc-${data.race_state.circuit}-${Date.now()}`);
    }
  }, [data]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState />;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[1920px] px-3 py-3 md:px-6 md:py-4"
      >
        {/* Hero — KPI Strip */}
        <motion.div
          variants={item}
          className="mb-4 rounded-sm border border-[#E10600]/20 bg-gradient-to-r from-[#E10600]/5 via-transparent to-[#E10600]/5 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full bg-[#E10600]" />
                <div>
                  <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-white md:text-2xl">
                    MISSION CONTROL
                  </h1>
                  <p className="text-[9px] text-[#666] font-mono tracking-[0.15em] uppercase">
                    Race Command Center
                  </p>
                </div>
              </div>
              <StatusDot color="green" label="LIVE" animate />
              <span className="font-mono text-xs text-[#666]">
                {data.race_state.status} · Lap {data.race_state.lap}/
                {data.race_state.total_laps}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#666]">
              <span>{data.weather.condition}</span>
              <span>{data.weather.air_temp}°C air</span>
              <span>{data.weather.track_temp}°C track</span>
              <span>{data.weather.wind_speed} km/h</span>
              <button
                onClick={handleExport}
                className="h-8 px-3 text-[10px] bg-[#111] border border-[#222] text-[#888] hover:text-white hover:border-[#444] rounded-sm transition-all duration-200"
                aria-label="Export Mission Control snapshot"
              >
                Export
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
            <KpiCard
              label="Race Score"
              value={data.kpis.race_score}
              max={100}
              color="red"
            />
            <KpiCard
              label="Strategy"
              value={data.kpis.strategy_efficiency}
              max={100}
              color="blue"
            />
            <KpiCard
              label="AI Confidence"
              value={data.kpis.ai_confidence}
              max={100}
              color="green"
            />
            <KpiCard
              label="Sim Agreement"
              value={data.kpis.simulation_agreement}
              max={100}
              color="yellow"
            />
            <KpiCard
              label="Tyre Health"
              value={data.kpis.tyre_health}
              max={100}
              color="orange"
            />
            <KpiCard
              label="Fuel (laps)"
              value={data.kpis.fuel_target}
              max={20}
              color="white"
            />
            <KpiCard
              label="Win Prob"
              value={data.predictions.win_probability}
              max={100}
              color="red"
            />
            <KpiCard
              label="Podium Prob"
              value={data.predictions.podium_probability}
              max={100}
              color="green"
            />
          </div>
        </motion.div>

        {/* Row 2 — Main: Track Map + AI Rec + Predictions */}
        <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Track Map */}
          <motion.div variants={item} className="lg:col-span-5">
            <FloatingPanel
              title="Track Map"
              variant="glass-edge"
              id="mc-trackmap"
            >
              <TrackMapPanel
                progress={data.race_state.progress}
                lap={data.race_state.lap}
                totalLaps={data.race_state.total_laps}
                circuit={data.race_state.circuit}
                position={data.race_state.position}
              />
            </FloatingPanel>
          </motion.div>

          {/* AI Recommendation */}
          <motion.div variants={item} className="lg:col-span-4">
            <FloatingPanel
              title="AI Recommendation"
              variant="glow-red"
              id="mc-ai"
            >
              <AiRecommendationPanel data={data.ai_recommendation} />
            </FloatingPanel>
          </motion.div>

          {/* Race Predictions */}
          <motion.div variants={item} className="lg:col-span-3">
            <FloatingPanel
              title="Race Predictions"
              variant="glow-blue"
              id="mc-predictions"
            >
              <PredictionsPanel data={data.predictions} />
            </FloatingPanel>
          </motion.div>
        </div>

        {/* Row 3 — Timeline + Memory + Weather */}
        <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <motion.div variants={item} className="lg:col-span-5">
            <FloatingPanel
              title="Race Timeline"
              variant="glass"
              id="mc-timeline"
            >
              <TimelinePanel
                events={data.timeline_events}
                currentLap={data.race_state.lap}
                totalLaps={data.race_state.total_laps}
              />
            </FloatingPanel>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-4">
            <FloatingPanel
              title="Weather & Conditions"
              variant="glass"
              id="mc-weather"
            >
              <WeatherPanel data={data.weather} />
            </FloatingPanel>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-3">
            <FloatingPanel
              title="Memory & Context"
              variant="glass"
              id="mc-memory"
            >
              <MemoryPanel data={data.memory} />
            </FloatingPanel>
          </motion.div>
        </div>

        {/* Row 4 — Historical + System Health + Radio */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <motion.div variants={item} className="lg:col-span-4">
            <FloatingPanel
              title="Historical Comparison"
              variant="glass"
              id="mc-history"
            >
              <HistoricalPanel data={data.historical_comparison} />
            </FloatingPanel>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-4">
            <FloatingPanel title="System Health" variant="glass" id="mc-health">
              <SystemHealthPanel data={data.system_health} />
            </FloatingPanel>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-4">
            <FloatingPanel title="Team Radio" variant="glass" id="mc-radio">
              <RadioPanel data={data.radio} />
            </FloatingPanel>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────

const KPI_COLORS: Record<string, string> = {
  red: "#e10600",
  blue: "#00c8ff",
  green: "#00ff85",
  yellow: "#ffd400",
  orange: "#ff8a00",
  white: "#ffffff",
  purple: "#a855f7",
};

function KpiCard({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const hex = KPI_COLORS[color] || "#ffffff";
  return (
    <div className="flex flex-col gap-1.5 rounded-sm border border-[#1e1e1e] bg-[#0a0a0a] p-2.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-[#666]">
        {label}
      </span>
      <span
        className="font-mono text-lg font-bold tabular-nums"
        style={{ color: hex }}
      >
        {typeof value === "number"
          ? value % 1 === 0
            ? value
            : value.toFixed(1)
          : value}
      </span>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#1e1e1e]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: hex }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Track Map ────────────────────────────────────────────────────

function TrackMapPanel({
  progress,
  lap,
  totalLaps,
  circuit,
  position,
}: {
  progress: number;
  lap: number;
  totalLaps: number;
  circuit: string;
  position: number;
}) {
  const point = useMemo(() => {
    const angle = progress * 2 * Math.PI - Math.PI / 2;
    const rx = 140;
    const ry = 90;
    const cx = 160;
    const cy = 120;
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  }, [progress]);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 320 240" className="w-full max-w-[400px]">
        <defs>
          <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e10600" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00c8ff" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track outline */}
        <ellipse
          cx="160"
          cy="120"
          rx="140"
          ry="90"
          fill="none"
          stroke="url(#trackGrad)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Sector markers */}
        <circle cx="300" cy="120" r="3" fill="#00ff85" opacity="0.6" />
        <circle cx="160" cy="30" r="3" fill="#ffd400" opacity="0.6" />
        <circle cx="20" cy="120" r="3" fill="#00c8ff" opacity="0.6" />
        {/* Start/finish line */}
        <line
          x1="160"
          y1="28"
          x2="160"
          y2="34"
          stroke="#fff"
          strokeWidth="2"
          opacity="0.5"
        />
        {/* Car position */}
        <circle
          cx={point.x}
          cy={point.y}
          r="6"
          fill="#e10600"
          filter="url(#glow)"
        />
        <circle cx={point.x} cy={point.y} r="3" fill="#fff" />
        {/* Lap info */}
        <text
          x="160"
          y="118"
          textAnchor="middle"
          fill="#fff"
          fontSize="18"
          fontWeight="bold"
          fontFamily="var(--font-heading)"
        >
          P{position}
        </text>
        <text
          x="160"
          y="134"
          textAnchor="middle"
          fill="#666"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          {circuit}
        </text>
      </svg>
      <div className="flex items-center gap-4 text-xs text-[#666]">
        <span>
          Lap {lap}/{totalLaps}
        </span>
        <span className="font-mono">{(progress * 100).toFixed(0)}%</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map((s) => (
          <SectorLight
            key={s}
            sector={s as 1 | 2 | 3}
            color={s === 1 ? "green" : s === 2 ? "purple" : "yellow"}
            animated
          />
        ))}
      </div>
    </div>
  );
}

// ── AI Recommendation ────────────────────────────────────────────

function AiRecommendationPanel({
  data,
}: {
  data: {
    action: string;
    confidence: number;
    risk_level: string;
    risk_factors: string[];
    reasoning: string;
    alternative: string;
    strategy_score: number;
  };
}) {
  const riskColor =
    data.risk_level === "critical"
      ? "#e10600"
      : data.risk_level === "high"
        ? "#ff8a00"
        : data.risk_level === "medium"
          ? "#ffd400"
          : "#00ff85";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <motion.div
          className="rounded-sm px-3 py-1.5 font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${riskColor}22`, color: riskColor }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {data.action}
        </motion.div>
        <ConfidenceMeter value={data.confidence} size="sm" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[#666]">Risk:</span>
        <span
          className="font-mono text-xs font-bold uppercase"
          style={{ color: riskColor }}
        >
          {data.risk_level}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-[#a0a0a0]">{data.reasoning}</p>

      {data.risk_factors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.risk_factors.map((f) => (
            <span
              key={f}
              className="rounded-sm bg-[#e10600]/10 px-2 py-0.5 text-[10px] text-[#e10600]"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-[#1e1e1e] pt-2">
        <span className="text-[10px] uppercase text-[#666]">Alternative</span>
        <p className="mt-0.5 text-xs text-[#a0a0a0]">{data.alternative}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase text-[#666]">Score</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1e1e1e]">
          <motion.div
            className="h-full rounded-full bg-[#e10600]"
            initial={{ width: 0 }}
            animate={{ width: `${data.strategy_score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className="font-mono text-xs text-[#a0a0a0]">
          {data.strategy_score}/100
        </span>
      </div>
    </div>
  );
}

// ── Predictions ──────────────────────────────────────────────────

function PredictionsPanel({
  data,
}: {
  data: {
    win_probability: number;
    podium_probability: number;
    top5_probability: number;
    safety_car_probability: number;
    rain_probability: number;
    undercut_success: number;
    overcut_success: number;
    fuel_finish_probability: number;
    prediction_confidence: number;
  };
}) {
  const rows = [
    { label: "Win", value: data.win_probability, color: "#e10600" },
    { label: "Podium", value: data.podium_probability, color: "#00ff85" },
    { label: "Top 5", value: data.top5_probability, color: "#00c8ff" },
    { label: "Undercut", value: data.undercut_success, color: "#ffd400" },
    { label: "Overcut", value: data.overcut_success, color: "#ff8a00" },
    {
      label: "Fuel Finish",
      value: data.fuel_finish_probability,
      color: "#a855f7",
    },
    {
      label: "Safety Car",
      value: data.safety_car_probability,
      color: "#ffd400",
    },
    { label: "Rain", value: data.rain_probability, color: "#00c8ff" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase text-[#666]">Confidence</span>
        <span className="font-mono text-xs text-[#a0a0a0]">
          {(data.prediction_confidence * 100).toFixed(0)}%
        </span>
      </div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="w-16 text-[10px] text-[#666]">{r.label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1e1e1e]">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: r.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, r.value)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="w-8 text-right font-mono text-[10px] text-[#a0a0a0]">
            {r.value.toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Timeline ─────────────────────────────────────────────────────

const EVENT_STYLES: Record<string, { color: string; icon: string }> = {
  pit: { color: "#ff8a00", icon: "🔧" },
  overtake: { color: "#00ff85", icon: "↗" },
  sc: { color: "#ffd400", icon: "⚠" },
  vsc: { color: "#ffd400", icon: "⚠" },
  rain: { color: "#00c8ff", icon: "🌧" },
  ai: { color: "#a855f7", icon: "◇" },
  strategy: { color: "#e10600", icon: "⊞" },
  start: { color: "#fff", icon: "●" },
  tyre: { color: "#ff8a00", icon: "◉" },
};

function TimelinePanel({
  events,
  currentLap,
  totalLaps,
}: {
  events: { lap: number; type: string; label: string; detail?: string }[];
  currentLap: number;
  totalLaps: number;
}) {
  return (
    <div className="relative flex flex-col gap-1">
      {/* Progress bar */}
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1e1e1e]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#e10600] to-[#00c8ff]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentLap / totalLaps) * 100}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
        {events.map((e, i) => {
          const style = EVENT_STYLES[e.type] || { color: "#666", icon: "•" };
          const isPast = e.lap <= currentLap;
          return (
            <motion.div
              key={i}
              className="flex items-start gap-2 py-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="mt-0.5 font-mono text-[10px] text-[#666]">
                L{e.lap}
              </span>
              <span style={{ color: style.color }} className="mt-0.5 text-xs">
                {style.icon}
              </span>
              <div className="flex-1">
                <span
                  className={`text-xs ${isPast ? "text-[#a0a0a0]" : "text-[#666]"}`}
                >
                  {e.label}
                </span>
                {e.detail && (
                  <span className="ml-1 text-[10px] text-[#666]">
                    — {e.detail}
                  </span>
                )}
              </div>
              {isPast && e.lap === currentLap && (
                <StatusDot color="green" size="sm" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Weather ──────────────────────────────────────────────────────

function WeatherPanel({
  data,
}: {
  data: {
    condition: string;
    air_temp: number;
    track_temp: number;
    humidity: number;
    wind_speed: number;
    rain_probability: number;
  };
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">
          {data.condition === "Dry"
            ? "☀"
            : data.condition === "Rain"
              ? "🌧"
              : "⛅"}
        </span>
        <span className="font-[family-name:var(--font-heading)] text-sm font-bold">
          {data.condition}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Air Temp"
          value={data.air_temp}
          unit="°C"
          color="red"
        />
        <MetricCard
          label="Track Temp"
          value={data.track_temp}
          unit="°C"
          color="orange"
        />
        <MetricCard
          label="Humidity"
          value={data.humidity}
          unit="%"
          color="blue"
        />
        <MetricCard
          label="Wind"
          value={data.wind_speed}
          unit="km/h"
          color="white"
        />
      </div>
      <div className="flex items-center gap-2 border-t border-[#1e1e1e] pt-2">
        <span className="text-[10px] uppercase text-[#666]">
          Rain Probability
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1e1e1e]">
          <motion.div
            className="h-full rounded-full bg-[#00c8ff]"
            initial={{ width: 0 }}
            animate={{ width: `${data.rain_probability}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <span className="font-mono text-[10px] text-[#a0a0a0]">
          {data.rain_probability.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

// ── Memory ───────────────────────────────────────────────────────

function MemoryPanel({
  data,
}: {
  data: {
    recent_conversations: number;
    saved_strategies: number;
    entries: { query: string; circuit: string; confidence: number }[];
  };
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <span className="font-mono text-lg font-bold text-[#a855f7]">
            {data.recent_conversations}
          </span>
          <span className="text-[10px] text-[#666]">Conversations</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-mono text-lg font-bold text-[#00c8ff]">
            {data.saved_strategies}
          </span>
          <span className="text-[10px] text-[#666]">Strategies</span>
        </div>
      </div>
      {data.entries.length > 0 && (
        <div className="border-t border-[#1e1e1e] pt-2">
          <span className="text-[10px] uppercase text-[#666]">Recent</span>
          <div className="mt-1 flex flex-col gap-1">
            {data.entries.slice(0, 3).map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <StatusDot color="purple" size="sm" />
                <span className="flex-1 truncate text-[#a0a0a0]">
                  {e.query || "—"}
                </span>
                {e.confidence > 0 && (
                  <span className="font-mono text-[#666]">
                    {(e.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Historical ───────────────────────────────────────────────────

function HistoricalPanel({
  data,
}: {
  data: {
    circuit: string;
    total_races: number;
    recent_races: {
      race: string;
      year: number;
      winner: string;
      strategy: string;
      safety_cars: number;
    }[];
    similarity: number;
    delta: string;
    indicator: string;
  };
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-heading)] text-sm font-bold">
          {data.circuit}
        </span>
        <span className="font-mono text-xs text-[#666]">
          {data.total_races} races
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase text-[#666]">Similarity</span>
        <ConfidenceMeter value={data.similarity} size="sm" />
      </div>
      <span className="font-mono text-xs text-[#a0a0a0]">{data.delta}</span>
      {data.recent_races.length > 0 && (
        <div className="border-t border-[#1e1e1e] pt-2">
          <span className="text-[10px] uppercase text-[#666]">Recent</span>
          <div className="mt-1 flex flex-col gap-1">
            {data.recent_races.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="font-mono text-[#666]">{r.year}</span>
                <span className="flex-1 truncate text-[#a0a0a0]">
                  {r.winner}
                </span>
                <span className="text-[#666]">SC:{r.safety_cars}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── System Health ────────────────────────────────────────────────

function SystemHealthPanel({
  data,
}: {
  data: {
    api_latency_ms: number;
    telemetry_connection: string;
    knowledge_status: string;
    memory_status: string;
    simulation_status: string;
    pipeline_status: string;
    rag_documents: number;
    memory_entries: number;
  };
}) {
  const services = [
    { name: "Telemetry", status: data.telemetry_connection },
    { name: "Knowledge", status: data.knowledge_status },
    { name: "Memory", status: data.memory_status },
    { name: "Simulation", status: data.simulation_status },
    { name: "Pipeline", status: data.pipeline_status },
  ];

  const allOnline = services.every((s) => s.status === "online");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <StatusDot color={allOnline ? "green" : "yellow"} />
        <span className="font-[family-name:var(--font-heading)] text-sm font-bold">
          {allOnline ? "ALL SYSTEMS GO" : "ATTENTION NEEDED"}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {services.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-[#a0a0a0]">{s.name}</span>
            <StatusDot
              color={
                s.status === "online"
                  ? "green"
                  : s.status === "standby"
                    ? "yellow"
                    : "red"
              }
              size="sm"
              label={s.status.toUpperCase()}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-[#1e1e1e] pt-2">
        <div className="flex flex-col">
          <span className="font-mono text-xs text-[#a0a0a0]">
            {data.api_latency_ms.toFixed(1)}ms
          </span>
          <span className="text-[10px] text-[#666]">API Latency</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs text-[#a0a0a0]">
            {data.rag_documents}
          </span>
          <span className="text-[10px] text-[#666]">RAG Docs</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs text-[#a0a0a0]">
            {data.memory_entries}
          </span>
          <span className="text-[10px] text-[#666]">Memory Entries</span>
        </div>
      </div>
    </div>
  );
}

// ── Team Radio ───────────────────────────────────────────────────

function RadioPanel({
  data,
}: {
  data: { message: string; timestamp: string; sender?: string }[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="text-2xl opacity-30">📻</span>
        <span className="text-xs text-[#666]">No radio messages</span>
      </div>
    );
  }

  return (
    <div className="flex max-h-[200px] flex-col gap-1.5 overflow-y-auto scrollbar-thin">
      {data.map((msg, i) => (
        <motion.div
          key={i}
          className="rounded-sm border border-[#1e1e1e] bg-[#0a0a0a] p-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#e10600]">
              {msg.sender || "RADIO"}
            </span>
            <span className="font-mono text-[10px] text-[#666]">
              {msg.timestamp}
            </span>
          </div>
          <p className="text-xs text-[#a0a0a0]">{msg.message}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Loading & Error States ───────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505]">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e10600] border-t-transparent" />
        <span className="font-[family-name:var(--font-heading)] text-sm text-[#666]">
          INITIALIZING MISSION CONTROL...
        </span>
      </motion.div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-[#e10600]/10 border border-[#e10600]/20">
          <span className="text-2xl font-bold text-[#e10600]">!</span>
        </div>
        <span className="font-[family-name:var(--font-heading)] text-sm text-[#666]">
          MISSION CONTROL OFFLINE
        </span>
        <span className="text-xs text-[#666]">
          Unable to connect to telemetry systems
        </span>
      </div>
    </div>
  );
}
