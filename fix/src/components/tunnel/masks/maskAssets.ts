// Back-compat shim: the canonical asset list now lives in
// `tunnel/overlays/assetRegistry.ts`. This file re-exports the bits
// older imports (legacy MaskState, urlState validators) still need.
//
// New code should import from `../overlays/assetRegistry` directly.

import { ASSETS, findAsset } from '../overlays/assetRegistry'

// `MaskId` is kept as a string alias so old callers compile. The
// runtime is permissive: any string id is accepted; unknown ids
// fall back to the first asset via `findAsset`.
export type MaskId = string

export type MaskAsset = {
  id: string
  name: string
  viewBox: string
  d: string
}

export const MASKS: MaskAsset[] = ASSETS.map((a) => ({
  id: a.id,
  name: a.name,
  viewBox: a.viewBox,
  d: a.d,
}))

export const DEFAULT_MASK_ID: MaskId = 'star'

export function findMask(id: MaskId): MaskAsset {
  const a = findAsset(id)
  return { id: a.id, name: a.name, viewBox: a.viewBox, d: a.d }
}
