export const CIRCUITS = [
  { name: "Monaco", flag: "🇲🇨", pitLoss: 22.4, deg: "Low" },
  { name: "Silverstone", flag: "🇬🇧", pitLoss: 19.8, deg: "High" },
  { name: "Monza", flag: "🇮🇹", pitLoss: 21.1, deg: "Medium" },
  { name: "Bahrain", flag: "🇧🇭", pitLoss: 22.9, deg: "High" },
  { name: "Singapore", flag: "🇸🇬", pitLoss: 27.3, deg: "Medium" },
  { name: "Spa", flag: "🇧🇪", pitLoss: 20.6, deg: "Medium" },
  { name: "Suzuka", flag: "🇯🇵", pitLoss: 21.4, deg: "High" },
  { name: "Interlagos", flag: "🇧🇷", pitLoss: 19.2, deg: "Medium" },
  { name: "Abu Dhabi", flag: "🇦🇪", pitLoss: 21.8, deg: "Low" },
  { name: "Miami", flag: "🇺🇸", pitLoss: 20.9, deg: "Medium" },
  { name: "Las Vegas", flag: "🇺🇸", pitLoss: 22.1, deg: "Low" },
  { name: "Qatar", flag: "🇶🇦", pitLoss: 23.0, deg: "High" },
  { name: "Imola", flag: "🇮🇹", pitLoss: 26.8, deg: "Medium" },
];

export const COMPOUNDS = [
  { id: "SOFT", color: "oklch(0.65 0.25 25)", label: "SOFT" },
  { id: "MEDIUM", color: "oklch(0.85 0.18 90)", label: "MED" },
  { id: "HARD", color: "oklch(0.95 0.01 0)", label: "HARD" },
  { id: "INTER", color: "oklch(0.78 0.2 145)", label: "INTER" },
  { id: "WET", color: "oklch(0.65 0.2 240)", label: "WET" },
] as const;

export type CompoundId = (typeof COMPOUNDS)[number]["id"];

// Fallback synthetic telemetry generators
export function genDegCurve(seed = Math.random()) {
  return Array.from({ length: 30 }, (_, i) => ({
    lap: i + 1,
    soft: Math.max(20, 100 - i * (3 + seed * 0.5) - Math.random() * 4),
    medium: Math.max(30, 100 - i * (1.8 + seed * 0.3) - Math.random() * 3),
    hard: Math.max(45, 100 - i * (1.1 + seed * 0.2) - Math.random() * 2),
  }));
}
export function genPaceDelta() {
  return Array.from({ length: 30 }, (_, i) => ({
    lap: i + 1,
    delta: +(Math.sin(i / 4) * 0.6 + (Math.random() - 0.5) * 0.4).toFixed(3),
  }));
}
export function genPitWindow() {
  return Array.from({ length: 30 }, (_, i) => ({
    lap: i + 1,
    prob: Math.max(0, Math.min(100, 30 + Math.sin((i - 15) / 3) * 60 + Math.random() * 8)),
  }));
}
export function genUndercut() {
  return Array.from({ length: 12 }, (_, i) => ({
    lap: i + 1,
    gain: +(Math.log(i + 2) * 1.6 - Math.random() * 0.4).toFixed(2),
  }));
}
export function genFuel() {
  return Array.from({ length: 50 }, (_, i) => ({
    lap: i + 1,
    fuel: Math.max(0, 110 - i * 2.1),
  }));
}
export function genSector() {
  return [
    { axis: "S1", current: 92 + Math.random() * 5, optimal: 99 },
    { axis: "S2", current: 88 + Math.random() * 6, optimal: 99 },
    { axis: "S3", current: 90 + Math.random() * 5, optimal: 99 },
  ];
}

export const STRATEGIES = [
  { action: "PIT NOW", confidence: 0.87, reasoning: "Tyre degradation has crossed the 23% performance cliff — undercut window opens this lap with a 4.2s gap to clear traffic." },
  { action: "STAY OUT", confidence: 0.74, reasoning: "Track evolution favours extending stint by 3 laps. Rivals lack the pace to undercut at current delta." },
  { action: "UNDERCUT", confidence: 0.81, reasoning: "Fresh medium compound projected to gain 1.8s over rivals across the next 5 laps. Execute now." },
  { action: "OVERCUT", confidence: 0.68, reasoning: "Cooler track temps and clean air ahead — extending the stint beats pitting into traffic by 2.4s." },
];
