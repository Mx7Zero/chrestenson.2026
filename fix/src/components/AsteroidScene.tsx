import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF, useAnimations, useProgress, Html } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type Triple = [number, number, number]

export type Attribution = {
  title: string
  author: string
  workUrl: string
  licenseName: string
  licenseUrl: string
}

type AsteroidSceneProps = {
  modelPath: string
  label?: string
  animated?: boolean
  autoRotate?: boolean
  autoRotateSpeed?: number
  targetSize?: number
  modelRotation?: Triple
  attribution?: Attribution
}

function StaticModel({
  modelPath,
  targetSize = 4,
  rotation = [0, 0, 0],
}: {
  modelPath: string
  targetSize?: number
  rotation?: Triple
}) {
  const { scene } = useGLTF(modelPath) as any

  const centered = useMemo(() => {
    const clone = scene.clone(true) as THREE.Object3D
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3()).length()
    const center = box.getCenter(new THREE.Vector3())
    const scale = targetSize / size
    clone.position.sub(center)
    const wrapper = new THREE.Group()
    wrapper.add(clone)
    wrapper.scale.setScalar(scale)
    wrapper.rotation.set(rotation[0], rotation[1], rotation[2])
    return wrapper
  }, [scene, targetSize, rotation])

  return <primitive object={centered} />
}

function AnimatedModel({
  modelPath,
  targetSize = 4,
  rotation = [0, 0, 0],
}: {
  modelPath: string
  targetSize?: number
  rotation?: Triple
}) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF(modelPath) as any

  // Strip position tracks so root-bone translation doesn't fly the model
  // around the scene. Skeletal rigs animate purely via rotations, so this
  // is safe for wing flapping.
  const cleanAnimations = useMemo(() => {
    return (animations as THREE.AnimationClip[]).map((clip) => {
      const tracks = clip.tracks.filter((t) => !t.name.endsWith('.position'))
      return new THREE.AnimationClip(clip.name, clip.duration, tracks)
    })
  }, [animations])

  const { actions, names } = useAnimations(cleanAnimations, group)

  useEffect(() => {
    names.forEach((name) => {
      const action = actions[name]
      if (action) action.reset().play()
    })
  }, [actions, names])

  const { offset, scale } = useMemo(() => {
    scene.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(scene)
    const sizeVec = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1
    const center = box.getCenter(new THREE.Vector3())
    const s = targetSize / maxDim
    return { offset: center.clone().multiplyScalar(-1), scale: s }
  }, [scene, targetSize])

  return (
    <group ref={group} scale={scale} rotation={rotation}>
      <group position={offset}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

function Loader({ label }: { label: string }) {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="text-xs font-mono tracking-[0.2em] uppercase text-white/60">
        LOADING {label} · {Math.round(progress)}%
      </div>
    </Html>
  )
}

export function AsteroidScene({
  modelPath,
  label = 'ASTEROID',
  animated = false,
  autoRotate = true,
  autoRotateSpeed = 0.35,
  targetSize = 4,
  modelRotation = [0, 0, 0],
  attribution,
}: AsteroidSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const el = containerRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) return
      if (!e.ctrlKey && !e.metaKey) {
        e.stopImmediatePropagation()
      }
    }
    window.addEventListener('wheel', onWheel, { capture: true })
    return () => window.removeEventListener('wheel', onWheel, { capture: true } as any)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-screen mx-[calc(50%-50vw)] h-[90vh] bg-black"
    >
      <Canvas
        shadows
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 0, 7], fov: 40, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#000000']} />
        {animated && <Environment preset="studio" background={false} />}
        <ambientLight intensity={animated ? 0.4 : 0.25} />
        <directionalLight
          position={[8, 4, 6]}
          intensity={animated ? 5.0 : 6.5}
          color={animated ? '#ffffff' : '#fff6e8'}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-6, -2, -4]}
          intensity={animated ? 1.0 : 0.4}
          color={animated ? '#ffffff' : '#5577aa'}
        />
        <directionalLight
          position={[0, 6, 0]}
          intensity={animated ? 1.0 : 0.5}
          color="#ffffff"
        />
        <Suspense fallback={<Loader label={label} />}>
          {animated ? (
            <AnimatedModel
              modelPath={modelPath}
              targetSize={targetSize}
              rotation={modelRotation}
            />
          ) : (
            <StaticModel
              modelPath={modelPath}
              targetSize={targetSize}
              rotation={modelRotation}
            />
          )}
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={25}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
        />
      </Canvas>
      <div className="pointer-events-none absolute top-6 left-6 text-[10px] font-mono tracking-[0.2em] uppercase text-white/50">
        {label}
      </div>
      {attribution && (
        <div className="absolute bottom-6 left-6 text-[10px] font-mono tracking-[0.15em] uppercase text-white/35 leading-relaxed">
          <a
            href={attribution.workUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/70 transition-colors"
          >
            {attribution.title}
          </a>
          {' · '}
          {attribution.author}
          {' · '}
          <a
            href={attribution.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/70 transition-colors"
          >
            {attribution.licenseName}
          </a>
        </div>
      )}
      <div className="pointer-events-none absolute bottom-6 right-6 text-[10px] font-mono tracking-[0.2em] uppercase text-white/40">
        DRAG TO SPIN · PINCH OR ⌃/⌘ + SCROLL TO ZOOM
      </div>
    </div>
  )
}

useGLTF.preload('/models/asteroid.glb')
