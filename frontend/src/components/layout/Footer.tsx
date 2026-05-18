import { Link } from "@tanstack/react-router";
import { Activity, Cpu, Radio, Signal } from "lucide-react";

const NAV = {
  Platform: [
    { label: "Dashboard", to: "/dashboard" as const },
    { label: "Telemetry", to: "/telemetry" as const },
    { label: "Simulations", to: "/simulations" as const },
    { label: "About", to: "/about" as const },
  ],
  Modules: [
    "Tyre Degradation ML",
    "Undercut Intelligence",
    "Race Simulation Engine",
    "AI Race Engineer",
  ],
  Intelligence: [
    "Weather Nowcasting",
    "Rival Pattern Recognition",
    "Pit Window Optimizer",
    "Strategy Replay",
  ],
};

const STATUS = [
  { icon: Signal, label: "Telemetry Stream", value: "ONLINE" },
  { icon: Cpu, label: "Sim Cluster", value: "12 NODES" },
  { icon: Radio, label: "Race Control", value: "LISTENING" },
  { icon: Activity, label: "Latency", value: "184 MS" },
];

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-apex-red/30 bg-black overflow-hidden">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-apex-red to-transparent" />
      <div className="absolute -top-32 left-1/4 w-[480px] h-[480px] rounded-full bg-apex-red/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[520px] h-[520px] rounded-full bg-apex-cyan/10 blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 apex-grid-bg opacity-[0.025] pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-8 pt-16 pb-6">
        {/* Status strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 pb-10 border-b border-white/5">
          {STATUS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md flex items-center justify-center bg-apex-cyan/10 border border-apex-cyan/30 shrink-0">
                <Icon className="w-4 h-4 text-apex-cyan" />
              </div>
              <div className="min-w-0">
                <div className="font-space-grotesk text-[9px] tracking-[0.25em] text-white/40 uppercase truncate">
                  {label}
                </div>
                <div className="font-rajdhani font-bold text-sm text-white tracking-wider flex items-center gap-1.5">
                  {value}
                  <span className="w-1.5 h-1.5 rounded-full bg-apex-red pulse-dot" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid md:grid-cols-12 gap-10 mb-14">
          <div className="md:col-span-5">
            <div className="font-orbitron font-black text-3xl tracking-widest">
              <span className="text-white">APEX</span>
              <span className="text-apex-red apex-text-glow">iq</span>
            </div>
            <p className="mt-4 font-inter text-sm text-white/55 max-w-sm leading-relaxed">
              AI-powered race strategy intelligence — real-time telemetry,
              tyre modelling, and pit-window optimization, engineered for the
              edge of the racing weekend.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-apex-red/30 bg-apex-red/5">
              <span className="w-1.5 h-1.5 rounded-full bg-apex-red pulse-dot" />
              <span className="font-space-grotesk text-[10px] tracking-[0.3em] text-apex-red uppercase">
                Race Weekend · Live
              </span>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(NAV).map(([heading, items]) => (
              <div key={heading}>
                <div className="font-space-grotesk text-[10px] tracking-[0.3em] text-apex-red uppercase mb-4">
                  // {heading}
                </div>
                <ul className="flex flex-col gap-2.5">
                  {items.map((item) =>
                    typeof item === "string" ? (
                      <li
                        key={item}
                        className="font-inter text-sm text-white/55 hover:text-white transition-colors cursor-default"
                      >
                        {item}
                      </li>
                    ) : (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          className="font-inter text-sm text-white/55 hover:text-apex-red transition-colors inline-flex items-center gap-1.5 group"
                        >
                          <span className="w-0 group-hover:w-3 h-px bg-apex-red transition-all duration-300" />
                          {item.label}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Big wordmark */}
        <div className="relative -mx-2 mb-6 select-none pointer-events-none">
          <div className="font-orbitron font-black text-[18vw] md:text-[14vw] leading-none tracking-[0.02em] text-transparent bg-clip-text bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent">
            APEXiq
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 font-space-grotesk text-[10px] tracking-[0.3em] text-white/45 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-apex-cyan pulse-dot" />
            <span>Built at the limit · Sector 3</span>
          </div>
          <div className="font-space-grotesk text-[10px] tracking-[0.25em] text-white/35 uppercase">
            © {new Date().getFullYear()} APEXiq · All Telemetry Reserved
          </div>
        </div>
      </div>
    </footer>
  );
}