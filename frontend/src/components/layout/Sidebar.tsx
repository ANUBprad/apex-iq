import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useStatusQuery, useV3HealthQuery } from "@/hooks/useApiQueries";

const NavIcon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    "mission-control": (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="8" cy="8" r="6" />
        <circle cx="8" cy="8" r="2" />
        <line x1="8" y1="2" x2="8" y2="4" />
        <line x1="8" y1="12" x2="8" y2="14" />
        <line x1="2" y1="8" x2="4" y2="8" />
        <line x1="12" y1="8" x2="14" y2="8" />
      </svg>
    ),
    "race-center": (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M2 12 L8 3 L14 12 Z" />
        <line x1="8" y1="7" x2="8" y2="9" />
      </svg>
    ),
    telemetry: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <rect x="3" y="8" width="2" height="5" rx="0.5" />
        <rect x="7" y="5" width="2" height="8" rx="0.5" />
        <rect x="11" y="3" width="2" height="10" rx="0.5" />
      </svg>
    ),
    "strategy-lab": (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <rect x="3" y="3" width="4" height="4" rx="0.5" />
        <rect x="9" y="3" width="4" height="4" rx="0.5" />
        <rect x="3" y="9" width="4" height="4" rx="0.5" />
        <rect x="9" y="9" width="4" height="4" rx="0.5" />
      </svg>
    ),
    simulation: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="8" cy="8" r="5" />
        <circle cx="6" cy="7" r="0.5" fill="currentColor" />
        <circle cx="10" cy="7" r="0.5" fill="currentColor" />
        <path d="M6 10 Q8 12 10 10" />
      </svg>
    ),
    "ai-engineer": (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <rect x="4" y="2" width="8" height="10" rx="1" />
        <circle cx="7" cy="6" r="0.8" fill="currentColor" />
        <circle cx="9" cy="6" r="0.8" fill="currentColor" />
        <line x1="6" y1="9" x2="10" y2="9" />
        <line x1="8" y1="12" x2="8" y2="14" />
        <line x1="6" y1="14" x2="10" y2="14" />
      </svg>
    ),
    analytics: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <polyline points="2,12 5,8 8,10 11,5 14,7" />
        <circle cx="5" cy="8" r="0.8" fill="currentColor" />
        <circle cx="8" cy="10" r="0.8" fill="currentColor" />
        <circle cx="11" cy="5" r="0.8" fill="currentColor" />
      </svg>
    ),
    settings: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="8" cy="8" r="2.5" />
        <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1" />
      </svg>
    ),
  };
  return icons[name] || null;
};

const NAV_SECTIONS = [
  {
    label: "RACE",
    items: [
      {
        to: "/mission-control" as const,
        label: "Mission Control",
        icon: "mission-control",
        accent: "#E10600",
      },
      {
        to: "/race-center" as const,
        label: "Race Center",
        icon: "race-center",
        accent: "#00FF85",
      },
      {
        to: "/telemetry" as const,
        label: "Telemetry",
        icon: "telemetry",
        accent: "#0066FF",
      },
    ],
  },
  {
    label: "STRATEGY",
    items: [
      {
        to: "/strategy-lab" as const,
        label: "Strategy Lab",
        icon: "strategy-lab",
        accent: "#FF8800",
      },
      {
        to: "/simulation" as const,
        label: "Simulation",
        icon: "simulation",
        accent: "#A855F7",
      },
    ],
  },
  {
    label: "AI",
    items: [
      {
        to: "/ai-engineer" as const,
        label: "AI Engineer",
        icon: "ai-engineer",
        accent: "#FFFFFF",
      },
      {
        to: "/analytics" as const,
        label: "Analytics",
        icon: "analytics",
        accent: "#00D4FF",
      },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        to: "/settings" as const,
        label: "Settings",
        icon: "settings",
        accent: "#666666",
      },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { location } = useRouterState();
  const [time, setTime] = useState("");
  const { data: statusData } = useStatusQuery();
  const { data: v3Health } = useV3HealthQuery();

  const apiOnline = statusData?.api === "online";
  const aiStatus = (v3Health?.status ?? "not_initialized") as
    "ready" | "loading" | "error" | "not_initialized";

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

  const handleNavClick = useCallback(() => {
    if (window.innerWidth < 1024) onClose();
  }, [onClose]);

  const statusItems = [
    {
      label: "Backend",
      status: apiOnline ? ("online" as const) : ("offline" as const),
      latency: statusData?.latency_ms,
    },
    {
      label: "AI",
      status:
        aiStatus === "ready"
          ? ("online" as const)
          : aiStatus === "loading"
            ? ("loading" as const)
            : aiStatus === "error"
              ? ("error" as const)
              : ("standby" as const),
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[240px] border-r border-[#1E1E1E] bg-[#050505] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Sidebar navigation"
      >
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 px-5 h-[56px] border-b border-[#1E1E1E] shrink-0 group"
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
          className="flex-1 px-2 py-4 overflow-y-auto"
        >
          {NAV_SECTIONS.map((section, si) => (
            <div
              key={si}
              className={si < NAV_SECTIONS.length - 1 ? "mb-5" : "mb-3"}
            >
              <span className="px-3 text-[9px] tracking-[0.18em] text-[#444] font-semibold uppercase mb-1.5 block">
                {section.label}
              </span>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={handleNavClick}
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
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full"
                          style={{ backgroundColor: item.accent }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                      <NavIcon
                        name={item.icon}
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors duration-150",
                          active
                            ? "text-white"
                            : "text-[#555] group-hover:text-[#888]",
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-[#1E1E1E] space-y-2.5">
          <div className="px-2.5 text-[9px] text-[#555] font-mono tracking-[0.08em]">
            {time}
          </div>
          {statusItems.map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-2.5 py-1">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  s.status === "online"
                    ? "bg-[#00FF85]"
                    : s.status === "loading"
                      ? "bg-[#FFD400]"
                      : s.status === "error"
                        ? "bg-[#E10600]"
                        : "bg-[#555]",
                )}
              />
              <span className="text-[10px] text-[#666] font-medium">
                {s.label}
              </span>
              <span className="ml-auto text-[9px] font-mono">
                {s.status === "online" ? (
                  <span className="text-[#00FF85]">
                    {"latency" in s && s.latency
                      ? `${Math.round(s.latency)} ms`
                      : "Ready"}
                  </span>
                ) : s.status === "loading" ? (
                  <span className="text-[#FFD400]">Loading</span>
                ) : s.status === "error" ? (
                  <span className="text-[#E10600]">Error</span>
                ) : (
                  <span className="text-[#555]">Not Initialized</span>
                )}
              </span>
            </div>
          ))}
          <div className="px-2.5 pt-1 text-[9px] text-[#444] font-mono tracking-wider">
            {statusData ? `v${statusData.version}` : "Connecting..."}
          </div>
        </div>
      </aside>
    </>
  );
}
