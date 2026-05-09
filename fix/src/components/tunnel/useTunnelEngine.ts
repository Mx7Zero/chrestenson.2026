import { useCallback, useEffect, useRef, useState } from 'react'
import { TUNNEL_DEFAULTS, type TunnelParams } from '../TunnelCanvas'
import type { Preset } from './presets'
import { morphParams } from './morph'
import { applyIntensity, type Intensity } from './intensity'
import { applyReducedFlash } from './safety'

// ─── useTunnelEngine ──────────────────────────────────────────────
// Owns the composite engine state introduced in chunk 4:
//   • fromParams / toParams        — morph endpoints
//   • morphStartedAt / Duration    — drives lerp t
//   • activePreset                 — for the now-playing line
//   • demoActive / demoIndex       — DEMO mode auto-cycle
//
// The hook exposes a `paramsRef` that is updated each animation frame
// while a morph is in progress, so the renderer (<Tunnel>) can read
// from it inside its own `useFrame` without forcing 60fps React
// re-renders. When no morph is active, the ref simply holds toParams.
//
// Public API:
//   • paramsRef        — read each frame from the renderer
//   • activePreset     — re-renders on preset change (fine, low frequency)
//   • demoActive       — re-renders when DEMO toggles
//   • applyPreset      — start a morph to the given preset (default 600ms)
//   • startDemo        — kick off auto-cycle through the given preset list
//   • stopDemo         — halt auto-cycle, stay on current preset
//   • cancelMorph      — slider-edit path: jump to current frame, stop morph
//   • setParam         — slider write path: cancel morph + write to ref
//   • setParams        — React-setState-shaped slider write path

export type TunnelEngine = {
  paramsRef: React.MutableRefObject<TunnelParams>
  // staticParams flips at preset boundaries (start of morph) to the
  // resolved target. <TunnelCanvas> uses it for React-level deps:
  // geometry rebuild (`hole`), pattern texture bake (`patternA/B`,
  // `colorA/B`), and Canvas alpha mode. The lerped per-frame values
  // come from `paramsRef`, so deps don't churn 60 times per second.
  staticParams: TunnelParams
  activePreset: Preset | null
  demoActive: boolean
  // Chunk 9 — INTENSITY + REDUCED FLASH ride on top of the resolved
  // preset. Both are exposed as React state so the chrome can render
  // active states; both have setters that re-target the morph against
  // the current `activePreset` so the visual change feels immediate.
  intensity: Intensity
  reducedFlash: boolean
  setIntensity: (level: Intensity) => void
  setReducedFlash: (on: boolean) => void
  applyPreset: (preset: Preset, durationMs?: number) => void
  startDemo: (presets: Preset[], durationMs?: number) => void
  stopDemo: () => void
  cancelMorph: () => void
  setParam: <K extends keyof TunnelParams>(key: K, value: TunnelParams[K]) => void
  // React-setState-shaped adapter so the slider drawer (TunePanel) can
  // keep its `setTunnelParams((p) => ({...p, foo: v}))` ergonomics
  // without rewriting every onChange. Cancels any active morph, writes
  // through to paramsRef + staticParams.
  setParams: (
    update: TunnelParams | ((prev: TunnelParams) => TunnelParams),
  ) => void
}

// Resolve a partial preset against the canonical defaults. The result
// is a fully-shaped TunnelParams suitable as a morph endpoint, BEFORE
// the chunk 9 intensity/reduced-flash post-processing layer runs.
function resolve(preset: Preset, baseline: TunnelParams = TUNNEL_DEFAULTS): TunnelParams {
  return { ...baseline, ...preset.values }
}

// Chunk 9 — post-process a resolved target through the intensity
// multiplier (always) and the reduced-flash clamp (when engaged).
// This is the single resolution chain referenced by the plan:
//   defaults → preset → intensity → reduced-flash
function postProcess(
  resolved: TunnelParams,
  level: Intensity,
  reducedFlash: boolean,
): TunnelParams {
  const intensified = applyIntensity(resolved, level)
  return reducedFlash ? applyReducedFlash(intensified) : intensified
}

// Fisher-Yates shuffle. Returns a new array; doesn't mutate input.
function shuffle<T>(items: T[]): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export type UseTunnelEngineOptions = {
  // Chunk 9 — first-mount initial values for the post-processing
  // layer. AsteroidScene reads localStorage / prefers-reduced-motion
  // before mounting and feeds them in here so the very first morph
  // already runs through the right multipliers.
  initialIntensity?: Intensity
  initialReducedFlash?: boolean
}

export function useTunnelEngine(
  initial: TunnelParams = TUNNEL_DEFAULTS,
  options: UseTunnelEngineOptions = {},
): TunnelEngine {
  const { initialIntensity = 'full', initialReducedFlash = false } = options
  // Initial seed — apply the post-process layer ONCE at mount so the
  // first frame draws values consistent with the chosen intensity /
  // reduced-flash defaults. Otherwise a CALM-by-default first paint
  // would still be at FULL until the first morph.
  const seeded = postProcess(
    { ...initial },
    initialIntensity,
    initialReducedFlash,
  )
  // The single source of truth for "what should the renderer draw this
  // frame." Updated in-place by the morph rAF loop and by setParam.
  const paramsRef = useRef<TunnelParams>({ ...seeded })

  // Morph endpoints + timing. Mutable, kept in refs because the rAF
  // loop runs outside React's render cycle.
  const fromRef = useRef<TunnelParams>({ ...seeded })
  const toRef = useRef<TunnelParams>({ ...seeded })
  const startedAtRef = useRef<number | null>(null)
  const durationRef = useRef<number>(600)

  // DEMO mode bookkeeping. Stored in refs so the rAF loop / timeout
  // chain can read the latest values without dep-array churn.
  const demoCycleRef = useRef<Preset[]>([])
  const demoIndexRef = useRef<number>(0)
  const demoTimerRef = useRef<number | null>(null)

  // Lightly-React state — these change at preset frequency, not frame
  // frequency, so a re-render is cheap and gives us a clean prop path
  // for the now-playing line and the DEMO/STOP toggle.
  const [activePreset, setActivePreset] = useState<Preset | null>(null)
  const [demoActive, setDemoActive] = useState<boolean>(false)
  // Chunk 9 — INTENSITY + REDUCED FLASH state. We keep both as React
  // state (re-renders chrome on toggle) and as refs (stable read for
  // applyPreset / demo step closures). The activePreset's resolved
  // target is also cached so we can re-target the morph when one of
  // these flips without needing to look up the preset again.
  const [intensity, setIntensityState] = useState<Intensity>(initialIntensity)
  const [reducedFlash, setReducedFlashState] =
    useState<boolean>(initialReducedFlash)
  const intensityRef = useRef<Intensity>(initialIntensity)
  const reducedFlashRef = useRef<boolean>(initialReducedFlash)
  // Cache the un-post-processed (resolved-but-pre-intensity) target so
  // setIntensity/setReducedFlash can re-run postProcess on it.
  const lastResolvedTargetRef = useRef<TunnelParams>({ ...initial })
  // staticParams snapshots the morph target at the start of each
  // morph. Drives React-level deps (geometry, pattern textures).
  const [staticParams, setStaticParams] = useState<TunnelParams>(() =>
    postProcess({ ...initial }, initialIntensity, initialReducedFlash),
  )

  const rafRef = useRef<number | null>(null)

  // ── rAF loop. Runs as long as a morph is in progress. Self-cancels
  //    when t crosses 1.0, after writing the final frame. Stable
  //    closure (only reads refs) — useCallback with empty deps so
  //    the identity doesn't churn.
  const tick = useCallback(() => {
    const startedAt = startedAtRef.current
    if (startedAt === null) {
      rafRef.current = null
      return
    }
    const now = performance.now()
    const t = Math.min(1, (now - startedAt) / durationRef.current)
    paramsRef.current = morphParams(fromRef.current, toRef.current, t)
    if (t >= 1) {
      // Snap to exact toRef so floating-point drift doesn't leave a
      // residual delta in the params (e.g. cellBlur + bloom at t=1
      // is mathematically 0 but defensively re-snap anyway).
      paramsRef.current = { ...toRef.current }
      startedAtRef.current = null
      rafRef.current = null
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const ensureRafRunning = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [tick])

  // ── applyPreset ─────────────────────────────────────────────────
  const applyPreset = useCallback(
    (preset: Preset, durationMs: number = 600) => {
      // Capture the renderer's current params snapshot as the morph
      // start so a click during another morph cross-fades smoothly.
      fromRef.current = { ...paramsRef.current }
      // Resolve target against TUNNEL_DEFAULTS (not currentParams), so
      // a preset click is "give me this preset, full stop" — fields the
      // preset doesn't override snap back to defaults instead of leaking
      // from whatever was on screen.
      const resolved = resolve(preset)
      // Cache the resolved-pre-intensity target so setIntensity /
      // setReducedFlash can re-process it without needing the preset.
      lastResolvedTargetRef.current = resolved
      // Chunk 9 — apply intensity + reduced-flash post-processing.
      const target = postProcess(
        resolved,
        intensityRef.current,
        reducedFlashRef.current,
      )
      toRef.current = target
      startedAtRef.current = performance.now()
      durationRef.current = durationMs
      setActivePreset(preset)
      // Flip staticParams to the resolved target so React-level
      // consumers (geometry, pattern textures) rebuild ONCE — at the
      // start of the morph — and not 60 times during it.
      setStaticParams(target)
      ensureRafRunning()
    },
    [ensureRafRunning],
  )

  // ── DEMO scheduling ─────────────────────────────────────────────
  // Use setTimeout (chained, not setInterval) so we don't drift if
  // the tab is throttled. Each tick stamps the next timer using the
  // configured durationMs.
  const scheduleNextDemoStep = useCallback(
    (durationMs: number) => {
      if (demoTimerRef.current !== null) {
        window.clearTimeout(demoTimerRef.current)
      }
      demoTimerRef.current = window.setTimeout(() => {
        // If demo was stopped while we were waiting, bail. (stopDemo
        // also clears the timer, so this is belt-and-suspenders.)
        if (demoCycleRef.current.length === 0) return
        demoIndexRef.current =
          (demoIndexRef.current + 1) % demoCycleRef.current.length
        const next = demoCycleRef.current[demoIndexRef.current]
        // Inline the apply logic so we don't bounce through stopDemo:
        // applyPreset would (correctly) flip demoActive=false from
        // the public path, but the internal cycle wants to keep it on.
        // Resolve against TUNNEL_DEFAULTS, not currentParams — see the
        // applyPreset comment for why.
        fromRef.current = { ...paramsRef.current }
        const resolved = resolve(next)
        lastResolvedTargetRef.current = resolved
        const target = postProcess(
          resolved,
          intensityRef.current,
          reducedFlashRef.current,
        )
        toRef.current = target
        startedAtRef.current = performance.now()
        durationRef.current = durationMs
        setActivePreset(next)
        setStaticParams(target)
        ensureRafRunning()
        scheduleNextDemoStep(durationMs)
      }, durationMs)
    },
    [ensureRafRunning],
  )

  const stopDemo = useCallback(() => {
    if (demoTimerRef.current !== null) {
      window.clearTimeout(demoTimerRef.current)
      demoTimerRef.current = null
    }
    demoCycleRef.current = []
    demoIndexRef.current = 0
    setDemoActive(false)
  }, [])

  const startDemo = useCallback(
    (presets: Preset[], durationMs: number = 8000) => {
      if (presets.length === 0) return
      // Stop any existing demo without flipping demoActive off, since
      // we're about to flip it on again.
      if (demoTimerRef.current !== null) {
        window.clearTimeout(demoTimerRef.current)
        demoTimerRef.current = null
      }
      const cycle = shuffle(presets)
      demoCycleRef.current = cycle
      demoIndexRef.current = 0
      setDemoActive(true)
      // First step: morph immediately to the first preset. Resolve
      // against TUNNEL_DEFAULTS (not currentParams) so the demo lands
      // on the preset as authored, not a Frankenstein of whatever was
      // on screen + the preset's overrides.
      const first = cycle[0]
      fromRef.current = { ...paramsRef.current }
      const resolved = resolve(first)
      lastResolvedTargetRef.current = resolved
      const target = postProcess(
        resolved,
        intensityRef.current,
        reducedFlashRef.current,
      )
      toRef.current = target
      startedAtRef.current = performance.now()
      durationRef.current = durationMs
      setActivePreset(first)
      setStaticParams(target)
      ensureRafRunning()
      scheduleNextDemoStep(durationMs)
    },
    [ensureRafRunning, scheduleNextDemoStep],
  )

  // applyPreset (public, user click) stops demo first, since the
  // user just expressed intent to commandeer the cycle.
  const applyPresetPublic = useCallback(
    (preset: Preset, durationMs: number = 600) => {
      stopDemo()
      applyPreset(preset, durationMs)
    },
    [applyPreset, stopDemo],
  )

  // ── cancelMorph / setParam (slider edit path) ──────────────────
  // Sliders are user-direct intent: there's no morph for a drag.
  // We snap from = to = paramsRef.current (so the morph effectively
  // becomes a no-op), then write the new value into the ref.
  const cancelMorph = useCallback(() => {
    startedAtRef.current = null
    fromRef.current = { ...paramsRef.current }
    toRef.current = { ...paramsRef.current }
    // If demo was active, slider drag stops it (chunk 4 doesn't
    // require this, but it's the right UX once we're here).
    if (demoActive) stopDemo()
  }, [demoActive, stopDemo])

  const setParam = useCallback(
    <K extends keyof TunnelParams>(key: K, value: TunnelParams[K]) => {
      cancelMorph()
      paramsRef.current = { ...paramsRef.current, [key]: value }
      toRef.current = { ...paramsRef.current }
      // Slider edits also flip staticParams immediately so React-level
      // consumers (geometry / patterns) see the change.
      setStaticParams({ ...paramsRef.current })
    },
    [cancelMorph],
  )

  const setParams = useCallback(
    (update: TunnelParams | ((prev: TunnelParams) => TunnelParams)) => {
      cancelMorph()
      const next =
        typeof update === 'function'
          ? (update as (prev: TunnelParams) => TunnelParams)(paramsRef.current)
          : update
      paramsRef.current = { ...next }
      toRef.current = { ...next }
      setStaticParams(next)
    },
    [cancelMorph],
  )

  // ── setIntensity / setReducedFlash (chunk 9) ───────────────────
  // Both setters update the ref + React state, then re-post-process
  // the cached resolved target and start a quick 300ms morph so the
  // visual change feels immediate. fromRef captures the current frame
  // so the morph blends from whatever's on screen (no jump).
  //
  // We re-process the cached `lastResolvedTargetRef` rather than
  // currentParams, because currentParams is already
  // post-processed — re-applying intensity to it would compound.
  const retargetForPostProcess = useCallback(
    (level: Intensity, rf: boolean) => {
      const resolved = lastResolvedTargetRef.current
      const target = postProcess(resolved, level, rf)
      fromRef.current = { ...paramsRef.current }
      toRef.current = target
      startedAtRef.current = performance.now()
      durationRef.current = 300
      setStaticParams(target)
      ensureRafRunning()
    },
    [ensureRafRunning],
  )

  const setIntensity = useCallback(
    (level: Intensity) => {
      if (intensityRef.current === level) return
      intensityRef.current = level
      setIntensityState(level)
      retargetForPostProcess(level, reducedFlashRef.current)
    },
    [retargetForPostProcess],
  )

  const setReducedFlash = useCallback(
    (on: boolean) => {
      if (reducedFlashRef.current === on) return
      reducedFlashRef.current = on
      setReducedFlashState(on)
      retargetForPostProcess(intensityRef.current, on)
    },
    [retargetForPostProcess],
  )

  // ── Cleanup on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (demoTimerRef.current !== null) {
        window.clearTimeout(demoTimerRef.current)
        demoTimerRef.current = null
      }
    }
  }, [])

  return {
    paramsRef,
    staticParams,
    activePreset,
    demoActive,
    intensity,
    reducedFlash,
    setIntensity,
    setReducedFlash,
    applyPreset: applyPresetPublic,
    startDemo,
    stopDemo,
    cancelMorph,
    setParam,
    setParams,
  }
}
