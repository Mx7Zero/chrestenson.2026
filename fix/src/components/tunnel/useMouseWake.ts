import { useEffect, useState } from 'react'

// ─── useMouseWake ──────────────────────────────────────────────────
// Returns `true` while the user is "awake" (recent mousemove or
// keydown), `false` after `idleMs` of inactivity. Used in chunk 7 to
// auto-hide the transport bar in fullscreen showcase mode.
//
// Notes:
//   • The hook starts awake so the chrome is visible on entry.
//   • `mousemove` and `keydown` reset the idle timer. `keydown` is
//     included so a presenter using keyboard navigation (e.g. ESC,
//     Tab, arrows) keeps the bar visible.
//   • Outside fullscreen, the caller should ignore the return value
//     and treat the chrome as always visible — the hook does not
//     opine on fullscreen state itself.

export function useMouseWake(idleMs = 2500) {
  const [awake, setAwake] = useState(true)

  useEffect(() => {
    let timer: number | null = null
    const wake = () => {
      setAwake(true)
      if (timer !== null) window.clearTimeout(timer)
      timer = window.setTimeout(() => setAwake(false), idleMs)
    }
    // Prime the timer so an idle session correctly transitions to
    // sleep without requiring an initial mousemove.
    wake()
    window.addEventListener('mousemove', wake)
    window.addEventListener('keydown', wake)
    return () => {
      if (timer !== null) window.clearTimeout(timer)
      window.removeEventListener('mousemove', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [idleMs])

  return awake
}
