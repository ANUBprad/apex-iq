import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

interface SearchResult {
  id: string;
  title: string;
  category: string;
  path: string;
  icon: string;
}

const SEARCH_ITEMS: SearchResult[] = [
  {
    id: "mc",
    title: "Mission Control",
    category: "Race",
    path: "/mission-control",
    icon: "⬡",
  },
  {
    id: "rc",
    title: "Race Center",
    category: "Race",
    path: "/race-center",
    icon: "◈",
  },
  {
    id: "tl",
    title: "Telemetry",
    category: "Race",
    path: "/telemetry",
    icon: "▤",
  },
  {
    id: "sl",
    title: "Strategy Lab",
    category: "Strategy",
    path: "/strategy-lab",
    icon: "⊞",
  },
  {
    id: "sim",
    title: "Simulation",
    category: "Strategy",
    path: "/simulation",
    icon: "▶",
  },
  {
    id: "ai",
    title: "AI Engineer",
    category: "AI",
    path: "/ai-engineer",
    icon: "◇",
  },
  {
    id: "an",
    title: "Analytics",
    category: "AI",
    path: "/analytics",
    icon: "▦",
  },
  {
    id: "set",
    title: "Settings",
    category: "System",
    path: "/settings",
    icon: "⚙",
  },
  { id: "abt", title: "About", category: "System", path: "/about", icon: "·" },
  { id: "home", title: "Home", category: "System", path: "/", icon: "◆" },
];

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filtered = SEARCH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()),
  );

  const handleOpen = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const handler = () => handleOpen();
    document.addEventListener("apexiq:search", handler);
    return () => document.removeEventListener("apexiq:search", handler);
  }, [handleOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false);
      navigate({ to: path });
    },
    [navigate],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].path);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [filtered, selectedIndex, handleSelect],
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: [0.19, 1, 0.22, 1] }}
            className="fixed top-[15%] left-1/2 z-[151] w-[90vw] max-w-[480px] -translate-x-1/2 rounded-sm border border-[#1e1e1e] bg-[#0a0a0a] shadow-2xl"
            role="dialog"
            aria-label="Search navigation"
            aria-modal="true"
          >
            <div className="flex items-center gap-3 border-b border-[#1e1e1e] px-4 py-3">
              <span className="text-[#666] text-sm">⌕</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, drivers, teams..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#666] outline-none"
                aria-label="Search"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[#262626] bg-[#141414] px-1.5 py-0.5 text-[10px] text-[#666] font-mono">
                ESC
              </kbd>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1" role="listbox">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-[#666]">
                  No results found
                </div>
              ) : (
                filtered.map((item, i) => (
                  <button
                    key={item.id}
                    role="option"
                    aria-selected={i === selectedIndex}
                    onClick={() => handleSelect(item.path)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                      i === selectedIndex
                        ? "bg-[#141414] text-white"
                        : "text-[#a0a0a0] hover:bg-[#101010]"
                    }`}
                  >
                    <span
                      className="w-5 text-center text-xs"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.title}</span>
                    <span className="text-[10px] text-[#666] uppercase">
                      {item.category}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="flex items-center justify-between border-t border-[#1e1e1e] px-4 py-2 text-[10px] text-[#666]">
              <span>{filtered.length} results</span>
              <span>
                <kbd className="rounded border border-[#262626] bg-[#141414] px-1 py-0.5 font-mono">
                  ↑↓
                </kbd>{" "}
                navigate{" "}
                <kbd className="rounded border border-[#262626] bg-[#141414] px-1 py-0.5 font-mono">
                  ↵
                </kbd>{" "}
                select
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
