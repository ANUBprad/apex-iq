import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

interface TransitionOverlayProps {
  navigating: boolean;
}

export function TransitionOverlay({ navigating }: TransitionOverlayProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (navigating) {
      const t = setTimeout(() => {
        navigate({ to: "/race-center" });
      }, 800);
      return () => clearTimeout(t);
    }
  }, [navigating, navigate]);

  return (
    <AnimatePresence>
      {navigating && (
        <motion.div
          key="transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" as const }}
          className="fixed inset-0 z-[100] bg-[#050505] pointer-events-auto"
        />
      )}
    </AnimatePresence>
  );
}
