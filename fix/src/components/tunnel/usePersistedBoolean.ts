import { useCallback, useEffect, useState } from 'react'

// ─── localStorage-backed boolean hook ─────────────────────────────
// Reads `'1' | '0'` at the given key on first render. If absent (or
// `localStorage` is unavailable in this environment), falls back to
// `defaultValue`. Every update writes back through `localStorage` so
// the value survives a reload.
//
// Used by chunk 3 to persist `presetsOpen` / `tuneOpen` across
// reloads while seeding the first-visit default from a media query
// (open on desktop, closed on mobile).
//
// `readPersistedBoolean` and `writePersistedBoolean` are exported as
// pure helpers so tests can exercise the storage round-trip without
// needing a DOM.

export function readPersistedBoolean(
  key: string,
  defaultValue: boolean,
): boolean {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === '1') return true
    if (raw === '0') return false
    return defaultValue
  } catch {
    return defaultValue
  }
}

export function writePersistedBoolean(key: string, value: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value ? '1' : '0')
  } catch {
    /* storage may be unavailable — ignore */
  }
}

export function usePersistedBoolean(
  key: string,
  defaultValue: boolean,
): [boolean, (value: boolean) => void] {
  const [value, setValueState] = useState<boolean>(() =>
    readPersistedBoolean(key, defaultValue),
  )

  const setValue = useCallback((next: boolean) => {
    setValueState(next)
  }, [])

  useEffect(() => {
    writePersistedBoolean(key, value)
  }, [key, value])

  return [value, setValue]
}
