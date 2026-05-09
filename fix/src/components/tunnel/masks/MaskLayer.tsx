import { useEffect, useId, useRef, useState } from 'react'
import { findMask } from './maskAssets'
import { isMaskActive, shapeFraction, type MaskState } from './maskState'

// ─── MaskLayer ────────────────────────────────────────────────────
// Full-screen overlay that sits between the tunnel canvas (z=0) and
// the bird canvas (z=2). Pointer events disabled so OrbitControls on
// the bird still receive drags.
//
// Architecture (rewrite 2026-05-09):
//   • OFF returns null. No DOM, no styles, no observers.
//   • Active modes wrap the SVG path in TWO nested <g>:
//       - Outer <g>: SVG `transform=` attribute carries STATIC
//         translate→scale→rotate to position+size the shape.
//       - Inner <g>: CSS `animation` carries MOTION keyframes
//         around the path's local center via transform-box: fill-box.
//     This separation prevents CSS keyframe transforms from
//     overwriting the SVG transform attribute (the silhouette bug).
//   • Per-instance @keyframes are emitted inline so motionAmount can
//     bake into the keyframe values (CSS `var()` inside @keyframes
//     is unreliable across browsers).
//   • Cutout + tile rect fills are RGB (no alpha) so the overlay is
//     truly opaque — no tunnel leak through fractional transparency.
//   • LightLeak uses a thicker stroke + heavier blur + screen blend
//     so the glow is unmistakable at glow ≥ 25.
//   • prefers-reduced-motion forces motion to 'still' regardless of
//     the user's selection.

type Props = {
  mask: MaskState
}

const MOTION_BASE_DUR_S: Record<string, number> = {
  still: 0,
  breathe: 4.6,
  spin: 22,
  drift: 7.2,
  pulse: 2.0,
}

export function MaskLayer({ mask }: Props) {
  const uid = useId().replace(/:/g, '_')
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
    if (!isMaskActive(mask)) return
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
  }, [mask.mode])

  // OFF: no DOM artifacts, period.
  if (!isMaskActive(mask)) return null

  const asset = findMask(mask.asset)
  const cw = Math.max(1, size.w)
  const ch = Math.max(1, size.h)
  const vmin = Math.min(cw, ch)
  const shapeSide = vmin * shapeFraction(mask.size)
  const cx = cw / 2
  const cy = ch / 2

  const filterId = `mfx-${uid}`
  const cutoutMaskId = `mcut-${uid}`
  const stencilPatternId = `mtile-${uid}`
  const stencilMaskId = `mtile-mask-${uid}`
  const glowFilterId = `mglow-${uid}`

  const softness = Math.max(0, mask.softness)
  const glow = Math.max(0, mask.glow)
  const fillColor = mask.invert ? '#ffffff' : '#000000'
  const overlayFill = mask.invert ? '#ffffff' : '#000000'
  const leakColor = mask.invert ? '#ffffff' : '#ffffff' // glow stays light

  // Motion → animation values. Reduced-motion clamps to 'still'.
  const effectiveMotion = reducedMotion ? 'still' : mask.motion
  const motionSpeed = Math.max(0.1, mask.motionSpeed ?? 1)
  const motionAmount = Math.max(0, mask.motionAmount ?? 1)
  const baseDur = MOTION_BASE_DUR_S[effectiveMotion] ?? 0
  const dur = baseDur > 0 ? baseDur / motionSpeed : 0
  const animationName = `mask-${effectiveMotion}-${uid}`
  const animationCss =
    effectiveMotion === 'still'
      ? 'none'
      : `${animationName} ${dur}s ${effectiveMotion === 'spin' ? 'linear' : 'ease-in-out'} infinite`

  // Per-instance keyframes — values baked from motionAmount so the
  // animation respects the user's slider without re-registering CSS
  // variables (which @keyframes cannot interpolate reliably).
  const breatheScale = 1 + 0.06 * motionAmount       // 1.06 at amount=1
  const driftPx = 2 * motionAmount                    // 2% at amount=1
  const pulseScale = 1 + 0.03 * motionAmount
  const pulseAlpha = 1 - 0.22 * motionAmount

  const keyframes = `
@keyframes mask-breathe-${uid} {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(${breatheScale}); }
}
@keyframes mask-spin-${uid} {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes mask-drift-${uid} {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(${driftPx}%, ${-driftPx * 0.75}%); }
  50%      { transform: translate(0, ${driftPx}%); }
  75%      { transform: translate(${-driftPx}%, ${-driftPx * 0.5}%); }
}
@keyframes mask-pulse-${uid} {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: ${pulseAlpha}; transform: scale(${pulseScale}); }
}
`

  // Static transform: place the path's (50,50) center at (cx, cy),
  // scale to shapeSide pixels, rotate by user's rotation.
  const scaleFactor = shapeSide / 100
  const staticOuter = `translate(${cx} ${cy}) scale(${scaleFactor}) rotate(${mask.rotation})`
  // Inner translate centers the 0..100 path on its own (50,50).
  const staticInner = `translate(-50 -50)`

  // Inline style for the animated wrapper. transform-box: fill-box
  // so transform-origin pins to the bbox center of the path. This
  // is the magic that makes spin/breathe/pulse pivot correctly.
  const animatedStyle: React.CSSProperties = {
    animation: animationCss,
    transformOrigin: '50% 50%',
    transformBox: 'fill-box' as React.CSSProperties['transformBox'],
  }

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
      <style>{keyframes}</style>
      <svg
        width={cw}
        height={ch}
        viewBox={`0 0 ${cw} ${ch}`}
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          mixBlendMode: mask.mode === 'lightLeak' ? 'screen' : 'normal',
        }}
      >
        <defs>
          {/* Edge-softness filter for silhouette (and as a base for
              other modes). stdDeviation in user-space pixels since
              viewBox = container pixel dims. */}
          <filter
            id={filterId}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            {softness > 0 ? (
              <feGaussianBlur stdDeviation={softness * 0.6} />
            ) : (
              <feOffset dx="0" dy="0" />
            )}
          </filter>

          {/* Heavy glow filter for lightLeak — stroke + thick blur,
              composited so the halo extends well beyond the path. */}
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

          {/* Cutout mask: full-bleed white, shape painted black, so
              the masked rect ends up opaque everywhere except inside
              the shape. */}
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

          {/* Stencil pattern: tiles the shape across the container.
              tileSize is the square spacing in pixels. shapeScale
              fits the path's 100-unit space into 80% of the tile. */}
          {(() => {
            const tileSize = Math.max(28, vmin * 0.12 * mask.size)
            const shapePadding = tileSize * 0.1
            const shapeScale = (tileSize * 0.8) / 100
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
                    transform={`translate(${shapePadding} ${shapePadding}) scale(${shapeScale}) rotate(${mask.rotation} 50 50)`}
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

        {mask.mode === 'silhouette' && (
          <g transform={staticOuter}>
            <g style={animatedStyle}>
              <g transform={staticInner}>
                <path
                  d={asset.d}
                  fill={fillColor}
                  fillRule="evenodd"
                  filter={softness > 0 ? `url(#${filterId})` : undefined}
                />
              </g>
            </g>
          </g>
        )}

        {mask.mode === 'cutout' && (
          <rect
            width={cw}
            height={ch}
            fill={overlayFill}
            mask={`url(#${cutoutMaskId})`}
          />
        )}

        {mask.mode === 'lightLeak' && (
          <g transform={staticOuter}>
            <g style={animatedStyle}>
              <g transform={staticInner}>
                {/* Soft fill at low alpha so the SHAPE is dimly
                    luminous, not just an outline. Screen-blended
                    over the tunnel = picks up tunnel color tint. */}
                <path
                  d={asset.d}
                  fill={leakColor}
                  fillOpacity={0.18 + 0.0025 * glow}
                  fillRule="evenodd"
                  filter={`url(#${glowFilterId})`}
                />
                {/* Bright stroke on top — sharp edge inside the halo. */}
                <path
                  d={asset.d}
                  fill="none"
                  stroke={leakColor}
                  strokeWidth={Math.max(1.5, 1.5 + glow * 0.05)}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            </g>
          </g>
        )}

        {mask.mode === 'tile' && (
          <rect
            width={cw}
            height={ch}
            fill={overlayFill}
            mask={`url(#${stencilMaskId})`}
          />
        )}
      </svg>
    </div>
  )
}
