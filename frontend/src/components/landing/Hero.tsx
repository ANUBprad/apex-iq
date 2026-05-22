import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GlowButton } from "@/components/ui-apex/GlowButton";
import heroF1 from "@/assets/hero-f1.jpg";

const STAGGER = {
  container: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  },
};

export function Hero() {
  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden bg-background">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-35 dark:opacity-40"
        style={{
          backgroundImage: `url(${heroF1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />

      {/* Gradient + grid overlays */}
      <div className="absolute inset-0 apex-radial-bg opacity-90 dark:opacity-100" aria-hidden />
      <div className="absolute inset-0 apex-grid-bg opacity-20 dark:opacity-60" aria-hidden />

      {/* Circuit outline overlay */}
      <motion.svg
        aria-hidden
        className="absolute inset-0 w-full h-full opacity-[0.22] dark:opacity-[0.18]"
        viewBox="0 0 1200 700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <path
          d="M188 446 C220 272, 348 202, 474 228 C562 246, 611 205, 662 160 C720 108, 802 90, 892 112 C1004 140, 1044 236, 1008 326 C985 383, 933 415, 875 438 C795 470, 748 525, 700 571 C648 621, 556 632, 470 604 C355 566, 266 548, 188 446 Z"
          fill="none"
          stroke="rgba(0,217,255,0.55)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M220 454 C248 300, 356 244, 470 266 C560 285, 615 236, 676 182 C736 128, 804 114, 878 133 C972 157, 1004 232, 975 306 C954 360, 906 393, 850 412 C775 438, 728 490, 678 534 C629 575, 552 586, 480 561 C373 525, 292 518, 220 454 Z"
          fill="none"
          stroke="rgba(220,20,60,0.38)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeDasharray="6 8"
        />
      </motion.svg>

      <div className="relative max-w-[1200px] mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-24">
        <motion.div variants={STAGGER.container} initial="hidden" animate="show">
          {/* Status badge */}
          <motion.div
            variants={STAGGER.item}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-card/40 backdrop-blur mb-8"
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

          {/* Headline */}
          <motion.h1
            variants={STAGGER.item}
            className="font-orbitron font-semibold text-[38px] md:text-[56px] lg:text-[72px] tracking-[-0.03em] text-foreground leading-[0.98]"
          >
            Predict The Race
            <br />
            Before It Happens
          </motion.h1>

          {/* Supporting */}
          <motion.p
            variants={STAGGER.item}
            className="mt-5 font-sans text-[14px] md:text-[16px] text-muted-foreground max-w-2xl leading-[1.75]"
          >
            AI-powered race intelligence for strategy optimization, telemetry analysis, tyre prediction, and race simulation.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={STAGGER.item} className="mt-10 flex flex-wrap gap-3">
            <Link to="/dashboard">
              <GlowButton className="flex items-center gap-2">
                Launch Strategy Center <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
              </GlowButton>
            </Link>
            <Link to="/telemetry">
              <GlowButton variant="outline" className="flex items-center gap-2">
                Explore Telemetry <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
              </GlowButton>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent" aria-hidden />
        <div className="h-5 w-[2px] bg-cyan-electric/30 rounded-full overflow-hidden" aria-hidden>
          <div className="h-2 w-full bg-cyan-electric/70 scroll-down" />
        </div>
      </div>
    </section>
  );
}
