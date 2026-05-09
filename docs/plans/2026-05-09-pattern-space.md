# Pattern Space Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn each overlay/effect layer from "one polite shape at center" into a composition system that can become a screen-filling visual field — kaleidoscopes, mirror stages, tile fields, depth tunnels, clone clouds, mandalas — driven by a single new `patternMode` enum and a small set of pattern controls.

**Architecture:**
- Add `patternMode` + pattern fields + `scaleMode` to the `OverlayLayer` schema with a back-compat migration so existing URLs still render identically.
- Introduce a single pure helper, `expandLayerToInstances(layer)`, that returns an array of `LayerInstance` (per-instance translate / rotate / scale / phase / opacity offsets). Both `OverlayStack` (SVG shapes) and `Wireframe3D` (3D wire) consume this list to draw N copies of a single layer.
- Wireframes get a parallel internal cloning system (`wireCloneCount`, `wireCloneMode`, per-clone phase / rotation / opacity falloff) so a single `<Wireframe3D>` mounts one rAF loop and renders M phase-shifted clones — fixing the existing rAF-per-component perf TODO at the same time.
- Add 5 recipe presets that stack these primitives into ready-made screen-filling compositions.

**Tech Stack:** TypeScript, React 18, Vite 7, SVG (Canvas2D-ish manual perspective for wireframes), Vitest.

**Worktree:** `/Users/mxmbp/chrestenson.2026/.worktrees/tunnel-instrument/` (branch: tunnel-instrument). All paths below are relative to this worktree.

**Dev URL:** http://localhost:3001/ (Vite dev server). Hard reload after each commit; hash state survives reloads.

**Visible-change discipline:** Per `feedback_stop_invisible_work.md`, every commit MUST move the pixels at the dev URL. Tasks are sequenced so each one ships at least one new visible mode or recipe.

---

## Reference: Current Code Surface

(From the exploration pass — file paths are stable points the executing agent should anchor on.)

| Concern | File | Lines |
|---|---|---|
| `OverlayLayer` type | `fix/src/components/tunnel/overlays/types.ts` | 99–184 |
| Migration of legacy fields | `fix/src/components/tunnel/overlays/migrate.ts` | full file |
| Hash encode/decode | `fix/src/components/tunnel/urlState.ts` | 75–102 |
| Shape / glow / cutout / tile render | `fix/src/components/tunnel/overlays/OverlayStack.tsx` | 289–630 |
| Existing kaleidoscope render | `fix/src/components/tunnel/overlays/OverlayStack.tsx` | 300–356 |
| Existing mirror render | `fix/src/components/tunnel/overlays/OverlayStack.tsx` | 289–291 |
| Wireframe 3D component | `fix/src/components/tunnel/overlays/EffectSVG.tsx` | 200–915 |
| Wire geometries | `fix/src/components/tunnel/overlays/wireframeGeometry.ts` | full file |
| Asset registry | `fix/src/components/tunnel/overlays/assetRegistry.ts` | full file |
| Recipes (8 existing) | `fix/src/components/tunnel/overlays/recipes.ts` | full file |
| Controls UI | `fix/src/components/tunnel/overlays/OverlaysSection.tsx` | full file |

**Existing fields the new system must subsume (with migration, not deletion):**
`kaleidoscope`, `mirrorX`, `mirrorY`, `tileSpacing`, layer `type === 'tile'`.

---

## Task 1: Schema, Migration, and the `expandLayerToInstances` Foundation

**Goal of this task:** New fields exist, old URLs still render identically, `expandLayerToInstances` exists with `single` + `massive` modes wired end-to-end so you can flip a layer to "massive" and watch it fill the screen.

**Files:**
- Modify: `fix/src/components/tunnel/overlays/types.ts:99-184`
- Modify: `fix/src/components/tunnel/overlays/migrate.ts`
- Create: `fix/src/components/tunnel/overlays/expandLayer.ts`
- Create: `fix/src/components/tunnel/overlays/expandLayer.test.ts`
- Modify: `fix/src/components/tunnel/overlays/OverlayStack.tsx` (consume instances)
- Modify: `fix/src/components/tunnel/overlays/EffectSVG.tsx` (consume instances)

**Step 1.1 — Extend the `OverlayLayer` type.**

In `types.ts`, add the following fields (all optional with defaults supplied at normalize-time):

```ts
export type PatternMode =
  | 'single'
  | 'massive'
  | 'mirrorStage'
  | 'radial'
  | 'kaleido'
  | 'tileGrid'
  | 'tunnelRepeat'
  | 'cloneCloud'
  | 'mandalaStack'

export type ScaleMode =
  | 'tiny'         // 0.25x
  | 'object'       // 1.0x   (default)
  | 'poster'       // 2.0x
  | 'architectural'// 4.0x
  | 'fullBleed'    // 6.0x
  | 'beyondFrame'  // 9.0x  (intentional clip)

// Add to OverlayLayer:
patternMode?: PatternMode          // default 'single'
scaleMode?: ScaleMode              // default 'object'
patternScale?: number              // 0.1–8.0, default 1
repeatX?: number                   // 1–24
repeatY?: number                   // 1–24
radialCount?: number               // 1–64
cloneCount?: number                // 1–128
depthCount?: number                // 1–48
spacingX?: number                  // 0–1 (fraction of vmin)
spacingY?: number                  // 0–1
depthSpacing?: number              // 0–1
phaseSpread?: number               // 0–1
rotationSpread?: number            // 0–360 deg
scaleFalloff?: number              // 0–1 (0 = no falloff, 1 = aggressive)
opacityFalloff?: number            // 0–1
kaleidoFolds?: number              // 1–32  (replaces `kaleidoscope`)
tileOffsetX?: number               // 0–1
tileOffsetY?: number               // 0–1

// Wireframe-only:
wireCloneCount?: number            // 1–48
wireCloneMode?: 'sameCenter' | 'radial' | 'depth' | 'grid' | 'cloud'
perClonePhaseOffset?: number       // 0–1
perCloneRotationOffset?: number    // 0–360
perCloneScaleFalloff?: number      // 0–1
perCloneOpacityFalloff?: number    // 0–1
perCloneDepthOffset?: number       // 0–1
perCloneSeedOffset?: number        // 0–1
```

**Step 1.2 — Migration in `migrate.ts`.**

When normalizing a layer:
- If `kaleidoscope > 1` and `patternMode` is missing: set `patternMode = 'kaleido'`, `kaleidoFolds = kaleidoscope`.
- If `type === 'tile'` and `patternMode` is missing: set `patternMode = 'tileGrid'`, derive `repeatX = repeatY = round(1 / max(tileSpacing, 0.05))` clamped to [4, 16], `spacingX = spacingY = tileSpacing`.
- Otherwise default `patternMode = 'single'`, `scaleMode = 'object'`, `kaleidoFolds = max(1, kaleidoscope ?? 1)`.
- All numeric defaults: `patternScale=1`, `repeatX=4`, `repeatY=4`, `radialCount=8`, `cloneCount=24`, `depthCount=8`, `spacingX=spacingY=0.18`, `depthSpacing=0.12`, `phaseSpread=0.5`, `rotationSpread=0`, `scaleFalloff=0`, `opacityFalloff=0`, `tileOffsetX=tileOffsetY=0`.
- Wireframe defaults: `wireCloneCount=1`, `wireCloneMode='sameCenter'`, all per-clone offsets `=0`.

**Step 1.3 — Write the failing test for `expandLayerToInstances`.**

Create `expandLayer.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { expandLayerToInstances } from './expandLayer'
import { normalizeLayer } from './migrate'

const base = (over: Partial<any> = {}) => normalizeLayer({
  id: 't', type: 'shape', asset: 'circle', visible: true,
  x: 0, y: 0, scale: 1, rotation: 0, opacity: 1,
  fill: '#fff', stroke: '#fff', strokeWidth: 0, blendMode: 'normal',
  blur: 0, glow: 0, invert: false,
  motion: 'none', motionSpeed: 1, motionAmount: 1, motionPhase: 0, motionRandomness: 0,
  randomSeed: 1, ...over,
})

describe('expandLayerToInstances', () => {
  it('single mode returns one instance with identity transform', () => {
    const inst = expandLayerToInstances(base({ patternMode: 'single' }))
    expect(inst).toHaveLength(1)
    expect(inst[0]).toMatchObject({ dx: 0, dy: 0, scale: 1, rotation: 0, opacity: 1 })
  })

  it('massive mode returns one instance with large scale', () => {
    const inst = expandLayerToInstances(base({ patternMode: 'massive', patternScale: 6 }))
    expect(inst).toHaveLength(1)
    expect(inst[0].scale).toBeGreaterThanOrEqual(5)
  })

  it('scaleMode multiplies on top of patternScale', () => {
    const inst = expandLayerToInstances(base({ scaleMode: 'fullBleed', patternScale: 1 }))
    expect(inst[0].scale).toBeGreaterThanOrEqual(5)
  })
})
```

**Step 1.4 — Run the test, watch it fail.**

```bash
cd fix && npx vitest run src/components/tunnel/overlays/expandLayer.test.ts
```
Expected: `Cannot find module './expandLayer'`.

**Step 1.5 — Implement the minimal `expandLayer.ts`.**

```ts
import type { OverlayLayer, ScaleMode } from './types'

export type LayerInstance = {
  dx: number       // px offset from layer center
  dy: number
  dz?: number      // depth offset for wireframes (-1..1)
  scale: number    // multiplicative
  rotation: number // additive degrees
  phase: number    // 0..1, used by motion / wireframe per-clone offsets
  opacity: number  // multiplicative
  seedOffset?: number
}

const SCALE_MODE_MULT: Record<ScaleMode, number> = {
  tiny: 0.25, object: 1, poster: 2,
  architectural: 4, fullBleed: 6, beyondFrame: 9,
}

export function expandLayerToInstances(layer: OverlayLayer): LayerInstance[] {
  const scaleModeMult = SCALE_MODE_MULT[layer.scaleMode ?? 'object']
  const baseScale = scaleModeMult * (layer.patternScale ?? 1)

  const single = (over: Partial<LayerInstance> = {}): LayerInstance => ({
    dx: 0, dy: 0, scale: baseScale, rotation: 0, phase: 0, opacity: 1, ...over,
  })

  switch (layer.patternMode ?? 'single') {
    case 'single':
    case 'massive':
      return [single()]
    // (Other modes added in subsequent tasks. Fallthrough renders as single for now.)
    default:
      return [single()]
  }
}
```

**Step 1.6 — Run test, verify pass.**

Run vitest again. Expected: 3 passing.

**Step 1.7 — Wire `OverlayStack` to consume instances.**

In `OverlayStack.tsx`, where each layer is rendered (around the existing transform composition at lines 289–356), replace single-shape render with:

```tsx
const instances = expandLayerToInstances(layer)
return instances.map((inst, i) => (
  <div
    key={`${layer.id}-i${i}`}
    style={{
      ...existingLayerStyle,
      transform: `translate(${inst.dx}px, ${inst.dy}px) rotate(${(layer.rotation + inst.rotation)}deg) scale(${(layer.scale * inst.scale)})`,
      opacity: layer.opacity * inst.opacity,
    }}
  >
    {existingLayerContent}
  </div>
))
```

Existing kaleidoscope / mirror code stays in place for now — it operates inside each instance and will be subsumed in Task 2.

**Step 1.8 — Wire `Wireframe3D` to consume instances.**

In `EffectSVG.tsx` near the Wireframe3D root (line ~210), accept `instances?: LayerInstance[]` prop (default `[single]`), and render an inner `<g>` per instance with its translate/rotate/scale and pass `phase` into the existing rAF rotation calc as an additive offset. Single rAF loop, M `<g>` children — this is the perf fix called out in the EffectSVG TODO at lines 14–21.

Pass the instances array down from OverlayStack (the wireframe container).

**Step 1.9 — Typecheck and dev-server smoke check.**

```bash
cd fix && npx tsc --noEmit
```
Expected: no errors.

Then in the running dev server:
- Load any existing URL — the visual should be identical (migration preserves behavior).
- In OverlaysSection devtools (or via temporary hardcode), set a layer's `scaleMode = 'fullBleed'`. Reload. The shape should now fill the viewport.

**Step 1.10 — Commit.**

```bash
git add fix/src/components/tunnel/overlays/types.ts \
        fix/src/components/tunnel/overlays/migrate.ts \
        fix/src/components/tunnel/overlays/expandLayer.ts \
        fix/src/components/tunnel/overlays/expandLayer.test.ts \
        fix/src/components/tunnel/overlays/OverlayStack.tsx \
        fix/src/components/tunnel/overlays/EffectSVG.tsx
git commit -m "feat(pattern): foundation — patternMode/scaleMode schema, expandLayerToInstances, single+massive modes wired"
```

---

## Task 2: `kaleido` and `mirrorStage` Modes

**Goal:** Selecting `patternMode='kaleido'` produces an N-fold mandala. `patternMode='mirrorStage'` produces a left/right pair. UI exposes both.

**Files:**
- Modify: `fix/src/components/tunnel/overlays/expandLayer.ts`
- Modify: `fix/src/components/tunnel/overlays/expandLayer.test.ts`
- Modify: `fix/src/components/tunnel/overlays/OverlaysSection.tsx`

**Step 2.1 — Failing tests:**

```ts
it('kaleido mode produces N folds with mirrored alternation', () => {
  const inst = expandLayerToInstances(base({ patternMode: 'kaleido', kaleidoFolds: 6 }))
  expect(inst).toHaveLength(6)
  const rotations = inst.map(i => Math.round(i.rotation))
  expect(new Set(rotations).size).toBe(6)
})

it('mirrorStage mode returns 2 instances offset on X with opposite scaleX', () => {
  const inst = expandLayerToInstances(base({ patternMode: 'mirrorStage', spacingX: 0.25 }))
  expect(inst).toHaveLength(2)
  expect(inst[0].dx).toBeLessThan(0)
  expect(inst[1].dx).toBeGreaterThan(0)
})
```

**Step 2.2 — Implement.** In `expandLayer.ts`:
- `kaleido`: produce `kaleidoFolds` instances, each rotated `i * 360 / N`, alternate `scaleX` flag (encoded as negative `scale` won't work — use a `mirror?: 'x'|'y'` flag on `LayerInstance`).
- `mirrorStage`: 2 instances at `dx = ±vmin * spacingX`, second has `mirror: 'x'`.

(Add `mirror?: 'x'|'y'` to `LayerInstance` and honor it in OverlayStack render via composing `scaleX(-1)` / `scaleY(-1)`.)

**Step 2.3 — Run tests, verify pass, typecheck.**

**Step 2.4 — UI control.** In `OverlaysSection.tsx`, add to the layer panel:
- `<select>` for `patternMode` (all 9 modes).
- Conditionally show `kaleidoFolds` slider when mode === 'kaleido'.
- Conditionally show `spacingX` slider when mode === 'mirrorStage'.

**Step 2.5 — Visual check.** In dev: select a wire helix, set patternMode=kaleido folds=12 → see a 12-fold mandala. Set patternMode=mirrorStage spacingX=0.3 → see two side-by-side mirrored helices.

**Step 2.6 — Commit.**

```bash
git commit -m "feat(pattern): kaleido (1-32 folds) + mirrorStage modes with UI controls"
```

---

## Task 3: `radial`, `tileGrid`, and `cloneCloud` Modes

**Goal:** Three more modes. `radial` arranges N copies around a circle; `tileGrid` is a true M×N grid (replaces the legacy tile system for non-tile layer types too); `cloneCloud` scatters N copies with seeded randomness.

**Files:** same as Task 2 (`expandLayer.ts`, `expandLayer.test.ts`, `OverlaysSection.tsx`).

**Step 3.1 — Tests (one per mode):**

```ts
it('radial mode returns N instances on a circle of radius spacingX*vmin', () => {
  const inst = expandLayerToInstances(base({ patternMode: 'radial', radialCount: 8, spacingX: 0.3 }))
  expect(inst).toHaveLength(8)
  const dists = inst.map(i => Math.hypot(i.dx, i.dy))
  expect(Math.max(...dists) - Math.min(...dists)).toBeLessThan(1)
})

it('tileGrid mode returns repeatX*repeatY instances on a grid', () => {
  const inst = expandLayerToInstances(base({ patternMode: 'tileGrid', repeatX: 5, repeatY: 4 }))
  expect(inst).toHaveLength(20)
})

it('cloneCloud mode returns cloneCount instances and is deterministic for a fixed seed', () => {
  const a = expandLayerToInstances(base({ patternMode: 'cloneCloud', cloneCount: 30, randomSeed: 42 }))
  const b = expandLayerToInstances(base({ patternMode: 'cloneCloud', cloneCount: 30, randomSeed: 42 }))
  expect(a).toHaveLength(30)
  expect(a[7]).toEqual(b[7])
})
```

**Step 3.2 — Implement.** Use a tiny seeded LCG for cloneCloud determinism (do not pull a new dep). For tileGrid, center the grid on the layer's `x,y`. For radial, evenly space angles, optionally apply `rotationSpread` to extra-rotate each instance to face center.

**Step 3.3 — UI controls.** Add `radialCount`, `repeatX`, `repeatY`, `cloneCount`, `spacingX`, `spacingY`, `scaleFalloff`, `opacityFalloff` sliders, each shown only for the relevant modes.

**Step 3.4 — Visual check.** Select FX-WIRE-CUBE: set patternMode=radial, radialCount=12, spacingX=0.3 → 12 cubes around center. Set patternMode=tileGrid, repeatX=8, repeatY=6 → 48-cube wallpaper.

**Step 3.5 — Commit.**

```bash
git commit -m "feat(pattern): radial, tileGrid, cloneCloud modes + falloff controls"
```

---

## Task 4: `tunnelRepeat` and `mandalaStack` Modes

**Goal:** `tunnelRepeat` produces depth-stacked copies receding into Z (smaller and dimmer). `mandalaStack` composes kaleido + radial + concentric scaling for the centerpiece "reactor" look.

**Files:** same as Task 2/3.

**Step 4.1 — Tests:**

```ts
it('tunnelRepeat returns depthCount instances with shrinking scale and opacity', () => {
  const inst = expandLayerToInstances(base({
    patternMode: 'tunnelRepeat', depthCount: 10,
    scaleFalloff: 0.5, opacityFalloff: 0.5,
  }))
  expect(inst).toHaveLength(10)
  expect(inst[9].scale).toBeLessThan(inst[0].scale)
  expect(inst[9].opacity).toBeLessThan(inst[0].opacity)
})

it('mandalaStack returns radialCount * kaleidoFolds instances in concentric rings', () => {
  const inst = expandLayerToInstances(base({
    patternMode: 'mandalaStack', kaleidoFolds: 6, radialCount: 3,
  }))
  expect(inst).toHaveLength(18)
})
```

**Step 4.2 — Implement.** `tunnelRepeat` walks `depthCount` steps with `scale *= (1 - scaleFalloff/depthCount)` per step (and similarly for opacity). `mandalaStack` is two nested loops (rings × folds) with each ring at radius `r = (i+1) * spacingX * vmin` and each fold rotated `j * 360/N`.

**Step 4.3 — UI:** add `depthCount`, `depthSpacing`, conditional show.

**Step 4.4 — Visual check.** tunnelRepeat with 12 helices and falloff 0.6 → tunnel of helices receding. mandalaStack 3 rings × 8 folds → centerpiece reactor.

**Step 4.5 — Commit.**

```bash
git commit -m "feat(pattern): tunnelRepeat + mandalaStack modes complete the 9-mode set"
```

---

## Task 5: Wireframe Per-Clone Phase Offsets (3D Repeats)

**Goal:** A wireframe layer can clone itself M times with per-clone phase / rotation / opacity falloff so the clones don't move in lockstep — the music-visualizer feel. Single rAF for all M clones.

**Files:**
- Modify: `fix/src/components/tunnel/overlays/EffectSVG.tsx` (Wireframe3D component, lines 200–915)
- Modify: `fix/src/components/tunnel/overlays/expandLayer.ts` (combine pattern instances × wire clones)
- Modify: `fix/src/components/tunnel/overlays/expandLayer.test.ts`
- Modify: `fix/src/components/tunnel/overlays/OverlaysSection.tsx`

**Step 5.1 — Tests:**

```ts
it('wire clones expand into multiple instances with phase offsets', () => {
  const inst = expandLayerToInstances(base({
    asset: 'fx-wire-cube',
    patternMode: 'single',
    wireCloneCount: 4,
    wireCloneMode: 'sameCenter',
    perClonePhaseOffset: 0.25,
  }))
  expect(inst).toHaveLength(4)
  const phases = inst.map(i => i.phase)
  expect(phases[1] - phases[0]).toBeCloseTo(0.25, 5)
})
```

**Step 5.2 — Implement.** When `wireCloneCount > 1` and asset is a wire effect, multiply each pattern-instance by `wireCloneCount` clones. Each clone:
- `dx, dy` from `wireCloneMode` (sameCenter=0,0; radial=circle of `spacingX`; depth=stagger Z; grid=√N grid; cloud=seeded scatter).
- `phase += i * perClonePhaseOffset`.
- `rotation += i * perCloneRotationOffset`.
- `scale *= (1 - i * perCloneScaleFalloff / N)`.
- `opacity *= (1 - i * perCloneOpacityFalloff / N)`.
- `seedOffset = i * perCloneSeedOffset`.

**Step 5.3 — Wire `Wireframe3D`.** It already takes `instances` from Task 1.8. Now use the `phase` offset when computing rotation each frame:
```ts
const t = (now * speed + inst.phase * 1000) / 1000
```
And the existing single rAF loop iterates `instances` to render each `<g>`.

**Step 5.4 — UI:** wireframe controls block (the one the previous Claude session unhid in the recent fix) gains the `wireCloneCount`, `wireCloneMode` (select), and 5 per-clone sliders.

**Step 5.5 — Visual check.** Select FX-WIRE-CUBE: wireCloneCount=12, wireCloneMode=radial, perClonePhaseOffset=0.08 → 12 cubes around center, each tumbling at a slightly different phase. Confirm only one rAF in DevTools Performance.

**Step 5.6 — Commit.**

```bash
git commit -m "feat(pattern): wireframe 3D clones with per-clone phase offsets — single rAF for M clones"
```

---

## Task 6: Recipe Presets

**Goal:** Five recipes that, when clicked, instantly produce a screen-filling visual system, not "one polite shape in the middle."

**Files:**
- Modify: `fix/src/components/tunnel/overlays/recipes.ts`

**Step 6.1 — Add 5 recipes.** Each `build()` returns an `OverlayLayer` with the right combination of fields. Use `normalizeLayer` defaults for everything not specified.

```ts
// 1. Infinite Helix Cathedral
{ id: 'helix-cathedral', name: 'Infinite Helix Cathedral',
  description: 'Huge wire helix, 12-fold kaleido, depth repeat, trails, green/cyan.',
  build: () => normalizeLayer({
    type: 'shape', asset: 'fx-wire-helix',
    scaleMode: 'architectural',
    patternMode: 'mandalaStack', kaleidoFolds: 12, radialCount: 3, spacingX: 0.18,
    wireCloneCount: 6, wireCloneMode: 'depth', perClonePhaseOffset: 0.08,
    perCloneScaleFalloff: 0.4, perCloneOpacityFalloff: 0.5,
    fill: '#00ffaa', stroke: '#22ddff', glow: 22,
    wireTrailCount: 4, wireTrailDecay: 0.5, wireDepthFog: true,
    motion: 'spin', motionSpeed: 0.4,
  }) },

// 2. Mirror Portal Stage
{ id: 'mirror-portal', name: 'Mirror Portal Stage',
  description: 'Two mirrored giant portals left/right, depth fog, slow wire rotation.',
  build: () => normalizeLayer({
    type: 'shape', asset: 'fx-wire-portal',
    scaleMode: 'fullBleed',
    patternMode: 'mirrorStage', spacingX: 0.3,
    wireCloneCount: 4, wireCloneMode: 'depth', perClonePhaseOffset: 0.1,
    perCloneOpacityFalloff: 0.6,
    stroke: '#ff8800', glow: 30, wireDepthFog: true, wireDepthFogAmount: 0.7,
    motion: 'spin', motionSpeed: 0.15,
  }) },

// 3. Psychedelic Wire Wallpaper
{ id: 'wire-wallpaper', name: 'Psychedelic Wire Wallpaper',
  description: 'Wire torus tiled 8×6 with phase offsets and color cycle.',
  build: () => normalizeLayer({
    type: 'shape', asset: 'fx-wire-torus',
    scaleMode: 'object', patternScale: 1.4,
    patternMode: 'tileGrid', repeatX: 8, repeatY: 6, spacingX: 0.13, spacingY: 0.16,
    wireCloneCount: 1,
    stroke: '#ffffff', glow: 10,
    colorCycle: true, colorCycleSpeed: 0.7, colorCycleRange: 360,
    motion: 'spin', motionSpeed: 0.3, motionPhase: 0.5,
  }) },

// 4. Clone Cloud Sphere
{ id: 'clone-cloud', name: 'Clone Cloud Sphere',
  description: '80 small wire spheres scattered around the field with random phase.',
  build: () => normalizeLayer({
    type: 'shape', asset: 'fx-wire-sphere',
    scaleMode: 'tiny', patternScale: 1.1,
    patternMode: 'cloneCloud', cloneCount: 80,
    spacingX: 0.45, spacingY: 0.45,
    wireCloneCount: 1,
    stroke: '#aaccff', glow: 8,
    motion: 'pulse', motionSpeed: 0.6, motionRandomness: 0.9,
  }) },

// 5. Mandala Reactor
{ id: 'mandala-reactor', name: 'Mandala Reactor',
  description: 'Portal + helix + radial repeat + kaleido folds, all centered.',
  build: () => normalizeLayer({
    type: 'shape', asset: 'fx-wire-portal',
    scaleMode: 'poster', patternScale: 1.5,
    patternMode: 'mandalaStack', kaleidoFolds: 8, radialCount: 4, spacingX: 0.12,
    wireCloneCount: 8, wireCloneMode: 'radial', perClonePhaseOffset: 0.06,
    perCloneRotationOffset: 7,
    stroke: '#ff44ff', fill: '#440044', glow: 25,
    motion: 'spin', motionSpeed: 0.25, wireDepthFog: true,
  }) },
```

**Step 6.2 — Acceptance check (manual, dev URL):** Click each recipe in the OverlaysSection recipes UI. Each MUST produce a visual that visibly fills more than half the viewport with multiple instances. If a recipe still produces "one polite shape" — adjust scaleMode / counts / spacing in the build() until the screen-filling test passes.

**Step 6.3 — Commit.**

```bash
git commit -m "feat(pattern): 5 recipe presets — Helix Cathedral, Mirror Portal, Wire Wallpaper, Clone Cloud, Mandala Reactor"
```

---

## Task 7: gstack QA + Performance Pass

**Goal:** Visually verify each of the 9 modes and 5 recipes in a real browser, capture screenshots as evidence, identify and fix any clipping/perf regressions.

**Files:** any of the above as bug fixes require.

**Step 7.1 — Use the gstack skill.** Drive the dev server at `http://localhost:3001/` and:
1. Click each of the 5 new recipes in turn, screenshot after each.
2. For each screenshot, verify visually: > 50% viewport coverage, multiple instances visible, no obvious clipping at edges (unless `scaleMode='beyondFrame'`).
3. With Mandala Reactor active (the heaviest), open DevTools Performance and confirm rAF count is bounded (we want one per Wireframe3D component, not one per clone).

**Step 7.2 — File any bugs found as TODO comments + immediate fixes.** No "ship and pray" — fix-on-the-spot for visual regressions.

**Step 7.3 — Final typecheck + lint.**

```bash
cd fix && npx tsc --noEmit && npx eslint .
```

**Step 7.4 — Final commit (only if fixes were needed).**

```bash
git commit -m "fix(pattern): QA pass — clipping / perf adjustments from gstack run"
```

---

## Done-Looks-Like

- A user opens the dev URL, picks any recipe, and instantly sees a screen-filling composition system.
- The same user can take an existing layer, change `patternMode` from a dropdown, and watch it transform from one shape into a kaleidoscope, mirror stage, radial array, tile field, depth tunnel, clone cloud, or mandala stack.
- Wireframe layers can be cloned in 3D with per-clone phase offsets so they animate as a system, not in lockstep.
- Existing URLs still render identically (migration verified).
- Single rAF per wireframe component regardless of clone count (perf TODO from EffectSVG.tsx:14–21 closed).
