import { describe, it, expect } from 'vitest'
import { deriveChips } from '../chips'
import { TUNNEL_DEFAULTS } from '../../TunnelCanvas'

// ─── deriveChips — pure-TS chip derivation ────────────────────────
// Chunk 6 tile + now-playing chip rules. The chips are computed from
// the resolved `TunnelParams` (defaults + preset.values), with the
// hand-authored `paletteName` always tacked on as the closing chip.
//
// Visual contract:
//   • max 4 chips total → up to 3 auto-derived + paletteName
//   • paletteName is ALWAYS the last entry (even when no rules fire)
//   • auto-derived chips are sorted by descending priority

describe('deriveChips', () => {
  it('returns paletteName as the only chip when no rules match', () => {
    const chips = deriveChips({ ...TUNNEL_DEFAULTS }, 'Bone/Ink')
    expect(chips).toEqual(['Bone/Ink'])
  })

  it('inserts paletteName as the last chip when rules match', () => {
    const chips = deriveChips(
      { ...TUNNEL_DEFAULTS, kaleidoscope: 12, hueShift: 0.5 },
      'Gold/Ink',
    )
    expect(chips[chips.length - 1]).toBe('Gold/Ink')
    expect(chips).toContain('Kaleido 12x')
    expect(chips).toContain('Hue Drift')
  })

  it('caps at max chips (default 4)', () => {
    const chips = deriveChips(
      {
        ...TUNNEL_DEFAULTS,
        kaleidoscope: 8,
        strobeRate: 5,
        chromatic: 0.4,
        hueShift: 1.0,
        helix: 2,
        cellBlur: 0.3,
        wave: 1,
      },
      'Acid Lime',
    )
    expect(chips.length).toBeLessThanOrEqual(4)
    expect(chips[chips.length - 1]).toBe('Acid Lime')
  })

  it('orders by priority — Kaleido > Pulse > Chromatic Split > Hue Drift', () => {
    const chips = deriveChips(
      {
        ...TUNNEL_DEFAULTS,
        kaleidoscope: 12,
        strobeRate: 6,
        chromatic: 0.5,
        hueShift: 1.5,
      },
      'Test',
    )
    // First 3 chips should be in priority order
    expect(chips[0]).toBe('Kaleido 12x')
    expect(chips[1]).toBe('Pulse 6.0/s')
    expect(chips[2]).toBe('Chromatic Split')
    expect(chips[3]).toBe('Test')
  })

  it('formats Kaleido count as integer', () => {
    const chips = deriveChips({ ...TUNNEL_DEFAULTS, kaleidoscope: 8.7 }, 'X')
    expect(chips[0]).toBe('Kaleido 9x')
  })

  it('formats Pulse rate to 1 decimal', () => {
    const chips = deriveChips({ ...TUNNEL_DEFAULTS, strobeRate: 4 }, 'X')
    expect(chips[0]).toBe('Pulse 4.0/s')
  })

  it('respects custom max — 2 means 1 auto + paletteName', () => {
    const chips = deriveChips(
      {
        ...TUNNEL_DEFAULTS,
        kaleidoscope: 8,
        strobeRate: 5,
        chromatic: 0.5,
      },
      'Closer',
      2,
    )
    expect(chips).toEqual(['Kaleido 8x', 'Closer'])
  })

  it('detects Fractal pattern from either patternA or patternB', () => {
    const chipsA = deriveChips(
      { ...TUNNEL_DEFAULTS, patternA: 'fractal' },
      'P',
    )
    const chipsB = deriveChips(
      { ...TUNNEL_DEFAULTS, patternB: 'fractal' },
      'P',
    )
    expect(chipsA).toContain('Fractal')
    expect(chipsB).toContain('Fractal')
  })

  it('emits Transparent Cell for either a or b', () => {
    const chipsA = deriveChips(
      { ...TUNNEL_DEFAULTS, transparentCell: 'a' },
      'P',
    )
    expect(chipsA).toContain('Transparent Cell')
  })

  it('does not emit Curved when bend is 0 (default)', () => {
    const chips = deriveChips({ ...TUNNEL_DEFAULTS }, 'Bone/Ink')
    expect(chips).not.toContain('Curved')
  })

  it('emits Helix Twist for negative helix too', () => {
    const chips = deriveChips({ ...TUNNEL_DEFAULTS, helix: -3 }, 'P')
    expect(chips).toContain('Helix Twist')
  })

  it('does not emit Chromatic Split below 0.05 threshold', () => {
    const chips = deriveChips({ ...TUNNEL_DEFAULTS, chromatic: 0.04 }, 'P')
    expect(chips).not.toContain('Chromatic Split')
  })

  it('does not emit Hue Drift below 0.05 threshold', () => {
    const chips = deriveChips({ ...TUNNEL_DEFAULTS, hueShift: 0.04 }, 'P')
    expect(chips).not.toContain('Hue Drift')
  })
})
