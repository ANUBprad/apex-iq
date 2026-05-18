import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Capabilities } from "@/components/landing/Capabilities";
import { CircuitIntelligence } from "@/components/landing/CircuitIntelligence";
import { TelemetryPreview } from "@/components/landing/TelemetryPreview";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "APEXiq · AI Race Strategy Intelligence" },
      { name: "description", content: "AI-powered Formula 1 race strategy intelligence platform — real-time telemetry, tyre degradation prediction, and pit strategy optimization." },
    ],
  }),
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Capabilities />
        <CircuitIntelligence />
        <TelemetryPreview />
      </main>
      <Footer />
    </div>
  );
}
