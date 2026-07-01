import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useStatusQuery, useV3HealthQuery } from "@/hooks/useApiQueries";

const NAV_SECTIONS = [
  {
    label: "RACE",
    items: [
      { to: "/race-center" as const, label: "Race Center", icon: "◈" },
      { to: "/ai-engineer" as const, label: "AI Engineer", icon: "◇" },
      { to: "/telemetry" as const, label: "Telemetry", icon: "▤" },
    ],
  },
  {
    label: "ANALYSIS",
    items: [
      { to: "/strategy-lab" as const, label: "Strategy Lab", icon: "⊞" },
      { to: "/simulation" as const, label: "Simulation", icon: "▶" },
      { to: "/analytics" as const, label: "Analytics", icon: "▦" },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { to: "/knowledge" as const, label: "Knowledge", icon: "◎" },
      { to: "/memory" as const, label: "Memory", icon: "◉" },
      { to: "/settings" as const, label: "Settings", icon: "⚙" },
    ],
  },
];

export function Sidebar() {
  const { location } = useRouterState();
  const [time, setTime] = useState("");
  const { data: statusData } = useStatusQuery();
  const { data: v3Health } = useV3HealthQuery();

  const apiOnline = statusData?.api === "online";
  const v3Online = !!v3Health;

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const statusItems = [
    {
      label: "Backend",
      status: apiOnline ? ("online" as const) : ("offline" as const),
    },
    {
      label: "AI Engine",
      status: v3Online ? ("online" as const) : ("offline" as const),
    },
    {
      label: "Memory",
      status: v3Online ? ("online" as const) : ("offline" as const),
    },
  ];

  return (
    <aside className="fixed top-0 left-0 z-50 h-full w-[240px] border-r border-[#1E1E1E] bg-[#050505] flex flex-col">
      <Link
        to="/"
        className="flex items-center gap-3 px-5 h-[60px] border-b border-[#1E1E1E] shrink-0 group"
      >
        <motion.div
          whileHover={{ rotate: -5, scale: 1.05 }}
          className="w-7 h-7 bg-gradient-to-br from-[#E10600] to-[#E10600]/80 rounded-sm flex items-center justify-center group-hover:shadow-glow-red transition-all duration-300"
        >
          <span className="text-white font-bold text-[11px] font-[family-name:var(--font-heading)] tracking-tight">
            AQ
          </span>
        </motion.div>
        <div>
          <span className="text-sm font-bold text-white tracking-tight font-[family-name:var(--font-heading)]">
            APEXiq
          </span>
          <span className="text-[9px] text-[#666] block tracking-[0.1em] uppercase leading-none mt-px">
            Race OS
          </span>
        </div>
      </Link>

      <nav
        role="navigation"
        aria-label="Main navigation"
        className="flex-1 px-2 py-3 overflow-y-auto space-y-3"
      >
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="space-y-0.5">
            <span className="px-3 text-[9px] tracking-[0.15em] text-[#666] font-medium uppercase">
              {section.label}
            </span>
            <div className="mt-1 space-y-0.5">
              {section.items.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-label={`Navigate to ${item.label}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-2.5 px-3 py-2 rounded-sm text-[12px] font-medium transition-all duration-150 relative",
                      active
                        ? "bg-[#141414] text-white"
                        : "text-[#666] hover:text-[#A0A0A0] hover:bg-[#101010]",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebarActive"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full bg-[#E10600]"
                      />
                    )}
                    <span
                      className="w-4 text-center text-[11px] shrink-0"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-[#1E1E1E] space-y-2">
        <div className="px-2.5 text-[9px] text-[#666] font-mono tracking-[0.08em]">
          {time}
        </div>
        {statusItems.map((s) => (
          <div key={s.label} className="flex items-center gap-2 px-2.5 py-1">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                s.status === "online" ? "bg-[#00FF85]" : "bg-[#E10600]",
              )}
            />
            <span className="text-[10px] text-[#666] font-medium">
              {s.label}
            </span>
            <span className="ml-auto text-[9px] text-[#00FF85] font-mono">
              {s.status === "online" ? "ON" : "OFF"}
            </span>
          </div>
        ))}
        <div className="px-2.5 pt-1 text-[9px] text-[#666] font-mono tracking-wider">
          {statusData
            ? `v${statusData.version} · ${statusData.build}`
            : "Connecting..."}
        </div>
      </div>
    </aside>
  );
}
