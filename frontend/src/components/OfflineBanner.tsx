import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 bg-[#e10600] px-4 py-2 text-xs font-medium text-white"
          role="alert"
          aria-live="assertive"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          OFFLINE — Telemetry feed interrupted. Attempting reconnection...
        </motion.div>
      )}
      {showReconnected && online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 bg-[#00ff85] px-4 py-2 text-xs font-medium text-black"
          role="status"
          aria-live="polite"
        >
          <span className="w-2 h-2 rounded-full bg-black" />
          RECONNECTED — All systems nominal
        </motion.div>
      )}
    </AnimatePresence>
  );
}
