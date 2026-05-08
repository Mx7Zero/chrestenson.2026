import type { TunnelParams } from '../TunnelCanvas'

// ─── Tab identifiers ──────────────────────────────────────────────
// `myset` is virtual — derived from favorites in chunk 10. All
// authored presets pin to one of the other tabs. For chunk 2 we
// migrate the existing 18 to `signature` and leave the other tabs
// empty until chunk 5 fills them.
export type TabId =
  | 'signature'
  | 'psychedelic'
  | 'kaleido'
  | 'cosmic'
  | 'rave'
  | 'glitch'
  | 'sacred'
  | 'chroma'
  | 'myset'

// ─── Tab order, labels, capability copy ───────────────────────────
// `TAB_ORDER` is the canonical left-to-right tab strip order
// (excluding `myset`, which only appears when the user has favorites
// — chunk 10). `TAB_LABELS` is the rendered tab text. `TAB_CAPABILITY_COPY`
// is the one-line description shown beneath the active tab in
// `PresetsPanel`. `FLASH_TABS` flags tabs that emit a ⚠ FLASH badge in
// the tab strip + capability line; chunks 9+ wire it into the actual
// flash gate.
export const TAB_ORDER: Exclude<TabId, 'myset'>[] = [
  'signature', 'psychedelic', 'kaleido', 'cosmic',
  'rave', 'glitch', 'sacred', 'chroma',
]

export const TAB_LABELS: Record<TabId, string> = {
  signature: 'SIGNATURE',
  psychedelic: 'PSYCHEDELIC',
  kaleido: 'KALEIDO',
  cosmic: 'COSMIC',
  rave: 'RAVE',
  glitch: 'GLITCH',
  sacred: 'SACRED',
  chroma: 'CHROMA',
  myset: 'MY SET',
}

export const TAB_CAPABILITY_COPY: Record<TabId, string> = {
  signature: "The instrument's anchor presets — broad strokes across every capability.",
  psychedelic: 'Liquid color, fractal drift, chromatic separation, hue-shift motion.',
  kaleido: 'Mirror geometry from 4-fold to 16-fold symmetry, sharp pattern cells.',
  cosmic: 'Deep palettes, slow helix twist, long fog depth, gentle wave.',
  rave: 'Strobe presets, high-contrast neon, pulse and rainbow modes.',
  glitch: 'Chromatic split, signal-collapse, invert-mode flash, broken pattern shifts.',
  sacred: 'Gold/jewel tones, slow rotation, diamond/cross/rings under heavy symmetry.',
  chroma: 'Pure color motion — continuous hue drift, no patterns, soft cell-blur.',
  myset: 'Your starred presets.',
}

export const FLASH_TABS: Set<TabId> = new Set(['rave', 'glitch'])

// ─── Preset shape ─────────────────────────────────────────────────
// The closing chip in the chip list will surface `paletteName`. All
// other chips are derived from `values` by the auto-chip rules in
// chunk 6, so authoring stays focused on the palette.
//
// `flashWarn` defaults to true for `tab === 'rave' | 'glitch'` in
// chunk 9; we leave it undefined here so chunks downstream can flip
// it without touching the migrated 18.
export type Preset = {
  id: string                          // `${tab}.${slug}`, kebab-case slug
  tab: Exclude<TabId, 'myset'>        // MY SET is virtual, derived from favorites
  name: string                        // 'Neon Cathedral'
  paletteName: string                 // 'Gold/Pearl' — closing chip in the chip list
  values: Partial<TunnelParams>
  flashWarn?: boolean                 // default true for tab === 'rave' | 'glitch'
}

// ─── User-facing presets ──────────────────────────────────────────
// Migrated from the inline `TUNNEL_PRESETS` const in TunnelCanvas.
// All 18 land under `tab: 'signature'` for chunk 2; chunk 5 will
// redistribute them across the other tabs as part of the 96-preset
// library. Slug is the lowercased name; palette name is hand-picked
// from the colorA/colorB pair (or "Pure Light" for default-color
// presets).
export const PRESETS: Preset[] = [
  {
    id: 'signature.sunburst',
    tab: 'signature',
    name: 'SUNBURST',
    paletteName: 'Bone/Ink',
    values: { rings: 30, density: 2, speed: 0.02, roll: 0.3 },
  },
  {
    id: 'signature.checker',
    tab: 'signature',
    name: 'CHECKER',
    paletteName: 'Bone/Ink',
    values: { rings: 4, density: 8, speed: 0.05, roll: 0 },
  },
  {
    id: 'signature.hypno',
    tab: 'signature',
    name: 'HYPNO',
    paletteName: 'Bone/Ink',
    values: { rings: 2, density: 60, speed: 0.1, roll: 0.8 },
  },
  {
    id: 'signature.vortex',
    tab: 'signature',
    name: 'VORTEX',
    paletteName: 'Bone/Ink',
    values: { rings: 20, density: 4, speed: 0.08, roll: 2, helix: 3 },
  },
  {
    id: 'signature.warp',
    tab: 'signature',
    name: 'WARP',
    paletteName: 'Bone/Ink',
    values: { rings: 8, density: 30, speed: 0.3, bend: 45, wobble: 1 },
  },
  {
    id: 'signature.retro',
    tab: 'signature',
    name: 'RETRO',
    paletteName: 'Hot Pink/Cyan',
    values: {
      rings: 6,
      density: 6,
      patternA: 'checker',
      patternB: 'checker',
      colorA: '#ff1493',
      colorB: '#00e1ff',
    },
  },
  {
    id: 'signature.dots',
    tab: 'signature',
    name: 'DOTS',
    paletteName: 'Bone/Ink',
    values: {
      rings: 4,
      density: 4,
      patternA: 'dots',
      patternB: 'dot',
      colorA: '#ffffff',
      colorB: '#000000',
    },
  },
  {
    id: 'signature.lines',
    tab: 'signature',
    name: 'LINES',
    paletteName: 'Bone/Ink',
    values: { rings: 10, density: 2, patternA: 'hlines', patternB: 'vlines' },
  },
  {
    id: 'signature.tribal',
    tab: 'signature',
    name: 'TRIBAL',
    paletteName: 'Gold/Velvet',
    values: {
      rings: 6,
      density: 6,
      patternA: 'diagonal',
      patternB: 'diagonal',
      colorA: '#ffcc00',
      colorB: '#4a0e60',
    },
  },
  {
    id: 'signature.deco',
    tab: 'signature',
    name: 'DECO',
    paletteName: 'Gold/Black',
    values: {
      rings: 4,
      density: 4,
      patternA: 'diamond',
      patternB: 'cross',
      colorA: '#ffd700',
      colorB: '#000000',
    },
  },
  {
    id: 'signature.julia',
    tab: 'signature',
    name: 'JULIA',
    paletteName: 'Ink/Cyan',
    values: {
      rings: 3,
      density: 4,
      patternA: 'fractal',
      patternB: 'fractal',
      colorA: '#000000',
      colorB: '#00e5ff',
      speed: 0.02,
    },
  },
  {
    id: 'signature.lava',
    tab: 'signature',
    name: 'LAVA',
    paletteName: 'Lava/Sun',
    values: {
      rings: 2,
      density: 2,
      patternA: 'marble',
      patternB: 'noise',
      colorA: '#ff1a00',
      colorB: '#ffcc00',
      speed: 0.03,
    },
  },
  {
    id: 'signature.zen',
    tab: 'signature',
    name: 'ZEN',
    paletteName: 'Pearl/Deep Sea',
    values: {
      rings: 6,
      density: 2,
      patternA: 'spiral',
      patternB: 'radialGrad',
      colorA: '#ffffff',
      colorB: '#0a1f2f',
      speed: 0.01,
      roll: 0.1,
    },
  },
  {
    id: 'signature.melt',
    tab: 'signature',
    name: 'MELT',
    paletteName: 'Hot Pink/Ink',
    values: {
      rings: 4,
      density: 4,
      cellBlur: 0.35,
      patternA: 'noise',
      patternB: null,
      colorA: '#ff1493',
      colorB: '#000000',
      speed: 0.04,
    },
  },
  {
    id: 'signature.cosmic',
    tab: 'signature',
    name: 'COSMIC',
    paletteName: 'Velvet/Gold',
    values: {
      rings: 3,
      density: 4,
      patternA: 'radialGrad',
      patternB: 'spiral',
      colorA: '#4a0e60',
      colorB: '#ffd700',
      cellBlur: 0.15,
      speed: 0.02,
    },
  },
  {
    id: 'signature.circuit',
    tab: 'signature',
    name: 'CIRCUIT',
    paletteName: 'Phosphor/Ink',
    values: {
      rings: 8,
      density: 8,
      patternA: 'grid',
      patternB: 'dot',
      colorA: '#00ff41',
      colorB: '#050a05',
      cellBlur: 0,
      speed: 0.03,
    },
  },
  {
    id: 'signature.dream',
    tab: 'signature',
    name: 'DREAM',
    paletteName: 'Cyan/Twilight',
    values: {
      rings: 2,
      density: 10,
      patternA: 'fractal',
      patternB: 'marble',
      colorA: '#00e5ff',
      colorB: '#2d1b4e',
      cellBlur: 0.25,
      speed: 0.015,
      roll: 0.5,
    },
  },
  {
    id: 'signature.void',
    tab: 'signature',
    name: 'VOID',
    paletteName: 'Pure Black',
    values: {
      rings: 20,
      density: 2,
      cellBlur: 0.4,
      colorA: '#000000',
      colorB: '#111111',
      speed: 0.08,
      roll: 1.5,
      helix: 2,
    },
  },
]

// ─── Dev-only validation presets ──────────────────────────────────
// Chunk 1.5 added these to pin a single new uniform at a visibly
// distinctive value while leaving everything else at SUNBURST
// baseline. They keep `tab: 'signature'` so the union namespace is
// stable, but the slugs preserve the `__validate-…` prefix so chunks
// 3+ can filter them out of user-facing tabs (recommended: hide
// behind a debug toggle, surface only via direct id reference).
//
// Filter rule for tab UIs: id.includes('.__validate-')
export const DEV_PRESETS: Preset[] = [
  {
    id: 'signature.__validate-kaleido',
    tab: 'signature',
    name: '__VALIDATE_KALEIDO',
    paletteName: 'Diag Yellow/Velvet',
    values: {
      rings: 6,
      density: 6,
      speed: 0.02,
      kaleidoscope: 8,
      patternA: 'diagonal',
      patternB: 'diagonal',
      colorA: '#ffcc00',
      colorB: '#4a0e60',
    },
  },
  {
    id: 'signature.__validate-chroma',
    tab: 'signature',
    name: '__VALIDATE_CHROMA',
    paletteName: 'White/Black Split',
    values: { rings: 30, density: 4, speed: 0.02, chromatic: 0.6 },
  },
  {
    id: 'signature.__validate-hue',
    tab: 'signature',
    name: '__VALIDATE_HUE',
    paletteName: 'White/Black Drift',
    values: { rings: 30, density: 4, speed: 0.02, hueShift: 1.5 },
  },
]
