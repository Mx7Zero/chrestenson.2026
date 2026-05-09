import type { TunnelParams } from '../TunnelCanvas'

// ─── Auto-chip derivation ─────────────────────────────────────────
// Chunk 6 — given a fully-resolved `TunnelParams` (defaults merged
// with the active preset's `values`) and the hand-authored
// `paletteName`, return a short list of chip labels for the tile and
// now-playing line.
//
// The chip rules are deliberately rough — we want chips to read like
// engine capabilities ("Kaleido 12x", "Hue Drift", "Chromatic Split"),
// not exact parameter readouts. Auto-derived chips are sorted by
// descending priority and capped to `max - 1`; `paletteName` is then
// appended as the closing chip.
//
// paletteName is ALWAYS the last chip, even when no rules fire.

type Rule = {
  test: (p: TunnelParams) => boolean
  chip: (p: TunnelParams) => string
  priority: number
}

const RULES: Rule[] = [
  {
    test: (p) => (p.kaleidoscope ?? 0) > 0,
    chip: (p) => `Kaleido ${Math.round(p.kaleidoscope!)}x`,
    priority: 100,
  },
  {
    test: (p) => (p.strobeRate ?? 0) > 0,
    chip: (p) => `Pulse ${p.strobeRate!.toFixed(1)}/s`,
    priority: 95,
  },
  {
    test: (p) => (p.chromatic ?? 0) > 0.05,
    chip: () => 'Chromatic Split',
    priority: 90,
  },
  {
    test: (p) => (p.hueShift ?? 0) > 0.05,
    chip: () => 'Hue Drift',
    priority: 85,
  },
  {
    test: (p) => (p.helix ?? 0) !== 0,
    chip: () => 'Helix Twist',
    priority: 80,
  },
  {
    test: (p) => (p.wave ?? 0) !== 0,
    chip: () => 'Wave',
    priority: 75,
  },
  {
    test: (p) => p.transparentCell !== 'none',
    chip: () => 'Transparent Cell',
    priority: 70,
  },
  {
    test: (p) => p.patternA === 'fractal' || p.patternB === 'fractal',
    chip: () => 'Fractal',
    priority: 65,
  },
  {
    test: (p) => p.patternA === 'marble' || p.patternB === 'marble',
    chip: () => 'Marble Flow',
    priority: 60,
  },
  {
    test: (p) => (p.cellBlur ?? 0) > 0.2,
    chip: () => 'Soft Cells',
    priority: 55,
  },
  {
    test: (p) => (p.bend ?? 0) !== 0,
    chip: () => 'Curved',
    priority: 50,
  },
]

export function deriveChips(
  resolved: TunnelParams,
  paletteName: string,
  max = 4,
): string[] {
  const matches = RULES
    .filter((r) => r.test(resolved))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.max(0, max - 1))
    .map((r) => r.chip(resolved))
  return [...matches, paletteName]
}
