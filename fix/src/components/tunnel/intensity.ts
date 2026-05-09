import type { TunnelParams } from '../TunnelCanvas'

// ─── Intensity multiplier table (chunk 9) ──────────────────────────
// CALM / FULL / OVERDRIVE is a global multiplier layer applied AFTER
// the preset has been resolved against TUNNEL_DEFAULTS. The idea: any
// preset can be dialed down for a calmer experience, run "as authored"
// at FULL, or pushed past authoring intent at OVERDRIVE.
//
// FULL is identity (multiply by 1, cellBlur delta 0) — selecting FULL
// at runtime should produce the exact preset values, with no rounding
// drift introduced by the multiplier layer.
//
// `cellBlurDelta` is additive (not multiplicative) because cellBlur
// often starts at 0 — multiplication couldn't push it up. CALM nudges
// blur up slightly (softer cells), OVERDRIVE nudges it down (sharper
// edges). The output is clamped to ≥ 0.
//
// `strobeRate` has a special case for OVERDRIVE: when the preset's
// base strobeRate is > 0, OVERDRIVE applies a 4 Hz floor on top of
// the multiplier. This makes RAVE/GLITCH presets reliably "feel"
// rave-y at OVERDRIVE even if the authored rate was modest. When the
// base strobeRate is 0 (no strobe), OVERDRIVE leaves it at 0 — we
// don't want OVERDRIVE to invent strobe out of nowhere on quiet
// presets like SACRED.

export type Intensity = 'calm' | 'full' | 'overdrive'

const TABLE: Record<
  Intensity,
  {
    speed: number
    strobeRate: number
    chromatic: number
    hueShift: number
    wobble: number
    cellBlurDelta: number
  }
> = {
  calm: { speed: 0.5, strobeRate: 0, chromatic: 0.3, hueShift: 0.3, wobble: 0.6, cellBlurDelta: 0.05 },
  full: { speed: 1.0, strobeRate: 1.0, chromatic: 1.0, hueShift: 1.0, wobble: 1.0, cellBlurDelta: 0 },
  overdrive: { speed: 1.6, strobeRate: 1.5, chromatic: 2.0, hueShift: 2.0, wobble: 1.4, cellBlurDelta: -0.05 },
}

export function applyIntensity(p: TunnelParams, level: Intensity): TunnelParams {
  const m = TABLE[level]
  return {
    ...p,
    speed: p.speed * m.speed,
    strobeRate:
      level === 'overdrive' && p.strobeRate > 0
        ? Math.max(4, p.strobeRate * m.strobeRate)
        : p.strobeRate * m.strobeRate,
    chromatic: p.chromatic * m.chromatic,
    hueShift: p.hueShift * m.hueShift,
    wobble: p.wobble * m.wobble,
    cellBlur: Math.max(0, p.cellBlur + m.cellBlurDelta),
  }
}
