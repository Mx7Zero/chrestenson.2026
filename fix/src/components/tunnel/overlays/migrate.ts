import type { MaskState } from '../masks/maskState'
import { makeLayer, type OverlayLayer, type OverlayType, type OverlayMotion } from './types'

// ─── Migrate old single-mask state into a one-layer overlay stack ─
// Pre-2026-05-09 saves carried `mask: MaskState`. After the layer
// stack ships, those records still need to render the same way.
// This converts a MaskState into a single-element OverlayLayer[].
//
// `mode: 'off'` returns an empty array (nothing to render).
// 'silhouette' → 'shape' overlay
// 'cutout' → 'cutout' overlay
// 'lightLeak' → 'glow' overlay
// 'tile' (or legacy 'stencil') → 'tile' overlay

export function migrateMaskToLayers(mask: MaskState | undefined): OverlayLayer[] {
  if (!mask) return []
  const m: any = mask
  const mode: string = m.mode === 'stencil' ? 'tile' : m.mode === 'none' ? 'off' : m.mode
  if (mode === 'off') return []

  const type: OverlayType =
    mode === 'silhouette'
      ? 'shape'
      : mode === 'cutout'
      ? 'cutout'
      : mode === 'lightLeak'
      ? 'glow'
      : mode === 'tile'
      ? 'tile'
      : 'shape'

  const motion: OverlayMotion =
    m.motion === 'still' ? 'none' : (m.motion ?? 'none')

  const layer = makeLayer(type, m.asset ?? 'star')
  return [
    {
      ...layer,
      scale: typeof m.size === 'number' ? m.size : 1.0,
      rotation: typeof m.rotation === 'number' ? m.rotation : 0,
      blur: typeof m.softness === 'number' ? m.softness : 0,
      glow: typeof m.glow === 'number' ? m.glow : 28,
      invert: !!m.invert,
      fill:
        type === 'glow'
          ? '#ffffff'
          : m.invert
          ? '#ffffff'
          : '#000000',
      motion,
      motionSpeed: typeof m.motionSpeed === 'number' ? m.motionSpeed : 1,
      motionAmount: typeof m.motionAmount === 'number' ? m.motionAmount : 1,
    },
  ]
}
