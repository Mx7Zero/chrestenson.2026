# Tunnel engine audit

Reference map of every `TunnelParams` field, every shader uniform, and every
control surface in `AsteroidScene.tsx` that writes to the tunnel. This doc is
the source of truth for chunks 2-13 of the visual-instrument plan; chunk 4 in
particular (morph engine) consults the lerpable-vs-categorical column to decide
whether to interpolate or snap each field.

Line numbers reference HEAD of `feat/tunnel-instrument` at audit time
(`TunnelCanvas.tsx` 829 lines, `AsteroidScene.tsx` 1663 lines).

---

## 1. `TunnelParams` field map

Every field on the `TunnelParams` type, where it is consumed inside
`TunnelCanvas.tsx`, and how a morph engine should treat it.

`lerpable?` legend:
- **scalar** — interpolate linearly (`a + (b - a) * t`)
- **hsl** — interpolate as HSL (or RGB, lab, etc.); a hex string wrapper
- **categorical** — snap at midpoint; do not lerp (union types, enums-as-numbers, nullable selectors)

| param | type | consumer (line) | lerpable? | applies-to |
| --- | --- | --- | --- | --- |
| `speed` | `number` | `useFrame` step calc, line 723 | scalar | CPU (camera phase advance) |
| `direction` | `1 \| -1` | `useFrame` step sign, line 723 | **categorical** | CPU (camera phase advance) |
| `roll` | `number` | `useFrame` `rollPhaseRef` accum, line 746 | scalar | CPU (camera up vector) |
| `fov` | `number` | `Canvas` initial `camera={fov}` line 819; `CameraSync` per-frame `cam.fov = fov` lines 801-802 | scalar | camera (projection matrix) |
| `fogFar` | `number` | `useFrame` `uFogFar.value`, line 712 | scalar | GPU uniform `uFogFar` |
| `wobble` | `number` | `useFrame` clamp-to-`hole*0.7` then `Math.sin/cos`, lines 748-751 | scalar | CPU (camera position offset) |
| `density` | `number` | `useFrame` `safeDensity = round(density/2)*2` then `uDensityY.value`, lines 708-710 | scalar (snap to even) | GPU uniform `uDensityY` |
| `rings` | `number` | `useFrame` `safeRings = round(rings)` then `uRings.value`, lines 707, 709 | scalar (snap to int) | GPU uniform `uRings` |
| `hole` | `number` | `useMemo` `CylinderGeometry` radius, lines 600-609 (rebuilds geometry); also clamp wobble line 748 | scalar | CPU (geometry rebuild on change) |
| `helix` | `number` | `uniformsRef.current.uHelix.value`, line 700; camera offset math lines 754-757, 761-763 | scalar | GPU uniform `uHelix` + CPU camera |
| `wave` | `number` | `uniformsRef.current.uWave.value`, line 701; camera offset lines 756, 762 | scalar | GPU uniform `uWave` + CPU camera |
| `bend` | `number` | `useFrame` `uBendValue = (bend * π/180) / (TUBE_LENGTH*0.5)`, lines 714-717 | scalar | GPU uniform `uBend` + CPU camera |
| `bendDir` | `number` | `useFrame` `uBendDirRad = bendDir * π/180`, lines 716-718 | scalar | GPU uniform `uBendDir` + CPU camera |
| `cellBlur` | `number` (0..0.5) | `uniformsRef.current.uCellBlur.value`, line 736 | scalar | GPU uniform `uCellBlur` |
| `strobeRate` | `number` (Hz) | `uniformsRef.current.uStrobeRate.value`, line 737 | scalar | GPU uniform `uStrobeRate` |
| `strobeDuty` | `number` (0.05..0.95) | `uniformsRef.current.uStrobeDuty.value`, line 738 | scalar | GPU uniform `uStrobeDuty` |
| `strobeColor` | `string` (hex) | `uniformsRef.current.uStrobeColor.value.set(...)`, line 739 | hsl | GPU uniform `uStrobeColor` (vec3) |
| `strobeTarget` | `number` (0\|1\|2) | `uniformsRef.current.uStrobeTarget.value`, line 740 | **categorical** | GPU uniform `uStrobeTarget` |
| `strobeMode` | `number` (0..4) | `uniformsRef.current.uStrobeMode.value`, line 741 | **categorical** | GPU uniform `uStrobeMode` |
| `kaleidoscope` | `number` | **DEAD** — not read anywhere in `TunnelCanvas.tsx` | scalar (when implemented) | not yet wired |
| `chromatic` | `number` | **DEAD** — not read anywhere in `TunnelCanvas.tsx` | scalar (when implemented) | not yet wired |
| `hueShift` | `number` | **DEAD** — not read anywhere in `TunnelCanvas.tsx` | scalar (when implemented) | not yet wired |
| `transparentCell` | `'none' \| 'a' \| 'b'` | `useFrame` ternary→0/1/2 then `uTransparentCell.value`, lines 742-743; also `Canvas` `gl.alpha` boolean line 821 | **categorical** | GPU uniform `uTransparentCell` + canvas alpha |
| `colorA` | `string` (hex) | `uniformsRef.current.uColorA.value.set(...)`, line 702; also `usePatternTexture` bg line 620; also `useImageTexture` gating lines 622, 624 | hsl | GPU uniform `uColorA` (vec3) + canvas pattern bake |
| `colorB` | `string` (hex) | `uniformsRef.current.uColorB.value.set(...)`, line 703; also `usePatternTexture` fg line 620; line 621 swaps roles | hsl | GPU uniform `uColorB` (vec3) + canvas pattern bake |
| `imageA` | `string \| null` | `useImageTexture` URL (suppressed when pattern set), line 622 | **categorical** | GPU sampler `uImageA` + flag `uHasImageA` |
| `imageB` | `string \| null` | `useImageTexture` URL (suppressed when pattern set), line 623 | **categorical** | GPU sampler `uImageB` + flag `uHasImageB` |
| `patternA` | `PatternName \| null` | `SHADER_PAT_MAP` lookup line 616; `usePatternTexture` line 620; `uShaderPatA` line 685 | **categorical** | GPU uniform `uShaderPatA` (number 0..6) OR canvas-baked texture in `uImageA` |
| `patternB` | `PatternName \| null` | `SHADER_PAT_MAP` lookup line 617; `usePatternTexture` line 621; `uShaderPatB` line 690 | **categorical** | GPU uniform `uShaderPatB` (number 0..6) OR canvas-baked texture in `uImageB` |

### Categorical fields (snap, do not lerp)

These five fields are unions or selectors. Lerping them produces invalid
intermediate states or shader bugs:

- `direction` — `1 | -1`. Half-way is `0` which freezes the tunnel.
- `transparentCell` — `'none' | 'a' | 'b'`. No meaningful intermediate.
- `strobeTarget` — `0 | 1 | 2` (all/A/B). Shader does `if (>0.5 && <1.5)` etc.
- `strobeMode` — `0 | 1 | 2 | 3 | 4` (flash/pulse/rainbow/alternate/invert). Same shader-side `if` ladder.
- `imageA`, `imageB` — URL string or `null`. No interpolation.
- `patternA`, `patternB` — `PatternName | null`. No interpolation.

Recommended snap rule for the morph engine: use the **target** value once
`t >= 0.5`, otherwise the **source** value. This keeps the visual change
synchronized with the rest of the morph.

### Special handling notes for chunk 4

- `hole` causes a geometry rebuild via `useMemo` dep `[params.hole]` (line 608). Lerping it 60 fps will allocate / dispose a `CylinderGeometry` every frame. **Decision required:** quantize `hole` (e.g. step 0.1 and only update when crossing a step boundary), or accept the GC cost during morph.
- `density` and `rings` are quantized inside `useFrame` (`Math.round`/even-snap). The morph engine should pass the raw lerp value through; the engine clamps it. This works fine.
- `fov` is read both by `Canvas` (initial mount) and `CameraSync` (per-frame). During morph the per-frame path keeps the projection matrix in sync — no special handling needed.
- `colorA`, `colorB`, `strobeColor` are re-baked into pattern canvases when they change (lines 268-285 `usePatternTexture` deps `[name, fg, bg]`). Lerping color hex 60 fps will trigger texture regeneration every frame. **Decision required:** during a morph, rate-limit pattern texture rebakes to e.g. 4 Hz, or freeze the pattern at the source until morph end and snap.
- `kaleidoscope`, `chromatic`, `hueShift` are present in the type and on the DESIGN tab sliders, but the engine does not read them. They are **dead controls** today. Chunks 4-5 should either implement them in the shader or remove them from the type and UI; the audit flags this as a pre-existing bug, not a chunk-4 task.

---

## 2. Shader uniform map

Every `uniform` declared in the GLSL plus the JS-side initial value and the
per-frame writer.

| uniform | GLSL type | JS init (line 627-656) | written by (line) |
| --- | --- | --- | --- |
| `uHelix` | `float` | `0` | `useFrame` line 700 — `params.helix` |
| `uWave` | `float` | `0` | `useFrame` line 701 — `params.wave` |
| `uPhase` | `float` | (init `0` via `phaseRef`) | `useFrame` line 733 — `phaseRef.current` (animated) |
| `uBend` | `float` | `0` | `useFrame` line 717 — derived from `params.bend` |
| `uBendDir` | `float` | `0` | `useFrame` line 718 — derived from `params.bendDir` |
| `uColorA` | `vec3` | `THREE.Color('#ffffff')` | `useFrame` line 702 — `params.colorA` |
| `uColorB` | `vec3` | `THREE.Color('#000000')` | `useFrame` line 703 — `params.colorB` |
| `uRings` | `float` | `2` | `useFrame` line 709 — `safeRings(params.rings)` |
| `uDensityY` | `float` | `8` | `useFrame` line 710 — `safeDensity(params.density)` |
| `uTexScroll` | `float` | (init `0` via `scrollRef`) | `useFrame` line 734 — `scrollRef.current` (animated) |
| `uMotion` | `float` | (init `0`) | `useFrame` line 735 — `\|step*0.08\|` (animated, AA hint) |
| `uCellBlur` | `float` | `0` | `useFrame` line 736 — `params.cellBlur` |
| `uStrobeRate` | `float` | `0` | `useFrame` line 737 — `params.strobeRate` |
| `uStrobeDuty` | `float` | `0.15` | `useFrame` line 738 — `params.strobeDuty` |
| `uStrobeColor` | `vec3` | `THREE.Color('#ffffff')` | `useFrame` line 739 — `params.strobeColor` |
| `uStrobeTarget` | `float` | `0` | `useFrame` line 740 — `params.strobeTarget` |
| `uStrobeMode` | `float` | `0` | `useFrame` line 741 — `params.strobeMode` |
| `uTransparentCell` | `float` | `0` | `useFrame` lines 742-743 — `params.transparentCell` mapped 'none'→0/'a'→1/'b'→2 |
| `uImageA` | `sampler2D` | `WHITE_PIXEL` | `useEffect` line 683 — `effectiveA ?? WHITE_PIXEL` (pattern texture or image texture) |
| `uImageB` | `sampler2D` | `WHITE_PIXEL` | `useEffect` line 688 — `effectiveB ?? WHITE_PIXEL` |
| `uHasImageA` | `float` | `0` | `useEffect` line 684 — `effectiveA ? 1 : 0` |
| `uHasImageB` | `float` | `0` | `useEffect` line 689 — `effectiveB ? 1 : 0` |
| `uShaderPatA` | `float` | `0` | `useEffect` line 685 — `SHADER_PAT_MAP[params.patternA] ?? 0` (0..6) |
| `uShaderPatB` | `float` | `0` | `useEffect` line 690 — `SHADER_PAT_MAP[params.patternB] ?? 0` |
| `uTime` | `float` | `0` | `useFrame` line 744 — `state.clock.elapsedTime` (animated) |
| `uFogColor` | `vec3` | `THREE.Color('#000000')` | never overwritten in `useFrame`; fixed black |
| `uFogNear` | `float` | `2` | `useFrame` line 711 — hard-coded `2` |
| `uFogFar` | `float` | `35` | `useFrame` line 712 — `params.fogFar` |

`SHADER_PAT_MAP` (line 145):
- `fractal` → 1
- `noise` → 2
- `marble` → 3
- `gradient` → 4
- `radialGrad` → 5
- `spiral` → 6
- (any canvas pattern: `hlines`, `vlines`, `dot`, `dots`, `checker`, `diagonal`, `cross`, `rings`, `diamond`, `grid`) → 0, with the canvas-baked texture in `uImageA`/`uImageB` instead

### Per-frame `useFrame` writes (CPU side, lines 697-790)

Beyond uniform writes, `useFrame` also writes to the camera every frame:
- `camera.up.set(...)` — line 783, driven by `rollPhaseRef`
- `camera.position.set(helixOffsetX + wobX, helixOffsetY + wobY, 0)` — line 788, driven by `helix`/`wave`/`wobble`
- `camera.lookAt(lookWorldX, lookWorldY, lookWorldZ)` — line 789, driven by `helix`/`wave`/`wobble`/`bend`
- `phaseRef.current` advance — line 724 (modular wrap on `PHASE_WRAP = 80`)
- `scrollRef.current` advance — line 731 (modular wrap on `2/safeDensity`)
- `rollPhaseRef.current` accum — line 746

`CameraSync` (lines 797-807) runs as a separate component and writes `cam.fov`
+ `updateProjectionMatrix()` only when the value changes.

---

## 3. `AsteroidScene.tsx` control surface map

Every place the parent component pushes a value into the tunnel.

| control | state-source | effect | linkage to `TunnelParams` field |
| --- | --- | --- | --- |
| **PRESETS row** (line 1140) | `TUNNEL_PRESETS` (TunnelCanvas.tsx:69-88) — 18 named presets, each a `Partial<TunnelParams>` | `setTunnelParams((prev) => ({ ...prev, ...p.values }))` line 1146 — instant merge, only overwrites the keys the preset specifies | varies per preset; typically `rings`, `density`, `speed`, `roll`, plus optional `patternA/B`, `colorA/B`, `cellBlur`, `helix`, `bend`, `wobble` |
| **DIRECTION buttons** (line 759) | `[1, -1]` literal | `setTunnelParams((p) => ({ ...p, direction: d }))` line 763 — instant snap | `direction` |
| **PLAY tab sliders** (line 1177) | `TuneRow` per key | `setTunnelParams((p) => ({ ...p, [k.key]: v }))` line 1197 — instant scalar write | `speed`, `roll`, `wobble`, `fov`, `fogFar`, `strobeRate`, `strobeDuty` |
| **TRANSPARENT CELL buttons** (line 1206) | `[{v:'none'}, {v:'a'}, {v:'b'}]` | `setTunnelParams((p) => ({ ...p, transparentCell: t.v }))` line 1209 — instant snap | `transparentCell` |
| **STROBE TARGET buttons** (line 1227) | `[0, 1, 2]` literal | `setTunnelParams((p) => ({ ...p, strobeTarget: t.v }))` line 1230 — instant snap | `strobeTarget` |
| **STROBE COLOR picker** (line 1244) | `<input type="color">` | `setTunnelParams((p) => ({ ...p, strobeColor: e.target.value }))` line 1247 — instant write | `strobeColor` |
| **STROBE MODE buttons** (line 1255) | `[0..4]` literal | `setTunnelParams((p) => ({ ...p, strobeMode: m.v }))` line 1258 — instant snap | `strobeMode` |
| **STROBE PRESETS row** (line 1273) | `STROBE_PRESETS` (TunnelCanvas.tsx:90-101) — 10 named presets | `setTunnelParams((p) => ({ ...p, ...sp.values }))` line 1278 — instant merge | varies; `strobeRate`, `strobeDuty`, `strobeMode`, `strobeTarget`, `strobeColor`, plus `colorA/B` for POLICE preset |
| **PLAY tab RESET** (line 1299) | `TUNNEL_DEFAULTS` | `setTunnelParams(TUNNEL_DEFAULTS)` line 1299 — instant full replace | all fields |
| **PALETTE swatches** (line 1344) | `COLOR_PALETTES` (TunnelCanvas.tsx:288-299) — 10 a/b color pairs | `setTunnelParams((prev) => ({ ...prev, colorA: p.a, colorB: p.b, imageA: null, imageB: null }))` line 1354 — instant write of 4 keys | `colorA`, `colorB`, `imageA`, `imageB` |
| **A color picker** (line 1397) | `<input type="color">` | `setTunnelParams((p) => ({ ...p, colorA: ..., imageA: null }))` line 1401 — instant write of 2 keys | `colorA`, `imageA` |
| **B color picker** (line 1431) | `<input type="color">` | `setTunnelParams((p) => ({ ...p, colorB: ..., imageB: null }))` line 1435 — instant write of 2 keys | `colorB`, `imageB` |
| **CELL A/B pattern buttons** (line 1482) | `PATTERNS` (TunnelCanvas.tsx:126-143) — 16 patterns | `setTunnelParams((prev) => ({ ...prev, [patKey]: ..., [imgKey]: null }))` line 1487 — instant snap; clicking active toggles to `null` | `patternA`/`patternB` + clear `imageA`/`imageB` |
| **CELL A/B image buttons** (line 1515) | `TEST_IMAGES` (TunnelCanvas.tsx:103-106) — 2 test images | `setTunnelParams((prev) => ({ ...prev, [imgKey]: img.url, [patKey]: null }))` line 1519 — instant snap; clears pattern | `imageA`/`imageB` + clear `patternA`/`patternB` |
| **CELL A/B OFF button** (line 1540) | (none) | `setTunnelParams((prev) => ({ ...prev, [patKey]: null, [imgKey]: null }))` line 1542 — instant clear | clear both `patternA`/`patternB` + `imageA`/`imageB` |
| **DESIGN tab sliders** (line 1580) | `TuneRow` per key | `setTunnelParams((p) => ({ ...p, [k.key]: v }))` line 1604 with quantize for `density`/`rings` | `density`, `rings`, `hole`, `cellBlur`, `helix`, `wave`, `bend`, `bendDir`, `kaleidoscope` (dead), `chromatic` (dead), `hueShift` (dead) |
| **DESIGN tab RESET** (line 1618) | `TUNNEL_DEFAULTS` | `setTunnelParams(TUNNEL_DEFAULTS)` line 1618 — instant full replace | all fields |
| **localStorage rehydrate** (line 342-353) | `localStorage['asteroidScene.tunnelParams']` | initial state seed merged onto `TUNNEL_DEFAULTS` line 347 | all fields (one-shot at mount) |
| **localStorage persist** (line 372-382) | `tunnelParams` change | `localStorage.setItem(...)` line 376 | all fields (every change) |

### `presetMatches` (line 63-77)

Used by both `TUNNEL_PRESETS`, `STROBE_PRESETS`, and `COLOR_PALETTES` to render
a preset as "active" when the live state matches every field the preset
specifies. Comparison rules:
- numbers: `Math.abs(a - b) < 1e-6`
- strings: case-insensitive equality
- otherwise: `===`

This is read-only — it never mutates state — but chunks 6 (auto-chips /
now-playing) and 11 (shareable hashes) will likely need a similar matcher.

---

## 4. Existing morph behavior on preset click

**Today: morph is instant.**

Every preset / palette / pattern / slider write goes through React's
`setTunnelParams(...)`, which causes the next render to pass a new `params`
object to `<Tunnel>`. Because the engine reads `params.X` inside `useFrame`
(every frame), the change appears on the very next frame — typically within
~16 ms.

There is **no easing, no transition, no interpolation, no debounce** between
the previous value and the new value. The PRESETS row visibly snaps the tunnel
geometry / colors / patterns instantly.

Three side-effects of an instant write:

1. **Shader recompile NOT triggered.** All preset-controllable values are
   uniforms (or geometry params that recompute the cylinder), so no shader
   recompilation occurs. The single material is built once (line 661) and
   reused.
2. **Geometry rebuild on `hole` change.** `useMemo` dep on `[params.hole]`
   (line 608) re-allocates a new `CylinderGeometry` whenever `hole` changes,
   and the prior `useEffect` cleanup (line 610-613) disposes the old one. Cost
   ≈ 1-2 ms per change at default segment counts (128 × 600 = 76800 verts).
3. **Pattern texture rebake on color or pattern change.** `usePatternTexture`
   has deps `[name, fg, bg]` (line 284) — any change to `patternA`,
   `patternB`, `colorA`, `colorB` regenerates the 1024×1024 canvas texture and
   uploads it to the GPU. Cost ≈ 5-10 ms per change.

Chunk 4 will introduce a `morphParams(source, target, t)` function that
animates between two preset states over a fixed duration (TBD; design doc
suggests ~600 ms cubic ease). The key constraints:

- **Lerp scalars** (every field marked `scalar` or `hsl` above).
- **Snap categoricals at midpoint** (`direction`, `transparentCell`,
  `strobeTarget`, `strobeMode`, `imageA`, `imageB`, `patternA`, `patternB`).
- **Decide on `hole`** — see chunk-4 notes above. Probably snap or quantize.
- **Decide on color rebake during morph** — see chunk-4 notes above. Probably
  either snap colors at midpoint or rate-limit the rebake.

The morph engine should also keep `presetMatches` happy at `t === 1` so the
PRESETS row can highlight the new active preset after the morph settles.

---

## 5. TUNE panel mechanics

- **State:** `tunePanelOpen: boolean`, default `false` (line 355).
- **Toggle button:** vertical `▸ TUNE` / `◂ TUNE` button at lines 1638-1656,
  positioned `alignSelf: 'center'` to the right of the panel.
- **Animation:** width transitions from 480 → 0 (or 0 → 480) over 350 ms
  `cubic-bezier(0.22, 1, 0.36, 1)` (line 678). The inner content remains at
  fixed `width: 480` (line 688) and is clipped by the outer `overflow: hidden`
  wrapper (line 676), producing a smooth slide-collapse.
- **Open width:** `480` px (line 677).
- **Closed width:** `0` px (line 677).
- **Tab switcher:** `tuneTab: 'play' | 'design'` (line 356) toggles between
  PLAY and DESIGN tab content; both tabs render but only one has
  `display: 'block'` (lines 736, 1320).
- **Module tabs (mandala only):** an additional left-side tab strip at line
  642 only renders when `visualMode === 'mandala' && tunePanelOpen`. Not
  relevant to tunnel work.
- **Max height:** `80vh` with `overflowY: 'auto'` on the inner content (lines
  689-690).
- **Background:** `rgba(0,0,0,0.82)` with white-22% border, no right border
  (so it visually fuses with the toggle button).

Chunk 3 (layout shell + tabs + capability copy) will replace this drawer with
the new instrument layout. The 480 px width is a useful baseline; the new
panel should not start narrower without re-testing slider readability.

---

## Verification checklist

A reader with no codebase context should be able to answer, from this doc
alone:

- [x] Which `TunnelParams` fields are scalars and lerpable? (column 4 of
      §1; everything marked `scalar` or `hsl`)
- [x] Which fields are HSL colors? (`colorA`, `colorB`, `strobeColor`)
- [x] Which fields are categorical and need to snap? (`direction`,
      `transparentCell`, `strobeTarget`, `strobeMode`, `imageA`, `imageB`,
      `patternA`, `patternB`)
- [x] Which params are dead (declared but not consumed)? (`kaleidoscope`,
      `chromatic`, `hueShift`)
- [x] Where is each control surface defined and what does it write?
      (§3 table)
- [x] What does a preset click do today? (§4)
- [x] How does the TUNE drawer open/close and how wide is it? (§5; 480 px)
