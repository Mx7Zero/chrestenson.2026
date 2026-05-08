import { describe, it, expect } from 'vitest'
import {
  lerpScalar,
  lerpHSL,
  bloomCurve,
  morphParams,
} from '../morph'
import { TUNNEL_DEFAULTS, type TunnelParams } from '../../TunnelCanvas'

// ─── morph engine — pure-TS math ──────────────────────────────────
// These tests pin down the load-bearing primitive that powers both
// preset clicks (600ms) and the DEMO button (8000ms). Any regression
// here is a visible regression in the instrument.

describe('lerpScalar', () => {
  it('returns a at t=0', () => {
    expect(lerpScalar(2, 8, 0)).toBe(2)
  })

  it('returns b at t=1', () => {
    expect(lerpScalar(2, 8, 1)).toBe(8)
  })

  it('returns the midpoint at t=0.5', () => {
    expect(lerpScalar(2, 8, 0.5)).toBe(5)
  })

  it('extrapolates past t=1 (used by bloom math at t=0)', () => {
    // lerp is intentionally unclamped — the bloom term may push
    // cellBlur past the lerped target, which is a feature.
    expect(lerpScalar(0, 10, 1.5)).toBe(15)
    expect(lerpScalar(0, 10, -0.5)).toBe(-5)
  })
})

// Helpers for HSL assertions.
function hexToRgbTriplet(hex: string): [number, number, number] {
  const m = hex.replace('#', '')
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ]
}

function saturationOf(hex: string): number {
  const [r, g, b] = hexToRgbTriplet(hex).map((c) => c / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return 0
  const d = max - min
  return l > 0.5 ? d / (2 - max - min) : d / (max + min)
}

describe('lerpHSL', () => {
  it('returns the start color at t=0', () => {
    expect(lerpHSL('#ff0000', '#00ff00', 0)).toBe('#ff0000')
  })

  it('returns the end color at t=1', () => {
    expect(lerpHSL('#ff0000', '#00ff00', 1)).toBe('#00ff00')
  })

  it('passes through saturated yellow at t=0.5 (red→green), not gray', () => {
    const mid = lerpHSL('#ff0000', '#00ff00', 0.5)
    // Saturation must stay high — gray would be 0, yellow stays 1.
    expect(saturationOf(mid)).toBeGreaterThan(0.9)
    // And the hue must be near yellow (R+G high, B low).
    const [r, g, b] = hexToRgbTriplet(mid)
    expect(r).toBeGreaterThan(200)
    expect(g).toBeGreaterThan(200)
    expect(b).toBeLessThan(40)
  })

  it('takes the shortest hue path: red→blue passes through magenta, not cyan', () => {
    // hue 0 → hue 240. Going +240 hits cyan at 180. Going -120 hits
    // magenta at 300. Magenta is shorter.
    const mid = lerpHSL('#ff0000', '#0000ff', 0.5)
    const [r, g, b] = hexToRgbTriplet(mid)
    // Magenta-ish: high R, low G, high B.
    expect(r).toBeGreaterThan(200)
    expect(g).toBeLessThan(40)
    expect(b).toBeGreaterThan(200)
  })
})

describe('bloomCurve', () => {
  it('is 0 at t=0', () => {
    expect(bloomCurve(0)).toBeCloseTo(0, 10)
  })

  it('is 0 at t=1', () => {
    expect(bloomCurve(1)).toBeCloseTo(0, 10)
  })

  it('peaks at t=0.5 with value equal to peak', () => {
    expect(bloomCurve(0.5)).toBeCloseTo(0.2, 10)
    expect(bloomCurve(0.5, 0.5)).toBeCloseTo(0.5, 10)
  })

  it('is monotonically increasing on [0, 0.5]', () => {
    let prev = -Infinity
    for (let t = 0; t <= 0.5; t += 0.05) {
      const v = bloomCurve(t)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  })
})

describe('morphParams', () => {
  // Pick concrete from/to with values different from defaults so we
  // can verify lerps on real fields (scalar, color, categorical).
  const A: TunnelParams = {
    ...TUNNEL_DEFAULTS,
    speed: 0.02,
    rings: 30,
    density: 2,
    cellBlur: 0,
    colorA: '#ff0000',
    colorB: '#00ff00',
    patternA: 'checker',
    patternB: 'dot',
    direction: 1,
    hole: 3.2,
  }
  const B: TunnelParams = {
    ...TUNNEL_DEFAULTS,
    speed: 0.10,
    rings: 6,
    density: 8,
    cellBlur: 0.4,
    colorA: '#0000ff',
    colorB: '#ffff00',
    patternA: 'dots',
    patternB: 'cross',
    direction: -1,
    hole: 5.0,
  }

  it('returns A-equivalent at t=0 (no bloom at endpoints)', () => {
    const out = morphParams(A, B, 0)
    expect(out.speed).toBeCloseTo(A.speed, 10)
    expect(out.rings).toBeCloseTo(A.rings, 10)
    expect(out.cellBlur).toBeCloseTo(A.cellBlur, 10)
    expect(out.colorA).toBe(A.colorA)
    expect(out.patternA).toBe(A.patternA)
    expect(out.direction).toBe(A.direction)
    // hole is now categorical — at t=0 it should equal A's value
    expect(out.hole).toBe(A.hole)
  })

  it('returns B-equivalent at t=1 (no bloom at endpoints)', () => {
    const out = morphParams(A, B, 1)
    expect(out.speed).toBeCloseTo(B.speed, 10)
    expect(out.rings).toBeCloseTo(B.rings, 10)
    expect(out.cellBlur).toBeCloseTo(B.cellBlur, 10)
    expect(out.patternA).toBe(B.patternA)
    expect(out.direction).toBe(B.direction)
    expect(out.hole).toBe(B.hole)
  })

  it('snaps categorical fields at midpoint (t=0.49 = A, t=0.51 = B)', () => {
    const before = morphParams(A, B, 0.49)
    expect(before.patternA).toBe(A.patternA)
    expect(before.patternB).toBe(A.patternB)
    expect(before.direction).toBe(A.direction)
    expect(before.hole).toBe(A.hole)

    const after = morphParams(A, B, 0.51)
    expect(after.patternA).toBe(B.patternA)
    expect(after.patternB).toBe(B.patternB)
    expect(after.direction).toBe(B.direction)
    expect(after.hole).toBe(B.hole)
  })

  it('lerps scalars at midpoint and applies bloom only to cellBlur', () => {
    const out = morphParams(A, B, 0.5)
    // Scalar at t=0.5 is the midpoint.
    expect(out.speed).toBeCloseTo((A.speed + B.speed) / 2, 10)
    expect(out.rings).toBeCloseTo((A.rings + B.rings) / 2, 10)
    expect(out.density).toBeCloseTo((A.density + B.density) / 2, 10)
    // cellBlur at t=0.5 = lerp(A.cellBlur, B.cellBlur, 0.5) + 0.2.
    const lerped = (A.cellBlur + B.cellBlur) / 2
    expect(out.cellBlur).toBeCloseTo(lerped + 0.2, 10)
  })
})
