import { motion } from "framer-motion";

export function CinematicLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 px-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[rgba(14,165,233,0.2)] bg-[rgba(14,165,233,0.05)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.15em] text-[#0EA5E9] uppercase font-medium">
            {label}
          </span>
        </motion.div>

        <h1 className="font-inter font-bold text-[36px] md:text-[48px] tracking-[-0.02em] text-[#1A1D29]">
          APEX<span className="text-[#0EA5E9]">iq</span>
        </h1>

        <div className="w-[200px] flex flex-col gap-2">
          <div className="flex justify-between text-[12px] font-medium">
            <span className="text-[#6B7280]">{label}</span>
            <span className="text-[#0EA5E9]">...</span>
          </div>
          <div className="relative h-[2px] bg-[#E5E7EB] overflow-hidden rounded-full">
            <span
              className="absolute inset-y-0 left-0 w-1/3 bg-[#0EA5E9] rounded-full animate-[shimmer_1.5s_infinite]"
              style={{ backgroundSize: "200% 100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
