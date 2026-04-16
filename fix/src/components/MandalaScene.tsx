/**
 * SUPR Visual System — 3D scene architecture
 *
 * 5 layers composed in a single R3F Canvas:
 * 1. GeometryCore — InstancedMesh sacred primitives with depth
 * 2. ShaderField — Q-900 fold shader on a transparent back plane
 * 3. ParticleField — Points-based embers/dust/plasma
 * 4. Atmosphere — Fog + volumetric haze
 * 5. PostProcessing — Bloom, DOF, grain
 */

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { MandalaParams } from './MandalaCanvas'

// ============================================================
// LAYER 1: GEOMETRY CORE — instanced sacred primitives
// ============================================================

const RING_COUNT = 8
const INSTANCES_PER_RING = 64

function GeometryCore({ params }: { params: MandalaParams }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const geometry = useMemo(() => {
    return new THREE.TorusGeometry(1, 0.015, 8, 64)
  }, [])

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    })
  }, [])

  const totalInstances = RING_COUNT * INSTANCES_PER_RING

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime * params.speed
    const folds = Math.max(params.folds, 2)
    let idx = 0

    for (let ring = 0; ring < RING_COUNT; ring++) {
      const ringRadius = 0.5 + ring * 0.8
      const z = -ring * 2.5 // depth separation
      const ringSpeed = (ring % 2 === 0 ? 1 : -1) * (0.1 + ring * 0.02)
      const scale = 0.1 + ring * 0.15

      for (let i = 0; i < INSTANCES_PER_RING; i++) {
        if (idx >= totalInstances) break
        const angle = (i / INSTANCES_PER_RING) * Math.PI * 2 + t * ringSpeed
        // Only place at fold-symmetric positions
        const foldAngle = (Math.floor(i / (INSTANCES_PER_RING / folds)) * Math.PI * 2) / folds
        const localAngle = angle + foldAngle * 0.1

        dummy.position.set(
          Math.cos(localAngle) * ringRadius,
          Math.sin(localAngle) * ringRadius,
          z + Math.sin(t * 0.5 + ring + i * 0.1) * 0.3
        )
        dummy.rotation.set(
          Math.sin(t * 0.3 + i) * 0.5,
          t * ringSpeed * 0.5,
          localAngle + Math.PI * 0.5
        )
        dummy.scale.setScalar(scale * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 0.3)))
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(idx, dummy.matrix)
        idx++
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    material.color.set(params.colorFg)
    material.opacity = 0.6 + 0.2 * Math.sin(t * 0.5)
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, totalInstances]}
      frustumCulled={false}
    />
  )
}

// ============================================================
// LAYER 2: SHADER FIELD — Q-900 on a transparent back plane
// ============================================================

const FOLD_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uFolds;
uniform float uIters;
uniform float uScale;
uniform vec3 uColorFg;
uniform vec3 uColorBg;

#define PI 3.14159265359
#define TAU 6.28318530718

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float fold(vec2 uv, float time, float folds, float iters, float sc) {
  float angle = atan(uv.y, uv.x);
  float sector = TAU / folds;
  angle = mod(angle, sector);
  if (angle > sector * 0.5) angle = sector - angle;
  float r = length(uv);
  vec2 p = r * vec2(cos(angle), sin(angle));

  float foldAngle = PI / folds + 0.1 * sin(time * 0.3);
  vec2 offset = vec2(1.0, 0.8 + 0.2 * sin(time * 0.23));
  float accum = 0.0;
  float weight = 1.0;

  for (int i = 0; i < 14; i++) {
    if (float(i) >= iters) break;
    p = abs(p);
    p = rot(foldAngle + float(i) * 0.05) * p;
    p = p * sc - offset;
    float d = min(min(abs(p.x), abs(p.y)),
                  min(abs(p.x+p.y)*0.707, min(abs(p.x-p.y)*0.707, abs(length(p)-0.5))));
    float fw = fwidth(d);
    accum += weight * smoothstep(fw * 1.5, 0.0, d);
    weight *= 0.65;
  }
  return accum;
}

void main() {
  vec2 uv = (vUv - 0.5) * 6.0;
  uv = rot(uTime * 0.1) * uv;
  float pattern = fold(uv, uTime, uFolds, uIters, uScale);
  float alpha = clamp(pattern, 0.0, 0.7);
  vec3 color = mix(uColorBg, uColorFg, clamp(pattern, 0.0, 1.0));
  gl_FragColor = vec4(color, alpha);
}
`

function ShaderField({ params }: { params: MandalaParams }) {
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: FOLD_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uFolds: { value: 6 },
        uIters: { value: 7 },
        uScale: { value: 1.8 },
        uColorFg: { value: new THREE.Color('#ffffff') },
        uColorBg: { value: new THREE.Color('#000000') },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    ;(mat as any).extensions = { derivatives: true }
    return mat
  }, [])

  useFrame((state) => {
    const u = material.uniforms
    u.uTime.value = params.animate ? state.clock.elapsedTime * params.speed : 0
    u.uFolds.value = Math.max(params.folds, 2)
    u.uIters.value = params.iters
    u.uScale.value = params.scale
    u.uColorFg.value.set(params.colorFg)
    u.uColorBg.value.set(params.colorBg || '#000000')
  })

  return (
    <>
      {/* Back plane */}
      <mesh position={[0, 0, -25]} material={material}>
        <planeGeometry args={[40, 25]} />
      </mesh>
      {/* Mid plane */}
      <mesh position={[0, 0, -12]} material={material} scale={0.6}>
        <planeGeometry args={[30, 20]} />
      </mesh>
    </>
  )
}

// ============================================================
// LAYER 3: PARTICLE FIELD — embers, dust, plasma
// ============================================================

const PARTICLE_COUNT = 2000

function ParticleField({ params }: { params: MandalaParams }) {
  const pointsRef = useRef<THREE.Points>(null!)

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const vel = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      const theta = Math.random() * Math.PI * 2
      const r = Math.random() * 15 + 1
      pos[i3] = Math.cos(theta) * r
      pos[i3 + 1] = Math.sin(theta) * r
      pos[i3 + 2] = (Math.random() - 0.5) * 40
      vel[i3] = (Math.random() - 0.5) * 0.02
      vel[i3 + 1] = (Math.random() - 0.5) * 0.02
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01
    }
    return { positions: pos, velocities: vel }
  }, [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.08,
      color: '#ffffff',
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime * params.speed
    const posAttr = geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      // Drift + swirl
      arr[i3] += velocities[i3] + Math.sin(t * 0.3 + i * 0.01) * 0.005
      arr[i3 + 1] += velocities[i3 + 1] + Math.cos(t * 0.2 + i * 0.01) * 0.005
      arr[i3 + 2] += velocities[i3 + 2]

      // Wrap around
      if (arr[i3 + 2] > 5) arr[i3 + 2] -= 45
      if (arr[i3 + 2] < -40) arr[i3 + 2] += 45
    }
    posAttr.needsUpdate = true
    material.color.set(params.colorFg)
    material.opacity = 0.3 + 0.15 * Math.sin(t * 0.7)
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}

// ============================================================
// LAYER 5: POST-PROCESSING
// ============================================================

function PostStack() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.001, 0.001)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette darkness={0.5} offset={0.3} />
    </EffectComposer>
  )
}

// ============================================================
// SCENE ASSEMBLY
// ============================================================

function MandalaWorld({ params }: { params: MandalaParams }) {
  const { camera } = useThree()

  useFrame((state) => {
    const t = state.clock.elapsedTime * params.speed * 0.3
    // Gentle camera drift for parallax
    camera.position.x = Math.sin(t * 0.5) * 0.5
    camera.position.y = Math.cos(t * 0.3) * 0.3
    camera.lookAt(0, 0, -10)
  })

  return (
    <>
      {/* Layer 4: Atmosphere */}
      <fog attach="fog" args={['#000000', 5, 35]} />
      <color attach="background" args={['#020104']} />

      {/* Ambient light for geometry */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 2]} intensity={2} color="#ffffff" />

      {/* Layer 1: Geometry Core */}
      <GeometryCore params={params} />

      {/* Layer 2: Shader Field (back planes) */}
      <ShaderField params={params} />

      {/* Layer 3: Particles */}
      <ParticleField params={params} />

      {/* Layer 5: Post-processing */}
      <PostStack />
    </>
  )
}

export function MandalaSceneCanvas({
  active,
  params,
}: {
  active: boolean
  params: MandalaParams
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 5], fov: 60, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <MandalaWorld params={params} />
    </Canvas>
  )
}
