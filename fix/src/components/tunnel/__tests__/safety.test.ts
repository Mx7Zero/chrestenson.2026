import { describe, it, expect } from 'vitest'
import { applyReducedFlash } from '../safety'
import { TUNNEL_DEFAULTS, type TunnelParams } from '../../TunnelCanvas'

// ─── reduced flash safety clamp ────────────────────────────────────
// Final clamp on the three seizure-risk fields. Pure pass-through for
// already-safe inputs; ceilings for everything else.

describe('applyReducedFlash — safe input passes through', () => {
  it('leaves a calm preset unchanged on the clamped fields', () => {
    const p: TunnelParams = {
      ...TUNNEL_DEFAULTS,
      strobeRate: 1,
      chromatic: 0.2,
      hueShift: 0.2,
    }
    const out = applyReducedFlash(p)
    expect(out.strobeRate).toBe(1)
    expect(out.chromatic).toBeCloseTo(0.2, 10)
    expect(out.hueShift).toBeCloseTo(0.2, 10)
  })

  it('does not mutate the input', () => {
    const p: TunnelParams = {
      ...TUNNEL_DEFAULTS,
      strobeRate: 8,
      chromatic: 1,
      hueShift: 1,
    }
    const snapshot = { ...p }
    applyReducedFlash(p)
    expect(p).toEqual(snapshot)
  })
})

describe('applyReducedFlash — unsafe input gets clamped', () => {
  it('clamps strobeRate to 1.5, chromatic to 0.3, hueShift to 0.3', () => {
    const p: TunnelParams = {
      ...TUNNEL_DEFAULTS,
      strobeRate: 8,
      chromatic: 1,
      hueShift: 1,
    }
    const out = applyReducedFlash(p)
    expect(out.strobeRate).toBe(1.5)
    expect(out.chromatic).toBe(0.3)
    expect(out.hueShift).toBe(0.3)
  })

  it('clamps each field independently', () => {
    const p: TunnelParams = {
      ...TUNNEL_DEFAULTS,
      strobeRate: 0.5, // under ceiling — passes through
      chromatic: 0.9, // clamped
      hueShift: 0.1, // under ceiling — passes through
    }
    const out = applyReducedFlash(p)
    expect(out.strobeRate).toBe(0.5)
    expect(out.chromatic).toBe(0.3)
    expect(out.hueShift).toBeCloseTo(0.1, 10)
  })
})

describe('applyReducedFlash — other fields pass through', () => {
  it('leaves speed/wobble/cellBlur/colorA/etc untouched', () => {
    const p: TunnelParams = {
      ...TUNNEL_DEFAULTS,
      strobeRate: 8,
      chromatic: 1,
      hueShift: 1,
      speed: 0.7,
      wobble: 1.2,
      cellBlur: 0.18,
      colorA: '#abcdef',
      colorB: '#123456',
      kaleidoscope: 8,
      patternA: 'dots',
    }
    const out = applyReducedFlash(p)
    expect(out.speed).toBe(0.7)
    expect(out.wobble).toBe(1.2)
    expect(out.cellBlur).toBe(0.18)
    expect(out.colorA).toBe('#abcdef')
    expect(out.colorB).toBe('#123456')
    expect(out.kaleidoscope).toBe(8)
    expect(out.patternA).toBe('dots')
  })
})
