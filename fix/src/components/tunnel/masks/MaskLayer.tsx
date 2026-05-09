import { useId } from 'react'
import { findMask } from './maskAssets'
import { isMaskActive, type MaskState } from './maskState'

// ─── MaskLayer ────────────────────────────────────────────────────
// Absolute-positioned overlay that sits between the tunnel canvas
// (z-index 0) and the bird canvas (z-index 1). Pointer events are
// disabled so the user's drag gestures still hit the bird's
// OrbitControls.
//
// Modes:
//   • silhouette — solid black SVG shape painted on top of tunnel
//   • cutout     — black overlay with the SVG punched out, so the
//     tunnel only shows through the shape (poster effect)
//   • lightLeak  — SVG path stroked + filled with white, additively
//     blended with a halo blur so the shape glows in tunnel colors
//   • stencil    — repeated SVG pattern as cutout (poster grid)
//
// Motion modes are CSS keyframe animations applied to a wrapper
// `<g>` so transform-origin stays at center regardless of asset.

const KEYFRAMES = `
@keyframes mask-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.06); }
}
@keyframes mask-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes mask-drift {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(2%, -1.5%); }
  50%      { transform: translate(0, 2%); }
  75%      { transform: translate(-2%, -1%); }
}
@keyframes mask-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.78; transform: scale(1.03); }
}
`

const MOTION_TO_ANIMATION: Record<string, string> = {
  still: 'none',
  breathe: 'mask-breathe 4.6s ease-in-out infinite',
  spin: 'mask-spin 22s linear infinite',
  drift: 'mask-drift 7.2s ease-in-out infinite',
  pulse: 'mask-pulse 2.0s ease-in-out infinite',
}

type Props = {
  mask: MaskState
  // When fullscreen is active, allow the mask to fill the bird section
  // rather than getting cropped by the canvas Canvas element.
  fullBleed?: boolean
}

export function MaskLayer({ mask }: Props) {
  // Stable per-instance ids so multiple MaskLayer mounts (HMR, demo
  // remounts) don't fight over a global #cutoutMask DOM id.
  const uid = useId().replace(/:/g, '')
  const asset = findMask(mask.asset)
  if (!isMaskActive(mask)) return null

  // Effective scale: 60% of viewport at size=1, with size as the
  // multiplier. We render the mask in a 100×100 SVG that fills 100%
  // of the layer; the inner `<g>` is scaled around the center.
  const scale = mask.size

  // Filter chain: softness blurs the shape edge; lightLeak adds an
  // outer glow + screen-blend. We compose them in the SVG `<defs>`
  // and reference by id so the path has a single `filter` attr.
  const filterId = `mask-fx-${uid}`
  const cutoutMaskId = `mask-cut-${uid}`
  const stencilPatternId = `mask-tile-${uid}`

  const softness = Math.max(0, mask.softness)
  const glow = Math.max(0, mask.glow)
  const fillColor = mask.invert
    ? '#ffffff'
    : mask.mode === 'lightLeak'
    ? '#ffffff'
    : '#000000'

  const animation = MOTION_TO_ANIMATION[mask.motion] ?? 'none'

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <style>{KEYFRAMES}</style>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          // lightLeak blends additively with the tunnel; other modes
          // are normal compositing.
          mixBlendMode:
            mask.mode === 'lightLeak' ? 'screen' : 'normal',
        }}
      >
        <defs>
          {/* Edge-softness + outer-glow filter. The blur stdDeviation
              uses viewBox units (100×100), so we scale softness from
              pixels-ish into shape-space. */}
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            {softness > 0 ? (
              <feGaussianBlur stdDeviation={softness / 6} result="softened" />
            ) : (
              <feOffset dx="0" dy="0" in="SourceGraphic" result="softened" />
            )}
            {mask.mode === 'lightLeak' && glow > 0 ? (
              <>
                <feGaussianBlur
                  stdDeviation={glow / 5}
                  in="softened"
                  result="halo"
                />
                <feMerge>
                  <feMergeNode in="halo" />
                  <feMergeNode in="halo" />
                  <feMergeNode in="softened" />
                </feMerge>
              </>
            ) : null}
          </filter>

          {/* Cutout mask: white background, shape painted black so the
              outer rect becomes opaque everywhere except inside the
              shape. The masked black rect = "frame" with a hole. */}
          <mask id={cutoutMaskId} maskUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="white" />
            <g
              transform={`translate(50 50) scale(${scale}) rotate(${mask.rotation}) translate(-50 -50)`}
              style={{
                transformOrigin: '50px 50px',
                animation,
              }}
            >
              <path d={asset.d} fill="black" fillRule="evenodd" />
            </g>
          </mask>

          {/* Stencil pattern: tiles the shape as a small repeated motif.
              When painted into a `<mask>` it acts as transparent
              windows in a black overlay. Tile size scales with the
              user's `size` slider so the motif grows/shrinks. */}
          <pattern
            id={stencilPatternId}
            patternUnits="userSpaceOnUse"
            width={Math.max(8, 24 / scale)}
            height={Math.max(8, 24 / scale)}
          >
            <rect
              width={Math.max(8, 24 / scale)}
              height={Math.max(8, 24 / scale)}
              fill="white"
            />
            <g
              transform={`translate(${Math.max(2, 6 / scale)} ${Math.max(2, 6 / scale)}) scale(${0.18 / scale}) rotate(${mask.rotation} 50 50)`}
            >
              <path d={asset.d} fill="black" />
            </g>
          </pattern>
          <mask id={`stencil-${uid}`} maskUnits="userSpaceOnUse">
            <rect width="100" height="100" fill={`url(#${stencilPatternId})`} />
          </mask>
        </defs>

        {mask.mode === 'silhouette' && (
          <g
            transform={`translate(50 50) scale(${scale}) rotate(${mask.rotation}) translate(-50 -50)`}
            style={{ transformOrigin: '50px 50px', animation }}
          >
            <path
              d={asset.d}
              fill={fillColor}
              fillRule="evenodd"
              filter={`url(#${filterId})`}
            />
          </g>
        )}

        {mask.mode === 'cutout' && (
          <rect
            width="100"
            height="100"
            fill={mask.invert ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.94)'}
            mask={`url(#${cutoutMaskId})`}
          />
        )}

        {mask.mode === 'lightLeak' && (
          <g
            transform={`translate(50 50) scale(${scale}) rotate(${mask.rotation}) translate(-50 -50)`}
            style={{ transformOrigin: '50px 50px', animation }}
          >
            <path
              d={asset.d}
              fill="none"
              stroke={fillColor}
              strokeWidth={1.4}
              filter={`url(#${filterId})`}
            />
          </g>
        )}

        {mask.mode === 'stencil' && (
          <rect
            width="100"
            height="100"
            fill={mask.invert ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.92)'}
            mask={`url(#stencil-${uid})`}
            style={{ animation, transformOrigin: '50px 50px' }}
          />
        )}
      </svg>
    </div>
  )
}
