import { describe, it, expect } from 'vitest'
import { expandLayerToInstances } from './expandLayer'
// `normalizeLayer` lives in `./types`, not `./migrate` (migrate.ts
// only handles the legacy MaskState → layers conversion).
import { normalizeLayer } from './types'

const base = (over: Partial<any> = {}) =>
  normalizeLayer({
    id: 't',
    type: 'shape',
    asset: 'circle',
    visible: true,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
    fill: '#fff',
    stroke: '#fff',
    strokeWidth: 0,
    blendMode: 'normal',
    blur: 0,
    glow: 0,
    invert: false,
    motion: 'none',
    motionSpeed: 1,
    motionAmount: 1,
    motionPhase: 0,
    motionRandomness: 0,
    randomSeed: 1,
    ...over,
  })

describe('expandLayerToInstances', () => {
  it('single mode returns one instance with identity transform', () => {
    const inst = expandLayerToInstances(base({ patternMode: 'single' }))
    expect(inst).toHaveLength(1)
    expect(inst[0]).toMatchObject({
      dx: 0,
      dy: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
    })
  })

  it('massive mode returns one instance with large scale', () => {
    const inst = expandLayerToInstances(
      base({ patternMode: 'massive', patternScale: 6 }),
    )
    expect(inst).toHaveLength(1)
    expect(inst[0].scale).toBeGreaterThanOrEqual(5)
  })

  it('scaleMode multiplies on top of patternScale', () => {
    const inst = expandLayerToInstances(
      base({ scaleMode: 'fullBleed', patternScale: 1 }),
    )
    expect(inst[0].scale).toBeGreaterThanOrEqual(5)
  })
})
