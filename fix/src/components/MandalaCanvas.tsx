import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

export type MandalaParams = {
  folds: number
  iters: number
  speed: number
  zoom: number
  scale: number
  colorMode: 'mono' | 'spectrum'
  colorFg: string
  colorBg: string
  animate: boolean
  strobeRate: number
  strobeDuty: number
  strobeColor: string
}

export const MANDALA_DEFAULTS: MandalaParams = {
  folds: 6,
  iters: 7,
  speed: 0.15,
  zoom: 2.0,
  scale: 1.8,
  colorMode: 'mono',
  colorFg: '#ffffff',
  colorBg: '#000000',
  animate: true,
  strobeRate: 0,
  strobeDuty: 0.15,
  strobeColor: '#ffffff',
}

export const MANDALA_PRESETS: { name: string; values: Partial<MandalaParams> }[] = [
  { name: 'PSYCHE', values: { folds: 6, iters: 7, zoom: 2, scale: 1.8, colorMode: 'spectrum', speed: 0.15 } },
  { name: 'SACRED', values: { folds: 6, iters: 8, zoom: 2.5, scale: 1.6, colorMode: 'mono', colorFg: '#ffd700', colorBg: '#0a0520' } },
  { name: 'FRACTAL', values: { folds: 8, iters: 10, zoom: 2, scale: 2.0, colorMode: 'spectrum', speed: 0.1 } },
  { name: 'MINIMAL', values: { folds: 4, iters: 4, zoom: 1.5, scale: 1.5, colorMode: 'mono', colorFg: '#ffffff', colorBg: '#000000' } },
  { name: 'DENSE', values: { folds: 12, iters: 9, zoom: 3, scale: 1.9, colorMode: 'spectrum', speed: 0.2 } },
  { name: 'HEX', values: { folds: 6, iters: 7, zoom: 2.5, scale: 1.7, colorMode: 'mono', colorFg: '#00e5ff', colorBg: '#000a14' } },
  { name: 'STAR', values: { folds: 8, iters: 6, zoom: 1.8, scale: 2.1, colorMode: 'mono', colorFg: '#ff1493', colorBg: '#000000' } },
  { name: 'DEEP', values: { folds: 6, iters: 12, zoom: 2, scale: 1.85, colorMode: 'spectrum', speed: 0.08 } },
]

const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`

// Q-900 shader: iterated coordinate folding
// Ported from swarm9 research findings
const FRAG = `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform float uFolds;
uniform float uIters;
uniform float uSpeed;
uniform float uZoom;
uniform float uScale;
uniform float uColorMode;
uniform vec3 uColorFg;
uniform vec3 uColorBg;
uniform vec2 uResolution;
uniform float uStrobeRate;
uniform float uStrobeDuty;
uniform vec3 uStrobeColor;

#define PI 3.14159265359
#define TAU 6.28318530718

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float kaleidoscope(vec2 uv, float time, float folds, float iters) {
  // Pre-fold into N-fold Dn dihedral symmetry
  float angle = atan(uv.y, uv.x);
  float sector = TAU / folds;
  angle = mod(angle, sector);
  // Mirror within sector (Dn, not just Cn)
  if (angle > sector * 0.5) angle = sector - angle;
  float r = length(uv);
  vec2 p = r * vec2(cos(angle), sin(angle));

  // Iterated coordinate folding — the core technique
  // abs → rotate → scale-translate per iteration
  // 4^N virtual folds: 7 iters = 16,384 folds
  float foldAngle = PI / folds + 0.1 * sin(time * 0.3);
  float sc = uScale + 0.3 * sin(time * 0.17);
  vec2 offset = vec2(1.0, 0.8 + 0.2 * sin(time * 0.23));

  float accum = 0.0;
  float weight = 1.0;

  for (int i = 0; i < 14; i++) {
    if (float(i) >= iters) break;

    // Fold to positive quadrant
    p = abs(p);

    // Rotate by fold angle (slight per-iteration drift)
    float a = foldAngle + float(i) * 0.05;
    p = rot(a) * p;

    // Scale and translate
    p = p * sc - offset;

    // 5 geometric primitives layered per iteration
    float d1 = abs(p.x);               // vertical lines
    float d2 = abs(p.y);               // horizontal lines
    float d3 = abs(p.x + p.y) * 0.707; // diagonal
    float d4 = abs(p.x - p.y) * 0.707; // other diagonal
    float d5 = abs(length(p) - 0.5);   // circles

    float d = min(min(d1, d2), min(min(d3, d4), d5));

    // fwidth AA (Breakthrough #3)
    float fw = fwidth(d);
    accum += weight * smoothstep(fw, 0.0, d);
    weight *= 0.65;
  }

  return accum;
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= uResolution.x / uResolution.y;

  float time = uTime * uSpeed;

  // Slow zoom pulse
  float zoom = uZoom + 0.3 * sin(time * 0.5);
  uv *= zoom;

  // Slow global rotation
  uv = rot(time * 0.2) * uv;

  // Run the kaleidoscope
  float pattern = kaleidoscope(uv, time, uFolds, uIters);

  // Color
  vec3 color;
  if (uColorMode < 0.5) {
    // Mono: user's two colors
    float mono = clamp(pattern, 0.0, 1.0);
    color = mix(uColorBg, uColorFg, mono);
  } else {
    // Spectrum: psychedelic rainbow
    float ang = atan(uv.y, uv.x);
    vec3 baseCol = 0.5 + 0.5 * cos(TAU * (vec3(0.0, 0.33, 0.67) + pattern * 0.3 + ang / TAU + time * 0.3));
    float mono = clamp(pattern, 0.0, 1.0);
    color = mix(vec3(0.0), baseCol, mono);
    // Contrast boost
    color = pow(color, vec3(1.2));
  }

  // Vignette
  float v = 1.0 - 0.3 * length(vUv - 0.5);
  color *= v;

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
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uFolds: { value: 6 },
        uIters: { value: 7 },
        uSpeed: { value: 0.15 },
        uZoom: { value: 2 },
        uScale: { value: 1.8 },
        uColorMode: { value: 0 },
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
  }, [])

  useFrame((state) => {
    const u = material.uniforms
    u.uTime.value = params.animate ? state.clock.elapsedTime : 0
    u.uFolds.value = Math.max(params.folds, 2)
    u.uIters.value = params.iters
    u.uSpeed.value = params.speed
    u.uZoom.value = params.zoom
    u.uScale.value = params.scale
    u.uColorMode.value = params.colorMode === 'spectrum' ? 1 : 0
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
