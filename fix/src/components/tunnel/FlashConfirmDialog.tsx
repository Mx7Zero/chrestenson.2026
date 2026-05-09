import type { CSSProperties } from 'react'

// ─── FlashConfirmDialog (chunk 9) ─────────────────────────────────
// First-click confirmation prompt for any preset that carries
// `flashWarn: true`. Renders as a centered modal-style overlay above
// the bird container. Two affordances:
//
//   • CONTINUE       → applies the preset as authored
//   • USE REDUCED    → applies the preset AND flips REDUCED FLASH on
//                      so the safety clamp clips the seizure-risk
//                      fields back to safe ceilings
//
// Once dismissed (either path), `localStorage.chrestenson.tunnel.
// flashConfirmed` flips to '1' — AsteroidScene reads this on each
// preset click and skips the dialog from then on. The user can
// always engage REDUCED FLASH manually from TunePanel later.

type FlashConfirmDialogProps = {
  presetName: string
  onContinue: () => void
  onUseReducedFlash: () => void
  onCancel: () => void
}

const overlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 10,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // The dialog itself is the only interactive thing; the rest of the
  // overlay swallows clicks (and the cancel handler treats those as a
  // dismiss). pointerEvents on, so the bird canvas underneath can't
  // be dragged while the prompt is up.
  pointerEvents: 'auto',
}

const dialogStyle: CSSProperties = {
  width: 'min(420px, 90%)',
  background: 'rgba(0,0,0,0.92)',
  border: '1px solid rgba(255,200,80,0.5)',
  padding: '20px 22px 18px 22px',
  fontFamily: 'monospace',
  color: 'rgba(255,255,255,0.85)',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
}

const buttonRowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
}

const buttonBase: CSSProperties = {
  flex: 1,
  minWidth: 140,
  padding: '8px 12px',
  fontFamily: 'monospace',
  fontSize: 10,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: 'rgba(255,255,255,0.85)',
}

const continueButton: CSSProperties = {
  ...buttonBase,
  background: 'rgba(255,200,80,0.2)',
  borderColor: 'rgba(255,200,80,0.6)',
  color: '#ffd58a',
}

export function FlashConfirmDialog({
  presetName,
  onContinue,
  onUseReducedFlash,
  onCancel,
}: FlashConfirmDialogProps) {
  return (
    <div
      style={overlayStyle}
      onClick={(e) => {
        // Click outside the dialog body cancels — same as ESC. Lets
        // the user back out without committing to either path.
        if (e.target === e.currentTarget) onCancel()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Flash warning"
    >
      <div style={dialogStyle}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.3em',
            color: 'rgba(255,200,80,0.9)',
            textTransform: 'uppercase',
          }}
        >
          ⚠ FLASH WARNING
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.55 }}>
          <strong style={{ color: '#ffffff' }}>{presetName}</strong> includes
          flashing visuals that may not be suitable for everyone, including
          people with photosensitive epilepsy.
        </div>
        <div
          style={{
            fontSize: 10,
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          REDUCED FLASH clamps strobe rate, chromatic separation, and hue drift
          to safe ceilings. You can change this any time in TUNE.
        </div>
        <div style={buttonRowStyle}>
          <button style={continueButton} onClick={onContinue}>
            Continue
          </button>
          <button style={buttonBase} onClick={onUseReducedFlash}>
            Use Reduced Flash
          </button>
        </div>
      </div>
    </div>
  )
}
