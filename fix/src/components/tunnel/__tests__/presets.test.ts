import { describe, it, expect } from 'vitest'
import { PRESETS, DEV_PRESETS } from '../presets'

// Schema invariants apply to the union of user-facing PRESETS and dev-only
// DEV_PRESETS. Chunks 3+ may filter DEV_PRESETS out of user-facing tabs;
// for now they share id-namespace and palette/name shape, so the invariants
// run on the combined list.
const ALL = [...PRESETS, ...DEV_PRESETS]

describe('PRESETS', () => {
  it('every preset has a unique id', () => {
    const ids = ALL.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every preset id matches `${tab}.<slug>`', () => {
    for (const p of ALL) {
      expect(p.id.startsWith(p.tab + '.')).toBe(true)
    }
  })

  it('every preset has a non-empty name and paletteName', () => {
    for (const p of ALL) {
      expect(p.name.length).toBeGreaterThan(0)
      expect(p.paletteName.length).toBeGreaterThan(0)
    }
  })

  it('every preset has a values object', () => {
    for (const p of ALL) {
      expect(typeof p.values).toBe('object')
      expect(p.values).not.toBeNull()
    }
  })
})
