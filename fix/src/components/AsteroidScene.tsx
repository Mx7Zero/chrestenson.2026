import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, useAnimations, useProgress, Html } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { SuprStage } from './supr/SuprStage'
import {
  LOTUS_DEFAULTS,
  FOLD_DEFAULTS,
  STAGE_DEFAULTS,
  type LotusFieldParams,
  type FoldFieldParams,
  type StageParams,
} from './supr/types'
import {
  MANDALA_PRESETS,
  type MandalaParams,
  MANDALA_DEFAULTS,
} from './MandalaCanvas'
import {
  TunnelCanvas,
  TUNNEL_DEFAULTS,
  TUNNEL_PRESETS,
  STROBE_PRESETS,
  COLOR_PALETTES,
  TEST_IMAGES,
  PATTERNS,
  type TunnelParams,
} from './TunnelCanvas'

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

function presetMatches<T extends Record<string, unknown>>(
  state: T,
  values: Partial<T>,
) {
  return Object.entries(values).every(([key, value]) => {
    const current = state[key as keyof T]
    if (typeof current === 'number' && typeof value === 'number') {
      return Math.abs(current - value) < 0.000001
    }
    if (typeof current === 'string' && typeof value === 'string') {
      return current.toLowerCase() === value.toLowerCase()
    }
    return current === value
  })
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

function ModuleHeader({ title, enabled, solo, onToggle, onSolo }: {
  title: string
  enabled?: boolean
  solo?: boolean
  onToggle?: () => void
  onSolo?: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, paddingBottom: 4,
      borderBottom: '1px solid rgba(255,255,255,0.12)',
    }}>
      <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
        {title}
      </span>
      {onToggle && (
        <button onClick={onToggle} style={{
          padding: '4px 10px', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold',
          background: enabled ? 'rgba(80,200,120,0.35)' : 'rgba(255,60,60,0.25)',
          border: `1.5px solid ${enabled ? 'rgba(80,200,120,0.6)' : 'rgba(255,60,60,0.4)'}`,
          color: enabled ? '#6f6' : '#f66', cursor: 'pointer', letterSpacing: '0.15em',
        }}>{enabled ? '● ON' : '○ OFF'}</button>
      )}
      {onSolo && (
        <button onClick={onSolo} style={{
          padding: '4px 8px', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold',
          background: solo ? 'rgba(255,200,0,0.35)' : 'transparent',
          border: `1.5px solid ${solo ? 'rgba(255,200,0,0.6)' : 'rgba(255,255,255,0.15)'}`,
          color: solo ? '#ff0' : 'rgba(255,255,255,0.35)', cursor: 'pointer', letterSpacing: '0.15em',
        }}>SOLO</button>
      )}
    </div>
  )
}

const stepperBtnStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  padding: 0,
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.25)',
  color: 'rgba(255,255,255,0.8)',
  fontFamily: 'monospace',
  fontSize: 10,
  lineHeight: '16px',
  textAlign: 'center',
  cursor: 'pointer',
}

function TuneRow({
  label,
  min,
  max,
  step,
  value,
  onChange,
  stepper,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  stepper?: boolean
}) {
  const fmt = step < 0.01 ? 3 : step < 1 ? 2 : 0
  return (
    <>
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'rgba(255,255,255,0.85)' }}
      />
      {stepper ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <button
            style={stepperBtnStyle}
            onClick={() => onChange(Math.max(min, +(value - step).toFixed(6)))}
          >
            ◂
          </button>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              color: 'rgba(255,255,255,0.55)',
              minWidth: 30,
              textAlign: 'center',
            }}
          >
            {value.toFixed(fmt)}
          </span>
          <button
            style={stepperBtnStyle}
            onClick={() => onChange(Math.min(max, +(value + step).toFixed(6)))}
          >
            ▸
          </button>
        </span>
      ) : (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 9,
            color: 'rgba(255,255,255,0.55)',
            minWidth: 36,
            textAlign: 'right',
          }}
        >
          {value.toFixed(fmt)}
        </span>
      )}
    </>
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
  const [inView, setInView] = useState(false)
  const [bgIndex, setBgIndex] = useState(() =>
    Math.max(0, BACKGROUND_PALETTE.findIndex((b) => b.id === defaultBackground)),
  )
  const [bgOpen, setBgOpen] = useState(false)
  const [tunnelParams, setTunnelParams] = useState<TunnelParams>(() => {
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
  })
  const [tunePanelOpen, setTunePanelOpen] = useState(false)
  const [tuneTab, setTuneTab] = useState<'play' | 'design'>('play')
  const [moduleTab, setModuleTab] = useState<'stage' | 'lotus' | 'q900'>('stage')
  const [hideModel, setHideModel] = useState(false)
  const [visualMode, setVisualMode] = useState<'tunnel' | 'mandala'>('tunnel')
  const [mandalaParams, setMandalaParams] = useState<MandalaParams>(MANDALA_DEFAULTS)
  // Per-module state for the composition system
  const [lotusParams, _setLotus] = useState<LotusFieldParams>(LOTUS_DEFAULTS)
  const [foldParams, _setFold] = useState<FoldFieldParams>(FOLD_DEFAULTS)
  const [stageParams, _setStage] = useState<StageParams>(STAGE_DEFAULTS)
  // Expose setters for panel use
  const setLotusParams = _setLotus
  const setFoldParams = _setFold
  const setStageParams = _setStage
  void setLotusParams; void setFoldParams; void setStageParams

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        'asteroidScene.tunnelParams',
        JSON.stringify(tunnelParams),
      )
    } catch {
      /* storage may be unavailable — ignore */
    }
  }, [tunnelParams])
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
      {currentBg.id === 'optical' && visualMode === 'tunnel' && (
        <TunnelCanvas active={inView} params={tunnelParams} />
      )}
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
      {showBackgroundSelector && currentBg.id === 'optical' && (
        <div
          className="absolute top-1/2 right-0 flex items-stretch"
          style={{ zIndex: 2, transform: 'translateY(-50%)' }}
        >
          {/* Module tabs — LEFT side of drawer, outside the panel */}
          {visualMode === 'mandala' && tunePanelOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignSelf: 'stretch', background: 'rgba(0,0,0,0.85)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              {([
                { id: 'stage' as const, label: 'STG', dot: null },
                { id: 'lotus' as const, label: 'LTS', dot: lotusParams.enabled ? '#4f4' : '#f44' },
                { id: 'q900' as const, label: 'Q9', dot: foldParams.enabled ? '#4f4' : '#f44' },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setModuleTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    fontFamily: 'monospace',
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    background: moduleTab === tab.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: 'none',
                    borderRight: moduleTab === tab.id ? '2px solid #fff' : '2px solid transparent',
                    color: moduleTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {tab.dot && <span style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%) rotate(180deg)', width: 5, height: 5, borderRadius: '50%', background: tab.dot }} />}
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          <div
            style={{
              overflow: 'hidden',
              width: tunePanelOpen ? 480 : 0,
              transition: 'width 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                background: 'rgba(0,0,0,0.82)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRight: 'none',
                padding: '14px 18px',
                width: 480,
                maxHeight: '80vh',
                overflowY: 'auto',
                boxSizing: 'border-box',
              }}
            >
              {/* Tab switcher */}
              <div
                style={{
                  display: 'flex',
                  gap: 0,
                  marginBottom: 10,
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {(['play', 'design'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTuneTab(tab)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      background:
                        tuneTab === tab
                          ? 'rgba(255,255,255,0.15)'
                          : 'transparent',
                      border: 'none',
                      borderRight:
                        tab === 'play'
                          ? '1px solid rgba(255,255,255,0.2)'
                          : 'none',
                      color:
                        tuneTab === tab
                          ? '#ffffff'
                          : 'rgba(255,255,255,0.5)',
                      fontFamily: 'monospace',
                      fontSize: 10,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {tab === 'play' ? '▶ PLAY' : '◆ DESIGN'}
                  </button>
                ))}
              </div>

              {/* --- PLAY TAB --- */}
              <div style={{ display: tuneTab === 'play' ? 'block' : 'none' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  columnGap: 12,
                  rowGap: 8,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  DIRECTION
                </span>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  {([1, -1] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() =>
                        setTunnelParams((p) => ({ ...p, direction: d }))
                      }
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        background:
                          tunnelParams.direction === d
                            ? 'rgba(255,255,255,0.18)'
                            : 'transparent',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color:
                          tunnelParams.direction === d
                            ? '#ffffff'
                            : 'rgba(255,255,255,0.55)',
                        fontFamily: 'monospace',
                        fontSize: 10,
                        letterSpacing: '0.25em',
                        cursor: 'pointer',
                      }}
                    >
                      {d === 1 ? '▶ FWD' : 'REV ◀'}
                    </button>
                  ))}
                </div>
                <span style={{ minWidth: 36 }} />

                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  BIRD
                </span>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  {([false, true] as const).map((hidden) => (
                    <button
                      key={String(hidden)}
                      onClick={() => setHideModel(hidden)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        background:
                          hideModel === hidden
                            ? 'rgba(255,255,255,0.18)'
                            : 'transparent',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color:
                          hideModel === hidden
                            ? '#ffffff'
                            : 'rgba(255,255,255,0.55)',
                        fontFamily: 'monospace',
                        fontSize: 10,
                        letterSpacing: '0.25em',
                        cursor: 'pointer',
                      }}
                    >
                      {hidden ? 'HIDE' : 'SHOW'}
                    </button>
                  ))}
                </div>
                <span style={{ minWidth: 36 }} />

                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  MODE
                </span>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  {(['tunnel', 'mandala'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setVisualMode(m)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        background:
                          visualMode === m
                            ? 'rgba(255,255,255,0.18)'
                            : 'transparent',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color:
                          visualMode === m
                            ? '#ffffff'
                            : 'rgba(255,255,255,0.55)',
                        fontFamily: 'monospace',
                        fontSize: 10,
                        letterSpacing: '0.25em',
                        cursor: 'pointer',
                      }}
                    >
                      {m === 'tunnel' ? '◉ TUNNEL' : '✦ MANDALA'}
                    </button>
                  ))}
                </div>
                <span style={{ minWidth: 36 }} />
              </div>

              {/* === SUPR COMPOSITION SYSTEM === */}
              {visualMode === 'mandala' && (
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* ─── STAGE ─── */}
                    {moduleTab === 'stage' && (
                      <div>
                        <ModuleHeader title="STAGE" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', columnGap: 10, rowGap: 8, alignItems: 'center' }}>
                          <TuneRow label="DRIFT" min={0} max={2} step={0.05} stepper value={stageParams.cameraDrift} onChange={(v) => setStageParams((p) => ({ ...p, cameraDrift: v }))} />
                          <TuneRow label="SPEED" min={0.1} max={3} step={0.05} stepper value={stageParams.masterSpeed} onChange={(v) => setStageParams((p) => ({ ...p, masterSpeed: v }))} />
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                            BG <input type="color" value={stageParams.background} onChange={(e) => setStageParams((p) => ({ ...p, background: e.target.value }))} style={{ width: 28, height: 18, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* ─── LOTUS ─── */}
                    {moduleTab === 'lotus' && (
                      <div>
                        <ModuleHeader title="LOTUS FIELD" enabled={lotusParams.enabled} solo={lotusParams.solo}
                          onToggle={() => setLotusParams((p) => ({ ...p, enabled: !p.enabled }))}
                          onSolo={() => setLotusParams((p) => ({ ...p, solo: !p.solo }))} />
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 6 }}>
                          {(['seedOfLife','flowerOfLife','metatron','sriYantra','hexGrid','concentricRings'] as const).map((pat) => (
                            <button key={pat} onClick={() => setLotusParams((p) => ({ ...p, pattern: pat }))}
                              style={{ padding: '3px 5px', fontSize: 7, fontFamily: 'monospace', letterSpacing: '0.1em',
                                background: lotusParams.pattern === pat ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.04)',
                                border: lotusParams.pattern === pat ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                                color: lotusParams.pattern === pat ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                              {pat.replace(/([A-Z])/g, ' $1').trim().toUpperCase().slice(0,8)}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                            FG <input type="color" value={lotusParams.colorFg} onChange={(e) => setLotusParams((p) => ({ ...p, colorFg: e.target.value }))} style={{ width: 28, height: 18, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                            BG <input type="color" value={lotusParams.colorBg} onChange={(e) => setLotusParams((p) => ({ ...p, colorBg: e.target.value }))} style={{ width: 28, height: 18, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                          </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', columnGap: 10, rowGap: 8, alignItems: 'center' }}>
                          <TuneRow label="OPACITY" min={0} max={1} step={0.02} stepper value={lotusParams.opacity} onChange={(v) => setLotusParams((p) => ({ ...p, opacity: v }))} />
                          <TuneRow label="FOLDS" min={0} max={24} step={1} stepper value={lotusParams.folds} onChange={(v) => setLotusParams((p) => ({ ...p, folds: v }))} />
                          <TuneRow label="SPEED" min={0} max={1} step={0.01} stepper value={lotusParams.speed} onChange={(v) => setLotusParams((p) => ({ ...p, speed: v }))} />
                          <TuneRow label="ZOOM" min={0.5} max={8} step={0.1} stepper value={lotusParams.zoom} onChange={(v) => setLotusParams((p) => ({ ...p, zoom: v }))} />
                          <TuneRow label="LINE" min={0.5} max={6} step={0.1} stepper value={lotusParams.lineWidth} onChange={(v) => setLotusParams((p) => ({ ...p, lineWidth: v }))} />
                          <TuneRow label="GLOW" min={0} max={1} step={0.02} stepper value={lotusParams.glow} onChange={(v) => setLotusParams((p) => ({ ...p, glow: v }))} />
                          <TuneRow label="Z-DEPTH" min={-30} max={0} step={0.5} stepper value={lotusParams.zDepth} onChange={(v) => setLotusParams((p) => ({ ...p, zDepth: v }))} />
                        </div>
                      </div>
                    )}

                    {/* ─── Q-900 FOLD ─── */}
                    {moduleTab === 'q900' && (
                      <div>
                        <ModuleHeader title="Q-900 FOLD" enabled={foldParams.enabled} solo={foldParams.solo}
                          onToggle={() => setFoldParams((p) => ({ ...p, enabled: !p.enabled }))}
                          onSolo={() => setFoldParams((p) => ({ ...p, solo: !p.solo }))} />
                        {/* Fold Type */}
                        <div style={{ fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 2, letterSpacing: '0.2em', textTransform: 'uppercase' }}>FOLD</div>
                        <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
                          {(['abs', 'inversion', 'hybrid'] as const).map((m) => (
                            <button key={m} onClick={() => setFoldParams((prev) => ({ ...prev, foldType: m }))}
                              style={{ flex: 1, padding: '3px 0', fontSize: 7, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
                                background: foldParams.foldType === m ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)',
                                border: foldParams.foldType === m ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.12)',
                                color: foldParams.foldType === m ? '#fff' : 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
                              {m}
                            </button>
                          ))}
                        </div>
                        {/* Fill Mode */}
                        <div style={{ fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 2, letterSpacing: '0.2em', textTransform: 'uppercase' }}>FILL</div>
                        <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
                          {(['edge', 'fill', 'gradient', 'stripe'] as const).map((m) => (
                            <button key={m} onClick={() => setFoldParams((prev) => ({ ...prev, fillMode: m }))}
                              style={{ flex: 1, padding: '3px 0', fontSize: 7, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
                                background: foldParams.fillMode === m ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)',
                                border: foldParams.fillMode === m ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.12)',
                                color: foldParams.fillMode === m ? '#fff' : 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
                              {m}
                            </button>
                          ))}
                        </div>
                        {/* Color Strategy */}
                        <div style={{ fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 2, letterSpacing: '0.2em', textTransform: 'uppercase' }}>COLOR</div>
                        <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
                          {(['mono', 'spectrum', 'depth', 'angular', 'distance'] as const).map((m) => (
                            <button key={m} onClick={() => setFoldParams((prev) => ({ ...prev, colorStrategy: m }))}
                              style={{ flex: 1, padding: '3px 0', fontSize: 7, fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'uppercase',
                                background: foldParams.colorStrategy === m ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)',
                                border: foldParams.colorStrategy === m ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.12)',
                                color: foldParams.colorStrategy === m ? '#fff' : 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
                              {m.slice(0,5)}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                            FG <input type="color" value={foldParams.colorFg} onChange={(e) => setFoldParams((p) => ({ ...p, colorFg: e.target.value }))} style={{ width: 28, height: 18, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                            BG <input type="color" value={foldParams.colorBg} onChange={(e) => setFoldParams((p) => ({ ...p, colorBg: e.target.value }))} style={{ width: 28, height: 18, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                          </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', columnGap: 10, rowGap: 8, alignItems: 'center' }}>
                          <TuneRow label="OPACITY" min={0} max={1} step={0.02} stepper value={foldParams.opacity} onChange={(v) => setFoldParams((p) => ({ ...p, opacity: v }))} />
                          <TuneRow label="FOLDS" min={2} max={24} step={1} stepper value={foldParams.folds} onChange={(v) => setFoldParams((p) => ({ ...p, folds: v }))} />
                          <TuneRow label="ITERS" min={2} max={14} step={1} stepper value={foldParams.iters} onChange={(v) => setFoldParams((p) => ({ ...p, iters: v }))} />
                          <TuneRow label="SPEED" min={0} max={1} step={0.01} stepper value={foldParams.speed} onChange={(v) => setFoldParams((p) => ({ ...p, speed: v }))} />
                          <TuneRow label="ZOOM" min={0.5} max={6} step={0.1} stepper value={foldParams.zoom} onChange={(v) => setFoldParams((p) => ({ ...p, zoom: v }))} />
                          <TuneRow label="SCALE" min={1.2} max={2.5} step={0.02} stepper value={foldParams.scale} onChange={(v) => setFoldParams((p) => ({ ...p, scale: v }))} />
                          <TuneRow label="DRIFT" min={0} max={0.3} step={0.005} stepper value={foldParams.drift} onChange={(v) => setFoldParams((p) => ({ ...p, drift: v }))} />
                          <TuneRow label="LN DECAY" min={0.3} max={1} step={0.02} stepper value={foldParams.lineWidthDecay} onChange={(v) => setFoldParams((p) => ({ ...p, lineWidthDecay: v }))} />
                          <TuneRow label="FILL WT" min={0} max={1} step={0.02} stepper value={foldParams.fillWeight} onChange={(v) => setFoldParams((p) => ({ ...p, fillWeight: v }))} />
                          <TuneRow label="Z-DEPTH" min={-30} max={0} step={0.5} stepper value={foldParams.zDepth} onChange={(v) => setFoldParams((p) => ({ ...p, zDepth: v }))} />
                        </div>
                      </div>
                    )}

                  </div>
              )}

              {/* === LEGACY: old mandala controls (keeping for reference, hidden) === */}
              {false && visualMode === 'mandala' && (
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 5 }}>ANIMATION</div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                    {([true, false] as const).map((animate) => (
                      <button
                        key={String(animate)}
                        onClick={() => setMandalaParams((prev) => ({ ...prev, animate }))}
                        style={{
                          flex: 1,
                          padding: '5px 0',
                          fontSize: 9,
                          fontFamily: 'monospace',
                          letterSpacing: '0.15em',
                          background: mandalaParams.animate === animate ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                          border: mandalaParams.animate === animate ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                          color: mandalaParams.animate === animate ? '#fff' : 'rgba(255,255,255,0.6)',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        {animate ? 'LIVE' : 'FREEZE'}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 5 }}>COLOR MODE</div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                    {(['mono', 'spectrum'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMandalaParams((prev) => ({ ...prev, colorMode: m }))}
                        style={{
                          flex: 1, padding: '5px 0', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.15em',
                          background: mandalaParams.colorMode === m ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                          border: mandalaParams.colorMode === m ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                          color: mandalaParams.colorMode === m ? '#fff' : 'rgba(255,255,255,0.6)',
                          cursor: 'pointer', textTransform: 'uppercase',
                        }}
                      >{m}</button>
                    ))}
                  </div>

                  <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 5 }}>PRESETS</div>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 10 }}>
                    {MANDALA_PRESETS.map((p) => {
                      const active = presetMatches(mandalaParams, p.values)
                      return (
                        <button
                          key={p.name}
                          onClick={() => setMandalaParams((prev) => ({ ...prev, ...p.values }))}
                          style={{
                            padding: '3px 6px',
                            background: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
                            border: active ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.18)',
                            color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                            boxShadow: active ? '0 0 0 1px rgba(255,255,255,0.08), 0 0 18px rgba(255,255,255,0.16)' : 'none',
                            fontFamily: 'monospace',
                            fontSize: 7,
                            letterSpacing: '0.12em',
                            cursor: 'pointer',
                          }}
                        >
                          {p.name}
                        </button>
                      )
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      FG <input type="color" value={mandalaParams.colorFg} onChange={(e) => setMandalaParams((p) => ({ ...p, colorFg: e.target.value }))} style={{ width: 36, height: 20, border: '1px solid rgba(255,255,255,0.25)', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      BG <input type="color" value={mandalaParams.colorBg} onChange={(e) => setMandalaParams((p) => ({ ...p, colorBg: e.target.value }))} style={{ width: 36, height: 20, border: '1px solid rgba(255,255,255,0.25)', background: 'transparent', padding: 0, cursor: 'pointer' }} />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', columnGap: 12, rowGap: 10, alignItems: 'center' }}>
                    {([
                      { key: 'folds', label: 'FOLDS', min: 3, max: 18, step: 1 },
                      { key: 'iters', label: 'ITERS', min: 2, max: 14, step: 1 },
                      { key: 'speed', label: 'SPEED', min: 0, max: 0.35, step: 0.005 },
                      { key: 'zoom', label: 'ZOOM', min: 1.1, max: 4.5, step: 0.05 },
                      { key: 'scale', label: 'SCALE', min: 1.35, max: 2.25, step: 0.01 },
                      { key: 'lineWidth', label: 'LINES', min: 0.5, max: 2.4, step: 0.05 },
                      { key: 'fill', label: 'FILL', min: 0, max: 1, step: 0.02 },
                      { key: 'glow', label: 'GLOW', min: 0.1, max: 2.2, step: 0.05 },
                      { key: 'warp', label: 'WARP', min: 0, max: 1.3, step: 0.02 },
                      { key: 'twist', label: 'TWIST', min: 0, max: 1.2, step: 0.02 },
                      { key: 'depth', label: 'DEPTH', min: 0, max: 1.2, step: 0.02 },
                      { key: 'particles', label: 'PARTICLES', min: 0, max: 1, step: 0.02 },
                      { key: 'bloom', label: 'BLOOM', min: 0, max: 2, step: 0.05 },
                      { key: 'layerSpread', label: 'SPREAD', min: 1.2, max: 1.9, step: 0.01 },
                      { key: 'contrast', label: 'CONTRAST', min: 0.75, max: 1.5, step: 0.01 },
                      { key: 'pulse', label: 'PULSE', min: 0, max: 0.6, step: 0.02 },
                      { key: 'strobeRate', label: 'STROBE', min: 0, max: 20, step: 0.5 },
                      { key: 'strobeDuty', label: 'FLASH', min: 0.05, max: 0.95, step: 0.05 },
                    ] as const).map((k) => (
                      <TuneRow
                        key={k.key}
                        label={k.label}
                        min={k.min}
                        max={k.max}
                        step={k.step}
                        value={mandalaParams[k.key]}
                        stepper
                        onChange={(v) => setMandalaParams((p) => ({ ...p, [k.key]: v }))}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setMandalaParams(MANDALA_DEFAULTS)}
                    style={{ width: '100%', marginTop: 10, padding: '6px 0', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}
                  >RESET</button>
                </div>
              )}

              {/* === TUNNEL CONTROLS (hidden when mandala is active) === */}
              {visualMode === 'tunnel' && (<>

              {/* Pattern presets */}
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 9,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)',
                    marginBottom: 5,
                  }}
                >
                  PRESETS
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {TUNNEL_PRESETS.map((p) => {
                    const active = presetMatches(tunnelParams, p.values)
                    return (
                      <button
                        key={p.name}
                        onClick={() =>
                          setTunnelParams((prev) => ({ ...prev, ...p.values }))
                        }
                        style={{
                          padding: '4px 8px',
                          background: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
                          border: active ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                          color: active ? '#ffffff' : 'rgba(255,255,255,0.75)',
                          boxShadow: active ? '0 0 0 1px rgba(255,255,255,0.08), 0 0 18px rgba(255,255,255,0.16)' : 'none',
                          fontFamily: 'monospace',
                          fontSize: 8,
                          letterSpacing: '0.15em',
                          cursor: 'pointer',
                        }}
                      >
                        {p.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* PLAY tab: motion sliders + strobe */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  columnGap: 12,
                  rowGap: 10,
                  alignItems: 'center',
                }}
              >
                {(
                  [
                    { key: 'speed', label: 'SPEED', min: 0, max: 1.5, step: 0.01, stepper: true },
                    { key: 'roll', label: 'ROLL', min: -12, max: 12, step: 0.1, stepper: true },
                    { key: 'wobble', label: 'WOBBLE', min: 0, max: 1.8, step: 0.05, stepper: true },
                    { key: 'fov', label: 'FOV', min: 30, max: 140, step: 1, stepper: true },
                    { key: 'fogFar', label: 'DEPTH', min: 8, max: 120, step: 1, stepper: true },
                    { key: 'strobeRate', label: 'STROBE', min: 0, max: 20, step: 0.5, stepper: true },
                    { key: 'strobeDuty', label: 'FLASH', min: 0.05, max: 0.95, step: 0.05, stepper: true },
                  ] as const
                ).map((k) => (
                  <TuneRow
                    key={k.key}
                    label={k.label}
                    min={k.min}
                    max={k.max}
                    step={k.step}
                    value={tunnelParams[k.key]}
                    stepper={'stepper' in k && !!(k as any).stepper}
                    onChange={(v) =>
                      setTunnelParams((p) => ({ ...p, [k.key]: v }))
                    }
                  />
                ))}
              </div>
              {/* Transparency */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', marginBottom: 3, textTransform: 'uppercase' }}>TRANSPARENT CELL</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {([{ v: 'none' as const, l: 'OFF' }, { v: 'a' as const, l: 'A' }, { v: 'b' as const, l: 'B' }]).map((t) => (
                    <button
                      key={t.v}
                      onClick={() => setTunnelParams((p) => ({ ...p, transparentCell: t.v }))}
                      style={{
                        flex: 1, padding: '3px 0',
                        background: tunnelParams.transparentCell === t.v ? 'rgba(255,255,255,0.18)' : 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: tunnelParams.transparentCell === t.v ? '#fff' : 'rgba(255,255,255,0.5)',
                        fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.15em', cursor: 'pointer',
                      }}
                    >{t.l}</button>
                  ))}
                </div>
              </div>
              {/* Strobe controls */}
              <div style={{ marginTop: 8, marginBottom: 4 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', marginBottom: 3, textTransform: 'uppercase' }}>TARGET</div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[{ v: 0, l: 'ALL' }, { v: 1, l: 'A' }, { v: 2, l: 'B' }].map((t) => (
                        <button
                          key={t.v}
                          onClick={() => setTunnelParams((p) => ({ ...p, strobeTarget: t.v }))}
                          style={{
                            flex: 1, padding: '3px 0',
                            background: tunnelParams.strobeTarget === t.v ? 'rgba(255,255,255,0.18)' : 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: tunnelParams.strobeTarget === t.v ? '#fff' : 'rgba(255,255,255,0.5)',
                            fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.15em', cursor: 'pointer',
                          }}
                        >{t.l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', marginBottom: 3, textTransform: 'uppercase' }}>COLOR</div>
                    <input
                      type="color"
                      value={tunnelParams.strobeColor}
                      onChange={(e) => setTunnelParams((p) => ({ ...p, strobeColor: e.target.value }))}
                      style={{ width: 40, height: 22, border: '1px solid rgba(255,255,255,0.25)', background: 'transparent', padding: 0, cursor: 'pointer' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', marginBottom: 3, textTransform: 'uppercase' }}>MODE</div>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {[{ v: 0, l: 'FLASH' }, { v: 1, l: 'PULSE' }, { v: 2, l: 'RAINBOW' }, { v: 3, l: 'ALTER' }, { v: 4, l: 'INVERT' }].map((m) => (
                      <button
                        key={m.v}
                        onClick={() => setTunnelParams((p) => ({ ...p, strobeMode: m.v }))}
                        style={{
                          padding: '3px 6px',
                          background: tunnelParams.strobeMode === m.v ? 'rgba(255,255,255,0.18)' : 'transparent',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: tunnelParams.strobeMode === m.v ? '#fff' : 'rgba(255,255,255,0.5)',
                          fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.15em', cursor: 'pointer',
                        }}
                      >{m.l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', marginBottom: 3, textTransform: 'uppercase' }}>STROBE PRESETS</div>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {STROBE_PRESETS.map((sp) => {
                      const active = presetMatches(tunnelParams, sp.values)
                      return (
                        <button
                          key={sp.name}
                          onClick={() => setTunnelParams((p) => ({ ...p, ...sp.values }))}
                          style={{
                            padding: '3px 6px',
                            background: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
                            border: active ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.18)',
                            color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                            boxShadow: active ? '0 0 0 1px rgba(255,255,255,0.08), 0 0 18px rgba(255,255,255,0.16)' : 'none',
                            fontFamily: 'monospace',
                            fontSize: 7,
                            letterSpacing: '0.12em',
                            cursor: 'pointer',
                          }}
                        >
                          {sp.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setTunnelParams(TUNNEL_DEFAULTS)}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '6px 0',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                RESET
              </button>
              </>)}
              </div>

              {/* --- DESIGN TAB (tunnel only) --- */}
              <div style={{ display: tuneTab === 'design' && visualMode === 'tunnel' ? 'block' : 'none' }}>

              {/* Color palettes */}
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 9,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)',
                    marginBottom: 6,
                  }}
                >
                  PALETTE
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 5,
                    marginBottom: 8,
                  }}
                >
                  {COLOR_PALETTES.map((p) => {
                    const active =
                      tunnelParams.colorA.toLowerCase() === p.a.toLowerCase() &&
                      tunnelParams.colorB.toLowerCase() === p.b.toLowerCase() &&
                      tunnelParams.imageA === null &&
                      tunnelParams.imageB === null
                    return (
                      <button
                        key={p.name}
                        onClick={() =>
                          setTunnelParams((prev) => ({
                            ...prev,
                            colorA: p.a,
                            colorB: p.b,
                            imageA: null,
                            imageB: null,
                          }))
                        }
                        title={p.name}
                        style={{
                          height: 26,
                          background: `linear-gradient(135deg, ${p.a} 49%, ${p.b} 51%)`,
                          border: active
                            ? '1.5px solid #ffffff'
                            : '1px solid rgba(255,255,255,0.25)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                    )
                  })}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: 'monospace',
                      fontSize: 9,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    A
                    <input
                      type="color"
                      value={tunnelParams.colorA}
                      onChange={(e) =>
                        setTunnelParams((p) => ({
                          ...p,
                          colorA: e.target.value,
                          imageA: null,
                        }))
                      }
                      style={{
                        width: 36,
                        height: 22,
                        border: '1px solid rgba(255,255,255,0.25)',
                        background: 'transparent',
                        padding: 0,
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: 'monospace',
                      fontSize: 9,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    B
                    <input
                      type="color"
                      value={tunnelParams.colorB}
                      onChange={(e) =>
                        setTunnelParams((p) => ({
                          ...p,
                          colorB: e.target.value,
                          imageB: null,
                        }))
                      }
                      style={{
                        width: 36,
                        height: 22,
                        border: '1px solid rgba(255,255,255,0.25)',
                        background: 'transparent',
                        padding: 0,
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Cell fill: patterns, images, or plain color */}
              {(['A', 'B'] as const).map((cell) => {
                const patKey = `pattern${cell}` as 'patternA' | 'patternB'
                const imgKey = `image${cell}` as 'imageA' | 'imageB'
                const activePat = tunnelParams[patKey]
                const activeImg = tunnelParams[imgKey]
                return (
                  <div key={cell} style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 9,
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.55)',
                        marginBottom: 4,
                      }}
                    >
                      CELL {cell}
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: 3,
                        marginBottom: 4,
                      }}
                    >
                      {PATTERNS.map((p) => (
                        <button
                          key={p.id}
                          title={p.id}
                          onClick={() =>
                            setTunnelParams((prev) => ({
                              ...prev,
                              [patKey]: activePat === p.id ? null : p.id,
                              [imgKey]: null,
                            }))
                          }
                          style={{
                            height: 24,
                            background:
                              activePat === p.id
                                ? 'rgba(255,255,255,0.22)'
                                : 'rgba(255,255,255,0.06)',
                            border:
                              activePat === p.id
                                ? '1.5px solid #ffffff'
                                : '1px solid rgba(255,255,255,0.2)',
                            color: 'rgba(255,255,255,0.85)',
                            fontFamily: 'monospace',
                            fontSize: 11,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {TEST_IMAGES.map((img) => (
                        <button
                          key={img.url}
                          onClick={() =>
                            setTunnelParams((prev) => ({
                              ...prev,
                              [imgKey]: img.url,
                              [patKey]: null,
                            }))
                          }
                          style={{
                            flex: 1,
                            height: 22,
                            background: `url(${img.url}) center/cover no-repeat`,
                            border:
                              activeImg === img.url && !activePat
                                ? '1.5px solid #ffffff'
                                : '1px solid rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: 0,
                          }}
                          aria-label={img.name}
                        />
                      ))}
                      <button
                        onClick={() =>
                          setTunnelParams((prev) => ({
                            ...prev,
                            [patKey]: null,
                            [imgKey]: null,
                          }))
                        }
                        style={{
                          padding: '0 8px',
                          height: 22,
                          background: 'transparent',
                          border:
                            !activePat && !activeImg
                              ? '1.5px solid #ffffff'
                              : '1px solid rgba(255,255,255,0.2)',
                          color: 'rgba(255,255,255,0.7)',
                          fontFamily: 'monospace',
                          fontSize: 8,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}
                      >
                        OFF
                      </button>
                    </div>
                  </div>
                )
              })}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  columnGap: 12,
                  rowGap: 10,
                  alignItems: 'center',
                }}
              >
                {(
                  [
                    { key: 'density', label: 'RINGS', min: 2, max: 3000, step: 2, stepper: true },
                    { key: 'rings', label: 'SECTION', min: 1, max: 200, step: 1, stepper: true },
                    { key: 'hole', label: 'HOLE', min: 1, max: 12, step: 0.1, stepper: true },
                    { key: 'cellBlur', label: 'BLUR', min: 0, max: 0.5, step: 0.01, stepper: true },
                    { key: 'helix', label: 'HELIX', min: 0, max: 20, step: 0.1, stepper: true },
                    { key: 'wave', label: 'WAVE', min: 0, max: 5, step: 0.05, stepper: true },
                    { key: 'bend', label: 'BEND', min: 0, max: 360, step: 1, stepper: true },
                    { key: 'bendDir', label: 'BEND DIR', min: 0, max: 360, step: 1, stepper: true },
                    { key: 'kaleidoscope', label: 'KALEIDO', min: 0, max: 16, step: 1, stepper: true },
                    { key: 'chromatic', label: 'CHROMA', min: 0, max: 0.15, step: 0.005, stepper: true },
                    { key: 'hueShift', label: 'HUE SPIN', min: 0, max: 2, step: 0.01, stepper: true },
                  ] as const
                ).map((k) => (
                  <TuneRow
                    key={k.key}
                    label={k.label}
                    min={k.min}
                    max={k.max}
                    step={k.step}
                    value={tunnelParams[k.key]}
                    stepper={'stepper' in k && !!(k as any).stepper}
                    onChange={(v) =>
                      setTunnelParams((p) => ({
                        ...p,
                        [k.key]:
                          k.key === 'density'
                            ? Math.min(3000, Math.max(2, Math.round(v / 2) * 2))
                            : k.key === 'rings'
                              ? Math.min(200, Math.max(1, Math.round(v)))
                              : v,
                      }))
                    }
                  />
                ))}
              </div>
              <button
                onClick={() => setTunnelParams(TUNNEL_DEFAULTS)}
                style={{
                  width: '100%',
                  marginTop: 12,
                  padding: '6px 0',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                RESET
              </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setTunePanelOpen((v) => !v)}
            aria-label="Tune panel toggle"
            style={{
              background: 'rgba(0,0,0,0.78)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '18px 10px',
              fontFamily: 'monospace',
              fontSize: 11,
              letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              alignSelf: 'center',
            }}
          >
            {tunePanelOpen ? '▸ TUNE' : '◂ TUNE'}
          </button>
        </div>
      )}
    </div>
  )
}

useGLTF.preload('/models/asteroid.glb')
