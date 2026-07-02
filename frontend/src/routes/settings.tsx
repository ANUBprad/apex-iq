import { createFileRoute } from "@tanstack/react-router";
import { FloatingPanel, StatusDot } from "@/components/f1";
import { motion } from "framer-motion";
import { useState } from "react";
import { useStatusQuery } from "@/hooks/useApiQueries";
import { useSettings } from "@/hooks/useSettings";

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
        content: "APEXiq user preferences and system settings.",
      },
    ],
  }),
});

function SettingsPage() {
  const { settings, update } = useSettings();
  const [notifications, setNotifications] = useState({
    "notif-race-start": true,
    "notif-strategy": true,
    "notif-weather": false,
    "notif-errors": true,
  });
  const { data: status } = useStatusQuery();

  return (
    <div className="min-h-screen bg-[#050505]">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-[1] p-5 space-y-4 max-w-2xl"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] tracking-tight">
            Settings
          </h1>
          <p className="text-[10px] text-[#555] mt-0.5">User preferences</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingPanel title="Appearance">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#A0A0A0] block mb-1">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Dark (Default)",
                    "Carbon Fiber",
                    "AMG Line",
                    "Racing Red",
                  ].map((t) => (
                    <label
                      key={t}
                      className={`flex items-center gap-2 p-2 rounded-sm border cursor-pointer transition-colors ${
                        settings.theme === t
                          ? "bg-[#1A1A1A] border-[#E10600]/50"
                          : "bg-[#141414] border-[#262626] hover:border-[#333]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        checked={settings.theme === t}
                        onChange={() =>
                          update({ theme: t as "dark" | "light" })
                        }
                        className="accent-[#E10600]"
                      />
                      <span className="text-xs text-[#A0A0A0]">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 p-2 rounded-sm bg-[#141414] border border-[#262626] hover:border-[#333] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.animationsEnabled}
                  onChange={() =>
                    update({ animationsEnabled: !settings.animationsEnabled })
                  }
                  className="accent-[#E10600]"
                />
                <span className="text-xs text-[#A0A0A0]">Animations</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-sm bg-[#141414] border border-[#262626] hover:border-[#333] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compactMode ?? false}
                  onChange={() =>
                    update({ compactMode: !(settings.compactMode ?? false) })
                  }
                  className="accent-[#E10600]"
                />
                <span className="text-xs text-[#A0A0A0]">Compact Mode</span>
              </label>
            </div>
          </FloatingPanel>
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingPanel title="Dashboard">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#A0A0A0] block mb-1">
                  Refresh Interval
                </label>
                <select
                  value={settings.telemetryRefreshMs}
                  onChange={(e) =>
                    update({ telemetryRefreshMs: parseInt(e.target.value) })
                  }
                  className="w-full bg-[#141414] border border-[#262626] rounded-sm p-2 text-xs text-white focus:outline-none focus:border-[#E10600]/50"
                >
                  <option value={2000}>2 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                  <option value={30000}>30 seconds</option>
                </select>
              </div>
              <label className="flex items-center gap-2 p-2 rounded-sm bg-[#141414] border border-[#262626] hover:border-[#333] transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.liveUpdates ?? true}
                  onChange={() =>
                    update({ liveUpdates: !(settings.liveUpdates ?? true) })
                  }
                  className="accent-[#E10600]"
                />
                <span className="text-xs text-[#A0A0A0]">Live Updates</span>
              </label>
            </div>
          </FloatingPanel>
        </motion.div>

        <motion.div variants={fadeUp}>
          <FloatingPanel title="Notifications">
            <div className="space-y-2">
              {[
                { id: "notif-race-start", label: "Race start alerts" },
                { id: "notif-strategy", label: "Strategy recommendations" },
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
          <FloatingPanel title="About">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-[#A0A0A0]">Version</span>
                <span className="text-white font-mono">
                  {status?.version ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#262626]/50">
                <span className="text-[#A0A0A0]">Build</span>
                <span className="text-white font-mono">
                  {status?.build ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#262626]/50">
                <span className="text-[#A0A0A0]">Backend</span>
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
                <span className="text-[#A0A0A0]">GitHub</span>
                <a
                  href="https://github.com/anubhab-pradhan/apexiq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0066FF] font-mono hover:underline"
                >
                  anubhab-pradhan/apexiq
                </a>
              </div>
            </div>
          </FloatingPanel>
        </motion.div>
      </motion.div>
    </div>
  );
}
