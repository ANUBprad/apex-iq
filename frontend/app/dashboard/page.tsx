"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStrategy, simulate } from "@/lib/api";

import TelemetryChart from "@/components/TelemetryChart";
import AIInsights from "@/components/AIInsights";

export default function Dashboard() {

  const circuits = [
    "Bahrain",
    "Saudi Arabia",
    "Australia",
    "Japan",
    "China",
    "Miami",
    "Imola",
    "Monaco",
    "Canada",
    "Spain",
    "Austria",
    "Silverstone",
    "Hungary",
    "Belgium",
    "Netherlands",
    "Monza",
    "Singapore",
    "Austin",
    "Mexico",
    "Brazil",
    "Las Vegas",
    "Qatar",
    "Abu Dhabi",
  ];

  const [compound, setCompound] = useState("MEDIUM");
  const [tyreAge, setTyreAge] = useState(10);
  const [gapAhead, setGapAhead] = useState(5);
  const [gapBehind, setGapBehind] = useState(20);
  const [circuit, setCircuit] = useState("Monaco");

  const [result, setResult] = useState<any>(null);
  const [simData, setSimData] = useState<any>(null);

  const payload = {
    compound,
    tyre_age: tyreAge,
    circuit,
    gap_ahead: gapAhead,
    gap_behind: gapBehind,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const strategy = await getStrategy(payload);
        const simulation = await simulate(payload);

        setResult(strategy);
        setSimData(simulation);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

  }, [compound, tyreAge, gapAhead, gapBehind, circuit]);

  return (
    <main className="min-h-screen bg-[#050505] text-white flex">

      {/* LEFT PANEL */}
      <div className="w-[22%] border-r panel-border p-6">

        <div className="mb-10">
          <p className="text-xs tracking-[0.4em] text-red-500 uppercase">
            Race Inputs
          </p>

          <h1 className="text-3xl font-black mt-3 leading-tight">
            Strategy Control
          </h1>
        </div>

        <div className="space-y-7 text-sm">

          <div>
            <label className="text-zinc-500 uppercase text-xs tracking-[0.2em]">
              Circuit
            </label>

            <select
              className="w-full bg-zinc-900 border border-zinc-800 p-3 mt-2 rounded-xl"
              value={circuit}
              onChange={(e) => setCircuit(e.target.value)}
            >
              {circuits.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-500 uppercase text-xs tracking-[0.2em]">
              Tyre Compound
            </label>

            <select
              className="w-full bg-zinc-900 border border-zinc-800 p-3 mt-2 rounded-xl"
              value={compound}
              onChange={(e) => setCompound(e.target.value)}
            >
              <option>SOFT</option>
              <option>MEDIUM</option>
              <option>HARD</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
              <span>Tyre Age</span>
              <span>{tyreAge}</span>
            </div>

            <input
              type="range"
              min="1"
              max="30"
              value={tyreAge}
              onChange={(e) => setTyreAge(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
              <span>Gap Ahead</span>
              <span>{gapAhead}s</span>
            </div>

            <input
              type="range"
              min="0"
              max="20"
              value={gapAhead}
              onChange={(e) => setGapAhead(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
              <span>Gap Behind</span>
              <span>{gapBehind}s</span>
            </div>

            <input
              type="range"
              min="0"
              max="30"
              value={gapBehind}
              onChange={(e) => setGapBehind(Number(e.target.value))}
              className="w-full"
            />
          </div>

        </div>
      </div>

      {/* CENTER PANEL */}
      <div className="w-[56%] p-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="telemetry-card gradient-border p-6 red-glow mb-6"
        >

          <div className="flex items-center justify-between mb-6">

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Current Decision
              </p>

              <h1 className="text-5xl font-black mt-3 text-red-500">
                {result?.action || "LOADING"}
              </h1>
            </div>

            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-[0.2em]">
                Confidence
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {result ? `${Math.round(result.confidence * 100)}%` : "--"}
              </h2>
            </div>

          </div>

          <p className="text-zinc-400 leading-7 text-sm">
            {result?.reasoning}
          </p>

        </motion.div>

        <TelemetryChart />

        {simData && (
          <div className="grid grid-cols-3 gap-4 mt-6">

            <div className="telemetry-card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Stay Out
              </p>

              <h2 className="text-3xl font-bold">
                {simData.stay_out_loss}s
              </h2>
            </div>

            <div className="telemetry-card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Pit Loss
              </p>

              <h2 className="text-3xl font-bold text-red-500">
                {simData.pit_loss}s
              </h2>
            </div>

            <div className="telemetry-card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Undercut
              </p>

              <h2 className="text-3xl font-bold text-green-400">
                {simData.undercut_possible ? "YES" : "NO"}
              </h2>
            </div>

          </div>
        )}

      </div>

      {/* RIGHT PANEL */}
      <div className="w-[22%] border-l panel-border p-6">
        <AIInsights />
      </div>

    </main>
  );
}