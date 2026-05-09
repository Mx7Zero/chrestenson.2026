import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, useAnimations, useProgress, Html } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
// ─── LIVE PATH: mandala composition system ───
import { SuprStage } from './supr/SuprStage'
import {
  LOTUS_DEFAULTS,
  FOLD_DEFAULTS,
  STAGE_DEFAULTS,
  type LotusFieldParams,
  type FoldFieldParams,
  type StageParams,
} from './supr/types'
// Chunk 3 removed the legacy hidden mandala drawer block + the inline
// preset row, so the `MandalaCanvas` runtime exports are no longer used.
// The mandala mode itself still renders via `SuprStage` above.
import {
  TunnelCanvas,
  TUNNEL_DEFAULTS,
  type TunnelParams,
} from './TunnelCanvas'
import { PRESETS, type Preset, type TabId } from './tunnel/presets'
import { usePersistedBoolean } from './tunnel/usePersistedBoolean'
import { PresetsPanel } from './tunnel/PresetsPanel'
import { TunePanel } from './tunnel/TunePanel'
import { TransportBar } from './tunnel/TransportBar'
import { useTunnelEngine } from './tunnel/useTunnelEngine'
import { useFullscreen } from './tunnel/useFullscreen'
import { useMouseWake } from './tunnel/useMouseWake'
import { VIBES } from './tunnel/vibes'
import { sampleVariation } from './tunnel/sampler'

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
  showBackgroundSelector?: boolean
  defaultBackground?: string
  sectionId?: string
}

type PaletteEntry = {
  id: string
  css: string
  swatchCss?: string
  video?: string
}

const BACKGROUND_PALETTE: PaletteEntry[] = [
  { id: 'black', css: '#000000' },
  { id: 'white', css: '#ffffff' },
  {
    id: 'optical',
    css: '#000000',
    swatchCss: 'repeating-conic-gradient(from 0deg, #000 0 20deg, #fff 20deg 40deg)',
  },
  { id: 'red', css: '#dc2626' },
  { id: 'yellow', css: '#eab308' },
  { id: 'blue', css: '#2563eb' },
  { id: 'pink', css: '#ec4899' },
  { id: 'hibiscus', css: 'url(/backgrounds/hibiscus.png) center/cover no-repeat' },
  {
    id: 'grainy',
    css: '#000000',
    video: '/backgrounds/grainy.mp4',
    swatchCss: 'url(/backgrounds/grainy_thumb.jpg) center/cover no-repeat',
  },
]

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
  showBackgroundSelector = false,
  defaultBackground = 'black',
  sectionId,
}: AsteroidSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectorRef = useRef<HTMLDivElement>(null)
  // Chunk 7 — fullscreen showcase mode. The bird container itself is
  // the fullscreen target so the tunnel + bird canvas + transport bar
  // ride along into fullscreen. `useMouseWake` drives auto-hide of
  // the transport bar inside fullscreen; outside, the chrome is
  // always visible so we ignore it.
  const fullscreen = useFullscreen(containerRef)
  const mouseAwake = useMouseWake(2500)
  const [inView, setInView] = useState(false)
  const [bgIndex, setBgIndex] = useState(() =>
    Math.max(0, BACKGROUND_PALETTE.findIndex((b) => b.id === defaultBackground)),
  )
  const [bgOpen, setBgOpen] = useState(false)
  // Chunk 4 — engine owns morph state, paramsRef, demo cycle. The
  // initial seed comes from localStorage if present so the bird-section
  // tunnel re-renders with the user's last setup.
  const initialTunnelParams = useMemo<TunnelParams>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('asteroidScene.tunnelParams')
        if (saved) {
          return { ...TUNNEL_DEFAULTS, ...JSON.parse(saved) }
        }
      } catch {
        /* fall through to defaults */
      }
    }
    return TUNNEL_DEFAULTS
  }, [])
  const engine = useTunnelEngine(initialTunnelParams)
  // ─── Chunk 3 — split TUNE drawer into PresetsPanel + TunePanel ───
  // First-visit default: open on desktop (>= 1024px), closed on mobile.
  // After the first visit, `usePersistedBoolean` round-trips through
  // `localStorage` so the user's choice survives reloads.
  // Chunk 4 cleanup — replaced the `useRef` + init-block (which was
  // order-dependent on `usePersistedBoolean` calls landing after it)
  // with a one-shot lazy `useState` initializer. Order-independent.
  const [isDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1024px)').matches
      : true,
  )
  const [presetsOpen, setPresetsOpen] = usePersistedBoolean(
    'chrestenson.tunnel.presetsOpen',
    isDesktop,
  )
  const [tuneOpen, setTuneOpen] = usePersistedBoolean(
    'chrestenson.tunnel.tuneOpen',
    isDesktop,
  )
  const [activeTab, setActiveTab] = useState<TabId>('signature')
  // Active preset comes from the engine. Fall back to PRESETS[0] for
  // the initial render so chrome (now-playing line, preset highlight)
  // has a sensible default before any click.
  const activePreset = engine.activePreset ?? PRESETS[0]
  const [hideModel, setHideModel] = useState(false)
  const [visualMode, setVisualMode] = useState<'tunnel' | 'mandala'>('tunnel')
  // Per-module state for the SUPR composition system. Setters are unused
  // in chunk 3 (the per-module SUPR control panel was removed when the
  // combined drawer was split). Setters land back on the panel in a later
  // chunk; until then we keep state but suppress the unused-vars warning.
  const [lotusParams] = useState<LotusFieldParams>(LOTUS_DEFAULTS)
  const [foldParams] = useState<FoldFieldParams>(FOLD_DEFAULTS)
  const [stageParams] = useState<StageParams>(STAGE_DEFAULTS)

  // Persist the morph target (staticParams) — that's the resolved
  // preset state, which is what we want to restore on next visit.
  // The lerped per-frame values would be a snapshot mid-morph, which
  // is wrong to persist.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        'asteroidScene.tunnelParams',
        JSON.stringify(engine.staticParams),
      )
    } catch {
      /* storage may be unavailable — ignore */
    }
  }, [engine.staticParams])
  const currentBg = BACKGROUND_PALETTE[bgIndex]

  useEffect(() => {
    if (!bgOpen) return
    const onClick = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setBgOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [bgOpen])

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
      id={sectionId}
      ref={containerRef}
      className="relative w-screen mx-[calc(50%-50vw)] h-[90vh] overflow-hidden"
      style={{ background: currentBg.css }}
    >
      {currentBg.video && (
        <video
          key={currentBg.video}
          className="absolute inset-0 w-full h-full object-cover"
          src={currentBg.video}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      {/* ─── LIVE PATH: tunnel mode ─── */}
      {currentBg.id === 'optical' && visualMode === 'tunnel' && (
        <TunnelCanvas
          active={inView}
          params={engine.staticParams}
          paramsRef={engine.paramsRef}
        />
      )}
      {/* ─── LIVE PATH: mandala mode (SuprStage → LotusField baseline + FoldField candidate) ─── */}
      {currentBg.id === 'optical' && visualMode === 'mandala' && (
        <SuprStage
          active={inView}
          stage={stageParams}
          lotus={lotusParams}
          fold={foldParams}
        />
      )}
      <Canvas
        shadows
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 0, 7], fov: 40, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
      >
        {animated ? (
          <>
            {/* Single directional light aimed at the bird from the tunnel's
                vanishing point — no ambient, no environment, no fill. */}
            <directionalLight
              position={[0, 0, 10]}
              intensity={12}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
          </>
        ) : (
          <>
            <ambientLight intensity={0.25} />
            <directionalLight
              position={[8, 4, 6]}
              intensity={6.5}
              color="#fff6e8"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight position={[-6, -2, -4]} intensity={0.4} color="#5577aa" />
            <directionalLight position={[0, 6, 0]} intensity={0.5} color="#ffffff" />
          </>
        )}
        {!hideModel && (
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
        )}
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
      <div
        className="pointer-events-none absolute top-6 left-6 text-[10px] font-mono tracking-[0.2em] uppercase text-white/50"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
      >
        {label}
      </div>
      {showBackgroundSelector && (
        <div
          ref={selectorRef}
          className="absolute top-6 right-6"
          style={{ zIndex: 2 }}
        >
          <button
            onClick={() => setBgOpen((v) => !v)}
            aria-label="background selector"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 5,
              background: 'rgba(0, 0, 0, 0.55)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 0,
              cursor: 'pointer',
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'block',
                width: 22,
                height: 22,
                background: currentBg.swatchCss ?? currentBg.css,
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            />
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              aria-hidden
              style={{
                transform: bgOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
                marginRight: 4,
              }}
            >
              <path d="M0 0l5 6 5-6z" fill="#ffffff" fillOpacity="0.8" />
            </svg>
          </button>
          {bgOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: 5,
                background: 'rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 0,
              }}
            >
              {BACKGROUND_PALETTE.map((bg, i) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    setBgIndex(i)
                    setBgOpen(false)
                  }}
                  aria-label={bg.id}
                  style={{
                    width: 22,
                    height: 22,
                    background: bg.swatchCss ?? bg.css,
                    border:
                      i === bgIndex
                        ? '1.5px solid #ffffff'
                        : '1px solid rgba(255,255,255,0.4)',
                    borderRadius: 0,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {attribution && (
        <div
          className="absolute bottom-6 left-6 text-[10px] font-mono tracking-[0.15em] uppercase text-white/35 leading-relaxed"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
        >
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
      <div
        className="pointer-events-none absolute bottom-6 right-6 text-[10px] font-mono tracking-[0.2em] uppercase text-white/40"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
      >
        DRAG TO SPIN · PINCH OR ⌃/⌘ + SCROLL TO ZOOM
      </div>
      {showBackgroundSelector && currentBg.id === 'optical' && sectionId === 'bird' && (
        <>
          {/* PRESETS + TUNE panels — stacked vertical on the right edge */}
          <div
            className="absolute top-1/2 right-0"
            style={{
              zIndex: 2,
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'flex-end',
              maxHeight: '78vh',
            }}
          >
            <PresetsPanel
              open={presetsOpen}
              onToggle={() => setPresetsOpen(!presetsOpen)}
              activeTab={activeTab}
              presets={PRESETS}
              activePresetId={activePreset.id}
              onTabClick={(t) => {
                // Chunk 4: switching tabs stops the demo cycle. The
                // current preset stays loaded; the new tab simply
                // lights up empty until the user picks something.
                if (engine.demoActive) engine.stopDemo()
                setActiveTab(t)
              }}
              onPresetClick={(p) => {
                // Chunk 4 — 600ms morph through useTunnelEngine.
                // applyPreset() also stops any active demo, so a
                // manual click commandeers the cycle as expected.
                engine.applyPreset(p, 600)
              }}
              hidden={fullscreen.active}
            />
            <TunePanel
              open={tuneOpen}
              onToggle={() => setTuneOpen(!tuneOpen)}
              tunnelParams={engine.staticParams}
              setTunnelParams={engine.setParams}
              hideModel={hideModel}
              setHideModel={setHideModel}
              visualMode={visualMode}
              setVisualMode={setVisualMode}
              hidden={fullscreen.active}
            />
          </div>
          <TransportBar
            nowPlayingName={activePreset.name}
            paletteName={activePreset.paletteName}
            activePresetValues={activePreset.values}
            demoActive={engine.demoActive}
            onDemoToggle={() => {
              if (engine.demoActive) {
                engine.stopDemo()
              } else {
                // Cycle the active tab's user-facing presets.
                const cycle = PRESETS.filter(
                  (p) =>
                    p.tab === activeTab && !p.id.includes('.__validate-'),
                )
                if (cycle.length > 0) engine.startDemo(cycle, 8000)
              }
            }}
            // Chunk 8 — ⟲ VARIATION samples a transient preset from
            // the active tab's vibe constraint and morphs into it
            // through the same path as a catalog preset click. MY
            // SET is virtual (no constraint), so the button disables
            // on that tab. Variation autoflags `flashWarn` for RAVE/
            // GLITCH and for any sample that lands on heavy chroma
            // or high strobe (chunk 9 picks up the actual gate).
            onVariationClick={
              activeTab === 'myset'
                ? undefined
                : () => {
                    const tab = activeTab as Exclude<TabId, 'myset'>
                    const constraint = VIBES[tab]
                    const sample = sampleVariation(constraint)
                    const paletteMatch = constraint.paletteOptions.find(
                      (p) =>
                        p.colorA === sample.colorA &&
                        p.colorB === sample.colorB,
                    )
                    const transient: Preset = {
                      id: `variation.${tab}.${Date.now()}`,
                      tab,
                      name: 'Variation',
                      paletteName: paletteMatch?.name ?? 'Variation',
                      values: sample,
                      flashWarn:
                        tab === 'rave' ||
                        tab === 'glitch' ||
                        (sample.strobeRate ?? 0) > 2 ||
                        (sample.chromatic ?? 0) > 0.4,
                    }
                    engine.applyPreset(transient, 600)
                  }
            }
            variationDisabled={activeTab === 'myset'}
            fullscreenActive={fullscreen.active}
            onFullscreenToggle={() => {
              // Chunk 7 — gesture-gated. `requestFullscreen` only
              // resolves inside a user-initiated handler, which a
              // React onClick satisfies. ESC exit is browser-handled.
              if (fullscreen.active) fullscreen.exit()
              else fullscreen.enter()
            }}
            visible={!fullscreen.active || mouseAwake}
          />
        </>
      )}
    </div>
  )
}

useGLTF.preload('/models/asteroid.glb')
