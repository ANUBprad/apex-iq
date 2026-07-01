import { createFileRoute } from "@tanstack/react-router";
import {
  FloatingPanel,
  TelemetryGauge,
  MetricCard,
  StatusDot,
  SectorLight,
  CardSkeleton,
} from "@/components/f1";
import { motion } from "framer-motion";
import { exportCSV } from "@/lib/export";
import {
  useTelemetryLiveQuery,
  useTelemetryHistoryQuery,
} from "@/hooks/useApiQueries";
import { useMemo, memo } from "react";
import type { TelemetrySnapshot } from "@/lib/api";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.19, 1, 0.22, 1] },
  },
};

export const Route = createFileRoute("/telemetry")({
  component: TelemetryPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Telemetry" },
      {
        name: "description",
        content:
          "Live Formula 1 telemetry dashboard with real-time car data, tyre analysis, and session monitoring.",
      },
    ],
  }),
});

const SpeedChart = memo(function SpeedChart({
  history,
}: {
  history: TelemetrySnapshot[];
}) {
  if (history.length < 2) {
    return (
      <div className="h-16 flex items-center justify-center">
        <span className="text-[9px] text-[#666] font-mono">
          Collecting data...
        </span>
      </div>
    );
  }

  const speeds = history.map((s) => s.speed);
  const maxSpeed = Math.max(...speeds, 1);
  const minSpeed = Math.min(...speeds, 0);
  const range = maxSpeed - minSpeed || 1;

  return (
    <div className="flex items-end gap-px h-16 overflow-hidden">
      {history.map((s, i) => {
        const pct = ((s.speed - minSpeed) / range) * 100;
        const color =
          s.speed > 300
            ? "#E10600"
            : s.speed > 200
              ? "#FFD400"
              : s.speed > 100
                ? "#00C8FF"
                : "#00FF85";
        return (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-300"
            style={{
              height: `${Math.max(2, pct)}%`,
              backgroundColor: color,
              opacity: 0.6 + (i / history.length) * 0.4,
            }}
          />
        );
      })}
    </div>
  );
});

const DeltaChart = memo(function DeltaChart({
  history,
}: {
  history: TelemetrySnapshot[];
}) {
  if (history.length < 2) {
    return (
      <div className="h-12 flex items-center justify-center">
        <span className="text-[9px] text-[#666] font-mono">
          Collecting data...
        </span>
      </div>
    );
  }

  const deltas = history.map((s) => s.delta_to_leader);
  const maxDelta = Math.max(...deltas.map(Math.abs), 0.1);

  return (
    <div className="relative h-12 overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#262626]" />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${history.length} 100`}
        preserveAspectRatio="none"
      >
        <polyline
          points={history
            .map((s, i) => {
              const x = (i / (history.length - 1)) * 100;
              const y = 50 - (s.delta_to_leader / maxDelta) * 40;
              return `${x},${y}`;
            })
            .join(" ")}
          fill="none"
          stroke="#E10600"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
        <span className="text-[7px] text-[#666] font-mono">
          -{maxDelta.toFixed(1)}s
        </span>
        <span className="text-[7px] text-[#666] font-mono">
          +{maxDelta.toFixed(1)}s
        </span>
      </div>
    </div>
  );
});

const FuelTrend = memo(function FuelTrend({
  history,
}: {
  history: TelemetrySnapshot[];
}) {
  if (history.length < 2) {
    return (
      <div className="h-10 flex items-center justify-center">
        <span className="text-[9px] text-[#666] font-mono">
          Collecting data...
        </span>
      </div>
    );
  }

  const fuels = history.map((s) => s.fuel_remaining);
  const maxFuel = Math.max(...fuels);
  const minFuel = Math.min(...fuels);
  const range = maxFuel - minFuel || 1;

  return (
    <div className="flex items-end gap-px h-10 overflow-hidden">
      {history.map((s, i) => {
        const pct = ((s.fuel_remaining - minFuel) / range) * 100;
        return (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-300"
            style={{
              height: `${Math.max(2, pct)}%`,
              backgroundColor:
                s.fuel_remaining > 50
                  ? "#00FF85"
                  : s.fuel_remaining > 30
                    ? "#FFD400"
                    : "#E10600",
              opacity: 0.5 + (i / history.length) * 0.5,
            }}
          />
        );
      })}
    </div>
  );
});

const TyreViz = memo(function TyreViz({
  telemetry,
}: {
  telemetry: TelemetrySnapshot;
}) {
  const { tyre } = telemetry;
  const tempMax = 130;
  const wearMax = 100;

  function tempColor(temp: number): string {
    if (temp > 110) return "#E10600";
    if (temp > 95) return "#FFD400";
    return "#00FF85";
  }

  function wearColor(wear: number): string {
    if (wear > 60) return "#E10600";
    if (wear > 40) return "#FFD400";
    return "#00FF85";
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {(["front_left", "front_right", "rear_left", "rear_right"] as const).map(
        (pos) => {
          const label =
            pos === "front_left"
              ? "FL"
              : pos === "front_right"
                ? "FR"
                : pos === "rear_left"
                  ? "RL"
                  : "RR";
          const temp = tyre.temperature[pos];
          const wear = tyre.wear[pos];
          const pressure = tyre.pressure[pos];
          const tempPct = (temp / tempMax) * 100;
          const wearPct = (wear / wearMax) * 100;

          return (
            <motion.div
              key={pos}
              variants={fadeUp}
              className="p-2 rounded-sm bg-[#141414]/60 border border-[#262626]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-white">
                  {label}
                </span>
                <span className="text-[8px] font-mono text-[#666]">
                  {pressure.toFixed(1)} PSI
                </span>
              </div>
              <div className="space-y-1">
                <div>
                  <div className="flex justify-between text-[8px] font-mono mb-0.5">
                    <span className="text-[#666]">Temp</span>
                    <span style={{ color: tempColor(temp) }}>
                      {temp.toFixed(0)}°C
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] rounded-full h-1">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: tempColor(temp) }}
                      animate={{ width: `${tempPct}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[8px] font-mono mb-0.5">
                    <span className="text-[#666]">Wear</span>
                    <span style={{ color: wearColor(wear) }}>
                      {wear.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] rounded-full h-1">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: wearColor(wear) }}
                      animate={{ width: `${wearPct}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        },
      )}
    </div>
  );
});

const TrackMapPlaceholder = memo(function TrackMapPlaceholder() {
  return (
    <div className="relative h-32 rounded-sm bg-[#0a0a0a] border border-[#262626] overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 200 100" className="w-48 h-24 opacity-30">
          <path
            d="M 20 80 Q 40 20 80 30 Q 120 40 140 20 Q 170 10 180 50 Q 190 80 160 90 Q 120 100 80 90 Q 40 80 20 80 Z"
            fill="none"
            stroke="#E10600"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <circle cx="20" cy="80" r="3" fill="#00FF85" />
          <text
            x="20"
            y="72"
            fill="#666"
            fontSize="6"
            textAnchor="middle"
            fontFamily="monospace"
          >
            S/F
          </text>
        </svg>
      </div>
      <div className="absolute bottom-1 right-2">
        <span className="text-[7px] text-[#444] font-mono uppercase tracking-wider">
          Track Map — Future Integration
        </span>
      </div>
    </div>
  );
});

const RadioFeed = memo(function RadioFeed({
  events,
}: {
  events: { time: string; speaker: string; message: string }[];
}) {
  if (events.length === 0) {
    return (
      <div className="text-[9px] text-[#666] font-mono text-center py-3">
        No radio messages
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-32 overflow-y-auto">
      {events.map((evt, i) => (
        <motion.div
          key={`${evt.time}-${i}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex gap-2 items-start"
        >
          <span className="text-[8px] text-[#666] font-mono shrink-0 mt-0.5">
            {evt.time}
          </span>
          <div className="min-w-0">
            <span
              className={`text-[9px] font-mono font-bold ${
                evt.speaker === "Driver" ? "text-[#00C8FF]" : "text-[#E10600]"
              }`}
            >
              {evt.speaker === "Driver" ? "DRIVER" : "ENGINEER"}:
            </span>
            <span className="text-[9px] text-[#A0A0A0] font-mono ml-1">
              {evt.message}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

function TelemetryPage() {
  const liveQuery = useTelemetryLiveQuery();
  const historyQuery = useTelemetryHistoryQuery(60);

  const data = liveQuery.data;
  const history = historyQuery.data ?? [];

  const gauges = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Speed",
        value: data.speed,
        max: 340,
        unit: "km/h",
        color:
          data.speed > 300
            ? ("red" as const)
            : data.speed > 200
              ? ("yellow" as const)
              : ("blue" as const),
      },
      {
        label: "RPM",
        value: data.rpm,
        max: 15000,
        unit: "rpm",
        color: data.rpm > 12000 ? ("red" as const) : ("white" as const),
      },
      {
        label: "Throttle",
        value: data.throttle,
        max: 100,
        unit: "%",
        color: "green" as const,
      },
      {
        label: "Brake",
        value: data.brake,
        max: 100,
        unit: "%",
        color: "red" as const,
      },
      {
        label: "Gear",
        value: data.gear,
        max: 8,
        unit: "",
        color: "blue" as const,
      },
      {
        label: "ERS",
        value: data.ers.deployment,
        max: 4,
        unit: "MJ",
        color: "yellow" as const,
      },
      {
        label: "Fuel",
        value: data.fuel_remaining,
        max: 110,
        unit: "kg",
        color:
          data.fuel_remaining > 50 ? ("green" as const) : ("yellow" as const),
      },
      {
        label: "Battery",
        value: data.battery_pct,
        max: 100,
        unit: "%",
        color: data.battery_pct > 30 ? ("green" as const) : ("red" as const),
      },
    ];
  }, [data]);

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="absolute inset-0 ambient-glow-left pointer-events-none" />
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
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
              Live Telemetry
            </h1>
            <div className="flex items-center gap-1.5">
              <StatusDot
                status={liveQuery.isLoading ? "warning" : "online"}
                size="sm"
              />
              <span className="text-[9px] text-[#666] font-mono uppercase tracking-wider">
                {liveQuery.isLoading ? "Connecting" : "Live"}
              </span>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#141414] border border-[#262626]">
                <span className="text-[9px] text-[#666] font-mono">
                  SESSION
                </span>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    data.session.status === "RACING"
                      ? "text-[#00FF85]"
                      : data.session.status === "SAFETY_CAR"
                        ? "text-[#FFD400]"
                        : "text-[#E10600]"
                  }`}
                >
                  {data.session.status}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#141414] border border-[#262626]">
                <span className="text-[9px] text-[#666] font-mono">POS</span>
                <span className="text-[10px] text-white font-mono font-bold">
                  P{data.session.position}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#141414] border border-[#262626]">
                <span className="text-[9px] text-[#666] font-mono">LAP</span>
                <span className="text-[10px] text-white font-mono font-bold">
                  {data.session.lap}/{data.session.total_laps}
                </span>
              </div>
              <button
                onClick={() =>
                  exportCSV(
                    [
                      {
                        speed: data.speed,
                        rpm: data.rpm,
                        gear: data.gear,
                        throttle: data.throttle,
                        brake: data.brake,
                        ers_deploy: data.ers?.deploy_mode,
                        lap: data.session.lap,
                        position: data.session.position,
                        timestamp: new Date().toISOString(),
                      },
                    ],
                    `apexiq-telemetry-lap${data.session.lap}-${Date.now()}`,
                  )
                }
                className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.08em] rounded-sm border border-[#262626] bg-[#101010] text-[#a0a0a0] hover:bg-[#141414] hover:text-white transition-all"
                aria-label="Export telemetry data as CSV"
              >
                EXPORT ↓
              </button>
            </div>
          )}
        </motion.div>

        {!data && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <CardSkeleton lines={4} />
            </div>
          </div>
        )}

        {data && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          >
            <div className="col-span-12 lg:col-span-9 space-y-4">
              <FloatingPanel variant="glass" title="Car Telemetry">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {gauges.map((g) => (
                    <TelemetryGauge
                      key={g.label}
                      label={g.label}
                      value={g.value}
                      max={g.max}
                      unit={g.unit}
                      color={g.color}
                      size="md"
                    />
                  ))}
                </div>
              </FloatingPanel>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FloatingPanel variant="glass" title="Speed Trace">
                  <SpeedChart history={history} />
                  <div className="flex justify-between mt-1">
                    <span className="text-[7px] text-[#666] font-mono">
                      {history.length > 0 ? `${history.length}s ago` : "—"}
                    </span>
                    <span className="text-[7px] text-[#666] font-mono">
                      Now
                    </span>
                  </div>
                </FloatingPanel>

                <FloatingPanel variant="glass" title="Delta to Leader">
                  <DeltaChart history={history} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[#666] font-mono">
                      Delta
                    </span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        data.delta_to_leader < 0
                          ? "text-[#00FF85]"
                          : data.delta_to_leader > 1
                            ? "text-[#E10600]"
                            : "text-[#FFD400]"
                      }`}
                    >
                      {data.delta_to_leader > 0 ? "+" : ""}
                      {data.delta_to_leader.toFixed(3)}s
                    </span>
                  </div>
                </FloatingPanel>

                <FloatingPanel variant="glass" title="Fuel Trend">
                  <FuelTrend history={history} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[#666] font-mono">
                      Fuel/ Lap
                    </span>
                    <span className="text-[11px] text-[#FFD400] font-mono font-bold">
                      {data.fuel_per_lap.toFixed(2)} kg
                    </span>
                  </div>
                </FloatingPanel>
              </div>

              <FloatingPanel variant="glass" title="Track Conditions">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <MetricCard
                    label="Track Temp"
                    value={`${data.track.temp}°C`}
                    color="orange"
                  />
                  <MetricCard
                    label="Grip Level"
                    value={`${(data.track.grip_level * 100).toFixed(0)}%`}
                    color="green"
                  />
                  <MetricCard
                    label="Rubber"
                    value={`${(data.track.rubber_level * 100).toFixed(0)}%`}
                    color="yellow"
                  />
                  <MetricCard
                    label="Wind"
                    value={`${data.weather.wind_speed.toFixed(0)}`}
                    unit="km/h"
                    color="blue"
                  />
                  <MetricCard
                    label="Humidity"
                    value={`${data.weather.humidity.toFixed(0)}%`}
                    color="blue"
                  />
                  <MetricCard
                    label="Segment"
                    value={data.track.current_segment}
                    color="white"
                  />
                </div>
              </FloatingPanel>
            </div>

            <div className="col-span-12 lg:col-span-3 space-y-3">
              <FloatingPanel variant="glass" title="Sector & Timing">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#666] font-mono">
                      Sector
                    </span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((s) => (
                        <SectorLight
                          key={s}
                          sector={s}
                          status={
                            s === data.sector
                              ? "active"
                              : s < data.sector
                                ? "personal_best"
                                : "baseline"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Current Lap
                    </span>
                    <span className="text-[11px] text-white font-mono font-bold">
                      {data.lap_time.toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Last Lap
                    </span>
                    <span className="text-[11px] text-[#00FF85] font-mono font-bold">
                      {data.last_lap_time.toFixed(3)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      DRS
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusDot
                        status={data.drs_active ? "online" : "offline"}
                        size="sm"
                      />
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          data.drs_active ? "text-[#00FF85]" : "text-[#666]"
                        }`}
                      >
                        {data.drs_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                  </div>
                </div>
              </FloatingPanel>

              <FloatingPanel variant="glass" title="Gaps">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Gap Ahead
                    </span>
                    <span className="text-[11px] text-[#00C8FF] font-mono font-bold">
                      +{data.gap_ahead.toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Gap Behind
                    </span>
                    <span className="text-[11px] text-[#FFD400] font-mono font-bold">
                      +{data.gap_behind.toFixed(2)}s
                    </span>
                  </div>
                </div>
              </FloatingPanel>

              <FloatingPanel variant="glass" title="ERS System">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Mode
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        data.ers.mode === "BALANCED"
                          ? "text-[#00C8FF]"
                          : "text-[#FFD400]"
                      }`}
                    >
                      {data.ers.mode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-sm bg-[#141414]/60 border border-[#262626]">
                    <span className="text-[9px] text-[#666] font-mono">
                      Harvest
                    </span>
                    <span className="text-[11px] text-[#00FF85] font-mono font-bold">
                      {data.ers.harvesting.toFixed(2)} MJ
                    </span>
                  </div>
                </div>
              </FloatingPanel>

              <FloatingPanel variant="compact" title="Tyre Analysis">
                <TyreViz telemetry={data} />
              </FloatingPanel>

              <FloatingPanel variant="compact" title="Track Map">
                <TrackMapPlaceholder />
              </FloatingPanel>

              <FloatingPanel variant="compact" title="Team Radio">
                <RadioFeed events={data.radio} />
              </FloatingPanel>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
