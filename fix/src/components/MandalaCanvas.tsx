import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

// --- Mandala's own param system (NOT shared with tunnel) ---

export type MandalaPattern =
  | 'flowerOfLife'
  | 'seedOfLife'
  | 'metatron'
  | 'hexGrid'
  | 'triGrid'
  | 'concentricCircles'
  | 'starBurst'

export type MandalaParams = {
  pattern: MandalaPattern
  folds: number
  speed: number
  zoom: number
  lineWidth: number
  colorFg: string
  colorBg: string
  animate: boolean
  strobeRate: number
  strobeDuty: number
  strobeColor: string
}

export const MANDALA_DEFAULTS: MandalaParams = {
  pattern: 'flowerOfLife',
  folds: 8,
  speed: 0.3,
  zoom: 3,
  lineWidth: 0.03,
  colorFg: '#ffffff',
  colorBg: '#000000',
  animate: true,
  strobeRate: 0,
  strobeDuty: 0.15,
  strobeColor: '#ffffff',
}

export const MANDALA_PATTERNS: { id: MandalaPattern; label: string }[] = [
  { id: 'flowerOfLife', label: 'FLOWER' },
  { id: 'seedOfLife', label: 'SEED' },
  { id: 'metatron', label: 'METATRON' },
  { id: 'hexGrid', label: 'HEX' },
  { id: 'triGrid', label: 'TRI' },
  { id: 'concentricCircles', label: 'CIRCLES' },
  { id: 'starBurst', label: 'STAR' },
]

export const MANDALA_PRESETS: { name: string; values: Partial<MandalaParams> }[] = [
  { name: 'CLASSIC', values: { pattern: 'flowerOfLife', folds: 6, zoom: 3, lineWidth: 0.025, colorFg: '#ffffff', colorBg: '#000000' } },
  { name: 'SACRED', values: { pattern: 'metatron', folds: 12, zoom: 2.5, lineWidth: 0.02, colorFg: '#ffd700', colorBg: '#1a0a2e' } },
  { name: 'BLOOM', values: { pattern: 'seedOfLife', folds: 6, zoom: 4, lineWidth: 0.04, colorFg: '#ffffff', colorBg: '#0a1f2f' } },
  { name: 'HIVE', values: { pattern: 'hexGrid', folds: 6, zoom: 5, lineWidth: 0.02, colorFg: '#00e5ff', colorBg: '#000000' } },
  { name: 'PRISM', values: { pattern: 'triGrid', folds: 8, zoom: 4, lineWidth: 0.03, colorFg: '#ff1493', colorBg: '#050505' } },
  { name: 'PULSE', values: { pattern: 'concentricCircles', folds: 12, zoom: 6, lineWidth: 0.035, colorFg: '#ffffff', colorBg: '#000000', speed: 0.6 } },
  { name: 'NOVA', values: { pattern: 'starBurst', folds: 16, zoom: 3, lineWidth: 0.02, colorFg: '#ffd700', colorBg: '#000000' } },
]

const PATTERN_MAP: Record<MandalaPattern, number> = {
  flowerOfLife: 0,
  seedOfLife: 1,
  metatron: 2,
  hexGrid: 3,
  triGrid: 4,
  concentricCircles: 5,
  starBurst: 6,
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
uniform float uPattern;
uniform vec3 uColorFg;
uniform vec3 uColorBg;
uniform float uStrobeRate;
uniform float uStrobeDuty;
uniform vec3 uStrobeColor;

#define TAU 6.28318530718
#define PI  3.14159265359
#define SQRT3 1.7320508

// --- Kaleidoscope mirror fold ---
vec2 kfold(vec2 p, float n) {
  float a = atan(p.y, p.x);
  float seg = TAU / n;
  a = mod(a, seg);
  a = abs(a - seg * 0.5);
  return vec2(cos(a), sin(a)) * length(p);
}

// --- SDF primitives ---
float sdCircle(vec2 p, float r) {
  return abs(length(p) - r);
}

float sdLine(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// --- Sacred geometry patterns (return distance to nearest edge) ---

// Flower of Life: circles centered on hex grid vertices
float flowerOfLife(vec2 p, float scale) {
  float d = 1e10;
  float r = scale;
  // Center circle
  d = min(d, sdCircle(p, r));
  // 6 surrounding circles
  for (int i = 0; i < 6; i++) {
    float a = float(i) * TAU / 6.0;
    vec2 c = vec2(cos(a), sin(a)) * r;
    d = min(d, sdCircle(p - c, r));
  }
  // Second ring: 6 more at 2r distance
  for (int i = 0; i < 6; i++) {
    float a = float(i) * TAU / 6.0;
    vec2 c = vec2(cos(a), sin(a)) * r * 2.0;
    d = min(d, sdCircle(p - c, r));
  }
  // Fill between with offset ring
  for (int i = 0; i < 6; i++) {
    float a = (float(i) + 0.5) * TAU / 6.0;
    vec2 c = vec2(cos(a), sin(a)) * r * SQRT3;
    d = min(d, sdCircle(p - c, r));
  }
  return d;
}

// Seed of Life: 7 overlapping circles
float seedOfLife(vec2 p, float scale) {
  float d = 1e10;
  float r = scale;
  d = min(d, sdCircle(p, r));
  for (int i = 0; i < 6; i++) {
    float a = float(i) * TAU / 6.0;
    vec2 c = vec2(cos(a), sin(a)) * r;
    d = min(d, sdCircle(p - c, r));
  }
  return d;
}

// Metatron's Cube: seed of life + connecting lines
float metatronsCube(vec2 p, float scale) {
  float d = seedOfLife(p, scale);
  // Connect all 7 centers with lines
  vec2 centers[7];
  centers[0] = vec2(0.0);
  for (int i = 0; i < 6; i++) {
    float a = float(i) * TAU / 6.0;
    centers[i + 1] = vec2(cos(a), sin(a)) * scale;
  }
  for (int i = 0; i < 7; i++) {
    for (int j = i + 1; j < 7; j++) {
      d = min(d, sdLine(p, centers[i], centers[j]));
    }
  }
  return d;
}

// Hexagonal grid
float hexGrid(vec2 p, float scale) {
  vec2 r = vec2(1.0, SQRT3);
  vec2 h = r * 0.5;
  vec2 a = mod(p / scale, r) - h;
  vec2 b = mod(p / scale - h, r) - h;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  return abs(max(abs(g.x) * 1.5 + g.y * 0.866, abs(g.y)) - 0.5) * scale;
}

// Triangular grid
float triGrid(vec2 p, float scale) {
  vec2 q = p / scale;
  vec2 r = vec2(1.0, SQRT3);
  vec2 h = r * 0.5;
  vec2 a = mod(q, r) - h;
  // Triangle distance via folding
  a.y += 0.25;
  if (a.x + a.y * SQRT3 > 0.0) a = vec2(a.x - 0.5, a.y - 0.5 / SQRT3);
  a.x -= clamp(a.x, -1.0, 0.0);
  return length(a) * scale;
}

// Concentric circles
float concentricCircles(vec2 p, float scale) {
  float r = length(p);
  return abs(fract(r / scale) - 0.5) * scale;
}

// Star burst: radial lines
float starBurst(vec2 p, float scale) {
  float a = atan(p.y, p.x);
  float n = 12.0;
  return abs(sin(a * n)) * length(p) * 0.3;
}

float getPattern(float id, vec2 p, float scale) {
  if (id < 0.5) return flowerOfLife(p, scale);
  if (id < 1.5) return seedOfLife(p, scale);
  if (id < 2.5) return metatronsCube(p, scale);
  if (id < 3.5) return hexGrid(p, scale);
  if (id < 4.5) return triGrid(p, scale);
  if (id < 5.5) return concentricCircles(p, scale);
  return starBurst(p, scale);
}

void main() {
  // Center and aspect-correct
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= 1.7778;
  uv *= uZoom;

  // Slow rotation
  float rot = uTime * uSpeed * 0.3;
  mat2 rm = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
  uv = rm * uv;

  // Kaleidoscope fold
  vec2 p = kfold(uv, uFolds);

  // Get distance to pattern edges
  float d = getPattern(uPattern, p, 1.0);

  // Sharp edge rendering
  float edge = 1.0 - step(uLineWidth, d);

  // Two-color output
  vec3 color = mix(uColorBg, uColorFg, edge);

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
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uFolds: { value: 8 },
          uSpeed: { value: 0.3 },
          uZoom: { value: 3 },
          uLineWidth: { value: 0.03 },
          uPattern: { value: 0 },
          uColorFg: { value: new THREE.Color('#ffffff') },
          uColorBg: { value: new THREE.Color('#000000') },
          uStrobeRate: { value: 0 },
          uStrobeDuty: { value: 0.15 },
          uStrobeColor: { value: new THREE.Color('#ffffff') },
        },
      }),
    [],
  )

  useFrame((state) => {
    const u = material.uniforms
    u.uTime.value = params.animate ? state.clock.elapsedTime : 0
    u.uFolds.value = Math.max(params.folds, 2)
    u.uSpeed.value = params.speed
    u.uZoom.value = params.zoom
    u.uLineWidth.value = params.lineWidth
    u.uPattern.value = PATTERN_MAP[params.pattern] ?? 0
    u.uColorFg.value.set(params.colorFg)
    u.uColorBg.value.set(params.colorBg)
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
