import type { CSSProperties } from 'react'
import { TabBar } from './TabBar'
import {
  FLASH_TABS,
  TAB_CAPABILITY_COPY,
  type Preset,
  type TabId,
} from './presets'
import type { TunnelLook } from './generator/generateLook'
import { TUNNEL_DEFAULTS } from '../TunnelCanvas'
import { deriveChips } from './chips'

// ─── Presets panel ─────────────────────────────────────────────────
// Right-side collapsible panel. Renders the tab strip across the
// top, the active tab's capability copy line, and a 3-column tile
// grid of presets that match the active tab.
//
// Tile shape:
//   • preset name (top)
//   • ★ stub button (chunk 10 wires favorites)
//   • ⚠ FLASH chip if `flashWarn` (chunk 9 wires the gate)
//   • auto-derived engine chips + paletteName closer (chunk 6)
//
// Click a tile → `onPresetClick(preset)` triggers a 600ms morph.
//
// Chunk 6 — chips are derived from the resolved params
// `{...TUNNEL_DEFAULTS, ...preset.values}` via `deriveChips`. Up to 4
// chips render per tile (3 auto + paletteName). The chip row uses
// `flexWrap` so it spills to a second row on long chip combinations
// rather than truncating. Tile minHeight grew to 80 to accommodate.

type PresetsPanelProps = {
  open: boolean
  onToggle: () => void
  activeTab: TabId
  presets: Preset[]
  hasFavorites?: boolean
  activePresetId?: string | null
  onTabClick: (tab: TabId) => void
  onPresetClick: (preset: Preset) => void
  onFavoriteToggle?: (preset: Preset) => void
  // 2026-05-08 reframe: MY SET tab renders saved generated looks
  // (TunnelLook[]) instead of catalog presets. Pass the saved list
  // here; tiles get a delete affordance instead of a star.
  mySetLooks?: TunnelLook[]
  onLookDelete?: (look: TunnelLook) => void
  // Chunk 7 — when fullscreen showcase mode is active, the panel is
  // pulled out of the layout entirely (display:none rather than
  // collapsed-via-toggle). The toggle state is preserved so exiting
  // fullscreen returns the user to whatever drawer config they had.
  hidden?: boolean
  // Which screen edge the drawer anchors to. 'left' puts the toggle
  // tab on the right edge of the panel (so the tab faces the screen
  // center); 'right' is the original behavior. Defaults to 'right'.
  side?: 'left' | 'right'
}

const PANEL_WIDTH = 360

const headerStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 9,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.55)',
}

const chipStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 8,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '1px 4px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.14)',
  color: 'rgba(255,255,255,0.65)',
  whiteSpace: 'nowrap',
  // Tile is ~118px wide; the closing palette chip is the only one
  // we make sure stands out with a slightly brighter border.
}

const paletteChipStyle: CSSProperties = {
  ...chipStyle,
  color: 'rgba(255,255,255,0.85)',
  borderColor: 'rgba(255,255,255,0.28)',
}

export function PresetsPanel({
  open,
  onToggle,
  activeTab,
  presets,
  hasFavorites,
  activePresetId,
  onTabClick,
  onPresetClick,
  onFavoriteToggle,
  mySetLooks = [],
  onLookDelete,
  hidden = false,
  side = 'right',
}: PresetsPanelProps) {
  const isMySet = activeTab === 'myset'
  // For MY SET we render saved looks; otherwise filter the catalog by tab.
  const visiblePresets: Preset[] = isMySet
    ? mySetLooks
    : presets.filter(
        (p) => p.tab === activeTab && !p.id.includes('.__validate-'),
      )

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
            padding: '12px 14px',
            width: PANEL_WIDTH,
            maxHeight: '60vh',
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ ...headerStyle, marginBottom: 6 }}>PRESETS</div>

          <TabBar
            activeTab={activeTab}
            hasFavorites={hasFavorites}
            onTabClick={onTabClick}
          />

          <p
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.6)',
              margin: '0 0 10px 0',
            }}
          >
            {TAB_CAPABILITY_COPY[activeTab]}
            {FLASH_TABS.has(activeTab) && (
              <span
                style={{
                  marginLeft: 6,
                  color: 'rgba(255,200,80,0.85)',
                }}
              >
                ⚠ FLASH
              </span>
            )}
          </p>

          {visiblePresets.length === 0 ? (
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                color: 'rgba(255,255,255,0.4)',
                padding: '24px 4px',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              {isMySet
                ? 'No saved looks yet. Hit ✨ GENERATE then ☆ SAVE to start your set.'
                : 'No presets in this tab.'}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
              }}
            >
              {visiblePresets.map((p) => {
                const active = activePresetId === p.id
                const chips = deriveChips(
                  { ...TUNNEL_DEFAULTS, ...p.values },
                  p.paletteName,
                )
                // Last chip is always paletteName — split it out so we
                // can style the closer differently (brighter border).
                const autoChips = chips.slice(0, -1)
                return (
                  <div
                    key={p.id}
                    style={{
                      position: 'relative',
                      background: active
                        ? 'rgba(255,255,255,0.16)'
                        : 'rgba(255,255,255,0.05)',
                      border: active
                        ? '1.5px solid #ffffff'
                        : '1px solid rgba(255,255,255,0.18)',
                      padding: '6px 6px 8px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      minHeight: 80,
                    }}
                    onClick={() => onPresetClick(p)}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 9,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: active ? '#ffffff' : 'rgba(255,255,255,0.85)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {p.name}
                      </span>
                      <button
                        type="button"
                        aria-label={
                          isMySet
                            ? `Delete ${p.name}`
                            : `Favorite ${p.name}`
                        }
                        title={isMySet ? 'Delete from MY SET' : 'Favorite'}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isMySet) {
                            onLookDelete?.(p as TunnelLook)
                          } else if (onFavoriteToggle) {
                            onFavoriteToggle(p)
                          }
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isMySet
                            ? 'rgba(255,140,140,0.65)'
                            : 'rgba(255,255,255,0.4)',
                          fontSize: 10,
                          cursor: 'pointer',
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        {isMySet ? '✕' : '☆'}
                      </button>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3,
                      }}
                    >
                      {p.flashWarn && (
                        <span
                          style={{
                            ...chipStyle,
                            color: 'rgba(255,200,80,0.85)',
                            borderColor: 'rgba(255,200,80,0.4)',
                          }}
                        >
                          ⚠ FLASH
                        </span>
                      )}
                      {autoChips.map((c) => (
                        <span key={c} style={chipStyle}>
                          {c}
                        </span>
                      ))}
                      <span style={paletteChipStyle}>{p.paletteName}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onToggle}
        aria-label="Presets panel toggle"
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
            ? '◂ PRESETS'
            : '▸ PRESETS'
          : open
          ? '▸ PRESETS'
          : '◂ PRESETS'}
      </button>
    </div>
  )
}
