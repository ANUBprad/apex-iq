import { createFileRoute } from "@tanstack/react-router";
import { FloatingPanel, TelemetryGauge, StatusDot } from "@/components/f1";
import { motion } from "framer-motion";
import {
  useDriverProfileQuery,
  useReplayIntelligenceQuery,
} from "@/hooks/useApiQueries";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] },
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
          "Live F1 telemetry analysis with lap history, sector comparisons, tyre temperature monitoring, and replay intelligence.",
      },
    ],
  }),
});

function TelemetryPage() {
  const driverQuery = useDriverProfileQuery("Max Verstappen");
  const replayQuery = useReplayIntelligenceQuery(23, 78);
  const driver = driverQuery.data ?? null;
  const replay = replayQuery.data ?? null;

  const gauges = [
    {
      label: "Speed",
      value: 287,
      max: 340,
      unit: " km/h",
      color: "red" as const,
    },
    {
      label: "RPM",
      value: 11200,
      max: 15000,
      unit: " rpm",
      color: "blue" as const,
    },
    {
      label: "Throttle",
      value: 87,
      max: 100,
      unit: "%",
      color: "green" as const,
    },
    {
      label: "Brake",
      value: 12,
      max: 100,
      unit: "%",
      color: "yellow" as const,
    },
    { label: "Gear", value: 6, max: 8, unit: "", color: "white" as const },
    {
      label: "ERS",
      value: 2.4,
      max: 4.0,
      unit: " MJ",
      color: "purple" as const,
    },
    {
      label: "Fuel",
      value: 64,
      max: 110,
      unit: " kg",
      color: "yellow" as const,
    },
    { label: "Delta", value: 0.3, max: 1, unit: "s", color: "green" as const },
  ];

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
          <div>
            <h1 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
              Telemetry
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusDot color="blue" />
              <span className="text-[10px] text-[#666] font-mono">
                {driver ? `${driver.name} · #1` : "Awaiting telemetry stream"}
              </span>
              <div className="flex items-center gap-1 ml-2">
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-1 h-1 rounded-full bg-[#00C8FF]"
                />
                <span className="text-[9px] text-[#00C8FF] font-mono tracking-[0.1em]">
                  DATA STREAM
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-12 gap-4">
          <div className="col-span-9 space-y-4">
            <FloatingPanel title="Live Telemetry">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-4 gap-4"
              >
                {gauges.map((g) => (
                  <motion.div
                    key={g.label}
                    variants={fadeUp}
                    whileHover={{ y: -2 }}
                    className="p-2.5 rounded-sm bg-[#141414]/60 border border-[#262626] hover:border-[#333] transition-all duration-200"
                  >
                    <TelemetryGauge {...g} />
                  </motion.div>
                ))}
              </motion.div>
              <div className="flex items-center gap-2 text-[9px] text-[#666] font-mono mt-4 pt-3 border-t border-[#262626]/40">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1 h-1 rounded-full bg-[#00C8FF]"
                />
                Live telemetry data stream · Updated in real-time
              </div>
            </FloatingPanel>

            <FloatingPanel title="Sector Analysis">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {replay ? (
                  <>
                    {[
                      {
                        label: "Current Lap",
                        value: `Lap ${replay.lap}`,
                        color: "text-white",
                      },
                      {
                        label: "Insight",
                        value: replay.insight,
                        color: "text-[#00C8FF]",
                      },
                      {
                        label: "Undercut Probability",
                        value: `${replay.undercut_probability}%`,
                        color: "text-[#A855F7]",
                      },
                      {
                        label: "Traffic Risk",
                        value: replay.traffic_risk.toUpperCase(),
                        color:
                          replay.traffic_risk === "low"
                            ? "text-[#00FF85]"
                            : "text-[#E10600]",
                      },
                    ].map((row) => (
                      <motion.div
                        key={row.label}
                        variants={fadeUp}
                        className="flex justify-between items-center py-2 border-b border-[#262626]/40 last:border-0"
                      >
                        <span className="text-[11px] text-[#666] font-medium">
                          {row.label}
                        </span>
                        <span
                          className={`text-xs font-mono tabular-nums ${row.color}`}
                        >
                          {row.value}
                        </span>
                      </motion.div>
                    ))}
                    <motion.div
                      variants={fadeUp}
                      className="text-[11px] text-[#A0A0A0] mt-1 leading-relaxed"
                    >
                      {replay.recommendation}
                    </motion.div>
                  </>
                ) : (
                  <div className="text-[10px] text-[#666] font-mono text-center py-6">
                    {replayQuery.isLoading
                      ? "Loading sector data..."
                      : "No replay data available"}
                  </div>
                )}
              </motion.div>
            </FloatingPanel>
          </div>

          <div className="col-span-3 space-y-3">
            <FloatingPanel variant="compact" title="Tyre Temperatures">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {[
                  {
                    label: "Front Left",
                    value: 98,
                    max: 130,
                    color: "yellow" as const,
                  },
                  {
                    label: "Front Right",
                    value: 102,
                    max: 130,
                    color: "yellow" as const,
                  },
                  {
                    label: "Rear Left",
                    value: 88,
                    max: 130,
                    color: "green" as const,
                  },
                  {
                    label: "Rear Right",
                    value: 92,
                    max: 130,
                    color: "green" as const,
                  },
                ].map((t) => (
                  <motion.div key={t.label} variants={fadeUp}>
                    <TelemetryGauge key={t.label} {...t} unit="°C" />
                  </motion.div>
                ))}
                {driver && (
                  <motion.div
                    variants={fadeUp}
                    className="flex items-center gap-2 pt-2 border-t border-[#262626]/40"
                  >
                    <span className="text-[9px] text-[#666] font-mono">
                      Tyre Management
                    </span>
                    <div className="flex-1 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${driver.tyre_management}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-[#00FF85]"
                      />
                    </div>
                    <span className="text-[9px] text-[#00FF85] font-mono">
                      {driver.tyre_management}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </FloatingPanel>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
