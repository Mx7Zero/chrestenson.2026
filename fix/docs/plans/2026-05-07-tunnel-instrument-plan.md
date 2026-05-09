# Tunnel Visual Instrument Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the hummingbird-section motion-art generator into a live visual instrument — 96 hand-tuned presets across 8 tabs, 600ms morph transitions on preset clicks, an 8-second DEMO crossfade, a GENERATE VARIATION sampler bound to per-tab vibe constraints, INTENSITY (CALM/FULL/OVERDRIVE) multipliers, motion-safety controls, fullscreen showcase mode, favorites with a conditional MY SET tab, and shareable hash URLs.

**Architecture:** Extract a pure-TS morph engine (scalar lerp + HSL color lerp + categorical snap + cellBlur bloom) and route every preset application through it. Refactor the existing single TUNE panel inside `AsteroidScene.tsx` into three separate UI surfaces — a permanent transport bar, a collapsible PRESETS panel, and a collapsible TUNE panel. Hold all preset definitions in a typed `Preset` schema; resolve final params each frame by stacking `defaults → preset → intensity → reduced-flash clamp`. Persist user choices in `localStorage` under a `chrestenson.tunnel.*` namespace. Encode shareable state in `location.hash`.

**Tech stack:** React 18, react-three-fiber 8, Three.js 0.183, TypeScript 5.6, Vite 6. Vitest 4 for unit tests under `__tests__/`. Playwright 1.59 for e2e under `e2e/` (runs against `npm run preview` on `:4173`).

**Reference design:** [`docs/plans/2026-05-07-tunnel-instrument-design.md`](./2026-05-07-tunnel-instrument-design.md) — read this first before any task. Open questions and final values for preset names, palette names, capability copy, and vibe constraints live there.

**Current build notes:** [`docs/plans/2026-05-09-tunnel-instrument-build-notes.md`](./2026-05-09-tunnel-instrument-build-notes.md) — read this before resuming implementation. The branch has already shipped several chunks and is now in generator/save/share plus mask/overlay-layer territory; the original chunk list below is historical in places.

**Cadence:** One PR per numbered chunk. No braiding. Each PR builds, lints, passes existing tests, and ships its own slice of value. Land each one before the next.

---

## Pre-flight

Before starting Chunk 1, in this order:

1. Confirm the live-site fix `e3f6472` is deployed to production. Open `https://www.chrestenson.com/` → scroll to bird → confirm the SUNBURST tunnel actually renders (no all-black canvas).
2. Verify the design doc commit `53be94f` is on `main`.
3. Recommend a worktree: `git worktree add ../chrestenson.2026.tunnel-instrument` so this work doesn't braid with the existing uncommitted changes (AsteroidScene panel, supr/, package*, vite*).
4. From the worktree, confirm `cd fix && npm install && npm run build && npm run lint` all pass on the clean `main` baseline.

Skip 3 only if the existing uncommitted changes have all landed or been dropped.

---

## Chunk 1 — Engine audit

**Goal:** Produce a short reference doc that maps every consumer of `TunnelParams` and every shader uniform. Read-only. No code change. Unblocks all later chunks because every later step references this map.

**Files:**
- Create: `fix/docs/plans/2026-05-07-tunnel-engine-audit.md`

**Tasks:**
1. Grep `src/components/TunnelCanvas.tsx` for every `params.<field>` read, every `uniform` definition in the shader, every `useFrame` write. Tabulate as a Markdown table with columns: `param`, `type`, `consumer (line)`, `lerpable?`, `applies-to (CPU / GPU uniform / camera)`.
2. Grep `src/components/AsteroidScene.tsx` for every place that passes a preset value into the tunnel (the existing PRESETS row, the per-slider state, the strobe presets). Tabulate as: `control`, `state-source`, `effect`, `linkage to TunnelParams field`.
3. Document the existing morph behavior on preset click (currently instant — record what `setParams` calls actually do).
4. Document the existing TUNE panel's open/close mechanism (`AsteroidScene.tsx:356`, `1666`) and its width.
5. Note any params where the type is union (e.g. `transparentCell: 'none' | 'a' | 'b'`, `direction: 1 | -1`) — these are categorical and need snap, not lerp.

**Verification:**
- The audit doc is enough for someone with no codebase context to know which params are scalars (lerpable), which are HSL colors, and which are categorical.

**Commit:**
```
docs: tunnel engine audit for visual-instrument plan
```

---

## Chunk 2 — Preset schema + migration

**Goal:** Introduce a typed `Preset` schema. Migrate the existing 18 presets into it without changing UI behavior. No new presets yet.

**Files:**
- Create: `fix/src/components/tunnel/presets.ts`
- Create: `fix/src/components/tunnel/__tests__/presets.test.ts`
- Modify: `fix/src/components/TunnelCanvas.tsx` — re-export `TUNNEL_PRESETS` from the new module to keep external imports stable.
- Modify: `fix/src/components/AsteroidScene.tsx` — switch the PRESETS row to consume `Preset[]` (will fall back to `name` for the button label, ignoring tabs/chips/palette for now).

**Schema:**

```ts
// fix/src/components/tunnel/presets.ts
import type { TunnelParams } from '../TunnelCanvas'

export type TabId =
  | 'signature'
  | 'psychedelic'
  | 'kaleido'
  | 'cosmic'
  | 'rave'
  | 'glitch'
  | 'sacred'
  | 'chroma'
  | 'myset'

export type Preset = {
  id: string                          // `${tab}.${slug}`, kebab-case slug
  tab: Exclude<TabId, 'myset'>        // MY SET is virtual, derived from favorites
  name: string                        // 'Neon Cathedral'
  paletteName: string                 // 'Gold/Pearl' — closing chip in the chip list
  values: Partial<TunnelParams>
  flashWarn?: boolean                 // default true for tab === 'rave' | 'glitch'
}

export const PRESETS: Preset[] = [
  // existing 18, all migrated under tab='signature' for now
]
```

**Tasks:**
1. Write the failing test in `presets.test.ts`:
   ```ts
   import { describe, it, expect } from 'vitest'
   import { PRESETS } from '../presets'

   describe('PRESETS', () => {
     it('every preset has a unique id', () => {
       const ids = PRESETS.map(p => p.id)
       expect(new Set(ids).size).toBe(ids.length)
     })
     it('every preset id matches `${tab}.<slug>`', () => {
       for (const p of PRESETS) {
         expect(p.id.startsWith(p.tab + '.')).toBe(true)
       }
     })
     it('every preset has a non-empty name and paletteName', () => {
       for (const p of PRESETS) {
         expect(p.name.length).toBeGreaterThan(0)
         expect(p.paletteName.length).toBeGreaterThan(0)
       }
     })
   })
   ```
2. Run: `cd fix && npx vitest run src/components/tunnel/__tests__/presets.test.ts` — expect FAIL (file doesn't exist).
3. Author `presets.ts` with the existing 18 presets all under `tab: 'signature'`. Use the existing preset name lowercased as the slug. Hand-author a placeholder `paletteName` per preset based on its colorA/colorB.
4. Re-run the test — expect PASS.
5. In `TunnelCanvas.tsx`, replace the inline `TUNNEL_PRESETS` const with `export { PRESETS as TUNNEL_PRESETS } from './tunnel/presets'`. Mark the legacy export as deprecated via a one-line JSDoc comment.
6. Update `AsteroidScene.tsx` consumer to read `preset.values` (was `preset.values`) and `preset.name` (was `preset.name`) — confirm no breakage.
7. Run `npm run build` — expect 0 errors.
8. Run `npm run dev` and verify the bird section's preset row still renders + clicks still apply (instant, no morph yet — that's chunk 4).

**Commit:**
```
refactor: extract Preset schema and migrate the existing 18 to tunnel/presets.ts

No behavior change. Sets up the schema later chunks (tabs, chips,
flashWarn, paletteName) build on top of.
```

---

## Chunk 3 — Tab taxonomy + UI shell + capability copy

**Goal:** Restructure the existing TUNE panel into three surfaces (transport bar, PRESETS panel, TUNE panel). Wire up 8 tabs + capability copy in PRESETS. The existing 18 presets stay where they are — they're routed into tabs via a per-preset `tab` field. Sub-12-per-tab is fine here.

**Files:**
- Create: `fix/src/components/tunnel/TabBar.tsx`
- Create: `fix/src/components/tunnel/PresetsPanel.tsx`
- Create: `fix/src/components/tunnel/TransportBar.tsx`
- Create: `fix/src/components/tunnel/TunePanel.tsx` (extract from `AsteroidScene.tsx`)
- Create: `fix/src/components/tunnel/__tests__/TabBar.test.tsx` (with @testing-library/react if not already a dep — if not, gate this test with a TODO)
- Create: `fix/src/components/tunnel/usePersistedBoolean.ts` — `localStorage`-backed boolean hook
- Modify: `fix/src/components/AsteroidScene.tsx` — import the three new surfaces, remove the old combined TUNE drawer.
- Modify: `fix/src/components/tunnel/presets.ts` — add `TAB_CAPABILITY_COPY` and `TAB_ORDER` constants.

**Tab data:**

```ts
// fix/src/components/tunnel/presets.ts (additions)

export const TAB_ORDER: Exclude<TabId, 'myset'>[] = [
  'signature',
  'psychedelic',
  'kaleido',
  'cosmic',
  'rave',
  'glitch',
  'sacred',
  'chroma',
]

export const TAB_LABELS: Record<TabId, string> = {
  signature: 'SIGNATURE',
  psychedelic: 'PSYCHEDELIC',
  kaleido: 'KALEIDO',
  cosmic: 'COSMIC',
  rave: 'RAVE',
  glitch: 'GLITCH',
  sacred: 'SACRED',
  chroma: 'CHROMA',
  myset: 'MY SET',
}

export const TAB_CAPABILITY_COPY: Record<TabId, string> = {
  signature: "The instrument's anchor presets — broad strokes across every capability.",
  psychedelic: 'Liquid color, fractal drift, chromatic separation, hue-shift motion.',
  kaleido: 'Mirror geometry from 4-fold to 16-fold symmetry, sharp pattern cells.',
  cosmic: 'Deep palettes, slow helix twist, long fog depth, gentle wave.',
  rave: 'Strobe presets, high-contrast neon, pulse and rainbow modes.',
  glitch: 'Chromatic split, signal-collapse, invert-mode flash, broken pattern shifts.',
  sacred: 'Gold/jewel tones, slow rotation, diamond/cross/rings under heavy symmetry.',
  chroma: 'Pure color motion — continuous hue drift, no patterns, soft cell-blur.',
  myset: 'Your starred presets.',
}

export const FLASH_TABS: Set<TabId> = new Set(['rave', 'glitch'])
```

**Tasks:**
1. Create `usePersistedBoolean.ts` — a hook that takes a key, default value, and returns `[value, setValue]` synced to `localStorage`. Cover with a Vitest test that uses `vi.stubGlobal('localStorage', ...)`.
2. Create `TabBar.tsx` — a horizontal strip of buttons, one per `TAB_ORDER` plus an optional `myset` button if `hasFavorites` prop is true. Active tab has visual highlight. Stub `flashWarn` ⚠ badges next to RAVE / GLITCH labels.
3. Create `PresetsPanel.tsx` — given an `activeTab: TabId` and a `presets: Preset[]`, render the capability-copy line + a 3×4 grid of preset tiles. Each tile shows the preset name (chips and ★ stub for now). Click → emits `onPresetClick(preset)`.
4. Create `TunePanel.tsx` — port the existing slider drawer + strobe controls + cell A/B + transparent cell controls out of `AsteroidScene.tsx` verbatim. No behavior change, just extracted.
5. Create `TransportBar.tsx` — a bottom-anchored full-width bar. Stubbed buttons for `▶ DEMO`, `⟲ VARIATION`, `CALM · FULL · OVERDRIVE`, `⛶ FULLSCREEN`. Stubbed now-playing line `<preset.name>`. No logic — just the chrome.
6. Refactor `AsteroidScene.tsx`: replace the combined drawer body with `<PresetsPanel>` (right side, top) + `<TunePanel>` (right side, below PresetsPanel). Add `<TransportBar>` at the bottom of the bird container. Replace the single `tunePanelOpen` state with two booleans driven by `usePersistedBoolean('chrestenson.tunnel.presetsOpen', isDesktop)` and `usePersistedBoolean('chrestenson.tunnel.tuneOpen', isDesktop)`. `isDesktop` = `window.matchMedia('(min-width: 1024px)').matches` evaluated once on mount.
7. Visual-check the page locally on desktop (panels open) + responsive emulator at 375px (panels closed). Verify the transport bar renders at bottom, the bird is unobstructed.

**Verification:**
- `npm run lint && npm run build` clean.
- `npm run dev` → bird section. Open `http://localhost:5174` in real Chrome.
  - Desktop: PRESETS + TUNE both open by default. Click each preset still applies (instant — morph is chunk 4).
  - Mobile (DevTools 375px): both panels closed. Click toggles to open.
  - Reload: panel state persists.

**Commit:**
```
refactor: split tunnel UI into TransportBar + PresetsPanel + TunePanel

8-tab taxonomy with capability copy. Existing 18 presets routed into
tabs (placeholder distribution). No new presets, no morph yet —
behavior on click is still instant.

Two collapsible panels with localStorage-backed open state, default
open desktop / closed mobile. Permanent transport bar at the bottom
of the bird section (buttons stubbed; logic in chunks 4-13).
```

---

## Chunk 4 — Morph engine + DEMO

**Goal:** Replace the instant preset apply with a 600ms morph (scalar lerp, HSL color lerp, categorical snap, cellBlur bloom). Same primitive at 8000ms powers the DEMO button. This is the load-bearing technical chunk.

**Files:**
- Create: `fix/src/components/tunnel/morph.ts` — pure-TS morph math, no React.
- Create: `fix/src/components/tunnel/__tests__/morph.test.ts`
- Create: `fix/src/components/tunnel/useMorph.ts` — React hook that drives the morph over time.
- Modify: `fix/src/components/TunnelCanvas.tsx` — accept a `morphProgress` ref or merged-params source instead of raw `params`.
- Modify: `fix/src/components/AsteroidScene.tsx` — wire `onPresetClick` through `useMorph` instead of `setParams`. Wire `▶ DEMO` button to start/stop a morph cycle through the active tab's presets at 8000ms each.

**Pure-TS morph signature:**

```ts
// fix/src/components/tunnel/morph.ts
import type { TunnelParams } from '../TunnelCanvas'

const SCALAR_KEYS = [
  'speed', 'roll', 'fov', 'fogFar', 'wobble', 'density', 'rings', 'hole',
  'helix', 'wave', 'bend', 'cellBlur', 'strobeRate', 'strobeDuty',
  'kaleidoscope', 'chromatic', 'hueShift',
] as const satisfies readonly (keyof TunnelParams)[]

const COLOR_KEYS = ['colorA', 'colorB', 'strobeColor'] as const satisfies readonly (keyof TunnelParams)[]

const CATEGORICAL_KEYS = [
  'patternA', 'patternB', 'imageA', 'imageB',
  'direction', 'bendDir', 'transparentCell', 'strobeMode', 'strobeTarget',
] as const satisfies readonly (keyof TunnelParams)[]

export function lerpScalar(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function lerpHSL(aHex: string, bHex: string, t: number): string {
  // RGB → HSL on each side, lerp H around shortest path, lerp S+L linearly,
  // back to hex. Implementation in detailed step below.
}

export function bloomCurve(t: number, peak = 0.2): number {
  // sin^2(πt) shaped pulse — 0 at t=0 and t=1, peak at t=0.5
  const s = Math.sin(Math.PI * t)
  return peak * s * s
}

export function morphParams(
  from: TunnelParams,
  to: TunnelParams,
  t: number,                     // 0..1
): TunnelParams {
  const out = { ...from }
  for (const k of SCALAR_KEYS) (out as any)[k] = lerpScalar(from[k] as number, to[k] as number, t)
  for (const k of COLOR_KEYS) (out as any)[k] = lerpHSL(from[k] as string, to[k] as string, t)
  for (const k of CATEGORICAL_KEYS) (out as any)[k] = t < 0.5 ? from[k] : to[k]
  // bloom on top of lerped cellBlur
  out.cellBlur = lerpScalar(from.cellBlur, to.cellBlur, t) + bloomCurve(t, 0.2)
  return out
}
```

**Tasks:**
1. Write a failing test for `lerpScalar` (4 cases including endpoints + midpoint + extrapolation guard).
2. Write a failing test for `lerpHSL`:
   - Endpoints: `lerpHSL('#ff0000', '#00ff00', 0)` returns `'#ff0000'`; at t=1 returns `'#00ff00'`.
   - Midpoint: should pass *through* yellow, NOT through gray (`#7f7f00`-ish, not `#7f7f7f`-ish).
   - Verify by checking saturation at t=0.5 is high.
3. Write a failing test for `bloomCurve`: 0 at t=0 and t=1, peak (≈0.2) near t=0.5, monotonically increasing on [0, 0.5].
4. Write a failing test for `morphParams`:
   - Categorical fields snap at midpoint (t=0.49 returns `from`, t=0.51 returns `to`).
   - Scalar at t=0.5 is the midpoint.
   - cellBlur at t=0.5 is `lerp(fromBlur, toBlur, 0.5) + 0.2`.
5. Run all four — expect FAIL.
6. Implement `lerpScalar`, `lerpHSL` (use a small RGB↔HSL helper inline), `bloomCurve`, `morphParams`. Run tests until all pass.
7. Implement `useMorph` hook:
   ```ts
   // fix/src/components/tunnel/useMorph.ts
   export function useMorph(target: TunnelParams, durationMs: number) {
     const [current, setCurrent] = useState(target)
     const fromRef = useRef(target)
     const startedAtRef = useRef<number | null>(null)
     const targetRef = useRef(target)

     useEffect(() => {
       fromRef.current = current
       targetRef.current = target
       startedAtRef.current = performance.now()
     }, [target])

     useFrame(() => {
       const start = startedAtRef.current
       if (start === null) return
       const t = Math.min(1, (performance.now() - start) / durationMs)
       setCurrent(morphParams(fromRef.current, targetRef.current, t))
       if (t === 1) startedAtRef.current = null
     })

     return current
   }
   ```
   Note: `useFrame` is r3f; inside a non-Canvas hook the equivalent is a `requestAnimationFrame` loop. Implementation detail to verify during step 8.
8. Replace `params` prop on `<Tunnel>` with the morphed value. Plumb a `morphDurationMs` prop (default 600). The DEMO button (chunk 5 onward) sets it to 8000.
9. Wire DEMO into `AsteroidScene.tsx`: `const [demoActive, setDemoActive] = useState(false)`, when active a `setInterval(advancePreset, 8000)` cycles through the active tab's presets in shuffled order. Manual preset click stops demo. Tab change stops demo.
10. Test the full DEMO loop manually: start it on SIGNATURE, watch 3-4 transitions, confirm each is smooth (no snap visible) and ~8s long.

**Verification:**
- `npx vitest run src/components/tunnel/__tests__/morph.test.ts` all pass.
- `npm run build && npm run lint` clean.
- Manual: click any preset → smooth 600ms transition. Click DEMO → cycles at 8s per preset. Click DEMO again → stops on current preset.

**Commit:**
```
feat: 600ms morph engine with cellBlur bloom + DEMO mode

Pure-TS morph (scalar lerp, HSL color lerp, categorical snap-at-mid)
plus a sin² blur bloom that peaks at t=0.5, hiding the categorical
snap visually. Same primitive powers preset clicks (600ms) and
the new ▶ DEMO button (8000ms cycling through the active tab).

Manual interaction (preset click, slider drag, tab change) stops DEMO.
```

---

## Chunk 5 — 96 preset library

**Goal:** Hand-author the full preset list per tab. Pure data — no logic changes. Easiest to review independently because it's all in `presets.ts`.

**Files:**
- Modify: `fix/src/components/tunnel/presets.ts`
- Modify: `fix/src/components/tunnel/__tests__/presets.test.ts` — add an invariant: every tab in `TAB_ORDER` has exactly 12 presets.

**Authoring rules:**

For each of the 8 tabs, hand-author 12 presets that:

- Hit visually distinct corners of the tab's vibe (no two presets in a tab should look identical from a still frame).
- Use the patterns/effects the tab claims in its capability copy (e.g., GLITCH must use `chromatic > 0` and one of `strobeMode = 4` (invert) or `strobeMode = 0`).
- Carry an evocative `name` (1-2 words; see design doc sample list as a starting point — refine while authoring).
- Carry a hand-authored `paletteName` describing the colorA/colorB pairing (e.g., `'Gold/Pearl'`, `'Acid Lime'`, `'Bone/Ink'`, `'Sun/Smoke'`).
- Set `flashWarn: true` if `tab === 'rave'` or `tab === 'glitch'` or if `strobeRate > 2` or `chromatic > 0.4`.

**Process per tab (one commit per tab is fine, or one big commit at the end — author's choice):**

1. Open the design doc, copy the sample names for the tab.
2. Author 12 `Preset` objects with values that hit the tab's vibe corners. Lean on existing `TUNNEL_DEFAULTS` — only override what makes the preset distinctive.
3. Live-test each one by clicking through in dev. Adjust params until the visual sells the name.
4. After all 12, run the schema test (`npx vitest run …/presets.test.ts`).
5. Bump the test invariant: `expect(PRESETS.filter(p => p.tab === 'rave').length).toBe(12)` etc.

**Final test:**

```ts
// in presets.test.ts
it('every tab has 12 presets', () => {
  for (const tab of TAB_ORDER) {
    expect(PRESETS.filter(p => p.tab === tab).length).toBe(12)
  }
})
it('no preset id is duplicated', () => {
  const ids = PRESETS.map(p => p.id)
  expect(new Set(ids).size).toBe(96)
})
it('rave/glitch presets default flashWarn=true', () => {
  for (const p of PRESETS.filter(p => p.tab === 'rave' || p.tab === 'glitch')) {
    expect(p.flashWarn).toBe(true)
  }
})
```

**Verification:**
- All 96 presets render and morph cleanly when clicked.
- DEMO works on every tab (8 different vibes you can demo through).
- No preset throws a shader error in the console.

**Commit (one per tab is preferable for reviewability):**
```
data: 12 presets for <TAB_NAME> tab
```

Or combined:
```
data: 96 hand-tuned presets across 8 tabs
```

---

## Chunk 6 — Auto-chips + now-playing

**Goal:** Show 3-5 chips per preset (auto-derived from resolved params + the hand-authored palette name) on each tile and on the now-playing line in the transport bar.

**Files:**
- Create: `fix/src/components/tunnel/chips.ts`
- Create: `fix/src/components/tunnel/__tests__/chips.test.ts`
- Modify: `fix/src/components/tunnel/PresetsPanel.tsx` — render chips on each tile.
- Modify: `fix/src/components/tunnel/TransportBar.tsx` — render chips on the now-playing line.

**Logic:**

```ts
// fix/src/components/tunnel/chips.ts
import type { TunnelParams } from '../TunnelCanvas'
import type { Preset } from './presets'

const RULES: { test: (p: TunnelParams) => boolean; chip: (p: TunnelParams) => string; priority: number }[] = [
  { test: p => (p.kaleidoscope ?? 0) > 0, chip: p => `Kaleido ${Math.round(p.kaleidoscope!)}x`, priority: 100 },
  { test: p => (p.strobeRate ?? 0) > 0, chip: p => `Pulse ${p.strobeRate!.toFixed(1)}/s`, priority: 95 },
  { test: p => (p.chromatic ?? 0) > 0.05, chip: () => 'Chromatic Split', priority: 90 },
  { test: p => (p.hueShift ?? 0) > 0.05, chip: () => 'Hue Drift', priority: 85 },
  { test: p => (p.helix ?? 0) !== 0, chip: () => 'Helix Twist', priority: 80 },
  { test: p => (p.wave ?? 0) !== 0, chip: () => 'Wave', priority: 75 },
  { test: p => p.transparentCell !== 'none', chip: () => 'Transparent Cell', priority: 70 },
  { test: p => p.patternA === 'fractal' || p.patternB === 'fractal', chip: () => 'Fractal', priority: 65 },
  { test: p => p.patternA === 'marble' || p.patternB === 'marble', chip: () => 'Marble Flow', priority: 60 },
  { test: p => (p.cellBlur ?? 0) > 0.2, chip: () => 'Soft Cells', priority: 55 },
  { test: p => (p.bend ?? 0) !== 0, chip: () => 'Curved', priority: 50 },
]

export function deriveChips(resolved: TunnelParams, paletteName: string, max = 4): string[] {
  const matches = RULES
    .filter(r => r.test(resolved))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, max - 1)
    .map(r => r.chip(resolved))
  return [...matches, paletteName]
}
```

**Tasks:**
1. Failing test: `deriveChips(rave-preset-with-strobe-and-kaleido, 'Acid Lime')` returns `['Kaleido 12x', 'Pulse 6.0/s', 'Chromatic Split', 'Acid Lime']`.
2. Failing test: chips never exceed `max`.
3. Failing test: paletteName is always the last chip.
4. Implement `deriveChips`. Tests pass.
5. Render chips on tile in `PresetsPanel.tsx` (resolve each preset's full params via `{...TUNNEL_DEFAULTS, ...preset.values}` for chip derivation).
6. Render chips on now-playing line in `TransportBar.tsx` using the active preset.

**Verification:**
- Visual: every tile shows ~3-4 chips. No overflow on 360px panel width. No chip text wraps mid-word.

**Commit:**
```
feat: auto-derive engine chips per preset + now-playing line

Chips computed from resolved params (kaleido count, hue drift, helix
twist, etc.) with per-preset palette name as the closing chip.
Rendered on each tile and on the transport bar's now-playing line.
```

---

## Chunk 7 — Fullscreen / showcase mode

**Goal:** ⛶ FULL button enters Fullscreen API on the bird container; chrome auto-hides; transport bar reappears on mouse-wake. ESC exits.

**Files:**
- Create: `fix/src/components/tunnel/useFullscreen.ts`
- Create: `fix/src/components/tunnel/useMouseWake.ts`
- Modify: `fix/src/components/AsteroidScene.tsx` — wrap bird container in a `ref`, wire fullscreen handlers.
- Modify: `fix/src/components/tunnel/TransportBar.tsx` — accept `fullscreen` and `mouseAwake` props; visibility classes.
- Add: `fix/e2e/tunnel-fullscreen.spec.ts`

**Tasks:**
1. `useFullscreen(elRef)`:
   ```ts
   export function useFullscreen(ref: RefObject<HTMLElement | null>) {
     const [active, setActive] = useState(false)
     const enter = useCallback(() => ref.current?.requestFullscreen?.(), [ref])
     const exit = useCallback(() => document.exitFullscreen?.(), [])
     useEffect(() => {
       const onChange = () => setActive(document.fullscreenElement === ref.current)
       document.addEventListener('fullscreenchange', onChange)
       return () => document.removeEventListener('fullscreenchange', onChange)
     }, [ref])
     return { active, enter, exit }
   }
   ```
2. `useMouseWake({ idleMs: 2500 })`:
   ```ts
   export function useMouseWake(idleMs = 2500) {
     const [awake, setAwake] = useState(true)
     useEffect(() => {
       let timer: number | null = null
       const wake = () => {
         setAwake(true)
         if (timer) window.clearTimeout(timer)
         timer = window.setTimeout(() => setAwake(false), idleMs)
       }
       wake()
       window.addEventListener('mousemove', wake)
       window.addEventListener('keydown', wake)
       return () => {
         if (timer) window.clearTimeout(timer)
         window.removeEventListener('mousemove', wake)
         window.removeEventListener('keydown', wake)
       }
     }, [idleMs])
     return awake
   }
   ```
3. In `AsteroidScene.tsx`, wrap the bird container in a `<div ref={fsRef}>`. Pass the ref to `useFullscreen`. When `active`, hide PRESETS/TUNE panels + Navigation. Transport bar visibility = `!active || mouseAwake`.
4. Wire `⛶ FULL` button → `enter()`. ESC handled by browser.
5. Playwright e2e: load page, scroll to bird, click ⛶ FULL via test harness (Playwright `page.click('button:has-text("FULL")')`), assert `document.fullscreenElement` matches. Move mouse → assert transport bar visible. Idle 3s → assert transport bar hidden.

**Verification:**
- Manual cross-browser: Safari, Chrome, Firefox. Fullscreen enters and exits cleanly. Mouse-wake works.

**Commit:**
```
feat: fullscreen showcase mode with auto-hide chrome

⛶ FULL toggles Fullscreen API on the bird container. Panels and
nav hide; transport bar fades after 2.5s of mouse idle, returns
on mousemove or keydown. ESC exits via the browser.
```

---

## Chunk 8 — GENERATE VARIATION

**Goal:** ⟲ VARIATION samples a one-off preset within the active tab's vibe constraints. Result morphs in like a normal preset and can be starred to save.

**Files:**
- Create: `fix/src/components/tunnel/vibes.ts` — per-tab `VibeConstraint`.
- Create: `fix/src/components/tunnel/sampler.ts` — pure function `sampleVariation(constraint): Partial<TunnelParams>`.
- Create: `fix/src/components/tunnel/__tests__/sampler.test.ts`
- Modify: `fix/src/components/tunnel/TransportBar.tsx` — wire ⟲ VARIATION button.
- Modify: `fix/src/components/AsteroidScene.tsx` — accept and route a "transient preset" alongside catalog preset.

**Vibe schema:**

```ts
// fix/src/components/tunnel/vibes.ts
import type { PatternName, TunnelParams } from '../TunnelCanvas'
import type { TabId } from './presets'

export type VibeConstraint = {
  paletteOptions: { colorA: string; colorB: string; name: string }[]
  patternOptions: (PatternName | null)[]
  speedRange: [number, number]
  kaleidoRange: [number, number]
  helixRange: [number, number]
  chromaRange: [number, number]
  hueShiftRange: [number, number]
  strobeRateRange: [number, number]
  cellBlurRange: [number, number]
  rollRange: [number, number]
  ringsRange: [number, number]
  densityRange: [number, number]
}

export const VIBES: Record<Exclude<TabId, 'myset'>, VibeConstraint> = {
  signature: { /* moderate ranges across the board */ },
  psychedelic: { /* fractal/marble heavy, chromatic > 0.2, hueShift > 0.3 */ },
  // ... 8 total
}
```

**Tasks:**
1. Hand-author the 8 `VibeConstraint` objects. Derive ranges by averaging the 12 presets per tab + widening 20%.
2. `sampleVariation(constraint, rng = Math.random)`:
   ```ts
   export function sampleVariation(c: VibeConstraint, rng = Math.random): Partial<TunnelParams> {
     const palette = c.paletteOptions[Math.floor(rng() * c.paletteOptions.length)]
     return {
       colorA: palette.colorA,
       colorB: palette.colorB,
       patternA: c.patternOptions[Math.floor(rng() * c.patternOptions.length)],
       patternB: c.patternOptions[Math.floor(rng() * c.patternOptions.length)],
       speed: lerpScalar(c.speedRange[0], c.speedRange[1], rng()),
       kaleidoscope: Math.round(lerpScalar(c.kaleidoRange[0], c.kaleidoRange[1], rng())),
       helix: lerpScalar(c.helixRange[0], c.helixRange[1], rng()),
       chromatic: lerpScalar(c.chromaRange[0], c.chromaRange[1], rng()),
       hueShift: lerpScalar(c.hueShiftRange[0], c.hueShiftRange[1], rng()),
       strobeRate: lerpScalar(c.strobeRateRange[0], c.strobeRateRange[1], rng()),
       cellBlur: lerpScalar(c.cellBlurRange[0], c.cellBlurRange[1], rng()),
       roll: lerpScalar(c.rollRange[0], c.rollRange[1], rng()),
       rings: Math.round(lerpScalar(c.ringsRange[0], c.ringsRange[1], rng())),
       density: Math.round(lerpScalar(c.densityRange[0], c.densityRange[1], rng()) / 2) * 2,
     }
   }
   ```
3. Failing test: with a seeded RNG, `sampleVariation(VIBES.psychedelic, seededRng())` returns the same object each time. Snapshot it.
4. Failing test: every sampled variation respects all bounds (no value out of range).
5. Wire ⟲ VARIATION → `setActivePreset({ id: 'variation.<timestamp>', tab: activeTab, name: 'Variation', paletteName: palette.name, values: sample })`. Morph applies normally.
6. Display "Variation" in the now-playing line; show ⟲ icon to indicate it's a one-off.

**Verification:**
- Click ⟲ VARIATION 5 times on each tab — visually 5 different presets that all clearly belong to the tab's vibe.

**Commit:**
```
feat: GENERATE VARIATION sampler bound to per-tab vibe constraints

Each tab carries a VibeConstraint (palette pool, pattern pool, range
limits per param). ⟲ VARIATION samples within bounds, applies via
the normal morph path. Output is a transient preset until starred.
```

---

## Chunk 9 — INTENSITY + motion safety

**Goal:** CALM/FULL/OVERDRIVE multiplier layer; REDUCED FLASH clamp; prefers-reduced-motion auto-engage; ⚠ flash badges; first-click confirm prompt.

**Files:**
- Create: `fix/src/components/tunnel/intensity.ts` — pure function `applyIntensity(p, level)`.
- Create: `fix/src/components/tunnel/safety.ts` — pure function `applyReducedFlash(p)`.
- Create: `fix/src/components/tunnel/__tests__/intensity.test.ts`
- Create: `fix/src/components/tunnel/__tests__/safety.test.ts`
- Create: `fix/src/components/tunnel/FlashConfirmDialog.tsx`
- Modify: `fix/src/components/tunnel/TransportBar.tsx` — INTENSITY 3-button group.
- Modify: `fix/src/components/tunnel/TunePanel.tsx` — REDUCED FLASH toggle row.
- Modify: `fix/src/components/tunnel/PresetsPanel.tsx` — ⚠ badge on `flashWarn` tiles.
- Modify: `fix/src/components/AsteroidScene.tsx` — final params resolution chain `defaults → preset → intensity → reduced-flash`.

**Intensity table (from design doc):**

```ts
// fix/src/components/tunnel/intensity.ts
export type Intensity = 'calm' | 'full' | 'overdrive'

const TABLE: Record<Intensity, {
  speed: number; strobeRate: number; chromatic: number;
  hueShift: number; wobble: number; cellBlurDelta: number;
}> = {
  calm: { speed: 0.5, strobeRate: 0, chromatic: 0.3, hueShift: 0.3, wobble: 0.6, cellBlurDelta: 0.05 },
  full: { speed: 1.0, strobeRate: 1.0, chromatic: 1.0, hueShift: 1.0, wobble: 1.0, cellBlurDelta: 0 },
  overdrive: { speed: 1.6, strobeRate: 1.5, chromatic: 2.0, hueShift: 2.0, wobble: 1.4, cellBlurDelta: -0.05 },
}

export function applyIntensity(p: TunnelParams, level: Intensity): TunnelParams {
  const m = TABLE[level]
  return {
    ...p,
    speed: p.speed * m.speed,
    strobeRate: level === 'overdrive' && p.strobeRate > 0
      ? Math.max(4, p.strobeRate * m.strobeRate)
      : p.strobeRate * m.strobeRate,
    chromatic: p.chromatic * m.chromatic,
    hueShift: p.hueShift * m.hueShift,
    wobble: p.wobble * m.wobble,
    cellBlur: Math.max(0, p.cellBlur + m.cellBlurDelta),
  }
}
```

**Tasks:**
1. Failing test for `applyIntensity`: at `'full'` the output equals input exactly. CALM halves `speed` and zeros `strobeRate`. OVERDRIVE doubles `chromatic`. cellBlur clamps to ≥ 0.
2. Failing test for `applyReducedFlash`: with input `strobeRate=8, chromatic=1, hueShift=1`, output is `{ strobeRate: 1.5, chromatic: 0.3, hueShift: 0.3 }`. With safe input, output is unchanged.
3. Implement both. Tests pass.
4. INTENSITY 3-button group in `TransportBar`. Persisted via `usePersistedString('chrestenson.tunnel.intensity', 'full')`.
5. REDUCED FLASH toggle in `TunePanel`. Persisted; default = `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
6. ⚠ badge on preset tiles where `flashWarn === true`.
7. `FlashConfirmDialog`: shown when user clicks a `flashWarn` preset for the first time (gated on `localStorage.flashConfirmed === '1'`). Two buttons: "Continue" and "Use Reduced Flash."
8. `AsteroidScene` resolves params each render: `applyReducedFlash(applyIntensity({...DEFAULTS, ...preset.values}, intensity))`. Hand to `<TunnelCanvas>`.

**Verification:**
- Toggle CALM/FULL/OVERDRIVE on a RAVE preset — visible difference per click.
- Toggle REDUCED FLASH — strobe slows visibly.
- Boot with `prefers-reduced-motion` set in DevTools → REDUCED FLASH starts on.
- Click a RAVE preset on a fresh profile → confirm dialog appears. Dismiss → never shows again.

**Commit:**
```
feat: INTENSITY (CALM/FULL/OVERDRIVE) + motion safety

Global multiplier layer applied after the preset resolves; REDUCED
FLASH is a final clamp on top. prefers-reduced-motion auto-enables
REDUCED FLASH on first load. RAVE/GLITCH presets carry a ⚠ badge
and prompt confirmation on first click.
```

---

## Chunk 10 — Favorites + MY SET

**Goal:** Tiny ★ on each preset tile + on the now-playing line. localStorage-backed. MY SET tab appears as a 9th tab once any preset is favorited. Variation snapshots can be starred to save (they get a generated id).

**Files:**
- Create: `fix/src/components/tunnel/useFavorites.ts`
- Create: `fix/src/components/tunnel/__tests__/useFavorites.test.ts`
- Modify: `fix/src/components/tunnel/TabBar.tsx` — render MY SET tab when `favorites.length > 0`.
- Modify: `fix/src/components/tunnel/PresetsPanel.tsx` — ★ button on each tile.
- Modify: `fix/src/components/tunnel/TransportBar.tsx` — ★ button on now-playing line.
- Modify: `fix/src/components/tunnel/presets.ts` — add `getPresetById(id, customs)` resolver that checks both `PRESETS` and the favorites' saved snapshots.

**Tasks:**
1. `useFavorites()` hook returns `{ favorites: Preset[], toggle(preset), isFavorite(id) }`. Stores under `chrestenson.tunnel.favorites`. For variation presets (id starts with `variation.`), saves the full snapshot under `chrestenson.tunnel.savedVariations`.
2. Failing test: starring a catalog preset stores only its id; starring a variation stores the full preset object.
3. Failing test: `isFavorite(id)` returns true iff present.
4. Implement the hook. Tests pass.
5. ★ button on each PresetsPanel tile + on TransportBar now-playing line. Active state = filled star.
6. MY SET tab in TabBar — only renders when `favorites.length > 0`. Click → render the favorites list (catalog presets + saved variations) in PresetsPanel.

**Verification:**
- Star 3 presets across different tabs → MY SET tab appears.
- Refresh page → MY SET tab still there with the same 3.
- Unstar all 3 → MY SET tab disappears.
- Star a Variation → reload → MY SET still has the variation, named "Variation" with the right palette.

**Commit:**
```
feat: favorites + conditional MY SET tab

Star button on tile and now-playing. Catalog presets stored as ids;
variation presets stored as full snapshots. MY SET tab appears as a
9th tab when favorites.length > 0; vanishes when emptied.
```

---

## Chunk 11 — Shareable URLs

**Goal:** Hash-based encoding round-trips active preset + intensity. Variations encoded as base64 JSON.

**Files:**
- Create: `fix/src/components/tunnel/share.ts`
- Create: `fix/src/components/tunnel/__tests__/share.test.ts`
- Modify: `fix/src/components/tunnel/TransportBar.tsx` — SHARE button.
- Modify: `fix/src/components/AsteroidScene.tsx` — parse hash on mount, write hash on change.

**Encoding:**

```ts
// fix/src/components/tunnel/share.ts
export function encodePreset(presetId: string, intensity: Intensity): string {
  const params = new URLSearchParams()
  params.set('p', presetId)
  if (intensity !== 'full') params.set('i', intensity)
  return '#' + params.toString()
}

export function encodeVariation(values: Partial<TunnelParams>, intensity: Intensity): string {
  const compact = compactPartial(values) // strip defaults, shorten keys
  const json = JSON.stringify(compact)
  const b64 = btoa(json).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  const params = new URLSearchParams()
  params.set('v', b64)
  if (intensity !== 'full') params.set('i', intensity)
  return '#' + params.toString()
}

export function decodeHash(hash: string): {
  presetId?: string
  variation?: Partial<TunnelParams>
  intensity?: Intensity
} | null {
  // ...inverse of the above
}
```

**Tasks:**
1. Failing test for `encodePreset` + `decodeHash` round-trip on catalog id.
2. Failing test for `encodeVariation` + `decodeHash` round-trip on a real variation.
3. Failing test: malformed hashes (`#v=garbage`, `#p=nonexistent`) return `null`. Caller falls back to default.
4. Implement. Tests pass.
5. SHARE button: `await navigator.clipboard.writeText(window.location.origin + window.location.pathname + encodePreset(...))`. Inline confirmation toast "Copied!".
6. On AsteroidScene mount, read `location.hash`, decode, apply via morph (so the load animation feels alive). On every `setActivePreset`, `setIntensity` → `history.replaceState(null, '', encodePreset(...))` to update URL silently.

**Verification:**
- Star a variation in tab GLITCH at OVERDRIVE → click SHARE → open URL in incognito → same preset loads with same intensity.
- Manually edit hash to `#p=invalid` → page falls back to default without breaking.

**Commit:**
```
feat: shareable hash URLs for active preset + variations

#p=<id>&i=<intensity> for catalog presets; #v=<base64-json>&i=<...>
for variations. SHARE button copies to clipboard. URL updates silently
via history.replaceState on every preset/intensity change. Malformed
hashes fall back to defaults.
```

---

## Chunk 12 — Visual QA

**Goal:** Walk all 96 presets at all 3 intensities + reduced-flash on/off. Verify nothing throws, nothing renders black, transitions are smooth.

**Files:**
- Create: `fix/e2e/tunnel-instrument-qa.spec.ts`

**Approach:**

The Playwright suite walks through every preset systematically. Per preset, per intensity:

```ts
test('every preset renders without error at every intensity', async ({ page }) => {
  await page.goto('/')
  await page.locator('#bird').scrollIntoViewIfNeeded()
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  for (const tabId of TAB_ORDER) {
    await page.click(`[data-testid="tab-${tabId}"]`)
    for (const preset of PRESETS.filter(p => p.tab === tabId)) {
      for (const intensity of ['calm', 'full', 'overdrive'] as const) {
        await page.click(`[data-testid="intensity-${intensity}"]`)
        await page.click(`[data-testid="preset-${preset.id}"]`)
        await page.waitForTimeout(800) // allow morph + a few frames
        // pixel sanity: bg canvas should not be 100% transparent
        const allBlack = await page.evaluate(() => {
          const c = document.querySelector('#bird canvas') as HTMLCanvasElement
          const gl = c.getContext('webgl2') as WebGL2RenderingContext
          const px = new Uint8Array(4)
          gl.readPixels(c.width / 2, c.height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px)
          return px[3] === 0 && px[0] === 0 && px[1] === 0 && px[2] === 0
        })
        expect(allBlack, `${preset.id} @ ${intensity}`).toBe(false)
        expect(errors).toEqual([])
      }
    }
  }
})
```

**Tasks:**
1. Add `data-testid` attributes to TabBar, PresetsPanel tiles, IntensityButtons in `TransportBar`, the bird canvas wrapper.
2. Author the e2e test above. Expect first run to surface 1-3 broken presets (typical for a 96-preset library) — fix them in `presets.ts`.
3. Add e2e: DEMO mode runs through 12 presets in a tab without errors (use `page.evaluate(() => { /* hook-listen for setActivePreset */ })` and `waitForTimeout(8500)` between each).
4. Add e2e: REDUCED FLASH applies on a RAVE preset — confirm `strobeRate` uniform reads ≤ 1.5 via JS in the page.
5. Add e2e: SHARE button + decode round-trip via `page.evaluate`.

**Verification:**
- `npx playwright test` all green.

**Commit:**
```
test: e2e visual QA across 96 presets × 3 intensities

Pixel sanity check (no all-transparent canvas), console-error gate,
DEMO cycle, REDUCED FLASH clamp, SHARE round-trip.
```

---

## Chunk 13 — Deploy

**Goal:** Get the instrument live.

**Tasks:**
1. From the worktree: `npm run build && npm run preview` → visit local preview at `:4173`. Walk every tab and DEMO each one.
2. `git push origin <branch-name>` → Vercel auto-creates a preview deploy.
3. Open the preview URL → walk every tab and DEMO each one again on real network conditions.
4. Verify the live-site fix from `e3f6472` is preserved (no regression to all-black canvas).
5. Verify on mobile (iOS Safari + Android Chrome) — panels are closed by default, transport bar is full-width and doesn't cover the bird, fullscreen request prompts correctly.
6. Merge to `main` → confirm production deploy.
7. Smoke-test production for 5 minutes — open with various URL hashes, share a few, verify no errors in the field.

**Verification:**
- Production `https://www.chrestenson.com/` → bird section behaves identically to local.

**Commit:**
- No code change in this step; this is the merge + deploy. Commit happens via the PR merge.

---

## Notes for the executing engineer

**Test discipline:** Vitest tests live next to source under `__tests__/`. Run with `npx vitest run <path>`. Run all: `npx vitest run`. Watch mode during dev: `npx vitest`. Playwright runs against `npm run preview` on `:4173` — the config auto-spawns the preview server.

**Don't braid changes.** The user has been explicit: each chunk is one PR. If you find a bug while implementing chunk N that lives in chunk N-2's code, write it down and fix it in a separate small commit.

**HSL color math:** in chunk 4, write `lerpHSL` carefully. The shortest-path hue lerp matters — going from `#ff0000` (hue 0) to `#0000ff` (hue 240) should pass through magenta, not lime. Use `(h2 - h1 + 540) % 360 - 180` to get the signed shortest delta.

**Mobile:** the bird section uses fixed canvas size at the moment. Don't try to make the panels responsive in chunk 3 — just make them collapse. Real mobile polish is a separate task and out of this plan's scope.

**Performance:** The morph runs per-frame at 60fps. `morphParams` returns a new object every frame; that's fine — `<TunnelCanvas>` already absorbs new param objects each frame via `useFrame`. Don't try to micro-optimize.

**Reference always:** `docs/plans/2026-05-07-tunnel-instrument-design.md` is the source of truth for visual intent. If a chunk feels ambiguous, the design doc has the answer — or escalate.
