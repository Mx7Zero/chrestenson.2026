import type { TabId } from './presets'
import type { PatternName } from '../TunnelCanvas'

// ─── Vibe constraints — chunk 8 ───────────────────────────────────
// Each tab carries a `VibeConstraint` describing the sampling
// envelope for ⟲ VARIATION. Ranges are derived by inspecting the 12
// hand-tuned presets per tab (see `presets.ts`), taking the min/max
// of each field, then widening by ~20% (10% on each side) so the
// sampler can wander a touch beyond the authored corpus without
// drifting into a different tab's vibe. Discrete fields snap to
// authored values; categorical fields snap to even/null where the
// engine demands it.
//
// Shape constraints encoded here:
//   • `kaleidoRange`         → [0, 16]  (engine cap)
//   • `strobeRateRange`      → [0, 0]   for non-strobe tabs
//                               positive lower bound for RAVE so
//                               every variation is actually a strobe
//   • `densityRange`         → sampler clamps to even-min-2 (engine
//                               artifact: odd density misaligns cells)
//
// `paletteOptions` are 6 representative palettes per tab lifted
// directly from the authored corpus — same hex pairs, same names —
// so variations stay on-brand. `patternOptions` enumerate the
// pattern set the tab actually exercises (CHROMA = `[null]` only,
// KALEIDO = handed mirror patterns, etc).

export type VibePalette = {
  colorA: string
  colorB: string
  name: string
}

export type VibeConstraint = {
  paletteOptions: VibePalette[] // ~6 per tab
  patternOptions: (PatternName | null)[]
  speedRange: [number, number]
  kaleidoRange: [number, number]
  helixRange: [number, number]
  chromaRange: [number, number]
  hueShiftRange: [number, number]
  strobeRateRange: [number, number]
  cellBlurRange: [number, number]
  rollRange: [number, number]
  ringsRange: [number, number]
  densityRange: [number, number]
}

// ─── SIGNATURE ────────────────────────────────────────────────────
// Lobby vibe. Light kaleido on a few presets (max 6). Minimal
// chromatic / hueShift. No strobe. Speed up to 0.1 but a few
// presets sit at the speed default (0); we floor at 0.005 so a
// variation always reads as motion.
const SIGNATURE: VibeConstraint = {
  paletteOptions: [
    { colorA: '#ffffff', colorB: '#000000', name: 'Bone/Ink' },
    { colorA: '#f4f4ee', colorB: '#1a1a1a', name: 'Pearl/Charcoal' },
    { colorA: '#00ff41', colorB: '#050a05', name: 'Phosphor/Ink' },
    { colorA: '#fff2c2', colorB: '#2c3340', name: 'Cream/Slate' },
    { colorA: '#dde4ec', colorB: '#36465a', name: 'Mist/Steel' },
    { colorA: '#f6efdc', colorB: '#0e3a8a', name: 'Cream/Cobalt' },
  ],
  patternOptions: [null, 'checker', 'dots', 'dot', 'hlines', 'vlines', 'grid', 'gradient', 'spiral', 'cross', 'diamond'],
  speedRange: [0.005, 0.12],
  kaleidoRange: [0, 8],
  helixRange: [0, 3.5],
  chromaRange: [0, 0.1],
  hueShiftRange: [0, 0.4],
  strobeRateRange: [0, 0],
  cellBlurRange: [0, 0.15],
  rollRange: [0, 2.4],
  ringsRange: [2, 30],
  densityRange: [2, 30],
}

// ─── PSYCHEDELIC ──────────────────────────────────────────────────
// Heavy fractal/marble/noise. Chromatic 0.18-0.5. HueShift 0.7-2.0.
// No strobe.
const PSYCHEDELIC: VibeConstraint = {
  paletteOptions: [
    { colorA: '#ff1a00', colorB: '#ffcc00', name: 'Lava/Sun' },
    { colorA: '#ff1493', colorB: '#1a0040', name: 'Magenta/Indigo' },
    { colorA: '#00e5ff', colorB: '#2d1b4e', name: 'Cyan/Twilight' },
    { colorA: '#ffb000', colorB: '#5a2eb0', name: 'Saffron/Violet' },
    { colorA: '#aaff00', colorB: '#ff00cc', name: 'Lime/Magenta' },
    { colorA: '#ff5577', colorB: '#00aabb', name: 'Coral/Teal' },
  ],
  patternOptions: ['fractal', 'marble', 'noise', null],
  speedRange: [0.018, 0.05],
  kaleidoRange: [0, 8],
  helixRange: [0, 0],
  chromaRange: [0.15, 0.55],
  hueShiftRange: [0.6, 2.2],
  strobeRateRange: [0, 0],
  cellBlurRange: [0, 0.4],
  rollRange: [0, 0.6],
  ringsRange: [2, 6],
  densityRange: [2, 14],
}

// ─── KALEIDO ──────────────────────────────────────────────────────
// Mirror geometry from 4-fold to 16-fold. Sharp pattern cells.
// No chromatic, no hueShift, no strobe.
const KALEIDO: VibeConstraint = {
  paletteOptions: [
    { colorA: '#1a3a8a', colorB: '#ffc844', name: 'Cobalt/Gold' },
    { colorA: '#ff5588', colorB: '#fff4dd', name: 'Rose/Cream' },
    { colorA: '#cc1133', colorB: '#1144aa', name: 'Ruby/Cobalt' },
    { colorA: '#f0f0e8', colorB: '#0e6b48', name: 'Pearl/Emerald' },
    { colorA: '#4a1a8a', colorB: '#ffd166', name: 'Violet/Gold' },
    { colorA: '#ee2288', colorB: '#aaffd0', name: 'Magenta/Mint' },
  ],
  patternOptions: ['diagonal', 'spiral', 'cross', 'fractal'],
  speedRange: [0.015, 0.036],
  kaleidoRange: [4, 16],
  helixRange: [0, 0],
  chromaRange: [0, 0],
  hueShiftRange: [0, 0],
  strobeRateRange: [0, 0],
  cellBlurRange: [0, 0.1],
  rollRange: [0, 0.7],
  ringsRange: [3, 14],
  densityRange: [4, 14],
}

// ─── COSMIC ───────────────────────────────────────────────────────
// Slow speed. Deep helix. Long fog feel. No strobe.
const COSMIC: VibeConstraint = {
  paletteOptions: [
    { colorA: '#1a0e3a', colorB: '#ffd700', name: 'Velvet/Gold' },
    { colorA: '#0a1240', colorB: '#a8c4ff', name: 'Indigo/Star' },
    { colorA: '#08080e', colorB: '#cc7799', name: 'Onyx/Lotus' },
    { colorA: '#0a1830', colorB: '#e8eef8', name: 'Navy/Pearl' },
    { colorA: '#0a0e2a', colorB: '#9adfff', name: 'Midnight/Ice' },
    { colorA: '#000000', colorB: '#ff8a00', name: 'Onyx/Solar' },
  ],
  patternOptions: ['radialGrad', 'spiral', 'gradient', 'marble', 'rings', 'cross', null],
  speedRange: [0.005, 0.028],
  kaleidoRange: [0, 8],
  helixRange: [0.5, 4.5],
  chromaRange: [0, 0],
  hueShiftRange: [0, 0.5],
  strobeRateRange: [0, 0],
  cellBlurRange: [0.08, 0.45],
  rollRange: [0, 0.7],
  ringsRange: [2, 22],
  densityRange: [2, 10],
}

// ─── RAVE ─────────────────────────────────────────────────────────
// strobeRate > 0 always. High-contrast neon palettes. flashWarn
// emerges at the AsteroidScene seam from `activeTab === 'rave'`.
const RAVE: VibeConstraint = {
  paletteOptions: [
    { colorA: '#ff1493', colorB: '#00e1ff', name: 'Hot Pink/Cyan' },
    { colorA: '#ff00aa', colorB: '#88ff00', name: 'Magenta/Lime' },
    { colorA: '#0044ff', colorB: '#ff0022', name: 'Cobalt/Crimson' },
    { colorA: '#5a00aa', colorB: '#aaff00', name: 'Violet/Acid' },
    { colorA: '#ffd200', colorB: '#cc0033', name: 'Solar/Crimson' },
    { colorA: '#aaff00', colorB: '#ff00cc', name: 'Acid Lime/Magenta' },
  ],
  patternOptions: ['checker', 'diamond', 'cross', 'diagonal', 'spiral', 'fractal', null],
  speedRange: [0.04, 0.1],
  kaleidoRange: [0, 10],
  helixRange: [0, 0],
  chromaRange: [0, 0.3],
  hueShiftRange: [0, 2.6],
  // Lower bound 2.0 keeps every RAVE variation legibly strobing
  // (under ~1.5 the strobe is hard to read as anything but flicker).
  strobeRateRange: [2, 8],
  cellBlurRange: [0, 0],
  rollRange: [0, 1.8],
  ringsRange: [4, 32],
  densityRange: [2, 14],
}

// ─── GLITCH ───────────────────────────────────────────────────────
// Heavy chromatic 0.4-0.8. Aggressive patterns. Mixed strobe (some
// presets sit at strobeRate=0). flashWarn at seam from activeTab.
const GLITCH: VibeConstraint = {
  paletteOptions: [
    { colorA: '#00ff41', colorB: '#000000', name: 'Phosphor/Black' },
    { colorA: '#00e0ff', colorB: '#ff00aa', name: 'Cyan/Magenta' },
    { colorA: '#ff2200', colorB: '#00eed0', name: 'Red/Aqua' },
    { colorA: '#aaff00', colorB: '#7733cc', name: 'Acid/Amethyst' },
    { colorA: '#080814', colorB: '#fff033', name: 'Ink/Lemon' },
    { colorA: '#1133aa', colorB: '#ff8866', name: 'Sapphire/Coral' },
  ],
  patternOptions: ['hlines', 'vlines', 'noise', 'grid', 'fractal', 'cross', 'gradient', 'checker', 'diagonal', null],
  speedRange: [0.04, 0.18],
  kaleidoRange: [0, 8],
  helixRange: [0, 0],
  chromaRange: [0.35, 0.9],
  hueShiftRange: [0, 2.0],
  strobeRateRange: [0, 6],
  cellBlurRange: [0, 0.25],
  rollRange: [0, 0],
  ringsRange: [3, 10],
  densityRange: [4, 18],
}

// ─── SACRED ───────────────────────────────────────────────────────
// Slow speed. High kaleidoscope (8-16). Diamond/cross/rings. Soft
// cellBlur. No strobe.
const SACRED: VibeConstraint = {
  paletteOptions: [
    { colorA: '#ffcc00', colorB: '#4a0e60', name: 'Gold/Velvet' },
    { colorA: '#ffd700', colorB: '#000000', name: 'Gold/Black' },
    { colorA: '#ffae00', colorB: '#0e2a8a', name: 'Solar/Cobalt' },
    { colorA: '#cc6633', colorB: '#552288', name: 'Copper/Violet' },
    { colorA: '#f4a020', colorB: '#0a5544', name: 'Saffron/Emerald' },
    { colorA: '#dd9a88', colorB: '#3a1844', name: 'Rose Gold/Plum' },
  ],
  patternOptions: ['diagonal', 'diamond', 'cross', 'rings', 'spiral', null],
  speedRange: [0.006, 0.024],
  kaleidoRange: [6, 16],
  helixRange: [0, 0],
  chromaRange: [0, 0],
  hueShiftRange: [0, 0.4],
  strobeRateRange: [0, 0],
  cellBlurRange: [0.08, 0.35],
  rollRange: [0, 0],
  ringsRange: [4, 18],
  densityRange: [4, 12],
}

// ─── CHROMA ───────────────────────────────────────────────────────
// Pure color motion. patternA/B = null on every preset. Heavy
// hueShift (1.0-3.0). Soft cellBlur. No strobe, no chromatic.
const CHROMA: VibeConstraint = {
  paletteOptions: [
    { colorA: '#ff2288', colorB: '#22ddee', name: 'Magenta/Cyan' },
    { colorA: '#3300aa', colorB: '#aaff00', name: 'Violet/Acid' },
    { colorA: '#f4a020', colorB: '#0a8aaa', name: 'Saffron/Sea' },
    { colorA: '#ff0088', colorB: '#1a0066', name: 'Hot Pink/Indigo' },
    { colorA: '#aae8c8', colorB: '#cca8e8', name: 'Mint/Lilac' },
    { colorA: '#22ccff', colorB: '#0044aa', name: 'Aqua/Sapphire' },
  ],
  patternOptions: [null],
  speedRange: [0.01, 0.04],
  kaleidoRange: [0, 10],
  helixRange: [0, 0],
  chromaRange: [0, 0],
  hueShiftRange: [0.8, 3.5],
  strobeRateRange: [0, 0],
  cellBlurRange: [0.3, 0.55],
  rollRange: [0, 0],
  ringsRange: [2, 10],
  densityRange: [4, 10],
}

export const VIBES: Record<Exclude<TabId, 'myset'>, VibeConstraint> = {
  signature: SIGNATURE,
  psychedelic: PSYCHEDELIC,
  kaleido: KALEIDO,
  cosmic: COSMIC,
  rave: RAVE,
  glitch: GLITCH,
  sacred: SACRED,
  chroma: CHROMA,
}
