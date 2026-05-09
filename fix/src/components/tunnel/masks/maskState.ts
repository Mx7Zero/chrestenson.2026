import type { MaskId } from './maskAssets'

// ─── Mask state ───────────────────────────────────────────────────
// Orthogonal to TunnelParams. Carried on TunnelLook so save/share/
// URL plumbing round-trips without touching the engine.
//
// `mode: 'none'` means the layer renders nothing — equivalent to no
// mask, but preserved on the look so the user's last-chosen asset
// stays in the dropdown when they toggle modes.

export type MaskMode = 'none' | 'silhouette' | 'cutout' | 'lightLeak' | 'stencil'

export type MaskMotion = 'still' | 'breathe' | 'spin' | 'drift' | 'pulse'

export type MaskState = {
  asset: MaskId
  mode: MaskMode
  size: number       // 0.2..2.0, multiplier on baseline (mask fills 60% of bird section)
  rotation: number   // degrees
  softness: number   // 0..40 px gaussian blur on the mask shape
  glow: number       // 0..40 px outer glow when mode === 'lightLeak'
  invert: boolean
  motion: MaskMotion
}

export const MASK_DEFAULTS: MaskState = {
  asset: 'star',
  mode: 'none',
  size: 1.0,
  rotation: 0,
  softness: 0,
  glow: 12,
  invert: false,
  motion: 'still',
}

// Detect "no-op" mask state. AsteroidScene skips rendering MaskLayer
// when this is true to avoid an empty stacking context.
export function isMaskActive(m: MaskState): boolean {
  return m.mode !== 'none'
}
