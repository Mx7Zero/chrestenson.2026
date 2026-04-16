import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { TunnelParams } from './TunnelCanvas'

const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`

const FRAG = `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform float uFolds;
uniform float uSpeed;
uniform float uZoom;
uniform float uWarp;
uniform float uColorSpeed;
uniform vec3 uTintA;
uniform vec3 uTintB;
uniform float uStrobeRate;
uniform float uStrobeDuty;
uniform vec3 uStrobeColor;
uniform float uHueShift;
uniform float uChromatic;

#define TAU 6.28318530718

// --- Noise ---
float hash21(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float valNoise(vec2 p) {
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),
             mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float v=0.0, a=0.5;
  mat2 rot = mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
  for(int i=0;i<6;i++){v+=a*valNoise(p);p=rot*p*2.0;a*=0.5;}
  return v;
}

// --- IQ cosine palette ---
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

// --- HSV ---
vec3 rgb2hsv(vec3 c){
  vec4 K=vec4(0.,-1./3.,2./3.,-1.);
  vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));
  vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));
  float d=q.x-min(q.w,q.y),e=1e-10;
  return vec3(abs(q.z+(q.w-q.y)/(6.*d+e)),d/(q.x+e),q.x);
}
vec3 hsv2rgb(vec3 c){
  vec4 K=vec4(1.,2./3.,1./3.,3.);
  vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);
  return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);
}

// --- Kaleidoscope mirror fold ---
vec2 kaleidoscope(vec2 uv, float folds) {
  float angle = atan(uv.y, uv.x);
  float r = length(uv);
  float segment = TAU / folds;
  angle = mod(angle, segment);
  angle = abs(angle - segment * 0.5);
  return vec2(cos(angle), sin(angle)) * r;
}

// --- Mandala layer ---
float mandalaLayer(vec2 uv, float time, float offset) {
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  // Layered sine rings
  float pattern = sin(r * 20.0 - time * 2.0 + offset) * 0.5 + 0.5;
  pattern += sin(a * 6.0 + r * 10.0 - time * 1.3) * 0.3;
  pattern += sin(r * 8.0 + a * 3.0 + time * 0.7) * 0.2;

  // Domain warp with fbm
  vec2 q = vec2(
    fbm(uv * 2.0 + time * 0.15 + offset),
    fbm(uv * 2.0 + vec2(5.2, 1.3) + time * 0.12)
  );
  pattern += fbm(uv * 3.0 + q * uWarp) * 0.4;

  return clamp(pattern, 0.0, 1.0);
}

void main() {
  float time = uTime * uSpeed;

  // Center and aspect-correct
  vec2 uv = (vUv - 0.5) * 2.0;
  float aspect = 1.7778; // approximate 16:9
  uv.x *= aspect;

  // Zoom
  uv *= uZoom;

  // Slow global rotation
  float rot = time * 0.1;
  mat2 rm = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
  uv = rm * uv;

  // Kaleidoscope fold
  vec2 kUv = kaleidoscope(uv, uFolds);

  // Three composited layers at different zoom scales (pro VJ technique)
  float layer1 = mandalaLayer(kUv, time, 0.0);
  float layer2 = mandalaLayer(kUv * 1.5, time * 0.8, 2.0);
  float layer3 = mandalaLayer(kUv * 0.7, time * 1.2, 4.0);

  // Additive blend of layers
  float combined = layer1 * 0.5 + layer2 * 0.3 + layer3 * 0.2;

  // IQ cosine palette with time cycling
  vec3 color = palette(
    combined + time * uColorSpeed * 0.05,
    vec3(0.5), vec3(0.5),
    vec3(1.0, 1.0, 1.0),
    vec3(0.0, 0.33, 0.67)
  );

  // Tint toward user's color choices
  vec3 userTint = mix(uTintA, uTintB, combined);
  color = mix(color, userTint, 0.35);

  // Chromatic aberration
  if (uChromatic > 0.001) {
    vec2 dir = (vUv - 0.5) * uChromatic * 2.0;
    vec2 uvR = rm * ((vUv - 0.5 + dir) * 2.0 * vec2(aspect, 1.0) * uZoom);
    vec2 uvB = rm * ((vUv - 0.5 - dir) * 2.0 * vec2(aspect, 1.0) * uZoom);
    vec2 kR = kaleidoscope(uvR, uFolds);
    vec2 kB = kaleidoscope(uvB, uFolds);
    float lR = mandalaLayer(kR, time, 0.0) * 0.5 + mandalaLayer(kR * 1.5, time * 0.8, 2.0) * 0.3 + mandalaLayer(kR * 0.7, time * 1.2, 4.0) * 0.2;
    float lB = mandalaLayer(kB, time, 0.0) * 0.5 + mandalaLayer(kB * 1.5, time * 0.8, 2.0) * 0.3 + mandalaLayer(kB * 0.7, time * 1.2, 4.0) * 0.2;
    vec3 cR = palette(lR + time * uColorSpeed * 0.05, vec3(0.5), vec3(0.5), vec3(1,1,1), vec3(0,0.33,0.67));
    vec3 cB = palette(lB + time * uColorSpeed * 0.05, vec3(0.5), vec3(0.5), vec3(1,1,1), vec3(0,0.33,0.67));
    color = vec3(mix(cR, userTint, 0.35).r, color.g, mix(cB, userTint, 0.35).b);
  }

  // Vignette
  float vig = 1.0 - smoothstep(0.4, 1.4, length(vUv - 0.5) * 2.0);
  color *= vig;

  // Strobe
  if (uStrobeRate > 0.01) {
    float sp = fract(uTime * uStrobeRate);
    float env = 1.0 - step(uStrobeDuty, sp);
    color = mix(color, uStrobeColor, env);
  }

  // Hue shift
  if (uHueShift > 0.001) {
    vec3 hsv = rgb2hsv(color);
    hsv.x = fract(hsv.x + uTime * uHueShift);
    color = hsv2rgb(hsv);
  }

  gl_FragColor = vec4(color, 1.0);
}
`

function MandalaQuad({ params }: { params: TunnelParams }) {
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uFolds: { value: 8 },
        uSpeed: { value: 1 },
        uZoom: { value: 3 },
        uWarp: { value: 2 },
        uColorSpeed: { value: 1 },
        uTintA: { value: new THREE.Color('#ffffff') },
        uTintB: { value: new THREE.Color('#000000') },
        uStrobeRate: { value: 0 },
        uStrobeDuty: { value: 0.15 },
        uStrobeColor: { value: new THREE.Color('#ffffff') },
        uHueShift: { value: 0 },
        uChromatic: { value: 0 },
      },
    })
    return mat
  }, [])

  useFrame((state) => {
    const u = material.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uFolds.value = Math.max(params.kaleidoscope || 8, 3)
    u.uSpeed.value = Math.max(params.speed * 10, 0.1)
    u.uZoom.value = Math.max(params.density * 0.5, 0.5)
    u.uWarp.value = params.helix * 0.3
    u.uColorSpeed.value = params.hueShift * 5 + 0.5
    u.uTintA.value.set(params.colorA)
    u.uTintB.value.set(params.colorB)
    u.uStrobeRate.value = params.strobeRate
    u.uStrobeDuty.value = params.strobeDuty
    u.uStrobeColor.value.set(params.strobeColor)
    u.uHueShift.value = params.hueShift
    u.uChromatic.value = params.chromatic
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
