import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { SearchModal } from "@/components/SearchModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-[#E10600]/10 rounded-sm flex items-center justify-center border border-[#E10600]/20">
          <span className="text-3xl font-bold text-[#E10600] font-[family-name:var(--font-heading)]">
            404
          </span>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Telemetry Lost
        </h2>
        <p className="text-sm text-[#666] mb-8">
          The page you are looking for does not exist in this sector.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-sm bg-[#E10600] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#E10600]/80"
        >
          Return to Pits
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-[#E10600]/10 rounded-sm flex items-center justify-center border border-[#E10600]/20">
          <span className="text-2xl font-bold text-[#E10600] font-[family-name:var(--font-heading)]">
            !
          </span>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">System Error</h2>
        <p className="text-sm text-[#666] mb-8">
          An unexpected error occurred in the race systems.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-sm bg-[#E10600] px-6 py-3 text-sm font-medium text-white hover:bg-[#E10600]/80"
          >
            Retry
          </button>
          <a
            href="/"
            className="rounded-sm border border-[#262626] bg-[#101010] px-6 py-3 text-sm font-medium text-[#A0A0A0] hover:bg-[#141414]"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "APEXiq · Race Intelligence OS" },
        {
          name: "description",
          content:
            "AI-powered Formula 1 race engineering and motorsport intelligence platform.",
        },
        { property: "og:title", content: "APEXiq · Race Intelligence OS" },
        {
          property: "og:description",
          content:
            "AI-powered Formula 1 race engineering and motorsport intelligence platform.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "APEXiq · Race Intelligence OS" },
        {
          name: "twitter:description",
          content:
            "AI-powered Formula 1 race engineering and motorsport intelligence platform.",
        },
      ],
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        { rel: "stylesheet", href: appCss },
      ],
    }),
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function BootScreen() {
  return (
    <motion.div
      key="boot"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-12 h-12 bg-[#E10600] rounded-sm mx-auto mb-4 flex items-center justify-center glow-red"
        >
          <span className="text-white font-bold text-xl font-[family-name:var(--font-heading)]">
            AQ
          </span>
        </motion.div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-[#E10600]"
          />
          <p className="text-[11px] text-[#666] tracking-[0.15em] uppercase font-medium">
            Initializing Race Systems
          </p>
        </div>
        <div className="w-32 h-0.5 bg-[#262626] rounded-full mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-[#E10600] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <OfflineBanner />
          <SearchModal />
          <AnimatePresence>{booting && <BootScreen />}</AnimatePresence>
          <ErrorBoundary>
            <AppShell />
          </ErrorBoundary>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

function AppShell() {
  const { location } = useRouterState();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "4") {
        e.preventDefault();
        const routes = [
          "/race-center",
          "/ai-engineer",
          "/telemetry",
          "/strategy-lab",
        ];
        navigate({ to: routes[parseInt(e.key) - 1] as never });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("apexiq:search"));
      }
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    },
    [navigate, sidebarOpen],
  );

  useEffect(() => {
    if (!isLanding) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isLanding, handleKeyDown]);

  if (isLanding) return <Outlet />;

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[300] focus:top-4 focus:left-4 focus:bg-[#E10600] focus:text-white focus:px-4 focus:py-2 focus:rounded-sm focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center h-[48px] border-b border-[#1E1E1E] bg-[#050505]/95 backdrop-blur-sm px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-sm text-[#A0A0A0] hover:text-white hover:bg-[#141414] transition-colors"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            {sidebarOpen ? (
              <>
                <line x1="3" y1="3" x2="13" y2="13" />
                <line x1="13" y1="3" x2="3" y2="13" />
              </>
            ) : (
              <>
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="12" x2="14" y2="12" />
              </>
            )}
          </svg>
        </button>
        <span className="ml-3 text-sm font-bold text-white tracking-tight font-[family-name:var(--font-heading)]">
          APEXiq
        </span>
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        id="main-content"
        className="flex-1 min-h-screen pt-[48px] lg:pt-0 lg:ml-[240px]"
        role="main"
        aria-label="Main content"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="min-h-screen"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
