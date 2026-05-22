import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

const LINKS = [
  { to: "/dashboard", label: "Strategy", path: "/dashboard" },
  { to: "/telemetry", label: "Telemetry", path: "/telemetry" },
  { to: "/simulations", label: "Simulation Lab", path: "/simulations" },
  { to: "/circuits", label: "Circuits", path: "/circuits" },
] as const;

function useClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toISOString().slice(11, 19) + " UTC";
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("apexiq-theme");
      const next = stored === "light" || stored === "dark" ? stored : "dark";
      setTheme(next);
      document.documentElement.classList.toggle("dark", next === "dark");
    } catch {
      // ignore
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("apexiq-theme", next);
    } catch {
      // ignore
    }
  };

  const Icon = theme === "dark" ? Moon : Sun;
  const label = mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={toggle}
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-md border transition-colors",
        "border-border bg-card hover:bg-accent"
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
    </button>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { location } = useRouterState();
  const clock = useClock();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-200",
        scrolled ? "shadow-[0_1px_0_rgba(255,255,255,0.06)]" : ""
      )}
    >
      <div className={cn(
        "border-b transition-all duration-200 backdrop-blur",
        "bg-background/80",
        scrolled ? "border-border" : "border-transparent"
      )}>
        <div className="max-w-[1500px] mx-auto px-6 flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="font-orbitron font-semibold text-[18px] text-foreground tracking-tight">
              APEX<span className="text-red-ferrari">iq</span>
            </span>
            <span className="hidden lg:inline-block font-mono text-[10px] tracking-[0.15em] text-[#9CA3AF] uppercase border-l border-[#E5E7EB] pl-2.5">
              Race OS
            </span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => {
              const active = location.pathname === l.path;
              return (
                <Link
                  key={l.path}
                  to={l.to}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors duration-150",
                    active
                      ? "text-red-ferrari"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {l.label}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-red-ferrari rounded-t" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 h-8 rounded-md bg-card border border-border">
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{clock}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 h-8 rounded-md bg-[rgba(0,217,255,0.06)] border border-[rgba(0,217,255,0.18)]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-telemetry" />
              <span className="font-rajdhani text-[11px] font-semibold tracking-[0.12em] text-cyan-electric uppercase">Live</span>
            </div>
            <Link
              to="/dashboard"
              className="hidden md:inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-red-ferrari text-white font-rajdhani text-[13px] font-semibold tracking-[0.08em] uppercase hover:brightness-110 transition-colors"
            >
              Launch
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
