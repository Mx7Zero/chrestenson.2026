import { describe, it, expect } from 'vitest'
import { applyIntensity } from '../intensity'
import { TUNNEL_DEFAULTS, type TunnelParams } from '../../TunnelCanvas'

// ─── intensity multiplier — pure-TS math ──────────────────────────
// Pins down the global CALM / FULL / OVERDRIVE multiplier table that
// rides on top of every resolved preset. FULL must be identity (no
// drift) so toggling between presets at FULL produces the values the
// author wrote. CALM softens; OVERDRIVE pushes past authoring intent
// with a 4 Hz strobe floor on presets that already strobe.

const base: TunnelParams = {
  ...TUNNEL_DEFAULTS,
  speed: 0.4,
  strobeRate: 2,
  chromatic: 0.4,
  hueShift: 0.5,
  wobble: 0.8,
  cellBlur: 0.1,
}

describe('applyIntensity — FULL is identity', () => {
  it('returns the same speed/strobeRate/chromatic/hueShift/wobble', () => {
    const out = applyIntensity(base, 'full')
    expect(out.speed).toBe(base.speed)
    expect(out.strobeRate).toBe(base.strobeRate)
    expect(out.chromatic).toBe(base.chromatic)
    expect(out.hueShift).toBe(base.hueShift)
    expect(out.wobble).toBe(base.wobble)
  })

  it('applies cellBlurDelta of 0 (no drift)', () => {
    const out = applyIntensity(base, 'full')
    expect(out.cellBlur).toBe(base.cellBlur)
  })

  it('does not mutate the input', () => {
    const snapshot = { ...base }
    applyIntensity(base, 'full')
    expect(base).toEqual(snapshot)
  })
})

describe('applyIntensity — CALM softens', () => {
  it('halves speed, zeros strobeRate, multiplies chromatic by 0.3', () => {
    const out = applyIntensity(base, 'calm')
    expect(out.speed).toBeCloseTo(base.speed * 0.5, 10)
    expect(out.strobeRate).toBe(0)
    expect(out.chromatic).toBeCloseTo(base.chromatic * 0.3, 10)
  })

  it('multiplies hueShift by 0.3 and wobble by 0.6', () => {
    const out = applyIntensity(base, 'calm')
    expect(out.hueShift).toBeCloseTo(base.hueShift * 0.3, 10)
    expect(out.wobble).toBeCloseTo(base.wobble * 0.6, 10)
  })

  it('nudges cellBlur up by 0.05', () => {
    const p: TunnelParams = { ...TUNNEL_DEFAULTS, cellBlur: 0 }
    const out = applyIntensity(p, 'calm')
    expect(out.cellBlur).toBeCloseTo(0.05, 10)
  })
})

describe('applyIntensity — OVERDRIVE pushes past', () => {
  it('multiplies chromatic by 2 and hueShift by 2', () => {
    const out = applyIntensity(base, 'overdrive')
    expect(out.chromatic).toBeCloseTo(base.chromatic * 2, 10)
    expect(out.hueShift).toBeCloseTo(base.hueShift * 2, 10)
  })

  it('applies a 4 Hz strobe floor when base strobeRate > 0', () => {
    // base strobeRate is 2; 2 * 1.5 = 3 → floor kicks in to 4
    const out = applyIntensity(base, 'overdrive')
    expect(out.strobeRate).toBe(4)
  })

  it('preserves a higher strobeRate above the 4 Hz floor', () => {
    const p: TunnelParams = { ...TUNNEL_DEFAULTS, strobeRate: 8 }
    const out = applyIntensity(p, 'overdrive')
    // 8 * 1.5 = 12, well above 4
    expect(out.strobeRate).toBeCloseTo(12, 10)
  })

  it('keeps strobeRate at 0 when base strobeRate is 0 (no invented strobe)', () => {
    const p: TunnelParams = { ...TUNNEL_DEFAULTS, strobeRate: 0 }
    const out = applyIntensity(p, 'overdrive')
    expect(out.strobeRate).toBe(0)
  })

  it('clamps cellBlur to ≥ 0 when delta would push it negative', () => {
    const p: TunnelParams = { ...TUNNEL_DEFAULTS, cellBlur: 0.02 }
    const out = applyIntensity(p, 'overdrive')
    // 0.02 + (-0.05) = -0.03 → clamped to 0
    expect(out.cellBlur).toBe(0)
  })

  it('preserves cellBlur above the floor (delta is additive)', () => {
    const p: TunnelParams = { ...TUNNEL_DEFAULTS, cellBlur: 0.2 }
    const out = applyIntensity(p, 'overdrive')
    expect(out.cellBlur).toBeCloseTo(0.15, 10)
  })

  it('multiplies speed by 1.6', () => {
    const out = applyIntensity(base, 'overdrive')
    expect(out.speed).toBeCloseTo(base.speed * 1.6, 10)
  })
})

describe('applyIntensity — passes through unrelated fields', () => {
  it('does not touch colorA/colorB/patternA/patternB/etc', () => {
    const p: TunnelParams = {
      ...TUNNEL_DEFAULTS,
      colorA: '#abcdef',
      colorB: '#123456',
      patternA: 'dots',
      patternB: 'grid',
      kaleidoscope: 6,
    }
    const out = applyIntensity(p, 'overdrive')
    expect(out.colorA).toBe('#abcdef')
    expect(out.colorB).toBe('#123456')
    expect(out.patternA).toBe('dots')
    expect(out.patternB).toBe('grid')
    expect(out.kaleidoscope).toBe(6)
  })
})
