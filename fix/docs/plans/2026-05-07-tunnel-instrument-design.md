# Hummingbird Tunnel — Visual Instrument Design

**Date:** 2026-05-07
**Component:** `fix/src/components/TunnelCanvas.tsx` + `fix/src/components/AsteroidScene.tsx`
**Status:** Approved, ready for implementation plan

> **2026-05-09 build update:** implementation has moved beyond the original
> preset/instrument plan into generator, saved looks, URL restore, mask, and
> Photoshop-style overlay-layer work. Read
> [`2026-05-09-tunnel-instrument-build-notes.md`](./2026-05-09-tunnel-instrument-build-notes.md)
> before continuing from this design doc.

## Goal

Turn the hummingbird-section motion-art generator from a slide-show of presets into a **live visual instrument**. The user lands on a full-bleed live tunnel; controls feel peripheral; preset selection is morphing rather than reloading; demo and variation modes make the engine feel alive, directed, controllable.

## Non-goals

- MANDALA mode is out of scope (separate iteration).
- No new shader patterns. The existing 16 patterns + 8 effects are enough surface area.
- No backend, no accounts. Favorites and panel state in `localStorage` only.

## Tab structure

Eight permanent tabs, each surfacing a different facet of the engine. A ninth `MY SET` tab appears once the user has favorited ≥1 preset.

| Tab | Capability copy (shown when active) |
|-----|-------------------------------------|
| SIGNATURE | The instrument's anchor presets — broad strokes across every capability. |
| PSYCHEDELIC | Liquid color, fractal drift, chromatic separation, hue-shift motion. |
| KALEIDO | Mirror geometry from 4-fold to 16-fold symmetry, sharp pattern cells. |
| COSMIC | Deep palettes, slow helix twist, long fog depth, gentle wave. |
| RAVE | Strobe presets, high-contrast neon, pulse and rainbow modes. |
| GLITCH | Chromatic split, signal-collapse, invert-mode flash, broken pattern shifts. |
| SACRED | Gold/jewel tones, slow rotation, diamond/cross/rings under heavy symmetry. |
| CHROMA | Pure color motion — continuous hue drift, no patterns, soft cell-blur. |
| MY SET | (Conditional) starred presets, in star-order. |

Each tab carries 12 hand-tuned presets, target ~96 total. Tabs that lean on flash (`RAVE`, `GLITCH`) carry a ⚠ flash badge.

## Preset

A preset is a `Partial<TunnelParams>` plus three pieces of metadata:

```ts
type Preset = {
  id: string                       // 'rave.neon-cathedral'
  name: string                     // 'Neon Cathedral'
  paletteName: string              // 'Gold/Pearl'  — hand-authored
  values: Partial<TunnelParams>
  flashWarn?: boolean              // RAVE/GLITCH presets default true
}
```

Sample names per tab (full 96 in implementation):

- SIGNATURE: Default Sun · Lattice · First Light · Standard Hyper · Open Field · Honest Helix · Long Hall · Slow Mirror · Fair Wheel · Bright Echo · Plain Run · Soft Lattice
- PSYCHEDELIC: Liquid Saints · Velvet Static · Solar Bloom · Marble Sermon · Acid Bath · Fractal Hymn · Hue Tide · Color Sermon · Dripped Sun · Chromatic Spill · Inner Eye · Wax Bloom
- KALEIDO: Temple Glass · Twelve Petals · Stained Hex · Mandala Drift · Octagon Shrine · Hex Cathedral · Sixteen-Fold · Quad Mirror · Dodec Spin · Petal Storm · Glass Wheel · Crystal Lattice
- COSMIC: Deep Orbit · Slow Nova · Black Lotus · Outer Spiral · Long Fall · Helix Drift · Comet Bath · Void Tide · Outer Ring · Long Pull · Slow Star · Eclipse
- RAVE: Neon Cathedral · Police Line · Chrome Fever · Pulse Cathedral · Rave Saint · Strobe Sun · Hot Mirror · Acid Strobe · Mosh Rainbow · Pulse Hex · Hard Pulse · Rainbow Riot
- GLITCH: Signal Collapse · Opal Circuit · Broken Channel · Drift Error · Chrome Bleed · Channel Tear · Static Storm · Signal Saint · Frame Skip · Drift Channel · Hex Crash · Color Tear
- SACRED: Gold Vesica · Liquid Saints · Sun Wheel · Orphic Petal · Temple Bloom · Quiet Halo · Slow Sun · Long Cathedral · Honey Glass · Vesica Drift · Old Halo · Slow Petal
- CHROMA: Hue Drift · Blacklight Garden · Color Sermon · Pure Bleed · Soft Drift · Cool Bath · Warm Bath · Long Spectrum · Slow Wash · Pure Hue · Petal Color · Spectrum Drift

(Names are anchors; tweakable during implementation.)

## Layout — instrument first

```
╭──────────────────────────────────────────────────╮
│  HUMMINGBIRD                          PRESETS ▸ │  ← collapsible
│                                          TUNE ▸ │  ← collapsible
│                                                  │
│              [live tunnel + bird]               │
│                                                  │
│                                                  │
│  Neon Cathedral · Kaleido 12x · Hue Drift · ★   │  ← now-playing
│  ▶ DEMO   ⟲ VARIATION   CALM · FULL · OVERDRIVE  │  ← transport
│                                       ⛶ FULL    │
╰──────────────────────────────────────────────────╯
```

### Transport bar (always visible)

Anchored to the bottom of the hummingbird section, full-width. Houses:

- **Now-playing line:** `<preset name> · <auto chip 1> · <auto chip 2> · <auto chip 3> · <palette name> · ★/☆`
- **Transport row:** `▶ DEMO`, `⟲ VARIATION`, `CALM · FULL · OVERDRIVE` (3-button group), `⛶ FULLSCREEN`
- Hidden in fullscreen until mouse-wake.

### PRESETS panel (collapsible right)

Default-open desktop, default-closed mobile. Width ~360px. Contents:

- Tab strip across the top (8 tabs + conditional MY SET).
- Capability copy line under active tab.
- 12 preset tiles in a 3×4 grid. Each tile: preset name, 3 auto-chips, ★ button, optional ⚠ flash badge.
- localStorage-backed open/closed state.

### TUNE panel (collapsible right, separate from PRESETS)

Same defaults and width as PRESETS. Contains the existing parameter sliders (speed, roll, wobble, fov, depth, strobe, flash, transparent cell, color mode, cell A/B, rings, section, hole, blur, helix, wave, bend, kaleido, chroma, hue spin), plus the new `REDUCED FLASH` toggle. Independent open/closed state from PRESETS.

When both panels are open, they stack vertically on the right edge.

## Engine mechanics

### Morph (preset click)

600ms transition between current params and target params:

- **Scalars** (`speed`, `roll`, `fov`, `kaleidoscope`, `chromatic`, `hueShift`, `wobble`, `helix`, `wave`, `bend`, `cellBlur`, etc.): linear lerp.
- **Colors** (`colorA`, `colorB`, `strobeColor`): HSL lerp (RGB lerp goes through gray midpoints; HSL stays saturated).
- **Categorical** (`patternA`, `patternB`, `transparentCell`, `strobeMode`, `direction`, `bendDir`): snap at the midpoint.
- **Blur bloom**: `cellBlur` is overridden during morph. Bloom curve adds 0 → 0.2 → 0 (sin^2 over 0..1 progress) on top of the lerped value. The bloom peaks at midpoint, hiding the categorical snap.

Morph is the primitive. DEMO uses the same morph at 8000ms; preset clicks at 600ms.

### DEMO

Click `▶ DEMO` → cycles through the active tab's 12 presets in shuffled order, 8s morph between each, looping. Click again to stop. Any manual control change (preset click, slider drag, intensity change, tab change) stops DEMO. Disabled in `MY SET` if `MY SET` is empty.

### GENERATE VARIATION

Each tab carries a **vibe constraint**:

```ts
type VibeConstraint = {
  paletteOptions: { colorA: string; colorB: string; name: string }[]   // ~6 per tab
  patternOptions: (PatternName | null)[]
  speedRange: [number, number]
  kaleidoRange: [number, number]
  helixRange: [number, number]
  chromaRange: [number, number]
  hueShiftRange: [number, number]
  strobeRateRange: [number, number]
  cellBlurRange: [number, number]
}
```

`⟲ VARIATION` samples uniformly from the active tab's constraint into a transient preset. Result is one-off; user can star it to save into `MY SET`. Same 600ms morph applies.

### INTENSITY (CALM · FULL · OVERDRIVE)

Three-button group, mutually exclusive. Global multiplier applied on top of the active preset's resolved values:

| Param | CALM | FULL | OVERDRIVE |
|-------|------|------|-----------|
| `speed` | × 0.5 | × 1.0 | × 1.6 |
| `strobeRate` | × 0 | × 1.0 | × 1.5 (min 4 if base > 0) |
| `chromatic` | × 0.3 | × 1.0 | × 2.0 |
| `hueShift` | × 0.3 | × 1.0 | × 2.0 |
| `wobble` | × 0.6 | × 1.0 | × 1.4 |
| `cellBlur` | + 0.05 | + 0 | − 0.05 (clamp ≥ 0) |

`FULL` is the preset as authored — the default state. CALM and OVERDRIVE persist in `localStorage` per-user.

### Motion safety

- **`prefers-reduced-motion`**: detected on mount. If true, REDUCED FLASH engages automatically and INTENSITY is locked to CALM until the user changes it manually.
- **REDUCED FLASH toggle**: lives in the TUNE panel. When on, clamps `strobeRate ≤ 1.5`, `chromatic ≤ 0.3`, and `hueShift ≤ 0.3`. Applied as a final post-resolve clamp after preset + intensity.
- **⚠ badge**: presets carry `flashWarn: true`. Tile shows a small `⚠ FLASH` chip. First click on any flashWarn preset prompts an inline confirm: *"This preset includes flashing visuals. Continue?"* Choice persists.
- Flash warnings + reduced-flash apply to DEMO and VARIATION cycles too.

### FULLSCREEN

`⛶ FULL` requests Fullscreen API on the bird section's wrapper element. While fullscreen:

- All chrome (PRESETS panel, TUNE panel, transport bar, navigation) hides.
- Transport bar reappears on mouse-wake (mousemove within 1000ms; fades after 2500ms idle).
- ESC exits.
- Demo state persists across fullscreen enter/exit.

### Shareable URLs

A `SHARE` button in the now-playing line copies a URL that round-trips the current state. Two encodings:

- **Preset state** — `#p=<tab>.<preset-id>&i=<intensity>` for any of the 96 catalog presets. Compact, human-readable.
- **Variation state** — `#v=<base64>` where the base64 payload is a compact JSON of the resolved `TunnelParams` partial (only fields that differ from `TUNNEL_DEFAULTS`, with shortened keys). Used for `GENERATE VARIATION` outputs the user wants to share before starring.

On mount, parse `location.hash`. If a preset id matches, apply via the morph engine (so the load animation feels alive, not snap-on). If a variation, decode + apply. Failure to decode falls back silently to the default preset. `History.replaceState` is used as the user navigates so back-button doesn't accumulate state churn.

`localStorage.activePreset` only writes on explicit user action; URL takes priority on first paint.

### Auto-derived chips

Per preset, derive up to 3 chips from resolved params:

- `kaleidoscope > 0` → `Kaleido <N>x` (rounded)
- `helix !== 0` → `Helix Twist`
- `wave !== 0` → `Wave`
- `bend !== 0` → `Curved`
- `chromatic > 0.05` → `Chromatic Split`
- `hueShift > 0.05` → `Hue Drift`
- `strobeRate > 0` → `Pulse <N>/s`
- `cellBlur > 0.2` → `Soft Cells`
- `patternA === 'fractal'` or `patternB === 'fractal'` → `Fractal`
- `patternA === 'marble'` → `Marble Flow`
- `transparentCell !== 'none'` → `Transparent Cell`

Take the top 3 in priority order. Append the hand-authored `paletteName` as the closing chip.

## State + persistence

`localStorage` keys (all under `chrestenson.tunnel.` prefix):

- `chrestenson.tunnel.presetsOpen`: `'1' | '0'` — PRESETS panel open state. Default: open desktop, closed mobile.
- `chrestenson.tunnel.tuneOpen`: `'1' | '0'` — TUNE panel open state. Same default.
- `chrestenson.tunnel.intensity`: `'calm' | 'full' | 'overdrive'`. Default: `'full'`.
- `chrestenson.tunnel.reducedFlash`: `'1' | '0'`. Default: matches `prefers-reduced-motion`.
- `chrestenson.tunnel.flashConfirmed`: `'1' | '0'`. Has the user accepted the flash prompt once.
- `chrestenson.tunnel.favorites`: JSON array of preset IDs.
- `chrestenson.tunnel.activeTab`: tab id, restores on reload.
- `chrestenson.tunnel.activePreset`: preset id, restores on reload.
- `chrestenson.tunnel.customSavedVariations`: JSON array of starred-variation snapshots (since variations aren't preset IDs).

## Implementation order

Designed so each step ships value and the build never breaks. Each step is one PR / one logical commit.

1. **Current engine audit.** Map every TunnelCanvas param consumer, every mount point, every shader uniform. Record current preset → param resolution flow. No code changes — produces a short audit doc that the next steps reference.
2. **Preset schema.** Introduce `Preset` type (id, name, paletteName, values, flashWarn). Migrate existing 18 presets into the new schema with placeholder ids. No UI change.
3. **Tab taxonomy.** 8 tabs + capability copy + tile layout (3×4 grid). Route existing presets into tabs. Sub-12 per tab is fine here.
4. **Morph engine.** Scalar/HSL/categorical morph + blur bloom inside `Tunnel` component. Replace instant preset apply with 600ms morph. Same primitive will power DEMO at 8000ms.
5. **Layout shell.** Transport bar (DOM only, no logic yet), PRESETS + TUNE panel split, default-open desktop / closed mobile, localStorage open state.
6. **96 preset library.** Hand-author the full list per tab. Pure data PR — easiest to review independently.
7. **Auto-chips.** Derive chips from resolved params; render in tile + now-playing line.
8. **DEMO mode.** Cycle current tab's presets at 8000ms morph; transport button wired up.
9. **GENERATE VARIATION.** Per-tab vibe constraints + sampling logic. Star-to-save path scaffolded.
10. **Intensity + motion safety.** CALM/FULL/OVERDRIVE multiplier layer, REDUCED FLASH clamp, prefers-reduced-motion auto-engage, ⚠ badge, first-click confirm prompt, persistence.
11. **FULLSCREEN.** Fullscreen API + chrome auto-hide + mouse-wake.
12. **Favorites + MY SET.** Star button on tile + now-playing; conditional 9th tab; variation snapshot save path.
13. **Shareable URLs.** Hash-based preset + variation encoding, History.replaceState integration, SHARE button.
14. **Visual QA.** Walk all 96 presets at all 3 intensities + reduced-flash on/off; verify morph at 600ms and 8000ms; verify mobile layout; verify fullscreen across Safari/Chrome/Firefox.
15. **Deploy.** Vercel preview → check live → promote to production.

Steps 1–4 unblock everything else. Step 6 is the labor-intensive pure-data step. Steps 7–13 each add one independent feature and can be parallelized if needed.

## Out of scope

- MANDALA mode (parallel iteration).
- Custom user-uploaded textures.
- Sharing / export of variations.
- Audio-reactivity.
- Server-side persistence.
