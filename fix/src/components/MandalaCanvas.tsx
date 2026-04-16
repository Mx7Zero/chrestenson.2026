import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { TunnelParams } from './TunnelCanvas'

const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`

const FRAG = `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform float uSegments;
uniform float uSpeed;
uniform float uScale;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uPatternType;
uniform float uChromatic;
uniform float uHueShift;
uniform float uStrobeRate;
uniform float uStrobeDuty;
uniform vec3 uStrobeColor;

// --- Noise ---
float hash21(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float valNoise(vec2 p) {
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),
             mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5;
  for(int i=0;i<5;i++){v+=a*valNoise(p);p*=2.0;a*=0.5;}
  return v;
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

// --- Patterns (return 0-1 mix factor) ---
float pattern(float id, vec2 uv, float time) {
  if (id < 0.5) return 0.5 + 0.5*sin(uv.x*10.0+time); // default wave
  if (id < 1.5) { // fractal
    vec2 c = vec2(-0.7+sin(time*0.15)*0.1, 0.27+cos(time*0.12)*0.08);
    vec2 z = (uv-0.5)*3.0;
    float it=0.0;
    for(int i=0;i<80;i++){z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;if(dot(z,z)>4.)break;it+=1.;}
    return it/80.0;
  }
  if (id < 2.5) return fbm((uv-0.5)*4.+time*0.4); // noise
  if (id < 3.5) return 0.5+0.5*sin(uv.x*12.+fbm(uv*6.+time*0.2)*8.); // marble
  if (id < 4.5) return uv.y; // gradient
  if (id < 5.5) return clamp(length(uv-0.5)*2.,0.,1.); // radial
  // spiral
  float a=atan(uv.y-0.5,uv.x-0.5), r=length(uv-0.5);
  return 0.5+0.5*sin(a*4.+r*12.-time*2.);
}

// --- Kaleidoscope fold ---
vec2 kaleidoFold(vec2 uv, float segs, float time) {
  vec2 c = uv - 0.5;
  float a = atan(c.y, c.x);
  float r = length(c);
  a += time * 0.08;
  float seg = 6.28318 / segs;
  a = abs(mod(a + seg*0.5, seg) - seg*0.5);
  a += sin(r*6.0 - time*1.5) * 0.04;
  return vec2(cos(a), sin(a)) * r + 0.5;
}

void main() {
  vec2 uv = vUv;
  float time = uTime * max(uSpeed, 0.01) * 10.0;

  // Kaleidoscope fold
  if (uSegments > 1.5) {
    uv = kaleidoFold(uv, uSegments, time);
  }

  // Scale
  uv = (uv - 0.5) * uScale + 0.5;

  // Pattern
  float t = pattern(uPatternType, uv, time);

  // Chromatic aberration on the pattern
  vec3 color;
  if (uChromatic > 0.001) {
    vec2 dir = (vUv - 0.5) * uChromatic;
    vec2 uvR = uv + dir, uvB = uv - dir;
    if (uSegments > 1.5) {
      uvR = kaleidoFold(vUv + dir, uSegments, time);
      uvB = kaleidoFold(vUv - dir, uSegments, time);
      uvR = (uvR - 0.5) * uScale + 0.5;
      uvB = (uvB - 0.5) * uScale + 0.5;
    }
    float tR = pattern(uPatternType, uvR, time);
    float tB = pattern(uPatternType, uvB, time);
    color = vec3(
      mix(uColorA.r, uColorB.r, tR),
      mix(uColorA.g, uColorB.g, t),
      mix(uColorA.b, uColorB.b, tB)
    );
  } else {
    color = mix(uColorA, uColorB, t);
  }

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

const PATTERN_ID_MAP: Record<string, number> = {
  fractal: 1,
  noise: 2,
  marble: 3,
  gradient: 4,
  radialGrad: 5,
  spiral: 6,
}

function MandalaQuad({ params }: { params: TunnelParams }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)

  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uSegments: { value: 6 },
        uSpeed: { value: 0.015 },
        uScale: { value: 4 },
        uColorA: { value: new THREE.Color('#ffffff') },
        uColorB: { value: new THREE.Color('#000000') },
        uPatternType: { value: 1 },
        uChromatic: { value: 0 },
        uHueShift: { value: 0 },
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
    u.uTime.value = state.clock.elapsedTime
    u.uSegments.value = params.kaleidoscope || 6
    u.uSpeed.value = params.speed
    u.uScale.value = Math.max(params.density, 1)
    u.uColorA.value.set(params.colorA)
    u.uColorB.value.set(params.colorB)
    u.uPatternType.value = PATTERN_ID_MAP[params.patternA ?? ''] ?? 1
    u.uChromatic.value = params.chromatic
    u.uHueShift.value = params.hueShift
    u.uStrobeRate.value = params.strobeRate
    u.uStrobeDuty.value = params.strobeDuty
    u.uStrobeColor.value.set(params.strobeColor)
  })

  return (
    <mesh ref={matRef as any} material={material} frustumCulled={false}>
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
