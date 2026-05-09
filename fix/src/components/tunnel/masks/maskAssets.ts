// ─── Mask assets ──────────────────────────────────────────────────
// V1 mask shapes for the silhouette/cutout/lightLeak overlay. Stored
// as path data strings rather than separate /public SVG files so the
// renderer doesn't pay a network round-trip per mask change. Each
// shape is normalized to a 100×100 viewBox so size/rotation controls
// transform uniformly.
//
// Shape authoring rules:
//   • Use a single `<path d>` per asset (composite shapes welcome).
//   • Path is filled with the active fill color at render time, so
//     don't bake fills/strokes into the data.
//   • Center the shape inside [10..90, 10..90] so a 1.0× size leaves
//     a small margin for glow/blur softness without clipping.

export type MaskId =
  | 'circle'
  | 'star'
  | 'hex'
  | 'cross'
  | 'triangle'
  | 'diamond'
  | 'flower'
  | 'mandala'
  | 'eye'
  | 'crescent'

export type MaskAsset = {
  id: MaskId
  name: string
  // 100×100 by convention. Left as a string so authors can use any
  // viewBox if a future shape needs it.
  viewBox: string
  d: string
}

export const MASKS: MaskAsset[] = [
  {
    id: 'circle',
    name: 'Circle',
    viewBox: '0 0 100 100',
    d: 'M 50 5 a 45 45 0 1 0 0.001 0 z',
  },
  {
    id: 'star',
    name: 'Star',
    viewBox: '0 0 100 100',
    d: 'M50 5 L61 38 95 38 68 58 78 92 50 72 22 92 32 58 5 38 39 38 z',
  },
  {
    id: 'hex',
    name: 'Hex',
    viewBox: '0 0 100 100',
    d: 'M50 5 L93 27 93 73 50 95 7 73 7 27 z',
  },
  {
    id: 'cross',
    name: 'Cross',
    viewBox: '0 0 100 100',
    d: 'M40 10 L60 10 60 40 90 40 90 60 60 60 60 90 40 90 40 60 10 60 10 40 40 40 z',
  },
  {
    id: 'triangle',
    name: 'Triangle',
    viewBox: '0 0 100 100',
    d: 'M50 8 L92 88 8 88 z',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    viewBox: '0 0 100 100',
    d: 'M50 5 L95 50 50 95 5 50 z',
  },
  {
    // Six-petal "Seed of Life" rosette — six circles around a center
    // circle, all r=18, centers 60° apart at distance 18 from center.
    id: 'flower',
    name: 'Flower',
    viewBox: '0 0 100 100',
    d: [
      'M50 32 a 18 18 0 1 0 0.001 0 z', // top
      'M65.59 41 a 18 18 0 1 0 0.001 0 z', // upper-right
      'M65.59 59 a 18 18 0 1 0 0.001 0 z', // lower-right
      'M50 68 a 18 18 0 1 0 0.001 0 z', // bottom
      'M34.41 59 a 18 18 0 1 0 0.001 0 z', // lower-left
      'M34.41 41 a 18 18 0 1 0 0.001 0 z', // upper-left
      'M50 50 m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0 z', // center
    ].join(' '),
  },
  {
    // Concentric ring mandala — three rings.
    id: 'mandala',
    name: 'Mandala',
    viewBox: '0 0 100 100',
    d: [
      // Outer ring (annulus = outer - inner using even-odd later)
      'M50 8 a 42 42 0 1 0 0.001 0 z',
      'M50 16 a 34 34 0 1 1 -0.001 0 z',
      // Middle ring
      'M50 26 a 24 24 0 1 0 0.001 0 z',
      'M50 32 a 18 18 0 1 1 -0.001 0 z',
      // Inner dot
      'M50 42 a 8 8 0 1 0 0.001 0 z',
    ].join(' '),
  },
  {
    // Eye-of-providence: rounded almond + pupil
    id: 'eye',
    name: 'Eye',
    viewBox: '0 0 100 100',
    d: [
      'M5 50 Q 50 8 95 50 Q 50 92 5 50 z',
      'M50 35 a 15 15 0 1 1 -0.001 0 z',
    ].join(' '),
  },
  {
    // Crescent moon — outer circle minus offset inner circle
    id: 'crescent',
    name: 'Crescent',
    viewBox: '0 0 100 100',
    d: [
      'M50 8 a 42 42 0 1 0 0.001 0 z',
      'M62 8 a 42 42 0 1 1 -0.001 0 z',
    ].join(' '),
  },
]

export const DEFAULT_MASK_ID: MaskId = 'star'

export function findMask(id: MaskId): MaskAsset {
  return MASKS.find((m) => m.id === id) ?? MASKS[0]
}
