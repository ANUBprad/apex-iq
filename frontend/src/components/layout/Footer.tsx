import { Link } from "@tanstack/react-router";

const NAV = {
  Platform: [
    { label: "Strategy Center", to: "/dashboard" as const },
    { label: "Telemetry", to: "/telemetry" as const },
    { label: "Simulation Lab", to: "/simulations" as const },
    { label: "Circuit Intelligence", to: "/circuits" as const },
  ],
  Modules: [
    "Tyre Degradation",
    "Pit Window Optimizer",
    "Undercut / Overcut",
    "Engineer Briefing",
  ],
  Intelligence: [
    "Traffic Projection",
    "Weather Risk",
    "Compound Behaviour",
    "Circuit Characteristics",
  ],
};

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card/30 backdrop-blur">
      <div className="max-w-[1400px] mx-auto px-6 pt-12 pb-8">
        {/* Main grid */}
        <div className="grid md:grid-cols-12 gap-8 mb-10">
          <div className="md:col-span-5">
            <div className="font-orbitron font-semibold text-[20px] tracking-tight text-foreground">
              APEX<span className="text-red-ferrari">iq</span>
            </div>
            <p className="mt-3 text-[14px] text-muted-foreground max-w-sm leading-[1.75]">
              AI-powered race intelligence for strategy optimization, telemetry
              analysis, tyre prediction, and simulation — designed like a
              Formula 1 command center.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-background/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-electric/70" />
              <span className="font-rajdhani text-[11px] tracking-[0.22em] text-muted-foreground uppercase font-semibold">
                Strategy OS
              </span>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {Object.entries(NAV).map(([heading, items]) => (
              <div key={heading}>
                <div className="text-[12px] font-semibold text-foreground uppercase tracking-[0.5px] mb-3">
                  {heading}
                </div>
                <ul className="flex flex-col gap-2">
                  {items.map((item) =>
                    typeof item === "string" ? (
                      <li
                        key={item}
                        className="text-[13px] text-muted-foreground transition-colors cursor-default"
                      >
                        {item}
                      </li>
                    ) : (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          className="text-[13px] text-muted-foreground hover:text-cyan-electric transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-red-ferrari/80" />
            <span className="text-[12px] text-muted-foreground">
              Built at the limit.
            </span>
          </div>
          <div className="text-[12px] text-muted-foreground">
            &copy; {new Date().getFullYear()} APEXiq
          </div>
        </div>
      </div>
    </footer>
  );
}
