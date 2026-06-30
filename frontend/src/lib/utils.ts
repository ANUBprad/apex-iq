import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}

export function formatLapTime(seconds: number): string {
  const s = Math.floor(seconds);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${s}.${String(ms).padStart(3, "0")}`;
}

export function formatDelta(seconds: number): string {
  const prefix = seconds >= 0 ? "+" : "-";
  return `${prefix}${Math.abs(seconds).toFixed(3)}`;
}
