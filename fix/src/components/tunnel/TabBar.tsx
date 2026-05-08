import type { CSSProperties } from 'react'
import {
  FLASH_TABS,
  TAB_LABELS,
  TAB_ORDER,
  type TabId,
} from './presets'

// ─── Tab strip ─────────────────────────────────────────────────────
// Horizontal row of buttons, one per `TAB_ORDER`, with an optional
// trailing `MY SET` button when the user has favorites
// (`hasFavorites` — chunk 10 wires this up). RAVE / GLITCH render a
// stub ⚠ FLASH badge next to their labels; the real flash gate ships
// in chunk 9.
//
// Active tab gets a visual highlight (filled background + white
// border + bright text). Other tabs are dim until hover.

type TabBarProps = {
  activeTab: TabId
  hasFavorites?: boolean
  onTabClick: (tab: TabId) => void
}

const labelStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 9,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}

export function TabBar({ activeTab, hasFavorites = false, onTabClick }: TabBarProps) {
  const tabs: TabId[] = hasFavorites ? [...TAB_ORDER, 'myset'] : [...TAB_ORDER]

  return (
    <div
      role="tablist"
      aria-label="Preset categories"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0,
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        marginBottom: 8,
      }}
    >
      {tabs.map((tab) => {
        const active = tab === activeTab
        const flash = FLASH_TABS.has(tab)
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={active}
            onClick={() => onTabClick(tab)}
            style={{
              ...labelStyle,
              padding: '6px 8px',
              background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: '1px solid rgba(255,255,255,0.10)',
              borderBottom: active
                ? '2px solid #ffffff'
                : '2px solid transparent',
              color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{TAB_LABELS[tab]}</span>
            {flash && (
              <span
                aria-label="contains flashing visuals"
                title="Contains flashing visuals"
                style={{
                  fontSize: 8,
                  letterSpacing: 0,
                  color: 'rgba(255,200,80,0.85)',
                }}
              >
                ⚠
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
