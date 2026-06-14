import type { OverlayLayer, ScaleMode } from './types'

// ─── expandLayerToInstances — pattern-space expansion helper ──────
// Takes a normalized OverlayLayer, returns an array of LayerInstance
// transforms the renderer iterates. The renderer then stamps the same
// shape/effect at each instance's offset.
//
// Mostly pure. The only impurity is `mirrorStage`'s use of
// `window.innerWidth/innerHeight` to size the side-by-side offset by
// vmin — this matches the existing OverlayStack convention of using
// window dims for tile sizing. We deliberately avoid plumbing a new
// `vmin` prop through the renderer for now; if test environments
// need to override this we can inject it later.
//
// Implemented modes: `single`, `massive`, `kaleido`, `mirrorStage`.
// Every other mode in `PatternMode` falls through to a single identity
// instance for now. Tasks 3–5 light up `radial`, `tileGrid`,
// `cloneCloud`, `tunnelRepeat`, `mandalaStack` using the same return
// shape, so the renderer wiring keeps working as new modes land.

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

    case 'kaleido': {
      // N-fold rotational symmetry. Each fold is a copy of the same
      // shape rotated by `i * 360/N`. Odd folds also flip on X so the
      // pattern reads as a true kaleidoscope reflection (alternating
      // chirality), not just a radial array of identical copies.
      const folds = Math.max(1, Math.round(layer.kaleidoFolds ?? 6))
      const step = 360 / folds
      const out: LayerInstance[] = []
      for (let i = 0; i < folds; i++) {
        out.push(
          single({
            rotation: i * step,
            phase: folds > 1 ? i / folds : 0,
            mirror: i % 2 === 1 ? 'x' : undefined,
          }),
        )
      }
      return out
    }

    case 'mirrorStage': {
      // Two side-by-side copies, second flipped on X. Spacing is in
      // fractions of vmin (matches the rest of the pattern-space
      // tunables). See the file header note re: window-dims usage.
      const vmin =
        typeof window !== 'undefined'
          ? Math.min(window.innerWidth, window.innerHeight)
          : 1000
      const dx = vmin * (layer.spacingX ?? 0.25)
      return [
        single({ dx: -dx, phase: 0 }),
        single({ dx: dx, phase: 0.5, mirror: 'x' }),
      ]
    }

    // Other modes added in Tasks 3–5. Until then, fall through to a
    // single identity instance so URLs that already carry these
    // modes still render something rather than crashing.
    default:
      return [single()]
  }
}
