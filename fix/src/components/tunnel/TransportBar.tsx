import type { CSSProperties } from 'react'
import type { TunnelParams } from '../TunnelCanvas'
import { TUNNEL_DEFAULTS } from '../TunnelCanvas'
import { deriveChips } from './chips'
import type { Intensity } from './intensity'

// ─── Transport bar ─────────────────────────────────────────────────
// Bottom-anchored full-width strip on the bird section. Houses the
// now-playing line and the transport buttons.
//
// 2026-05-08 reframe: VARIATION → GENERATE. The button now mints a
// fresh seed and asks the engine for a deterministic genre-constrained
// look. SAVE persists the current look into MY SET. SHARE copies the
// hash-encoded deep link. AsteroidScene owns generator + savedLooks
// state and passes the handlers in.

type TransportBarProps = {
  nowPlayingName: string
  paletteName?: string
  // Chunk 6 — partial values from the active preset; merged with
  // TUNNEL_DEFAULTS to derive auto-chips for the now-playing line.
  activePresetValues?: Partial<TunnelParams>
  // Chunk 4 — DEMO wiring.
  demoActive?: boolean
  onDemoToggle?: () => void
  // GENERATE — mint a fresh seeded look in the active genre.
  onGenerate?: () => void
  generateDisabled?: boolean
  // SAVE — persist the current look into MY SET. Disabled when
  // there's no current look or the current look is already saved.
  onSave?: () => void
  saveDisabled?: boolean
  saved?: boolean
  // SHARE — copy a deep-link of the current look.
  onShare?: () => void
  shareCopied?: boolean
  // Chunk 7 — FULLSCREEN wiring.
  fullscreenActive?: boolean
  onFullscreenToggle?: () => void
  visible?: boolean
  // Chunk 9 — INTENSITY 3-button group.
  intensity?: Intensity
  onIntensityChange?: (level: Intensity) => void
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

export function TransportBar({
  nowPlayingName,
  paletteName,
  activePresetValues,
  demoActive = false,
  onDemoToggle,
  onGenerate,
  generateDisabled = false,
  onSave,
  saveDisabled = false,
  saved = false,
  onShare,
  shareCopied = false,
  fullscreenActive = false,
  onFullscreenToggle,
  visible = true,
  intensity = 'full',
  onIntensityChange,
}: TransportBarProps) {
  const autoChips =
    paletteName && activePresetValues
      ? deriveChips(
          { ...TUNNEL_DEFAULTS, ...activePresetValues },
          paletteName,
        ).slice(0, -1)
      : []
  return (
    <div
      data-testid="transport-bar"
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
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transition: 'opacity 0.2s ease, visibility 0.2s ease',
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
        {autoChips.map((c) => (
          <span key={c} style={{ display: 'contents' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{c}</span>
          </span>
        ))}
        {paletteName && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              {paletteName}
            </span>
          </>
        )}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            pointerEvents: 'auto',
          }}
        >
          {onShare && (
            <button
              onClick={onShare}
              aria-label="Copy share link"
              title="Copy share link"
              style={{
                background: 'transparent',
                border: 'none',
                color: shareCopied
                  ? 'rgba(120,255,180,0.95)'
                  : 'rgba(255,255,255,0.55)',
                fontSize: 10,
                letterSpacing: '0.25em',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'monospace',
                textTransform: 'uppercase',
              }}
            >
              {shareCopied ? '✓ COPIED' : '⤴ SHARE'}
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saveDisabled || !onSave}
            aria-label={saved ? 'Saved to MY SET' : 'Save to MY SET'}
            title={saved ? 'Already saved' : 'Save to MY SET'}
            style={{
              background: 'transparent',
              border: 'none',
              color: saved
                ? 'rgba(255,220,120,0.95)'
                : saveDisabled || !onSave
                ? 'rgba(255,255,255,0.25)'
                : 'rgba(255,255,255,0.7)',
              fontSize: 10,
              letterSpacing: '0.25em',
              cursor: saveDisabled || !onSave ? 'not-allowed' : 'pointer',
              padding: 0,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}
          >
            {saved ? '★ SAVED' : '☆ SAVE'}
          </button>
        </div>
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
          onClick={onGenerate}
          disabled={generateDisabled || !onGenerate}
          style={{
            ...buttonBase,
            background:
              generateDisabled || !onGenerate
                ? 'rgba(120,200,255,0.10)'
                : 'rgba(120,200,255,0.22)',
            borderColor: 'rgba(180,220,255,0.55)',
            color: '#ffffff',
            opacity: generateDisabled || !onGenerate ? 0.45 : 1,
            cursor:
              generateDisabled || !onGenerate ? 'not-allowed' : 'pointer',
          }}
        >
          ✨ GENERATE
        </button>
        <button
          onClick={onDemoToggle}
          disabled={!onDemoToggle}
          style={{
            ...buttonBase,
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

        <div
          role="group"
          aria-label="Intensity"
          style={{ display: 'inline-flex', marginLeft: 4 }}
        >
          {(
            [
              { label: 'CALM', level: 'calm' as const },
              { label: 'FULL', level: 'full' as const },
              { label: 'OVERDRIVE', level: 'overdrive' as const },
            ]
          ).map(({ label, level }, i, arr) => {
            const isLast = i === arr.length - 1
            const active = intensity === level
            return (
              <button
                key={label}
                onClick={() => onIntensityChange?.(level)}
                disabled={!onIntensityChange}
                aria-pressed={active}
                style={{
                  ...intensitySegmentBase,
                  background: active
                    ? 'rgba(255,255,255,0.92)'
                    : 'rgba(0,0,0,0.5)',
                  color: active ? '#000000' : 'rgba(255,255,255,0.6)',
                  borderColor: active
                    ? 'rgba(255,255,255,0.92)'
                    : 'rgba(255,255,255,0.25)',
                  borderRight: isLast
                    ? active
                      ? '1px solid rgba(255,255,255,0.92)'
                      : '1px solid rgba(255,255,255,0.25)'
                    : 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <button
          onClick={onFullscreenToggle}
          disabled={!onFullscreenToggle}
          style={{
            ...buttonBase,
            marginLeft: 'auto',
            background: fullscreenActive
              ? 'rgba(255,255,255,0.92)'
              : buttonBase.background,
            color: fullscreenActive ? '#000000' : buttonBase.color,
            borderColor: fullscreenActive
              ? 'rgba(255,255,255,0.92)'
              : 'rgba(255,255,255,0.25)',
          }}
          aria-label={
            fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen'
          }
        >
          {fullscreenActive ? '⛶ EXIT' : '⛶ FULLSCREEN'}
        </button>
      </div>
    </div>
  )
}
