import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GlowButton } from "@/components/ui-apex/GlowButton";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-[900px] mx-auto rounded-lg border border-border bg-card/70 backdrop-blur p-8 md:p-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-background/40 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-ferrari" />
          <span className="font-rajdhani text-[11px] tracking-[0.22em] text-muted-foreground uppercase font-semibold">
            Race-ready intelligence
          </span>
        </div>

        <h2 className="font-grotesk font-semibold text-[26px] md:text-[40px] text-foreground tracking-[-0.03em] leading-tight">
          Launch the Strategy Center
          <br />
          <span className="text-cyan-electric">before lights out</span>
        </h2>

        <p className="mt-4 text-[14px] text-muted-foreground max-w-xl mx-auto leading-[1.8]">
          Enter the race command experience: inputs on the left, strategy recommendation in the center, and engineering intelligence on the right.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
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
    </section>
  );
}
