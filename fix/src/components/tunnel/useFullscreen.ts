import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'

// ─── useFullscreen ─────────────────────────────────────────────────
// Thin wrapper around the standard Fullscreen API. `enter()` requests
// fullscreen on the element behind the passed ref; `exit()` releases
// it. `active` mirrors `document.fullscreenElement === ref.current`.
//
// Constraints:
//   • `requestFullscreen` is gesture-gated by the browser, so `enter`
//     must be called from a user-initiated event handler.
//   • ESC to exit is browser-handled — we do NOT add a key listener.
//   • The `?.` chains are deliberate. Older Safari + a few embedded
//     WebViews don't expose `requestFullscreen` on every element.
//     We treat that as a no-op rather than throwing.

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false)

  const enter = useCallback(() => {
    const el = ref.current
    if (!el) return
    // Standard, then -webkit- prefix for older Safari builds.
    const req =
      el.requestFullscreen?.bind(el) ??
      (el as unknown as { webkitRequestFullscreen?: () => Promise<void> })
        .webkitRequestFullscreen?.bind(el)
    req?.()
  }, [ref])

  const exit = useCallback(() => {
    const ex =
      document.exitFullscreen?.bind(document) ??
      (
        document as unknown as {
          webkitExitFullscreen?: () => Promise<void>
        }
      ).webkitExitFullscreen?.bind(document)
    ex?.()
  }, [])

  useEffect(() => {
    const onChange = () => {
      const fsEl =
        document.fullscreenElement ??
        (
          document as unknown as {
            webkitFullscreenElement?: Element | null
          }
        ).webkitFullscreenElement ??
        null
      setActive(fsEl === ref.current)
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [ref])

  return { active, enter, exit }
}
