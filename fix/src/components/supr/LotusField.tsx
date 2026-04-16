/**
 * LIVE BASELINE MODULE — LotusField
 *
 * Sacred geometry SDF module. Renders Flower of Life, Metatron's Cube,
 * Seed of Life, Sri Yantra, Hex Grid, Concentric Rings.
 *
 * This is the PROTECTED BASELINE. Per VISUAL_BUILD_PROTOCOL.md:
 * - May be restored, tuned, and rendered.
 * - May NOT be deleted, overwritten, or silently "improved."
 * - Any new system must be built beside it, not on top of it.
 * - Defaults: solo=true on load (the default visual in mandala mode).
 */

import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { LotusFieldParams } from './types'

const PATTERN_MAP: Record<string, number> = {
  seedOfLife: 0, flowerOfLife: 1, metatron: 2,
  sriYantra: 3, hexGrid: 4, concentricRings: 5,
}

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uFolds;
uniform float uZoom;
uniform float uLineWidth;
uniform float uGlow;
uniform float uPattern;
uniform float uOpacity;
uniform vec3 uColorFg;
uniform vec3 uColorBg;
uniform vec2 uResolution;

#define TAU 6.28318530718
#define PI  3.14159265359
#define SQRT3 1.7320508

// Dn fold
vec2 dnFold(vec2 p, float n) {
  if (n < 1.5) return p;
  float a = atan(p.y, p.x);
  float seg = TAU / n;
  a = mod(a, seg);
  if (a > seg * 0.5) a = seg - a;
  return vec2(cos(a), sin(a)) * length(p);
}

// SDF primitives
float sdCircleEdge(vec2 p, vec2 c, float r) { return abs(length(p - c) - r); }
float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Sacred geometry SDFs
float sdSeedOfLife(vec2 p, float r) {
  float d = sdCircleEdge(p, vec2(0), r);
  for (int i = 0; i < 6; i++) {
    float a = float(i) * PI / 3.0;
    d = min(d, sdCircleEdge(p, r * vec2(cos(a), sin(a)), r));
  }
  return d;
}

float sdFlowerOfLife(vec2 p, float r) {
  float d = sdCircleEdge(p, vec2(0), r);
  for (int i = 0; i < 6; i++) {
    float a = float(i) * PI / 3.0;
    d = min(d, sdCircleEdge(p, r * vec2(cos(a), sin(a)), r));
  }
  for (int i = 0; i < 6; i++) {
    float a = float(i) * PI / 3.0;
    d = min(d, sdCircleEdge(p, 2.0 * r * vec2(cos(a), sin(a)), r));
    float a2 = a + PI / 6.0;
    d = min(d, sdCircleEdge(p, r * SQRT3 * vec2(cos(a2), sin(a2)), r));
  }
  return d;
}

float sdMetatron(vec2 p, float r) {
  vec2 c0 = vec2(0);
  float d = sdCircleEdge(p, c0, r);
  vec2 c1[6]; vec2 c2[6];
  for (int i = 0; i < 6; i++) {
    float a = float(i) * PI / 3.0;
    c1[i] = 2.0 * r * vec2(cos(a), sin(a));
    d = min(d, sdCircleEdge(p, c1[i], r));
    float a2 = a + PI / 6.0;
    c2[i] = 2.0 * r * SQRT3 * vec2(cos(a2), sin(a2));
    d = min(d, sdCircleEdge(p, c2[i], r));
  }
  for (int i = 0; i < 6; i++) {
    d = min(d, sdSegment(p, c0, c1[i]));
    d = min(d, sdSegment(p, c0, c2[i]));
    d = min(d, sdSegment(p, c1[i], c1[(i+1) < 6 ? i+1 : 0]));
    d = min(d, sdSegment(p, c1[i], c2[i]));
    d = min(d, sdSegment(p, c1[i], c2[i > 0 ? i-1 : 5]));
    d = min(d, sdSegment(p, c2[i], c2[(i+1) < 6 ? i+1 : 0]));
  }
  return d;
}

float sdSriYantra(vec2 p, float r) {
  float d = sdCircleEdge(p, vec2(0), r);
  float h[9];
  h[0]=0.92; h[1]=0.65; h[2]=0.38; h[3]=0.12;
  h[4]=-0.92; h[5]=-0.62; h[6]=-0.32; h[7]=-0.05; h[8]=0.22;
  for (int i = 0; i < 4; i++) {
    float ay = h[i] * r;
    float by = -h[4+i] * r * 0.7;
    float bx = sqrt(max(r*r - by*by, 0.0)) * 0.9;
    d = min(d, sdSegment(p, vec2(0, ay), vec2(-bx, by)));
    d = min(d, sdSegment(p, vec2(0, ay), vec2(bx, by)));
    d = min(d, sdSegment(p, vec2(-bx, by), vec2(bx, by)));
  }
  for (int i = 0; i < 5; i++) {
    float ay = h[4+i] * r;
    float by = -h[i < 4 ? i : 3] * r * 0.7;
    float bx = sqrt(max(r*r - by*by, 0.0)) * 0.85;
    d = min(d, sdSegment(p, vec2(0, ay), vec2(-bx, by)));
    d = min(d, sdSegment(p, vec2(0, ay), vec2(bx, by)));
    d = min(d, sdSegment(p, vec2(-bx, by), vec2(bx, by)));
  }
  return d;
}

float sdHexGrid(vec2 p, float scale) {
  vec2 H = vec2(1.0, SQRT3);
  vec2 h = H * 0.5;
  vec2 a = mod(p / scale, H) - h;
  vec2 b = mod(p / scale - h, H) - h;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  return (max(abs(g.x)*1.5 + g.y*0.866, abs(g.y)) - 0.5) * scale;
}

float sdConcentricRings(vec2 p, float scale) {
  return abs(fract(length(p) / scale + 0.5) - 0.5) * scale;
}

float getPattern(float id, vec2 p, float r) {
  if (id < 0.5) return sdSeedOfLife(p, r);
  if (id < 1.5) return sdFlowerOfLife(p, r);
  if (id < 2.5) return sdMetatron(p, r);
  if (id < 3.5) return sdSriYantra(p, r);
  if (id < 4.5) return sdHexGrid(p, r * 0.5);
  return sdConcentricRings(p, r * 0.4);
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= uResolution.x / uResolution.y;
  uv *= uZoom;

  float rot = uTime * 0.2;
  mat2 rm = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
  uv = rm * uv;

  uv = dnFold(uv, uFolds);

  float d = getPattern(uPattern, uv, 1.0);

  float fw = clamp(fwidth(d), 0.0005, 0.08);
  float halfW = max(fw * uLineWidth * 0.5, fw * 0.5);
  float line = 1.0 - smoothstep(halfW - fw*0.5, halfW + fw*0.5, abs(d));

  float glowVal = exp(-abs(d) * (40.0 / uZoom)) * uGlow;

  vec3 color = vec3(0.0);
  color += uColorFg * line;
  color += uColorFg * glowVal * 0.6;

  float alpha = (line + glowVal * 0.4) * uOpacity;
  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
`

export function LotusField({ params }: { params: LotusFieldParams }) {
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uFolds: { value: 0 },
        uZoom: { value: 2.5 },
        uLineWidth: { value: 2 },
        uGlow: { value: 0.3 },
        uPattern: { value: 1 },
        uOpacity: { value: 1 },
        uColorFg: { value: new THREE.Color('#ffffff') },
        uColorBg: { value: new THREE.Color('#000000') },
        uResolution: { value: new THREE.Vector2(1920, 1080) },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    ;(mat as any).extensions = { derivatives: true }
    return mat
  }, [])

  useFrame((state) => {
    if (!params.enabled) return
    const u = material.uniforms
    u.uTime.value = state.clock.elapsedTime * params.speed
    u.uFolds.value = params.folds
    u.uZoom.value = params.zoom
    u.uLineWidth.value = params.lineWidth
    u.uGlow.value = params.glow
    u.uPattern.value = PATTERN_MAP[params.pattern] ?? 1
    u.uOpacity.value = params.opacity
    u.uColorFg.value.set(params.colorFg)
    u.uColorBg.value.set(params.colorBg)
    u.uResolution.value.set(state.size.width, state.size.height)
  })

  if (!params.enabled) return null

  return (
    <mesh material={material} renderOrder={Math.round(params.zDepth * -1)} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
