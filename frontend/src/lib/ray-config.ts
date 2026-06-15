export type RayColor = "#06b6d4" | "#ef4444";

export type RayPlacement = {
  id: string;
  /** Position along circuit path (0–1, anticlockwise from start/finish). */
  t: number;
  color: RayColor;
  len: number;
  delay: number;
};

/**
 * 16 radiating telemetry rays — placement along Yas Marina path fractions.
 * Colors: 13 cyan (#06b6d4), 3 red (#ef4444) at T1 apex, island tight, T5 hairpin.
 */
export const HERO_RAY_PLACEMENTS: RayPlacement[] = [
  // Turn 1 complex (2 rays)
  { id: "ray-t1-main", t: 0.845, color: "#06b6d4", len: 48, delay: 0 },
  { id: "ray-t1-apex", t: 0.82, color: "#ef4444", len: 46, delay: 0.12 },

  // Island / waist section (4 rays)
  { id: "ray-island-1", t: 0.42, color: "#06b6d4", len: 42, delay: 0.24 },
  { id: "ray-island-2", t: 0.45, color: "#ef4444", len: 44, delay: 0.36 },
  { id: "ray-island-3", t: 0.48, color: "#06b6d4", len: 40, delay: 0.48 },
  { id: "ray-island-4", t: 0.51, color: "#06b6d4", len: 38, delay: 0.6 },

  // Waterfront / T8 (2 rays)
  { id: "ray-water-1", t: 0.26, color: "#06b6d4", len: 36, delay: 0.72 },
  { id: "ray-water-2", t: 0.22, color: "#06b6d4", len: 34, delay: 0.84 },

  // Back technical / T5 hairpin (3 rays)
  { id: "ray-back-1", t: 0.9, color: "#06b6d4", len: 50, delay: 0.96 },
  { id: "ray-back-2", t: 0.935, color: "#ef4444", len: 48, delay: 1.08 },
  { id: "ray-back-3", t: 0.875, color: "#06b6d4", len: 44, delay: 1.2 },

  // Final section T15–16 (3 rays)
  { id: "ray-final-1", t: 0.58, color: "#06b6d4", len: 38, delay: 1.32 },
  { id: "ray-final-2", t: 0.62, color: "#06b6d4", len: 36, delay: 1.44 },
  { id: "ray-hairpin", t: 0.66, color: "#06b6d4", len: 40, delay: 1.56 },

  // Return / finish (2 rays)
  { id: "ray-return", t: 0.06, color: "#06b6d4", len: 32, delay: 1.68 },
  { id: "ray-finish", t: 0.03, color: "#06b6d4", len: 30, delay: 1.8 },
];

export type ComputedRay = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  len: number;
  color: RayColor;
  delay: number;
};

/** Compute outward radiating rays from an SVG path at given t-fractions. */
export function computeRaysFromPath(
  path: SVGPathElement,
  placements: RayPlacement[],
  center = { x: 600, y: 400 },
): ComputedRay[] {
  const total = path.getTotalLength();

  return placements.map((r) => {
    const at = total * r.t;
    const p = path.getPointAtLength(at);
    const pPrev = path.getPointAtLength(Math.max(0, at - 2));
    const pNext = path.getPointAtLength(Math.min(total, at + 2));

    let nx = -(pNext.y - pPrev.y);
    let ny = pNext.x - pPrev.x;
    const nLen = Math.hypot(nx, ny) || 1;
    nx /= nLen;
    ny /= nLen;

    const cx = p.x - center.x;
    const cy = p.y - center.y;
    if (nx * cx + ny * cy < 0) {
      nx *= -1;
      ny *= -1;
    }

    return {
      id: r.id,
      x1: p.x,
      y1: p.y,
      x2: p.x + nx * r.len,
      y2: p.y + ny * r.len,
      len: r.len,
      color: r.color,
      delay: r.delay,
    };
  });
}
