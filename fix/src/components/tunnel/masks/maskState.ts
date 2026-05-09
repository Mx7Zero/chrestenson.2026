import type { MaskId } from './maskAssets'

// ─── Mask state ───────────────────────────────────────────────────
// Orthogonal to TunnelParams. Carried on TunnelLook so save/share/
// URL plumbing round-trips without touching the engine.
//
// `mode: 'off'` means the layer renders nothing. The MaskLayer
// component returns `null` in this state — no DOM artifacts.

export type MaskMode = 'off' | 'silhouette' | 'cutout' | 'lightLeak' | 'tile'

export type MaskMotion = 'still' | 'breathe' | 'spin' | 'drift' | 'pulse'

export type MaskState = {
  asset: MaskId
  mode: MaskMode
  // Visual dimensions of the shape, mapped through `shapeFraction`:
  //   0.2 → ~18vmin     (small)
  //   1.0 → ~58vmin     (default — clearly visible)
  //   2.0 → ~112vmin    (overflows viewport)
  size: number
  rotation: number   // degrees
  softness: number   // 0..40 px gaussian blur on the shape edge
  glow: number       // 0..40 stdDev gaussian halo for lightLeak
  invert: boolean
  motion: MaskMotion
  // Animation modulators. Speed scales animation-duration (1.0 =
  // baseline). Amount scales the keyframe range (1.0 = baseline).
  motionSpeed: number
  motionAmount: number
}

export const MASK_DEFAULTS: MaskState = {
  asset: 'star',
  mode: 'off',
  size: 1.0,
  rotation: 0,
  softness: 0,
  glow: 28,
  invert: false,
  motion: 'still',
  motionSpeed: 1.0,
  motionAmount: 1.0,
}

// Hot path predicate. AsteroidScene + MaskLayer both branch on this.
export function isMaskActive(m: MaskState): boolean {
  return m.mode !== 'off'
}

// Map size slider (0.2..2.0) to a fraction of vmin (= min container
// dimension) for the shape's effective width/height. Linear interp
// across the spec'd anchors: 0.2 → 0.18, 1.0 → 0.58, 2.0 → 1.12.
export function shapeFraction(size: number): number {
  return 0.18 + (size - 0.2) * ((1.12 - 0.18) / (2.0 - 0.2))
}
