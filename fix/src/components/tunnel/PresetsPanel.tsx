import type { CSSProperties } from 'react'
import { TabBar } from './TabBar'
import {
  FLASH_TABS,
  TAB_CAPABILITY_COPY,
  type Preset,
  type TabId,
} from './presets'

// ─── Presets panel ─────────────────────────────────────────────────
// Right-side collapsible panel. Renders the tab strip across the
// top, the active tab's capability copy line, and a 3-column tile
// grid of presets that match the active tab.
//
// Tile shape (chunk 3 — chrome only):
//   • preset name (top)
//   • palette name (sub-text)
//   • ★ stub button (chunk 10 wires favorites)
//   • ⚠ FLASH chip if `flashWarn` (chunk 9 wires the gate)
//
// Click a tile → `onPresetClick(preset)` (instant apply for now;
// chunk 4 swaps in the morph).
//
// Chip wiring (auto-derived from `values`) lands in chunk 6; for now
// each tile shows palette + an `id` chip placeholder so the grid
// looks structurally correct.

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
  fontSize: 7,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '1px 5px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.14)',
  color: 'rgba(255,255,255,0.65)',
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
}: PresetsPanelProps) {
  const visiblePresets = presets.filter(
    (p) => p.tab === activeTab && !p.id.includes('.__validate-'),
  )

  return (
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
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
            borderRight: 'none',
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
              }}
            >
              No presets yet — coming in chunk 5.
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
                      minHeight: 64,
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
                        aria-label={`Favorite ${p.name}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onFavoriteToggle) onFavoriteToggle(p)
                          else
                            // chunk 10: wire favorites
                            console.info('chunk 10: not yet implemented (favorite)')
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: 10,
                          cursor: 'pointer',
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ☆
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
                      <span style={chipStyle}>{p.paletteName}</span>
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
        {open ? '▸ PRESETS' : '◂ PRESETS'}
      </button>
    </div>
  )
}
