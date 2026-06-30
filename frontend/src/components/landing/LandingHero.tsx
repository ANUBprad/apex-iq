import { useState, useCallback, lazy, Suspense } from "react";

const HeroVideo = lazy(() =>
  import("./HeroVideo").then((m) => ({ default: m.HeroVideo })),
);
import { HeroOverlay } from "./HeroOverlay";
import { HeroContent } from "./HeroContent";
import { TransitionOverlay } from "./TransitionOverlay";
import { MouseFollower } from "./MouseFollower";

function VideoFallback() {
  return (
    <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border border-[#E10600]/30 border-t-[#E10600] rounded-full animate-spin" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#555555] font-mono">
          Initializing
        </span>
      </div>
    </div>
  );
}

export function LandingHero() {
  const [videoReady, setVideoReady] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const handleVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  const handleEnterMission = useCallback(() => {
    setNavigating(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      <Suspense fallback={<VideoFallback />}>
        <HeroVideo onReady={handleVideoReady} />
      </Suspense>
      <HeroOverlay />
      {videoReady && <HeroContent onEnterMission={handleEnterMission} />}
      <TransitionOverlay navigating={navigating} />
      <MouseFollower />
    </section>
  );
}
