import { useMemo } from 'react'
import { mulberry32 } from '../generator/rng'

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

export type EffectProps = {
  effectId: EffectId
  seed: number
  fill?: string  // preferred color when the effect has one
  cw: number
  ch: number
}

export function EffectSVG({ effectId, seed, fill, cw, ch }: EffectProps) {
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
