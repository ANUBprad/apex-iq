import { memo } from "react";

export const HeroOverlay = memo(function HeroOverlay() {
  return (
    <>
      {/* Base darkening */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      {/* Top gradient - transparent at center, darker at edges */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(5,5,5,0.4) 60%, rgba(5,5,5,0.85) 100%)",
        }}
      />

      {/* Bottom gradient - smooth fade to solid */}
      <div
        className="absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 50%, rgba(5,5,5,0.3) 75%, #050505 100%)",
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 z-[4] opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animated vignette */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none animate-vignette-pulse"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Top edge glow bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] z-[6] bg-gradient-to-r from-transparent via-[#E10600]/50 to-transparent" />

      {/* Side edge accents */}
      <div className="absolute left-0 top-0 bottom-0 w-[1px] z-[6] bg-gradient-to-b from-transparent via-[#E10600]/20 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-[1px] z-[6] bg-gradient-to-b from-transparent via-[#E10600]/20 to-transparent" />
    </>
  );
});
