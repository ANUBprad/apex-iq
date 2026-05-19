import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap } from "lucide-react";
import { CIRCUITS, COMPOUNDS, type CompoundId } from "@/lib/apex-data";
import { GlowButton } from "@/components/ui-apex/GlowButton";
import { ApexSlider } from "@/components/ui-apex/ApexSlider";
import { ApexSelect } from "@/components/ui-apex/ApexSelect";
import { ApexToggle } from "@/components/ui-apex/ApexToggle";
import { ApexCheckbox } from "@/components/ui-apex/ApexCheckbox";

interface Props {
  onRun: () => void;
  loading: boolean;
}

export function RaceControlPanel({ onRun, loading }: Props) {
  const [circuit, setCircuit] = useState("Monaco");
  const [compound, setCompound] = useState<CompoundId>("MEDIUM");
  const [tyreAge, setTyreAge] = useState(12);
  const [gapAhead, setGapAhead] = useState(4);
  const [gapBehind, setGapBehind] = useState(18);
  const [fuel, setFuel] = useState(64);
  const [scProb, setScProb] = useState(35);
  const [rainProb, setRainProb] = useState(15);
  const [trackTemp, setTrackTemp] = useState(38);
  const [ersEnabled, setErsEnabled] = useState(false);
  const [drsEnabled, setDrsEnabled] = useState(false);

  return (
    <aside className="apex-glass rounded-lg p-5 h-full overflow-y-auto relative">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-3.5 h-3.5 text-apex-red" />
        <h2 className="font-orbitron text-[11px] tracking-[0.3em] text-apex-red">RACE CONTROL</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="font-rajdhani text-xs uppercase text-green-telemetry mb-2 block">Circuit</label>
          <select
            value={circuit}
            onChange={(e) => setCircuit(e.target.value)}
            className="w-full bg-bg-base border border-border-subtle rounded-sm px-3 py-2.5 font-rajdhani font-bold text-white focus:border-cyan-electric focus:outline-none focus:shadow-[0_0_8px_rgba(0,217,255,0.2)] transition-all"
          >
            {CIRCUITS.map((c) => (
              <option key={c.name} value={c.name} className="bg-black">{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        <ApexSelect
          label="Compound"
          options={COMPOUNDS.map((c) => ({ value: c.id, label: c.label, color: c.color }))}
          value={compound}
          onChange={(v) => setCompound(v as CompoundId)}
        />

        <ApexSlider label="Tyre Age" value={tyreAge} onChange={setTyreAge} min={0} max={50} suffix=" laps" accentColor="#DC143C" />
        <ApexSlider label="Gap Ahead" value={gapAhead} onChange={setGapAhead} min={0} max={30} suffix="s" accentColor="#DC143C" />
        <ApexSlider label="Gap Behind" value={gapBehind} onChange={setGapBehind} min={0} max={30} suffix="s" accentColor="#DC143C" />
        <ApexSlider label="Fuel Load" value={fuel} onChange={setFuel} min={0} max={110} suffix="kg" accentColor="#DC143C" />

        <div className="border-t border-border-subtle pt-5 space-y-5">
          <ApexSlider label="Safety Car Probability" value={scProb} onChange={setScProb} min={0} max={100} suffix="%" accentColor="#DC143C" />
          <ApexSlider label="Rain Probability" value={rainProb} onChange={setRainProb} min={0} max={100} suffix="%" accentColor="#DC143C" />
          <ApexSlider label="Track Temperature" value={trackTemp} onChange={setTrackTemp} min={20} max={60} suffix="°C" accentColor="#DC143C" />
        </div>

        <div className="border-t border-border-subtle pt-5 space-y-4">
          <ApexToggle label="ERS Strategy" enabled={ersEnabled} onChange={setErsEnabled} />
          <ApexCheckbox label="Enable DRS" checked={drsEnabled} onChange={setDrsEnabled} />
        </div>

        <motion.div whileTap={{ scale: 0.98 }}>
          <GlowButton
            pulse={!loading}
            disabled={loading}
            onClick={onRun}
            className="w-full !py-4 !text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Telemetry...
              </>
            ) : (
              "Run Race Strategy"
            )}
          </GlowButton>
        </motion.div>
      </div>
    </aside>
  );
}
