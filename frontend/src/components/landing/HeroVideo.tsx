import { useRef, useState, useEffect, memo } from "react";
import { motion } from "framer-motion";

const VIDEO_SRC = "/videos/intro.mp4";

interface HeroVideoProps {
  onReady: () => void;
}

const CornerBracket = ({ className }: { className: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(225,6,0,0.3)"
    strokeWidth="1.5"
    className={className}
  >
    <path d="M20 4v16H4" />
  </svg>
);

export const HeroVideo = memo(function HeroVideo({ onReady }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const handleCanPlay = () => {
      if (!cancelled) {
        setLoaded(true);
        onReady();
      }
    };

    const handleError = () => {
      if (!cancelled) {
        setFailed(true);
        setLoaded(true);
        onReady();
      }
    };

    video.addEventListener("canplaythrough", handleCanPlay, { once: true });
    video.addEventListener("error", handleError, { once: true });

    if (video.readyState >= 3) {
      setLoaded(true);
      onReady();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("canplaythrough", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [onReady]);

  return (
    <div className="absolute inset-0">
      {/* Video or fallback */}
      {failed ? (
        <div className="absolute inset-0 bg-[#050505]">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[#E10600]/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-[#00C8FF]/5 rounded-full blur-[100px]" />
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: "transform" }}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E10600]/30 to-transparent pointer-events-none"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {/* Corner brackets */}
      <CornerBracket className="absolute top-8 left-8" />
      <CornerBracket className="absolute top-8 right-8 scale-x-[-1]" />
      <CornerBracket className="absolute bottom-8 left-8 scale-y-[-1]" />
      <CornerBracket className="absolute bottom-8 right-8 scale-[-1]" />

      {/* Loading indicator */}
      {!loaded && !failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border border-[#E10600]/30 border-t-[#E10600] rounded-full animate-spin" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#555555] font-mono">
              Initializing
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
