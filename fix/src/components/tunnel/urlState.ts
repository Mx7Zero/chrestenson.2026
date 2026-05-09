import type { Genre } from './generator/generateLook'
import type { MaskState, MaskMode, MaskMotion } from './masks/maskState'
import type { MaskId } from './masks/maskAssets'
import type { OverlayLayer } from './overlays/types'
import { normalizeLayer } from './overlays/types'
import { migrateMaskToLayers } from './overlays/migrate'

// ─── URL state ────────────────────────────────────────────────────
// Hash-based encoding for two cases:
//   • Generated look:  #g=<genre>&s=<seed>&v=<recipe>[&o=<base64>]
//   • Curated preset:  #p=<presetId>[&o=<base64>]
//
// `o=` carries a base64-encoded JSON of the OverlayLayer[] stack.
// Empty stacks drop the segment entirely.
//
// Backwards-compat: pre-2026-05-09 links used `m=<maskCode>` with a
// single mask. parseHash still decodes those, but converts them into
// a one-layer overlayLayers[] via `migrateMaskToLayers`.

export type ParsedHash =
  | {
      kind: 'generated'
      genre: Genre
      seed: number
      recipeVersion: number
      overlayLayers: OverlayLayer[]
    }
  | {
      kind: 'curated'
      presetId: string
      overlayLayers: OverlayLayer[]
    }
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

// Legacy mask validators kept so back-compat decode still works.
const VALID_MASK_MODES: ReadonlySet<MaskMode> = new Set([
  'off',
  'silhouette',
  'cutout',
  'lightLeak',
  'tile',
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

// ─── Layer encoding (base64 JSON) ─────────────────────────────────
function encodeLayers(layers: OverlayLayer[]): string {
  if (!layers || layers.length === 0) return ''
  try {
    const json = JSON.stringify(layers)
    if (typeof btoa === 'function') {
      // URL-safe base64: + → -, / → _, drop padding.
      const b64 = btoa(unescape(encodeURIComponent(json)))
      return `&o=${b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`
    }
    return ''
  } catch {
    return ''
  }
}

function decodeLayers(s: string | null): OverlayLayer[] {
  if (!s) return []
  try {
    const padded = s.replace(/-/g, '+').replace(/_/g, '/')
    const pad = padded.length % 4
    const fixed = pad ? padded + '='.repeat(4 - pad) : padded
    const json = decodeURIComponent(escape(atob(fixed)))
    const arr = JSON.parse(json)
    if (!Array.isArray(arr)) return []
    return arr.map(normalizeLayer)
  } catch {
    return []
  }
}

// ─── Legacy mask encoding (decode-only kept for old links) ────────
function decodeLegacyMask(s: string | null): MaskState | undefined {
  if (!s) return undefined
  const parts = s.split('.')
  if (parts.length < 8) return undefined
  const [asset, mode, size, rot, softness, glow, invert, motion, speed, amount] =
    parts
  if (!VALID_MASK_IDS.has(asset as MaskId)) return undefined
  if (!VALID_MASK_MODES.has(mode as MaskMode)) return undefined
  if (!VALID_MASK_MOTIONS.has(motion as MaskMotion)) return undefined
  const sz = Number(size)
  const r = Number(rot)
  const sf = Number(softness)
  const gl = Number(glow)
  if (![sz, r, sf, gl].every(Number.isFinite)) return undefined
  const sp = speed !== undefined ? Number(speed) : 1
  const am = amount !== undefined ? Number(amount) : 1
  return {
    asset: asset as MaskId,
    mode: mode as MaskMode,
    size: sz,
    rotation: r,
    softness: sf,
    glow: gl,
    invert: invert === '1',
    motion: motion as MaskMotion,
    motionSpeed: Number.isFinite(sp) ? sp : 1,
    motionAmount: Number.isFinite(am) ? am : 1,
  }
}

export function parseHash(hash: string): ParsedHash {
  if (!hash || hash === '#') return null
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(trimmed)
  const g = params.get('g')
  const s = params.get('s')
  const v = params.get('v')
  let overlayLayers = decodeLayers(params.get('o'))
  if (overlayLayers.length === 0) {
    // No `o=` → look for legacy `m=` mask code and migrate.
    const legacy = decodeLegacyMask(params.get('m'))
    if (legacy) overlayLayers = migrateMaskToLayers(legacy)
  }
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
      overlayLayers,
    }
  }
  const p = params.get('p')
  if (p) return { kind: 'curated', presetId: p, overlayLayers }
  return null
}

export function encodeGenerated(
  genre: Genre,
  seed: number,
  recipeVersion: number,
  overlayLayers?: OverlayLayer[],
): string {
  return `#g=${genre}&s=${seed >>> 0}&v=${recipeVersion}${encodeLayers(overlayLayers ?? [])}`
}

export function encodeCurated(
  presetId: string,
  overlayLayers?: OverlayLayer[],
): string {
  return `#p=${encodeURIComponent(presetId)}${encodeLayers(overlayLayers ?? [])}`
}

export function writeHash(next: string): void {
  if (typeof window === 'undefined') return
  if (window.location.hash === next) return
  try {
    const url = new URL(window.location.href)
    url.hash = next
    window.history.replaceState(null, '', url.toString())
  } catch {
    // ignore
  }
}
