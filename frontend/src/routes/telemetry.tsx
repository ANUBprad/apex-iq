import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TelemetryCharts } from "@/components/dashboard/TelemetryCharts";
import { TyreRing } from "@/components/ui-apex/TyreRing";
import { TelemetryGraph } from "@/components/ui-apex/TelemetryGraph";
import { TYRE_STATUS, genTelemetryStream } from "@/lib/apex-data";

type CompoundType = "soft" | "medium" | "hard";

const COMPOUND_MAP: Record<string, CompoundType> = {
  SOFT: "soft",
  MEDIUM: "medium",
  HARD: "hard",
  INTER: "medium",
  WET: "hard",
};

export const Route = createFileRoute("/telemetry")({
  component: TelemetryPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Telemetry Center" },
      { name: "description", content: "Live race data intelligence engine — tyre temperatures, stint analysis, and degradation modelling." },
    ],
  }),
});

function TelemetryPage() {
  const telemetryData = useMemo(() => genTelemetryStream(120), []);

  return (
    <div className="min-h-screen bg-background apex-radial-bg">
      <Navbar />
      <main className="pt-28 px-6 max-w-[1500px] mx-auto pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="font-space-grotesk text-[10px] tracking-[0.4em] text-apex-red uppercase mb-3">// Live Race Data Intelligence</div>
          <h1 className="font-orbitron font-black text-5xl md:text-6xl text-white tracking-wider apex-text-glow">TELEMETRY CENTER</h1>
          <div className="mt-2 h-px w-32 bg-gradient-to-r from-apex-red to-transparent" />
        </motion.div>

        <section className="mb-10">
          <div className="font-orbitron text-xs tracking-[0.3em] text-apex-red mb-4">TYRE STATUS RINGS</div>
          <div className="grid grid-cols-2 gap-6">
            {TYRE_STATUS.map((t) => (
              <div key={t.position} className="apex-glass rounded-lg p-5 flex items-center justify-center">
                <TyreRing
                  position={t.position}
                  compound={t.compound}
                  temperature={t.temperature}
                  wear={t.wear}
                  frontTemp={t.frontTemp}
                  centerTemp={t.centerTemp}
                  rearTemp={t.rearTemp}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="font-orbitron text-xs tracking-[0.3em] text-apex-red mb-4">LIVE TELEMETRY STREAM</div>
          <TelemetryGraph data={telemetryData} />
        </section>

        <section>
          <div className="font-orbitron text-xs tracking-[0.3em] text-apex-red mb-4">CHART INTELLIGENCE GRID</div>
          <TelemetryCharts seed={1} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
