import { useState } from "react";
import { motion } from "framer-motion";
import { Loader as Loader2, Zap } from "lucide-react";
import {
  CIRCUITS,
  COMPOUNDS,
  WEATHER_OPTIONS,
  type CompoundId,
  type WeatherOption,
} from "@/lib/apex-data";
import { GlowButton } from "@/components/ui-apex/GlowButton";
import type { StrategyInput } from "@/lib/api";

interface RaceControlPanelProps {
  onRun: (input: StrategyInput) => void;
  loading: boolean;
}

function Slider({
  label,
  value,
  setValue,
  min,
  max,
  suffix,
  step = 1,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
  suffix?: string;
  step?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
          {label}
        </label>
        <span className="font-mono text-[12px] font-semibold tabular-nums text-[#F5F5F7]">
          {value}
          <span className="ml-0.5 text-[#6B7280]">{suffix}</span>
        </span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-[#1A1A24]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#00D2FF]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(+e.target.value)}
        className="-mt-1 h-3 w-full cursor-pointer opacity-0"
      />
    </div>
  );
}

export function RaceControlPanel({ onRun, loading }: RaceControlPanelProps) {
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
    <aside className="h-full overflow-y-auto rounded-xl border border-[#1E1E28] bg-[#111118] p-5">
      <div className="mb-5 flex items-center gap-2">
        <Zap className="h-4 w-4 text-[#00D2FF]" strokeWidth={1.8} />
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.08em] text-[#F5F5F7]">
          Race Control
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
            Circuit
          </label>
          <select
            value={circuit}
            onChange={(e) => setCircuit(e.target.value)}
            className="w-full rounded-md border border-[#1E1E28] bg-[#0A0A0F] px-3 py-2 text-[14px] font-medium text-[#F5F5F7] focus:border-[#00D2FF]/40 focus:outline-none focus:ring-2 focus:ring-[#00D2FF]/10"
          >
            {CIRCUITS.map((c) => (
              <option key={c.name} value={c.name} className="bg-[#0A0A0F]">
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
            Compound
          </label>
          <div className="flex gap-1">
            {COMPOUNDS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCompound(c.id)}
                className={`flex-1 rounded-md border py-1.5 text-[10px] font-semibold tracking-wider transition-all ${
                  compound === c.id
                    ? "border-transparent text-white shadow-sm"
                    : "border-[#1E1E28] bg-[#0A0A0F] text-[#6B7280] hover:bg-[#1A1A24]"
                }`}
                style={compound === c.id ? { background: c.color } : {}}
              >
                {c.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <Slider
          label="Tyre Age"
          value={tyreAge}
          setValue={setTyreAge}
          min={0}
          max={50}
          suffix=" laps"
        />
        <Slider
          label="Gap Ahead"
          value={gapAhead}
          setValue={setGapAhead}
          min={0}
          max={30}
          suffix="s"
        />
        <Slider
          label="Gap Behind"
          value={gapBehind}
          setValue={setGapBehind}
          min={0}
          max={30}
          suffix="s"
        />
        <Slider
          label="Fuel Load"
          value={fuel}
          setValue={setFuel}
          min={0}
          max={110}
          suffix="kg"
        />
        <Slider
          label="Laps Remaining"
          value={lapsRemaining}
          setValue={setLapsRemaining}
          min={1}
          max={78}
          suffix=" laps"
        />

        <div className="space-y-4 border-t border-[#1E1E28] pt-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
            Environment
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
              Weather
            </label>
            <div className="flex gap-1">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeather(w)}
                  className={`flex-1 rounded-md border py-1.5 text-[9px] font-semibold tracking-wider transition-all ${
                    weather === w
                      ? "border-[#00D2FF]/30 bg-[#00D2FF]/10 text-[#00D2FF]"
                      : "border-[#1E1E28] bg-[#0A0A0F] text-[#6B7280] hover:bg-[#1A1A24]"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Track Temp"
            value={trackTemp}
            setValue={setTrackTemp}
            min={20}
            max={60}
            suffix="°C"
          />
          <Slider
            label="Air Temp"
            value={airTemp}
            setValue={setAirTemp}
            min={10}
            max={45}
            suffix="°C"
          />
          <Slider
            label="Safety Car Prob"
            value={scProb}
            setValue={setScProb}
            min={0}
            max={100}
            suffix="%"
          />
          <Slider
            label="Rain Probability"
            value={rainProb}
            setValue={setRainProb}
            min={0}
            max={100}
            suffix="%"
          />
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-[#111118] via-[#111118]/90 to-transparent pt-4">
          <motion.div whileTap={{ scale: 0.98 }}>
            <GlowButton
              pulse={!loading}
              disabled={loading}
              onClick={handleRun}
              className="flex w-full items-center justify-center gap-2 !py-4 text-[14px] tracking-[0.12em]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" strokeWidth={2} />
                  Run Race Simulation
                </>
              )}
            </GlowButton>
          </motion.div>
        </div>
      </div>
    </aside>
  );
}
