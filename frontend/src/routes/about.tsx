import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Cpu, Radio, Timer } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/about")({
  component: EngineeringBriefPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Engineering Brief" },
      {
        name: "description",
        content:
          "Engineering brief for the APEXiq strategy OS — how the system turns telemetry and constraints into actionable race calls.",
      },
    ],
  }),
});

function EngineeringBriefPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20 px-4 max-w-[1200px] mx-auto pb-16">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border border-border bg-card/60 backdrop-blur p-6 md:p-10 mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-background/40 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-electric/80" />
            <span className="font-rajdhani text-[11px] tracking-[0.22em] text-muted-foreground uppercase font-semibold">
              Engineering Brief
            </span>
          </div>

          <h1 className="font-orbitron font-semibold text-[34px] md:text-[52px] leading-[0.98] tracking-[-0.03em] text-foreground">
            How APEXiq
            <br />
            turns chaos into calls
          </h1>

          <p className="mt-5 text-[14px] text-muted-foreground leading-[1.8] max-w-2xl">
            APEXiq is designed like pit wall software: inputs, constraints,
            scenarios, and a clear recommendation. It’s not a marketing
            dashboard and it’s not a chat UI — it’s a decision surface.
          </p>
        </motion.section>

        <section className="mb-10">
          <div className="text-[14px] font-semibold text-foreground mb-4">
            Control Loop
          </div>
          <div className="rounded-lg border border-border bg-card/60 backdrop-blur p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              {[
                {
                  name: "Telemetry",
                  icon: Radio,
                  border: "border-[rgba(0,217,255,0.22)]",
                  bg: "bg-[rgba(0,217,255,0.06)]",
                  text: "text-cyan-electric",
                },
                {
                  name: "Feature Store",
                  icon: Cpu,
                  border: "border-border",
                  bg: "bg-background/40",
                  text: "text-muted-foreground",
                },
                {
                  name: "Simulation",
                  icon: Timer,
                  border: "border-[rgba(220,20,60,0.25)]",
                  bg: "bg-[rgba(220,20,60,0.08)]",
                  text: "text-red-ferrari",
                },
                {
                  name: "Recommendation",
                  icon: ChevronRight,
                  border: "border-border",
                  bg: "bg-background/40",
                  text: "text-muted-foreground",
                },
              ].map((n, i, a) => (
                <div key={n.name} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md border ${n.border} ${n.bg}`}
                  >
                    <n.icon
                      className={`w-3.5 h-3.5 ${n.text}`}
                      strokeWidth={1.8}
                    />
                    <span className="font-grotesk text-[13px] font-medium">
                      {n.name}
                    </span>
                  </div>
                  {i < a.length - 1 && (
                    <ChevronRight
                      className="w-3 h-3 text-border"
                      strokeWidth={2}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-5 text-[13px] text-muted-foreground leading-[1.75] max-w-2xl">
              Telemetry streams in, constraints are applied (traffic, weather,
              safety car risk), scenarios are simulated, and a ranked strategy
              recommendation is surfaced as a single call you can execute.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
