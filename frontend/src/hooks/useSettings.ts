import { useState, useCallback, useEffect } from "react";

export interface AppSettings {
  theme: "dark" | "light";
  telemetryRefreshMs: number;
  animationsEnabled: boolean;
  compactMode: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  telemetryRefreshMs: 2000,
  animationsEnabled: true,
  compactMode: false,
};

const STORAGE_KEY = "apexiq-settings";

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // fallback to defaults
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // silently fail
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = useCallback(
    (partial: Partial<AppSettings>) =>
      setSettings((prev) => ({ ...prev, ...partial })),
    [],
  );

  return { settings, update };
}
