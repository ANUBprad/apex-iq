import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GlowButton } from "@/components/ui-apex/GlowButton";
import { YAS_MARINA_CIRCUIT_PATH, CIRCUIT_VIEWBOX } from "@/lib/circuit-path";
import {
  HERO_RAY_PLACEMENTS,
  computeRaysFromPath,
  type ComputedRay,
} from "@/lib/ray-config";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const HERO_EASE = [0.16, 1, 0.3, 1] as const;

const STAGGER = {
  container: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: HERO_EASE } },
  },
};

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const [rays, setRays] = useState<ComputedRay[]>([]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    setRays(computeRaysFromPath(path, HERO_RAY_PLACEMENTS));
  }, []);

  return (
    <section
      role="region"
      aria-label="Hero banner"
      className="hero-section relative w-full min-h-[100svh] overflow-hidden flex items-center justify-center"
    >
      {/* Layer 1: Base black canvas */}
      <div className="hero-section-base absolute inset-0 z-[5]" aria-hidden />

      {/* Layer 2: Transparent black atmosphere */}
      <div
        className="hero-section-gradient absolute inset-0 z-[5]"
        aria-hidden
      />

      {/* Layer 3: Circuit path + radiating rays (z-index 10) */}
      <div
        className="circuit-background absolute inset-0 z-[10] pointer-events-none"
        aria-hidden
      >
        <motion.svg
          className="circuit-svg w-full h-full"
          viewBox={CIRCUIT_VIEWBOX}
          preserveAspectRatio="xMidYMid slice"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <defs>
            <filter
              id="heroCircuitGlow"
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id="heroRayGlow"
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern
              id="heroGrid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="var(--hero-circuit-grid)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <rect
            width="1200"
            height="800"
            fill="url(#heroGrid)"
            opacity="0.08"
          />

          {/* Glow halo */}
          <path
            d={YAS_MARINA_CIRCUIT_PATH}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.15"
          />

          {/* Main circuit boundary */}
          <motion.path
            ref={pathRef}
            d={YAS_MARINA_CIRCUIT_PATH}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#heroCircuitGlow)"
            className="circuit-path"
            initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Radiating ray pulses */}
          {rays.length > 0 && (
            <g className="rays">
              {rays.map((ray) => (
                <g
                  key={ray.id}
                  className={`hero-ray ${ray.id}`}
                  style={
                    {
                      "--ray-delay": `${ray.delay}s`,
                      "--ray-len": `${ray.len}`,
                    } as CSSProperties
                  }
                  filter="url(#heroRayGlow)"
                >
                  <line
                    x1={ray.x1}
                    y1={ray.y1}
                    x2={ray.x2}
                    y2={ray.y2}
                    className={
                      shouldReduceMotion
                        ? "hero-ray-line-static"
                        : "hero-ray-line"
                    }
                    stroke={ray.color}
                    strokeLinecap="round"
                    strokeDasharray={ray.len}
                    strokeDashoffset={shouldReduceMotion ? 0 : ray.len}
                  />
                  <circle
                    cx={ray.x2}
                    cy={ray.y2}
                    r="4"
                    className={
                      shouldReduceMotion
                        ? "hero-ray-tip-static"
                        : "hero-ray-tip"
                    }
                    fill={ray.color}
                  />
                </g>
              ))}
            </g>
          )}
        </motion.svg>
      </div>

      {/* Layer 4: Content readability scrim */}
      <div
        className="hero-content-scrim absolute inset-0 z-[15] pointer-events-none"
        aria-hidden
      />

      {/* Layer 5: Hero content (z-index 20) */}
      <motion.div
        className="hero-content relative z-[20] max-w-[700px] px-5 md:px-12 lg:px-[48px] py-28 md:py-32 text-left mx-auto lg:mx-0 lg:ml-[max(5vw,48px)]"
        variants={STAGGER.container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={STAGGER.item}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-card/50 backdrop-blur mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-telemetry" />
          <span className="font-rajdhani text-[11px] tracking-[0.22em] text-muted-foreground uppercase font-semibold">
            Strategy Center Online
          </span>
          <span className="w-px h-3 bg-border" />
          <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            APEXIQ · BUILD 0.1
          </span>
        </motion.div>

        <motion.h1
          variants={STAGGER.item}
          className="font-grotesk font-bold text-[36px] md:text-[48px] lg:text-[64px] tracking-[-0.03em] text-foreground leading-[1.1] [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]"
        >
          AI-Powered Formula 1
          <br />
          Race Intelligence
        </motion.h1>

        <motion.p
          variants={STAGGER.item}
          className="mt-6 font-sans text-[15px] md:text-[18px] text-muted-foreground max-w-[550px] leading-[1.6] [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]"
        >
          Real-time strategy simulation, tyre degradation prediction, traffic
          analysis and AI race engineer recommendations.
        </motion.p>

        <motion.div
          variants={STAGGER.item}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link to="/dashboard">
            <GlowButton className="flex items-center gap-2">
              Explore Dashboard{" "}
              <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
            </GlowButton>
          </Link>
          <Link to="/simulations">
            <GlowButton variant="outline" className="flex items-center gap-2">
              View Strategy Engine{" "}
              <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
            </GlowButton>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[20] flex flex-col items-center gap-2">
        <div
          className="h-10 w-px bg-gradient-to-b from-transparent via-border to-transparent"
          aria-hidden
        />
        <div
          className="h-5 w-[2px] bg-white/15 rounded-full overflow-hidden"
          aria-hidden
        >
          <div className="h-2 w-full bg-white/50 scroll-down" />
        </div>
      </div>
    </section>
  );
}
