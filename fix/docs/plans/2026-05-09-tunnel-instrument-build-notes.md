# Hummingbird Tunnel Visual Instrument - Build Notes

**Date:** 2026-05-09
**Branch:** `feat/tunnel-instrument`
**Worktree:** `/Users/mxmbp/chrestenson.2026/.worktrees/tunnel-instrument`
**Scope:** Chrestenson.com hummingbird/tunnel visual engine

## Product Reframe

The tunnel is no longer a preset carousel. The product model is now:

1. Choose a visual world / genre.
2. Generate a constrained recipe.
3. Save the exact look when the image hits.
4. Reopen it from MY SET.
5. Share the exact seed / state.
6. Use the result fullscreen as a live visual, identity piece, poster source, or show-mode background.

The important shift: presets are curated doors into the visual universe, not the universe itself. The real creative loop is generator -> discovery -> save -> share.

## Why Static Presets Are Not Enough

The engine's combination space is effectively infinite. The biggest dimensions are:

- **Cell A x Cell B layering:** independent patterns, images, colors, and transparency behavior per cell.
- **Arbitrary colors:** color A, color B, and strobe color are full color inputs; palette swatches are only shortcuts.
- **Rings x section structure:** changes the tunnel architecture, not just the look.
- **Image sources:** map / concrete today, but this opens a much larger texture asset path.
- **Strobe system:** rate, duty, color, target, and mode form a performance engine by themselves.
- **Transparent cell:** off / A / B turns one cell into a mask/window and changes dominance between layers.
- **Camera / space controls:** speed, roll, wobble, FOV, depth/fog, hole, helix, wave, bend, bend direction.
- **Shader effects:** kaleidoscope, chromatic, hue spin.
- **Overlays:** true Photoshop-style SVG layers above the tunnel.

The rough math from visible controls already exceeds a million discrete combinations before sliders and arbitrary RGB colors. The product needs constrained generation and curation, not manual hand-authoring forever.

## Commits Landed

Recent branch spine:

| Commit | Summary |
| --- | --- |
| `b5013d5` | Extracted typed preset schema and migrated the original 18 presets. |
| `0218d14` | Split tunnel UI into `TransportBar`, `PresetsPanel`, and `TunePanel`. |
| `e563f2d` | Added 600ms morph engine with HSL color lerp, categorical snap, cellBlur bloom, and DEMO mode. |
| `a13e52f` | Fixed `applyPreset` to resolve target params against `TUNNEL_DEFAULTS`, not current params. |
| `823c552` | Stabilized `useTunnelEngine`. |
| `b66a868` | Added 96 hand-tuned presets across 8 tabs. |
| `c10ea8b` | Tuned `sacred.gold-vesica` color pair. |
| `0b8c835` | Review nits: `solar-bloom` flash warning and `slow-wash` hue shift. |
| `6b3ff05` | Auto-derived chips per preset and now-playing line. |
| `b46d243` | Fullscreen showcase mode with auto-hide chrome. |
| `0069ca1` | GENERATE VARIATION sampler bound to per-tab vibe constraints. |
| `8902ba0` | Generator/save/share/MY SET and first mask layer checkpoint. |

## Current Worktree State

There are uncommitted changes on top of `8902ba0`.

Modified tracked files:

- `fix/src/components/AsteroidScene.tsx`
- `fix/src/components/tunnel/PresetsPanel.tsx`
- `fix/src/components/tunnel/TunePanel.tsx`
- `fix/src/components/tunnel/generator/generateLook.ts`
- `fix/src/components/tunnel/masks/MaskLayer.tsx`
- `fix/src/components/tunnel/masks/maskAssets.ts`
- `fix/src/components/tunnel/masks/maskState.ts`
- `fix/src/components/tunnel/savedLooks.ts`
- `fix/src/components/tunnel/urlState.ts`
- `fix/tsconfig.tsbuildinfo`

Untracked overlay work:

- `fix/src/components/tunnel/overlays/OverlayStack.tsx`
- `fix/src/components/tunnel/overlays/OverlaysSection.tsx`
- `fix/src/components/tunnel/overlays/assetRegistry.ts`
- `fix/src/components/tunnel/overlays/migrate.ts`
- `fix/src/components/tunnel/overlays/types.ts`

Also present as untracked generated artifacts:

- `tsconfig.node.tsbuildinfo`
- `tsconfig.tsbuildinfo`
- `vite.config.d.ts`
- `vite.config.js`

Do not blindly commit the generated root artifacts until reviewed.

## Implemented Capabilities

### Engine audit

`fix/docs/plans/2026-05-07-tunnel-engine-audit.md` maps every `TunnelParams` field, shader uniform, and UI writer. It also identified dead controls at the time of audit: `kaleidoscope`, `chromatic`, and `hueShift`.

### Shader capability unlock

The dead controls were unlocked before the preset/library push:

- `kaleidoscope`
- `chromatic`
- `hueShift`

These are now core to KALEIDO, SACRED, GLITCH, PSYCHEDELIC, and CHROMA. Presets should not be reduced to color/speed variations.

### Preset system

The preset model moved into `fix/src/components/tunnel/presets.ts`:

- 8 fixed tabs: SIGNATURE, PSYCHEDELIC, KALEIDO, COSMIC, RAVE, GLITCH, SACRED, CHROMA.
- Conditional MY SET tab.
- 96 authored presets.
- `flashWarn` support.
- Palette names and chip metadata surface in UI.

The key critique remains: authored presets are useful as hero looks, but the engine is too large for static presets to be the whole product.

### Morph and demo

The morph engine replaced snap changes:

- Scalar lerp.
- HSL color interpolation.
- Categorical midpoint snap.
- Cell blur bloom to hide hard categorical changes.
- DEMO uses the same morph primitive on a longer cadence.

### Generator

Generator files:

- `fix/src/components/tunnel/generator/rng.ts`
- `fix/src/components/tunnel/generator/names.ts`
- `fix/src/components/tunnel/generator/generateLook.ts`

Behavior:

- Deterministic seed via `mulberry32`.
- `generateLook(genre, seed, opts)` creates a constrained look for the active genre.
- `presetToLook()` converts curated presets into look objects.
- Same genre + seed + recipe version should reproduce the same params.
- RAVE / GLITCH and high-risk generated looks get safety handling.

### Saved looks / MY SET

Files:

- `fix/src/components/tunnel/savedLooks.ts`
- `fix/src/components/tunnel/PresetsPanel.tsx`
- `fix/src/components/AsteroidScene.tsx`

Behavior:

- Generated looks can be saved.
- Local storage key: `chrestenson.tunnel.savedLooks`.
- Saved looks cap at 200.
- MY SET renders saved `TunnelLook[]`.
- Delete affordance exists in MY SET.
- Saved looks should restore generated params.

### Shareable hash URLs

File:

- `fix/src/components/tunnel/urlState.ts`

Behavior:

- Generated looks encode as hash state.
- Curated looks encode by preset id.
- Hash writes use `history.replaceState` to avoid back-button churn.
- Mask/overlay state is being threaded into share state, but this needs another QA pass after the overlay pivot settles.

### Intensity and safety

Files:

- `fix/src/components/tunnel/intensity.ts`
- `fix/src/components/tunnel/safety.ts`
- `fix/src/components/tunnel/FlashConfirmDialog.tsx`

Behavior:

- CALM / FULL / OVERDRIVE multiplier layer.
- Reduced-flash clamp.
- Flash warning and first-click confirmation path.
- `prefers-reduced-motion` should push toward safer motion.

This area took too long in the agent session and should be treated as something to browser-QA carefully, especially RAVE / GLITCH generation.

### Fullscreen

Files:

- `fix/src/components/tunnel/useFullscreen.ts`
- `fix/src/components/tunnel/useMouseWake.ts`
- `fix/src/components/tunnel/TransportBar.tsx`

Behavior:

- Fullscreen API on the visual section.
- Chrome hides in fullscreen.
- Transport wakes on mouse movement.

## Mask Layer Attempt

Files:

- `fix/src/components/tunnel/masks/MaskLayer.tsx`
- `fix/src/components/tunnel/masks/maskAssets.ts`
- `fix/src/components/tunnel/masks/maskState.ts`

Intended behavior:

- OFF
- SILHOUETTE
- CUTOUT
- LIGHT LEAK
- TILE
- Static mask assets.
- Size, rotation, softness, glow, invert.
- Motion: still, breathe, spin, drift, pulse.
- Motion speed and amount.
- Saved/share state support.

Observed status from user browser QA:

- OFF is not clean enough.
- SILH/SILHOUETTE does not work reliably.
- LEAK/LIGHT LEAK does not work reliably.
- The selected image/shape renders too small.
- TILE is the only mode that partially works.
- TILE has transparency/background leak issues.
- SVG animation needs better direct control.

Conclusion: the mask layer should not be treated as finished. It revealed the right product direction but the architecture needs to move to true overlay layers.

## Overlay Layer Pivot

The correct model is **Photoshop-style overlay layers**, not a single mask-mode dropdown.

New uncommitted files:

- `fix/src/components/tunnel/overlays/types.ts`
- `fix/src/components/tunnel/overlays/OverlayStack.tsx`
- `fix/src/components/tunnel/overlays/OverlaysSection.tsx`
- `fix/src/components/tunnel/overlays/assetRegistry.ts`
- `fix/src/components/tunnel/overlays/migrate.ts`

Current overlay model:

```ts
type OverlayType = 'shape' | 'cutout' | 'glow' | 'tile'
type OverlayBlend =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'difference'
  | 'exclusion'
  | 'color-dodge'
  | 'color-burn'
  | 'luminosity'
type OverlayMotion = 'none' | 'breathe' | 'spin' | 'drift' | 'pulse'
```

Each `OverlayLayer` carries:

- id
- type
- asset
- visible
- x / y
- scale
- rotation
- opacity
- fill / stroke / strokeWidth
- blendMode
- blur
- glow
- invert
- tileSpacing
- motion / motionSpeed / motionAmount

Renderer notes:

- `OverlayStack` renders above the tunnel and below the bird/chrome.
- First layer in array is bottom of stack; last is top.
- CSS `mix-blend-mode` is applied at the layer wrapper level.
- Shape/cutout/glow/tile render as SVG path modes.
- Motion is done with per-layer inline keyframes.
- Reduced motion forces overlay animation to `none`.

UI notes:

- `OverlaysSection` lives in the TUNE panel.
- Supports add, clear, visibility toggle, select, duplicate, delete, move up/down.
- Has asset categories and asset grid.
- Has blend picker, opacity, scale, x/y, rotation, blur, glow, tile spacing, fill, invert, motion, speed, amount.

## Blend Mode Diagnosis

Blend modes should use native browser support for v1:

- CSS overlays: `mix-blend-mode`.
- Canvas path, if needed later: `globalCompositeOperation`.
- Shader blend math is out of scope for v1 unless CSS cannot satisfy the product.

Likely reasons blend modes may appear broken:

- Blend mode applied to a wrapper with no visible pixels instead of the visible SVG/path.
- Screen blend with black fill is invisible.
- Full-screen cutout rect is blending as a full rectangle rather than the path.
- Parent stacking contexts are wrong.
- `isolation: isolate` is missing on the visual stage.
- A transparent cutout is revealing page/body background instead of tunnel.
- Overlay z-index is wrong.

Next pass should include a debug overlay with one large white star and verify:

- normal
- screen
- multiply
- difference
- overlay

If those do not visibly differ over the moving tunnel, the layer stack is wrong.

## Asset Library Direction

The overlay system should grow through asset packs before more shader complexity.

Potential MIT sources:

- Tabler Icons
- Heroicons
- Feather Icons
- CoolShapes
- PatternFills
- SVG pattern packs
- Animated SVG/spinner-style primitives for portal/ring motion

Important: MIT covers copyright use, not trademarks. Do not ship third-party brand logos as built-in assets.

Recommended asset metadata:

```ts
{
  id: 'tabler-star-filled',
  source: 'tabler-icons',
  license: 'MIT',
  type: 'shape',
  tags: ['star', 'symbol', 'cutout', 'sacred'],
  recommendedModes: ['shape', 'cutout', 'glow']
}
```

## Known UX/Product Decisions

- Web-first is the right demo vehicle. Desktop/plugin/screensaver can come later.
- Fullscreen browser + shareable URL gives plugin-like usefulness without install friction.
- Export/gif/wallpaper/OBS-browser-source are later value paths.
- The first screen should feel like an instrument, not a settings panel.
- PLAY mode should expose macros; DESIGN/TUNE can expose raw controls.
- Keyboard controls are still needed:
  - space pause/play
  - F fullscreen
  - R generate
  - S show mode/save depending final mapping
  - left/right preset
  - up/down intensity
  - 1-8 tabs
  - ? help overlay
- Motion feel is still desired:
  - fluid
  - cinema
  - poster/stop-motion
  - strobe
  - ghost/trails
- Surface/material feel is still desired:
  - matte
  - satin
  - glass
  - chrome
  - liquid

## Open Problems

1. **Mask/overlay correctness.** OFF/SILH/LEAK are reported broken in the mask implementation; TILE leaks background. The overlay pivot is the right architecture but is not browser-verified yet.
2. **Blend modes.** Need visual debug pass with known fill colors and a single shape.
3. **Overlay persistence.** Saved looks and share URLs must restore the overlay stack exactly, not just base tunnel params.
4. **Generated root artifacts.** Review whether `vite.config.js`, `vite.config.d.ts`, and root tsbuildinfo files should be ignored/deleted before committing.
5. **Browser QA.** Headless WebGL was not enough. The feature needs real-browser visual QA.
6. **Preset/generator quality.** The generator is structurally correct but must be judged visually. Some generated looks may still be color/speed spam.
7. **Panel complexity.** TUNE is growing into a real tool. Need a better layered tool architecture before adding more raw controls.
8. **Keyboard control.** Not started.
9. **Asset packs.** Not started beyond hand-authored starter paths.
10. **Export/show-mode roadmap.** Not implemented beyond fullscreen/demo.

## Recommended Next Checkpoint

Do not add more features until this sequence is complete:

1. Review `git status --short`.
2. Decide whether old `masks/*` should remain, be migrated, or be removed in favor of `overlays/*`.
3. Clean accidental generated artifacts if they do not belong.
4. Run `cd fix && npx tsc -b`.
5. Browser-QA overlay basics:
   - no overlays = no visual effect
   - one shape layer
   - one cutout layer
   - one glow layer
   - one tile layer
   - two layers reordered
   - blend modes visibly differ
   - save/reload restores layers
   - share URL restores layers
6. Only then commit overlay work, likely as:

```txt
feat: add tunnel overlay layer stack
```

## Files To Read Before Continuing

- `fix/docs/plans/2026-05-07-tunnel-instrument-design.md`
- `fix/docs/plans/2026-05-07-tunnel-instrument-plan.md`
- `fix/docs/plans/2026-05-07-tunnel-engine-audit.md`
- `fix/src/components/TunnelCanvas.tsx`
- `fix/src/components/AsteroidScene.tsx`
- `fix/src/components/tunnel/useTunnelEngine.ts`
- `fix/src/components/tunnel/presets.ts`
- `fix/src/components/tunnel/vibes.ts`
- `fix/src/components/tunnel/generator/generateLook.ts`
- `fix/src/components/tunnel/savedLooks.ts`
- `fix/src/components/tunnel/urlState.ts`
- `fix/src/components/tunnel/masks/MaskLayer.tsx`
- `fix/src/components/tunnel/overlays/types.ts`
- `fix/src/components/tunnel/overlays/OverlayStack.tsx`
- `fix/src/components/tunnel/overlays/OverlaysSection.tsx`
- `fix/src/components/tunnel/overlays/assetRegistry.ts`

