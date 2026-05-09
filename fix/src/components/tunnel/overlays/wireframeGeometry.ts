// ─── Wireframe geometry data ──────────────────────────────────────
// Each entry is { vertices: [x,y,z][], edges: [a,b][] }, where a/b
// are vertex indices. Coordinates use a unit-ish scale around the
// origin; the renderer applies its own scale before projection.

export type Geometry = {
  vertices: [number, number, number][]
  edges: [number, number][]
}

// ─── Cube ─────────────────────────────────────────────────────────
export const cube: Geometry = {
  vertices: [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ],
  edges: [
    [0, 1], [1, 2], [2, 3], [3, 0], // back
    [4, 5], [5, 6], [6, 7], [7, 4], // front
    [0, 4], [1, 5], [2, 6], [3, 7], // sides
  ],
}

// ─── Pyramid (square base + apex) ─────────────────────────────────
export const pyramid: Geometry = {
  vertices: [
    [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], // base
    [0, 1.4, 0],                                          // apex
  ],
  edges: [
    [0, 1], [1, 2], [2, 3], [3, 0], // base
    [0, 4], [1, 4], [2, 4], [3, 4], // sides to apex
  ],
}

// ─── Icosahedron ──────────────────────────────────────────────────
// 12 vertices, 30 edges. Computed via golden ratio.
export const icosahedron: Geometry = (() => {
  const phi = (1 + Math.sqrt(5)) / 2
  const t = phi
  const vertices: [number, number, number][] = [
    [0, 1, t], [0, -1, t], [0, 1, -t], [0, -1, -t],
    [1, t, 0], [-1, t, 0], [1, -t, 0], [-1, -t, 0],
    [t, 0, 1], [t, 0, -1], [-t, 0, 1], [-t, 0, -1],
  ]
  const edges: [number, number][] = [
    [0, 1], [0, 4], [0, 5], [0, 8], [0, 10],
    [1, 6], [1, 7], [1, 8], [1, 10],
    [2, 3], [2, 4], [2, 5], [2, 9], [2, 11],
    [3, 6], [3, 7], [3, 9], [3, 11],
    [4, 5], [4, 8], [4, 9],
    [5, 10], [5, 11],
    [6, 7], [6, 8], [6, 9],
    [7, 10], [7, 11],
    [8, 9], [10, 11],
  ]
  // Normalize so radius ~1.
  const scale = 1 / Math.sqrt(1 + t * t)
  return {
    vertices: vertices.map(([x, y, z]) => [x * scale, y * scale, z * scale] as [number, number, number]),
    edges,
  }
})()

// ─── Wireframe sphere (latitude/longitude grid) ───────────────────
export function sphereWireframe(latRings = 8, lonLines = 12): Geometry {
  const vertices: [number, number, number][] = []
  const edges: [number, number][] = []
  // Generate vertices: ring 0 = north pole, ring latRings-1 = south.
  for (let i = 0; i < latRings; i++) {
    const lat = (i / (latRings - 1)) * Math.PI - Math.PI / 2 // -π/2 .. +π/2
    const y = Math.sin(lat)
    const r = Math.cos(lat)
    for (let j = 0; j < lonLines; j++) {
      const lon = (j / lonLines) * Math.PI * 2
      vertices.push([r * Math.cos(lon), y, r * Math.sin(lon)])
    }
  }
  // Latitude rings (excl. poles)
  for (let i = 1; i < latRings - 1; i++) {
    for (let j = 0; j < lonLines; j++) {
      const a = i * lonLines + j
      const b = i * lonLines + ((j + 1) % lonLines)
      edges.push([a, b])
    }
  }
  // Longitude meridians
  for (let j = 0; j < lonLines; j++) {
    for (let i = 0; i < latRings - 1; i++) {
      const a = i * lonLines + j
      const b = (i + 1) * lonLines + j
      edges.push([a, b])
    }
  }
  return { vertices, edges }
}

// ─── Helix (single or double strand) ──────────────────────────────
export function helix(turns = 3, segments = 60, radius = 0.6, height = 2): Geometry {
  const vertices: [number, number, number][] = []
  const edges: [number, number][] = []
  // Two strands offset by π for DNA-style double helix.
  for (let s = 0; s < 2; s++) {
    const startIdx = vertices.length
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = turns * Math.PI * 2 * t + s * Math.PI
      const y = -height / 2 + height * t
      vertices.push([radius * Math.cos(angle), y, radius * Math.sin(angle)])
    }
    for (let i = 0; i < segments; i++) {
      edges.push([startIdx + i, startIdx + i + 1])
    }
  }
  // Rungs every 6 segments connecting the two strands.
  const strandLen = segments + 1
  for (let i = 0; i <= segments; i += 6) {
    edges.push([i, strandLen + i])
  }
  return { vertices, edges }
}

// ─── Portal / receding tunnel rings ───────────────────────────────
export function portalTunnel(rings = 12, segments = 16): Geometry {
  const vertices: [number, number, number][] = []
  const edges: [number, number][] = []
  for (let i = 0; i < rings; i++) {
    const t = i / (rings - 1)
    const z = -2 + 4 * t // recede into +z
    const r = 1 - t * 0.7 // tighter as it goes back
    for (let j = 0; j < segments; j++) {
      const a = (j / segments) * Math.PI * 2
      vertices.push([r * Math.cos(a), r * Math.sin(a), z])
    }
    // Ring loop edges.
    const base = i * segments
    for (let j = 0; j < segments; j++) {
      edges.push([base + j, base + ((j + 1) % segments)])
    }
    // Connect to previous ring with axial spokes (every 4 segments).
    if (i > 0) {
      const prevBase = (i - 1) * segments
      for (let j = 0; j < segments; j += 4) {
        edges.push([prevBase + j, base + j])
      }
    }
  }
  return { vertices, edges }
}

// ─── Torus ────────────────────────────────────────────────────────
export function torus(majorR = 0.8, minorR = 0.3, majorSeg = 18, minorSeg = 10): Geometry {
  const vertices: [number, number, number][] = []
  const edges: [number, number][] = []
  for (let i = 0; i < majorSeg; i++) {
    const u = (i / majorSeg) * Math.PI * 2
    for (let j = 0; j < minorSeg; j++) {
      const v = (j / minorSeg) * Math.PI * 2
      const x = (majorR + minorR * Math.cos(v)) * Math.cos(u)
      const y = minorR * Math.sin(v)
      const z = (majorR + minorR * Math.cos(v)) * Math.sin(u)
      vertices.push([x, y, z])
    }
  }
  // Major ring loops + minor ring loops.
  for (let i = 0; i < majorSeg; i++) {
    for (let j = 0; j < minorSeg; j++) {
      const a = i * minorSeg + j
      const b = i * minorSeg + ((j + 1) % minorSeg)
      const c = ((i + 1) % majorSeg) * minorSeg + j
      edges.push([a, b])
      edges.push([a, c])
    }
  }
  return { vertices, edges }
}
