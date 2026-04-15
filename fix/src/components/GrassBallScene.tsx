import { Canvas } from '@react-three/fiber'
import { Component, Suspense, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Leva, useControls } from 'leva'
import { ConcreteSphere } from './ConcreteSphere'
import { EarthSphere } from './EarthSphere'
import { MoonSphere } from './MoonSphere'
import { MarsSphere } from './MarsSphere'
import { OrbitingSatellites } from './OrbitingSatellites'
import { SphereControls } from './SphereControls'
import type { SphereVariant } from './SphereControls'

type SectionPose = {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

// boundary so WebGL failures don't unmount the whole app
class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err: unknown) { console.warn('GrassBall canvas failed, hiding.', err) }
  render() { return this.state.failed ? null : this.props.children }
}

const POSES: SectionPose[] = [
  { id: 'hero',         position: [-1.6,  0.3,  0],   rotation: [0,  0.0, 0], scale: 1.4 },
  { id: 'credibility',  position: [ 2.8,  0.2,  0],   rotation: [0,  0.5, 0], scale: 0.7 },
  { id: 'competencies', position: [-2.8, -0.3, -1],   rotation: [0, -0.6, 0], scale: 0.9 },
  { id: 'expertise',    position: [ 2.6,  0.0, -0.5], rotation: [0,  0.8, 0], scale: 0.85 },
  { id: 'tech-stack',   position: [-2.4,  0.4, -1],   rotation: [0,  1.2, 0], scale: 0.8 },
  { id: 'contact',      position: [ 0.0,  0.0,  0],   rotation: [0,  0.0, 0], scale: 1.2 },
]

// total y rotations across the entire scroll height
const SCROLL_FULL_TURNS = 1.5

function SceneContent({
  targetRef,
  sphere,
  hidePlanet,
  hideSatellites,
}: {
  targetRef: React.RefObject<THREE.Group>
  sphere: SphereVariant
  hidePlanet: boolean
  hideSatellites: boolean
}) {
  const lights = useControls('Lighting v3', {
    useEnvironment: true,
    environmentPreset: {
      value: 'warehouse',
      options: ['park', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'lobby'],
    },
    ambient: { value: 0.0, min: 0, max: 3, step: 0.02 },
    keyIntensity: { value: 0.0, min: 0, max: 12, step: 0.1 },
    keyColor: '#ffffff',
    keyPosX: { value: -10, min: -10, max: 10, step: 0.5 },
    keyPosY: { value: -9.5, min: -10, max: 20, step: 0.5 },
    keyPosZ: { value: -10, min: -10, max: 10, step: 0.5 },
    fillIntensity: { value: 2.0, min: 0, max: 2, step: 0.05 },
  })

  return (
    <>
      {lights.useEnvironment && (
        <Environment preset={lights.environmentPreset as any} background={false} />
      )}
      <group ref={targetRef}>
        <ambientLight intensity={lights.ambient} />
        <directionalLight
          position={[lights.keyPosX, lights.keyPosY, lights.keyPosZ]}
          intensity={lights.keyIntensity}
          color={lights.keyColor}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={20}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-bias={-0.0005}
        />
        {/* tiny back-fill so the dark side isn't pure black */}
        <directionalLight
          position={[-lights.keyPosX, -lights.keyPosY * 0.3, -lights.keyPosZ]}
          intensity={lights.fillIntensity}
          color="#90a8b0"
        />
        {!hidePlanet && (
          <>
            {sphere === 'concrete' && <ConcreteSphere />}
            {sphere === 'earth' && <EarthSphere />}
            {sphere === 'moon' && <MoonSphere />}
            {sphere === 'mars' && <MarsSphere />}
          </>
        )}
        {!hideSatellites && <OrbitingSatellites />}
      </group>
    </>
  )
}

export function GrassBallScene() {
  const groupRef = useRef<THREE.Group>(null!)
  const [sphere, setSphere] = useState<SphereVariant>('mars')
  const [hidePlanet, setHidePlanet] = useState(false)
  const [hideSatellites, setHideSatellites] = useState(false)
  const post = useControls('Post v2', {
    exposure: { value: 0.0, min: 0, max: 3, step: 0.05 },
    bloomIntensity: { value: 0.0, min: 0, max: 2, step: 0.05 },
    bloomThreshold: { value: 0.0, min: 0, max: 1, step: 0.05 },
  })

  // smoothed scroll-driven values
  const targetRef = useRef({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 })
  const currentRef = useRef({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 })

  useEffect(() => {
    const computeTarget = () => {
      const sections = POSES.map(p => ({
        pose: p,
        el: document.getElementById(p.id),
      })).filter(s => s.el) as { pose: SectionPose; el: HTMLElement }[]
      if (sections.length === 0) return

      // section anchors at centre of each section
      const anchors = sections.map(s => {
        const r = s.el.getBoundingClientRect()
        return r.top + window.scrollY + r.height / 2
      })
      const scrollMid = window.scrollY + window.innerHeight / 2

      // find the two anchors bracketing scrollMid and lerp between them
      let aIdx = 0
      let bIdx = 0
      let t = 0
      if (scrollMid <= anchors[0]) {
        aIdx = bIdx = 0
      } else if (scrollMid >= anchors[anchors.length - 1]) {
        aIdx = bIdx = anchors.length - 1
      } else {
        for (let i = 0; i < anchors.length - 1; i++) {
          if (scrollMid >= anchors[i] && scrollMid <= anchors[i + 1]) {
            aIdx = i
            bIdx = i + 1
            t = (scrollMid - anchors[i]) / (anchors[i + 1] - anchors[i])
            // smoothstep so it eases at endpoints instead of linear
            t = t * t * (3 - 2 * t)
            break
          }
        }
      }

      const a = sections[aIdx].pose
      const b = sections[bIdx].pose
      const lerp = (x: number, y: number) => x + (y - x) * t

      // continuous y-rotation tied to total scroll progress
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = totalScroll > 0 ? window.scrollY / totalScroll : 0
      const rotY = scrollProgress * Math.PI * 2 * SCROLL_FULL_TURNS

      targetRef.current = {
        x: lerp(a.position[0], b.position[0]),
        y: lerp(a.position[1], b.position[1]),
        z: lerp(a.position[2], b.position[2]),
        rx: lerp(a.rotation[0], b.rotation[0]),
        ry: rotY,
        rz: lerp(a.rotation[2], b.rotation[2]),
        s: lerp(a.scale, b.scale),
      }
    }

    computeTarget()
    // seed current to target so it doesn't slide in from origin on load
    currentRef.current = { ...targetRef.current }
    if (groupRef.current) {
      groupRef.current.position.set(targetRef.current.x, targetRef.current.y, targetRef.current.z)
      groupRef.current.rotation.set(targetRef.current.rx, targetRef.current.ry, targetRef.current.rz)
      groupRef.current.scale.setScalar(targetRef.current.s)
    }

    let raf = 0
    const tick = () => {
      const g = groupRef.current
      const tgt = targetRef.current
      const cur = currentRef.current
      // critically-damped style smoothing
      const k = 0.12
      cur.x += (tgt.x - cur.x) * k
      cur.y += (tgt.y - cur.y) * k
      cur.z += (tgt.z - cur.z) * k
      cur.rx += (tgt.rx - cur.rx) * k
      cur.ry += (tgt.ry - cur.ry) * k
      cur.rz += (tgt.rz - cur.rz) * k
      cur.s += (tgt.s - cur.s) * k
      if (g) {
        g.position.set(cur.x, cur.y, cur.z)
        g.rotation.set(cur.rx, cur.ry, cur.rz)
        g.scale.setScalar(cur.s)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('scroll', computeTarget, { passive: true })
    window.addEventListener('resize', computeTarget)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', computeTarget)
      window.removeEventListener('resize', computeTarget)
    }
  }, [])

  return (
    <>
      <div id="leva-wrapper"><Leva hidden /></div>
      <div
        id="grass-ball-3d"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
      <CanvasBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 100 }}
          shadows
          gl={{
            alpha: true,
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: post.exposure,
          }}
        >
          <Suspense fallback={null}>
            <SceneContent
              targetRef={groupRef}
              sphere={sphere}
              hidePlanet={hidePlanet}
              hideSatellites={hideSatellites}
            />
            <EffectComposer>
              <Bloom
                intensity={post.bloomIntensity}
                luminanceThreshold={post.bloomThreshold}
                luminanceSmoothing={0.2}
                mipmapBlur
              />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </CanvasBoundary>
      </div>
      <SphereControls
        sphere={sphere}
        onSphereChange={setSphere}
        hidePlanet={hidePlanet}
        onHidePlanetChange={setHidePlanet}
        hideSatellites={hideSatellites}
        onHideSatellitesChange={setHideSatellites}
      />
    </>
  )
}
