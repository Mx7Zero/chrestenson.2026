import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

export type TunnelParams = {
  speed: number
  direction: 1 | -1
  roll: number
  fov: number
  fogFar: number
  wobble: number
  density: number
  rings: number
  hole: number
  helix: number
  wave: number
  bend: number
  bendDir: number
  cellBlur: number // 0 = hard cell edges, 0.5 = fully blended
  strobeRate: number // flashes per second (0 = off)
  strobeDuty: number // duty cycle 0.05–0.95
  strobeColor: string
  strobeTarget: number // 0=all, 1=cellA, 2=cellB
  strobeMode: number // 0=flash, 1=pulse, 2=rainbow, 3=alternate, 4=invert
  kaleidoscope: number
  chromatic: number
  hueShift: number
  colorA: string
  colorB: string
  imageA: string | null
  imageB: string | null
  patternA: PatternName | null
  patternB: PatternName | null
}

export const TUNNEL_DEFAULTS: TunnelParams = {
  speed: 0.015,
  direction: 1,
  roll: 0.3,
  fov: 95,
  fogFar: 35,
  wobble: 0.6,
  density: 8,
  rings: 2,
  hole: 3.2,
  helix: 0,
  wave: 0,
  bend: 0,
  bendDir: 0,
  cellBlur: 0,
  strobeRate: 0,
  strobeDuty: 0.15,
  strobeColor: '#ffffff',
  strobeTarget: 0,
  strobeMode: 0,
  kaleidoscope: 0,
  chromatic: 0,
  hueShift: 0,
  colorA: '#ffffff',
  colorB: '#000000',
  imageA: null,
  imageB: null,
  patternA: null,
  patternB: null,
}

export const TUNNEL_PRESETS: { name: string; values: Partial<TunnelParams> }[] = [
  { name: 'SUNBURST', values: { rings: 30, density: 1, speed: 0.02, roll: 0.3 } },
  { name: 'CHECKER', values: { rings: 4, density: 8, speed: 0.05, roll: 0 } },
  { name: 'HYPNO', values: { rings: 2, density: 60, speed: 0.1, roll: 0.8 } },
  { name: 'VORTEX', values: { rings: 20, density: 3, speed: 0.08, roll: 2, helix: 3 } },
  { name: 'WARP', values: { rings: 8, density: 30, speed: 0.3, bend: 45, wobble: 1 } },
  { name: 'RETRO', values: { rings: 6, density: 6, patternA: 'checker', patternB: 'checker', colorA: '#ff1493', colorB: '#00e1ff' } },
  { name: 'DOTS', values: { rings: 4, density: 4, patternA: 'dots', patternB: 'dot', colorA: '#ffffff', colorB: '#000000' } },
  { name: 'LINES', values: { rings: 10, density: 2, patternA: 'hlines', patternB: 'vlines' } },
  { name: 'TRIBAL', values: { rings: 6, density: 6, patternA: 'diagonal', patternB: 'diagonal', colorA: '#ffcc00', colorB: '#4a0e60' } },
  { name: 'DECO', values: { rings: 4, density: 4, patternA: 'diamond', patternB: 'cross', colorA: '#ffd700', colorB: '#000000' } },
  { name: 'JULIA', values: { rings: 3, density: 3, patternA: 'fractal', patternB: 'fractal', colorA: '#000000', colorB: '#00e5ff', speed: 0.02 } },
  { name: 'LAVA', values: { rings: 2, density: 2, patternA: 'marble', patternB: 'noise', colorA: '#ff1a00', colorB: '#ffcc00', speed: 0.03 } },
  { name: 'ZEN', values: { rings: 6, density: 1, patternA: 'spiral', patternB: 'radialGrad', colorA: '#ffffff', colorB: '#0a1f2f', speed: 0.01, roll: 0.1 } },
  { name: 'MELT', values: { rings: 4, density: 4, cellBlur: 0.35, patternA: 'noise', patternB: null, colorA: '#ff1493', colorB: '#000000', speed: 0.04 } },
  { name: 'COSMIC', values: { rings: 3, density: 3, patternA: 'radialGrad', patternB: 'spiral', colorA: '#4a0e60', colorB: '#ffd700', cellBlur: 0.15, speed: 0.02 } },
  { name: 'CIRCUIT', values: { rings: 8, density: 8, patternA: 'grid', patternB: 'dot', colorA: '#00ff41', colorB: '#050a05', cellBlur: 0, speed: 0.03 } },
  { name: 'DREAM', values: { rings: 2, density: 10, patternA: 'fractal', patternB: 'marble', colorA: '#00e5ff', colorB: '#2d1b4e', cellBlur: 0.25, speed: 0.015, roll: 0.5 } },
  { name: 'VOID', values: { rings: 20, density: 1, cellBlur: 0.4, colorA: '#000000', colorB: '#111111', speed: 0.08, roll: 1.5, helix: 2 } },
]

export const STROBE_PRESETS: { name: string; values: Partial<TunnelParams> }[] = [
  { name: 'OFF', values: { strobeRate: 0 } },
  { name: 'GENTLE', values: { strobeRate: 1, strobeDuty: 0.5, strobeMode: 1, strobeTarget: 0, strobeColor: '#ffffff' } },
  { name: 'RAVE', values: { strobeRate: 8, strobeDuty: 0.12, strobeMode: 0, strobeTarget: 0, strobeColor: '#ffffff' } },
  { name: 'POLICE', values: { strobeRate: 3, strobeDuty: 0.4, strobeMode: 3, strobeTarget: 0, colorA: '#0044ff', colorB: '#ff0022' } },
  { name: 'RAINBOW', values: { strobeRate: 2, strobeDuty: 0.5, strobeMode: 2, strobeTarget: 0 } },
  { name: 'HEARTBEAT', values: { strobeRate: 1.2, strobeDuty: 0.2, strobeMode: 1, strobeTarget: 0, strobeColor: '#ff0033' } },
  { name: 'BLACKOUT', values: { strobeRate: 4, strobeDuty: 0.3, strobeMode: 0, strobeTarget: 0, strobeColor: '#000000' } },
  { name: 'INVERT', values: { strobeRate: 2, strobeDuty: 0.5, strobeMode: 4, strobeTarget: 0 } },
  { name: 'CELL A', values: { strobeRate: 4, strobeDuty: 0.2, strobeMode: 0, strobeTarget: 1, strobeColor: '#ffffff' } },
  { name: 'CELL B', values: { strobeRate: 4, strobeDuty: 0.2, strobeMode: 0, strobeTarget: 2, strobeColor: '#ffffff' } },
]

export const TEST_IMAGES: { name: string; url: string }[] = [
  { name: 'Earth', url: '/textures/8k_earth_daymap.jpg' },
  { name: 'Concrete', url: '/textures/concrete_diff_2k.jpg' },
]

export type PatternName =
  | 'hlines'
  | 'vlines'
  | 'dot'
  | 'dots'
  | 'checker'
  | 'diagonal'
  | 'cross'
  | 'rings'
  | 'diamond'
  | 'grid'
  | 'fractal'
  | 'noise'
  | 'marble'
  | 'gradient'
  | 'radialGrad'
  | 'spiral'

export const PATTERNS: { id: PatternName; label: string; shader?: boolean }[] = [
  { id: 'hlines', label: '═' },
  { id: 'vlines', label: '║' },
  { id: 'dot', label: '●' },
  { id: 'dots', label: '∷' },
  { id: 'checker', label: '▚' },
  { id: 'diagonal', label: '╱' },
  { id: 'cross', label: '✚' },
  { id: 'rings', label: '◎' },
  { id: 'diamond', label: '◆' },
  { id: 'grid', label: '▦' },
  { id: 'fractal', label: 'F', shader: true },
  { id: 'noise', label: '~', shader: true },
  { id: 'marble', label: 'M', shader: true },
  { id: 'gradient', label: '▓', shader: true },
  { id: 'radialGrad', label: '◉', shader: true },
  { id: 'spiral', label: '@', shader: true },
]

const SHADER_PAT_MAP: Record<string, number> = {
  fractal: 1,
  noise: 2,
  marble: 3,
  gradient: 4,
  radialGrad: 5,
  spiral: 6,
}

function generatePattern(
  type: PatternName,
  size: number,
  fg: string,
  bg: string,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = fg
  ctx.strokeStyle = fg
  const s = size
  const h = s / 2

  switch (type) {
    case 'hlines': {
      const n = 5
      const band = s / n
      for (let i = 0; i < n; i += 2) ctx.fillRect(0, i * band, s, band)
      break
    }
    case 'vlines': {
      const n = 5
      const band = s / n
      for (let i = 0; i < n; i += 2) ctx.fillRect(i * band, 0, band, s)
      break
    }
    case 'dot':
      ctx.beginPath()
      ctx.arc(h, h, s * 0.35, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'dots': {
      const r = s * 0.1
      for (let y = 0; y < 3; y++)
        for (let x = 0; x < 3; x++) {
          ctx.beginPath()
          ctx.arc(s * (0.2 + x * 0.3), s * (0.2 + y * 0.3), r, 0, Math.PI * 2)
          ctx.fill()
        }
      break
    }
    case 'checker': {
      const n = 4
      const c = s / n
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++)
          if ((x + y) % 2 === 0) ctx.fillRect(x * c, y * c, c, c)
      break
    }
    case 'diagonal': {
      ctx.lineWidth = s / 5
      ctx.lineCap = 'square'
      for (let i = -s; i < s * 2; i += s / 4) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + s, s)
        ctx.stroke()
      }
      break
    }
    case 'cross': {
      const w = s * 0.25
      ctx.fillRect(h - w / 2, s * 0.1, w, s * 0.8)
      ctx.fillRect(s * 0.1, h - w / 2, s * 0.8, w)
      break
    }
    case 'rings':
      ctx.lineWidth = s * 0.08
      for (let r = 0.15; r <= 0.45; r += 0.15) {
        ctx.beginPath()
        ctx.arc(h, h, s * r, 0, Math.PI * 2)
        ctx.stroke()
      }
      break
    case 'diamond':
      ctx.beginPath()
      ctx.moveTo(h, s * 0.1)
      ctx.lineTo(s * 0.9, h)
      ctx.lineTo(h, s * 0.9)
      ctx.lineTo(s * 0.1, h)
      ctx.closePath()
      ctx.fill()
      break
    case 'grid': {
      ctx.lineWidth = s * 0.06
      const n = 4
      for (let i = 1; i < n; i++) {
        const p = (i / n) * s
        ctx.beginPath()
        ctx.moveTo(p, 0)
        ctx.lineTo(p, s)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, p)
        ctx.lineTo(s, p)
        ctx.stroke()
      }
      break
    }
  }
  return canvas
}

function usePatternTexture(
  name: PatternName | null,
  fg: string,
  bg: string,
): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!name) {
      setTex(null)
      return
    }
    const canvas = generatePattern(name, 256, fg, bg)
    const t = new THREE.CanvasTexture(canvas)
    t.wrapS = THREE.ClampToEdgeWrapping
    t.wrapT = THREE.ClampToEdgeWrapping
    t.colorSpace = THREE.SRGBColorSpace
    t.minFilter = THREE.LinearFilter
    t.magFilter = THREE.LinearFilter
    setTex(t)
    return () => t.dispose()
  }, [name, fg, bg])
  return tex
}

export const COLOR_PALETTES: { name: string; a: string; b: string }[] = [
  { name: 'Mono', a: '#ffffff', b: '#000000' },
  { name: 'Cyberpunk', a: '#ff1493', b: '#00e1ff' },
  { name: 'Matrix', a: '#00ff41', b: '#050a05' },
  { name: 'Sunset', a: '#ff6b35', b: '#2d1b4e' },
  { name: 'Fire', a: '#ff1a00', b: '#ffcc00' },
  { name: 'Ocean', a: '#00e5ff', b: '#002748' },
  { name: 'Acid', a: '#faff00', b: '#ff00e6' },
  { name: 'Royal', a: '#ffd700', b: '#4a0e60' },
  { name: 'Mint', a: '#00f5a0', b: '#0a1f2f' },
  { name: 'Blood', a: '#ff003c', b: '#000000' },
]

const TUBE_LENGTH = 600
const LENGTHWISE_SEGMENTS = 600
const RADIAL_SEGMENTS = 128
// Frequencies picked so the periods (80 and 40) are commensurate — uPhase
// can be wrapped at 80 without any visible seam in the deformation.
const HELIX_FREQ = (Math.PI * 2) / 80
const WAVE_FREQ = (Math.PI * 2) / 40
const PHASE_WRAP = 80

// Single-pixel white fallback so the shader always has a valid sampler2D
const WHITE_PIXEL = (() => {
  const tex = new THREE.DataTexture(
    new Uint8Array([255, 255, 255, 255]),
    1,
    1,
    THREE.RGBAFormat,
  )
  tex.needsUpdate = true
  return tex
})()

const VERTEX_SHADER = `
uniform float uHelix;
uniform float uWave;
uniform float uPhase;
uniform float uBend;
uniform float uBendDir;

varying vec2 vUv;
varying float vFogDepth;

void main() {
  vUv = uv;
  vec3 transformed = position;

  float zPhase = transformed.y - uPhase;
  transformed.x += cos(zPhase * ${HELIX_FREQ.toFixed(4)}) * uHelix
                 + sin(zPhase * ${WAVE_FREQ.toFixed(4)}) * uWave;
  transformed.z += sin(zPhase * ${HELIX_FREQ.toFixed(4)}) * uHelix;

  if (abs(uBend) > 0.00001) {
    float cd = cos(-uBendDir);
    float sd = sin(-uBendDir);
    float preX = transformed.x * cd - transformed.z * sd;
    float preZ = transformed.x * sd + transformed.z * cd;
    float bendAngle = transformed.y * uBend;
    float bendR = 1.0 / uBend;
    float cy = bendR * sin(bendAngle);
    float cz = bendR * (1.0 - cos(bendAngle));
    float yNew = cy - preZ * sin(bendAngle);
    float zNew = cz + preZ * cos(bendAngle);
    float cd2 = cos(uBendDir);
    float sd2 = sin(uBendDir);
    transformed.x = preX * cd2 - zNew * sd2;
    transformed.y = yNew;
    transformed.z = preX * sd2 + zNew * cd2;
  }

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  vFogDepth = -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
`

const FRAGMENT_SHADER = `
precision highp float;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uRings;
uniform float uDensityY;
uniform float uTexScroll;
uniform float uMotion;
uniform float uCellBlur;
uniform float uStrobeRate;
uniform float uStrobeDuty;
uniform vec3 uStrobeColor;
uniform float uStrobeTarget;
uniform float uStrobeMode;
uniform sampler2D uImageA;
uniform sampler2D uImageB;
uniform float uHasImageA;
uniform float uHasImageB;
uniform float uShaderPatA;
uniform float uShaderPatB;
uniform float uTime;

uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;

varying vec2 vUv;
varying float vFogDepth;

// --- Noise helpers ---
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float valNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1, 0)), f.x),
    mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * valNoise(p); p *= 2.0; a *= 0.5; }
  return v;
}

// --- Shader-based patterns: return mix factor 0→col1 / 1→col2 ---
float shaderPattern(float id, vec2 uv, float time) {
  // 1 = fractal (Julia set)
  if (id < 1.5) {
    vec2 c = vec2(-0.7 + sin(time * 0.15) * 0.1, 0.27 + cos(time * 0.12) * 0.08);
    vec2 z = (uv - 0.5) * 3.0;
    float it = 0.0;
    for (int i = 0; i < 80; i++) {
      z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
      if (dot(z, z) > 4.0) break;
      it += 1.0;
    }
    return it / 80.0;
  }
  // 2 = noise (flowing)
  if (id < 2.5) {
    return fbm((uv - 0.5) * 4.0 + time * 0.4);
  }
  // 3 = marble (veined)
  if (id < 3.5) {
    float n = fbm(uv * 6.0 + time * 0.2);
    return 0.5 + 0.5 * sin(uv.x * 12.0 + n * 8.0);
  }
  // 4 = gradient (linear top to bottom)
  if (id < 4.5) {
    return uv.y;
  }
  // 5 = radial gradient
  if (id < 5.5) {
    return clamp(length(uv - 0.5) * 2.0, 0.0, 1.0);
  }
  // 6 = spiral
  float a = atan(uv.y - 0.5, uv.x - 0.5);
  float r = length(uv - 0.5);
  return 0.5 + 0.5 * sin(a * 4.0 + r * 12.0 - time * 2.0);
}

// --- Anti-aliased checkerboard ---
float aaChecker(vec2 p) {
  vec2 w = fwidth(p) + 0.001;
  vec2 i = 2.0 * (
    abs(fract((p - 0.5 * w) * 0.5) - 0.5)
    - abs(fract((p + 0.5 * w) * 0.5) - 0.5)
  ) / w;
  return 0.5 - 0.5 * i.x * i.y;
}

vec3 getCellColor(vec2 localUv, float shaderPat, float hasImage,
                  sampler2D img, vec3 solidCol, vec3 otherCol, float time) {
  if (shaderPat > 0.5) {
    float t = shaderPattern(shaderPat, localUv, time);
    return mix(solidCol, otherCol, t);
  }
  if (hasImage > 0.5) {
    return texture2D(img, localUv).rgb;
  }
  return solidCol;
}

void main() {
  vec2 tileUv = vec2(
    vUv.x * uRings * 2.0,
    (vUv.y + uTexScroll) * uDensityY * 2.0
  );

  float checker = 0.0;
  for (int i = 0; i < 4; i++) {
    float t = (float(i) + 0.5) / 4.0 - 0.5;
    vec2 sampleUv = tileUv + vec2(0.0, t * uMotion);
    checker += clamp(aaChecker(sampleUv), 0.0, 1.0);
  }
  checker *= 0.25;

  // Soften cell edges: blend checker toward 0.5 near cell boundaries.
  // uCellBlur 0 = razor edges, 0.5 = everything melts together.
  if (uCellBlur > 0.001) {
    vec2 f = fract(tileUv);
    vec2 edgeDist = min(f, 1.0 - f);
    float minDist = min(edgeDist.x, edgeDist.y);
    float edgeMask = smoothstep(0.0, uCellBlur, minDist);
    checker = mix(0.5, checker, edgeMask);
  }

  vec2 localUv = fract(tileUv);

  vec3 colA = getCellColor(localUv, uShaderPatA, uHasImageA, uImageA,
                           uColorA, uColorB, uTime);
  vec3 colB = getCellColor(localUv, uShaderPatB, uHasImageB, uImageB,
                           uColorB, uColorA, uTime);
  vec3 color = mix(colA, colB, checker);

  // Strobe system: target (all/cellA/cellB), mode (flash/pulse/rainbow/alternate/invert)
  if (uStrobeRate > 0.01) {
    float strobePhase = fract(uTime * uStrobeRate);

    // Target mask: which fragments are affected
    float affected = 1.0;
    if (uStrobeTarget > 0.5 && uStrobeTarget < 1.5)
      affected = 1.0 - checker;  // cell A only
    else if (uStrobeTarget > 1.5)
      affected = checker;  // cell B only

    // Envelope shape
    float envelope;
    if (uStrobeMode < 0.5 || uStrobeMode > 2.5 && uStrobeMode < 4.5)
      envelope = 1.0 - step(uStrobeDuty, strobePhase);  // hard flash
    else if (uStrobeMode < 1.5)
      envelope = 0.5 + 0.5 * cos(strobePhase * 6.28318);  // smooth pulse
    else
      envelope = 1.0 - step(uStrobeDuty, strobePhase);

    // Strobe color based on mode
    vec3 strobeCol = uStrobeColor;
    if (uStrobeMode > 1.5 && uStrobeMode < 2.5) {
      // Rainbow: hue cycles with time
      float hue = fract(uTime * uStrobeRate * 0.15);
      vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
      vec3 p = abs(fract(vec3(hue) + K.xyz) * 6.0 - K.www);
      strobeCol = mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), 1.0);
    } else if (uStrobeMode > 2.5 && uStrobeMode < 3.5) {
      // Alternate: swap cell colors
      strobeCol = mix(uColorB, uColorA, checker);
    } else if (uStrobeMode > 3.5) {
      // Invert
      strobeCol = vec3(1.0) - color;
    }

    color = mix(color, strobeCol, envelope * affected);
  }

  float fogFactor = clamp(
    (vFogDepth - uFogNear) / (uFogFar - uFogNear),
    0.0,
    1.0
  );
  color = mix(color, uFogColor, fogFactor);

  gl_FragColor = vec4(color, 1.0);
}
`

function useImageTexture(url: string | null): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!url) {
      setTex(null)
      return
    }
    const loader = new THREE.TextureLoader()
    let loaded: THREE.Texture | null = null
    loader.load(
      url,
      (t) => {
        t.wrapS = THREE.ClampToEdgeWrapping
        t.wrapT = THREE.ClampToEdgeWrapping
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 16
        loaded = t
        setTex(t)
      },
      undefined,
      () => setTex(null),
    )
    return () => {
      if (loaded) loaded.dispose()
    }
  }, [url])
  return tex
}

function Tunnel({ params }: { params: TunnelParams }) {
  const { camera } = useThree()

  const geometry = useMemo(
    () =>
      new THREE.CylinderGeometry(
        params.hole,
        params.hole,
        TUBE_LENGTH,
        RADIAL_SEGMENTS,
        LENGTHWISE_SEGMENTS,
        true,
      ),
    [params.hole],
  )
  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  const shaderPatA = SHADER_PAT_MAP[params.patternA ?? ''] ?? 0
  const shaderPatB = SHADER_PAT_MAP[params.patternB ?? ''] ?? 0
  const canvasPatA = shaderPatA ? null : params.patternA
  const canvasPatB = shaderPatB ? null : params.patternB
  const patternATex = usePatternTexture(canvasPatA, params.colorB, params.colorA)
  const patternBTex = usePatternTexture(canvasPatB, params.colorA, params.colorB)
  const imageATex = useImageTexture(canvasPatA || shaderPatA ? null : params.imageA)
  const imageBTex = useImageTexture(canvasPatB || shaderPatB ? null : params.imageB)
  const effectiveA = patternATex ?? imageATex
  const effectiveB = patternBTex ?? imageBTex

  const uniformsRef = useRef({
    uHelix: { value: 0 },
    uWave: { value: 0 },
    uPhase: { value: 0 },
    uBend: { value: 0 },
    uBendDir: { value: 0 },
    uColorA: { value: new THREE.Color('#ffffff') },
    uColorB: { value: new THREE.Color('#000000') },
    uRings: { value: 2 },
    uDensityY: { value: 8 },
    uTexScroll: { value: 0 },
    uMotion: { value: 0 },
    uCellBlur: { value: 0 },
    uStrobeRate: { value: 0 },
    uStrobeDuty: { value: 0.15 },
    uStrobeColor: { value: new THREE.Color('#ffffff') },
    uStrobeTarget: { value: 0 },
    uStrobeMode: { value: 0 },
    uImageA: { value: WHITE_PIXEL as THREE.Texture },
    uImageB: { value: WHITE_PIXEL as THREE.Texture },
    uHasImageA: { value: 0 },
    uHasImageB: { value: 0 },
    uShaderPatA: { value: 0 },
    uShaderPatB: { value: 0 },
    uTime: { value: 0 },
    uFogColor: { value: new THREE.Color('#000000') },
    uFogNear: { value: 2 },
    uFogFar: { value: 35 },
  })

  // Include shader strings in deps so HMR actually rebuilds the material
  // when shader source changes. Without this, the old compiled shader
  // persists across hot reloads and code edits appear to have no effect.
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: uniformsRef.current,
      side: THREE.BackSide,
      fog: false,
      toneMapped: false,
    })
    ;(mat as any).extensions = {
      ...(mat as any).extensions,
      derivatives: true,
    }
    return mat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [VERTEX_SHADER, FRAGMENT_SHADER])
  useEffect(() => {
    return () => material.dispose()
  }, [material])

  // Push textures and shader-pattern IDs into uniforms
  useEffect(() => {
    uniformsRef.current.uImageA.value = effectiveA ?? WHITE_PIXEL
    uniformsRef.current.uHasImageA.value = effectiveA ? 1 : 0
    uniformsRef.current.uShaderPatA.value = shaderPatA
  }, [effectiveA, shaderPatA])
  useEffect(() => {
    uniformsRef.current.uImageB.value = effectiveB ?? WHITE_PIXEL
    uniformsRef.current.uHasImageB.value = effectiveB ? 1 : 0
    uniformsRef.current.uShaderPatB.value = shaderPatB
  }, [effectiveB, shaderPatB])

  const phaseRef = useRef(0)
  const scrollRef = useRef(0)
  const rollPhaseRef = useRef(0)

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime

    uniformsRef.current.uHelix.value = params.helix
    uniformsRef.current.uWave.value = params.wave
    uniformsRef.current.uColorA.value.set(params.colorA)
    uniformsRef.current.uColorB.value.set(params.colorB)
    // Force integer — non-integer density/rings produce odd cell counts
    // that break checker parity and cause stroboscopic artifacts.
    const safeRings = Math.max(Math.round(params.rings), 1)
    const safeDensity = Math.max(Math.round(params.density), 1)
    uniformsRef.current.uRings.value = safeRings
    uniformsRef.current.uDensityY.value = safeDensity
    uniformsRef.current.uFogNear.value = 2
    uniformsRef.current.uFogFar.value = params.fogFar

    const uBendValue =
      (params.bend * Math.PI) / 180 / (TUBE_LENGTH * 0.5)
    const uBendDirRad = (params.bendDir * Math.PI) / 180
    uniformsRef.current.uBend.value = uBendValue
    uniformsRef.current.uBendDir.value = uBendDirRad

    // Clamp delta so one slow frame (layout thrash, scene pause/resume,
    // window blur) can't catapult the phase and cause a visible jump.
    const safeDelta = Math.min(delta, 1 / 30)
    const step = safeDelta * params.speed * 100 * params.direction
    phaseRef.current =
      ((phaseRef.current - step) % PHASE_WRAP + PHASE_WRAP) % PHASE_WRAP
    // Divide scroll by density so the per-frame cell shift is always
    // step*0.08 regardless of density. No stroboscopic aliasing even at
    // density 2000.
    const scrollStep = step * 0.04 / safeDensity
    const scrollWrap = 2 / safeDensity
    scrollRef.current =
      ((scrollRef.current - scrollStep) % scrollWrap + scrollWrap) % scrollWrap
    uniformsRef.current.uPhase.value = phaseRef.current
    uniformsRef.current.uTexScroll.value = scrollRef.current
    uniformsRef.current.uMotion.value = Math.abs(step * 0.08)
    uniformsRef.current.uCellBlur.value = params.cellBlur
    uniformsRef.current.uStrobeRate.value = params.strobeRate
    uniformsRef.current.uStrobeDuty.value = params.strobeDuty
    uniformsRef.current.uStrobeColor.value.set(params.strobeColor)
    uniformsRef.current.uStrobeTarget.value = params.strobeTarget
    uniformsRef.current.uStrobeMode.value = params.strobeMode
    uniformsRef.current.uTime.value = elapsed

    rollPhaseRef.current += safeDelta * params.roll

    const wobbleCap = params.hole * 0.7
    const w = Math.min(params.wobble, wobbleCap)
    const wobX = Math.sin(elapsed * 0.7) * w
    const wobY = Math.cos(elapsed * 0.9) * w

    const phase = phaseRef.current
    const helixOffsetX =
      Math.cos(-phase * HELIX_FREQ) * params.helix +
      Math.sin(-phase * WAVE_FREQ) * params.wave
    const helixOffsetY = -Math.sin(-phase * HELIX_FREQ) * params.helix

    const aheadPhase = phase + 10
    const nextX =
      Math.cos(-aheadPhase * HELIX_FREQ) * params.helix +
      Math.sin(-aheadPhase * WAVE_FREQ) * params.wave
    const nextY = -Math.sin(-aheadPhase * HELIX_FREQ) * params.helix

    let lookWorldX = nextX + wobX
    let lookWorldY = nextY + wobY
    let lookWorldZ = -10
    if (Math.abs(uBendValue) > 0.00001) {
      const bendAngle = -10 * uBendValue
      const bendR = 1 / uBendValue
      const cy = bendR * Math.sin(bendAngle)
      const cz = bendR * (1 - Math.cos(bendAngle))
      const sd2 = Math.sin(uBendDirRad)
      const cd2 = Math.cos(uBendDirRad)
      const localX = -cz * sd2
      const localY = cy
      const localZ = cz * cd2
      lookWorldX = nextX + wobX + localX
      lookWorldY = nextY + wobY - localZ
      lookWorldZ = localY
    }

    camera.up.set(
      Math.sin(rollPhaseRef.current),
      Math.cos(rollPhaseRef.current),
      0,
    )
    camera.position.set(helixOffsetX + wobX, helixOffsetY + wobY, 0)
    camera.lookAt(lookWorldX, lookWorldY, lookWorldZ)
  })

  return (
    <mesh geometry={geometry} material={material} rotation={[Math.PI / 2, 0, 0]} />
  )
}

function CameraSync({ fov }: { fov: number }) {
  const { camera } = useThree()
  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera
    if (cam.fov !== fov) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }
  })
  return null
}

export function TunnelCanvas({
  active,
  params,
}: {
  active: boolean
  params: TunnelParams
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 0], fov: params.fov, near: 0.1, far: 1000 }}
      gl={{ antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#000000']} />
      <CameraSync fov={params.fov} />
      <Tunnel params={params} />
    </Canvas>
  )
}
