import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { TunnelParams } from './TunnelCanvas'

const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`

// Sharp geometric mandala — hard edges, B&W, geometric shapes.
// NOT soft noise / NOT rainbow watercolors.
const FRAG = `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform float uFolds;
uniform float uSpeed;
uniform float uZoom;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uStrobeRate;
uniform float uStrobeDuty;
uniform vec3 uStrobeColor;

#define TAU 6.28318530718
#define PI  3.14159265359

// --- Kaleidoscope mirror fold ---
vec2 kfold(vec2 p, float n) {
  float a = atan(p.y, p.x);
  float seg = TAU / n;
  a = mod(a, seg);
  a = abs(a - seg * 0.5);
  return vec2(cos(a), sin(a)) * length(p);
}

// --- Sharp geometric pattern ---
// Concentric rings + radial lines + angular shapes, all hard-edged.
float geometricPattern(vec2 p, float time) {
  float r = length(p);
  float a = atan(p.y, p.x);

  float pattern = 0.0;

  // Sharp concentric rings (hard step, not smooth)
  float rings = step(0.5, fract(r * 8.0 - time * 0.3));
  pattern += rings;

  // Radial lines (sharp angular segments)
  float radials = step(0.5, fract(a / PI * 12.0));
  pattern += radials * 0.5;

  // Inner geometric star
  float star = step(0.5, fract(a / PI * 6.0 + r * 4.0 - time * 0.5));
  pattern += star * step(r, 1.5) * 0.4;

  // Concentric angular shapes (octagonal rings)
  float angular = max(abs(p.x), abs(p.y));
  float diamond = abs(p.x) + abs(p.y);
  float octRings = step(0.5, fract(mix(angular, diamond, 0.5) * 4.0 - time * 0.2));
  pattern += octRings * 0.3;

  // Normalize to 0-1
  return clamp(pattern * 0.5, 0.0, 1.0);
}

void main() {
  float time = uTime * uSpeed;

  // Center and aspect-correct
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= 1.7778;

  // Zoom
  uv *= uZoom;

  // Slow rotation
  float rot = time * 0.08;
  mat2 rm = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
  uv = rm * uv;

  // Kaleidoscope fold
  vec2 p = kfold(uv, uFolds);

  // Compute sharp geometric pattern
  float t = geometricPattern(p, time);

  // Two-color output (user's colors, not rainbow)
  vec3 color = mix(uColorA, uColorB, step(0.5, t));

  // Strobe
  if (uStrobeRate > 0.01) {
    float sp = fract(uTime * uStrobeRate);
    float env = 1.0 - step(uStrobeDuty, sp);
    color = mix(color, uStrobeColor, env);
  }

  gl_FragColor = vec4(color, 1.0);
}
`

function MandalaQuad({ params }: { params: TunnelParams }) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uFolds: { value: 8 },
        uSpeed: { value: 1 },
        uZoom: { value: 3 },
        uColorA: { value: new THREE.Color('#ffffff') },
        uColorB: { value: new THREE.Color('#000000') },
        uStrobeRate: { value: 0 },
        uStrobeDuty: { value: 0.15 },
        uStrobeColor: { value: new THREE.Color('#ffffff') },
      },
    })
  }, [])

  useFrame((state) => {
    const u = material.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uFolds.value = Math.max(params.kaleidoscope || 8, 3)
    u.uSpeed.value = Math.max(params.speed * 8, 0.1)
    u.uZoom.value = Math.max(params.density * 0.4, 0.5)
    u.uColorA.value.set(params.colorA)
    u.uColorB.value.set(params.colorB)
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
  params: TunnelParams
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
