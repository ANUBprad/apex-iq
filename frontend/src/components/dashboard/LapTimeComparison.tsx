import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Sector {
  name: string;
  current: number;
  best: number;
}

interface LapTimeComparisonProps {
  currentTime: number;
  bestTime: number;
  sectors: Sector[];
  currentLap: number;
  totalLaps: number;
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(3);
  return `${minutes}M${seconds}S`;
}

function formatDelta(ms: number): string {
  const seconds = (ms / 1000).toFixed(3);
  return seconds;
}

export function LapTimeComparison({
  currentTime,
  bestTime,
  sectors,
  currentLap,
  totalLaps,
}: LapTimeComparisonProps) {
  const totalDelta = currentTime - bestTime;
  const isGaining = totalDelta <= 0;

  return (
    <motion.div
      className="bg-bg-elevated border border-border-subtle rounded-sm p-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-lg">
        <div className="text-label-md text-cyan-electric mb-2">Current Lap vs Best</div>
        <div className="text-body-xs text-text-secondary">
          Lap {currentLap} of {totalLaps}
        </div>
      </div>

      {/* Main time comparison */}
      <div className="flex items-center gap-lg mb-2xl">
        {/* Current */}
        <div className="flex-1">
          <div className="text-body-xs text-text-secondary mb-xs">Current</div>
          <div className="text-metric-3xl text-text-primary">{formatTime(currentTime)}</div>
        </div>

        {/* Delta indicator */}
        <div className="flex flex-col items-center">
          {isGaining ? (
            <TrendingDown className="w-5 h-5 text-green-telemetry mb-xs" />
          ) : (
            <TrendingUp className="w-5 h-5 text-red-ferrari mb-xs" />
          )}
          <div
            className={`text-metric-lg font-700 ${isGaining ? "text-green-telemetry" : "text-red-ferrari"}`}
          >
            {isGaining ? "" : "+"}{formatDelta(totalDelta)}
          </div>
        </div>

        {/* Best */}
        <div className="flex-1 text-right">
          <div className="text-body-xs text-text-secondary mb-xs">Best</div>
          <div className="text-metric-2xl text-green-telemetry">{formatTime(bestTime)}</div>
        </div>
      </div>

      {/* Sector breakdown */}
      <div className="border-t border-border-subtle pt-lg">
        <div className="text-label-xs text-text-secondary mb-md">Sector Breakdown</div>

        <div className="space-y-md">
          {sectors.map((sector, i) => {
            const delta = sector.current - sector.best;
            const isPositive = delta > 0;
            const percentage = (sector.current / (sector.best * 1.05)) * 100;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                {/* Sector header */}
                <div className="flex justify-between items-baseline mb-xs">
                  <span className="text-label-xs text-text-secondary">{sector.name}</span>
                  <span
                    className={`text-metric-sm font-600 ${isPositive ? "text-red-ferrari" : "text-green-telemetry"}`}
                  >
                    {isPositive ? "+" : ""}{formatDelta(delta)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-bg-base rounded-xs overflow-hidden">
                  <motion.div
                    className={`h-full ${isPositive ? "bg-red-ferrari" : "bg-green-telemetry"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 + 0.1 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
