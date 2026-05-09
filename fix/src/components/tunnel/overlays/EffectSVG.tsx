import { useEffect, useMemo, useRef, useState } from 'react'
import { mulberry32 } from '../generator/rng'
import {
  cube,
  pyramid,
  icosahedron,
  sphereWireframe,
  helix,
  portalTunnel,
  torus,
  type Geometry,
} from './wireframeGeometry'
import type { LayerInstance } from './expandLayer'

// Default `instances` for Wireframe3D when the caller hasn't run
// `expandLayerToInstances` yet — a single identity instance so every
// existing call site keeps rendering the same single wireframe pose.
// Task 5 will use the full `instances` array to stamp per-clone copies
// with phase / depth / rotation offsets.
const DEFAULT_WIRE_INSTANCES: readonly LayerInstance[] = [
  { dx: 0, dy: 0, scale: 1, rotation: 0, phase: 0, opacity: 1 },
]

// ─── TODO: shared overlay animation clock ─────────────────────────
// Each Wireframe3D instance currently mounts its own rAF. Fine for
// 1–3 active wireframes; bad past that (10 active = 10 rAF callbacks
// each mutating their own DOM node). Next refactor: a single
// shared OverlayClock context that ticks once per frame, broadcasts
// `now` to every subscriber, and lets each wireframe compute its
// projection from that one clock. Same applies if/when audio-stem
// reactivity lands — the audio analyser also wants one global clock.

// ─── EffectSVG — animated full-bleed SVG visual generators ────────
// Self-contained SVG fragments that USE THE BROWSER'S BUILT-IN
// generators rather than path data:
//   • <feTurbulence>     — Perlin/fractal noise (browser-native)
//   • <feGaussianBlur>   — bloom / soft falloff
//   • <linearGradient> / <radialGradient> — light leaks, beams
//   • <animate> / <animateTransform> (SMIL) — driven motion that
//     doesn't need a JS animation loop
//
// Each effect ships as its own component that takes a per-layer
// randomSeed (for parameter variation) + layer.fill (for color when
// applicable). The OverlayStack mounts these full-bleed inside the
// mix-blend wrapper, bypassing the path-mask machinery.

export type EffectId =
  | 'laserFan'
  | 'plasma'
  | 'lightLeak'
  | 'godRays'
  | 'matrixRain'
  | 'sparkles'
  | 'crtBars'
  | 'wireCube'
  | 'wireIco'
  | 'wireSphere'
  | 'wireHelix'
  | 'wirePortal'
  | 'wireTorus'
  | 'wirePyramid'

export type EffectProps = {
  effectId: EffectId
  seed: number
  fill?: string  // preferred color when the effect has one
  cw: number
  ch: number
  // Wireframe-only tunables (passed through from OverlayLayer).
  // Other effects ignore these.
  wireSpeed?: number
  wireStrokeWidth?: number
  wirePerspective?: number
  wireRotMix?: number
  wireFreeze?: boolean
  wireMultiplier?: number
  wireDensity?: number
  wireDashLength?: number
  wireTrailCount?: number
  wireTrailDecay?: number
  wireTrailBlur?: number
  wireDepthFog?: boolean
  wireDepthFogAmount?: number
  // Pattern-space instances. Wireframe3D uses these in Task 5 to
  // stamp per-clone copies with phase / depth / rotation offsets.
  // Other effects currently ignore the prop. Defaults to a single
  // identity instance so existing callers keep rendering identically.
  instances?: readonly LayerInstance[]
}

export function EffectSVG({
  effectId,
  seed,
  fill,
  cw,
  ch,
  wireSpeed,
  wireStrokeWidth,
  wirePerspective,
  wireRotMix,
  wireFreeze,
  wireMultiplier,
  wireDensity,
  wireDashLength,
  wireTrailCount,
  wireTrailDecay,
  wireTrailBlur,
  wireDepthFog,
  wireDepthFogAmount,
  instances,
}: EffectProps) {
  const rng = useMemo(() => mulberry32(seed >>> 0), [seed])

  switch (effectId) {
    case 'laserFan':
      return <LaserFan rng={rng} fill={fill ?? '#ffffff'} cw={cw} ch={ch} />
    case 'plasma':
      return <Plasma rng={rng} cw={cw} ch={ch} />
    case 'lightLeak':
      return <LightLeak rng={rng} cw={cw} ch={ch} />
    case 'godRays':
      return <GodRays rng={rng} fill={fill ?? '#ffffff'} cw={cw} ch={ch} />
    case 'matrixRain':
      return <MatrixRain rng={rng} fill={fill ?? '#00ff88'} cw={cw} ch={ch} />
    case 'sparkles':
      return <Sparkles rng={rng} fill={fill ?? '#ffffff'} cw={cw} ch={ch} />
    case 'crtBars':
      return <CRTBars rng={rng} fill={fill ?? '#ffffff'} cw={cw} ch={ch} />
    case 'wireCube':
    case 'wireIco':
    case 'wireSphere':
    case 'wireHelix':
    case 'wirePortal':
    case 'wireTorus':
    case 'wirePyramid': {
      // Density scales detail for parametric geometries. Static
      // shapes (cube, ico, pyramid) ignore it.
      const dens = Math.max(0.4, Math.min(2.5, wireDensity ?? 1))
      const geom: Geometry =
        effectId === 'wireCube' ? cube
        : effectId === 'wireIco' ? icosahedron
        : effectId === 'wireSphere' ? sphereWireframe(
            Math.max(4, Math.round(8 * dens)),
            Math.max(6, Math.round(14 * dens)),
          )
        : effectId === 'wireHelix' ? helix(
            Math.max(2, Math.round(4 * dens)),
            Math.max(40, Math.round(80 * dens)),
            0.55,
            2.2,
          )
        : effectId === 'wirePortal' ? portalTunnel(
            Math.max(6, Math.round(12 * dens)),
            Math.max(10, Math.round(18 * dens)),
          )
        : effectId === 'wireTorus' ? torus(
            0.85,
            0.32,
            Math.max(12, Math.round(22 * dens)),
            Math.max(8, Math.round(12 * dens)),
          )
        : pyramid
      return (
        <Wireframe3D
          geometry={geom}
          rng={rng}
          fill={fill ?? '#ffffff'}
          cw={cw}
          ch={ch}
          tiltLock={effectId === 'wirePortal'}
          wireSpeed={wireSpeed}
          wireStrokeWidth={wireStrokeWidth}
          wirePerspective={wirePerspective}
          wireRotMix={wireRotMix}
          wireFreeze={wireFreeze}
          wireMultiplier={wireMultiplier}
          wireDashLength={wireDashLength}
          wireTrailCount={wireTrailCount}
          wireTrailDecay={wireTrailDecay}
          wireTrailBlur={wireTrailBlur}
          wireDepthFog={wireDepthFog}
          wireDepthFogAmount={wireDepthFogAmount}
          instances={instances ?? DEFAULT_WIRE_INSTANCES}
        />
      )
    }
  }
}

// ─── LASER FAN ─────────────────────────────────────────────────────
// 16–32 thin lines radiating from center, rotating slowly with bloom.
function LaserFan({
  rng,
  fill,
  cw,
  ch,
}: {
  rng: () => number
  fill: string
  cw: number
  ch: number
}) {
  const N = 16 + Math.floor(rng() * 16)
  const dur = 14 + rng() * 16
  const reverse = rng() > 0.5
  const beamW = 0.4 + rng() * 1.2
  const cx = cw / 2
  const cy = ch / 2
  const reach = Math.max(cw, ch)
  return (
    <svg
      width={cw}
      height={ch}
      viewBox={`0 0 ${cw} ${ch}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <filter id={`bloom-${seedTag(rng)}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `laser-spin-${reverse ? 'rev' : 'fwd'} ${dur}s linear infinite`,
        }}
      >
        <style>{`
@keyframes laser-spin-fwd { to { transform: rotate(360deg); } }
@keyframes laser-spin-rev { to { transform: rotate(-360deg); } }
        `}</style>
        {Array.from({ length: N }).map((_, i) => {
          const a = (i / N) * Math.PI * 2
          const len = reach * (0.5 + rng() * 0.5)
          const tipX = cx + len * Math.cos(a)
          const tipY = cy + len * Math.sin(a)
          const nx = -Math.sin(a) * beamW
          const ny = Math.cos(a) * beamW
          return (
            <polygon
              key={i}
              points={`${cx - nx},${cy - ny} ${tipX - nx},${tipY - ny} ${tipX + nx},${tipY + ny} ${cx + nx},${cy + ny}`}
              fill={fill}
            />
          )
        })}
      </g>
    </svg>
  )
}

// ─── PLASMA NOISE ─────────────────────────────────────────────────
// feTurbulence fractal noise + animated baseFrequency + colorMatrix
// hueRotate.
function Plasma({
  rng,
  cw,
  ch,
}: {
  rng: () => number
  cw: number
  ch: number
}) {
  const baseFreq = 0.008 + rng() * 0.04
  const octaves = 2 + Math.floor(rng() * 3)
  const dur = 8 + rng() * 14
  const hueDur = 12 + rng() * 18
  const tag = seedTag(rng)
  return (
    <svg
      width={cw}
      height={ch}
      viewBox={`0 0 ${cw} ${ch}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <filter id={`plasma-${tag}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFreq}
            numOctaves={octaves}
            seed={Math.floor(rng() * 1000)}
          >
            <animate
              attributeName="baseFrequency"
              dur={`${dur}s`}
              values={`${baseFreq};${baseFreq * 1.6};${baseFreq * 0.7};${baseFreq}`}
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix type="hueRotate" values="0">
            <animate
              attributeName="values"
              from="0"
              to="360"
              dur={`${hueDur}s`}
              repeatCount="indefinite"
            />
          </feColorMatrix>
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0.4 0.4 0.4 0 0"
          />
        </filter>
      </defs>
      <rect width={cw} height={ch} filter={`url(#plasma-${tag})`} />
    </svg>
  )
}

// ─── LIGHT LEAK ───────────────────────────────────────────────────
// 2–4 large soft radial gradients drifting independently.
function LightLeak({
  rng,
  cw,
  ch,
}: {
  rng: () => number
  cw: number
  ch: number
}) {
  const palette = [
    ['#ff6b35', '#ffaa55'],
    ['#4ecdc4', '#88ddee'],
    ['#ff006e', '#ff44aa'],
    ['#ffd23f', '#ffee88'],
    ['#9b5de5', '#cc99ff'],
    ['#00f5d4', '#88ffe0'],
    ['#f72585', '#ff77b8'],
  ]
  const N = 2 + Math.floor(rng() * 3)
  const orbs = Array.from({ length: N }).map((_, i) => {
    const cx = 20 + rng() * 60
    const cy = 20 + rng() * 60
    const r = 30 + rng() * 25
    const dur = 14 + rng() * 18
    const drift = 12 + rng() * 18
    const colors = palette[Math.floor(rng() * palette.length)]
    const seedKey = `${i}-${Math.floor(rng() * 9999)}`
    return { cx, cy, r, dur, drift, colors, seedKey }
  })
  return (
    <svg
      width={cw}
      height={ch}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        {orbs.map((o, i) => (
          <radialGradient
            key={i}
            id={`leak-${o.seedKey}`}
            cx="50%"
            cy="50%"
            r="50%"
          >
            <stop offset="0%" stopColor={o.colors[0]} stopOpacity="0.85" />
            <stop offset="60%" stopColor={o.colors[1]} stopOpacity="0.35" />
            <stop offset="100%" stopColor={o.colors[1]} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      <rect width="100" height="100" fill="black" opacity="0" />
      {orbs.map((o, i) => (
        <circle
          key={i}
          cx={o.cx}
          cy={o.cy}
          r={o.r}
          fill={`url(#leak-${o.seedKey})`}
        >
          <animate
            attributeName="cx"
            values={`${o.cx};${Math.min(80, o.cx + o.drift)};${Math.max(20, o.cx - o.drift)};${o.cx}`}
            dur={`${o.dur}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values={`${o.cy};${Math.max(15, o.cy - o.drift * 0.7)};${Math.min(85, o.cy + o.drift * 0.7)};${o.cy}`}
            dur={`${o.dur * 1.3}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  )
}

// ─── GOD RAYS ─────────────────────────────────────────────────────
// 6–12 vertical thin gradient strips skewed sideways, with bloom.
function GodRays({
  rng,
  fill,
  cw,
  ch,
}: {
  rng: () => number
  fill: string
  cw: number
  ch: number
}) {
  const N = 6 + Math.floor(rng() * 7)
  const skewDeg = (rng() - 0.5) * 30
  const dur = 12 + rng() * 12
  const tag = seedTag(rng)
  const rays = Array.from({ length: N }).map(() => {
    const x = rng() * 100
    const w = 0.6 + rng() * 2.5
    const opacity = 0.25 + rng() * 0.55
    return { x, w, opacity }
  })
  return (
    <svg
      width={cw}
      height={ch}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id={`ray-${tag}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.85" />
          <stop offset="60%" stopColor={fill} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
        <filter id={`blur-${tag}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <g
        transform={`skewX(${skewDeg.toFixed(1)})`}
        style={{
          transformOrigin: '50% 0%',
          animation: `god-shift-${tag} ${dur}s ease-in-out infinite`,
        }}
        filter={`url(#blur-${tag})`}
      >
        <style>{`
@keyframes god-shift-${tag} {
0%,100% { transform: skewX(${skewDeg.toFixed(1)}deg) translateX(0); }
50% { transform: skewX(${skewDeg.toFixed(1)}deg) translateX(${(8 + rng() * 6).toFixed(1)}%); }
}
        `}</style>
        {rays.map((r, i) => (
          <rect
            key={i}
            x={r.x}
            y="-10"
            width={r.w}
            height="120"
            fill={`url(#ray-${tag})`}
            opacity={r.opacity}
          />
        ))}
      </g>
    </svg>
  )
}

// ─── MATRIX RAIN ──────────────────────────────────────────────────
// 16–32 vertical falling strips of small dots; each strip is a
// gradient-faded rect that loops downward.
function MatrixRain({
  rng,
  fill,
  cw,
  ch,
}: {
  rng: () => number
  fill: string
  cw: number
  ch: number
}) {
  const N = 16 + Math.floor(rng() * 16)
  const tag = seedTag(rng)
  const strips = Array.from({ length: N }).map(() => {
    const x = rng() * 100
    const w = 0.6 + rng() * 1.4
    const dur = 2 + rng() * 6
    const delay = rng() * dur
    const len = 18 + rng() * 28
    return { x, w, dur, delay, len }
  })
  return (
    <svg
      width={cw}
      height={ch}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id={`rain-${tag}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0" />
          <stop offset="80%" stopColor={fill} stopOpacity="0.95" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {strips.map((s, i) => (
        <rect
          key={i}
          x={s.x}
          width={s.w}
          height={s.len}
          fill={`url(#rain-${tag})`}
        >
          <animate
            attributeName="y"
            from={-s.len}
            to={100}
            dur={`${s.dur}s`}
            begin={`-${s.delay}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}
    </svg>
  )
}

// ─── SPARKLES ─────────────────────────────────────────────────────
// 40–80 tiny dots twinkling at staggered phases.
function Sparkles({
  rng,
  fill,
  cw,
  ch,
}: {
  rng: () => number
  fill: string
  cw: number
  ch: number
}) {
  const N = 40 + Math.floor(rng() * 40)
  const stars = Array.from({ length: N }).map(() => {
    const x = rng() * 100
    const y = rng() * 100
    const r = 0.3 + rng() * 1.2
    const dur = 0.6 + rng() * 2.4
    const delay = rng() * dur
    return { x, y, r, dur, delay }
  })
  return (
    <svg
      width={cw}
      height={ch}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={fill}>
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur={`${s.dur}s`}
            begin={`-${s.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  )
}

// ─── CRT BARS ─────────────────────────────────────────────────────
// Horizontal banding scrolling slowly, with one bright "scanline"
// streaking down.
function CRTBars({
  rng,
  fill,
  cw,
  ch,
}: {
  rng: () => number
  fill: string
  cw: number
  ch: number
}) {
  const N = 8 + Math.floor(rng() * 8)
  const dur = 1.4 + rng() * 2.4
  const tag = seedTag(rng)
  const bars = Array.from({ length: N }).map(() => {
    const y = rng() * 100
    const h = 1 + rng() * 4
    const opacity = 0.15 + rng() * 0.4
    return { y, h, opacity }
  })
  return (
    <svg
      width={cw}
      height={ch}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id={`scan-${tag}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0" />
          <stop offset="50%" stopColor={fill} stopOpacity="1" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {bars.map((b, i) => (
        <rect
          key={i}
          x="0"
          y={b.y}
          width="100"
          height={b.h}
          fill={fill}
          opacity={b.opacity}
        />
      ))}
      {/* Bright moving scanline */}
      <rect
        x="0"
        width="100"
        height="2.5"
        fill={`url(#scan-${tag})`}
        opacity="0.85"
      >
        <animate
          attributeName="y"
          from="-3"
          to="100"
          dur={`${dur}s`}
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  )
}

// ─── helpers ──────────────────────────────────────────────────────
// Per-instance unique-ish id so multiple effect mounts don't clash
// on filter / gradient ids.
let _tagCounter = 0
function seedTag(rng: () => number): string {
  return `${(_tagCounter = (_tagCounter + 1) % 100000)}-${Math.floor(rng() * 9999)}`
}

// ─── 3D Wireframe ─────────────────────────────────────────────────
// JS-driven projection: rotate vertices each frame around Y (and X
// or Z depending on the geometry style), apply perspective, write
// each edge as a polyline segment into a single SVG <path d="...">.
//
// Rotation speeds are seeded so multiple wireframe layers don't
// rotate in lockstep. The projection writes via direct DOM mutation
// (ref.setAttribute) inside requestAnimationFrame — no React
// re-renders per frame.
function Wireframe3D({
  geometry,
  rng,
  fill,
  cw,
  ch,
  tiltLock,
  wireSpeed,
  wireStrokeWidth,
  wirePerspective,
  wireRotMix,
  wireFreeze,
  wireMultiplier,
  wireDashLength,
  wireTrailCount,
  wireTrailDecay,
  wireTrailBlur,
  wireDepthFog,
  wireDepthFogAmount,
  instances = DEFAULT_WIRE_INSTANCES,
}: {
  geometry: Geometry
  rng: () => number
  fill: string
  cw: number
  ch: number
  tiltLock?: boolean
  wireSpeed?: number
  wireStrokeWidth?: number
  wirePerspective?: number
  wireRotMix?: number
  wireFreeze?: boolean
  wireMultiplier?: number
  wireDashLength?: number
  wireTrailCount?: number
  wireTrailDecay?: number
  wireTrailBlur?: number
  wireDepthFog?: boolean
  wireDepthFogAmount?: number
  // Pattern-space instances. Task 5 reads this to stamp per-clone
  // copies inside the single rAF loop. Today we only assert that the
  // prop arrives — Task 5's per-clone phase / rotation / depth math
  // hangs off these entries.
  instances?: readonly LayerInstance[]
}) {
  // Reference the prop so it's not flagged as unused before Task 5
  // wires per-clone offsets into the projection loop.
  void instances
  const multiplier = Math.max(1, Math.min(8, wireMultiplier ?? 1))
  const trailCount = Math.max(0, Math.min(8, wireTrailCount ?? 0))
  const trailDecay = Math.max(0.2, Math.min(0.95, wireTrailDecay ?? 0.6))
  const trailBlurPx = Math.max(0, Math.min(8, wireTrailBlur ?? 0))
  const depthFog = !!wireDepthFog
  const fogAmount = Math.max(0, Math.min(1, wireDepthFogAmount ?? 0.7))
  // Total path slots: per instance × (trailCount + 1) × (3 fog buckets if fog else 1).
  const fogBuckets = depthFog ? 3 : 1
  const slotsPerInstance = (trailCount + 1) * fogBuckets
  const totalPaths = multiplier * slotsPerInstance
  // Refs for each path slot.
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  if (pathRefs.current.length !== totalPaths) {
    pathRefs.current = new Array(totalPaths).fill(null)
  }
  // Seed-driven rotation speeds (rad/sec).
  const baseSpeedY = useMemo(() => 0.25 + rng() * 0.6, [rng])
  const baseSpeedX = useMemo(
    () => (tiltLock ? 0 : (rng() - 0.5) * 0.8),
    [rng, tiltLock],
  )
  const phaseY = useMemo(() => rng() * Math.PI * 2, [rng])
  const phaseX = useMemo(() => rng() * Math.PI * 2, [rng])
  const scaleK = useMemo(() => 0.85 + rng() * 0.3, [rng])
  const dirSign = useMemo(() => (rng() > 0.5 ? 1 : -1), [rng])

  // Detect reduced-motion preference. When on, freeze the wireframe
  // at its initial seed-derived phase rather than animating.
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const fn = () => setReducedMotion(mq.matches)
    mq.addEventListener?.('change', fn)
    return () => mq.removeEventListener?.('change', fn)
  }, [])

  // Effective tunables (apply user wire* overrides on top of seed
  // defaults). When wireFreeze or reducedMotion is on, speed = 0.
  const userSpeed = wireSpeed ?? 1
  const frozen = !!wireFreeze || reducedMotion
  const speedY = frozen ? 0 : baseSpeedY * userSpeed
  // wireRotMix (0..1) blends X-axis rotation in. 0 = Y only.
  const rotMix = wireRotMix ?? 0.5
  const speedX = frozen ? 0 : baseSpeedX * userSpeed * rotMix * 2
  const camZ = wirePerspective ?? 3
  const stroke = wireStrokeWidth ?? 1.4

  useEffect(() => {
    let raf = 0
    const start = performance.now() / 1000

    // Project geometry at given rotation, return:
    //  - projected 2D points
    //  - per-vertex z (for fog bucketing)
    const project = (aY: number, aX: number) => {
      const cosY = Math.cos(aY), sinY = Math.sin(aY)
      const cosX = Math.cos(aX), sinX = Math.sin(aX)
      const minDim = Math.min(cw, ch)
      const screenScale = minDim * 0.35 * scaleK
      const cx = cw / 2
      const cy = ch / 2
      const projected: [number, number][] = []
      const zs: number[] = []
      for (let i = 0; i < geometry.vertices.length; i++) {
        const [vx, vy, vz] = geometry.vertices[i]
        let x = vx * cosY + vz * sinY
        let z = -vx * sinY + vz * cosY
        let y = vy
        const y2 = y * cosX - z * sinX
        const z2 = y * sinX + z * cosX
        y = y2; z = z2
        const denom = camZ + z
        const sx = cx + (x / denom) * screenScale
        const sy = cy + (y / denom) * screenScale
        projected.push([sx, sy])
        zs.push(z)
      }
      return { projected, zs }
    }

    // Write paths for one instance × trail × fog-bucket.
    const renderInstanceTrail = (
      instanceIdx: number,
      trailIdx: number,
      aY: number,
      aX: number,
    ) => {
      const { projected, zs } = project(aY, aX)
      const slotBase =
        instanceIdx * slotsPerInstance + trailIdx * fogBuckets
      if (depthFog) {
        // Sort edges into 3 buckets by averaged z. Lower z = front.
        const buckets: string[][] = [[], [], []]
        for (let i = 0; i < geometry.edges.length; i++) {
          const [a, b] = geometry.edges[i]
          const pa = projected[a]
          const pb = projected[b]
          const zAvg = (zs[a] + zs[b]) * 0.5
          // Bucket boundaries: front <-0.3, mid -0.3..0.3, back >0.3.
          const bIdx = zAvg < -0.3 ? 0 : zAvg < 0.3 ? 1 : 2
          buckets[bIdx].push(
            `M${pa[0].toFixed(2)} ${pa[1].toFixed(2)} L${pb[0].toFixed(2)} ${pb[1].toFixed(2)}`,
          )
        }
        for (let b = 0; b < 3; b++) {
          const el = pathRefs.current[slotBase + b]
          if (el) el.setAttribute('d', buckets[b].join(' '))
        }
      } else {
        const parts: string[] = []
        for (let i = 0; i < geometry.edges.length; i++) {
          const [a, b] = geometry.edges[i]
          const pa = projected[a]
          const pb = projected[b]
          parts.push(
            `M${pa[0].toFixed(2)} ${pa[1].toFixed(2)} L${pb[0].toFixed(2)} ${pb[1].toFixed(2)}`,
          )
        }
        const el = pathRefs.current[slotBase]
        if (el) el.setAttribute('d', parts.join(' '))
      }
    }

    // Trail step: each ghost path is `trailStepSec` of "earlier"
    // motion. Larger speed → larger phase delta per step.
    const trailStepSec = 0.08

    // One-shot render for the frozen case so the wireframe still
    // shows at its initial pose without burning rAF.
    if (frozen) {
      for (let i = 0; i < multiplier; i++) {
        const phaseShift = (Math.PI * 2 * i) / multiplier
        for (let tr = 0; tr <= trailCount; tr++) {
          // No motion when frozen — all trail copies coincide.
          const aY = phaseY + phaseShift
          const aX = tiltLock ? 0.35 : phaseX + phaseShift * 0.5
          renderInstanceTrail(i, tr, aY, aX)
        }
      }
      return () => {}
    }

    const tick = () => {
      const now = performance.now() / 1000
      const t = now - start
      for (let i = 0; i < multiplier; i++) {
        const phaseShift = (Math.PI * 2 * i) / multiplier
        // Walk t backwards by `trailStepSec` per trail step.
        for (let tr = 0; tr <= trailCount; tr++) {
          const tEff = t - tr * trailStepSec
          const aY = phaseY + phaseShift + dirSign * speedY * tEff
          const aX = tiltLock
            ? 0.35
            : phaseX + phaseShift * 0.5 + speedX * tEff
          renderInstanceTrail(i, tr, aY, aX)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [
    geometry, speedX, speedY, phaseX, phaseY, scaleK, dirSign,
    cw, ch, tiltLock, frozen, camZ, multiplier,
    trailCount, depthFog, slotsPerInstance, fogBuckets,
  ])

  // Stroke dash. 0 = solid; > 0 = dashed with marching offset
  // animated via SMIL (no JS frame needed for dash-march).
  const dashLen = wireDashLength ?? 0
  const dashStr = dashLen > 0 ? `${dashLen.toFixed(2)} ${(dashLen * 1.2).toFixed(2)}` : undefined
  // Fog bucket alpha multipliers (front, mid, back) — interpolate
  // between [1, 1, 1] (no fog) and [1, 0.55, 0.18] at fogAmount=1.
  const fogAlphas = depthFog
    ? [1, 1 - 0.45 * fogAmount, 1 - 0.82 * fogAmount]
    : [1]

  // Render every instance × trail × fog-bucket as its own <path>.
  const slots: { instance: number; trail: number; bucket: number }[] = []
  for (let i = 0; i < multiplier; i++) {
    for (let tr = 0; tr <= trailCount; tr++) {
      for (let b = 0; b < fogBuckets; b++) {
        slots.push({ instance: i, trail: tr, bucket: b })
      }
    }
  }

  return (
    <svg
      width={cw}
      height={ch}
      viewBox={`0 0 ${cw} ${ch}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {slots.map(({ instance, trail, bucket }, slotIdx) => {
        // Base opacity: per-instance fade × per-trail decay × fog.
        const instanceFade = multiplier > 1 ? 0.5 + 0.5 / multiplier : 1
        const trailFade = trail === 0 ? 1 : Math.pow(trailDecay, trail)
        const fogFade = fogAlphas[bucket] ?? 1
        const baseOpacity = instanceFade * trailFade * fogFade
        // Trail blur is applied as a CSS filter ONLY on trail copies
        // (trail > 0). Trail 0 is the live frame — keep it crisp.
        const trailBlurFilter =
          trail > 0 && trailBlurPx > 0 ? `blur(${trailBlurPx * trail}px)` : undefined
        return (
          <path
            key={slotIdx}
            ref={(el) => {
              pathRefs.current[slotIdx] = el
            }}
            stroke={fill}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dashStr}
            fill="none"
            opacity={baseOpacity}
            style={trailBlurFilter ? { filter: trailBlurFilter } : undefined}
          >
            {dashLen > 0 && !frozen && trail === 0 && bucket === 0 && (
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to={(dashLen * 2.2).toFixed(2)}
                dur={`${(2 + (multiplier - instance) * 0.3).toFixed(1)}s`}
                repeatCount="indefinite"
              />
            )}
          </path>
        )
      })}
    </svg>
  )
}
