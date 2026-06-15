/**
 * Yas Marina Circuit (Abu Dhabi) — traced from official F1 topology reference.
 * Anticlockwise lap, viewBox 0 0 1200 800.
 *
 * Key landmarks:
 * - Start/finish on top main straight (between T16 and T6/7)
 * - T5 hairpin at far right
 * - T6/7 chicane top-left
 * - T9 hairpin bottom-left
 * - T10–14 waist/island technical section through center
 * - T1 sharp right-hander bottom-right (Sector 1 signature corner)
 */
export const YAS_MARINA_CIRCUIT_PATH =
  "M 510 136 " +
  // Top main straight → T6/7 chicane (Sector 2)
  "L 340 146 " +
  "L 228 156 " +
  "L 198 162 " +
  "Q 178 168 172 188 " +
  "Q 166 208 186 220 " +
  "Q 206 232 228 214 " +
  "Q 248 196 268 212 " +
  // T8 — left side descent
  "Q 288 252 312 308 " +
  "L 332 368 " +
  "Q 338 412 322 452 " +
  // T9 — bottom-left hairpin
  "Q 292 512 238 568 " +
  "Q 178 618 128 652 " +
  "Q 98 682 108 722 " +
  "Q 128 758 182 748 " +
  "Q 242 735 288 692 " +
  // T10–14 — island / waist technical section
  "Q 332 648 378 608 " +
  "Q 428 562 478 522 " +
  "Q 528 482 582 448 " +
  "Q 638 412 688 378 " +
  "Q 728 348 752 308 " +
  // T15–16 — climb back to top straight
  "Q 772 262 778 218 " +
  "Q 778 178 748 158 " +
  "Q 718 142 668 138 " +
  // Long back straight → T5 hairpin (speed trap zone)
  "L 820 140 " +
  "L 940 145 " +
  "L 1028 150 " +
  "L 1068 156 " +
  "Q 1102 166 1100 218 " +
  "Q 1096 272 1078 322 " +
  "Q 1055 368 1012 392 " +
  "Q 968 412 918 422 " +
  // T4 — right-side descent
  "Q 868 432 828 458 " +
  "L 798 492 " +
  // T2–3 chicane
  "Q 786 532 768 566 " +
  "Q 746 598 718 612 " +
  "Q 688 622 662 608 " +
  // T1 — hard right (120° signature corner)
  "L 628 632 " +
  "L 582 648 " +
  "Q 548 652 532 618 " +
  "Q 518 582 524 532 " +
  // Return to start/finish
  "Q 528 468 522 368 " +
  "Q 516 258 510 136 " +
  "Z";

export const CIRCUIT_VIEWBOX = "0 0 1200 800";

/** Approximate corner centers for ray placement validation. */
export const YAS_MARINA_CORNERS = {
  startFinish: { x: 510, y: 136 },
  t1: { x: 582, y: 648 },
  t5: { x: 1100, y: 218 },
  t6t7: { x: 198, y: 188 },
  t9: { x: 108, y: 722 },
  island: { x: 528, y: 482 },
} as const;
