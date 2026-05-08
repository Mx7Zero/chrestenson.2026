import type { TunnelParams } from '../TunnelCanvas'

// ─── Tunnel morph engine ──────────────────────────────────────────
// Pure-TS, no React. Same primitive powers preset clicks (600ms) and
// the DEMO button (8000ms cycling through presets in the active tab).
//
// Field categories:
//   • SCALAR_KEYS — straight linear interpolation.
//   • COLOR_KEYS — RGB→HSL→shortest-path-hue lerp→RGB to keep saturation
//     high through midpoints (red→green passes through yellow, not gray).
//   • CATEGORICAL_KEYS — snap at t=0.5. Hidden visually by the cellBlur
//     bloom curve which peaks at the same instant.
//
// Notable deviation from the chunk plan: `hole` is categorical, not
// scalar. Lerping it triggers per-frame `CylinderGeometry` rebuild
// (76800-vertex alloc/dispose every frame) — see chunk 1 audit. Snapping
// at midpoint hides the geometry swap inside the bloom bloom flash.

const SCALAR_KEYS = [
  'speed',
  'roll',
  'fov',
  'fogFar',
  'wobble',
  'density',
  'rings',
  'helix',
  'wave',
  'bend',
  'cellBlur',
  'strobeRate',
  'strobeDuty',
  'kaleidoscope',
  'chromatic',
  'hueShift',
] as const satisfies readonly (keyof TunnelParams)[]

const COLOR_KEYS = [
  'colorA',
  'colorB',
  'strobeColor',
] as const satisfies readonly (keyof TunnelParams)[]

// hole is categorical — lerping it triggers per-frame geometry rebuild. Snap instead.
const CATEGORICAL_KEYS = [
  'patternA',
  'patternB',
  'imageA',
  'imageB',
  'direction',
  'bendDir',
  'transparentCell',
  'strobeMode',
  'strobeTarget',
  'hole',
] as const satisfies readonly (keyof TunnelParams)[]

// ─── Scalar lerp ──────────────────────────────────────────────────
// Intentionally unclamped. The bloom math leans on extrapolation
// (cellBlur = lerped + bloom can exceed the target during the morph).
export function lerpScalar(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ─── Bloom curve ──────────────────────────────────────────────────
// sin²(πt) — 0 at t=0 and t=1, peak at t=0.5. Multiplied onto cellBlur
// during the morph so the categorical snap at t=0.5 is masked by a
// brief blur flash. Default peak 0.2 is calibrated to be visible
// without obliterating the cell pattern.
export function bloomCurve(t: number, peak = 0.2): number {
  const s = Math.sin(Math.PI * t)
  return peak * s * s
}

// ─── HSL color lerp ──────────────────────────────────────────────
// Hue takes the shortest angular path; saturation and lightness are
// linear. Round-tripped through hex so callers can drop the result
// straight back into a `colorA: '#…'` field.
export function lerpHSL(aHex: string, bHex: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(aHex)
  const [r2, g2, b2] = hexToRgb(bHex)
  const [h1, s1, l1] = rgbToHsl(r1, g1, b1)
  const [h2, s2, l2] = rgbToHsl(r2, g2, b2)

  // Shortest-path hue lerp. ((h2 - h1 + 540) % 360) - 180 gives a
  // signed delta in (-180, +180].
  const dh = ((h2 - h1 + 540) % 360) - 180
  let h = h1 + dh * t
  // Wrap into [0, 360).
  h = ((h % 360) + 360) % 360

  const s = s1 + (s2 - s1) * t
  const l = l1 + (l2 - l1) * t

  const [r, g, b] = hslToRgb(h, s, l)
  return rgbToHex(r, g, b)
}

// ─── morphParams ──────────────────────────────────────────────────
// Lerp scalars, lerp colors, snap categoricals at midpoint. cellBlur
// gets the bloom term added on top. At t=0 the result equals `from`;
// at t=1 it equals `to` (bloom is 0 at both endpoints).
export function morphParams(
  from: TunnelParams,
  to: TunnelParams,
  t: number,
): TunnelParams {
  const out = { ...from }
  for (const k of SCALAR_KEYS) {
    ;(out as Record<string, unknown>)[k] = lerpScalar(
      from[k] as number,
      to[k] as number,
      t,
    )
  }
  for (const k of COLOR_KEYS) {
    ;(out as Record<string, unknown>)[k] = lerpHSL(
      from[k] as string,
      to[k] as string,
      t,
    )
  }
  for (const k of CATEGORICAL_KEYS) {
    ;(out as Record<string, unknown>)[k] = t < 0.5 ? from[k] : to[k]
  }
  // Bloom on top of lerped cellBlur. sin² → 0 at endpoints so the
  // morph still terminates at exactly `to.cellBlur`.
  out.cellBlur = lerpScalar(from.cellBlur, to.cellBlur, t) + bloomCurve(t, 0.2)
  return out
}

// ─── RGB ↔ HSL ↔ hex helpers (private) ────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '')
  const full =
    m.length === 3
      ? m
          .split('')
          .map((c) => c + c)
          .join('')
      : m
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (x: number) => Math.max(0, Math.min(255, Math.round(x)))
  const hh = (x: number) => clamp(x).toString(16).padStart(2, '0')
  return `#${hh(r)}${hh(g)}${hh(b)}`
}

// rgbToHsl: hue 0..360, saturation/lightness 0..1.
function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2

  if (max === min) return [0, 0, l] // achromatic

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h: number
  switch (max) {
    case rn:
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60
      break
    case gn:
      h = ((bn - rn) / d + 2) * 60
      break
    default:
      h = ((rn - gn) / d + 4) * 60
      break
  }
  return [h, s, l]
}

// hslToRgb: hue 0..360, saturation/lightness 0..1, output 0..255.
function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  if (s === 0) {
    const v = l * 255
    return [v, v, v]
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const hk = h / 360
  const t = (offset: number) => {
    let x = hk + offset
    if (x < 0) x += 1
    if (x > 1) x -= 1
    if (x < 1 / 6) return p + (q - p) * 6 * x
    if (x < 1 / 2) return q
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6
    return p
  }
  return [t(1 / 3) * 255, t(0) * 255, t(-1 / 3) * 255]
}
