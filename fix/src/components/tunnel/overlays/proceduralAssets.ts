import { mulberry32 } from '../generator/rng'

// ─── Procedural asset generators ──────────────────────────────────
// Each generator takes a seed and returns SVG path data designed to
// be VISUALLY WILD — multi-element compositions, asymmetric layouts,
// dramatic per-seed variation. Re-seeding should produce visibly
// different shapes within the same family, not just edge wobbles.
//
// All shapes use viewBox 0 0 100 100. Each generator can emit any
// number of subpaths (separated by spaces); the overlay renderer
// applies fill-rule: evenodd so overlapping subpaths punch holes
// where they meet. That's used intentionally for sacred/ringed forms.

export type ResolvedAsset = { viewBox: string; d: string }
export type ProcGenerator = (seed: number) => ResolvedAsset

// ─── helpers ──────────────────────────────────────────────────────

function polyD(points: [number, number][], close = true): string {
  const head = points
    .map((p, i) =>
      i === 0
        ? `M${p[0].toFixed(2)} ${p[1].toFixed(2)}`
        : `L${p[0].toFixed(2)} ${p[1].toFixed(2)}`,
    )
    .join(' ')
  return close ? head + ' Z' : head
}

function smoothClosedD(points: [number, number][]): string {
  const n = points.length
  if (n < 2) return ''
  const out: string[] = [`M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`]
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    out.push(
      `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`,
    )
  }
  out.push('Z')
  return out.join(' ')
}

function circleD(cx: number, cy: number, r: number): string {
  return `M${cx.toFixed(2)} ${(cy - r).toFixed(2)} a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 0.001 0 Z`
}

// ─── 1. Lissajous knot ────────────────────────────────────────────
// Coprime A/B parametric curve — knots get genuinely complex at
// higher ratios.
export const lissajous: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const ratios: [number, number][] = [
    [3, 4], [3, 5], [4, 5], [4, 7], [5, 6], [5, 7], [5, 8], [7, 9], [7, 11],
  ]
  const [A, B] = ratios[Math.floor(r() * ratios.length)]
  const phi = r() * Math.PI * 2
  const N = 380
  const pts: [number, number][] = []
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2
    const x = 50 + 42 * Math.sin(A * t + phi)
    const y = 50 + 42 * Math.sin(B * t)
    pts.push([x, y])
  }
  return { viewBox: '0 0 100 100', d: polyD(pts, false) }
}

// ─── 2. Liquid blob — now with feral wobble + 0–2 satellites ─────
export const liquidBlob: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const main = (() => {
    const N = 9 + Math.floor(r() * 9)
    const baseR = 28 + r() * 8
    const wobble = 0.85
    const cx = 50 + (r() - 0.5) * 16
    const cy = 50 + (r() - 0.5) * 16
    const pts: [number, number][] = []
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      const radius = baseR * (1 - wobble / 2 + r() * wobble)
      pts.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)])
    }
    return smoothClosedD(pts)
  })()
  // 0–3 satellite blobs.
  const satCount = Math.floor(r() * 4)
  const satellites: string[] = []
  for (let i = 0; i < satCount; i++) {
    const sx = 12 + r() * 76
    const sy = 12 + r() * 76
    const sR = 4 + r() * 10
    const N = 7 + Math.floor(r() * 6)
    const pts: [number, number][] = []
    for (let j = 0; j < N; j++) {
      const a = (j / N) * Math.PI * 2
      const radius = sR * (0.5 + r())
      pts.push([sx + radius * Math.cos(a), sy + radius * Math.sin(a)])
    }
    satellites.push(smoothClosedD(pts))
  }
  return { viewBox: '0 0 100 100', d: [main, ...satellites].join(' ') }
}

// ─── 3. Spike storm ───────────────────────────────────────────────
// Central disc with many radial triangular spikes of random lengths
// and angular widths. Asymmetric — some spikes are long, some short.
export const spikeStorm: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const N = 18 + Math.floor(r() * 22)
  const innerR = 10 + r() * 8
  const cx = 50, cy = 50
  // Build a single closed silhouette around the center: alternate
  // between inner-edge points and spike-tip points.
  const pts: [number, number][] = []
  for (let i = 0; i < N; i++) {
    const aBase = (i / N) * Math.PI * 2
    const aNext = ((i + 1) / N) * Math.PI * 2
    // Inner edge at this angle.
    pts.push([cx + innerR * Math.cos(aBase), cy + innerR * Math.sin(aBase)])
    // Spike tip — random length + slight angular jitter.
    const tipA = aBase + (aNext - aBase) * (0.3 + r() * 0.4)
    const tipR = innerR + 8 + r() * 28
    pts.push([cx + tipR * Math.cos(tipA), cy + tipR * Math.sin(tipA)])
  }
  return { viewBox: '0 0 100 100', d: polyD(pts) }
}

// ─── 4. Tentacle field ────────────────────────────────────────────
// 4–8 curving tentacles radiating from a central blob, each a quad-
// curve S-shape with tapered width.
export const tentacleField: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const N = 4 + Math.floor(r() * 5)
  const subs: string[] = []
  // Central body
  const bodyR = 10 + r() * 6
  subs.push(circleD(50, 50, bodyR))
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + r() * 0.6
    const length = 30 + r() * 18
    const wobble = (r() - 0.5) * 32
    const startA = a + 0.15
    const endA = a - 0.15
    const sx = 50 + bodyR * Math.cos(startA)
    const sy = 50 + bodyR * Math.sin(startA)
    const ex = 50 + bodyR * Math.cos(endA)
    const ey = 50 + bodyR * Math.sin(endA)
    const tipX = 50 + length * Math.cos(a) + wobble * Math.cos(a + Math.PI / 2) * 0.3
    const tipY = 50 + length * Math.sin(a) + wobble * Math.sin(a + Math.PI / 2) * 0.3
    const ctlX = 50 + length * 0.55 * Math.cos(a) + wobble * Math.cos(a + Math.PI / 2)
    const ctlY = 50 + length * 0.55 * Math.sin(a) + wobble * Math.sin(a + Math.PI / 2)
    // Tentacle shape: start_left → curve → tip → curve back → start_right → close.
    subs.push(
      `M${sx.toFixed(2)} ${sy.toFixed(2)} Q${ctlX.toFixed(2)} ${ctlY.toFixed(2)} ${tipX.toFixed(2)} ${tipY.toFixed(2)} Q${ctlX.toFixed(2)} ${ctlY.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)} Z`,
    )
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 5. Crystal cluster ───────────────────────────────────────────
// 6–14 elongated polygons radiating from center at random tilts and
// lengths. Pyrite-cluster vibe.
export const crystalCluster: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const N = 6 + Math.floor(r() * 9)
  const subs: string[] = []
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (r() - 0.5) * 0.5
    const length = 18 + r() * 28
    const halfW = 2.5 + r() * 4
    const cos = Math.cos(a), sin = Math.sin(a)
    // Diamond shape: base, two side points at midpoint, tip.
    const baseX = 50, baseY = 50
    const tipX = 50 + length * cos
    const tipY = 50 + length * sin
    const midX = 50 + length * 0.4 * cos
    const midY = 50 + length * 0.4 * sin
    const sideAx = midX - halfW * sin
    const sideAy = midY + halfW * cos
    const sideBx = midX + halfW * sin
    const sideBy = midY - halfW * cos
    subs.push(
      `M${baseX.toFixed(2)} ${baseY.toFixed(2)} L${sideAx.toFixed(2)} ${sideAy.toFixed(2)} L${tipX.toFixed(2)} ${tipY.toFixed(2)} L${sideBx.toFixed(2)} ${sideBy.toFixed(2)} Z`,
    )
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 6. Splatter ──────────────────────────────────────────────────
// Main blob + dozens of scattered dots and streaks.
export const splatter: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  // Main asymmetric blob
  const N = 10 + Math.floor(r() * 6)
  const mainCx = 40 + r() * 20
  const mainCy = 40 + r() * 20
  const mainPts: [number, number][] = []
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    const radius = 12 + r() * 14
    mainPts.push([mainCx + radius * Math.cos(a), mainCy + radius * Math.sin(a)])
  }
  const subs: string[] = [smoothClosedD(mainPts)]
  // Dots
  const dotCount = 14 + Math.floor(r() * 18)
  for (let i = 0; i < dotCount; i++) {
    const dx = 5 + r() * 90
    const dy = 5 + r() * 90
    const dr = 0.6 + r() * 3
    subs.push(circleD(dx, dy, dr))
  }
  // Streaks (thin elongated rects)
  const streakCount = 4 + Math.floor(r() * 6)
  for (let i = 0; i < streakCount; i++) {
    const sx = 8 + r() * 84
    const sy = 8 + r() * 84
    const len = 4 + r() * 16
    const ang = r() * Math.PI
    const cos = Math.cos(ang), sin = Math.sin(ang)
    const w = 0.7 + r() * 1.2
    // Thin rect rotated.
    const corners: [number, number][] = [
      [sx - len * cos - w * sin, sy - len * sin + w * cos],
      [sx + len * cos - w * sin, sy + len * sin + w * cos],
      [sx + len * cos + w * sin, sy + len * sin - w * cos],
      [sx - len * cos + w * sin, sy - len * sin - w * cos],
    ]
    subs.push(polyD(corners))
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 7. Shrapnel cloud ────────────────────────────────────────────
// Many small fragments scattered with random rotations + sizes. No
// central element — just an explosion's debris field.
export const shrapnelCloud: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const N = 25 + Math.floor(r() * 30)
  const subs: string[] = []
  for (let i = 0; i < N; i++) {
    const cx = 8 + r() * 84
    const cy = 8 + r() * 84
    const size = 1.5 + r() * 5
    const ang = r() * Math.PI * 2
    const cos = Math.cos(ang), sin = Math.sin(ang)
    const kind = Math.floor(r() * 3)
    if (kind === 0) {
      // Triangle
      const tri: [number, number][] = [[0, -size], [size * 0.866, size * 0.5], [-size * 0.866, size * 0.5]]
      const rotated = tri.map(
        ([x, y]) => [cx + x * cos - y * sin, cy + x * sin + y * cos] as [number, number],
      )
      subs.push(polyD(rotated))
    } else if (kind === 1) {
      // Rect
      const rect: [number, number][] = [[-size, -size * 0.4], [size, -size * 0.4], [size, size * 0.4], [-size, size * 0.4]]
      const rotated = rect.map(
        ([x, y]) => [cx + x * cos - y * sin, cy + x * sin + y * cos] as [number, number],
      )
      subs.push(polyD(rotated))
    } else {
      // Dot
      subs.push(circleD(cx, cy, size * 0.6))
    }
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 8. Recursive star ────────────────────────────────────────────
// 4–6 nested stars at decreasing scale, each rotated by a different
// random angle relative to its parent. Creates dense, fractal-like
// silhouettes that read very differently per seed.
export const recursiveStar: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const depth = 4 + Math.floor(r() * 3)
  const points = 5 + Math.floor(r() * 4) * 2 // 5/7/9/11
  const subs: string[] = []
  let scale = 1
  let totalRot = r() * Math.PI * 2
  for (let level = 0; level < depth; level++) {
    const outerR = 42 * scale
    const innerR = outerR * (0.32 + r() * 0.28)
    const pts: [number, number][] = []
    for (let i = 0; i < points * 2; i++) {
      const a = totalRot + (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
      const radius = i % 2 === 0 ? outerR : innerR
      pts.push([50 + radius * Math.cos(a), 50 + radius * Math.sin(a)])
    }
    subs.push(polyD(pts))
    scale *= 0.6 + r() * 0.18
    totalRot += (r() - 0.5) * 1.4
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 9. Thorn crown ───────────────────────────────────────────────
// Outer ring with random spike lengths poking outward AND inward.
export const thornCrown: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const N = 24 + Math.floor(r() * 28)
  const ringR = 30 + r() * 5
  const cx = 50, cy = 50
  const outerPts: [number, number][] = []
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    const aNext = ((i + 0.5) / N) * Math.PI * 2
    outerPts.push([cx + ringR * Math.cos(a), cy + ringR * Math.sin(a)])
    const spikeOut = ringR + 4 + r() * 14
    outerPts.push([cx + spikeOut * Math.cos(aNext), cy + spikeOut * Math.sin(aNext)])
  }
  const innerR = ringR - 6 - r() * 4
  const innerPts: [number, number][] = []
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    const aNext = ((i + 0.5) / N) * Math.PI * 2
    innerPts.push([cx + innerR * Math.cos(a), cy + innerR * Math.sin(a)])
    const spikeIn = innerR - 2 - r() * 6
    innerPts.push([cx + spikeIn * Math.cos(aNext), cy + spikeIn * Math.sin(aNext)])
  }
  return { viewBox: '0 0 100 100', d: `${polyD(outerPts)} ${polyD(innerPts.reverse())}` }
}

// ─── 10. Rune glyph ───────────────────────────────────────────────
// Vertical stack of mixed segments (line, arc, dot, V-fork) like
// alien script. Re-seed produces totally different glyphs.
export const runeGlyph: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const segCount = 3 + Math.floor(r() * 4)
  const yStart = 14
  const ySpan = 72
  const subs: string[] = []
  for (let i = 0; i < segCount; i++) {
    const y = yStart + (i + 0.5) * (ySpan / segCount)
    const w = 6 + r() * 30
    const cx = 50 + (r() - 0.5) * 14
    const kind = Math.floor(r() * 5)
    if (kind === 0) {
      // Horizontal bar
      const h = 1.5 + r() * 2
      subs.push(`M${(cx - w / 2).toFixed(2)} ${(y - h / 2).toFixed(2)} h${w.toFixed(2)} v${h.toFixed(2)} h-${w.toFixed(2)} Z`)
    } else if (kind === 1) {
      // Half-circle arc — fill via two paths (outer + inner).
      const aR = w / 2
      const thickness = 1.5 + r() * 2
      subs.push(
        `M${(cx - aR).toFixed(2)} ${y.toFixed(2)} a ${aR.toFixed(2)} ${aR.toFixed(2)} 0 0 1 ${(2 * aR).toFixed(2)} 0 L${(cx + aR - thickness).toFixed(2)} ${y.toFixed(2)} a ${(aR - thickness).toFixed(2)} ${(aR - thickness).toFixed(2)} 0 0 0 -${(2 * (aR - thickness)).toFixed(2)} 0 Z`,
      )
    } else if (kind === 2) {
      // V-fork
      const h = 4 + r() * 4
      subs.push(
        `M${(cx - w / 2).toFixed(2)} ${(y - h).toFixed(2)} L${cx.toFixed(2)} ${(y + h).toFixed(2)} L${(cx + w / 2).toFixed(2)} ${(y - h).toFixed(2)} L${(cx + w / 2 - 1).toFixed(2)} ${(y - h - 0.5).toFixed(2)} L${cx.toFixed(2)} ${(y + h - 1.5).toFixed(2)} L${(cx - w / 2 + 1).toFixed(2)} ${(y - h - 0.5).toFixed(2)} Z`,
      )
    } else if (kind === 3) {
      // Two stacked dots
      subs.push(circleD(cx - 4, y, 1.5 + r()))
      subs.push(circleD(cx + 4, y, 1.5 + r()))
    } else {
      // Diagonal slash + perpendicular tick
      const len = 6 + r() * 8
      subs.push(
        `M${(cx - len).toFixed(2)} ${(y + len * 0.3).toFixed(2)} L${(cx + len).toFixed(2)} ${(y - len * 0.3).toFixed(2)} L${(cx + len + 0.4).toFixed(2)} ${(y - len * 0.3 + 1).toFixed(2)} L${(cx - len + 0.4).toFixed(2)} ${(y + len * 0.3 + 1).toFixed(2)} Z`,
      )
    }
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 11. Spider web ───────────────────────────────────────────────
// Radial spokes + concentric arcs with broken/missing sections.
export const spiderWeb: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const spokes = 6 + Math.floor(r() * 5)
  const rings = 3 + Math.floor(r() * 3)
  const cx = 50, cy = 50
  const subs: string[] = []
  // Spokes — thin lines as narrow rects.
  const maxR = 42
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2 + r() * 0.05
    const cos = Math.cos(a), sin = Math.sin(a)
    const w = 0.5
    // Each spoke is a thin polygon from center outward.
    subs.push(
      `M${(cx - w * sin).toFixed(2)} ${(cy + w * cos).toFixed(2)} L${(cx + maxR * cos - w * sin).toFixed(2)} ${(cy + maxR * sin + w * cos).toFixed(2)} L${(cx + maxR * cos + w * sin).toFixed(2)} ${(cy + maxR * sin - w * cos).toFixed(2)} L${(cx + w * sin).toFixed(2)} ${(cy - w * cos).toFixed(2)} Z`,
    )
  }
  // Rings — arcs between adjacent spokes, with random gaps.
  for (let ring = 0; ring < rings; ring++) {
    const radius = 10 + (ring + 1) * (32 / rings) + r() * 4
    for (let i = 0; i < spokes; i++) {
      if (r() < 0.18) continue // skip arc — broken web
      const aStart = (i / spokes) * Math.PI * 2
      const aEnd = ((i + 1) / spokes) * Math.PI * 2
      const x1 = cx + radius * Math.cos(aStart)
      const y1 = cy + radius * Math.sin(aStart)
      const x2 = cx + radius * Math.cos(aEnd)
      const y2 = cy + radius * Math.sin(aEnd)
      // Thin curved line — outer arc + inner arc back.
      const t = 0.5
      subs.push(
        `M${x1.toFixed(2)} ${y1.toFixed(2)} A${radius.toFixed(2)} ${radius.toFixed(2)} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L${(x2 - t * Math.cos(aEnd)).toFixed(2)} ${(y2 - t * Math.sin(aEnd)).toFixed(2)} A${(radius - t).toFixed(2)} ${(radius - t).toFixed(2)} 0 0 0 ${(x1 - t * Math.cos(aStart)).toFixed(2)} ${(y1 - t * Math.sin(aStart)).toFixed(2)} Z`,
      )
    }
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 12. EQ ribs (wider variation) ────────────────────────────────
export const eqRibs: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const N = 9 + Math.floor(r() * 9)
  const margin = 4
  const slot = (100 - 2 * margin) / N
  const barW = slot * (0.45 + r() * 0.25)
  const minH = 8
  const maxH = 84
  const subs: string[] = []
  // Asymmetric — walk a bias so heights have a gradient pattern.
  for (let i = 0; i < N; i++) {
    const x = margin + i * slot + (slot - barW) / 2
    const h = minH + (r() ** 1.5) * (maxH - minH)
    const y = 92 - h
    subs.push(`M${x.toFixed(2)} ${y.toFixed(2)} h${barW.toFixed(2)} v${h.toFixed(2)} h-${barW.toFixed(2)} Z`)
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 13. Mandala rosette (asymmetric variant) ─────────────────────
export const mandalaRosette: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const folds = [6, 8, 10, 12, 14, 16, 20][Math.floor(r() * 7)]
  const innerR = 8 + r() * 12
  const subs: string[] = [circleD(50, 50, innerR)]
  // 1–3 petal rings at different radii, with possibly different
  // fold counts per ring.
  const ringCount = 1 + Math.floor(r() * 3)
  for (let ring = 0; ring < ringCount; ring++) {
    const ringFolds = ring === 0 ? folds : Math.max(4, Math.floor(folds * (0.5 + r() * 0.7)))
    const petalR = 14 + ring * 12 + r() * 4
    const ellipseRx = 3 + r() * 4
    const ellipseRy = 6 + r() * 8
    const phaseOffset = r() * Math.PI * 2
    for (let i = 0; i < ringFolds; i++) {
      const a = (i / ringFolds) * Math.PI * 2 + phaseOffset
      const cx = 50 + petalR * Math.cos(a)
      const cy = 50 + petalR * Math.sin(a)
      const cos = Math.cos(a + Math.PI / 2)
      const sin = Math.sin(a + Math.PI / 2)
      const M = 22
      const pts: [number, number][] = []
      for (let j = 0; j < M; j++) {
        const t = (j / M) * Math.PI * 2
        const lx = ellipseRx * Math.cos(t)
        const ly = ellipseRy * Math.sin(t)
        pts.push([cx + lx * cos - ly * sin, cy + lx * sin + ly * cos])
      }
      subs.push(polyD(pts))
    }
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 14. Scanline tear ────────────────────────────────────────────
export const scanlineTear: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const N = 14 + Math.floor(r() * 12)
  const subs: string[] = []
  for (let i = 0; i < N; i++) {
    const y = 4 + (i * 92) / N
    const h = 0.8 + r() * 4
    const xOffset = (r() - 0.5) * 40
    const w = 30 + r() * 60
    const x = 50 - w / 2 + xOffset
    subs.push(`M${x.toFixed(2)} ${y.toFixed(2)} h${w.toFixed(2)} v${h.toFixed(2)} h-${w.toFixed(2)} Z`)
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 15. Smoke ribbon ─────────────────────────────────────────────
export const smokeRibbon: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const M = 100
  const top: [number, number][] = []
  const bot: [number, number][] = []
  const segs = 3 + Math.floor(r() * 4)
  const phi = r() * Math.PI * 2
  for (let j = 0; j <= M; j++) {
    const t = j / M
    const x = 4 + t * 92
    const wob =
      Math.sin(t * Math.PI * segs + phi) * 18 +
      Math.sin(t * Math.PI * (segs * 1.7) + phi * 1.3) * 8
    const yCenter = 50 + wob
    const halfW = 3 + Math.sin(t * Math.PI) * 8 + r() * 2
    top.push([x, yCenter - halfW])
    bot.push([x, yCenter + halfW])
  }
  return { viewBox: '0 0 100 100', d: polyD([...top, ...bot.reverse()]) }
}

// ─── 16. Datamosh shards ──────────────────────────────────────────
export const datamoshShards: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const N = 12 + Math.floor(r() * 12)
  const subs: string[] = []
  for (let i = 0; i < N; i++) {
    const y = 4 + r() * 88
    const h = 1 + r() * 5
    const w = 4 + r() * 50
    const x = 4 + r() * (92 - w)
    subs.push(`M${x.toFixed(2)} ${y.toFixed(2)} h${w.toFixed(2)} v${h.toFixed(2)} h-${w.toFixed(2)} Z`)
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 17. Eclipse disc ─────────────────────────────────────────────
export const eclipseDisc: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const cx = 50 + (r() - 0.5) * 12
  const cy = 50 + (r() - 0.5) * 12
  const discR = 22 + r() * 10
  const haloR = discR + 3 + r() * 8
  const haloThick = 0.8 + r() * 2.5
  return {
    viewBox: '0 0 100 100',
    d: `${circleD(cx, cy, discR)} ${circleD(cx, cy, haloR)} ${circleD(cx, cy, haloR - haloThick)}`,
  }
}

// ─── 18. Orbital diagram ──────────────────────────────────────────
export const orbitalDiagram: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const orbitCount = 1 + Math.floor(r() * 3)
  const subs: string[] = []
  for (let o = 0; o < orbitCount; o++) {
    const rx = 18 + o * 8 + r() * 14
    const ry = 6 + o * 4 + r() * 12
    const tilt = (r() - 0.5) * Math.PI * 0.6
    const phase = r() * Math.PI * 2
    const planetR = 3 + r() * 3
    const cos = Math.cos(tilt), sin = Math.sin(tilt)
    const ox = 50 + (rx * Math.cos(phase) * cos - ry * Math.sin(phase) * sin)
    const oy = 50 + (rx * Math.cos(phase) * sin + ry * Math.sin(phase) * cos)
    const M = 80
    const orbitPts: [number, number][] = []
    for (let i = 0; i < M; i++) {
      const t = (i / M) * Math.PI * 2
      const lx = rx * Math.cos(t)
      const ly = ry * Math.sin(t)
      orbitPts.push([50 + lx * cos - ly * sin, 50 + lx * sin + ly * cos])
    }
    const innerPts = orbitPts.map(
      ([x, y]) => [50 + (x - 50) * 0.94, 50 + (y - 50) * 0.94] as [number, number],
    )
    subs.push(polyD(orbitPts), polyD(innerPts), circleD(ox, oy, planetR))
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 19. Waveform cage ────────────────────────────────────────────
export const waveformCage: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const N = 3 + Math.floor(r() * 5)
  const subs: string[] = []
  for (let i = 0; i < N; i++) {
    const yCenter = 14 + (i * 72) / Math.max(1, N - 1)
    const amp = 3 + r() * 12
    const freq = 1 + Math.floor(r() * 5)
    const phi = r() * Math.PI * 2
    const M = 110
    const top: [number, number][] = []
    const bot: [number, number][] = []
    const w = 0.6 + r() * 1.2
    for (let j = 0; j <= M; j++) {
      const x = (j / M) * 96 + 2
      const y = yCenter + amp * Math.sin((j / M) * Math.PI * 2 * freq + phi)
      top.push([x, y - w])
      bot.push([x, y + w])
    }
    subs.push(polyD([...top, ...bot.reverse()]))
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 20. Concentric rings ─────────────────────────────────────────
export const concentricRings: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const N = 3 + Math.floor(r() * 6)
  const subs: string[] = []
  let outer = 44
  for (let i = 0; i < N; i++) {
    const thickness = 1 + r() * 4
    subs.push(circleD(50, 50, outer))
    subs.push(circleD(50, 50, outer - thickness))
    outer -= thickness + 1.5 + r() * 5
    if (outer < 4) break
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// ─── 21. Gravity lens ─────────────────────────────────────────────
export const gravityLens: ProcGenerator = (seed) => {
  const r = mulberry32(seed >>> 0)
  const tilt = ((r() - 0.5) * 80 * Math.PI) / 180
  const cos = Math.cos(tilt), sin = Math.sin(tilt)
  const subs: string[] = []
  const bands = 2 + Math.floor(r() * 2)
  for (let i = 0; i < bands; i++) {
    const rx = 24 + i * 10 + r() * 6
    const ry = 6 + i * 4 + r() * 4
    const M = 80
    const pts: [number, number][] = []
    for (let j = 0; j < M; j++) {
      const t = (j / M) * Math.PI * 2
      const lx = rx * Math.cos(t)
      const ly = ry * Math.sin(t)
      pts.push([50 + lx * cos - ly * sin, 50 + lx * sin + ly * cos])
    }
    subs.push(polyD(pts))
    const innerPts = pts.map(
      ([x, y]) => [50 + (x - 50) * 0.92, 50 + (y - 50) * 0.92] as [number, number],
    )
    subs.push(polyD(innerPts))
  }
  return { viewBox: '0 0 100 100', d: subs.join(' ') }
}

// Lookup table — register every generator here. Keys map to the
// `id` field of the ASSETS entry.
export const PROC_GENERATORS: Record<string, ProcGenerator> = {
  'pg-lissajous': lissajous,
  'pg-liquid-blob': liquidBlob,
  'pg-spike-storm': spikeStorm,
  'pg-tentacle-field': tentacleField,
  'pg-crystal-cluster': crystalCluster,
  'pg-splatter': splatter,
  'pg-shrapnel': shrapnelCloud,
  'pg-recursive-star': recursiveStar,
  'pg-thorn-crown': thornCrown,
  'pg-rune-glyph': runeGlyph,
  'pg-spider-web': spiderWeb,
  'pg-eq-ribs': eqRibs,
  'pg-mandala-rosette': mandalaRosette,
  'pg-scanline-tear': scanlineTear,
  'pg-smoke-ribbon': smokeRibbon,
  'pg-datamosh': datamoshShards,
  'pg-eclipse-disc': eclipseDisc,
  'pg-orbital': orbitalDiagram,
  'pg-waveform-cage': waveformCage,
  'pg-concentric-rings': concentricRings,
  'pg-gravity-lens': gravityLens,
}
