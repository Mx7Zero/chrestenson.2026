import type { Genre } from './generator/generateLook'
import type { MaskState, MaskMode, MaskMotion } from './masks/maskState'
import type { MaskId } from './masks/maskAssets'

// ─── URL state ────────────────────────────────────────────────────
// Hash-based encoding for two cases:
//   • Generated look:  #g=<genre>&s=<seed>&v=<recipe>[&m=<maskCode>]
//   • Curated preset:  #p=<presetId>[&m=<maskCode>]
//
// Mask code (compact): asset.mode.size.rot.softness.glow.invert.motion
//   e.g. star.cutout.1.0.0.12.0.still
// Each segment is a fixed slot to stay parser-tolerant. Defaults are
// dropped on encode if they match MASK_DEFAULTS, kept on decode.
//
// On mount, AsteroidScene parses the hash and routes:
//   - generated → generateLook(genre, seed, {recipeVersion}) → applyPreset
//   - curated   → find PRESETS by id → applyPreset
// On state change (preset click / generate / save / mask edit), we
// replaceState so the URL reflects the active look without polluting
// history.

export type ParsedHash =
  | {
      kind: 'generated'
      genre: Genre
      seed: number
      recipeVersion: number
      mask?: MaskState
    }
  | { kind: 'curated'; presetId: string; mask?: MaskState }
  | null

const VALID_GENRES: ReadonlySet<Genre> = new Set([
  'signature',
  'psychedelic',
  'kaleido',
  'cosmic',
  'rave',
  'glitch',
  'sacred',
  'chroma',
])

const VALID_MASK_MODES: ReadonlySet<MaskMode> = new Set([
  'none',
  'silhouette',
  'cutout',
  'lightLeak',
  'stencil',
])

const VALID_MASK_MOTIONS: ReadonlySet<MaskMotion> = new Set([
  'still',
  'breathe',
  'spin',
  'drift',
  'pulse',
])

const VALID_MASK_IDS: ReadonlySet<MaskId> = new Set<MaskId>([
  'circle',
  'star',
  'hex',
  'cross',
  'triangle',
  'diamond',
  'flower',
  'mandala',
  'eye',
  'crescent',
])

function encodeMask(m: MaskState | undefined): string {
  if (!m || m.mode === 'none') return ''
  // asset.mode.size.rot.softness.glow.invert.motion
  const parts = [
    m.asset,
    m.mode,
    m.size.toFixed(2),
    Math.round(m.rotation).toString(),
    Math.round(m.softness).toString(),
    Math.round(m.glow).toString(),
    m.invert ? '1' : '0',
    m.motion,
  ]
  return `&m=${parts.join('.')}`
}

function decodeMask(s: string | null): MaskState | undefined {
  if (!s) return undefined
  const parts = s.split('.')
  if (parts.length < 8) return undefined
  const [asset, mode, size, rot, softness, glow, invert, motion] = parts
  if (!VALID_MASK_IDS.has(asset as MaskId)) return undefined
  if (!VALID_MASK_MODES.has(mode as MaskMode)) return undefined
  if (!VALID_MASK_MOTIONS.has(motion as MaskMotion)) return undefined
  const sz = Number(size)
  const r = Number(rot)
  const sf = Number(softness)
  const gl = Number(glow)
  if (![sz, r, sf, gl].every(Number.isFinite)) return undefined
  return {
    asset: asset as MaskId,
    mode: mode as MaskMode,
    size: sz,
    rotation: r,
    softness: sf,
    glow: gl,
    invert: invert === '1',
    motion: motion as MaskMotion,
  }
}

export function parseHash(hash: string): ParsedHash {
  if (!hash || hash === '#') return null
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(trimmed)
  const g = params.get('g')
  const s = params.get('s')
  const v = params.get('v')
  const mask = decodeMask(params.get('m'))
  if (g && s) {
    if (!VALID_GENRES.has(g as Genre)) return null
    const seed = Number(s)
    const recipeVersion = v ? Number(v) : 1
    if (!Number.isFinite(seed) || !Number.isFinite(recipeVersion)) return null
    return {
      kind: 'generated',
      genre: g as Genre,
      seed: seed >>> 0,
      recipeVersion,
      mask,
    }
  }
  const p = params.get('p')
  if (p) return { kind: 'curated', presetId: p, mask }
  return null
}

export function encodeGenerated(
  genre: Genre,
  seed: number,
  recipeVersion: number,
  mask?: MaskState,
): string {
  return `#g=${genre}&s=${seed >>> 0}&v=${recipeVersion}${encodeMask(mask)}`
}

export function encodeCurated(presetId: string, mask?: MaskState): string {
  return `#p=${encodeURIComponent(presetId)}${encodeMask(mask)}`
}

export function writeHash(next: string): void {
  if (typeof window === 'undefined') return
  if (window.location.hash === next) return
  // replaceState avoids accumulating history entries as the user
  // clicks through presets / generates new looks.
  try {
    const url = new URL(window.location.href)
    url.hash = next
    window.history.replaceState(null, '', url.toString())
  } catch {
    // ignore
  }
}
