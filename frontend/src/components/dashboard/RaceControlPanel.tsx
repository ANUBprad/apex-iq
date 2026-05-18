import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap } from "lucide-react";
import { CIRCUITS, COMPOUNDS, type CompoundId } from "@/lib/apex-data";
import { GlowButton } from "@/components/ui-apex/GlowButton";

interface Props {
  onRun: () => void;
  loading: boolean;
}

function Slider({ label, value, setValue, min, max, suffix, step = 1 }: { label: string; value: number; setValue: (n: number) => void; min: number; max: number; suffix?: string; step?: number; }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="font-space-grotesk text-[10px] tracking-[0.2em] text-white/50 uppercase">{label}</label>
        <span className="font-rajdhani font-bold text-apex-red text-sm">{value}{suffix}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-apex-red-dim to-apex-red shadow-[0_0_10px_rgba(255,30,30,0.6)]" style={{ width: `${pct}%` }} />
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setValue(+e.target.value)} className="w-full -mt-1.5 opacity-0 cursor-pointer h-3" />
    </div>
  );
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

  return (
    <aside className="apex-glass rounded-lg p-5 h-full overflow-y-auto relative">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-3.5 h-3.5 text-apex-red" />
        <h2 className="font-orbitron text-[11px] tracking-[0.3em] text-apex-red">RACE CONTROL</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="font-space-grotesk text-[10px] tracking-[0.2em] text-white/50 uppercase block mb-1.5">Circuit</label>
          <select
            value={circuit}
            onChange={(e) => setCircuit(e.target.value)}
            className="w-full bg-black/60 border border-apex-red/20 rounded-md px-3 py-2.5 font-rajdhani font-bold text-white focus:border-apex-red focus:outline-none focus:shadow-[0_0_15px_rgba(255,30,30,0.3)] transition-all"
          >
            {CIRCUITS.map((c) => (
              <option key={c.name} value={c.name} className="bg-black">{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-space-grotesk text-[10px] tracking-[0.2em] text-white/50 uppercase block mb-2">Compound</label>
          <div className="flex gap-1.5">
            {COMPOUNDS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCompound(c.id)}
                className={`flex-1 py-2 rounded-md font-rajdhani font-bold text-[11px] tracking-wider transition-all ${
                  compound === c.id
                    ? "text-black shadow-[0_0_15px_rgba(255,30,30,0.4)]"
                    : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                }`}
                style={compound === c.id ? { background: c.color } : {}}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <Slider label="Tyre Age" value={tyreAge} setValue={setTyreAge} min={0} max={50} suffix=" laps" />
        <Slider label="Gap Ahead" value={gapAhead} setValue={setGapAhead} min={0} max={30} suffix="s" />
        <Slider label="Gap Behind" value={gapBehind} setValue={setGapBehind} min={0} max={30} suffix="s" />
        <Slider label="Fuel Load" value={fuel} setValue={setFuel} min={0} max={110} suffix="kg" />

        <div className="border-t border-white/5 pt-5 space-y-5">
          <Slider label="Safety Car Probability" value={scProb} setValue={setScProb} min={0} max={100} suffix="%" />
          <Slider label="Rain Probability" value={rainProb} setValue={setRainProb} min={0} max={100} suffix="%" />
          <Slider label="Track Temperature" value={trackTemp} setValue={setTrackTemp} min={20} max={60} suffix="°C" />
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
