import { useState } from "react";
import { runScenario, type ScenarioResponse } from "@/lib/api";

const SCENARIOS = [
  "Safety Car in 5 laps",
  "Virtual Safety Car",
  "Light Rain",
  "Heavy Rain",
  "High Tyre Degradation",
  "Fuel Saving Mode",
];

export function ScenarioLab() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResponse | null>(null);

  const handleRun = async () => {
    if (!selected) return;

    setLoading(true);

    try {
      const response = await runScenario({
        scenario: selected,
        compound: "MEDIUM",
        tyre_age: 12,
        circuit: "Monaco",
        gap_ahead: 2.5,
        gap_behind: 1.8,
      });

      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border border-[#1F1F2E] bg-[#111118] p-5">
      <header className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
        Scenario Lab
      </header>

      <div className="mt-4 space-y-2">
        {SCENARIOS.map((scenario) => {
          const active = selected === scenario;

          return (
            <button
              key={scenario}
              type="button"
              onClick={() => {
                setSelected(scenario);
                setResult(null);
              }}
              className={`w-full border px-3 py-3 text-left text-[13px] transition-all ${
                active
                  ? "border-[#00D2FF] bg-[#00D2FF]/10 text-[#F9FAFB]"
                  : "border-[#1F1F2E] bg-[#0A0A0F] text-[#9CA3AF] hover:border-[#00D2FF]/40 hover:text-[#F9FAFB]"
              }`}
            >
              {scenario}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={handleRun}
        className={`mt-4 w-full border py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition-all ${
          selected
            ? "border-[#00D2FF] bg-[#00D2FF]/10 text-[#00D2FF] hover:bg-[#00D2FF]/15"
            : "border-[#1F1F2E] bg-[#0A0A0F] text-[#6B7280] cursor-not-allowed"
        }`}
      >
        {loading ? "Running..." : "Run Scenario"}
      </button>

      {result && (
        <div className="mt-4 border border-[#1F1F2E] bg-[#0A0A0F] p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
            Simulation Result
          </div>

          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
              Recommendation
            </div>

            <div className="mt-1 font-mono text-[16px] font-semibold text-[#00D2FF]">
              {result.recommendation}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="border border-[#1F1F2E] bg-[#111118] p-3">
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                Advantage
              </div>

              <div className="mt-1 font-mono text-[14px] text-[#10B981]">
                +{result.advantage.toFixed(1)}s
              </div>
            </div>

            <div className="border border-[#1F1F2E] bg-[#111118] p-3">
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                Confidence
              </div>

              <div className="mt-1 font-mono text-[14px] text-[#F9FAFB]">
                {result.confidence}%
              </div>
            </div>
          </div>

          <div className="mt-4 border-l-2 border-[#00D2FF] pl-3 text-[12px] text-[#9CA3AF]">
            {result.reasoning}
          </div>
        </div>
      )}
    </section>
  );
}
