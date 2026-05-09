import type { CSSProperties } from 'react'
import { useState } from 'react'
import {
  COLOR_PALETTES,
  PATTERNS,
  STROBE_PRESETS,
  TEST_IMAGES,
  TUNNEL_DEFAULTS,
  type TunnelParams,
} from '../TunnelCanvas'
import { OverlaysSection } from './overlays/OverlaysSection'
import type { OverlayLayer } from './overlays/types'

// ─── Tune panel ────────────────────────────────────────────────────
// Right-side collapsible parameter panel. Ports the existing
// PLAY / DESIGN slider drawer out of `AsteroidScene.tsx` verbatim.
// No behavior change beyond layout: every control writes the same
// `setTunnelParams` shape it did before chunk 3.
//
// Layout decision (chunk 3 — see plan §4): the global control rows
// (DIRECTION / BIRD / MODE) lived at the top of the old combined
// drawer. `PRESETS` got pulled out into the new `PresetsPanel`, but
// the global rows are not preset-shaped — they belong to the
// instrument as a whole — so they live here as a small "global"
// header above the PLAY / DESIGN tab strip. This keeps the move
// surgical: nothing changes semantically, just where the chrome
// lives.

const stepperBtnStyle: CSSProperties = {
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

type TunePanelProps = {
  open: boolean
  onToggle: () => void
  tunnelParams: TunnelParams
  setTunnelParams: (
    update: TunnelParams | ((prev: TunnelParams) => TunnelParams),
  ) => void
  hideModel: boolean
  setHideModel: (v: boolean) => void
  visualMode: 'tunnel' | 'mandala'
  setVisualMode: (m: 'tunnel' | 'mandala') => void
  // Chunk 7 — see PresetsPanel for the wider rationale. Hidden in
  // fullscreen showcase mode; toggle/tab state preserved across the
  // transition.
  hidden?: boolean
  // Chunk 9 — REDUCED FLASH toggle. Lives in TunePanel under PLAY
  // (next to the strobe controls) because it's a runtime safety
  // setting, not a per-preset value. Default is set by AsteroidScene
  // (prefers-reduced-motion + persisted localStorage).
  reducedFlash?: boolean
  onReducedFlashChange?: (on: boolean) => void
  // Overlay layer stack (Photoshop-style). Owned by AsteroidScene;
  // TunePanel renders the OVERLAYS panel inside its PLAY tab.
  overlayLayers?: OverlayLayer[]
  activeLayerId?: string | null
  onAddLayer?: () => void
  onSelectLayer?: (id: string | null) => void
  onUpdateLayer?: (id: string, patch: Partial<OverlayLayer>) => void
  onDeleteLayer?: (id: string) => void
  onDuplicateLayer?: (id: string) => void
  onReorderLayer?: (id: string, dir: -1 | 1) => void
  onClearLayers?: () => void
  onSetLayers?: (layers: OverlayLayer[]) => void
  blendDiag?: boolean
  onToggleBlendDiag?: () => void
  // Tunnel params + genre piped down so independentTunnel sources
  // can copy the live base look.
  baseTunnelParams?: TunnelParams
  baseGenre?: import('./generator/generateLook').Genre
  // Which screen edge the drawer anchors to.
  side?: 'left' | 'right'
}

const PANEL_WIDTH = 480

export function TunePanel({
  open,
  onToggle,
  tunnelParams,
  setTunnelParams,
  hideModel,
  setHideModel,
  visualMode,
  setVisualMode,
  hidden = false,
  reducedFlash = false,
  onReducedFlashChange,
  overlayLayers = [],
  activeLayerId = null,
  onAddLayer,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onReorderLayer,
  onClearLayers,
  onSetLayers,
  blendDiag = false,
  onToggleBlendDiag,
  baseTunnelParams,
  baseGenre,
  side = 'right',
}: TunePanelProps) {
  const [tuneTab, setTuneTab] = useState<'play' | 'design'>('play')
  const isLeft = side === 'left'

  return (
    <div
      style={{
        display: hidden ? 'none' : 'flex',
        alignItems: 'stretch',
        flexDirection: isLeft ? 'row-reverse' : 'row',
      }}
    >
      <div
        style={{
          overflow: 'hidden',
          width: open ? PANEL_WIDTH : 0,
          transition: 'width 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: 'rgba(0,0,0,0.82)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRight: isLeft ? '1px solid rgba(255,255,255,0.22)' : 'none',
            borderLeft: isLeft ? 'none' : '1px solid rgba(255,255,255,0.22)',
            padding: '14px 18px',
            width: PANEL_WIDTH,
            maxHeight: '60vh',
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}
        >
          {/* Global control rows — DIRECTION / BIRD / MODE.
              Documented decision: these belong to the instrument as
              a whole (not to PRESETS, not to slider tabs), so they
              live as a compact "global" header above the tab strip. */}
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

          {/* PLAY / DESIGN tab switcher — only meaningful in tunnel mode */}
          {visualMode === 'tunnel' && (
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
                      tuneTab === tab ? '#ffffff' : 'rgba(255,255,255,0.5)',
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
          )}

          {visualMode === 'tunnel' && (
            <>
              {/* --- PLAY TAB --- */}
              <div style={{ display: tuneTab === 'play' ? 'block' : 'none' }}>
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
                      stepper={'stepper' in k && !!(k as { stepper?: boolean }).stepper}
                      onChange={(v) =>
                        setTunnelParams((p) => ({ ...p, [k.key]: v }))
                      }
                    />
                  ))}
                </div>
                {/* Transparency */}
                <div style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 8,
                      letterSpacing: '0.2em',
                      color: 'rgba(255,255,255,0.5)',
                      marginBottom: 3,
                      textTransform: 'uppercase',
                    }}
                  >
                    TRANSPARENT CELL
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[
                      { v: 'none' as const, l: 'OFF' },
                      { v: 'a' as const, l: 'A' },
                      { v: 'b' as const, l: 'B' },
                    ].map((t) => (
                      <button
                        key={t.v}
                        onClick={() =>
                          setTunnelParams((p) => ({
                            ...p,
                            transparentCell: t.v,
                          }))
                        }
                        style={{
                          flex: 1,
                          padding: '3px 0',
                          background:
                            tunnelParams.transparentCell === t.v
                              ? 'rgba(255,255,255,0.18)'
                              : 'transparent',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color:
                            tunnelParams.transparentCell === t.v
                              ? '#fff'
                              : 'rgba(255,255,255,0.5)',
                          fontFamily: 'monospace',
                          fontSize: 8,
                          letterSpacing: '0.15em',
                          cursor: 'pointer',
                        }}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Strobe controls */}
                <div style={{ marginTop: 8, marginBottom: 4 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 8,
                          letterSpacing: '0.2em',
                          color: 'rgba(255,255,255,0.5)',
                          marginBottom: 3,
                          textTransform: 'uppercase',
                        }}
                      >
                        TARGET
                      </div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[
                          { v: 0, l: 'ALL' },
                          { v: 1, l: 'A' },
                          { v: 2, l: 'B' },
                        ].map((t) => (
                          <button
                            key={t.v}
                            onClick={() =>
                              setTunnelParams((p) => ({
                                ...p,
                                strobeTarget: t.v,
                              }))
                            }
                            style={{
                              flex: 1,
                              padding: '3px 0',
                              background:
                                tunnelParams.strobeTarget === t.v
                                  ? 'rgba(255,255,255,0.18)'
                                  : 'transparent',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color:
                                tunnelParams.strobeTarget === t.v
                                  ? '#fff'
                                  : 'rgba(255,255,255,0.5)',
                              fontFamily: 'monospace',
                              fontSize: 8,
                              letterSpacing: '0.15em',
                              cursor: 'pointer',
                            }}
                          >
                            {t.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 8,
                          letterSpacing: '0.2em',
                          color: 'rgba(255,255,255,0.5)',
                          marginBottom: 3,
                          textTransform: 'uppercase',
                        }}
                      >
                        COLOR
                      </div>
                      <input
                        type="color"
                        value={tunnelParams.strobeColor}
                        onChange={(e) =>
                          setTunnelParams((p) => ({
                            ...p,
                            strobeColor: e.target.value,
                          }))
                        }
                        style={{
                          width: 40,
                          height: 22,
                          border: '1px solid rgba(255,255,255,0.25)',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 8,
                        letterSpacing: '0.2em',
                        color: 'rgba(255,255,255,0.5)',
                        marginBottom: 3,
                        textTransform: 'uppercase',
                      }}
                    >
                      MODE
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {[
                        { v: 0, l: 'FLASH' },
                        { v: 1, l: 'PULSE' },
                        { v: 2, l: 'RAINBOW' },
                        { v: 3, l: 'ALTER' },
                        { v: 4, l: 'INVERT' },
                      ].map((m) => (
                        <button
                          key={m.v}
                          onClick={() =>
                            setTunnelParams((p) => ({
                              ...p,
                              strobeMode: m.v,
                            }))
                          }
                          style={{
                            padding: '3px 6px',
                            background:
                              tunnelParams.strobeMode === m.v
                                ? 'rgba(255,255,255,0.18)'
                                : 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color:
                              tunnelParams.strobeMode === m.v
                                ? '#fff'
                                : 'rgba(255,255,255,0.5)',
                            fontFamily: 'monospace',
                            fontSize: 7,
                            letterSpacing: '0.15em',
                            cursor: 'pointer',
                          }}
                        >
                          {m.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 8,
                        letterSpacing: '0.2em',
                        color: 'rgba(255,255,255,0.5)',
                        marginBottom: 3,
                        textTransform: 'uppercase',
                      }}
                    >
                      STROBE PRESETS
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {STROBE_PRESETS.map((sp) => (
                        <button
                          key={sp.name}
                          onClick={() =>
                            setTunnelParams((p) => ({ ...p, ...sp.values }))
                          }
                          style={{
                            padding: '3px 6px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            color: 'rgba(255,255,255,0.7)',
                            fontFamily: 'monospace',
                            fontSize: 7,
                            letterSpacing: '0.12em',
                            cursor: 'pointer',
                          }}
                        >
                          {sp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Chunk 9 — REDUCED FLASH safety toggle. Sits below
                    the strobe controls because it's the runtime
                    safety clamp on top of everything authored above. */}
                {onReducedFlashChange && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: '8px 10px',
                      border: '1px solid rgba(255,200,80,0.3)',
                      background: 'rgba(255,200,80,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 9,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,200,80,0.85)',
                        }}
                      >
                        ⚠ REDUCED FLASH
                      </span>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 8,
                          color: 'rgba(255,255,255,0.5)',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Caps strobe / chroma / hue-shift to safe levels.
                      </span>
                    </div>
                    <button
                      role="switch"
                      aria-checked={reducedFlash}
                      onClick={() => onReducedFlashChange(!reducedFlash)}
                      style={{
                        padding: '4px 10px',
                        fontFamily: 'monospace',
                        fontSize: 9,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        background: reducedFlash
                          ? 'rgba(255,200,80,0.85)'
                          : 'rgba(255,255,255,0.06)',
                        color: reducedFlash ? '#000' : 'rgba(255,255,255,0.7)',
                        border: reducedFlash
                          ? '1px solid rgba(255,200,80,0.85)'
                          : '1px solid rgba(255,255,255,0.25)',
                      }}
                    >
                      {reducedFlash ? 'ON' : 'OFF'}
                    </button>
                  </div>
                )}
                {/* OVERLAYS — Photoshop-style layer stack above
                    the tunnel canvas. Replaces the legacy MASK
                    section. Layers can be added, reordered, blended,
                    animated, and saved with the look. */}
                {onAddLayer && (
                  <OverlaysSection
                    layers={overlayLayers}
                    activeLayerId={activeLayerId}
                    onAddLayer={onAddLayer}
                    onSelectLayer={onSelectLayer ?? (() => {})}
                    onUpdateLayer={onUpdateLayer ?? (() => {})}
                    onDeleteLayer={onDeleteLayer ?? (() => {})}
                    onDuplicateLayer={onDuplicateLayer ?? (() => {})}
                    onReorderLayer={onReorderLayer ?? (() => {})}
                    onClearLayers={onClearLayers ?? (() => {})}
                    onSetLayers={onSetLayers}
                    blendDiag={blendDiag}
                    onToggleBlendDiag={onToggleBlendDiag}
                    baseTunnelParams={baseTunnelParams}
                    baseGenre={baseGenre}
                  />
                )}

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
              </div>

              {/* --- DESIGN TAB --- */}
              <div
                style={{ display: tuneTab === 'design' ? 'block' : 'none' }}
              >
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
                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
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
                      stepper={'stepper' in k && !!(k as { stepper?: boolean }).stepper}
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
            </>
          )}

          {visualMode === 'mandala' && (
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                color: 'rgba(255,255,255,0.5)',
                padding: '8px 0',
                lineHeight: 1.5,
              }}
            >
              MANDALA mode — controls are rendered in the mandala module
              panel (out of scope for the tunnel TUNE panel).
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onToggle}
        aria-label="Tune panel toggle"
        style={{
          background: 'rgba(0,0,0,0.78)',
          border: '1px solid rgba(255,255,255,0.3)',
          padding: '14px 8px',
          fontFamily: 'monospace',
          fontSize: 10,
          letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          alignSelf: 'center',
        }}
      >
        {isLeft
          ? open
            ? '◂ TUNE'
            : '▸ TUNE'
          : open
          ? '▸ TUNE'
          : '◂ TUNE'}
      </button>
    </div>
  )
}
