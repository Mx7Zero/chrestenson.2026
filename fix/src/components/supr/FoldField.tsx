/**
 * FoldField — Q-900 iterated coordinate folding module
 * Based on swarm9 research + Codex breakthrough improvements.
 * This is a preserved operator — never merge into another module.
 */

import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { FoldFieldParams } from './types'

// Clip-space quad — bypasses camera projection so the shader gets
// clean normalized UVs without perspective distortion.
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
uniform float uIters;
uniform float uScale;
uniform float uZoom;
uniform float uOpacity;
uniform float uFoldType;     // 0=abs, 1=inversion, 2=hybrid
uniform float uFillMode;     // 0=edge, 1=fill, 2=gradient, 3=stripe
uniform float uColorStrategy; // 0=mono, 1=spectrum, 2=depth, 3=angular, 4=distance
uniform float uLineWidthDecay;
uniform float uDrift;
uniform float uFillWeight;
uniform vec3 uColorFg;
uniform vec3 uColorBg;
uniform vec2 uResolution;

#define PI 3.14159265359
#define TAU 6.28318530718
#define PHI 1.61803398875

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

vec3 screenBlend(vec3 base, vec3 layer) {
  return 1.0 - (1.0 - clamp(base, 0.0, 1.0)) * (1.0 - clamp(layer, 0.0, 1.0));
}

vec2 kaleidoscopeLayer(vec2 uv, float time, float folds, float iters, float baseScale) {
  float angle = atan(uv.y, uv.x);
  float sector = TAU / folds;
  angle = mod(angle, sector);
  if (angle > sector * 0.5) angle = sector - angle;
  float r = length(uv);
  vec2 p = r * vec2(cos(angle), sin(angle));

  float foldAngle = PI / folds + 0.1 * sin(time * 0.3);
  float sc = baseScale + 0.22 * sin(time * 0.17);
  vec2 offset = vec2(1.0, 0.8 + 0.2 * sin(time * 0.23));

  float lineMask = 0.0;
  float glowMask = 0.0;
  float weight = 1.0;

  float lw = 1.0; // per-iteration line width (decays per Q-1002)

  for (int i = 0; i < 14; i++) {
    if (float(i) >= iters) break;

    // FOLD OPERATION (switchable per Q-1006)
    if (uFoldType < 0.5) {
      p = abs(p); // standard abs fold
    } else if (uFoldType < 1.5) {
      // Inversion fold: p = p / dot(p,p) — Apollonian/Mandelbox character
      float dp = dot(p, p);
      if (dp > 0.0001) p = p / dp;
    } else {
      // Hybrid: abs on even iterations, inversion on odd
      if (mod(float(i), 2.0) < 0.5) p = abs(p);
      else { float dp = dot(p,p); if (dp > 0.0001) p = p / dp; }
    }

    float a = foldAngle + float(i) * uDrift;
    p = rot(a) * p;
    p = p * sc - offset;

    float d1 = abs(p.x);
    float d2 = abs(p.y);
    float d3 = abs(p.x + p.y) * 0.707;
    float d4 = abs(p.x - p.y) * 0.707;
    float d5 = abs(length(p) - 0.5);
    float d = min(min(d1, d2), min(min(d3, d4), d5));

    // FILL MODE (per Q-1001)
    float fw = clamp(fwidth(d), 0.0005, 0.08);
    float edge = smoothstep(fw * 1.35 * lw, 0.0, d);
    float fill = smoothstep(0.3, 0.0, d); // filled interior
    float grad = exp(-d * 8.0); // gradient falloff
    float stripe = step(0.5, fract(d * 20.0)); // stripe pattern

    float shape;
    if (uFillMode < 0.5) shape = edge;
    else if (uFillMode < 1.5) shape = fill;
    else if (uFillMode < 2.5) shape = grad;
    else shape = edge * (1.0 - stripe * 0.5);

    // Blend edge and fill by fillWeight
    shape = mix(shape, mix(edge, fill, uFillWeight), step(0.01, uFillWeight));

    float line = weight * shape;
    float glow = exp(-abs(d) * (18.0 + weight * 10.0)) * weight * 0.18;

    lineMask = max(lineMask, line);
    glowMask += glow;
    weight *= 0.67;
    lw *= uLineWidthDecay; // thin lines per iteration (Q-1002)
  }

  return vec2(clamp(lineMask, 0.0, 1.0), clamp(glowMask, 0.0, 1.0));
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= uResolution.x / uResolution.y;

  float time = uTime;
  float zoom = uZoom + 0.3 * sin(time * 0.5);
  uv *= zoom;
  uv = rot(time * 0.2) * uv;

  // Phi-spaced layers with incommensurate speeds
  vec3 lineComposite = vec3(0.0);
  vec3 glowComposite = vec3(0.0);

  for (int i = 0; i < 3; i++) {
    float layerIndex = float(i);
    float layerScale = pow(PHI, layerIndex);
    float speedScale = i == 0 ? 1.0 : (i == 1 ? PHI : 1.0 / PHI);
    float localTime = time * speedScale + layerIndex * 1.618;
    vec2 layerUv = uv * layerScale;
    vec2 layer = kaleidoscopeLayer(layerUv, localTime, max(uFolds, 3.0), max(uIters, 1.0), uScale);

    vec3 tint;
    if (uColorStrategy < 0.5) {
      // MONO
      tint = uColorFg;
    } else if (uColorStrategy < 1.5) {
      // SPECTRUM (IQ cosine palette by angle)
      float ang = atan(layerUv.y, layerUv.x);
      tint = 0.5 + 0.5 * cos(TAU * (vec3(0.0, 0.33, 0.67) + layerIndex * 0.1459 + ang / TAU + localTime * 0.22));
      tint = mix(uColorFg, tint, 0.78);
    } else if (uColorStrategy < 2.5) {
      // DEPTH — palette indexed by iteration depth (shell→kernel gradient)
      tint = 0.5 + 0.5 * cos(TAU * (vec3(0.0, 0.33, 0.67) + layer.x * 0.5 + layerIndex * 0.2));
      tint = mix(uColorFg, tint, 0.7);
    } else if (uColorStrategy < 3.5) {
      // ANGULAR — hue from polar angle (rainbow rose window)
      float ang = atan(layerUv.y, layerUv.x) / TAU + 0.5;
      tint = 0.5 + 0.5 * cos(TAU * (vec3(0.0, 0.33, 0.67) + ang));
      tint = mix(uColorFg, tint, 0.85);
    } else {
      // DISTANCE — color mapped to fold-space distance (neon halo)
      float r = length(layerUv) * 0.3;
      tint = 0.5 + 0.5 * cos(TAU * (vec3(0.0, 0.15, 0.45) + r + localTime * 0.1));
      tint = mix(uColorFg, tint, 0.8);
    }

    float opacity = pow(1.0 - layerIndex * 0.22, 0.7);
    lineComposite = mix(lineComposite, tint, layer.x * opacity);
    glowComposite = screenBlend(glowComposite, tint * layer.y * 0.55 * opacity);
  }

  vec3 color = screenBlend(lineComposite, glowComposite);
  if (uColorStrategy > 0.5) color = pow(color, vec3(1.08));

  float v = 1.0 - 0.28 * length(vUv - 0.5);
  color *= v;

  float alpha = clamp(length(color) * 1.5, 0.0, 1.0) * uOpacity;
  gl_FragColor = vec4(color, alpha);
}
`

export function FoldField({ params }: { params: FoldFieldParams }) {
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uFolds: { value: 6 },
        uIters: { value: 8 },
        uScale: { value: 1.82 },
        uZoom: { value: 2.15 },
        uOpacity: { value: 1 },
        uFoldType: { value: 0 },
        uFillMode: { value: 0 },
        uColorStrategy: { value: 1 },
        uLineWidthDecay: { value: 1 },
        uDrift: { value: 0.05 },
        uFillWeight: { value: 0 },
        uColorFg: { value: new THREE.Color('#f4f1ff') },
        uColorBg: { value: new THREE.Color('#05010a') },
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
    u.uFolds.value = Math.max(params.folds, 2)
    u.uIters.value = params.iters
    u.uScale.value = params.scale
    u.uZoom.value = params.zoom
    u.uOpacity.value = params.opacity
    u.uFoldType.value = params.foldType === 'abs' ? 0 : params.foldType === 'inversion' ? 1 : 2
    u.uFillMode.value = params.fillMode === 'edge' ? 0 : params.fillMode === 'fill' ? 1 : params.fillMode === 'gradient' ? 2 : 3
    u.uColorStrategy.value = params.colorStrategy === 'mono' ? 0 : params.colorStrategy === 'spectrum' ? 1 : params.colorStrategy === 'depth' ? 2 : params.colorStrategy === 'angular' ? 3 : 4
    u.uLineWidthDecay.value = params.lineWidthDecay
    u.uDrift.value = params.drift
    u.uFillWeight.value = params.fillWeight
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
