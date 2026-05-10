import type { MaskId } from '../masks/maskAssets'
import type { TunnelParams } from '../../TunnelCanvas'
import type { Genre } from '../generator/generateLook'

// Re-export so consumers have a single import location for the
// overlay type surface (layers + their pattern-space instances).
export type { LayerInstance } from './expandLayer'

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

// ─── Pattern Space ────────────────────────────────────────────────
// A layer renders as N "instances" — copies stamped at computed
// transforms. `patternMode` picks the layout family; `scaleMode`
// scales every instance by a fixed multiplier so a layer can become
// a screen-filling field. See `expandLayer.ts` for the pure helper
// that turns a layer + these fields into a `LayerInstance[]`.
export type PatternMode =
  | 'single'
  | 'massive'
  | 'mirrorStage'
  | 'radial'
  | 'kaleido'
  | 'tileGrid'
  | 'tunnelRepeat'
  | 'cloneCloud'
  | 'mandalaStack'

export type ScaleMode =
  | 'tiny'         // 0.25x
  | 'object'       // 1.0x (default)
  | 'poster'       // 2.0x
  | 'architectural'// 4.0x
  | 'fullBleed'    // 6.0x
  | 'beyondFrame'  // 9.0x (intentional clip)

export type WireCloneMode = 'sameCenter' | 'radial' | 'depth' | 'grid' | 'cloud'

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
  // Wireframe-effect specific tunables (only read when the asset
  // dispatches to the Wireframe3D renderer). All optional with
  // sensible defaults; ignored by every other asset type.
  wireSpeed?: number         // 0..3 multiplier on rotation rate
  wireStrokeWidth?: number   // 0.5..6 px stroke thickness
  wirePerspective?: number   // 1.5..6 camera distance (lower = more 3D)
  wireRotMix?: number        // 0..1 — 0 = Y only, 1 = X+Y mix
  wireFreeze?: boolean       // pause the rotation loop
  wireMultiplier?: number    // 1..8 instances stamped at center with phase offset
  wireDensity?: number       // 0.5..2 mesh detail multiplier for parametric geoms
  wireDashLength?: number    // 0..20 stroke-dasharray length; 0 = solid
  // Trails: render previous N phases at fading opacity for "ghost"
  // motion. Wireframe-only for now.
  wireTrailCount?: number    // 0..8 trailing copies
  wireTrailDecay?: number    // 0.3..0.95 per-step opacity falloff
  wireTrailBlur?: number     // 0..8 px blur on trailing paths
  // Depth fog: bucket edges into front / mid / back by averaged Z
  // and assign decreasing alpha so 3D reads as depth, not flat
  // drafting. Wireframe-only.
  wireDepthFog?: boolean
  wireDepthFogAmount?: number // 0..1 blend strength
  // Layer-wide composition controls (effect AND non-effect layers).
  kaleidoscope?: number      // 1..12 fold rotational symmetry; 1 = off
  mirrorX?: boolean
  mirrorY?: boolean
  // Color cycle — animates `filter: hue-rotate()` on a nested wrapper
  // so it composes with the layer's static blur + drop-shadow filters.
  colorCycle?: boolean
  colorCycleSpeed?: number   // 0.1..3 cycles per ~10s baseline
  colorCycleRange?: number   // 0..720 deg sweep per cycle
  // Lock: when true, the OverlaysSection disables transform sliders
  // (X/Y/scale/rotation). Doesn't affect animation — see freeze for
  // that. Lets users compose without accidentally bumping a layer.
  locked?: boolean
  // ─── Pattern Space (see expandLayer.ts) ─────────────────────────
  // All optional with defaults applied at normalize-time so older
  // saved looks render identically. `patternMode` selects the layout
  // family the renderer expands into; the rest are tunables consumed
  // by `expandLayerToInstances`. `kaleidoFolds` supersedes the legacy
  // `kaleidoscope` field (migration normalizes the old one across).
  patternMode?: PatternMode          // default 'single'
  scaleMode?: ScaleMode              // default 'object'
  patternScale?: number              // 0.1–8.0, default 1
  repeatX?: number                   // 1–24
  repeatY?: number                   // 1–24
  radialCount?: number               // 1–64
  cloneCount?: number                // 1–128
  depthCount?: number                // 1–48
  spacingX?: number                  // 0–1 (fraction of vmin)
  spacingY?: number                  // 0–1
  depthSpacing?: number              // 0–1
  phaseSpread?: number               // 0–1
  rotationSpread?: number            // 0–360 deg
  scaleFalloff?: number              // 0–1 (0 = no falloff, 1 = aggressive)
  opacityFalloff?: number            // 0–1
  kaleidoFolds?: number              // 1–32 (replaces `kaleidoscope`)
  tileOffsetX?: number               // 0–1
  tileOffsetY?: number               // 0–1
  // Wireframe-only per-clone offsets (consumed by Wireframe3D once
  // Task 5 lands; stored on the schema today so URLs survive).
  wireCloneCount?: number            // 1–48
  wireCloneMode?: WireCloneMode      // default 'sameCenter'
  perClonePhaseOffset?: number       // 0–1
  perCloneRotationOffset?: number    // 0–360
  perCloneScaleFalloff?: number      // 0–1
  perCloneOpacityFalloff?: number    // 0–1
  perCloneDepthOffset?: number       // 0–1
  perCloneSeedOffset?: number        // 0–1
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

// Allowed string values for the new pattern-space enums.
const PATTERN_MODES: PatternMode[] = [
  'single',
  'massive',
  'mirrorStage',
  'radial',
  'kaleido',
  'tileGrid',
  'tunnelRepeat',
  'cloneCloud',
  'mandalaStack',
]
const SCALE_MODES: ScaleMode[] = [
  'tiny',
  'object',
  'poster',
  'architectural',
  'fullBleed',
  'beyondFrame',
]
const WIRE_CLONE_MODES: WireCloneMode[] = [
  'sameCenter',
  'radial',
  'depth',
  'grid',
  'cloud',
]

// Defensive runtime guard for hydrated/loaded layers — fills in any
// fields that may be missing on older saved looks. Also runs the
// pattern-space back-compat migration (legacy `kaleidoscope > 1` maps
// onto `patternMode='kaleido'`; type=tile maps onto `patternMode=
// 'tileGrid'`; everything else stays a `single` so existing visuals
// render identically).
export function normalizeLayer(input: any): OverlayLayer {
  const base: OverlayLayer = {
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

  // ─── Pattern-space back-compat migration ────────────────────────
  const num = (v: any, dflt: number): number =>
    typeof v === 'number' && Number.isFinite(v) ? v : dflt
  const incomingPatternMode: PatternMode | undefined =
    typeof input?.patternMode === 'string' &&
    PATTERN_MODES.includes(input.patternMode)
      ? input.patternMode
      : undefined
  const incomingScaleMode: ScaleMode | undefined =
    typeof input?.scaleMode === 'string' &&
    SCALE_MODES.includes(input.scaleMode)
      ? input.scaleMode
      : undefined
  const legacyKaleido = num(input?.kaleidoscope, 1)
  const legacyTileSpacing = num(input?.tileSpacing, BASE_DEFAULTS.tileSpacing)

  let patternMode: PatternMode
  let kaleidoFolds: number
  let repeatX: number
  let repeatY: number
  let spacingX: number
  let spacingY: number
  if (incomingPatternMode) {
    patternMode = incomingPatternMode
    kaleidoFolds = Math.max(1, num(input?.kaleidoFolds, legacyKaleido))
    repeatX = Math.max(1, num(input?.repeatX, 4))
    repeatY = Math.max(1, num(input?.repeatY, 4))
    spacingX = num(input?.spacingX, 0.18)
    spacingY = num(input?.spacingY, 0.18)
  } else if (legacyKaleido > 1) {
    patternMode = 'kaleido'
    kaleidoFolds = Math.max(1, legacyKaleido)
    repeatX = num(input?.repeatX, 4)
    repeatY = num(input?.repeatY, 4)
    spacingX = num(input?.spacingX, 0.18)
    spacingY = num(input?.spacingY, 0.18)
  } else if (base.type === 'tile') {
    patternMode = 'tileGrid'
    kaleidoFolds = Math.max(1, legacyKaleido)
    const derived = Math.round(1 / Math.max(legacyTileSpacing, 0.05))
    const clamped = Math.max(4, Math.min(16, derived))
    repeatX = num(input?.repeatX, clamped)
    repeatY = num(input?.repeatY, clamped)
    spacingX = num(input?.spacingX, legacyTileSpacing)
    spacingY = num(input?.spacingY, legacyTileSpacing)
  } else {
    patternMode = 'single'
    kaleidoFolds = Math.max(1, legacyKaleido)
    repeatX = num(input?.repeatX, 4)
    repeatY = num(input?.repeatY, 4)
    spacingX = num(input?.spacingX, 0.18)
    spacingY = num(input?.spacingY, 0.18)
  }

  return {
    ...base,
    patternMode,
    scaleMode: incomingScaleMode ?? 'object',
    patternScale: num(input?.patternScale, 1),
    repeatX,
    repeatY,
    radialCount: Math.max(1, num(input?.radialCount, 8)),
    cloneCount: Math.max(1, num(input?.cloneCount, 24)),
    depthCount: Math.max(1, num(input?.depthCount, 8)),
    spacingX,
    spacingY,
    depthSpacing: num(input?.depthSpacing, 0.12),
    phaseSpread: num(input?.phaseSpread, 0.5),
    rotationSpread: num(input?.rotationSpread, 0),
    scaleFalloff: num(input?.scaleFalloff, 0),
    opacityFalloff: num(input?.opacityFalloff, 0),
    kaleidoFolds,
    tileOffsetX: num(input?.tileOffsetX, 0),
    tileOffsetY: num(input?.tileOffsetY, 0),
    wireCloneCount: Math.max(1, num(input?.wireCloneCount, 1)),
    wireCloneMode:
      typeof input?.wireCloneMode === 'string' &&
      WIRE_CLONE_MODES.includes(input.wireCloneMode)
        ? input.wireCloneMode
        : 'sameCenter',
    perClonePhaseOffset: num(input?.perClonePhaseOffset, 0),
    perCloneRotationOffset: num(input?.perCloneRotationOffset, 0),
    perCloneScaleFalloff: num(input?.perCloneScaleFalloff, 0),
    perCloneOpacityFalloff: num(input?.perCloneOpacityFalloff, 0),
    perCloneDepthOffset: num(input?.perCloneDepthOffset, 0),
    perCloneSeedOffset: num(input?.perCloneSeedOffset, 0),
  }
}
