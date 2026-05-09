// ─── Blend mode diagnostic overlay ───────────────────────────────
// Plain HTML divs only. No SVG, no filters, no masks, no opacity on
// parents. Five 120x120 squares of rgb(128,128,128) with the five
// canonical CSS mix-blend-modes laid out across the viewport.
//
// If these five squares don't visibly differ over the moving tunnel,
// the issue is the visual stage / isolation / canvas relationship
// (NOT the SVG overlay code). If they DO differ, the production
// overlay path has an SVG-specific bug.
//
// This component is intentionally minimal. Do not add to it. Add a
// failing-layer test alongside if you need to bisect further.

const MODES = ['normal', 'screen', 'multiply', 'difference', 'overlay'] as const

export function BlendDiag() {
  return (
    <div
      // The host. position absolute so it lays over the tunnel,
      // pointer-events none so the bird OrbitControls keep working,
      // z-index 10 puts it above tunnel + production overlays.
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {MODES.map((mode, i) => {
        const x = 10 + i * 17 // % from left
        return (
          <div
            key={mode}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: '38%',
              width: 120,
              height: 120,
              background: 'rgb(128,128,128)',
              mixBlendMode: mode,
            }}
          />
        )
      })}
      {/* Labels — separate row, normal blend so they read regardless
          of whether the squares above are blending correctly. */}
      {MODES.map((mode, i) => {
        const x = 10 + i * 17
        return (
          <div
            key={`label-${mode}`}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: 'calc(38% + 128px)',
              width: 120,
              fontFamily: 'monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              color: '#ffffff',
              textShadow: '0 1px 2px rgba(0,0,0,0.85)',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            {mode}
          </div>
        )
      })}
    </div>
  )
}
