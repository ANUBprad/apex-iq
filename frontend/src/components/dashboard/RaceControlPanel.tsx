import { useState } from "react";
import { motion } from "framer-motion";
import { Loader as Loader2, Zap } from "lucide-react";
import { CIRCUITS, COMPOUNDS, WEATHER_OPTIONS, type CompoundId, type WeatherOption } from "@/lib/apex-data";
import { GlowButton } from "@/components/ui-apex/GlowButton";
import type { StrategyInput } from "@/lib/api";

interface Props {
  onRun: (input: StrategyInput) => void;
  loading: boolean;
}

function Slider({ label, value, setValue, min, max, suffix, step = 1 }: { label: string; value: number; setValue: (n: number) => void; min: number; max: number; suffix?: string; step?: number; }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px]">{label}</label>
        <span className="font-mono text-[12px] font-semibold text-[#1A1D29] tabular-nums">{value}<span className="text-[#9CA3AF] ml-0.5">{suffix}</span></span>
      </div>
      <div className="relative h-1.5 rounded-full bg-[#F1F3F7] overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-[#0EA5E9] rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setValue(+e.target.value)} className="w-full -mt-1 opacity-0 cursor-pointer h-3" />
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
  const [airTemp, setAirTemp] = useState(25);
  const [lapsRemaining, setLapsRemaining] = useState(30);
  const [weather, setWeather] = useState<WeatherOption>("Dry");

  const handleRun = () => {
    onRun({
      compound,
      tyre_age: tyreAge,
      circuit,
      gap_ahead: gapAhead,
      gap_behind: gapBehind,
      fuel_load: fuel,
      track_temp: trackTemp,
      air_temp: airTemp,
      laps_remaining: lapsRemaining,
      weather,
      safety_car_prob: scProb,
      rain_prob: rainProb,
    });
  };

  return (
    <aside className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg p-5 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-4 h-4 text-[#0EA5E9]" strokeWidth={1.8} />
        <h2 className="text-[14px] font-semibold text-[#1A1D29] uppercase tracking-[0.5px]">Race Control</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] block mb-1">Circuit</label>
          <select
            value={circuit}
            onChange={(e) => setCircuit(e.target.value)}
            className="w-full bg-white border border-[#D1D5DB] rounded-md px-3 py-2 text-[14px] font-medium text-[#1A1D29] focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[rgba(14,165,233,0.1)] transition-all"
          >
            {CIRCUITS.map((c) => (
              <option key={c.name} value={c.name} className="bg-white">{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] block mb-1.5">Compound</label>
          <div className="flex gap-1">
            {COMPOUNDS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCompound(c.id)}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold tracking-wider transition-all border ${
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
        </div>

        <Slider label="Tyre Age" value={tyreAge} setValue={setTyreAge} min={0} max={50} suffix=" laps" />
        <Slider label="Gap Ahead" value={gapAhead} setValue={setGapAhead} min={0} max={30} suffix="s" />
        <Slider label="Gap Behind" value={gapBehind} setValue={setGapBehind} min={0} max={30} suffix="s" />
        <Slider label="Fuel Load" value={fuel} setValue={setFuel} min={0} max={110} suffix="kg" />
        <Slider label="Laps Remaining" value={lapsRemaining} setValue={setLapsRemaining} min={1} max={78} suffix=" laps" />

        <div className="border-t border-[#E5E7EB] pt-4 space-y-4">
          <div className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-[0.5px]">Environment</div>

          <div>
            <label className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.5px] block mb-1">Weather</label>
            <div className="flex gap-1">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w}
                  onClick={() => setWeather(w)}
                  className={`flex-1 py-1.5 rounded-md text-[9px] font-semibold tracking-wider transition-all border ${
                    weather === w
                      ? "bg-[rgba(14,165,233,0.08)] text-[#0EA5E9] border-[rgba(14,165,233,0.2)]"
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F8F9FB]"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <Slider label="Track Temp" value={trackTemp} setValue={setTrackTemp} min={20} max={60} suffix="C" />
          <Slider label="Air Temp" value={airTemp} setValue={setAirTemp} min={10} max={45} suffix="C" />
          <Slider label="Safety Car Prob" value={scProb} setValue={setScProb} min={0} max={100} suffix="%" />
          <Slider label="Rain Probability" value={rainProb} setValue={setRainProb} min={0} max={100} suffix="%" />
        </div>

        <motion.div whileTap={{ scale: 0.98 }}>
          <GlowButton
            pulse={!loading}
            disabled={loading}
            onClick={handleRun}
            className="w-full !py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
            ) : (
              "Run Strategy"
            )}
          </GlowButton>
        </motion.div>
      </div>
    </aside>
  );
}
