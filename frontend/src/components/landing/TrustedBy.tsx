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
    <section className="py-12 overflow-hidden border-t border-[#E5E7EB] bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-6 px-6"
      >
        <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-[0.3em]">
          Trusted by simulation & engineering teams
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative"
      >
        <div
          className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"
          aria-hidden
        />

        <div className="marquee-track gap-12 px-6">
          {items.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="shrink-0 font-inter text-[13px] md:text-[14px] font-semibold tracking-[0.05em] text-[#9CA3AF] hover:text-[#6B7280] transition-colors uppercase whitespace-nowrap px-4"
            >
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
