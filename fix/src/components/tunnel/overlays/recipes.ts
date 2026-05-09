import { makeLayer, type OverlayLayer } from './types'

// ─── Layer recipes ────────────────────────────────────────────────
// One-click effect templates. Each recipe returns a fully-configured
// OverlayLayer (id + randomSeed minted fresh per click). The user
// can then re-seed shape, swap colors, or layer more on top.

export type Recipe = {
  id: string
  name: string
  description: string
  build: () => OverlayLayer
}

function withDefaults(asset: string, patch: Partial<OverlayLayer>): OverlayLayer {
  // Start from a shape layer for consistent defaults; type/asset/etc
  // are overridden via the patch.
  const base = makeLayer('shape', asset)
  return { ...base, ...patch }
}

export const RECIPES: Recipe[] = [
  {
    id: 'dna-mandala',
    name: 'DNA Mandala',
    description:
      'Six-fold mirrored layered helices with marching dashes — sacred temple-club hybrid.',
    build: () =>
      withDefaults('fx-wire-helix', {
        type: 'shape',
        asset: 'fx-wire-helix',
        fill: '#a4ff8a',
        blendMode: 'screen',
        scale: 1.1,
        glow: 22,
        wireMultiplier: 4,
        wireDensity: 1.6,
        wireDashLength: 6,
        wireStrokeWidth: 2,
        kaleidoscope: 6,
        wireDepthFog: true,
        wireDepthFogAmount: 0.55,
      }),
  },
  {
    id: 'octagon-portal',
    name: 'Octagon Portal',
    description:
      'Receding wireframe rings through an 8-fold lens — wormhole entrance.',
    build: () =>
      withDefaults('fx-wire-portal', {
        type: 'shape',
        asset: 'fx-wire-portal',
        fill: '#7dd3ff',
        blendMode: 'screen',
        scale: 1.2,
        glow: 32,
        wireDensity: 1.8,
        wireStrokeWidth: 1.8,
        kaleidoscope: 8,
        wireDepthFog: true,
        wireDepthFogAmount: 0.85,
      }),
  },
  {
    id: 'ghost-sphere',
    name: 'Ghost Sphere',
    description:
      'Translucent overlapping wireframe spheres ghost-trailing through their own rotation.',
    build: () =>
      withDefaults('fx-wire-sphere', {
        type: 'shape',
        asset: 'fx-wire-sphere',
        fill: '#ffffff',
        blendMode: 'overlay',
        opacity: 0.7,
        scale: 1.1,
        wireMultiplier: 3,
        wireDensity: 1.3,
        wireStrokeWidth: 1.2,
        wireTrailCount: 5,
        wireTrailDecay: 0.65,
        wireTrailBlur: 1.2,
        wireDepthFog: true,
        wireDepthFogAmount: 0.6,
      }),
  },
  {
    id: 'laser-shrine',
    name: 'Laser Shrine',
    description:
      'Hot-pink laser fan with 8-fold kaleidoscope mirror, color-cycling — concert visual.',
    build: () =>
      withDefaults('fx-laser-fan', {
        type: 'shape',
        asset: 'fx-laser-fan',
        fill: '#ff1f8a',
        blendMode: 'screen',
        glow: 24,
        scale: 1.0,
        kaleidoscope: 8,
        mirrorY: false,
        mirrorX: false,
        colorCycle: true,
        colorCycleSpeed: 0.8,
        colorCycleRange: 540,
      }),
  },
  {
    id: 'plasma-rosette',
    name: 'Plasma Rosette',
    description:
      'Browser-noise plasma kaleidoscoped 12-fold into a stained-glass mandala. Color cycles.',
    build: () =>
      withDefaults('fx-plasma', {
        type: 'shape',
        asset: 'fx-plasma',
        blendMode: 'screen',
        opacity: 0.85,
        kaleidoscope: 12,
        colorCycle: true,
        colorCycleSpeed: 0.6,
        colorCycleRange: 360,
      }),
  },
  {
    id: 'wire-bloom',
    name: 'Wire Bloom',
    description:
      'Glowing layered torus that breathes — quiet but mesmerizing.',
    build: () =>
      withDefaults('fx-wire-torus', {
        type: 'shape',
        asset: 'fx-wire-torus',
        fill: '#7dffea',
        blendMode: 'screen',
        glow: 36,
        scale: 1.05,
        wireMultiplier: 3,
        wireDensity: 1.6,
        wireStrokeWidth: 1.4,
        wireSpeed: 0.5,
        wireRotMix: 0.7,
        wireTrailCount: 3,
        wireTrailDecay: 0.55,
        wireDepthFog: true,
        wireDepthFogAmount: 0.5,
      }),
  },
  {
    id: 'signal-cage',
    name: 'Signal Cage',
    description:
      'Crisp dashed helix mirrored 4-fold — busted broadcast tower energy.',
    build: () =>
      withDefaults('fx-wire-helix', {
        type: 'shape',
        asset: 'fx-wire-helix',
        fill: '#ffe066',
        blendMode: 'screen',
        glow: 14,
        scale: 0.95,
        wireMultiplier: 1,
        wireDensity: 1.0,
        wireDashLength: 4,
        wireStrokeWidth: 2.4,
        kaleidoscope: 4,
        mirrorY: true,
        wireSpeed: 1.4,
      }),
  },
  {
    id: 'cathedral-grid',
    name: 'Cathedral Grid',
    description:
      'Dense wire portal with deep fog and 8-fold mirror — gothic infinite hall.',
    build: () =>
      withDefaults('fx-wire-portal', {
        type: 'shape',
        asset: 'fx-wire-portal',
        fill: '#e0d4ff',
        blendMode: 'screen',
        glow: 18,
        scale: 1.3,
        wireDensity: 2.0,
        wireStrokeWidth: 1.2,
        wireSpeed: 0.4,
        kaleidoscope: 8,
        wireDepthFog: true,
        wireDepthFogAmount: 1.0,
        wireTrailCount: 2,
        wireTrailDecay: 0.5,
      }),
  },
]
