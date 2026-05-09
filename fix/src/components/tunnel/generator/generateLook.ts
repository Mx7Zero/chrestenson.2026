import type { TunnelParams } from '../../TunnelCanvas'
import type { TabId, Preset } from '../presets'
import { VIBES } from '../vibes'
import { sampleVariation } from '../sampler'
import { mulberry32 } from './rng'
import { generateName } from './names'
import type { MaskState } from '../masks/maskState'

// ─── generateLook ─────────────────────────────────────────────────
// Deterministic genre-constrained generator. Same (genre, seed,
// recipeVersion) → same Preset every time. Wraps the existing
// `sampleVariation` (which already knows how to walk a VibeConstraint
// envelope) and the existing `VIBES` constraint pack so authoring
// stays in one place.
//
// Output is a `Preset` so the engine's existing `applyPreset` /
// morph / transport-bar plumbing accepts it without modification.
// The fields beyond `Preset` (seed, recipeVersion, source, createdAt,
// genre) are pinned via the optional `meta` extension below; they
// ride along on the same object so a "Save" action can persist the
// full record without a second lookup.

export const RECIPE_VERSION = 1

export type Genre = Exclude<TabId, 'myset'>

// `LookMeta` is the persistence metadata. Combined with `Preset` it
// gives `TunnelLook` — the type the SAVE / MY SET / URL paths use.
export type LookMeta = {
  source: 'generated' | 'curated' | 'manual'
  seed?: number
  recipeVersion?: number
  createdAt?: string
  genre: Genre
  // Mask overlay state — orthogonal to the engine; carried here so
  // SAVE/SHARE/URL preserve the user's foreground silhouette.
  mask?: MaskState
}

export type TunnelLook = Preset & LookMeta

export function generateLook(
  genre: Genre,
  seed: number,
  opts: { recipeVersion?: number; reducedFlash?: boolean } = {},
): TunnelLook {
  const { recipeVersion = RECIPE_VERSION, reducedFlash = false } = opts
  const rng = mulberry32(seed)
  const constraint = VIBES[genre]

  // Sample the params via the existing sampler. It already does the
  // even-density / integer-rings / kaleidoscope rounding.
  let values = sampleVariation(constraint, rng) as Partial<TunnelParams>

  // Reduced-flash safety clamp at the generator level. The engine's
  // `applyReducedFlash` runs again as a final clamp, but doing it
  // here means the URL share-state matches what the user saw.
  if (reducedFlash) {
    values = clampForReducedFlash(values)
  }

  // Identify the palette match by colorA/colorB so the chip closer
  // surfaces a real palette name instead of a generic "Generated".
  const palette = constraint.paletteOptions.find(
    (p) => p.colorA === values.colorA && p.colorB === values.colorB,
  )
  const paletteName = palette?.name ?? 'Generated'

  const flashWarn =
    genre === 'rave' ||
    genre === 'glitch' ||
    (values.strobeRate ?? 0) > 2 ||
    (values.chromatic ?? 0) > 0.4

  const name = generateName(genre, rng)

  return {
    id: `gen.${genre}.${seed}.${recipeVersion}`,
    tab: genre,
    name,
    paletteName,
    values,
    flashWarn,
    source: 'generated',
    seed,
    recipeVersion,
    genre,
  }
}

function clampForReducedFlash(values: Partial<TunnelParams>): Partial<TunnelParams> {
  const next = { ...values }
  if ((next.strobeRate ?? 0) > 1.5) next.strobeRate = 1.5
  if ((next.chromatic ?? 0) > 0.3) next.chromatic = 0.3
  if ((next.hueShift ?? 0) > 0.3) next.hueShift = 0.3
  return next
}

// Convert a curated Preset to a TunnelLook (for save/share parity).
export function presetToLook(p: Preset): TunnelLook {
  return {
    ...p,
    source: 'curated',
    genre: p.tab,
  }
}
