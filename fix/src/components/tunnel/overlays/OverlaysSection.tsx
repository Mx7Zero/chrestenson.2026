import { useState, type CSSProperties } from 'react'
import {
  ASSETS,
  ASSET_CATEGORIES,
  getAssetsByCategory,
  resolveAssetPath,
  type AssetCategory,
} from './assetRegistry'
import {
  BLEND_MODES,
  MOTION_TYPES,
  OVERLAY_TYPES,
  PULSE_TARGETS,
  makeLayer,
  type OverlayLayer,
  type OverlayBlend,
  type OverlayMotion,
  type OverlaySource,
  type PatternMode,
  type PulseTarget,
} from './types'
import { generateLook, RECIPE_VERSION, type Genre } from '../generator/generateLook'
import { RECIPES } from './recipes'
import { freshSeed } from '../generator/rng'
import type { TunnelParams } from '../../TunnelCanvas'

const GENRES: Genre[] = [
  'signature',
  'psychedelic',
  'kaleido',
  'cosmic',
  'rave',
  'glitch',
  'sacred',
  'chroma',
]

// Pattern-space modes shown in the picker. Order matches the plan
// (single → massive → mirrorStage → radial → kaleido → tileGrid →
// tunnelRepeat → cloneCloud → mandalaStack). Modes that aren't
// rendered yet by `expandLayerToInstances` still show in the picker
// so the surface is complete; selecting them just produces a single
// identity instance until the corresponding task lights them up.
const PATTERN_MODES: PatternMode[] = [
  'single',
  'massive',
  'mirrorStage',
  'radial',
  'kaleido',
  'tileGrid',
  'tunnelRepeat',
  'cloneCloud',
  'mandalaStack',
]

// ─── OverlaysSection ──────────────────────────────────────────────
// Photoshop-style stack UI rendered inside TunePanel's PLAY tab.
// Top: layer list with visibility, reorder, duplicate, delete, plus
// the + Add Layer button. Below: settings for the selected layer.
// All state lives in AsteroidScene; this component is purely
// presentational + dispatches handler callbacks.

type Props = {
  layers: OverlayLayer[]
  activeLayerId: string | null
  onAddLayer: () => void
  onSelectLayer: (id: string | null) => void
  onUpdateLayer: (id: string, patch: Partial<OverlayLayer>) => void
  onDeleteLayer: (id: string) => void
  onDuplicateLayer: (id: string) => void
  onReorderLayer: (id: string, dir: -1 | 1) => void
  onClearLayers: () => void
  // Inject a fully-prepared layer set (used by the BLEND TEST debug
  // button to drop in 5 differently-blended white stars).
  onSetLayers?: (layers: OverlayLayer[]) => void
  blendDiag?: boolean
  onToggleBlendDiag?: () => void
  // For Copy Current — current resolved tunnel params from the engine.
  baseTunnelParams?: TunnelParams
  // For Copy Current — current active genre/seed if available.
  baseGenre?: Genre
}

// Five white star layers, each with a different blend mode, laid out
// in a horizontal row. Used by the BLEND TEST button to verify the
// stack is working: if all five look identical, the stack is broken.
function makeBlendTestLayers(): OverlayLayer[] {
  const modes: OverlayBlend[] = [
    'normal',
    'screen',
    'multiply',
    'difference',
    'overlay',
  ]
  return modes.map((mode, i) => {
    const l = makeLayer('shape', 'star')
    return {
      ...l,
      // Lay them out left-to-right at -0.6, -0.3, 0, 0.3, 0.6
      x: -0.6 + i * 0.3,
      y: 0,
      scale: 0.55,
      fill: '#ffffff',
      stroke: '#ffffff',
      strokeWidth: 0,
      blendMode: mode,
    }
  })
}

const headerStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 10,
  letterSpacing: '0.25em',
  color: 'rgba(255,255,255,0.7)',
  textTransform: 'uppercase',
  marginBottom: 8,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const labelStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 9,
  letterSpacing: '0.2em',
  color: 'rgba(255,255,255,0.6)',
  textTransform: 'uppercase',
}

const smallBtn: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 9,
  letterSpacing: '0.18em',
  padding: '4px 8px',
  background: 'rgba(255,255,255,0.06)',
  color: 'rgba(255,255,255,0.8)',
  border: '1px solid rgba(255,255,255,0.22)',
  cursor: 'pointer',
  textTransform: 'uppercase',
}

const iconBtn: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'rgba(255,255,255,0.6)',
  fontSize: 11,
  cursor: 'pointer',
  padding: 2,
  width: 22,
  height: 22,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const sliderRow = (
  label: string,
  value: number,
  fmt: (v: number) => string,
  min: number,
  max: number,
  step: number,
  onChange: (v: number) => void,
) => (
  <div
    key={label}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    }}
  >
    <span style={{ ...labelStyle, width: 56 }}>{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ flex: 1 }}
    />
    <span
      style={{
        fontFamily: 'monospace',
        fontSize: 9,
        color: 'rgba(255,255,255,0.6)',
        width: 42,
        textAlign: 'right',
      }}
    >
      {fmt(value)}
    </span>
  </div>
)

export function OverlaysSection({
  layers,
  activeLayerId,
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
}: Props) {
  const active = layers.find((l) => l.id === activeLayerId) ?? null
  const [assetCategory, setAssetCategory] = useState<AssetCategory | 'all'>(
    'all',
  )

  // Stack list renders TOP-DOWN visually but layer 0 is the BOTTOM
  // of the render stack (Photoshop convention). Reverse for display.
  const displayList = [...layers].reverse()
  const visibleAssets = getAssetsByCategory(assetCategory)

  return (
    <div
      style={{
        marginTop: 12,
        padding: '10px 10px 12px',
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <div style={headerStyle}>
        <span>✦ OVERLAYS</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onAddLayer} style={smallBtn}>
            + ADD
          </button>
          {onSetLayers && (
            <button
              onClick={() => onSetLayers(makeBlendTestLayers())}
              title="Drops in 5 white-star layers with different blend modes — SVG path test."
              style={{
                ...smallBtn,
                background: 'rgba(120,200,255,0.15)',
                color: 'rgba(180,220,255,0.95)',
              }}
            >
              BLEND TEST
            </button>
          )}
          {onToggleBlendDiag && (
            <button
              onClick={onToggleBlendDiag}
              title="Toggle the plain-div diagnostic overlay (5 gray squares, no SVG). If these don't blend differently against the tunnel, the stage/isolation/canvas relationship is broken."
              style={{
                ...smallBtn,
                background: blendDiag
                  ? 'rgba(255,200,80,0.85)'
                  : 'rgba(255,200,80,0.15)',
                color: blendDiag ? '#000' : 'rgba(255,220,140,0.95)',
              }}
            >
              {blendDiag ? '⏹ DIAG' : '🔍 DIAG'}
            </button>
          )}
          {layers.length > 0 && (
            <button
              onClick={onClearLayers}
              style={{
                ...smallBtn,
                background: 'transparent',
                color: 'rgba(255,140,140,0.8)',
              }}
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* RECIPES — one-click templates that drop a fully-configured
          layer onto the stack. Re-seed once added to vary it. */}
      {onSetLayers && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            overflowX: 'auto',
            paddingBottom: 6,
            marginBottom: 8,
          }}
        >
          {RECIPES.map((r) => (
            <button
              key={r.id}
              onClick={() => onSetLayers([...layers, r.build()])}
              title={r.description}
              style={{
                fontFamily: 'monospace',
                fontSize: 8,
                letterSpacing: '0.15em',
                padding: '5px 8px',
                background:
                  'linear-gradient(135deg, rgba(180,120,255,0.18), rgba(120,200,255,0.18))',
                color: 'rgba(230,240,255,0.95)',
                border: '1px solid rgba(180,200,255,0.4)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              + {r.name}
            </button>
          ))}
        </div>
      )}

      {/* LAYER LIST */}
      {layers.length === 0 ? (
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 9,
            color: 'rgba(255,255,255,0.45)',
            padding: '12px 0',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          No overlay layers. Hit + ADD to put a shape, cutout, glow,
          or tile pattern above the tunnel.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            marginBottom: 10,
          }}
        >
          {displayList.map((layer) => {
            const isActive = layer.id === activeLayerId
            const asset = ASSETS.find((m) => m.id === layer.asset)
            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 6px',
                  background: isActive
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  border: isActive
                    ? '1px solid rgba(255,255,255,0.6)'
                    : '1px solid rgba(255,255,255,0.14)',
                  cursor: 'pointer',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateLayer(layer.id, { visible: !layer.visible })
                  }}
                  title={layer.visible ? 'Hide' : 'Show'}
                  style={{
                    ...iconBtn,
                    color: layer.visible
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {layer.visible ? '●' : '○'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateLayer(layer.id, { solo: !layer.solo })
                  }}
                  title={layer.solo ? 'Unsolo' : 'Solo (hide all others)'}
                  style={{
                    ...iconBtn,
                    color: layer.solo
                      ? 'rgba(255,220,120,0.95)'
                      : 'rgba(255,255,255,0.35)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                >
                  S
                </button>
                {asset && (
                  <svg
                    width="16"
                    height="16"
                    viewBox={asset.viewBox}
                    style={{ flexShrink: 0 }}
                  >
                    <path
                      d={asset.d}
                      fill="rgba(255,255,255,0.85)"
                      fillRule="evenodd"
                    />
                  </svg>
                )}
                <span
                  style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.85)',
                    textTransform: 'uppercase',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {layer.type} · {layer.asset}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onReorderLayer(layer.id, 1)
                  }}
                  title="Move up"
                  style={iconBtn}
                >
                  ↑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onReorderLayer(layer.id, -1)
                  }}
                  title="Move down"
                  style={iconBtn}
                >
                  ↓
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicateLayer(layer.id)
                  }}
                  title="Duplicate"
                  style={iconBtn}
                >
                  ⎘
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteLayer(layer.id)
                  }}
                  title="Delete"
                  style={{ ...iconBtn, color: 'rgba(255,140,140,0.7)' }}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* SELECTED LAYER SETTINGS */}
      {active && (
        <div
          style={{
            paddingTop: 8,
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* Type picker */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 4,
              marginBottom: 6,
            }}
          >
            {OVERLAY_TYPES.map((t) => {
              const isOn = active.type === t
              return (
                <button
                  key={t}
                  onClick={() => onUpdateLayer(active.id, { type: t })}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 9,
                    letterSpacing: '0.18em',
                    padding: '5px 0',
                    background: isOn
                      ? 'rgba(255,255,255,0.92)'
                      : 'rgba(255,255,255,0.06)',
                    color: isOn ? '#000' : 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>

          {/* Category filter */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              marginBottom: 6,
            }}
          >
            {(['all', ...ASSET_CATEGORIES] as const).map((cat) => {
              const isOn = assetCategory === cat
              const count =
                cat === 'all'
                  ? ASSETS.length
                  : ASSETS.filter((a) => a.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setAssetCategory(cat)}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 8,
                    letterSpacing: '0.18em',
                    padding: '3px 6px',
                    background: isOn
                      ? 'rgba(255,255,255,0.92)'
                      : 'rgba(255,255,255,0.05)',
                    color: isOn ? '#000' : 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {cat} {count}
                </button>
              )
            })}
          </div>

          {/* Asset grid (scrollable) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 4,
              marginBottom: 8,
              maxHeight: 180,
              overflowY: 'auto',
              padding: 2,
            }}
          >
            {visibleAssets.map((m) => {
              const isOn = active.asset === m.id
              // For the active layer's procedural asset, preview the
              // ACTUAL seed the layer is using so the picker stays in
              // sync with the live render. For other procedural
              // assets, show a stable seed=1 thumbnail.
              const previewSeed = isOn
                ? active.assetSeed ?? active.randomSeed
                : 1
              const preview = m.procedural
                ? resolveAssetPath(m, previewSeed)
                : { viewBox: m.viewBox, d: m.d }
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    // Switching asset: if procedural, mint a fresh
                    // seed unless the layer already has one. Static
                    // assets keep the seed (irrelevant for them).
                    const patch: Record<string, unknown> = { asset: m.id }
                    if (m.procedural && active.assetSeed === undefined) {
                      patch.assetSeed =
                        Math.floor(Math.random() * 0xffffffff) >>> 0
                    }
                    onUpdateLayer(active.id, patch)
                  }}
                  title={`${m.name}${m.procedural ? ' (procedural — re-seed for variation)' : ''}\n${m.tags.join(' · ')}`}
                  style={{
                    padding: 4,
                    background: isOn
                      ? 'rgba(255,255,255,0.16)'
                      : m.procedural
                      ? 'rgba(120,200,255,0.06)'
                      : 'rgba(255,255,255,0.04)',
                    border: isOn
                      ? '1px solid rgba(255,255,255,0.85)'
                      : m.procedural
                      ? '1px solid rgba(120,200,255,0.35)'
                      : '1px solid rgba(255,255,255,0.18)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    aspectRatio: '1',
                  }}
                >
                  <svg width="20" height="20" viewBox={preview.viewBox}>
                    <path
                      d={preview.d}
                      fill="rgba(255,255,255,0.85)"
                      fillRule="evenodd"
                    />
                  </svg>
                </button>
              )
            })}
          </div>

          {/* SOURCE picker — what paints inside the matte. */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 4,
              marginBottom: 6,
            }}
          >
            {(
              [
                { id: 'solid' as OverlaySource, label: 'SOLID' },
                { id: 'independentTunnel' as OverlaySource, label: 'INDEP TUNNEL' },
              ]
            ).map((s) => {
              const isOn = active.source === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => onUpdateLayer(active.id, { source: s.id })}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 9,
                    letterSpacing: '0.18em',
                    padding: '5px 0',
                    background: isOn
                      ? 'rgba(120,200,255,0.85)'
                      : 'rgba(255,255,255,0.06)',
                    color: isOn ? '#000' : 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>

          {active.source === 'independentTunnel' && (
            <div
              style={{
                marginBottom: 8,
                padding: 6,
                border: '1px dashed rgba(120,200,255,0.4)',
                background: 'rgba(120,200,255,0.05)',
              }}
            >
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  color: 'rgba(180,220,255,0.85)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                ✦ INDEP TUNNEL ·{' '}
                {layers.filter((l) => l.source === 'independentTunnel' && l.visible).length}
                /2
                {layers.filter((l) => l.source === 'independentTunnel' && l.visible).length > 2 && (
                  <span style={{ color: 'rgba(255,180,80,0.95)', marginLeft: 6 }}>
                    ⚠ heavy
                  </span>
                )}
              </div>

              {/* Genre dropdown */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <span style={{ ...labelStyle, width: 56 }}>GENRE</span>
                <select
                  value={active.sourceGenre ?? baseGenre ?? 'signature'}
                  onChange={(e) =>
                    onUpdateLayer(active.id, {
                      sourceGenre: e.target.value as Genre,
                    })
                  }
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.6)',
                    color: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    fontFamily: 'monospace',
                    fontSize: 10,
                    padding: '3px 4px',
                    textTransform: 'uppercase',
                  }}
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seed + name display */}
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.55)',
                  marginBottom: 6,
                  letterSpacing: '0.15em',
                  lineHeight: 1.5,
                }}
              >
                <div>
                  SEED · {active.sourceSeed ?? '—'}
                  {active.sourceRecipeVersion != null && (
                    <span style={{ opacity: 0.6 }}>
                      {' '}
                      · v{active.sourceRecipeVersion}
                    </span>
                  )}
                </div>
                {active.sourceName && (
                  <div
                    style={{
                      color: 'rgba(180,220,255,0.95)',
                      textTransform: 'uppercase',
                    }}
                  >
                    “{active.sourceName}”
                  </div>
                )}
              </div>

              {/* Hard placeholder: when source is indep but no params
                  have been generated, the overlay renders NOTHING.
                  Surface a clear call-to-action here so the user
                  knows to Generate Source. Without this the layer
                  looks broken. */}
              {!active.sourceParams && (
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 9,
                    color: 'rgba(255,200,80,0.95)',
                    background: 'rgba(255,200,80,0.08)',
                    border: '1px dashed rgba(255,200,80,0.55)',
                    padding: '6px 8px',
                    marginBottom: 6,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    lineHeight: 1.5,
                  }}
                >
                  ⚠ No source yet — click ✨ Generate Source or ⎘ Copy
                  Base to populate this layer.
                </div>
              )}

              {/* Generate / Copy buttons */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 4,
                }}
              >
                <button
                  onClick={() => {
                    const genre =
                      active.sourceGenre ??
                      baseGenre ??
                      ('signature' as Genre)
                    const seed = freshSeed()
                    const look = generateLook(genre, seed, {})
                    onUpdateLayer(active.id, {
                      source: 'independentTunnel',
                      sourceGenre: genre,
                      sourceSeed: seed,
                      sourceRecipeVersion:
                        look.recipeVersion ?? RECIPE_VERSION,
                      sourceParams: look.values,
                      sourceName: look.name,
                    })
                  }}
                  style={{ ...smallBtn, textAlign: 'center' }}
                >
                  ✨ GENERATE SOURCE
                </button>
                <button
                  onClick={() => {
                    if (!baseTunnelParams) return
                    onUpdateLayer(active.id, {
                      source: 'independentTunnel',
                      // Snapshot a structural copy so future engine
                      // mutations don't reach into the layer state.
                      sourceParams: { ...baseTunnelParams },
                      sourceGenre: baseGenre ?? active.sourceGenre,
                      sourceSeed: undefined,
                      sourceRecipeVersion: RECIPE_VERSION,
                      sourceName: 'Copied from base',
                    })
                  }}
                  disabled={!baseTunnelParams}
                  style={{
                    ...smallBtn,
                    textAlign: 'center',
                    opacity: baseTunnelParams ? 1 : 0.4,
                    cursor: baseTunnelParams ? 'pointer' : 'not-allowed',
                  }}
                >
                  ⎘ COPY BASE
                </button>
              </div>
            </div>
          )}

          {/* Blend mode */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span style={{ ...labelStyle, width: 56 }}>BLEND</span>
            <select
              value={active.blendMode}
              onChange={(e) =>
                onUpdateLayer(active.id, {
                  blendMode: e.target.value as OverlayBlend,
                })
              }
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.6)',
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.22)',
                fontFamily: 'monospace',
                fontSize: 10,
                padding: '3px 4px',
                textTransform: 'uppercase',
              }}
            >
              {BLEND_MODES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          {sliderRow(
            'OPACITY',
            active.opacity,
            (v) => v.toFixed(2),
            0,
            1,
            0.01,
            (v) => onUpdateLayer(active.id, { opacity: v }),
          )}
          {/* Lock — disables transform sliders so manual placement
              doesn't get bumped during composition. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span style={{ ...labelStyle, width: 56 }}>LOCK</span>
            <button
              onClick={() =>
                onUpdateLayer(active.id, { locked: !(active.locked ?? false) })
              }
              style={{
                ...smallBtn,
                flex: 1,
                background: active.locked
                  ? 'rgba(255,220,120,0.95)'
                  : 'transparent',
                color: active.locked ? '#000' : 'rgba(255,255,255,0.7)',
              }}
            >
              {active.locked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
            </button>
          </div>
          {!active.locked && sliderRow(
            'SCALE',
            active.scale,
            (v) => v.toFixed(2),
            0.2,
            2,
            0.05,
            (v) => onUpdateLayer(active.id, { scale: v }),
          )}
          {!active.locked && active.type !== 'tile' &&
            sliderRow(
              'X',
              active.x,
              (v) => v.toFixed(2),
              -1,
              1,
              0.01,
              (v) => onUpdateLayer(active.id, { x: v }),
            )}
          {!active.locked && active.type !== 'tile' &&
            sliderRow(
              'Y',
              active.y,
              (v) => v.toFixed(2),
              -1,
              1,
              0.01,
              (v) => onUpdateLayer(active.id, { y: v }),
            )}
          {!active.locked && sliderRow(
            'ROT',
            active.rotation,
            (v) => Math.round(v).toString(),
            -180,
            180,
            1,
            (v) => onUpdateLayer(active.id, { rotation: v }),
          )}
          {sliderRow(
            'BLUR',
            active.blur,
            (v) => Math.round(v).toString(),
            0,
            40,
            1,
            (v) => onUpdateLayer(active.id, { blur: v }),
          )}
          {active.type === 'glow' &&
            sliderRow(
              'GLOW',
              active.glow,
              (v) => Math.round(v).toString(),
              0,
              60,
              1,
              (v) => onUpdateLayer(active.id, { glow: v }),
            )}
          {active.type === 'tile' &&
            sliderRow(
              'TILE',
              active.tileSpacing,
              (v) => v.toFixed(2),
              0.04,
              0.4,
              0.01,
              (v) => onUpdateLayer(active.id, { tileSpacing: v }),
            )}

          {/* Color pickers */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 6,
            }}
          >
            <span style={{ ...labelStyle, width: 56 }}>FILL</span>
            <input
              type="color"
              value={active.fill}
              onChange={(e) =>
                onUpdateLayer(active.id, { fill: e.target.value })
              }
              style={{
                width: 36,
                height: 22,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'pointer',
              }}
            />
            <button
              onClick={() =>
                onUpdateLayer(active.id, { invert: !active.invert })
              }
              style={{
                ...smallBtn,
                background: active.invert
                  ? 'rgba(255,255,255,0.92)'
                  : 'transparent',
                color: active.invert ? '#000' : 'rgba(255,255,255,0.7)',
                marginLeft: 'auto',
              }}
            >
              {active.invert ? 'INV ON' : 'INV OFF'}
            </button>
          </div>

          {/* Motion picker */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 4,
              marginTop: 8,
            }}
          >
            {MOTION_TYPES.map((m) => {
              const isOn = active.motion === m
              return (
                <button
                  key={m}
                  onClick={() =>
                    onUpdateLayer(active.id, { motion: m as OverlayMotion })
                  }
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 8,
                    letterSpacing: '0.15em',
                    padding: '4px 0',
                    background: isOn
                      ? 'rgba(255,255,255,0.92)'
                      : 'rgba(255,255,255,0.06)',
                    color: isOn ? '#000' : 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {m}
                </button>
              )
            })}
          </div>

          {(active.motion !== 'none' ||
            !!ASSETS.find((a) => a.id === active.asset)?.effectId) && (
            <>
              {active.motion !== 'none' && (
                <>
                  {sliderRow(
                    'SPEED',
                    active.motionSpeed,
                    (v) => v.toFixed(2),
                    0.25,
                    3,
                    0.05,
                    (v) => onUpdateLayer(active.id, { motionSpeed: v }),
                  )}
                  {sliderRow(
                    'AMNT',
                    active.motionAmount,
                    (v) => v.toFixed(2),
                    0,
                    2,
                    0.05,
                    (v) => onUpdateLayer(active.id, { motionAmount: v }),
                  )}
                  {sliderRow(
                    'PHASE',
                    active.motionPhase ?? 0,
                    (v) => v.toFixed(2),
                    0,
                    1,
                    0.01,
                    (v) => onUpdateLayer(active.id, { motionPhase: v }),
                  )}
                  {sliderRow(
                    'JITTER',
                    active.motionRandomness ?? 0,
                    (v) => v.toFixed(2),
                    0,
                    1,
                    0.01,
                    (v) => onUpdateLayer(active.id, { motionRandomness: v }),
                  )}
                  {active.motion === 'orbit' &&
                    sliderRow(
                      'ORBIT R',
                      active.orbitRadius ?? 0.18,
                      (v) => v.toFixed(2),
                      0.02,
                      0.6,
                      0.01,
                      (v) => onUpdateLayer(active.id, { orbitRadius: v }),
                    )}
                </>
              )}
              {/* PATTERN SPACE — picks how the layer expands into N
                  instances (single, mandala, mirrored pair, grid…).
                  Layer-wide; works for shapes, cutouts, glows, tiles,
                  and effects. Conditionally exposes per-mode tunables
                  below the picker. Modes whose renderer hasn't shipped
                  yet still appear in the dropdown — selecting them
                  produces a single instance until the matching task
                  lights them up. */}
          {(() => {
            const mode = active.patternMode ?? 'single'
            return (
              <div
                style={{
                  marginTop: 6,
                  padding: 6,
                  border: '1px dashed rgba(220,180,255,0.45)',
                  background: 'rgba(220,180,255,0.06)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    color: 'rgba(220,180,255,0.95)',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  ✦ PATTERN
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ ...labelStyle, width: 56 }}>MODE</span>
                  <select
                    value={mode}
                    onChange={(e) =>
                      onUpdateLayer(active.id, {
                        patternMode: e.target.value as PatternMode,
                      })
                    }
                    style={{
                      flex: 1,
                      fontFamily: 'monospace',
                      fontSize: 10,
                      background: 'rgba(0,0,0,0.5)',
                      color: 'rgba(255,255,255,0.9)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      padding: '2px 4px',
                    }}
                  >
                    {PATTERN_MODES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                {mode === 'kaleido' &&
                  sliderRow(
                    'FOLDS',
                    active.kaleidoFolds ?? 6,
                    (v) => Math.round(v).toString(),
                    1,
                    32,
                    1,
                    (v) =>
                      onUpdateLayer(active.id, {
                        kaleidoFolds: Math.round(v),
                      }),
                  )}
                {mode === 'mirrorStage' &&
                  sliderRow(
                    'OFFSET',
                    active.spacingX ?? 0.25,
                    (v) => v.toFixed(2),
                    0,
                    0.5,
                    0.01,
                    (v) => onUpdateLayer(active.id, { spacingX: v }),
                  )}
              </div>
            )
          })()}

              {/* COMPOSITION controls — kaleidoscope + mirror — apply to
              ALL effect layers (wireframes, plasma, leaks, etc.). */}
          {(() => {
            const meta = ASSETS.find((a) => a.id === active.asset)
            if (!meta?.effectId) return null
            return (
              <>
                {sliderRow(
                  'KALEIDO',
                  active.kaleidoscope ?? 1,
                  (v) => Math.round(v).toString(),
                  1,
                  12,
                  1,
                  (v) =>
                    onUpdateLayer(active.id, {
                      kaleidoscope: Math.round(v),
                    }),
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <span style={{ ...labelStyle, width: 56 }}>MIRROR</span>
                  <button
                    onClick={() =>
                      onUpdateLayer(active.id, {
                        mirrorX: !(active.mirrorX ?? false),
                      })
                    }
                    style={{
                      ...smallBtn,
                      flex: 1,
                      background: active.mirrorX
                        ? 'rgba(255,255,255,0.92)'
                        : 'transparent',
                      color: active.mirrorX ? '#000' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    ↔ X
                  </button>
                  <button
                    onClick={() =>
                      onUpdateLayer(active.id, {
                        mirrorY: !(active.mirrorY ?? false),
                      })
                    }
                    style={{
                      ...smallBtn,
                      flex: 1,
                      background: active.mirrorY
                        ? 'rgba(255,255,255,0.92)'
                        : 'transparent',
                      color: active.mirrorY ? '#000' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    ↕ Y
                  </button>
                </div>
                {/* Color cycle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <span style={{ ...labelStyle, width: 56 }}>HUE CYC</span>
                  <button
                    onClick={() =>
                      onUpdateLayer(active.id, {
                        colorCycle: !(active.colorCycle ?? false),
                      })
                    }
                    style={{
                      ...smallBtn,
                      flex: 1,
                      background: active.colorCycle
                        ? 'rgba(180,120,255,0.85)'
                        : 'transparent',
                      color: active.colorCycle
                        ? '#000'
                        : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {active.colorCycle ? '◉ ON' : '○ OFF'}
                  </button>
                </div>
                {active.colorCycle && (
                  <>
                    {sliderRow(
                      'CYC SPD',
                      active.colorCycleSpeed ?? 1,
                      (v) => v.toFixed(2),
                      0.1,
                      3,
                      0.05,
                      (v) =>
                        onUpdateLayer(active.id, { colorCycleSpeed: v }),
                    )}
                    {sliderRow(
                      'CYC RNG',
                      active.colorCycleRange ?? 360,
                      (v) => Math.round(v).toString(),
                      30,
                      720,
                      10,
                      (v) =>
                        onUpdateLayer(active.id, { colorCycleRange: v }),
                    )}
                  </>
                )}
              </>
            )
          })()}

          {/* WIREFRAME controls — visible only when the active asset
              is a wireframe effect (effectId starting with 'wire'). */}
          {(() => {
            const meta = ASSETS.find((a) => a.id === active.asset)
            const isWire = !!meta?.effectId?.startsWith('wire')
            if (!isWire) return null
            return (
              <div
                style={{
                  marginTop: 6,
                  padding: 6,
                  border: '1px dashed rgba(180,220,255,0.5)',
                  background: 'rgba(120,200,255,0.06)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    color: 'rgba(180,220,255,0.95)',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  ✦ WIREFRAME 3D
                </div>
                {sliderRow(
                  'SPEED',
                  active.wireSpeed ?? 1,
                  (v) => v.toFixed(2),
                  0,
                  3,
                  0.05,
                  (v) => onUpdateLayer(active.id, { wireSpeed: v }),
                )}
                {sliderRow(
                  'STROKE',
                  active.wireStrokeWidth ?? 1.4,
                  (v) => v.toFixed(2),
                  0.5,
                  6,
                  0.1,
                  (v) => onUpdateLayer(active.id, { wireStrokeWidth: v }),
                )}
                {sliderRow(
                  'PERSP',
                  active.wirePerspective ?? 3,
                  (v) => v.toFixed(2),
                  1.5,
                  6,
                  0.1,
                  (v) => onUpdateLayer(active.id, { wirePerspective: v }),
                )}
                {sliderRow(
                  'X-MIX',
                  active.wireRotMix ?? 0.5,
                  (v) => v.toFixed(2),
                  0,
                  1,
                  0.05,
                  (v) => onUpdateLayer(active.id, { wireRotMix: v }),
                )}
                {sliderRow(
                  'COUNT',
                  active.wireMultiplier ?? 1,
                  (v) => Math.round(v).toString(),
                  1,
                  8,
                  1,
                  (v) =>
                    onUpdateLayer(active.id, {
                      wireMultiplier: Math.round(v),
                    }),
                )}
                {sliderRow(
                  'DENSITY',
                  active.wireDensity ?? 1,
                  (v) => v.toFixed(2),
                  0.5,
                  2,
                  0.05,
                  (v) => onUpdateLayer(active.id, { wireDensity: v }),
                )}
                {sliderRow(
                  'DASH',
                  active.wireDashLength ?? 0,
                  (v) => v.toFixed(1),
                  0,
                  20,
                  0.5,
                  (v) => onUpdateLayer(active.id, { wireDashLength: v }),
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <span style={{ ...labelStyle, width: 56 }}>FREEZE</span>
                  <button
                    onClick={() =>
                      onUpdateLayer(active.id, {
                        wireFreeze: !(active.wireFreeze ?? false),
                      })
                    }
                    style={{
                      ...smallBtn,
                      background: active.wireFreeze
                        ? 'rgba(255,255,255,0.92)'
                        : 'transparent',
                      color: active.wireFreeze
                        ? '#000'
                        : 'rgba(255,255,255,0.7)',
                      flex: 1,
                    }}
                  >
                    {active.wireFreeze ? '■ FROZEN' : '▶ ANIMATING'}
                  </button>
                </div>
                {/* Trails */}
                {sliderRow(
                  'TRAIL',
                  active.wireTrailCount ?? 0,
                  (v) => Math.round(v).toString(),
                  0,
                  8,
                  1,
                  (v) =>
                    onUpdateLayer(active.id, {
                      wireTrailCount: Math.round(v),
                    }),
                )}
                {(active.wireTrailCount ?? 0) > 0 && (
                  <>
                    {sliderRow(
                      'DECAY',
                      active.wireTrailDecay ?? 0.6,
                      (v) => v.toFixed(2),
                      0.3,
                      0.95,
                      0.01,
                      (v) =>
                        onUpdateLayer(active.id, { wireTrailDecay: v }),
                    )}
                    {sliderRow(
                      'TR BLUR',
                      active.wireTrailBlur ?? 0,
                      (v) => v.toFixed(1),
                      0,
                      8,
                      0.2,
                      (v) =>
                        onUpdateLayer(active.id, { wireTrailBlur: v }),
                    )}
                  </>
                )}
                {/* Depth fog */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <span style={{ ...labelStyle, width: 56 }}>DEPTH</span>
                  <button
                    onClick={() =>
                      onUpdateLayer(active.id, {
                        wireDepthFog: !(active.wireDepthFog ?? false),
                      })
                    }
                    style={{
                      ...smallBtn,
                      flex: 1,
                      background: active.wireDepthFog
                        ? 'rgba(120,200,255,0.85)'
                        : 'transparent',
                      color: active.wireDepthFog
                        ? '#000'
                        : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {active.wireDepthFog ? '◉ FOG ON' : '○ FOG OFF'}
                  </button>
                </div>
                {active.wireDepthFog &&
                  sliderRow(
                    'FOG AMT',
                    active.wireDepthFogAmount ?? 0.7,
                    (v) => v.toFixed(2),
                    0,
                    1,
                    0.05,
                    (v) =>
                      onUpdateLayer(active.id, { wireDepthFogAmount: v }),
                  )}
              </div>
            )
          })()}

          {active.motion === 'pulse' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <span style={{ ...labelStyle, width: 56 }}>PULSE</span>
                  <select
                    value={active.pulseTarget ?? 'scale'}
                    onChange={(e) =>
                      onUpdateLayer(active.id, {
                        pulseTarget: e.target.value as PulseTarget,
                      })
                    }
                    style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      fontFamily: 'monospace',
                      fontSize: 10,
                      padding: '3px 4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {PULSE_TARGETS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Layer action buttons — Randomize / Reset / Solo */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 4,
              marginTop: 8,
            }}
          >
            <button
              onClick={() =>
                onUpdateLayer(active.id, {
                  randomSeed: Math.floor(Math.random() * 0xffffffff) >>> 0,
                  motionPhase: Math.random(),
                })
              }
              title="Pick a fresh phase + jitter seed"
              style={{ ...smallBtn, textAlign: 'center' }}
            >
              ⟲ MOTION
            </button>
            <button
              onClick={() => {
                // For procedural assets, "shape randomize" re-seeds
                // within the same family. For static assets, pick a
                // different one compatible with the layer's type.
                const meta = ASSETS.find((a) => a.id === active.asset)
                if (meta?.procedural) {
                  onUpdateLayer(active.id, {
                    assetSeed: Math.floor(Math.random() * 0xffffffff) >>> 0,
                  })
                  return
                }
                const pool = ASSETS.filter((a) =>
                  a.recommendedModes.includes(active.type),
                )
                const pick = pool[Math.floor(Math.random() * pool.length)]
                if (pick) onUpdateLayer(active.id, { asset: pick.id })
              }}
              title={
                ASSETS.find((a) => a.id === active.asset)?.procedural
                  ? 'Re-seed this procedural shape'
                  : "Pick a random compatible shape"
              }
              style={{ ...smallBtn, textAlign: 'center' }}
            >
              ⟲ SHAPE
            </button>
            <button
              onClick={() => {
                // Reset transform/animation but preserve identity (id, type, asset, source).
                const fresh = makeLayer(active.type, active.asset)
                onUpdateLayer(active.id, {
                  x: fresh.x,
                  y: fresh.y,
                  scale: fresh.scale,
                  rotation: fresh.rotation,
                  opacity: fresh.opacity,
                  blur: fresh.blur,
                  glow: fresh.glow,
                  invert: fresh.invert,
                  blendMode: fresh.blendMode,
                  motion: fresh.motion,
                  motionSpeed: fresh.motionSpeed,
                  motionAmount: fresh.motionAmount,
                  motionPhase: fresh.motionPhase,
                  motionRandomness: fresh.motionRandomness,
                  orbitRadius: fresh.orbitRadius,
                  pulseTarget: fresh.pulseTarget,
                })
              }}
              title="Reset transform / motion to defaults; keep the source intact"
              style={{ ...smallBtn, textAlign: 'center' }}
            >
              ⟲ RESET
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
