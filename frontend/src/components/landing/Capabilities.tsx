import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  Gauge,
  Timer,
  Brain,
  CloudLightning,
  Radar,
  Cpu,
  Flag,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  metric: string;
  metricLabel: string;
  tag: string;
};

const FEATURES: Feature[] = [
  {
    icon: Gauge,
    title: "Tyre Degradation ML",
    desc: "Neural compound modelling fuses thermal load, slip ratio, and stint history to project wear curves across all 5 Pirelli compounds.",
    metric: "94.2%",
    metricLabel: "Prediction accuracy",
    tag: "Module 01 · TYRE",
  },
  {
    icon: Activity,
    title: "Undercut Intelligence",
    desc: "Live pit-window arbitrage with rival gap modelling, traffic projection, and counter-strategy interception in under one lap.",
    metric: "1.8s",
    metricLabel: "Avg gain per cycle",
    tag: "Module 02 · STRATEGY",
  },
  {
    icon: Timer,
    title: "Race Simulation Engine",
    desc: "Sub-200ms Monte Carlo projections across 20+ circuits, branched for safety car, VSC, weather and red-flag scenarios.",
    metric: "10⁴",
    metricLabel: "Sims per decision",
    tag: "Module 03 · SIM",
  },
  {
    icon: Brain,
    title: "AI Race Engineer",
    desc: "GPT-class reasoning agent that explains every call in plain English — driver-friendly radio output, engineer-grade telemetry context.",
    metric: "<400ms",
    metricLabel: "Response latency",
    tag: "Module 04 · COPILOT",
  },
  {
    icon: CloudLightning,
    title: "Weather & Track Evolution",
    desc: "Hyper-local radar nowcasting fused with grip evolution and track temperature drift across the full race window.",
    metric: "5 min",
    metricLabel: "Forecast resolution",
    tag: "Module 05 · ENVIRONMENT",
  },
  {
    icon: Radar,
    title: "Rival Pattern Recognition",
    desc: "Per-driver behavioural fingerprints — pit cadence, tyre management, defensive tendencies — surfaced live during the race.",
    metric: "20",
    metricLabel: "Drivers tracked",
    tag: "Module 06 · INTEL",
  },
];

const STATS: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Cpu, value: "12.4M", label: "Telemetry frames / race" },
  { icon: TrendingUp, value: "0.18s", label: "Strategy compute time" },
  { icon: Flag, value: "23", label: "Calibrated circuits" },
  { icon: Activity, value: "99.97%", label: "Pipeline uptime" },
];

const AUTOPLAY_MS = 8000;
const RESUME_DELAY_MS = 6000;

function FeatureStackCarousel() {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);
  const dragStart = useRef<number | null>(null);

  const total = FEATURES.length;

  const go = useCallback(
    (delta: number) => {
      setDirection(delta > 0 ? 1 : -1);
      setIndex((i) => (i + delta + total) % total);
      startRef.current = performance.now();
      setProgress(0);
    },
    [total],
  );

  const pauseTemporarily = useCallback(() => {
    setIsPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      setIsPaused(false);
      startRef.current = performance.now();
      setProgress(0);
    }, RESUME_DELAY_MS);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setDirection(i > index ? 1 : -1);
      setIndex(i);
      startRef.current = performance.now();
      setProgress(0);
    },
    [index],
  );

  // Autoplay + progress driver
  useEffect(() => {
    if (prefersReducedMotion) return;
    let mounted = true;
    startRef.current = performance.now();
    const tick = (now: number) => {
      if (!mounted) return;
      if (!isPaused) {
        const elapsed = now - startRef.current;
        const p = Math.min(elapsed / AUTOPLAY_MS, 1);
        setProgress(p);
        if (elapsed >= AUTOPLAY_MS) {
          setDirection(1);
          setIndex((i) => (i + 1) % total);
          startRef.current = now;
          setProgress(0);
        }
      } else {
        startRef.current = now - progress * AUTOPLAY_MS;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, total, prefersReducedMotion]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        go(1);
        pauseTemporarily();
      } else if (e.key === "ArrowLeft") {
        go(-1);
        pauseTemporarily();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, pauseTemporarily]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  const prevIdx = (index - 1 + total) % total;
  const nextIdx = (index + 1) % total;
  const current = FEATURES[index];
  const Icon = current.icon;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 160 : -160,
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -160 : 160,
      opacity: 0,
      scale: 0.97,
    }),
  };

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Capability modules"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        startRef.current = performance.now();
        setProgress(0);
      }}
    >
      {/* Side peek cards */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden lg:flex items-center w-[18%] justify-start">
        <PeekCard feature={FEATURES[prevIdx]} side="left" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden lg:flex items-center w-[18%] justify-end">
        <PeekCard feature={FEATURES[nextIdx]} side="right" />
      </div>

      {/* Stage */}
      <div
        className="relative mx-auto max-w-2xl h-[440px] md:h-[420px] overflow-hidden"
        onPointerDown={(e) => {
          dragStart.current = e.clientX;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (dragStart.current == null) return;
          const dx = e.clientX - dragStart.current;
          dragStart.current = null;
          if (Math.abs(dx) > 60) {
            go(dx < 0 ? 1 : -1);
            pauseTemporarily();
          }
        }}
        onPointerCancel={() => (dragStart.current = null)}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] rounded-full bg-apex-red/15 blur-[80px]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[240px] rounded-full bg-apex-cyan/10 blur-[70px]" />
        </div>

        <AnimatePresence custom={direction} mode="popLayout" initial={false}>
          <motion.article
            key={index}
            custom={direction}
            variants={variants}
            initial={prefersReducedMotion ? "center" : "enter"}
            animate="center"
            exit={prefersReducedMotion ? "center" : "exit"}
            transition={{
              x: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
            }}
            className="absolute inset-0 mx-auto will-change-transform transform-gpu"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="relative h-full w-full rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]">
              {/* Static parallax glow layers (no backdrop-blur on moving layer for 60fps) */}
              <div className="pointer-events-none absolute -top-24 -right-24 w-[320px] h-[320px] rounded-full bg-apex-red/20 blur-[70px]" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 w-[280px] h-[280px] rounded-full bg-apex-cyan/12 blur-[70px]" />

              {/* Hairlines */}
              <div className="pointer-events-none absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-apex-red/40 to-transparent" />
              <div className="pointer-events-none absolute inset-0 apex-grid-bg opacity-[0.025]" />

              {/* Content with staggered parallax */}
              <div className="relative h-full p-8 md:p-10 flex flex-col">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between mb-7"
                >
                  <div className="relative w-12 h-12 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/10">
                    <div className="absolute inset-0 rounded-lg bg-apex-cyan/10 blur-md" />
                    <Icon className="relative w-6 h-6 text-apex-cyan" strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
                    {current.tag}
                  </span>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="font-orbitron font-semibold text-2xl md:text-[28px] tracking-[0.04em] text-white mb-4 leading-[1.15]"
                >
                  {current.title}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  className="font-inter text-[14px] md:text-[15px] text-white/55 leading-[1.7] flex-1 max-w-xl"
                >
                  {current.desc}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-7 pt-5 border-t border-white/[0.06] flex items-end justify-between"
                >
                  <div>
                    <div className="font-orbitron font-medium text-[40px] md:text-[44px] text-white leading-none tabular-nums">
                      {current.metric}
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.28em] text-white/40 uppercase mt-2.5">
                      {current.metricLabel}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 h-7 rounded-full border border-apex-cyan/25 bg-apex-cyan/[0.04]">
                    <span className="w-1.5 h-1.5 rounded-full bg-apex-cyan pulse-dot" />
                    <span className="font-space-grotesk text-[10px] tracking-[0.25em] text-apex-cyan/80 uppercase">
                      Live
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <button
        type="button"
        aria-label="Previous module"
        onClick={() => {
          go(-1);
          pauseTemporarily();
        }}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full apex-glass border border-white/10 flex items-center justify-center text-white/70 hover:text-apex-cyan hover:border-apex-cyan/40 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        aria-label="Next module"
        onClick={() => {
          go(1);
          pauseTemporarily();
        }}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full apex-glass border border-white/10 flex items-center justify-center text-white/70 hover:text-apex-cyan hover:border-apex-cyan/40 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress bar */}
      <div className="mx-auto max-w-2xl mt-6 h-[2px] bg-white/5 overflow-hidden rounded-full">
        <div
          className="h-full bg-gradient-to-r from-apex-cyan to-apex-red"
          style={{
            width: `${progress * 100}%`,
            transition: isPaused ? "none" : "width 80ms linear",
          }}
        />
      </div>

      {/* Dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {FEATURES.map((f, i) => {
          const active = i === index;
          return (
            <button
              key={f.title}
              type="button"
              aria-label={`Go to ${f.title}`}
              aria-current={active}
              onClick={() => {
                goTo(i);
                pauseTemporarily();
              }}
              className={`h-1.5 rounded-full transition-all ${
                active
                  ? "w-8 bg-apex-red shadow-[0_0_12px_rgba(255,30,30,0.6)]"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function PeekCard({ feature, side }: { feature: Feature; side: "left" | "right" }) {
  const Icon = feature.icon;
  return (
    <div
      className={`relative rounded-2xl p-5 w-[85%] h-[58%] opacity-25 ${
        side === "left" ? "translate-x-[-30%] -rotate-[2deg]" : "translate-x-[30%] rotate-[2deg]"
      } flex flex-col justify-between border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-white/[0.005] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]`}
    >
      <div className="pointer-events-none absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/10">
          <Icon className="w-4 h-4 text-apex-cyan/70" strokeWidth={1.5} />
        </div>
        <span className="font-mono text-[8px] tracking-[0.25em] text-white/30 uppercase">
          {feature.tag}
        </span>
      </div>
      <div className="font-orbitron text-[13px] tracking-[0.04em] text-white/60">
        {feature.title}
      </div>
    </div>
  );
}

export function Capabilities() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0 apex-grid-bg opacity-[0.03]" />
      <div className="absolute top-1/3 -left-40 w-[480px] h-[480px] rounded-full bg-apex-red/10 blur-[140px]" />
      <div className="absolute bottom-0 -right-40 w-[520px] h-[520px] rounded-full bg-apex-cyan/10 blur-[160px]" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-apex-red/30 bg-apex-red/5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-apex-red pulse-dot" />
            <span className="font-space-grotesk text-[10px] tracking-[0.4em] text-apex-red uppercase">
              System Capabilities
            </span>
          </div>
          <h2 className="font-orbitron font-bold text-4xl md:text-6xl text-white tracking-wider leading-[1.05]">
            Engineered for the{" "}
            <span className="text-apex-red apex-text-glow">apex</span>
          </h2>
          <p className="mt-6 font-inter text-base md:text-lg text-white/55 max-w-2xl mx-auto leading-relaxed">
            Six tightly-coupled intelligence modules running in parallel — fed
            by raw telemetry, tuned by race engineers, and surfaced as decisions
            you can act on inside a single pit window.
          </p>
        </motion.div>

        <FeatureStackCarousel />

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 apex-glass rounded-xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-apex-cyan/60 to-transparent" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-md flex items-center justify-center bg-apex-red/10 border border-apex-red/30 shrink-0">
                  <Icon className="w-5 h-5 text-apex-red" />
                </div>
                <div>
                  <div className="font-orbitron font-bold text-2xl text-white tracking-wider leading-none">
                    {value}
                  </div>
                  <div className="font-space-grotesk text-[10px] tracking-[0.25em] text-white/45 uppercase mt-1.5">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
