import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COMPOUNDS, type CompoundId } from "@/lib/apex-data";

export const Route = createFileRoute("/telemetry")({
  component: TelemetryPage,
  head: () => ({
    meta: [
      { title: "APEXiq · Telemetry Center" },
      { name: "description", content: "Live race data intelligence engine -- tyre temperatures, stint analysis, and degradation modelling." },
    ],
  }),
});

function NoDataCard({ title }: { title: string }) {
  return (
    <div className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-2">{title}</div>
      <div className="py-8 text-center">
        <div className="font-inter text-sm text-[#9CA3AF]">Awaiting telemetry feed</div>
        <div className="text-[12px] text-[#D1D5DB] mt-1">Connect to live session for data</div>
      </div>
    </div>
  );
}

function TelemetryPage() {
  const [compound, setCompound] = useState<CompoundId>("MEDIUM");
  const compoundData = COMPOUNDS.find((c) => c.id === compound)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20 px-4 pb-10 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 flex items-end justify-between flex-wrap gap-3 pt-4"
        >
          <div>
            <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.5px] mb-1">Live Race Data Intelligence</div>
            <h1 className="font-grotesk font-semibold text-2xl md:text-3xl text-foreground">
              Telemetry Center
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md border border-border bg-card/40 text-[12px] font-semibold text-muted-foreground uppercase">
              Awaiting Feed
            </span>
          </div>
        </motion.div>

        {/* Top row: Tyre temps + Compound + Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mb-4">
          <div className="space-y-4">
            {/* Tyre temperature rings - no data state */}
            <NoDataCard title="Tyre Surface Temperatures" />

            {/* Compound selector + DRS + ERS */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
              <div className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] mb-3">Active Compound</div>
                <div className="flex gap-1.5 mb-4">
                  {COMPOUNDS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCompound(c.id)}
                      className={`flex-1 py-2 rounded-md text-[10px] font-semibold tracking-wider transition-all border ${
                        compound === c.id
                          ? "text-white border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                          : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F8F9FB]"
                      }`}
                      style={compound === c.id ? { background: c.color } : {}}
                    >
                      {c.shortLabel}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Grip Base", value: `${compoundData.gripBase}%` },
                    { label: "Deg Rate", value: `${compoundData.degRate}s/lap` },
                    { label: "Stint Window", value: `L${compoundData.stintWindow[0]}-L${compoundData.stintWindow[1]}` },
                  ].map((d) => (
                    <div key={d.label} className="border border-[#E5E7EB] rounded-md p-2.5 bg-white">
                      <div className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">{d.label}</div>
                      <div className="font-mono text-[13px] font-semibold text-[#1A1D29] tabular-nums">{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">DRS</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" />
                  </div>
                  <div className="text-[13px] text-[#9CA3AF]">Unavailable</div>
                </div>
                <NoDataCard title="ERS Energy" />
              </div>
            </div>
          </div>

          {/* Weather panel */}
          <NoDataCard title="Environment" />
        </div>

        {/* Lap times strip - no data state */}
        <NoDataCard title="Lap Time History" />

        {/* Chart grid - all show no data */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <NoDataCard title="Tyre Degradation Curve" />
          <NoDataCard title="Lap Pace Delta" />
          <NoDataCard title="Undercut Advantage" />
          <NoDataCard title="Fuel Load Curve" />
          <NoDataCard title="ERS Deploy / Harvest" />
          <NoDataCard title="Lap Time Trend" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
