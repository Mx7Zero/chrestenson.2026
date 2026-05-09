# SVG Overlay Engine + Music Stems Brief

**Date:** 2026-05-09
**Project:** Hummingbird Tunnel Visual Instrument
**Status:** Product direction / implementation brief

## Thesis

The overlay system is no longer decorative SVG on top of the tunnel. It is a layered visual compositor:

```txt
Base tunnel
Independent tunnel source clipped through SVG layer
Second independent tunnel source clipped through another SVG layer
Solid / glow / tile / cutout overlays
Bird / chrome / UI
```

The next product jump is to make the SVG layer itself expressive:

- shape
- scale
- position
- rotation
- deformation
- animation
- randomness
- layer-specific tunnel source
- blend/composite mode
- future music-stem response

The goal is not a static logo mask. The goal is a moving, controllable visual identity layer that can react to audio stems.

## What Is Working

- A tunnel source can appear clipped inside an overlay shape.
- This proves the right compositing direction: a layer can contain its own visual source, not just flat SVG ink.

## Current Gap

- The overlay shape is still too static.
- The first SVG pass is visually generic: it behaves like an icon mask over a shader, not like a real psychedelic visual layer.
- The independent tunnel source needs its own generator/recipe per layer.
- Shape animation needs deeper controls.
- Randomness needs to be tasteful and controllable.
- Future audio/music stem response needs a state model now, before layer settings sprawl.

## The Real SVG Problem

The first SVG overlay pass proves the compositor, but it does not yet create the
visual wow. A star, circle, hex, or mandala doing a simple CSS pulse reads like a
generic mask toy. That is not enough for this product.

The SVG layer has to become its own creative engine, not a shape picker.

Do **not** build this as "choose an icon and move it around." Build it as:

- generative vector forms
- compound masks
- animated line systems
- morphing silhouettes
- recursive radial geometry
- warped typography/logo mattes
- animated stroke fields
- procedural SVG ornaments
- music-reactive vector deformations
- independent tunnel worlds clipped through those forms

The visual target is not "corny shape bouncing over a shader." The target is a
live light-leak / poster / concert-visual / screen-saver instrument where every
SVG layer feels authored, strange, dimensional, and worth saving.

## SVG Visual Language Requirements

The asset library must move past primitive symbols. We need families of forms:

- **Psychedelic:** liquid blobs, melting windows, warped flowers, retinal
  tunnels, smoke ribbons, sunbursts, acid-poster silhouettes.
- **Music:** waveform cages, speaker cones, equalizer ribs, vinyl grooves,
  oscilloscopes, Lissajous knots, frequency rings, staff-line distortions.
- **Sacred / mandala:** radial rosettes, stained-glass cells, vesica fields,
  petal wheels, altar windows, jewel lattices.
- **Glitch / signal:** scanline tears, broken CRT frames, barcode slits,
  fractured grids, datamosh shards, offset channel plates.
- **Cosmic:** eclipse discs, orbital rings, star maps, comet trails,
  gravitational lens shapes, nebula windows.
- **Logo / identity:** imported SVG logos, monograms, custom wordmarks,
  editorial title forms, silhouette cutouts.

Each family needs multiple complexity levels:

1. Simple single path.
2. Compound path with holes.
3. Multi-path grouped asset.
4. Repeating field / tiled asset.
5. Animated SVG asset with internal path/stroke animation.

## Animation Must Not Feel Like Clip Art

The first motion pass is too literal: breathe, spin, drift, pulse. Those are
useful primitives, but by themselves they look corny.

The next motion layer needs visual behaviors that feel designed:

- path morphing between related silhouettes
- stroke dash drawing / undrawing
- contour-line crawling
- radial petal phase offsets
- liquid wobble on control points
- noisy edge shimmer
- multi-ring counter-rotation
- kaleidoscopic orbit groups
- beat-synced expansion and collapse
- asymmetric drift with seeded randomness
- per-layer phase offsets so nothing moves in lockstep

Motion should have a reason. A layer should feel like it is responding to the
music or to the tunnel behind it, not running a generic CSS animation.

## Overlay Layer As A Creative Object

Each overlay layer should eventually control:

- **Asset:** SVG shape/path/symbol.
- **Source:** solid / base tunnel / independent tunnel / future image/video.
- **Transform:** x, y, scale, rotation.
- **Material:** fill, stroke, stroke width, glow, blur, opacity.
- **Composite:** blend mode, cutout, stencil/tile.
- **Motion:** breathe, spin, drift, pulse, orbit, shake, flicker.
- **Randomness:** seeded jitter, random walk, random burst, random asset swap.
- **Audio response:** map music stems to any of the above.

## SVG Animation Controls

Minimum next controls:

| Control | Purpose |
| --- | --- |
| `motion` | none / breathe / spin / drift / pulse / orbit / shake / flicker |
| `motionSpeed` | global speed multiplier for layer animation |
| `motionAmount` | intensity of scale / position / opacity motion |
| `motionPhase` | deterministic phase offset so multiple layers do not move identically |
| `randomness` | amount of seeded irregularity added to the motion |
| `jitter` | small high-frequency position/rotation shake |
| `orbitRadius` | radius for orbit motion |
| `pulseTarget` | opacity / scale / glow / sourceIntensity |
| `anchor` | center / top / bottom / left / right, later useful for typography/logos |

Important: `motionSpeed` and `motionAmount` are not enough by themselves. Multiple layers need phase/randomness so the composition does not look like every object is breathing in sync.

## Shape / Size / Transform Goals

Shape controls must feel like a design tool:

- Scale range should be large enough for poster-scale silhouettes.
- Position should support off-center composition.
- Rotation should support slow static angle and animated spin.
- Tile spacing should have independent X/Y later.
- Large shapes should not clip glow unexpectedly.
- Shape paths should be normalized to a consistent 100x100 or viewBox-safe format.

## Randomness Model

Randomness should be seeded and controllable, not raw chaos.

Layer settings should include:

```ts
randomSeed: number
randomness: number // 0..1
```

Possible uses:

- slightly vary pulse timing
- drift path irregularity
- sporadic flicker
- micro rotation wobble
- random asset pick within a category
- random source regeneration within a genre

Rule: randomness must be deterministic for saved/share looks. Same saved look should restore the same behavior pattern.

## Music Stem Reactivity

The eventual goal: all layers can respond to music stems.

Do not hard-code "audio reacts to everything." Create a routing system:

```ts
type StemId =
  | 'kick'
  | 'snare'
  | 'hats'
  | 'bass'
  | 'lead'
  | 'vocal'
  | 'pads'
  | 'fx'
  | 'master'

type AudioModTarget =
  | 'opacity'
  | 'scale'
  | 'rotation'
  | 'x'
  | 'y'
  | 'glow'
  | 'blur'
  | 'blendAmount'
  | 'sourceSpeed'
  | 'sourceHueShift'
  | 'sourceChromatic'
  | 'sourceKaleidoscope'
  | 'sourceStrobeRate'

type AudioMod = {
  id: string
  stem: StemId
  target: AudioModTarget
  amount: number
  smoothing: number
  threshold: number
  attack: number
  release: number
  invert?: boolean
}
```

Every overlay layer can carry `audioMods: AudioMod[]`.

Examples:

- Kick -> scale pulse on a star cutout.
- Snare -> glow spike on a mandala.
- Bass -> source tunnel speed and bend.
- Hats -> small jitter/flicker on glitch overlays.
- Vocal -> opacity or mask reveal.
- Pads -> hueShift or slow blur bloom.
- Master -> overall intensity clamp.

## Music Stem Architecture

Future implementation path:

1. Start with mock stem envelopes, no real audio analysis.
2. Let each layer subscribe to a named stem envelope value `0..1`.
3. Apply mods to derived render values, not raw saved state.
4. Later ingest real stems or Web Audio frequency bands.
5. Later add stem assignment UI.

This keeps the overlay data model ready for music without forcing audio engineering into the current visual layer work.

## Product Feeling

The layer system should let users build things like:

- Cosmic base tunnel + GLITCH eye tunnel inside an eye SVG.
- Sacred base tunnel + gold mandala glow slowly orbiting.
- Rave tunnel clipped through a star, pulsing to kick.
- Chroma field with typography cutout and bass-driven scale.
- Tile overlay of symbols that flicker to hats.
- Brand logo silhouette with independent tunnel moving inside it.

The user should feel:

> I can generate a moving visual universe, catch a look, then build a layered identity piece on top of it.

## Immediate Next Build

Before adding audio:

1. Make independent tunnel source generation per overlay layer reliable.
2. Make SVG transforms large, obvious, and controllable.
3. Add phase/randomness/jitter/orbit/flicker controls.
4. Make save/share persist these settings.
5. Add browser QA cases for multiple overlay layers moving differently.

Then add a mock music-stem modulation layer.
