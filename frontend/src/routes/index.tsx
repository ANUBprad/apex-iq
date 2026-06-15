import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { StrategyIntelligence } from "@/components/landing/StrategyIntelligence";
import { TelemetryIntelligence } from "@/components/landing/TelemetryIntelligence";
import { SimulationEngine } from "@/components/landing/SimulationEngine";
import { AIRaceEngineer } from "@/components/landing/AIRaceEngineer";
import { CTASection } from "@/components/landing/CTASection";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "APEXiq · AI Race Strategy Intelligence" },
      {
        name: "description",
        content:
          "AI-powered Formula 1 race strategy intelligence platform -- real-time telemetry, tyre degradation prediction, and pit strategy optimization.",
      },
    ],
  }),
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <StrategyIntelligence />
        <TelemetryIntelligence />
        <SimulationEngine />
        <AIRaceEngineer />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
