import type { TunnelParams } from '../TunnelCanvas'

// ─── Reduced flash safety clamp (chunk 9) ─────────────────────────
// Final clamp applied AFTER applyIntensity when the user has REDUCED
// FLASH engaged (or the prefers-reduced-motion media query auto-
// engaged it on first visit). This is a hard ceiling on the three
// fields that drive seizure-risk and hue-cycling motion:
//
//   strobeRate ≤ 1.5  — well below the 3 Hz seizure trigger band,
//                       and lower than the 4 Hz OVERDRIVE floor so
//                       the safety clamp wins.
//   chromatic  ≤ 0.3  — keep RGB separation subtle.
//   hueShift   ≤ 0.3  — slow the rainbow drift.
//
// Other fields pass through. This is intentionally a clamp, not a
// transform — a preset that already authored safe values is left
// alone.

export function applyReducedFlash(p: TunnelParams): TunnelParams {
  return {
    ...p,
    strobeRate: Math.min(p.strobeRate, 1.5),
    chromatic: Math.min(p.chromatic, 0.3),
    hueShift: Math.min(p.hueShift, 0.3),
  }
}
