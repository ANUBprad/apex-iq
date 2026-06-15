import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EngineBriefing, StrategyReasoning } from "@/types/strategy";
import { GemMeter } from "@/components/ui/GemMeter";

interface AIEngineerPanelProps {
  engineBriefing: EngineBriefing | null;
  reasoning: StrategyReasoning | null;
  confidence: number | null;
}

function BulletList({
  items,
  icon,
  iconClass,
}: {
  items: string[];
  icon: string;
  iconClass: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2 text-[13px] leading-relaxed text-[#E5E7EB]"
        >
          <span className={cn("shrink-0 font-mono text-[12px]", iconClass)}>
            {icon}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function AIEngineerPanel({
  engineBriefing,
  reasoning,
  confidence,
}: AIEngineerPanelProps) {
  const accentAmber = confidence != null && confidence < 65;

  const whyItems = reasoning
    ? [
        `Undercut gain ${reasoning.undercut_gain.toFixed(2)}s`,
        reasoning.traffic_impact,
        reasoning.fuel_analysis,
      ]
    : [];

  const cautionRisks = engineBriefing?.strategic_risks ?? [];
  const mitigants = engineBriefing?.operational_notes ?? [];

  return (
    <aside className="flex h-full flex-col overflow-hidden border border-[#1F1F2E] bg-[#111118]">
      <div className="flex items-center justify-between border-b border-[#1F1F2E] px-5 py-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-[#00D2FF]" strokeWidth={1.8} />
          <div>
            <h2 className="text-[14px] font-semibold text-[#F9FAFB]">
              Race Engineer Briefing
            </h2>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#9CA3AF]">
              Action-first
            </div>
          </div>
        </div>
        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] pulse-dot" />
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {engineBriefing ? (
          <div className="space-y-4">
            <div
              className={cn(
                "border border-[#1F1F2E] bg-[#0A0A0F] p-4",
                accentAmber
                  ? "border-l-[2px] border-l-[#F59E0B]"
                  : "border-l-[2px] border-l-[#00D2FF]",
              )}
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
                Target Action
              </div>
              <div
                className={cn(
                  "mt-2 font-mono text-[18px] font-semibold uppercase tracking-wide",
                  accentAmber ? "text-[#F59E0B]" : "text-[#00D2FF]",
                )}
              >
                {engineBriefing.recommended_action}
              </div>
              {engineBriefing.race_engineer_briefing ? (
                <p className="mt-2 text-[13px] leading-relaxed text-[#9CA3AF]">
                  {engineBriefing.race_engineer_briefing.split("\n")[0]}
                </p>
              ) : null}
            </div>

            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
                Why
              </div>
              <BulletList
                items={whyItems}
                icon="•"
                iconClass="text-[#00D2FF]"
              />
            </div>

            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">
                Risks
              </div>
              <BulletList
                items={cautionRisks}
                icon="⚠"
                iconClass="text-[#F59E0B]"
              />
              <div className="mt-2">
                <BulletList
                  items={mitigants}
                  icon="✓"
                  iconClass="text-[#10B981]"
                />
              </div>
            </div>

            {confidence != null ? (
              <div className="border-t border-[#1F1F2E] pt-4">
                <GemMeter
                  value={confidence}
                  variant="confidence"
                  label="Confidence"
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="border border-dashed border-[#1F1F2E] p-6 text-center text-[13px] text-[#9CA3AF]">
            Run simulation to load engineer briefing.
          </div>
        )}
      </div>
    </aside>
  );
}
