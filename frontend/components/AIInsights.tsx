export default function AIInsights() {
  return (
    <div className="telemetry-card p-5 h-full">

      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          AI Engineer
        </p>
      </div>

      <div className="space-y-5 text-sm">

        <div>
          <p className="text-zinc-500 text-xs mb-1">
            LIVE INSIGHT
          </p>

          <p className="leading-6 text-zinc-200">
            Tyre degradation increasing rapidly in Sector 3.
          </p>
        </div>

        <div>
          <p className="text-zinc-500 text-xs mb-1">
            PIT WINDOW
          </p>

          <p className="leading-6 text-zinc-200">
            Optimal undercut window opens within the next 2 laps.
          </p>
        </div>

        <div>
          <p className="text-zinc-500 text-xs mb-1">
            TRAFFIC MODEL
          </p>

          <p className="leading-6 text-zinc-200">
            Rejoining after pit stop likely behind medium-pace traffic.
          </p>
        </div>

      </div>
    </div>
  );
}