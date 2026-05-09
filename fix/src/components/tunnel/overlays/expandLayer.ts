import type { OverlayLayer, ScaleMode } from './types'

// ─── expandLayerToInstances — pattern-space expansion helper ──────
// Pure function. Takes a normalized OverlayLayer, returns an array
// of LayerInstance transforms the renderer iterates. The renderer
// then stamps the same shape/effect at each instance's offset.
//
// `single` and `massive` are the only modes implemented in Task 1
// — every other mode in `PatternMode` falls through to a single
// identity instance for now. Tasks 2–5 add the remaining modes
// (kaleido, mirrorStage, radial, tileGrid, cloneCloud, tunnelRepeat,
// mandalaStack) using the same return shape, so the renderer wiring
// from Task 1 keeps working as new modes light up.

export type LayerInstance = {
  dx: number       // px offset from layer center (renderer scales as needed)
  dy: number
  dz?: number      // depth offset for wireframes (-1..1)
  scale: number    // multiplicative on top of layer.scale
  rotation: number // additive degrees on top of layer.rotation
  phase: number    // 0..1; consumed by motion / wireframe per-clone offsets
  opacity: number  // multiplicative on top of layer.opacity
  seedOffset?: number
  mirror?: 'x' | 'y'
}

const SCALE_MODE_MULT: Record<ScaleMode, number> = {
  tiny: 0.25,
  object: 1,
  poster: 2,
  architectural: 4,
  fullBleed: 6,
  beyondFrame: 9,
}

export function expandLayerToInstances(layer: OverlayLayer): LayerInstance[] {
  const scaleModeMult = SCALE_MODE_MULT[layer.scaleMode ?? 'object']
  const baseScale = scaleModeMult * (layer.patternScale ?? 1)

  const single = (over: Partial<LayerInstance> = {}): LayerInstance => ({
    dx: 0,
    dy: 0,
    scale: baseScale,
    rotation: 0,
    phase: 0,
    opacity: 1,
    ...over,
  })

  switch (layer.patternMode ?? 'single') {
    case 'single':
    case 'massive':
      return [single()]
    // Other modes added in Tasks 2–5. Until then, fall through to a
    // single identity instance so URLs that already carry these
    // modes still render something rather than crashing.
    default:
      return [single()]
  }
}
