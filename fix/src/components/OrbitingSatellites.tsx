import { useMemo, useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Dotted micro-line orbits with small 3D satellite models traveling
 * along the innermost orbit.
 *
 * Orbit radii are packed tight just outside the ConcreteSphere's
 * displaced surface (max ~1.8 local units given displacementScale 0.5 +
 * displacementBias 0.3).
 *
 * To add a new satellite model:
 *   1. Drop the .glb into `public/models/`
 *   2. Add an entry to MODEL_PATHS below
 *   3. Reference it by key in any SatelliteConfig.model field
 */

type ModelKey =
  | 'jwst'
  | 'jwst2'
  | 'satmodul'
  | 'nearsat'
  | 'satellite'
  | 'pwsat2'
  | 'satellite1'
  | 'lowpoly'
  | 'meteorm2'

const MODEL_PATHS: Record<ModelKey, string> = {
  jwst: '/models/jwst.glb',
  jwst2: '/models/jwst2.glb',
  satmodul: '/models/satmodul.glb',
  nearsat: '/models/nearsat.glb',
  satellite: '/models/satellite.glb',
  pwsat2: '/models/pwsat2.glb',
  satellite1: '/models/satellite1.glb',
  lowpoly: '/models/lowpoly.glb',
  meteorm2: '/models/meteorm2.glb',
  // drop more here as models arrive
}

// Shared material — every satellite mesh gets overridden to pure black so
// the model's native gold/silver colors don't show through.
const BLACK_MATERIAL = new THREE.MeshBasicMaterial({
  color: '#000000',
  toneMapped: false,
})

// Preload every model so they're warm before the first frame
Object.values(MODEL_PATHS).forEach((p) => useGLTF.preload(p))

type SatelliteConfig = {
  initialAngle: number
  angularVelocity: number
  scale: number
  model: ModelKey
}

type OrbitConfig = {
  radius: number
  tilt: [number, number, number]
  dashSpeed: number
  satellites: SatelliteConfig[]
}

const ORBIT_COLOR = '#000000'

// 2 jwst satellites on the innermost ring, 180° apart
const INNER_SATELLITES: SatelliteConfig[] = [
  {
    initialAngle: 0,
    angularVelocity: 0.32,
    scale: 0.0013,
    model: 'jwst',
  },
  {
    initialAngle: Math.PI,
    angularVelocity: 0.332,
    scale: 0.0013,
    model: 'jwst',
  },
]

// 2 satmodul satellites on the polar ring, 180° apart
const RING1_SATELLITES: SatelliteConfig[] = [
  {
    initialAngle: 0,
    angularVelocity: 0.302,
    scale: 0.008,
    model: 'satmodul',
  },
  {
    initialAngle: Math.PI,
    angularVelocity: 0.314,
    scale: 0.008,
    model: 'satmodul',
  },
]

// 2 jwst2 satellites on ring 3, 180° apart
const RING2_SATELLITES: SatelliteConfig[] = [
  {
    initialAngle: 0,
    angularVelocity: 0.338,
    scale: 0.001,
    model: 'jwst2',
  },
  {
    initialAngle: Math.PI,
    angularVelocity: 0.325,
    scale: 0.001,
    model: 'jwst2',
  },
]

// Ring 4 — 2× satellite, 180° apart
const RING3_SATELLITES: SatelliteConfig[] = [
  {
    initialAngle: 0,
    angularVelocity: 0.295,
    scale: 0.008,
    model: 'satellite',
  },
  {
    initialAngle: Math.PI,
    angularVelocity: 0.308,
    scale: 0.008,
    model: 'satellite',
  },
]

// Ring 6 — 2× pwsat2, 180° apart
const RING5_SATELLITES: SatelliteConfig[] = [
  {
    initialAngle: 0,
    angularVelocity: 0.292,
    scale: 0.00045,
    model: 'pwsat2',
  },
  {
    initialAngle: Math.PI,
    angularVelocity: 0.304,
    scale: 0.00045,
    model: 'pwsat2',
  },
]

// Ring 7 — 2× satellite1, 180° apart
const RING6_SATELLITES: SatelliteConfig[] = [
  {
    initialAngle: 0,
    angularVelocity: 0.342,
    scale: 0.005,
    model: 'satellite1',
  },
  {
    initialAngle: Math.PI,
    angularVelocity: 0.33,
    scale: 0.005,
    model: 'satellite1',
  },
]

// Ring 8 — 2× lowpoly, 180° apart
const RING7_SATELLITES: SatelliteConfig[] = [
  {
    initialAngle: 0,
    angularVelocity: 0.317,
    scale: 0.00067,
    model: 'lowpoly',
  },
  {
    initialAngle: Math.PI,
    angularVelocity: 0.305,
    scale: 0.00067,
    model: 'lowpoly',
  },
]

// Ring 9 — 2× meteorm2, 180° apart
const RING8_SATELLITES: SatelliteConfig[] = [
  {
    initialAngle: 0,
    angularVelocity: 0.326,
    scale: 0.0025,
    model: 'meteorm2',
  },
  {
    initialAngle: Math.PI,
    angularVelocity: 0.313,
    scale: 0.0025,
    model: 'meteorm2',
  },
]

// === Doubled set: 9 new pairs on the additional rings ===
// Each pair uses offset starting angles and slightly different velocities
// from its twin pair in the first 10 rings so the two batches don't mirror.

const RING10_SATELLITES: SatelliteConfig[] = [
  { initialAngle: Math.PI / 3, angularVelocity: 0.304, scale: 0.0013, model: 'jwst' },
  { initialAngle: (4 * Math.PI) / 3, angularVelocity: 0.316, scale: 0.0013, model: 'jwst' },
]

const RING11_SATELLITES: SatelliteConfig[] = [
  { initialAngle: Math.PI / 4, angularVelocity: 0.337, scale: 0.008, model: 'satmodul' },
  { initialAngle: (5 * Math.PI) / 4, angularVelocity: 0.321, scale: 0.008, model: 'satmodul' },
]

const RING12_SATELLITES: SatelliteConfig[] = [
  { initialAngle: Math.PI / 6, angularVelocity: 0.308, scale: 0.001, model: 'jwst2' },
  { initialAngle: (7 * Math.PI) / 6, angularVelocity: 0.291, scale: 0.001, model: 'jwst2' },
]

const RING13_SATELLITES: SatelliteConfig[] = [
  { initialAngle: (2 * Math.PI) / 5, angularVelocity: 0.343, scale: 0.008, model: 'satellite' },
  { initialAngle: (7 * Math.PI) / 5, angularVelocity: 0.328, scale: 0.008, model: 'satellite' },
]

const RING14_SATELLITES: SatelliteConfig[] = [
  { initialAngle: Math.PI / 5, angularVelocity: 0.299, scale: 0.0047, model: 'nearsat' },
  { initialAngle: (6 * Math.PI) / 5, angularVelocity: 0.312, scale: 0.0047, model: 'nearsat' },
]

const RING15_SATELLITES: SatelliteConfig[] = [
  { initialAngle: (3 * Math.PI) / 8, angularVelocity: 0.335, scale: 0.00045, model: 'pwsat2' },
  { initialAngle: (11 * Math.PI) / 8, angularVelocity: 0.323, scale: 0.00045, model: 'pwsat2' },
]

const RING16_SATELLITES: SatelliteConfig[] = [
  { initialAngle: Math.PI / 8, angularVelocity: 0.316, scale: 0.005, model: 'satellite1' },
  { initialAngle: (9 * Math.PI) / 8, angularVelocity: 0.3, scale: 0.005, model: 'satellite1' },
]

const RING17_SATELLITES: SatelliteConfig[] = [
  { initialAngle: (3 * Math.PI) / 7, angularVelocity: 0.344, scale: 0.00067, model: 'lowpoly' },
  { initialAngle: (10 * Math.PI) / 7, angularVelocity: 0.331, scale: 0.00067, model: 'lowpoly' },
]

const RING18_SATELLITES: SatelliteConfig[] = [
  { initialAngle: (2 * Math.PI) / 7, angularVelocity: 0.298, scale: 0.0025, model: 'meteorm2' },
  { initialAngle: (9 * Math.PI) / 7, angularVelocity: 0.31, scale: 0.0025, model: 'meteorm2' },
]

// === Front-coverage set: 10 more pairs with truly oblique tilts ===
// For each tilt, the initial angle is mathematically computed so that the
// satellite lands on the +Z (camera-facing) hemisphere at t=0, regardless
// of how the ring is oriented. Pair partner goes to +π (opposite side).

// Wide tilt range — X and Y values span roughly ±75° so the ring planes
// are visibly different from each other, not just mild variations.
const FRONT_TILTS: Array<[number, number, number]> = [
  [0.2, 0.1, 0.3],
  [1.3, 0.5, 0.2],
  [-1.2, 0.3, 0.1],
  [0.4, 1.2, 0.1],
  [0.3, -1.3, 0.2],
  [1.1, 1.0, -0.2],
  [-0.9, -1.1, 0.3],
  [1.4, -0.5, 0.2],
  [-1.0, 0.8, -0.3],
  [0.6, -0.9, 0.4],
  // Second batch — moderate magnitudes (0.4–0.9) for guaranteed ring visibility
  [0.5, 0.4, 0.1],
  [-0.6, 0.5, 0.2],
  [0.4, -0.7, 0.0],
  [-0.7, -0.4, 0.3],
  [0.8, 0.2, -0.2],
  [-0.3, 0.9, 0.4],
  [0.7, -0.5, -0.1],
  [-0.5, -0.8, 0.2],
  [0.6, 0.7, -0.3],
  [-0.8, 0.3, -0.2],
  // Third batch — wide horizontal (Y) variation, spanning ±1.5 rad
  [0.2, 0.4, 0.1],
  [0.3, 0.9, 0.2],
  [0.1, 1.3, -0.1],
  [0.4, 1.5, 0.0],
  [0.2, -0.5, 0.1],
  [0.3, -1.0, 0.2],
  [0.1, -1.4, -0.1],
  [0.4, -1.5, 0.0],
  [-0.2, 1.1, 0.3],
  [-0.3, -1.2, -0.2],
]

/**
 * Given a ring tilt (Euler), return the local angle θ whose rotated
 * position (cos θ, sin θ, 0) maximizes the world +Z component.
 */
function angleForFrontZ(tilt: [number, number, number]): number {
  const euler = new THREE.Euler(tilt[0], tilt[1], tilt[2])
  const m = new THREE.Matrix4().makeRotationFromEuler(euler)
  // Three.js Matrix4.elements is column-major; row 2 (world Z output)
  // elements are elements[2], elements[6], elements[10], elements[14].
  // For v = (cos θ, sin θ, 0, 1): v.z_out = elements[2]*cos θ + elements[6]*sin θ
  // Maximum at θ = atan2(elements[6], elements[2])
  return Math.atan2(m.elements[6], m.elements[2])
}

const FRONT_ANGLES = FRONT_TILTS.map(angleForFrontZ)

const FRONT_MODELS: Array<{ model: ModelKey; scale: number; velocity: number }> = [
  { model: 'jwst', scale: 0.0013, velocity: 0.321 },
  { model: 'satmodul', scale: 0.008, velocity: 0.306 },
  { model: 'jwst2', scale: 0.001, velocity: 0.333 },
  { model: 'satellite', scale: 0.008, velocity: 0.34 },
  { model: 'nearsat', scale: 0.0047, velocity: 0.303 },
  { model: 'pwsat2', scale: 0.00045, velocity: 0.297 },
  { model: 'satellite1', scale: 0.005, velocity: 0.336 },
  { model: 'lowpoly', scale: 0.00067, velocity: 0.346 },
  { model: 'meteorm2', scale: 0.0025, velocity: 0.301 },
  { model: 'jwst', scale: 0.0013, velocity: 0.328 },
  // Second batch
  { model: 'satmodul', scale: 0.008, velocity: 0.313 },
  { model: 'jwst2', scale: 0.001, velocity: 0.341 },
  { model: 'satellite', scale: 0.008, velocity: 0.296 },
  { model: 'nearsat', scale: 0.0047, velocity: 0.343 },
  { model: 'pwsat2', scale: 0.00045, velocity: 0.305 },
  { model: 'satellite1', scale: 0.005, velocity: 0.326 },
  { model: 'lowpoly', scale: 0.00067, velocity: 0.299 },
  { model: 'meteorm2', scale: 0.0025, velocity: 0.338 },
  { model: 'jwst', scale: 0.0013, velocity: 0.307 },
  { model: 'satmodul', scale: 0.008, velocity: 0.329 },
  // Third batch
  { model: 'jwst2', scale: 0.001, velocity: 0.31 },
  { model: 'satellite', scale: 0.008, velocity: 0.322 },
  { model: 'nearsat', scale: 0.0047, velocity: 0.337 },
  { model: 'pwsat2', scale: 0.00045, velocity: 0.304 },
  { model: 'satellite1', scale: 0.005, velocity: 0.344 },
  { model: 'lowpoly', scale: 0.00067, velocity: 0.315 },
  { model: 'meteorm2', scale: 0.0025, velocity: 0.331 },
  { model: 'jwst', scale: 0.0013, velocity: 0.298 },
  { model: 'satmodul', scale: 0.008, velocity: 0.323 },
  { model: 'jwst2', scale: 0.001, velocity: 0.339 },
]

// 4 satellites per ring at θ, θ+π/2, θ+π, θ+3π/2 — spaced 90° around the
// ring so 1–2 are always visible from any camera angle. All 4 share the
// same velocity so the pattern holds as they orbit (no drifting).
const FRONT_SATELLITES: SatelliteConfig[][] = FRONT_TILTS.map((_, i) => {
  const base = FRONT_ANGLES[i]
  const { model, scale, velocity } = FRONT_MODELS[i]
  return [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((offset) => ({
    initialAngle: base + offset,
    angularVelocity: velocity,
    scale,
    model,
  }))
})

// 2 nearsat satellites on ring 5, 180° apart
const RING4_SATELLITES: SatelliteConfig[] = [
  {
    initialAngle: 0,
    angularVelocity: 0.348,
    scale: 0.0047,
    model: 'nearsat',
  },
  {
    initialAngle: Math.PI,
    angularVelocity: 0.335,
    scale: 0.0047,
    model: 'nearsat',
  },
]

// Each ring has a unique rotation on all 3 axes so no two rings share a
// common rotation axis — their intersection points are spread across the
// sphere instead of all converging at the same pair of poles.
const ORBITS: OrbitConfig[] = [
  {
    radius: 1.86,
    tilt: [0.35, 0.12, 0.08],
    dashSpeed: 0.18,
    satellites: INNER_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [1.1, 0.25, -0.35],
    dashSpeed: -0.14,
    satellites: RING1_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [-0.4, 0.95, 0.45],
    dashSpeed: 0.22,
    satellites: RING2_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [0.55, -0.4, 0.65],
    dashSpeed: -0.2,
    satellites: RING3_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [-0.25, 0.5, -0.4],
    dashSpeed: 0.16,
    satellites: RING4_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [0.75, 0.6, 0.2],
    dashSpeed: -0.24,
    satellites: RING5_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [-0.55, -0.3, 0.4],
    dashSpeed: 0.2,
    satellites: RING6_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [0.3, 0.45, -0.55],
    dashSpeed: -0.18,
    satellites: RING7_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [-0.4, -0.55, 0.2],
    dashSpeed: 0.22,
    satellites: RING8_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [0.2, -0.35, 0.5],
    dashSpeed: -0.2,
    satellites: [],
  },
  // 10 additional rings — the "doubled set"
  // Each has a unique oblique tilt (non-zero on all 3 axes) so they
  // don't share rotation axes with the first 10.
  {
    radius: 1.86,
    tilt: [0.6, 0.8, -0.2],
    dashSpeed: 0.19,
    satellites: RING10_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [-0.7, 0.3, 0.55],
    dashSpeed: -0.16,
    satellites: RING11_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [0.45, -0.65, -0.3],
    dashSpeed: 0.23,
    satellites: RING12_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [-0.2, -0.8, 0.45],
    dashSpeed: -0.21,
    satellites: RING13_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [0.85, -0.15, 0.35],
    dashSpeed: 0.17,
    satellites: RING14_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [-0.35, 0.25, -0.7],
    dashSpeed: -0.19,
    satellites: RING15_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [0.65, 0.35, -0.45],
    dashSpeed: 0.25,
    satellites: RING16_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [-0.8, 0.5, 0.1],
    dashSpeed: -0.22,
    satellites: RING17_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [0.15, -0.5, 0.75],
    dashSpeed: 0.2,
    satellites: RING18_SATELLITES,
  },
  {
    radius: 1.86,
    tilt: [-0.45, -0.2, -0.55],
    dashSpeed: -0.18,
    satellites: [],
  },
  // === Front-coverage set: 10 oblique rings, initial angles computed per ring ===
  {
    radius: 1.86,
    tilt: FRONT_TILTS[0],
    dashSpeed: 0.21,
    satellites: FRONT_SATELLITES[0],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[1],
    dashSpeed: -0.17,
    satellites: FRONT_SATELLITES[1],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[2],
    dashSpeed: 0.24,
    satellites: FRONT_SATELLITES[2],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[3],
    dashSpeed: -0.19,
    satellites: FRONT_SATELLITES[3],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[4],
    dashSpeed: 0.18,
    satellites: FRONT_SATELLITES[4],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[5],
    dashSpeed: -0.23,
    satellites: FRONT_SATELLITES[5],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[6],
    dashSpeed: 0.2,
    satellites: FRONT_SATELLITES[6],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[7],
    dashSpeed: -0.22,
    satellites: FRONT_SATELLITES[7],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[8],
    dashSpeed: 0.16,
    satellites: FRONT_SATELLITES[8],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[9],
    dashSpeed: -0.2,
    satellites: FRONT_SATELLITES[9],
  },
  // Second front-coverage batch — 10 more moderate-tilt rings
  {
    radius: 1.86,
    tilt: FRONT_TILTS[10],
    dashSpeed: 0.22,
    satellites: FRONT_SATELLITES[10],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[11],
    dashSpeed: -0.18,
    satellites: FRONT_SATELLITES[11],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[12],
    dashSpeed: 0.25,
    satellites: FRONT_SATELLITES[12],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[13],
    dashSpeed: -0.21,
    satellites: FRONT_SATELLITES[13],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[14],
    dashSpeed: 0.17,
    satellites: FRONT_SATELLITES[14],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[15],
    dashSpeed: -0.24,
    satellites: FRONT_SATELLITES[15],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[16],
    dashSpeed: 0.19,
    satellites: FRONT_SATELLITES[16],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[17],
    dashSpeed: -0.23,
    satellites: FRONT_SATELLITES[17],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[18],
    dashSpeed: 0.2,
    satellites: FRONT_SATELLITES[18],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[19],
    dashSpeed: -0.16,
    satellites: FRONT_SATELLITES[19],
  },
  // Third front-coverage batch — 10 more with wide horizontal variation
  {
    radius: 1.86,
    tilt: FRONT_TILTS[20],
    dashSpeed: 0.23,
    satellites: FRONT_SATELLITES[20],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[21],
    dashSpeed: -0.2,
    satellites: FRONT_SATELLITES[21],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[22],
    dashSpeed: 0.26,
    satellites: FRONT_SATELLITES[22],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[23],
    dashSpeed: -0.17,
    satellites: FRONT_SATELLITES[23],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[24],
    dashSpeed: 0.19,
    satellites: FRONT_SATELLITES[24],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[25],
    dashSpeed: -0.22,
    satellites: FRONT_SATELLITES[25],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[26],
    dashSpeed: 0.24,
    satellites: FRONT_SATELLITES[26],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[27],
    dashSpeed: -0.18,
    satellites: FRONT_SATELLITES[27],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[28],
    dashSpeed: 0.21,
    satellites: FRONT_SATELLITES[28],
  },
  {
    radius: 1.86,
    tilt: FRONT_TILTS[29],
    dashSpeed: -0.25,
    satellites: FRONT_SATELLITES[29],
  },
]

function generateCirclePoints(
  radius: number,
  segments = 512
): [number, number, number][] {
  const points: [number, number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    points.push([Math.cos(a) * radius, Math.sin(a) * radius, 0])
  }
  return points
}

/**
 * Single orbit line — its own ref so we can animate dashOffset each frame.
 */
function OrbitLine({ orbit }: { orbit: OrbitConfig }) {
  const lineRef = useRef<any>(null)
  const points = useMemo(
    () => generateCirclePoints(orbit.radius, 512),
    [orbit.radius]
  )

  useFrame((_, delta) => {
    const line = lineRef.current
    if (line && line.material && 'dashOffset' in line.material) {
      line.material.dashOffset -= delta * orbit.dashSpeed
    }
  })

  return (
    <Line
      ref={lineRef}
      points={points}
      color={ORBIT_COLOR}
      lineWidth={1}
      dashed
      dashSize={0.008}
      gapSize={0.022}
    />
  )
}

/**
 * Renders a cloned instance of a glTF model. Cloning is required so
 * multiple satellites can share one source scene but transform independently.
 */
function SatelliteModel({ modelKey, scale }: { modelKey: ModelKey; scale: number }) {
  const { scene } = useGLTF(MODEL_PATHS[modelKey]) as any
  const centered = useMemo(() => {
    const clone = scene.clone(true)
    // Override every mesh with pure black
    clone.traverse((obj: THREE.Object3D) => {
      const mesh = obj as THREE.Mesh
      if ((mesh as any).isMesh) {
        mesh.material = BLACK_MATERIAL
      }
    })
    // Recenter the model to its bounding box center so odd pivots in
    // Sketchfab exports don't leave the geometry offset from where we
    // place the satellite.
    const wrapper = new THREE.Group()
    wrapper.add(clone)
    const box = new THREE.Box3().setFromObject(clone)
    const center = box.getCenter(new THREE.Vector3())
    clone.position.sub(center)
    return wrapper
  }, [scene])
  return <primitive object={centered} scale={scale} />
}

export function OrbitingSatellites() {
  const satRefs = useRef<Record<string, THREE.Object3D | null>>({})

  useFrame((state) => {
    const t = state.clock.elapsedTime
    ORBITS.forEach((orbit, orbitIdx) => {
      orbit.satellites.forEach((sat, satIdx) => {
        const key = `${orbitIdx}-${satIdx}`
        const obj = satRefs.current[key]
        if (!obj) return
        const angle = sat.initialAngle + sat.angularVelocity * t
        obj.position.set(
          Math.cos(angle) * orbit.radius,
          Math.sin(angle) * orbit.radius,
          0
        )
      })
    })
  })

  return (
    <group>
      {ORBITS.map((orbit, orbitIdx) => (
        <group key={`orbit-${orbitIdx}`} rotation={orbit.tilt}>
          <OrbitLine orbit={orbit} />
          <Suspense fallback={null}>
            {orbit.satellites.map((sat, satIdx) => (
              <group
                key={`sat-${orbitIdx}-${satIdx}`}
                ref={(el) => {
                  satRefs.current[`${orbitIdx}-${satIdx}`] = el
                }}
              >
                <SatelliteModel modelKey={sat.model} scale={sat.scale} />
              </group>
            ))}
          </Suspense>
        </group>
      ))}
    </group>
  )
}
