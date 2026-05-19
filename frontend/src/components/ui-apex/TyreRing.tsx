import { motion } from "framer-motion";

type CompoundType = "soft" | "medium" | "hard";

interface TyreRingProps {
  position: string;
  compound: CompoundType;
  temperature: number;
  wear: number; // 0-100
  frontTemp: number;
  centerTemp: number;
  rearTemp: number;
}

const compoundMap: Record<CompoundType, { color: string; label: string }> = {
  soft: { color: "#DC143C", label: "SOFT" },
  medium: { color: "#F59E0B", label: "MEDIUM" },
  hard: { color: "#F5F5F5", label: "HARD" },
};

function getTempColor(temp: number): string {
  if (temp < 70) return "#06B6D4"; // Cold (blue)
  if (temp < 85) return "#10B981"; // Optimal (green)
  if (temp < 100) return "#F59E0B"; // Warm (yellow)
  return "#DC143C"; // Hot (red)
}

export function TyreRing({
  position,
  compound,
  temperature,
  wear,
  frontTemp,
  centerTemp,
  rearTemp,
}: TyreRingProps) {
  const compoundColor = compoundMap[compound].color;
  const tempColor = getTempColor(temperature);
  const wearPercent = wear;

  // Circumference for r=40 circle: 2 * PI * 40 = 251.33
  const wearCircumference = 2 * Math.PI * 40;
  const wearDash = wearPercent / 100 * wearCircumference;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* SVG Ring Visualization */}
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className="mb-3"
      >
        {/* Compound ring (outer) */}
        <circle
          cx="70"
          cy="70"
          r="60"
          fill="none"
          stroke={compoundColor}
          strokeWidth="10"
          opacity="0.3"
        />

        {/* Temperature ring (middle) */}
        <circle
          cx="70"
          cy="70"
          r="50"
          fill="none"
          stroke={tempColor}
          strokeWidth="8"
          opacity="0.8"
        />

        {/* Wear ring (inner, dashed) */}
        <circle
          cx="70"
          cy="70"
          r="40"
          fill="none"
          stroke={tempColor}
          strokeWidth="3"
          strokeDasharray={`${wearDash} ${wearCircumference}`}
          opacity="0.5"
          transform="rotate(-90 70 70)"
        />

        {/* Center temperature display */}
        <text
          x="70"
          y="80"
          textAnchor="middle"
          fill="white"
          className="font-orbitron"
          style={{ fontSize: "28px", fontWeight: 700 }}
        >
          {temperature}°
        </text>

        {/* Compound label */}
        <text
          x="70"
          y="108"
          textAnchor="middle"
          fill="#696969"
          className="font-rajdhani"
          style={{ fontSize: "11px", fontWeight: 600 }}
        >
          {compoundMap[compound].label}
        </text>
      </svg>

      {/* Position Label */}
      <div className="font-rajdhani text-sm font-bold mb-2 text-white">
        {position}
      </div>

      {/* Temperature Readings */}
      <div className="text-xs font-orbitron text-text-secondary space-y-0.5 text-center mb-2">
        <div>
          F: <span className="text-white">{frontTemp}°</span>
        </div>
        <div>
          C: <span className="text-white">{centerTemp}°</span>
        </div>
        <div>
          R: <span className="text-white">{rearTemp}°</span>
        </div>
      </div>

      {/* Wear Percentage */}
      <div className="text-xs font-rajdhani text-green-telemetry">
        {100 - wearPercent}% LIFE
      </div>

      {/* Status Indicator */}
      {temperature > 95 && (
        <motion.div
          className="mt-2 text-red-ferrari text-xs font-rajdhani"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ⚠ OVERTEMP
        </motion.div>
      )}
    </motion.div>
  );
}
