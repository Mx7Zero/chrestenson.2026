import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

export type MandalaPattern =
  | 'seedOfLife'
  | 'flowerOfLife'
  | 'metatron'
  | 'sriYantra'
  | 'goldenSpiral'
  | 'hexGrid'
  | 'concentricRings'

export type MandalaParams = {
  pattern: MandalaPattern
  folds: number
  speed: number
  zoom: number
  lineWidth: number
  glow: number
  tiles: number // 1 = single, 2+ = repeating grid
  layers: number // 1-3 composited layers
  pulse: number // breathing/pulse intensity
  colorFg: string
  colorBg: string
  animate: boolean
  strobeRate: number
  strobeDuty: number
  strobeColor: string
}

export const MANDALA_DEFAULTS: MandalaParams = {
  pattern: 'flowerOfLife',
  folds: 0,
  speed: 0.15,
  zoom: 2.5,
  lineWidth: 2,
  glow: 0.3,
  tiles: 1,
  layers: 1,
  pulse: 0,
  colorFg: '#ffffff',
  colorBg: '#000000',
  animate: true,
  strobeRate: 0,
  strobeDuty: 0.15,
  strobeColor: '#ffffff',
}

export const MANDALA_PATTERNS: { id: MandalaPattern; label: string }[] = [
  { id: 'seedOfLife', label: 'SEED' },
  { id: 'flowerOfLife', label: 'FLOWER' },
  { id: 'metatron', label: 'METATRON' },
  { id: 'sriYantra', label: 'SRI YANTRA' },
  { id: 'goldenSpiral', label: 'SPIRAL' },
  { id: 'hexGrid', label: 'HEX GRID' },
  { id: 'concentricRings', label: 'RINGS' },
]

export const MANDALA_PRESETS: { name: string; values: Partial<MandalaParams> }[] = [
  { name: 'CLASSIC', values: { pattern: 'flowerOfLife', folds: 0, zoom: 2.5, lineWidth: 2, glow: 0.3, colorFg: '#ffffff', colorBg: '#000000' } },
  { name: 'SACRED', values: { pattern: 'metatron', folds: 0, zoom: 2, lineWidth: 1.5, glow: 0.5, colorFg: '#ffd700', colorBg: '#0a0520' } },
  { name: 'YANTRA', values: { pattern: 'sriYantra', folds: 0, zoom: 2, lineWidth: 2, glow: 0.4, colorFg: '#ff6633', colorBg: '#1a0a00' } },
  { name: 'GOLDEN', values: { pattern: 'goldenSpiral', folds: 0, zoom: 1.5, lineWidth: 2, glow: 0.6, colorFg: '#ffd700', colorBg: '#000000' } },
  { name: 'HIVE', values: { pattern: 'hexGrid', folds: 0, zoom: 4, lineWidth: 1.5, glow: 0.2, colorFg: '#00e5ff', colorBg: '#000a14' } },
  { name: 'KALEIDO', values: { pattern: 'flowerOfLife', folds: 8, zoom: 3, lineWidth: 2, glow: 0.4, layers: 2, colorFg: '#ffffff', colorBg: '#000000', speed: 0.2 } },
  { name: 'PORTAL', values: { pattern: 'concentricRings', folds: 12, zoom: 5, lineWidth: 2.5, glow: 0.7, pulse: 0.5, colorFg: '#ff1493', colorBg: '#000000', speed: 0.3 } },
  { name: 'TEMPLE', values: { pattern: 'metatron', folds: 6, zoom: 2.5, lineWidth: 1.5, glow: 0.5, layers: 3, colorFg: '#ffffff', colorBg: '#0a0520', speed: 0.1 } },
  { name: 'TILE', values: { pattern: 'flowerOfLife', folds: 0, zoom: 2, tiles: 4, lineWidth: 1.5, glow: 0.2, colorFg: '#ffffff', colorBg: '#000000' } },
  { name: 'MATRIX', values: { pattern: 'hexGrid', folds: 0, zoom: 5, tiles: 1, layers: 2, lineWidth: 1.5, glow: 0.6, pulse: 0.3, colorFg: '#00ff41', colorBg: '#000000', speed: 0.1 } },
]

const PATTERN_MAP: Record<MandalaPattern, number> = {
  seedOfLife: 0,
  flowerOfLife: 1,
  metatron: 2,
  sriYantra: 3,
  goldenSpiral: 4,
  hexGrid: 5,
  concentricRings: 6,
}

const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`

const FRAG = `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform float uFolds;
uniform float uSpeed;
uniform float uZoom;
uniform float uLineWidth;
uniform float uGlow;
uniform float uPattern;
uniform vec3 uColorFg;
uniform vec3 uColorBg;
uniform vec2 uResolution;
uniform float uTiles;
uniform float uLayers;
uniform float uPulse;
uniform float uStrobeRate;
uniform float uStrobeDuty;
uniform vec3 uStrobeColor;

#define TAU 6.28318530718
#define PI  3.14159265359
#define SQRT3 1.7320508

// ============================================================
// SDF PRIMITIVES
// ============================================================

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float sdCircleEdge(vec2 p, vec2 center, float r) {
  return abs(length(p - center) - r);
}

float sdRegularPolygon(vec2 p, float r, float n) {
  float an = PI / n;
  float a = mod(atan(p.y, p.x) + an, 2.0 * an) - an;
  vec2 q = length(p) * vec2(cos(a), sin(a));
  return q.x - r * cos(an);
}

// ============================================================
// Dn DIHEDRAL SYMMETRY FOLD
// ============================================================

vec2 dnFold(vec2 p, float n) {
  if (n < 1.5) return p;
  float a = atan(p.y, p.x);
  float r = length(p);
  float seg = TAU / n;
  a = mod(a, seg);
  // Mirror: true Dn reflection
  if (a > seg * 0.5) a = seg - a;
  return vec2(cos(a), sin(a)) * r;
}

// ============================================================
// ANTI-ALIASED LINE RENDERING (fwidth-based)
// ============================================================

float renderLine(float d, float pixelWidth) {
  float fw = fwidth(d);
  float halfW = fw * pixelWidth * 0.5;
  float aa = fw * 0.5;
  return 1.0 - smoothstep(-aa, aa, abs(d) - halfW);
}

// ============================================================
// SACRED GEOMETRY PATTERNS
// ============================================================

// Seed of Life: 1 center + 6 circles
float sdSeedOfLife(vec2 p, float r) {
  float d = sdCircleEdge(p, vec2(0), r);
  for (int i = 0; i < 6; i++) {
    float a = float(i) * PI / 3.0;
    d = min(d, sdCircleEdge(p, r * vec2(cos(a), sin(a)), r));
  }
  return d;
}

// Flower of Life: 19 circles in hex packing
float sdFlowerOfLife(vec2 p, float r) {
  float d = sdCircleEdge(p, vec2(0), r);
  // Ring 1: 6 at distance r
  for (int i = 0; i < 6; i++) {
    float a = float(i) * PI / 3.0;
    d = min(d, sdCircleEdge(p, r * vec2(cos(a), sin(a)), r));
  }
  // Ring 2: 6 at distance 2r + 6 at r*sqrt(3)
  for (int i = 0; i < 6; i++) {
    float a = float(i) * PI / 3.0;
    d = min(d, sdCircleEdge(p, 2.0 * r * vec2(cos(a), sin(a)), r));
    float a2 = a + PI / 6.0;
    d = min(d, sdCircleEdge(p, r * SQRT3 * vec2(cos(a2), sin(a2)), r));
  }
  return d;
}

// Metatron's Cube: Fruit of Life (13 circles) + 78 connecting lines
float sdMetatronsCube(vec2 p, float r) {
  // 13 circle centers
  vec2 c0 = vec2(0);
  float d = sdCircleEdge(p, c0, r);

  vec2 c1[6];
  for (int i = 0; i < 6; i++) {
    float a = float(i) * PI / 3.0;
    c1[i] = 2.0 * r * vec2(cos(a), sin(a));
    d = min(d, sdCircleEdge(p, c1[i], r));
  }

  vec2 c2[6];
  for (int i = 0; i < 6; i++) {
    float a = float(i) * PI / 3.0 + PI / 6.0;
    c2[i] = 2.0 * r * SQRT3 * vec2(cos(a), sin(a));
    d = min(d, sdCircleEdge(p, c2[i], r));
  }

  // Connect center to all 12
  for (int i = 0; i < 6; i++) {
    d = min(d, sdSegment(p, c0, c1[i]));
    d = min(d, sdSegment(p, c0, c2[i]));
  }
  // Connect ring1 to ring1 neighbors
  for (int i = 0; i < 6; i++) {
    d = min(d, sdSegment(p, c1[i], c1[(i + 1) < 6 ? i + 1 : 0]));
  }
  // Connect ring1 to ring2
  for (int i = 0; i < 6; i++) {
    d = min(d, sdSegment(p, c1[i], c2[i]));
    d = min(d, sdSegment(p, c1[i], c2[i > 0 ? i - 1 : 5]));
  }
  // Connect ring2 to ring2 neighbors
  for (int i = 0; i < 6; i++) {
    d = min(d, sdSegment(p, c2[i], c2[(i + 1) < 6 ? i + 1 : 0]));
  }
  // Cross connections ring1-ring2 (the remaining diagonals)
  for (int i = 0; i < 6; i++) {
    int next = (i + 1) < 6 ? i + 1 : 0;
    d = min(d, sdSegment(p, c1[i], c2[next]));
    d = min(d, sdSegment(p, c2[i], c1[next]));
  }

  return d;
}

// Sri Yantra: 9 interlocking triangles + outer circle
float sdSriYantra(vec2 p, float r) {
  float d = sdCircleEdge(p, vec2(0), r);
  // Outer square (bhupura)
  d = min(d, abs(sdRegularPolygon(p, r * 1.05, 4.0)));

  // 4 upward triangles (Shiva) + 5 downward (Shakti)
  // Simplified vertex positions on concentric rings
  float h[9];
  h[0] = 0.92; h[1] = 0.65; h[2] = 0.38; h[3] = 0.12;
  h[4] = -0.92; h[5] = -0.62; h[6] = -0.32; h[7] = -0.05; h[8] = 0.22;

  // Upward triangles (apex up)
  for (int i = 0; i < 4; i++) {
    float ay = h[i] * r;
    float by = -h[4 + i] * r * 0.7;
    float bx = sqrt(max(r * r - by * by, 0.0)) * 0.9;
    d = min(d, sdSegment(p, vec2(0, ay), vec2(-bx, by)));
    d = min(d, sdSegment(p, vec2(0, ay), vec2(bx, by)));
    d = min(d, sdSegment(p, vec2(-bx, by), vec2(bx, by)));
  }
  // Downward triangles (apex down)
  for (int i = 0; i < 5; i++) {
    float ay = h[4 + i] * r;
    float by = -h[i < 4 ? i : 3] * r * 0.7;
    float bx = sqrt(max(r * r - by * by, 0.0)) * 0.85;
    d = min(d, sdSegment(p, vec2(0, ay), vec2(-bx, by)));
    d = min(d, sdSegment(p, vec2(0, ay), vec2(bx, by)));
    d = min(d, sdSegment(p, vec2(-bx, by), vec2(bx, by)));
  }

  return d;
}

// Golden Spiral (logarithmic, phi-based)
float sdGoldenSpiral(vec2 p, float scale) {
  float PHI = 1.6180339887;
  float k = log(PHI) / (PI * 0.5);
  float r = length(p);
  float theta = atan(p.y, p.x);
  float theta_s = log(max(r / scale, 0.001)) / k;
  float d = 1e9;
  for (int n = -6; n < 10; n++) {
    float t = theta_s + float(n) * TAU;
    float rs = scale * exp(k * t);
    vec2 sp = rs * vec2(cos(t), sin(t));
    d = min(d, length(p - sp));
  }
  // Add concentric quarter-circle arcs for the Fibonacci rectangles
  d = min(d, sdCircleEdge(p, vec2(0), scale));
  d = min(d, sdCircleEdge(p, vec2(0), scale * PHI));
  d = min(d, sdCircleEdge(p, vec2(0), scale * PHI * PHI));
  return d;
}

// Hexagonal Grid
float sdHexGrid(vec2 p, float scale) {
  vec2 H = vec2(1.0, SQRT3);
  vec2 h = H * 0.5;
  vec2 a = mod(p / scale, H) - h;
  vec2 b = mod(p / scale - h, H) - h;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  return (max(abs(g.x) * 1.5 + g.y * 0.866, abs(g.y)) - 0.5) * scale;
}

// Concentric Rings
float sdConcentricRings(vec2 p, float scale) {
  return abs(fract(length(p) / scale + 0.5) - 0.5) * scale;
}

// ============================================================
// PATTERN DISPATCH
// ============================================================

float getPattern(float id, vec2 p, float r) {
  if (id < 0.5) return sdSeedOfLife(p, r);
  if (id < 1.5) return sdFlowerOfLife(p, r);
  if (id < 2.5) return sdMetatronsCube(p, r);
  if (id < 3.5) return sdSriYantra(p, r);
  if (id < 4.5) return sdGoldenSpiral(p, r * 0.3);
  if (id < 5.5) return sdHexGrid(p, r * 0.5);
  return sdConcentricRings(p, r * 0.4);
}

// ============================================================
// MAIN
// ============================================================

// Compute one layer of the mandala at a given UV
float mandalaLayer(vec2 uv, float time, float layerOffset) {
  // Pulse: breathing scale
  float breathe = 1.0 + sin(time * 2.0 + layerOffset) * uPulse * 0.2;
  uv *= breathe;

  // Rotation
  float rot = time * uSpeed + layerOffset * 0.5;
  mat2 rm = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
  uv = rm * uv;

  // Dn symmetry fold (0 = no fold)
  uv = dnFold(uv, uFolds);

  return getPattern(uPattern, uv, 1.0);
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  float aspect = uResolution.x / uResolution.y;
  uv.x *= aspect;
  uv *= uZoom;

  float time = uTime;

  // Tiling: repeat the pattern across the screen
  vec2 cellUv = uv;
  if (uTiles > 1.5) {
    float tileSize = 2.0 / uTiles * uZoom;
    cellUv = (fract(uv / tileSize + 0.5) - 0.5) * tileSize;
  }

  // Layer compositing
  float totalLine = 0.0;
  float totalGlow = 0.0;
  float layerCount = clamp(uLayers, 1.0, 3.0);

  for (int i = 0; i < 3; i++) {
    if (float(i) >= layerCount) break;
    float offset = float(i) * 2.094; // ~TAU/3
    float scale = 1.0 + float(i) * 0.4;
    float d = mandalaLayer(cellUv * scale, time, offset);

    // Anti-aliased line
    float fw = fwidth(d);
    float aa = max(fw * 0.5, 0.001);
    float halfW = max(fw * uLineWidth * 0.5, aa);
    float line = 1.0 - smoothstep(halfW - aa, halfW + aa, abs(d));

    // Glow
    float glowVal = exp(-abs(d) * (40.0 / uZoom)) * uGlow;

    // Weight by layer (front = full, back = reduced)
    float weight = 1.0 - float(i) * 0.25;
    totalLine = max(totalLine, line * weight);
    totalGlow += glowVal * weight * 0.3;
  }

  // Composite
  vec3 color = uColorBg;
  color = mix(color, uColorFg, totalLine);
  color += uColorFg * totalGlow;

  // Strobe
  if (uStrobeRate > 0.01) {
    float sp = fract(uTime * uStrobeRate);
    float env = 1.0 - step(uStrobeDuty, sp);
    color = mix(color, uStrobeColor, env);
  }

  gl_FragColor = vec4(color, 1.0);
}
`

function MandalaQuad({ params }: { params: MandalaParams }) {
  const material = useMemo(
    () => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uFolds: { value: 0 },
          uSpeed: { value: 0.15 },
          uZoom: { value: 2.5 },
          uLineWidth: { value: 2 },
          uGlow: { value: 0.3 },
          uTiles: { value: 1 },
          uLayers: { value: 1 },
          uPulse: { value: 0 },
          uPattern: { value: 1 },
          uColorFg: { value: new THREE.Color('#ffffff') },
          uColorBg: { value: new THREE.Color('#000000') },
          uResolution: { value: new THREE.Vector2(1920, 1080) },
          uStrobeRate: { value: 0 },
          uStrobeDuty: { value: 0.15 },
          uStrobeColor: { value: new THREE.Color('#ffffff') },
        },
      })
      ;(mat as any).extensions = { derivatives: true }
      return mat
    },
    [],
  )

  useFrame((state) => {
    const u = material.uniforms
    u.uTime.value = params.animate ? state.clock.elapsedTime : 0
    u.uFolds.value = params.folds
    u.uSpeed.value = params.speed
    u.uZoom.value = params.zoom
    u.uLineWidth.value = params.lineWidth
    u.uGlow.value = params.glow
    u.uTiles.value = params.tiles
    u.uLayers.value = params.layers
    u.uPulse.value = params.pulse
    u.uPattern.value = PATTERN_MAP[params.pattern] ?? 1
    u.uColorFg.value.set(params.colorFg)
    u.uColorBg.value.set(params.colorBg)
    u.uResolution.value.set(state.size.width, state.size.height)
    u.uStrobeRate.value = params.strobeRate
    u.uStrobeDuty.value = params.strobeDuty
    u.uStrobeColor.value.set(params.strobeColor)
  })

  return (
    <mesh material={material} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}

export function MandalaCanvas({
  active,
  params,
}: {
  active: boolean
  params: MandalaParams
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <MandalaQuad params={params} />
    </Canvas>
  )
}
