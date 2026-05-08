import { describe, it, expect } from 'vitest'
import { PRESETS, DEV_PRESETS, TAB_ORDER } from '../presets'

// Schema invariants apply to the union of user-facing PRESETS and dev-only
// DEV_PRESETS for id-uniqueness, but the per-tab count + flashWarn rules
// only run on user-facing PRESETS — DEV_PRESETS are filtered out of tabs by
// chunk-3+ UI code via the `__validate-` prefix.
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

  it('user-facing PRESETS contain exactly 96 entries', () => {
    expect(PRESETS.length).toBe(96)
  })

  it('every tab has exactly 12 user-facing presets', () => {
    for (const tab of TAB_ORDER) {
      const inTab = PRESETS.filter((p) => p.tab === tab)
      expect(inTab.length, `tab "${tab}" should have 12 presets`).toBe(12)
    }
  })

  it('every rave/glitch preset has flashWarn === true', () => {
    for (const p of PRESETS) {
      if (p.tab === 'rave' || p.tab === 'glitch') {
        expect(p.flashWarn, `${p.id} (tab=${p.tab}) must have flashWarn=true`).toBe(true)
      }
    }
  })

  it('any preset with strobeRate > 2 or chromatic > 0.4 has flashWarn === true', () => {
    for (const p of PRESETS) {
      const strobe = p.values.strobeRate ?? 0
      const chroma = p.values.chromatic ?? 0
      if (strobe > 2 || chroma > 0.4) {
        expect(
          p.flashWarn,
          `${p.id} has strobeRate=${strobe} chromatic=${chroma}; must set flashWarn=true`,
        ).toBe(true)
      }
    }
  })
})
