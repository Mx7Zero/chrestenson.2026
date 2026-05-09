import type { TunnelParams } from '../TunnelCanvas'
import type { VibeConstraint } from './vibes'
import { lerpScalar } from './morph'

// ─── ⟲ VARIATION sampler ──────────────────────────────────────────
// Pure function. Takes a `VibeConstraint` (per-tab envelope) and
// emits a `Partial<TunnelParams>` ready to feed into the engine via
// the normal preset/morph path. The engine resolves any unsampled
// keys against `TUNNEL_DEFAULTS`, so the sampler intentionally
// leaves categorical shape fields like `hole`, `direction`,
// `bendDir`, `transparentCell`, `strobeMode`, `strobeTarget`,
// `strobeColor` and `strobeDuty` alone — they snap to whatever the
// defaults dictate. This keeps the sampler small and predictable
// while still producing a visibly fresh variation on every click.
//
// `density` is rounded to even-min-2: the engine expects even
// density (odd values misalign cells), and 0/1 are below the
// minimum useful resolution. The clamp lives here, not in
// `VibeConstraint`, so the constraint stays a pure description of
// the envelope.
//
// `kaleidoscope` and `rings` are integer fields in the engine, so
// they're rounded after the lerp.
//
// RNG injection: callers may pass a seeded PRNG for tests
// (`sampler.test.ts` uses a 32-bit LCG). Default `Math.random`
// keeps the production path zero-friction.

export function sampleVariation(
  c: VibeConstraint,
  rng: () => number = Math.random,
): Partial<TunnelParams> {
  const palette = c.paletteOptions[Math.floor(rng() * c.paletteOptions.length)]
  return {
    colorA: palette.colorA,
    colorB: palette.colorB,
    patternA: c.patternOptions[Math.floor(rng() * c.patternOptions.length)],
    patternB: c.patternOptions[Math.floor(rng() * c.patternOptions.length)],
    speed: lerpScalar(c.speedRange[0], c.speedRange[1], rng()),
    kaleidoscope: Math.round(
      lerpScalar(c.kaleidoRange[0], c.kaleidoRange[1], rng()),
    ),
    helix: lerpScalar(c.helixRange[0], c.helixRange[1], rng()),
    chromatic: lerpScalar(c.chromaRange[0], c.chromaRange[1], rng()),
    hueShift: lerpScalar(c.hueShiftRange[0], c.hueShiftRange[1], rng()),
    strobeRate: lerpScalar(
      c.strobeRateRange[0],
      c.strobeRateRange[1],
      rng(),
    ),
    cellBlur: lerpScalar(c.cellBlurRange[0], c.cellBlurRange[1], rng()),
    roll: lerpScalar(c.rollRange[0], c.rollRange[1], rng()),
    rings: Math.round(lerpScalar(c.ringsRange[0], c.ringsRange[1], rng())),
    // Even-min-2 clamp. lerp → /2 → round → *2 yields the closest
    // even integer ≥ 2 inside the declared range; if the range
    // bottoms at 2 the clamp can't drop below.
    density: Math.max(
      2,
      Math.round(
        lerpScalar(c.densityRange[0], c.densityRange[1], rng()) / 2,
      ) * 2,
    ),
  }
}
