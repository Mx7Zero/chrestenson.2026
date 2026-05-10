import { useEffect, useRef, useState } from 'react'
import { findAsset, resolveAssetPath } from './assetRegistry'
import { scaleFraction, type OverlayLayer } from './types'
import { TunnelCanvas, TUNNEL_DEFAULTS, type TunnelParams } from '../../TunnelCanvas'
import { EffectSVG } from './EffectSVG'
import { expandLayerToInstances, type LayerInstance } from './expandLayer'

// Build a CSS mask-image data URL from an asset path. The resulting
// SVG paints the shape WHITE on a transparent background — when used
// as `mask-image` with `mask-mode: alpha`, white = visible, so the
// tunnel inside the masked div only shows where the shape is.
//
// Rotation is baked into the SVG via a transform so we can keep the
// rest of the mask-* CSS uniform.
function buildMaskDataUrl(
  d: string,
  viewBox: string,
  rotation: number,
): string {
  const [vbMinX, vbMinY, vbW, vbH] = viewBox
    .trim()
    .split(/\s+/)
    .map(Number) as [number, number, number, number]
  const cx = vbMinX + vbW / 2
  const cy = vbMinY + vbH / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g transform="rotate(${rotation} ${cx} ${cy})"><path d="${d}" fill="white" fill-rule="evenodd"/></g></svg>`
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

// Parse a viewBox string into [minX, minY, width, height]. Handles
// the two formats we ship: '0 0 100 100' (hand-drawn) and
// '0 0 24 24' (Tabler/Lucide imports). Falls back to 100×100.
function parseViewBox(vb: string): [number, number, number, number] {
  const parts = vb.trim().split(/\s+/).map(Number)
  if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
    return [parts[0], parts[1], parts[2], parts[3]]
  }
  return [0, 0, 100, 100]
}

// ─── OverlayStack ─────────────────────────────────────────────────
// Renders an array of OverlayLayers as a Photoshop-style stack. The
// outer container is absolute, full-bleed, between tunnel canvas
// (z=0) and bird canvas (z=2). Pointer events disabled so the bird
// OrbitControls keep working through the stack.
//
// Each layer renders as its own absolute <div> with mix-blend-mode
// and opacity at the div level (so blend modes compose properly with
// the tunnel beneath instead of with sibling layers above). Inside
// the div, an SVG carries the per-type rendering (shape / cutout /
// glow / tile).
//
// Animations are emitted as per-instance @keyframes with motionAmount
// baked into the values (CSS var() in @keyframes is unreliable). The
// CSS animation lives on an INNER <g> so it doesn't fight the static
// SVG transform attribute that positions/sizes the path.
//
// prefers-reduced-motion forces every layer's motion to 'none'.

type Props = {
  layers: OverlayLayer[]
}

export function OverlayStack({ layers }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const fn = () => setReducedMotion(mq.matches)
    mq.addEventListener?.('change', fn)
    return () => mq.removeEventListener?.('change', fn)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setSize({ w: r.width, h: r.height })
    const ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect
      setSize({ w: cr.width, h: cr.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Empty stack ⇒ render only the observer container so a future
  // add-layer doesn't have to remount RO. Same shape as MaskLayer's
  // OFF return.
  if (layers.length === 0 || layers.every((l) => !l.visible)) {
    return (
      <div
        ref={containerRef}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      />
    )
  }

  const cw = Math.max(1, size.w)
  const ch = Math.max(1, size.h)
  const vmin = Math.min(cw, ch)

  // anySolo: when any visible layer has solo=true, only solo layers
  // render. Mirrors Photoshop's solo-track behavior.
  const anySolo = layers.some((l) => l.visible && l.solo)
  const isLayerOn = (l: OverlayLayer) =>
    l.visible && (!anySolo || l.solo)

  // Aggregate keyframes for all visible layers in one <style> block.
  const keyframeChunks: string[] = []
  for (const layer of layers) {
    if (!isLayerOn(layer)) continue
    const motion = reducedMotion ? 'none' : layer.motion
    if (motion === 'none') continue
    const amt = Math.max(0, layer.motionAmount ?? 1)
    const jit = Math.max(0, layer.motionRandomness ?? 0)
    const uid = layer.id.replace(/[^a-zA-Z0-9]/g, '_')
    if (motion === 'breathe') {
      const s = 1 + 0.06 * amt
      keyframeChunks.push(`@keyframes ovk-${uid} {
0%,100%{transform:scale(1);}
50%{transform:scale(${s});}
}`)
    } else if (motion === 'spin') {
      keyframeChunks.push(`@keyframes ovk-${uid} {
from{transform:rotate(0deg);}
to{transform:rotate(360deg);}
}`)
    } else if (motion === 'drift') {
      const d = 2 * amt
      keyframeChunks.push(`@keyframes ovk-${uid} {
0%,100%{transform:translate(0,0);}
25%{transform:translate(${d}%,${-d * 0.75}%);}
50%{transform:translate(0,${d}%);}
75%{transform:translate(${-d}%,${-d * 0.5}%);}
}`)
    } else if (motion === 'pulse') {
      // Pulse target dictates which property animates.
      const target = layer.pulseTarget ?? 'scale'
      if (target === 'opacity') {
        const a = 1 - 0.45 * amt
        keyframeChunks.push(`@keyframes ovk-${uid} {
0%,100%{opacity:1;}
50%{opacity:${a};}
}`)
      } else if (target === 'blur') {
        const px = 12 * amt
        keyframeChunks.push(`@keyframes ovk-${uid} {
0%,100%{filter:blur(0px);}
50%{filter:blur(${px}px);}
}`)
      } else if (target === 'glow') {
        const px = 24 * amt
        keyframeChunks.push(`@keyframes ovk-${uid} {
0%,100%{filter:drop-shadow(0 0 0 transparent);}
50%{filter:drop-shadow(0 0 ${px}px ${layer.fill || '#ffffff'});}
}`)
      } else {
        // scale (default) and sourceSpeed (no CSS path — Pass-2)
        const s = 1 + 0.06 * amt
        const a = 1 - 0.22 * amt
        keyframeChunks.push(`@keyframes ovk-${uid} {
0%,100%{opacity:1;transform:scale(1);}
50%{opacity:${a};transform:scale(${s});}
}`)
      }
    } else if (motion === 'orbit') {
      // Orbit: shape circles a virtual center at orbitRadius % vmin.
      const r = (layer.orbitRadius ?? 0.18) * 100  // % of element box
      keyframeChunks.push(`@keyframes ovk-${uid} {
0%{transform:translate(${r}%,0%);}
25%{transform:translate(0%,${r}%);}
50%{transform:translate(${-r}%,0%);}
75%{transform:translate(0%,${-r}%);}
100%{transform:translate(${r}%,0%);}
}`)
    } else if (motion === 'shake') {
      // Shake: rapid small displacements. Amount = displacement %.
      const d = 1.5 * amt
      keyframeChunks.push(`@keyframes ovk-${uid} {
0%,100%{transform:translate(0,0);}
10%{transform:translate(${d}%,${-d}%);}
20%{transform:translate(${-d}%,${d}%);}
30%{transform:translate(${d * 0.6}%,${d * 0.8}%);}
40%{transform:translate(${-d * 0.8}%,${-d * 0.4}%);}
50%{transform:translate(${d * 0.3}%,${-d * 0.7}%);}
60%{transform:translate(${-d * 0.5}%,${d * 0.5}%);}
70%{transform:translate(${d}%,${d * 0.2}%);}
80%{transform:translate(${-d * 0.4}%,${-d}%);}
90%{transform:translate(${d * 0.7}%,${d * 0.6}%);}
}`)
    } else if (motion === 'flicker') {
      // Flicker: rapid opacity dips. Amount = depth.
      const a0 = Math.max(0.05, 1 - 0.85 * amt)
      const a1 = Math.max(0.2, 1 - 0.5 * amt)
      keyframeChunks.push(`@keyframes ovk-${uid} {
0%,100%{opacity:1;}
15%{opacity:${a0};}
30%{opacity:1;}
50%{opacity:${a1};}
65%{opacity:1;}
80%{opacity:${a0};}
}`)
    }
    void jit  // jit reserved for Pass-2 noise modulation
  }
  const allKeyframes = keyframeChunks.join('\n')

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <style>{allKeyframes}</style>
      {layers.map((layer) => {
        if (!isLayerOn(layer)) return null
        // Pattern-space expansion: each layer becomes N instances.
        // Task 1 wires `single` + `massive` only; other modes return
        // a single identity instance until later tasks fill them in.
        //
        // ─── Key stability invariant ──────────────────────────────
        // The instance index `i` is part of the React key. For React
        // to re-order rather than re-mount when a layer's pattern
        // params change, `expandLayerToInstances` MUST return a
        // stable order across renders for a given layer state. Future
        // pattern modes (kaleido, radial, tileGrid, cloneCloud, etc.)
        // must not shuffle the array — append/prune deterministically
        // off the same enumeration so index `i` always refers to the
        // same instance slot. Reordering between renders forces a
        // remount (and a flash) on every pattern-param tweak.
        const instances = expandLayerToInstances(layer)
        return instances.map((inst, i) => (
          <LayerView
            key={`${layer.id}-i${i}`}
            layer={layer}
            instance={inst}
            cw={cw}
            ch={ch}
            vmin={vmin}
            reducedMotion={reducedMotion}
          />
        ))
      })}
    </div>
  )
}

// Identity instance used when no `instance` prop is passed. Keeps
// LayerView callers that don't care about pattern space (none today)
// working without ceremony.
const IDENTITY_INSTANCE: LayerInstance = {
  dx: 0,
  dy: 0,
  scale: 1,
  rotation: 0,
  phase: 0,
  opacity: 1,
}

// Build the CSS transform string the per-instance transform would
// have applied as an outer wrapper. Returns '' when the instance is
// identity so the resulting transform composition stays byte-identical
// to the pre-pattern-space render path.
function instanceTransformCss(instance: LayerInstance): string {
  const isIdentity =
    instance.dx === 0 &&
    instance.dy === 0 &&
    instance.rotation === 0 &&
    instance.scale === 1 &&
    !instance.mirror
  if (isIdentity) return ''
  const mirrorX = instance.mirror === 'x' ? -1 : 1
  const mirrorY = instance.mirror === 'y' ? -1 : 1
  return `translate(${instance.dx}px, ${instance.dy}px) rotate(${instance.rotation}deg) scale(${instance.scale * mirrorX}, ${instance.scale * mirrorY})`
}

const MOTION_BASE_DUR_S: Record<string, number> = {
  none: 0,
  breathe: 4.6,
  spin: 22,
  drift: 7.2,
  pulse: 2.0,
  orbit: 6.0,
  shake: 0.7,
  flicker: 1.2,
}

function LayerView({
  layer,
  instance = IDENTITY_INSTANCE,
  cw,
  ch,
  vmin,
  reducedMotion,
}: {
  layer: OverlayLayer
  instance?: LayerInstance
  cw: number
  ch: number
  vmin: number
  reducedMotion: boolean
}) {
  const assetMeta = findAsset(layer.asset)
  // Per-instance transform/opacity baked INTO the same DOM node that
  // carries `mix-blend-mode`. Previously this lived on an outer
  // `InstanceWrapper` div, which created its own stacking context
  // (own transform + opacity) — invisible for `single`/`massive` (both
  // identity), but a footgun for Task 2+ pattern modes: blend modes
  // would composite against the wrapper instead of the tunnel canvas.
  // Composing here keeps blend on the same node as the combined
  // transform, so no intermediate stacking context exists.
  const instanceTransform = instanceTransformCss(instance)
  const instanceOpacity = instance.opacity

  // ─── EFFECT ASSETS ─────────────────────────────────────────────
  // Animated full-bleed SVG generators (laser fan, plasma, god rays,
  // sparkles, etc.). They IGNORE the path-mask machinery and render
  // self-contained SVG inside the mix-blend wrapper. The user's
  // blend mode + opacity + transform still apply.
  if (assetMeta.effectId) {
    const effectId = assetMeta.effectId
    const cw0 = Math.max(1, cw)
    const ch0 = Math.max(1, ch)
    // 2D layer transform: x/y as %-of-half-viewport translation,
    // scale + rotation around the effect's center. Applied to the
    // wrapper div so the effect's INTERNAL animation (e.g. wireframe
    // rotation) doesn't fight the user's manual placement.
    const txPct = (layer.x ?? 0) * 50
    const tyPct = (layer.y ?? 0) * 50
    const mx = layer.mirrorX ? -1 : 1
    const my = layer.mirrorY ? -1 : 1
    // Per-instance transform composes OUTERMOST so it positions the
    // already-transformed layer (matches the previous wrapper-around-
    // LayerView semantics — outer wrapper applied last).
    const layerTransform = [
      instanceTransform,
      `translate(${txPct}%, ${tyPct}%) scale(${layer.scale * mx}, ${layer.scale * my}) rotate(${layer.rotation}deg)`,
    ]
      .filter(Boolean)
      .join(' ')
    // Build CSS filter chain: blur + (for wireframes/glow) a
    // drop-shadow halo using the layer fill color.
    const filterParts: string[] = []
    if (layer.blur > 0) filterParts.push(`blur(${layer.blur}px)`)
    if (layer.glow > 0) {
      const halo = layer.fill || '#ffffff'
      filterParts.push(`drop-shadow(0 0 ${layer.glow}px ${halo})`)
    }
    // Kaleidoscope: render N rotated/mirrored copies of the entire
    // effect inside a wrapper. Each fold alternates mirrored so it
    // reads as a real kaleidoscope rather than a plain radial array.
    const fold = Math.max(1, Math.min(12, layer.kaleidoscope ?? 1))
    const renderEffect = (
      <EffectSVG
        effectId={effectId}
        seed={layer.assetSeed ?? layer.randomSeed}
        fill={layer.fill}
        cw={cw0}
        ch={ch0}
        wireSpeed={layer.wireSpeed}
        wireStrokeWidth={layer.wireStrokeWidth}
        wirePerspective={layer.wirePerspective}
        wireRotMix={layer.wireRotMix}
        wireFreeze={layer.wireFreeze}
        wireMultiplier={layer.wireMultiplier}
        wireDensity={layer.wireDensity}
        wireDashLength={layer.wireDashLength}
        wireTrailCount={layer.wireTrailCount}
        wireTrailDecay={layer.wireTrailDecay}
        wireTrailBlur={layer.wireTrailBlur}
        wireDepthFog={layer.wireDepthFog}
        wireDepthFogAmount={layer.wireDepthFogAmount}
      />
    )
    // Color cycle: nest a wrapper whose only filter is a CSS-animated
    // hue-rotate. Doesn't fight the outer wrapper's blur/drop-shadow
    // because filters are per-element, not inherited.
    const cycleSpeed = layer.colorCycleSpeed ?? 1
    const cycleRange = layer.colorCycleRange ?? 360
    const cycleEnabled = !!layer.colorCycle && cycleSpeed > 0
    const cycleDur = cycleEnabled ? Math.max(0.5, 10 / cycleSpeed) : 0
    const cycleUid = `${layer.id}-${cycleEnabled ? 'on' : 'off'}`.replace(
      /[^a-zA-Z0-9]/g,
      '_',
    )
    const wrapInComposition = (node: React.ReactNode) =>
      fold === 1 ? (
        node
      ) : (
        <>
          {Array.from({ length: fold }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                transform: `rotate(${(360 / fold) * i}deg)${i % 2 === 1 ? ' scaleX(-1)' : ''}`,
                transformOrigin: 'center center',
              }}
            >
              {node}
            </div>
          ))}
        </>
      )
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: layerTransform,
          transformOrigin: 'center center',
          mixBlendMode: layer.blendMode as React.CSSProperties['mixBlendMode'],
          opacity: layer.opacity * instanceOpacity,
          pointerEvents: 'none',
          filter: filterParts.length > 0 ? filterParts.join(' ') : undefined,
        }}
      >
        {cycleEnabled && (
          <style>{`
@keyframes hueCycle-${cycleUid} {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(${cycleRange}deg); }
}
        `}</style>
        )}
        {cycleEnabled ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              animation: `hueCycle-${cycleUid} ${cycleDur}s linear infinite`,
            }}
          >
            {wrapInComposition(renderEffect)}
          </div>
        ) : (
          wrapInComposition(renderEffect)
        )}
      </div>
    )
  }

  // Resolve path data: procedural assets generate fresh d/viewBox
  // from the layer's assetSeed. Static assets pass through.
  const resolvedAsset = resolveAssetPath(
    assetMeta,
    layer.assetSeed ?? layer.randomSeed,
  )
  const asset = {
    id: assetMeta.id,
    name: assetMeta.name,
    viewBox: resolvedAsset.viewBox,
    d: resolvedAsset.d,
  }
  const [vbMinX, vbMinY, vbW, vbH] = parseViewBox(asset.viewBox)
  const vbCx = vbMinX + vbW / 2
  const vbCy = vbMinY + vbH / 2
  const vbDim = Math.max(vbW, vbH) || 100
  const uid = layer.id.replace(/[^a-zA-Z0-9]/g, '_')
  const cutoutMaskId = `cut-${uid}`
  const stencilPatternId = `tile-${uid}`
  const stencilMaskId = `tilem-${uid}`
  const blurFilterId = `blur-${uid}`
  const glowFilterId = `glow-${uid}`

  const blur = Math.max(0, layer.blur)
  const glow = Math.max(0, layer.glow)
  const fillColor = layer.invert
    ? layer.fill === '#000000'
      ? '#ffffff'
      : '#000000'
    : layer.fill

  const motion = reducedMotion ? 'none' : layer.motion
  const speed = Math.max(0.1, layer.motionSpeed ?? 1)
  const baseDur = MOTION_BASE_DUR_S[motion] ?? 0
  const dur = baseDur > 0 ? baseDur / speed : 0
  // Per-layer phase: deterministic offset from randomSeed + user
  // motionPhase. Negative animation-delay starts the keyframe mid-
  // cycle so two layers with the same motion type don't lockstep.
  const seedPhase = (((layer.randomSeed ?? 0) >>> 0) % 1000) / 1000
  const totalPhase = (seedPhase + (layer.motionPhase ?? 0)) % 1
  const delaySec = -totalPhase * (dur || 1)
  const easing =
    motion === 'spin' || motion === 'shake' || motion === 'flicker'
      ? 'linear'
      : 'ease-in-out'
  const animationCss =
    motion === 'none'
      ? 'none'
      : `ovk-${uid} ${dur}s ${easing} ${delaySec}s infinite`

  // Position center: viewport center + normalized offset.
  const cx = cw / 2 + layer.x * (cw / 2)
  const cy = ch / 2 + layer.y * (ch / 2)
  const shapeSide = vmin * scaleFraction(layer.scale)
  const shapeMaskPosition = `${cx - shapeSide / 2}px ${cy - shapeSide / 2}px`
  const scaleFactor = shapeSide / vbDim
  const staticOuter = `translate(${cx} ${cy}) scale(${scaleFactor}) rotate(${layer.rotation})`
  const staticInner = `translate(${-vbCx} ${-vbCy})`

  const animatedStyle: React.CSSProperties = {
    animation: animationCss,
    transformOrigin: '50% 50%',
    transformBox: 'fill-box' as React.CSSProperties['transformBox'],
  }

  // Apply mix-blend-mode + opacity directly on the SVG (the element
  // that actually carries paint), not on a wrapper div. The wrapper
  // div is a layout-only container; putting blend on it can cause
  // the blend to be clipped by the wrapper's full-viewport rect.
  //
  // Per-instance transform/opacity (from `expandLayerToInstances`)
  // ride on this SAME node so the mix-blend node has no parent that
  // creates a stacking context above it — preventing blend modes
  // from compositing against a wrapper instead of the tunnel canvas.
  const svgStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    mixBlendMode: layer.blendMode as React.CSSProperties['mixBlendMode'],
    opacity: layer.opacity * instanceOpacity,
    transform: instanceTransform || undefined,
    transformOrigin: 'center center',
  }

  // ─── INDEPENDENT TUNNEL SOURCE ────────────────────────────────
  // Render a second TunnelCanvas, full-bleed, then clip it via CSS
  // mask-image to the layer's selected shape. mix-blend-mode +
  // opacity ride on the masked div (the element with paint).
  //
  // Hard rule: if sourceParams is missing, render NOTHING. The user
  // must explicitly Generate Source or Copy Base. We never silently
  // fall back to base/default tunnel params — that would make the
  // overlay look like a mirror of the base, which is the bug the
  // 2026-05-09 audit was about.
  if (layer.source === 'independentTunnel') {
    if (!layer.sourceParams) return null
    const resolvedParams: TunnelParams = {
      ...TUNNEL_DEFAULTS,
      ...layer.sourceParams,
    }
    const maskUrl = buildMaskDataUrl(asset.d, asset.viewBox, layer.rotation)

    // Mode-aware mask CSS so type=tile/shape/cutout/glow each behave
    // distinctly when the source is an independent tunnel.
    let maskCss: React.CSSProperties
    if (layer.type === 'tile') {
      // Tile: repeat the shape across the container as a stencil.
      // tileSize scales with layer.tileSpacing × layer.scale, same
      // formula as solid-tile mode.
      const tileSize = Math.max(28, vmin * (layer.tileSpacing || 0.12) * layer.scale)
      maskCss = {
        WebkitMaskImage: maskUrl,
        WebkitMaskRepeat: 'repeat',
        WebkitMaskPosition: shapeMaskPosition,
        WebkitMaskSize: `${tileSize}px ${tileSize}px`,
        maskImage: maskUrl,
        maskRepeat: 'repeat',
        maskPosition: shapeMaskPosition,
        maskSize: `${tileSize}px ${tileSize}px`,
      }
    } else if (layer.type === 'cutout') {
      // Cutout: tunnel visible EVERYWHERE EXCEPT inside the shape.
      // Compose a full white layer with the shape subtracted via
      // mask-composite. The white linear-gradient covers the whole
      // viewport; the shape mask punches a hole in it.
      maskCss = {
        WebkitMaskImage: `linear-gradient(white, white), ${maskUrl}`,
        WebkitMaskRepeat: 'no-repeat, no-repeat',
        WebkitMaskPosition: `center, ${shapeMaskPosition}`,
        WebkitMaskSize: `100% 100%, ${shapeSide}px ${shapeSide}px`,
        WebkitMaskComposite: 'source-out',
        maskImage: `linear-gradient(white, white), ${maskUrl}`,
        maskRepeat: 'no-repeat, no-repeat',
        maskPosition: `center, ${shapeMaskPosition}`,
        maskSize: `100% 100%, ${shapeSide}px ${shapeSide}px`,
        maskComposite: 'exclude',
      }
    } else {
      // shape / glow — single-shape mask, no repeat.
      maskCss = {
        WebkitMaskImage: maskUrl,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: shapeMaskPosition,
        WebkitMaskSize: `${shapeSide}px ${shapeSide}px`,
        maskImage: maskUrl,
        maskRepeat: 'no-repeat',
        maskPosition: shapeMaskPosition,
        maskSize: `${shapeSide}px ${shapeSide}px`,
      }
    }

    // Filter chain: blur (always available now) + glow halo when
    // type=glow. Both stack in `filter:`.
    const filterChain: string[] = []
    if (layer.blur > 0) filterChain.push(`blur(${layer.blur}px)`)
    if (layer.type === 'glow' && layer.glow > 0) {
      filterChain.push(`drop-shadow(0 0 ${layer.glow}px ${layer.fill || '#ffffff'})`)
    }

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          mixBlendMode: layer.blendMode as React.CSSProperties['mixBlendMode'],
          opacity: layer.opacity * instanceOpacity,
          ...maskCss,
          filter: filterChain.length > 0 ? filterChain.join(' ') : undefined,
          // Do not apply the generic SVG motion keyframes to an
          // independent tunnel layer. Those keyframes transform a
          // full-screen masked div, which makes manually placed
          // shapes drift/orbit/rotate around the stage instead of
          // holding their edited X/Y/scale. The independent tunnel
          // source already moves internally; mask-geometry animation
          // needs a dedicated implementation that animates mask
          // position/size/path around the saved base position.
          //
          // Per-instance transform IS applied here so pattern-space
          // (Task 2+) can stamp this layer at multiple offsets. It
          // sits on the same node as `mix-blend-mode` so blend still
          // composites against the tunnel canvas, not a wrapper.
          transform: instanceTransform || undefined,
          transformOrigin: '50% 50%',
          pointerEvents: 'none',
        }}
      >
        <TunnelCanvas active={true} params={resolvedParams} />
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg
        width={cw}
        height={ch}
        viewBox={`0 0 ${cw} ${ch}`}
        preserveAspectRatio="none"
        style={svgStyle}
      >
        <defs>
          {blur > 0 && (
            <filter
              id={blurFilterId}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation={blur * 0.6} />
            </filter>
          )}
          {layer.type === 'glow' && (
            <filter
              id={glowFilterId}
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation={Math.max(2, glow)} result="halo" />
              <feMerge>
                <feMergeNode in="halo" />
                <feMergeNode in="halo" />
                <feMergeNode in="halo" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
          {layer.type === 'cutout' && (
            <mask id={cutoutMaskId} maskUnits="userSpaceOnUse">
              <rect width={cw} height={ch} fill="white" />
              <g transform={staticOuter}>
                <g style={animatedStyle}>
                  <g transform={staticInner}>
                    <path d={asset.d} fill="black" fillRule="evenodd" />
                  </g>
                </g>
              </g>
            </mask>
          )}
          {layer.type === 'tile' &&
            (() => {
              const tileSize = Math.max(28, vmin * (layer.tileSpacing || 0.12) * layer.scale)
              const shapePadding = tileSize * 0.1
              const tileShapeScale = (tileSize * 0.8) / vbDim
              return (
                <>
                  <pattern
                    id={stencilPatternId}
                    patternUnits="userSpaceOnUse"
                    width={tileSize}
                    height={tileSize}
                  >
                    <rect width={tileSize} height={tileSize} fill="white" />
                    <g
                      transform={`translate(${shapePadding} ${shapePadding}) scale(${tileShapeScale}) rotate(${layer.rotation} ${vbCx} ${vbCy}) translate(${-vbMinX} ${-vbMinY})`}
                    >
                      <path d={asset.d} fill="black" fillRule="evenodd" />
                    </g>
                  </pattern>
                  <mask id={stencilMaskId} maskUnits="userSpaceOnUse">
                    <rect
                      width={cw}
                      height={ch}
                      fill={`url(#${stencilPatternId})`}
                    />
                  </mask>
                </>
              )
            })()}
        </defs>

        {layer.type === 'shape' && (
          <g transform={staticOuter}>
            <g style={animatedStyle}>
              <g transform={staticInner}>
                <path
                  d={asset.d}
                  fill={fillColor}
                  fillRule="evenodd"
                  filter={blur > 0 ? `url(#${blurFilterId})` : undefined}
                />
                {layer.strokeWidth > 0 && (
                  <path
                    d={asset.d}
                    fill="none"
                    stroke={layer.stroke}
                    strokeWidth={layer.strokeWidth}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </g>
            </g>
          </g>
        )}

        {layer.type === 'cutout' && (
          <rect
            width={cw}
            height={ch}
            fill={fillColor}
            mask={`url(#${cutoutMaskId})`}
          />
        )}

        {layer.type === 'glow' && (
          <g transform={staticOuter}>
            <g style={animatedStyle}>
              <g transform={staticInner}>
                <path
                  d={asset.d}
                  fill={fillColor}
                  fillOpacity={0.18 + 0.0025 * glow}
                  fillRule="evenodd"
                  filter={`url(#${glowFilterId})`}
                />
                <path
                  d={asset.d}
                  fill="none"
                  stroke={layer.stroke}
                  strokeWidth={Math.max(1.5, 1.5 + glow * 0.05)}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            </g>
          </g>
        )}

        {layer.type === 'tile' && (
          <rect
            width={cw}
            height={ch}
            fill={fillColor}
            mask={`url(#${stencilMaskId})`}
          />
        )}
      </svg>
    </div>
  )
}
