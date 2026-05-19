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

// Tyre status data generators
export interface TyreStatusData {
  position: string;
  compound: "soft" | "medium" | "hard";
  temperature: number;
  wear: number;
  frontTemp: number;
  centerTemp: number;
  rearTemp: number;
}

export const TYRE_STATUS: TyreStatusData[] = [
  { position: "FL", compound: "medium", temperature: 87, wear: 65, frontTemp: 85, centerTemp: 87, rearTemp: 89 },
  { position: "FR", compound: "medium", temperature: 89, wear: 63, frontTemp: 88, centerTemp: 89, rearTemp: 90 },
  { position: "RL", compound: "medium", temperature: 92, wear: 68, frontTemp: 91, centerTemp: 92, rearTemp: 93 },
  { position: "RR", compound: "medium", temperature: 94, wear: 70, frontTemp: 93, centerTemp: 94, rearTemp: 95 },
];

export function genTyreStatus(seed = Math.random()): TyreStatusData[] {
  const baseTemp = 80 + seed * 15;
  const baseWear = 40 + seed * 35;
  return [
    { position: "FL", compound: "medium", temperature: Math.round(baseTemp + 1), wear: Math.round(baseWear + 2), frontTemp: Math.round(baseTemp - 1), centerTemp: Math.round(baseTemp + 1), rearTemp: Math.round(baseTemp + 3) },
    { position: "FR", compound: "medium", temperature: Math.round(baseTemp + 3), wear: Math.round(baseWear), frontTemp: Math.round(baseTemp + 2), centerTemp: Math.round(baseTemp + 3), rearTemp: Math.round(baseTemp + 4) },
    { position: "RL", compound: "medium", temperature: Math.round(baseTemp + 6), wear: Math.round(baseWear + 5), frontTemp: Math.round(baseTemp + 5), centerTemp: Math.round(baseTemp + 6), rearTemp: Math.round(baseTemp + 7) },
    { position: "RR", compound: "medium", temperature: Math.round(baseTemp + 8), wear: Math.round(baseWear + 7), frontTemp: Math.round(baseTemp + 7), centerTemp: Math.round(baseTemp + 8), rearTemp: Math.round(baseTemp + 9) },
  ];
}

// Live telemetry stream data generator
export interface TelemetryDataPoint {
  time: number;
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
}

export function genTelemetryStream(points = 120): TelemetryDataPoint[] {
  return Array.from({ length: points }, (_, i) => {
    const t = i;
    // Simulate a lap-like pattern
    const phase = (t % 30) / 30; // 0-1 within a 30s segment
    const speedBase = 200 + Math.sin(phase * Math.PI * 2) * 80;
    const throttleBase = phase < 0.7 ? 80 + Math.random() * 20 : Math.random() * 30;
    const brakeBase = phase > 0.7 && phase < 0.85 ? 60 + Math.random() * 40 : Math.random() * 5;
    const gearBase = Math.max(1, Math.min(8, Math.round(3 + Math.sin(phase * Math.PI) * 4)));

    return {
      time: t,
      speed: Math.round(speedBase + (Math.random() - 0.5) * 10),
      throttle: Math.round(Math.max(0, Math.min(100, throttleBase))),
      brake: Math.round(Math.max(0, Math.min(100, brakeBase))),
      gear: gearBase,
    };
  });
}
