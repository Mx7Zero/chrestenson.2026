import type { MaskId } from '../masks/maskAssets'
import type { TunnelParams } from '../../TunnelCanvas'
import type { Genre } from '../generator/generateLook'

// ─── Overlay Layers ───────────────────────────────────────────────
// Photoshop-style stack above the tunnel canvas. Each layer is an
// SVG-driven visual element with its own type (shape/cutout/glow/
// tile), transform, blend mode, animation, and visibility flag.
//
// First-in-array = bottom of stack; last = top. The stack renderer
// (OverlayStack) preserves array order so reordering in the UI is a
// pure data-array operation.

export type OverlayType = 'shape' | 'cutout' | 'glow' | 'tile'

export type OverlayBlend =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'difference'
  | 'exclusion'
  | 'color-dodge'
  | 'color-burn'
  | 'luminosity'

export type OverlayMotion =
  | 'none'
  | 'breathe'
  | 'spin'
  | 'drift'
  | 'pulse'
  | 'orbit'
  | 'shake'
  | 'flicker'

// Pulse target — what attribute the pulse animation modulates.
// Pass-2 work: route pulse to source-tunnel speed/hue/strobe etc.
export type PulseTarget =
  | 'scale'
  | 'opacity'
  | 'glow'
  | 'blur'
  | 'sourceSpeed'

// ─── Audio modulation (data model only — Pass 2 wires real audio) ─
// Each layer can carry zero or more AudioMod entries. At render time,
// stem levels (0..1) modulate the layer's render values per the
// `target` field. For Pass 1 this ships as a stable data shape so
// save/share preserves it; the render combiner stays a no-op until
// audio integration lands.
export type StemId =
  | 'kick'
  | 'snare'
  | 'hats'
  | 'bass'
  | 'lead'
  | 'vocal'
  | 'pads'
  | 'fx'
  | 'master'

export type AudioModTarget =
  | 'opacity'
  | 'scale'
  | 'rotation'
  | 'x'
  | 'y'
  | 'glow'
  | 'blur'
  | 'blendAmount'
  | 'sourceSpeed'
  | 'sourceHueShift'
  | 'sourceChromatic'
  | 'sourceKaleidoscope'
  | 'sourceStrobeRate'

export type AudioMod = {
  id: string
  stem: StemId
  target: AudioModTarget
  amount: number      // -2..2 — multiplier on the stem level applied to target
  smoothing: number   // 0..1 — exponential smoothing on stem level
  threshold: number   // 0..1 — gate: stem level below this counts as 0
  attack: number      // ms — rise time
  release: number     // ms — fall time
  invert?: boolean
}

// Source determines what paints inside the layer's SVG matte:
//   • solid              — SVG path filled with `fill` (current behavior)
//   • independentTunnel  — a second TunnelCanvas with its own params,
//                          clipped to the SVG shape via CSS mask
// Future: 'baseTunnel' (clip the live engine's tunnel) and 'image'.
export type OverlaySource = 'solid' | 'independentTunnel'

export type OverlayLayer = {
  id: string
  type: OverlayType
  asset: MaskId
  visible: boolean
  // Position offset in normalized viewport coords. -1 = left/top,
  // 0 = center, 1 = right/bottom edge. Tile mode ignores x/y.
  x: number
  y: number
  // Size as a fraction of vmin. Same mapping as the old shapeFraction:
  //   0.2 → ~18% vmin · 1.0 → ~58% vmin · 2.0 → ~112% vmin
  scale: number
  rotation: number
  opacity: number
  fill: string
  stroke: string
  strokeWidth: number
  blendMode: OverlayBlend
  blur: number
  glow: number
  invert: boolean
  // Tile-specific spacing (fraction of vmin). Ignored for other
  // types but kept on every layer so type-switches don't lose state.
  tileSpacing: number
  motion: OverlayMotion
  motionSpeed: number
  motionAmount: number
  motionPhase: number       // 0..1 cycle offset added to per-seed phase
  motionRandomness: number  // 0..1 jitter intensity for shake/flicker
  randomSeed: number        // deterministic phase + jitter source
  orbitRadius: number       // % viewport for orbit motion
  pulseTarget: PulseTarget
  solo: boolean             // when any layer is solo, only solo layers render
  audioMods?: AudioMod[]    // Pass-2 render combiner reads this
  // For procedural assets: feeds the generator. Re-seed for a fresh
  // variation in the same family. Static assets ignore this.
  assetSeed?: number
  // Visual source pipeline — see `OverlaySource` notes above.
  source: OverlaySource
  // Independent tunnel params + seed + genre + recipe version.
  // Populated by the "Generate Source" / "Copy Base" actions in
  // OverlaysSection. If `source === 'independentTunnel'` but
  // `sourceParams` is undefined, the renderer DOES NOT mount a
  // TunnelCanvas — the layer is visually inert until the user
  // generates or copies a source. This is intentional: the overlay
  // must never silently mirror the base tunnel.
  sourceParams?: Partial<TunnelParams>
  sourceSeed?: number
  sourceGenre?: Genre
  sourceRecipeVersion?: number
  sourceName?: string  // human-readable label, optional
}

// Defaults used by the layer factory. Per-type overrides applied in
// `makeLayer` so a fresh `glow` layer uses screen blend, etc.
const BASE_DEFAULTS: Omit<OverlayLayer, 'id' | 'type' | 'asset' | 'randomSeed'> = {
  visible: true,
  x: 0,
  y: 0,
  scale: 1.0,
  rotation: 0,
  opacity: 1,
  fill: '#000000',
  stroke: '#ffffff',
  strokeWidth: 2,
  blendMode: 'normal',
  blur: 0,
  glow: 28,
  invert: false,
  tileSpacing: 0.12,
  motion: 'none',
  motionSpeed: 1,
  motionAmount: 1,
  motionPhase: 0,
  motionRandomness: 0,
  orbitRadius: 0.18,
  pulseTarget: 'scale',
  solo: false,
  audioMods: [],
  source: 'solid',
}

// Deterministic phase seed — same number → same per-frame phase.
// Pass-2 render combiner uses this to keep motion reproducible.
function newRandomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0
}

let _idCounter = 0
export function newLayerId(): string {
  return `ol-${Date.now().toString(36)}-${(_idCounter++).toString(36)}`
}

export function makeLayer(
  type: OverlayType,
  asset: MaskId = 'star',
): OverlayLayer {
  // Per-type tweaks: glow defaults to white-on-screen-blend so the
  // first-add looks like a glow (otherwise users see a black blob).
  const typeOverrides: Partial<OverlayLayer> =
    type === 'glow'
      ? { fill: '#ffffff', stroke: '#ffffff', blendMode: 'screen' }
      : type === 'cutout'
      ? { fill: '#000000' }
      : type === 'tile'
      ? { fill: '#000000' }
      : { fill: '#000000' }
  return {
    ...BASE_DEFAULTS,
    ...typeOverrides,
    id: newLayerId(),
    type,
    asset,
    randomSeed: newRandomSeed(),
  }
}

export const BLEND_MODES: OverlayBlend[] = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'soft-light',
  'hard-light',
  'difference',
  'exclusion',
  'color-dodge',
  'color-burn',
  'luminosity',
]

export const MOTION_TYPES: OverlayMotion[] = [
  'none',
  'breathe',
  'spin',
  'drift',
  'pulse',
  'orbit',
  'shake',
  'flicker',
]

export const PULSE_TARGETS: PulseTarget[] = [
  'scale',
  'opacity',
  'glow',
  'blur',
  'sourceSpeed',
]

export const OVERLAY_TYPES: OverlayType[] = [
  'shape',
  'cutout',
  'glow',
  'tile',
]

// Map size slider (0.2..2.0) to fraction of vmin for shape size.
export function scaleFraction(scale: number): number {
  return 0.18 + (scale - 0.2) * ((1.12 - 0.18) / (2.0 - 0.2))
}

// Defensive runtime guard for hydrated/loaded layers — fills in any
// fields that may be missing on older saved looks.
export function normalizeLayer(input: any): OverlayLayer {
  return {
    ...BASE_DEFAULTS,
    ...input,
    id: typeof input?.id === 'string' ? input.id : newLayerId(),
    type: OVERLAY_TYPES.includes(input?.type) ? input.type : 'shape',
    asset: typeof input?.asset === 'string' ? input.asset : 'star',
    visible: input?.visible !== false,
    randomSeed:
      typeof input?.randomSeed === 'number' ? input.randomSeed : newRandomSeed(),
    motionPhase: typeof input?.motionPhase === 'number' ? input.motionPhase : 0,
    motionRandomness:
      typeof input?.motionRandomness === 'number' ? input.motionRandomness : 0,
    orbitRadius:
      typeof input?.orbitRadius === 'number' ? input.orbitRadius : 0.18,
    pulseTarget:
      input?.pulseTarget === 'opacity' ||
      input?.pulseTarget === 'glow' ||
      input?.pulseTarget === 'blur' ||
      input?.pulseTarget === 'sourceSpeed'
        ? input.pulseTarget
        : 'scale',
    solo: input?.solo === true,
    audioMods: Array.isArray(input?.audioMods) ? input.audioMods : [],
    source:
      input?.source === 'independentTunnel' ? 'independentTunnel' : 'solid',
    assetSeed:
      typeof input?.assetSeed === 'number' ? input.assetSeed : undefined,
  }
}
