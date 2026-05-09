import type { TunnelLook } from './generator/generateLook'

// ─── Saved looks (localStorage CRUD) ──────────────────────────────
// The MY SET tab reads this list. Generated looks are persisted via
// SAVE; curated presets aren't auto-saved (they already exist in the
// catalog). Capacity is soft-capped at 200 so a runaway save loop
// doesn't fill the storage quota.

const STORAGE_KEY = 'chrestenson.tunnel.savedLooks'
const MAX_LOOKS = 200

export function loadSavedLooks(): TunnelLook[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as TunnelLook[]
  } catch {
    return []
  }
}

function persist(looks: TunnelLook[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(looks))
  } catch {
    // Quota exceeded or storage disabled — silently drop.
  }
}

export function saveLook(look: TunnelLook): TunnelLook[] {
  const current = loadSavedLooks()
  // De-dupe by id: re-saving the same generated look replaces it
  // (no duplicate cards in MY SET). Newest-on-top.
  const filtered = current.filter((l) => l.id !== look.id)
  const stamped: TunnelLook = {
    ...look,
    createdAt: look.createdAt ?? new Date().toISOString(),
  }
  const next = [stamped, ...filtered].slice(0, MAX_LOOKS)
  persist(next)
  return next
}

export function deleteLook(id: string): TunnelLook[] {
  const next = loadSavedLooks().filter((l) => l.id !== id)
  persist(next)
  return next
}

export function renameLook(id: string, name: string): TunnelLook[] {
  const next = loadSavedLooks().map((l) =>
    l.id === id ? { ...l, name } : l,
  )
  persist(next)
  return next
}

export function isLookSaved(id: string): boolean {
  return loadSavedLooks().some((l) => l.id === id)
}
