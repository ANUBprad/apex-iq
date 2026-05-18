import { motion } from "framer-motion";

const PARTNERS = [
  "McLaren Shadow",
  "Alpine Academy",
  "Williams Sim",
  "Ferrari Esports",
  "Red Bull Racing",
  "Mercedes AMG",
  "Aston Martin",
  "Haas F1",
];

export function TrustedBy() {
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <section className="relative py-16 overflow-hidden border-t border-white/5">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-8 px-6"
      >
        <span className="font-space-grotesk text-[10px] tracking-[0.4em] text-white/35 uppercase">
          Trusted by simulation & engineering teams
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative"
      >
        <motion.div
          className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none"
          aria-hidden
        />
        <motion.div
          className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none"
          aria-hidden
        />

        <motion.div className="marquee-track gap-12 px-6">
          {items.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="shrink-0 font-orbitron text-sm md:text-base tracking-[0.2em] text-white/25 hover:text-white/50 transition-colors uppercase whitespace-nowrap px-4"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
