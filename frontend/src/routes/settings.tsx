import { createFileRoute } from "@tanstack/react-router";
import { FloatingPanel, StatusDot } from "@/components/f1";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  useStatusQuery,
  useV3HealthQuery,
  useMetricsQuery,
} from "@/hooks/useApiQueries";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] },
  },
};

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "APEXiq &middot; Settings" },
      {
        name: "description",
        content:
          "APEXiq system settings and configuration. Manage API endpoints, simulation presets, and user preferences.",
      },
      { property: "og:title", content: "APEXiq · Settings" },
      {
        property: "og:description",
        content:
          "APEXiq system settings and configuration. Manage API endpoints, simulation presets, and user preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "APEXiq · Settings" },
      {
        name: "twitter:description",
        content:
          "APEXiq system settings and configuration. Manage API endpoints, simulation presets, and user preferences.",
      },
    ],
  }),
});

function SettingsPage() {
  const [notifications, setNotifications] = useState({
    "notif-race-start": true,
    "notif-strategy": true,
    "notif-weather": false,
    "notif-errors": true,
  });
  const [theme, setTheme] = useState("Carbon Fiber");
  const [refreshInterval, setRefreshInterval] = useState("10 seconds");
  const [animations, setAnimations] = useState(true);
  const { data: status } = useStatusQuery();
  const { data: v3Health } = useV3HealthQuery();
  const { data: metrics } = useMetricsQuery();

  return (
    <div className="min-h-screen carbon-fiber">
      <div className="absolute inset-0 ambient-glow-left pointer-events-none" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-[1] p-5 space-y-4"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
            Settings
          </h1>
          <p className="text-[10px] text-[#666] mt-0.5">
            System configuration &amp; preferences
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingPanel title="API Configuration">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#A0A0A0] block mb-1">
                  VITE_API_URL
                </label>
                <div className="bg-[#141414] border border-[#262626] rounded-sm p-2 text-xs text-white font-mono">
                  {API_BASE}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[#A0A0A0] block mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••••••••"
                  className="w-full bg-[#141414] border border-[#262626] rounded-sm p-2 text-xs text-white focus:outline-none focus:border-[#E10600]/50"
                />
              </div>
              <div className="flex items-center gap-2 p-2 rounded-sm bg-[#141414] border border-[#262626]">
                <input
                  type="checkbox"
                  id="api-auto-retry"
                  defaultChecked
                  className="accent-[#E10600]"
                />
                <label
                  htmlFor="api-auto-retry"
                  className="text-xs text-[#A0A0A0]"
                >
                  Auto-retry on failure
                </label>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-sm bg-[#141414] border border-[#262626]">
                <input
                  type="checkbox"
                  id="api-log-requests"
                  defaultChecked
                  className="accent-[#E10600]"
                />
                <label
                  htmlFor="api-log-requests"
                  className="text-xs text-[#A0A0A0]"
                >
                  Log API requests
                </label>
              </div>
              <button className="w-full bg-[#E10600] text-white px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-[#E10600]/80 transition-colors">
                Save API Settings
              </button>
            </div>
          </FloatingPanel>
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingPanel title="Theme">
            <div className="grid grid-cols-2 gap-2">
              {["Dark (Default)", "Carbon Fiber", "AMG Line", "Racing Red"].map(
                (t) => (
                  <label
                    key={t}
                    className={`flex items-center gap-2 p-2 rounded-sm border cursor-pointer transition-colors ${
                      theme === t
                        ? "bg-[#1A1A1A] border-[#E10600]/50"
                        : "bg-[#141414] border-[#262626] hover:border-[#333]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === t}
                      onChange={() => setTheme(t)}
                      className="accent-[#E10600]"
                    />
                    <span className="text-xs text-[#A0A0A0]">{t}</span>
                  </label>
                ),
              )}
            </div>
          </FloatingPanel>
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingPanel title="Notification Preferences">
            <div className="space-y-2">
              {[
                { id: "notif-race-start", label: "Race start alerts" },
                {
                  id: "notif-strategy",
                  label: "Strategy recommendations",
                },
                { id: "notif-weather", label: "Weather updates" },
                { id: "notif-errors", label: "System errors" },
              ].map((n) => (
                <label
                  key={n.id}
                  className="flex items-center gap-2 p-2 rounded-sm bg-[#141414] border border-[#262626] hover:border-[#333] transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id={n.id}
                    checked={notifications[n.id as keyof typeof notifications]}
                    onChange={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [n.id]: !prev[n.id as keyof typeof notifications],
                      }))
                    }
                    className="accent-[#E10600]"
                  />
                  <span className="text-xs text-[#A0A0A0]">{n.label}</span>
                </label>
              ))}
            </div>
          </FloatingPanel>
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingPanel title="Data Refresh Interval">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#A0A0A0] block mb-1">
                  Auto-refresh interval
                </label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-sm p-2 text-xs text-white focus:outline-none focus:border-[#E10600]/50"
                >
                  <option>5 seconds</option>
                  <option>10 seconds</option>
                  <option>30 seconds</option>
                  <option>60 seconds</option>
                  <option>Manual only</option>
                </select>
              </div>
              <label className="flex items-center gap-2 p-2 rounded-sm bg-[#141414] border border-[#262626] hover:border-[#333] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  id="refresh-animations"
                  checked={animations}
                  onChange={() => setAnimations((p) => !p)}
                  className="accent-[#E10600]"
                />
                <span className="text-xs text-[#A0A0A0]">
                  Show animation effects
                </span>
              </label>
            </div>
          </FloatingPanel>
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingPanel title="About">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-[#A0A0A0]">Version</span>
                <span className="text-white font-mono">
                  {status?.version ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#262626]/50">
                <span className="text-[#A0A0A0]">Backend Status</span>
                <div className="flex items-center gap-1.5">
                  <StatusDot
                    color={status?.api === "online" ? "green" : "red"}
                  />
                  <span
                    className={
                      status?.api === "online"
                        ? "text-[#00FF85] font-mono"
                        : "text-[#E10600] font-mono"
                    }
                  >
                    {status?.api ?? "checking..."}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#262626]/50">
                <span className="text-[#A0A0A0]">V3 Engine</span>
                <span className="text-white font-mono">
                  {v3Health ? "connected" : "disconnected"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#262626]/50">
                <span className="text-[#A0A0A0]">Backend Uptime</span>
                <span className="text-[#00FF85] font-mono">
                  {metrics
                    ? `${Math.floor(metrics.uptime_seconds / 3600)}h ${Math.floor((metrics.uptime_seconds % 3600) / 60)}m`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#262626]/50">
                <span className="text-[#A0A0A0]">API Base URL</span>
                <span className="text-white font-mono text-[9px]">
                  {API_BASE}
                </span>
              </div>
            </div>
          </FloatingPanel>
        </motion.div>
      </motion.div>
    </div>
  );
}
