import { describe, it } from 'vitest'

// `useMouseWake` is a React hook. Exercising it in vitest requires
// jsdom + a render-hook helper (e.g. @testing-library/react), neither
// of which is configured in this project. The behavior is covered by
// the Playwright e2e spec at `fix/e2e/tunnel-fullscreen.spec.ts`,
// which drives real `mousemove` events and asserts the transport bar
// visibility transitions.
//
// Leaving these as `it.todo` so the suite documents the intended
// coverage shape if a future chunk wires up jsdom or moves to
// renderHook for hook-level unit testing.

describe('useMouseWake', () => {
  it.todo('returns true initially')
  it.todo('returns false after idleMs without input')
  it.todo('returns true after mousemove during idle window')
  it.todo('returns true after keydown during idle window')
})
