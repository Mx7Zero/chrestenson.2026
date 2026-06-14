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

  it('kaleido mode produces N folds with mirrored alternation', () => {
    const inst = expandLayerToInstances(
      base({ patternMode: 'kaleido', kaleidoFolds: 6 }),
    )
    expect(inst).toHaveLength(6)
    const rotations = inst.map((i) => Math.round(i.rotation))
    expect(new Set(rotations).size).toBe(6)
  })

  it('mirrorStage mode returns 2 instances offset on X with opposite scaleX', () => {
    const inst = expandLayerToInstances(
      base({ patternMode: 'mirrorStage', spacingX: 0.25 }),
    )
    expect(inst).toHaveLength(2)
    expect(inst[0].dx).toBeLessThan(0)
    expect(inst[1].dx).toBeGreaterThan(0)
  })
})
