import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", path: "/dashboard", code: "01" },
  { to: "/telemetry", label: "Telemetry", path: "/telemetry", code: "02" },
  { to: "/simulations", label: "Simulations", path: "/simulations", code: "03" },
  { to: "/about", label: "About", path: "/about", code: "04" },
] as const;

function useClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toISOString().slice(11, 19) + " UTC";
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { location } = useRouterState();
  const clock = useClock();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "pt-2" : "pt-4"
      )}
    >
      <div className="max-w-[1500px] mx-auto px-4">
        <div
          className={cn(
            "relative flex items-center justify-between gap-6 rounded-full border border-white/[0.06] backdrop-blur-2xl transition-all duration-500",
            scrolled
              ? "h-12 bg-black/70 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]"
              : "h-14 bg-black/40 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]"
          )}
        >
          {/* Top hairline accent */}
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 pl-5 group">
            <span className="relative flex items-center justify-center w-6 h-6">
              <span className="absolute inset-0 rounded-sm bg-apex-red/20 blur-md group-hover:bg-apex-red/40 transition" />
              <span className="relative w-2.5 h-2.5 rotate-45 bg-apex-red shadow-[0_0_12px_rgba(255,30,30,0.8)]" />
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-orbitron font-black text-[15px] tracking-[0.18em] text-white">
                APEX<span className="text-apex-red">iq</span>
              </span>
              <span className="hidden lg:inline-block font-space-grotesk text-[9px] tracking-[0.3em] text-white/30 uppercase border-l border-white/10 pl-1.5">
                Race OS
              </span>
            </div>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-full">
            <div className="flex items-center gap-1 px-1.5 h-9 rounded-full bg-white/[0.02] border border-white/[0.04]">
              {LINKS.map((l) => {
                const active = location.pathname === l.path;
                return (
                  <Link
                    key={l.path}
                    to={l.to}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3.5 h-7 rounded-full font-space-grotesk text-[11px] tracking-[0.18em] uppercase transition-all duration-300",
                      active
                        ? "text-white bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "text-white/55 hover:text-white"
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[8px] tabular-nums transition",
                        active ? "text-apex-red" : "text-white/30"
                      )}
                    >
                      {l.code}
                    </span>
                    <span>{l.label}</span>
                    {active && (
                      <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-px bg-apex-red shadow-[0_0_8px_rgba(255,30,30,0.9)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3 pr-2">
            <div className="hidden lg:flex items-center gap-2 px-2.5 h-7 rounded-full bg-white/[0.02] border border-white/[0.05]">
              <span className="font-mono text-[10px] tabular-nums text-white/55">
                {clock}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-2.5 h-7 rounded-full border border-apex-red/25 bg-apex-red/[0.06]">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-apex-red animate-ping opacity-60" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-apex-red" />
              </span>
              <span className="font-space-grotesk text-[10px] tracking-[0.25em] text-apex-red font-medium">
                LIVE
              </span>
            </div>
            <button
              type="button"
              className="hidden md:inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-white text-black font-space-grotesk text-[11px] tracking-[0.15em] uppercase font-semibold hover:bg-apex-red hover:text-white transition-all duration-300 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
            >
              Pit Wall
              <span className="w-1 h-1 rounded-full bg-apex-red group-hover:bg-white" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
