import type { CSSProperties } from 'react'

// ─── Transport bar ─────────────────────────────────────────────────
// Bottom-anchored full-width strip on the bird section. Houses the
// now-playing line and the transport buttons. Chunk 4 wires DEMO;
// the other buttons stay stubbed until their respective chunks.
//
// Wiring lands in:
//   • DEMO         — chunk 4 ✓
//   • VARIATION    — chunk 8
//   • INTENSITY    — chunk 9 (CALM · FULL · OVERDRIVE)
//   • FULLSCREEN   — chunk 7
//   • SHARE        — chunk 11

type TransportBarProps = {
  nowPlayingName: string
  paletteName?: string
  // Chunk 4 — DEMO wiring.
  demoActive?: boolean
  onDemoToggle?: () => void
}

const buttonBase: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 10,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.25)',
  color: 'rgba(255,255,255,0.85)',
  padding: '6px 12px',
  cursor: 'pointer',
}

const intensitySegmentBase: CSSProperties = {
  ...buttonBase,
  borderRight: 'none',
  padding: '6px 10px',
}

const stub = (label: string, chunk: number) => () =>
  console.info(`chunk ${chunk}: not yet implemented (${label})`)

export function TransportBar({
  nowPlayingName,
  paletteName,
  demoActive = false,
  onDemoToggle,
}: TransportBarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3,
        padding: '10px 18px 14px 18px',
        background:
          'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.85) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {/* Now-playing line */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.85)',
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>NOW</span>
        <span style={{ color: '#ffffff' }}>{nowPlayingName}</span>
        {paletteName && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              {paletteName}
            </span>
          </>
        )}
        <button
          aria-label="Favorite current preset"
          onClick={stub('favorite-now-playing', 10)}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 12,
            cursor: 'pointer',
            padding: 0,
            pointerEvents: 'auto',
          }}
        >
          ☆
        </button>
      </div>

      {/* Transport row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={onDemoToggle}
          disabled={!onDemoToggle}
          style={{
            ...buttonBase,
            // Active state — invert background so the button reads as
            // a recording-light when DEMO is cycling.
            background: demoActive
              ? 'rgba(255,255,255,0.92)'
              : buttonBase.background,
            color: demoActive ? '#000000' : buttonBase.color,
            borderColor: demoActive
              ? 'rgba(255,255,255,0.92)'
              : 'rgba(255,255,255,0.25)',
          }}
        >
          {demoActive ? '■ STOP' : '▶ DEMO'}
        </button>
        <button onClick={stub('variation', 8)} style={buttonBase}>
          ⟲ VARIATION
        </button>

        {/* Intensity segment group — visual only */}
        <div
          role="group"
          aria-label="Intensity"
          style={{ display: 'inline-flex', marginLeft: 4 }}
        >
          {(['CALM', 'FULL', 'OVERDRIVE'] as const).map((label, i, arr) => {
            const isLast = i === arr.length - 1
            const active = label === 'FULL'
            return (
              <button
                key={label}
                onClick={stub(`intensity-${label.toLowerCase()}`, 9)}
                style={{
                  ...intensitySegmentBase,
                  background: active ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.5)',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  borderRight: isLast
                    ? '1px solid rgba(255,255,255,0.25)'
                    : 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <button
          onClick={stub('fullscreen', 7)}
          style={{ ...buttonBase, marginLeft: 'auto' }}
          aria-label="Fullscreen"
        >
          ⛶ FULLSCREEN
        </button>
      </div>
    </div>
  )
}
