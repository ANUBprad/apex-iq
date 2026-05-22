import { motion } from "framer-motion";
import {
  Activity,
  Gauge,
  Timer,
  Brain,
  CloudLightning,
  Radar,
  Cpu,
  Flag,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  metric: string;
  metricLabel: string;
  tag: string;
  status: "active" | "standby";
};

const FEATURES: Feature[] = [
  {
    icon: Gauge,
    title: "Tyre Degradation ML",
    desc: "Compound-aware degradation curves fused with thermal load, slip ratio, and stint history across all five Pirelli compounds.",
    metric: "94.2%",
    metricLabel: "Prediction accuracy",
    tag: "MOD-01",
    status: "active",
  },
  {
    icon: Activity,
    title: "Undercut Intelligence",
    desc: "Live pit-window arbitrage with rival gap modelling, traffic projection, and counter-strategy interception in under one lap.",
    metric: "1.8s",
    metricLabel: "Avg gain per cycle",
    tag: "MOD-02",
    status: "active",
  },
  {
    icon: Timer,
    title: "Race Simulation Engine",
    desc: "Sub-200ms Monte Carlo projections across 20+ circuits, branched for safety car, VSC, weather and red-flag scenarios.",
    metric: "10K",
    metricLabel: "Sims per decision",
    tag: "MOD-03",
    status: "active",
  },
  {
    icon: Brain,
    title: "AI Race Engineer",
    desc: "GPT-class reasoning agent that explains every call in engineering language -- driver-friendly radio output, engineer-grade telemetry context.",
    metric: "<400ms",
    metricLabel: "Response latency",
    tag: "MOD-04",
    status: "active",
  },
  {
    icon: CloudLightning,
    title: "Weather & Track Evolution",
    desc: "Hyper-local radar nowcasting fused with grip evolution and track temperature drift across the full race window.",
    metric: "5min",
    metricLabel: "Forecast resolution",
    tag: "MOD-05",
    status: "standby",
  },
  {
    icon: Radar,
    title: "Rival Pattern Recognition",
    desc: "Per-driver behavioural fingerprints -- pit cadence, tyre management, defensive tendencies -- surfaced live during the race.",
    metric: "20",
    metricLabel: "Drivers tracked",
    tag: "MOD-06",
    status: "standby",
  },
];

const STATS: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Cpu, value: "12.4M", label: "Telemetry frames / race" },
  { icon: TrendingUp, value: "0.18s", label: "Strategy compute time" },
  { icon: Flag, value: "23", label: "Calibrated circuits" },
  { icon: Activity, value: "99.97%", label: "Pipeline uptime" },
];

export function Capabilities() {
  return (
    <section className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[rgba(14,165,233,0.2)] bg-[rgba(14,165,233,0.05)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
            <span className="font-mono text-[10px] tracking-[0.15em] text-[#0EA5E9] uppercase font-medium">System Capabilities</span>
          </div>
          <h2 className="font-inter font-bold text-[28px] md:text-[40px] text-[#1A1D29] tracking-[-0.02em] leading-[1.1]">
            Engineered for the <span className="text-[#0EA5E9]">apex</span>
          </h2>
          <p className="mt-4 font-inter text-[14px] md:text-[15px] text-[#6B7280] max-w-xl mx-auto leading-[1.7]">
            Six tightly-coupled intelligence modules running in parallel -- fed by raw telemetry, tuned by race engineers, and surfaced as decisions you can act on.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.tag}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="rounded-lg border border-[#E5E7EB] bg-[#F8F9FB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center bg-white border border-[#E5E7EB]">
                    <f.icon className="w-4 h-4 text-[#0EA5E9]" strokeWidth={1.6} />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.1em] text-[#9CA3AF] uppercase">{f.tag}</div>
                    <div className={`font-mono text-[10px] tracking-[0.1em] uppercase font-medium ${f.status === "active" ? "text-[#10B981]" : "text-[#F59E0B]"}`}>
                      {f.status === "active" ? "Active" : "Standby"}
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="font-inter text-[15px] font-semibold text-[#1A1D29] leading-tight mb-2">
                {f.title}
              </h3>

              <p className="text-[13px] text-[#6B7280] leading-[1.65] mb-4">
                {f.desc}
              </p>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-end justify-between">
                <div>
                  <div className="font-mono font-bold text-[28px] text-[#1A1D29] leading-none tabular-nums">
                    {f.metric}
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">{f.metricLabel}</div>
                </div>
                {f.status === "active" && (
                  <div className="flex items-center gap-1.5 px-2 h-6 rounded-md border border-[rgba(14,165,233,0.2)] bg-[rgba(14,165,233,0.05)]">
                    <span className="w-1 h-1 rounded-full bg-[#0EA5E9]" />
                    <span className="font-mono text-[9px] tracking-[0.1em] text-[#0EA5E9] uppercase font-medium">Live</span>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-10 rounded-lg border border-[#E5E7EB] bg-[#F8F9FB] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[rgba(14,165,233,0.05)] border border-[rgba(14,165,233,0.2)] shrink-0">
                  <Icon className="w-4 h-4 text-[#0EA5E9]" strokeWidth={1.6} />
                </div>
                <div>
                  <div className="font-mono font-bold text-[16px] text-[#1A1D29] tracking-tight leading-none">{value}</div>
                  <div className="mt-1 text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
