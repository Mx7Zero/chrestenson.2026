import { describe, it, expect } from 'vitest'
import { sampleVariation } from '../sampler'
import { VIBES } from '../vibes'
import { TAB_ORDER } from '../presets'

// ─── ⟲ VARIATION sampler — chunk 8 ────────────────────────────────
// Tests pin the contract:
//   1. Seeded RNG → deterministic output (snapshot).
//   2. Sampled scalars stay inside the declared `VibeConstraint`
//      ranges across 50 trials per tab.
//   3. `density` is always even and ≥ 2 (engine constraint).
//   4. Every tab in `TAB_ORDER` has at least one palette to sample.
//   5. CHROMA samples are pattern-free (the tab's whole pitch).
//   6. RAVE samples always strobe (lower bound of the range > 0).
//
// The seeded RNG is a deliberately simple LCG: tests want the same
// stream across machines, not a high-quality PRNG.

function seededRng(seed = 0): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const FLOAT_FUDGE = 0.001

describe('sampleVariation — determinism with seeded RNG', () => {
  it('produces the same partial preset twice when reseeded', () => {
    const a = sampleVariation(VIBES.psychedelic, seededRng(0))
    const b = sampleVariation(VIBES.psychedelic, seededRng(0))
    expect(a).toEqual(b)
  })

  it('matches a snapshot for a fixed seed', () => {
    const sample = sampleVariation(VIBES.psychedelic, seededRng(0))
    expect(sample).toMatchSnapshot()
  })
})

describe('sampleVariation — bounds compliance', () => {
  for (const tab of TAB_ORDER) {
    it(`${tab}: 50 trials all stay inside the declared ranges`, () => {
      const c = VIBES[tab]
      const rng = seededRng(42)
      for (let i = 0; i < 50; i++) {
        const s = sampleVariation(c, rng)
        expect(s.speed!).toBeGreaterThanOrEqual(c.speedRange[0] - FLOAT_FUDGE)
        expect(s.speed!).toBeLessThanOrEqual(c.speedRange[1] + FLOAT_FUDGE)
        // kaleidoscope is rounded to int — allow ±1 from the lerp
        // bounds because Math.round(0.6) = 1 from a 0..1 range.
        expect(s.kaleidoscope!).toBeGreaterThanOrEqual(
          Math.floor(c.kaleidoRange[0]) - FLOAT_FUDGE,
        )
        expect(s.kaleidoscope!).toBeLessThanOrEqual(
          Math.ceil(c.kaleidoRange[1]) + FLOAT_FUDGE,
        )
        expect(s.helix!).toBeGreaterThanOrEqual(c.helixRange[0] - FLOAT_FUDGE)
        expect(s.helix!).toBeLessThanOrEqual(c.helixRange[1] + FLOAT_FUDGE)
        expect(s.chromatic!).toBeGreaterThanOrEqual(
          c.chromaRange[0] - FLOAT_FUDGE,
        )
        expect(s.chromatic!).toBeLessThanOrEqual(
          c.chromaRange[1] + FLOAT_FUDGE,
        )
        expect(s.hueShift!).toBeGreaterThanOrEqual(
          c.hueShiftRange[0] - FLOAT_FUDGE,
        )
        expect(s.hueShift!).toBeLessThanOrEqual(
          c.hueShiftRange[1] + FLOAT_FUDGE,
        )
        expect(s.strobeRate!).toBeGreaterThanOrEqual(
          c.strobeRateRange[0] - FLOAT_FUDGE,
        )
        expect(s.strobeRate!).toBeLessThanOrEqual(
          c.strobeRateRange[1] + FLOAT_FUDGE,
        )
        expect(s.cellBlur!).toBeGreaterThanOrEqual(
          c.cellBlurRange[0] - FLOAT_FUDGE,
        )
        expect(s.cellBlur!).toBeLessThanOrEqual(
          c.cellBlurRange[1] + FLOAT_FUDGE,
        )
        expect(s.roll!).toBeGreaterThanOrEqual(c.rollRange[0] - FLOAT_FUDGE)
        expect(s.roll!).toBeLessThanOrEqual(c.rollRange[1] + FLOAT_FUDGE)
        expect(s.rings!).toBeGreaterThanOrEqual(
          Math.floor(c.ringsRange[0]) - FLOAT_FUDGE,
        )
        expect(s.rings!).toBeLessThanOrEqual(
          Math.ceil(c.ringsRange[1]) + FLOAT_FUDGE,
        )
        // density bounds: even-min-2 clamp can pull a sample at the
        // very low end of a range up to 2; at the high end it
        // rounds to the nearest even, which may land above the
        // upper bound by 1. Allow ±1 slop on both sides.
        expect(s.density!).toBeGreaterThanOrEqual(2)
        expect(s.density!).toBeLessThanOrEqual(c.densityRange[1] + 1)
      }
    })
  }
})

describe('sampleVariation — density is even and ≥ 2', () => {
  for (const tab of TAB_ORDER) {
    it(`${tab}: 50 trials all produce even density ≥ 2`, () => {
      const c = VIBES[tab]
      const rng = seededRng(7)
      for (let i = 0; i < 50; i++) {
        const s = sampleVariation(c, rng)
        expect(s.density!).toBeGreaterThanOrEqual(2)
        expect(s.density! % 2).toBe(0)
      }
    })
  }
})

describe('VIBES — palette options exist for every tab', () => {
  for (const tab of TAB_ORDER) {
    it(`${tab} has at least one palette`, () => {
      expect(VIBES[tab].paletteOptions.length).toBeGreaterThan(0)
    })
  }
})

describe('sampleVariation — CHROMA pattern discipline', () => {
  it('CHROMA samples have patternA and patternB null in 50 trials', () => {
    const rng = seededRng(13)
    for (let i = 0; i < 50; i++) {
      const s = sampleVariation(VIBES.chroma, rng)
      expect(s.patternA).toBeNull()
      expect(s.patternB).toBeNull()
    }
  })
})

describe('sampleVariation — RAVE always strobes', () => {
  it('RAVE samples have strobeRate > 0 in 50 trials', () => {
    const rng = seededRng(99)
    for (let i = 0; i < 50; i++) {
      const s = sampleVariation(VIBES.rave, rng)
      expect(s.strobeRate!).toBeGreaterThan(0)
    }
  })
})
