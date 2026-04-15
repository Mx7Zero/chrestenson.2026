/**
 * Transparent floating panel for swapping the sphere variant and
 * toggling planet/satellite visibility. Fixed top-right of the viewport.
 */

import { useEffect, useState } from 'react'

export type SphereVariant = 'concrete' | 'earth' | 'moon' | 'mars'

type Props = {
  sphere: SphereVariant
  onSphereChange: (s: SphereVariant) => void
  hidePlanet: boolean
  onHidePlanetChange: (v: boolean) => void
  hideSatellites: boolean
  onHideSatellitesChange: (v: boolean) => void
}

const OPTIONS: Array<{ value: SphereVariant; label: string }> = [
  { value: 'concrete', label: 'Concrete' },
  { value: 'earth', label: 'Earth' },
  { value: 'moon', label: 'Moon' },
  { value: 'mars', label: 'Mars' },
]

const CHEVRON_SVG =
  "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%23ffffff' opacity='0.6' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E\")"

export function SphereControls({
  sphere,
  onSphereChange,
  hidePlanet,
  onHidePlanetChange,
  hideSatellites,
  onHideSatellitesChange,
}: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 },
    )
    obs.observe(hero)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 100,
        padding: '14px 16px',
        background:
          'linear-gradient(180deg, rgba(20, 24, 34, 0.86), rgba(8, 10, 16, 0.86))',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        color: 'rgba(255, 255, 255, 0.88)',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 12,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        boxShadow:
          '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        pointerEvents: visible ? 'auto' : 'none',
        userSelect: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      <select
        value={sphere}
        onChange={(e) => onSphereChange(e.target.value as SphereVariant)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          background: `rgba(255, 255, 255, 0.04) ${CHEVRON_SVG} no-repeat right 12px center`,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 6,
          color: 'rgba(255, 255, 255, 0.92)',
          padding: '9px 30px 9px 12px',
          fontFamily: 'inherit',
          fontSize: 12,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          cursor: 'pointer',
          outline: 'none',
          minWidth: 150,
        }}
      >
        {OPTIONS.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            style={{
              background: '#0f1218',
              color: '#ffffff',
              textTransform: 'none',
            }}
          >
            {opt.label}
          </option>
        ))}
      </select>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          opacity: 0.85,
          fontSize: 11,
        }}
      >
        <input
          type="checkbox"
          checked={hidePlanet}
          onChange={(e) => onHidePlanetChange(e.target.checked)}
          style={{ accentColor: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer' }}
        />
        Hide planet
      </label>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          opacity: 0.85,
          fontSize: 11,
        }}
      >
        <input
          type="checkbox"
          checked={hideSatellites}
          onChange={(e) => onHideSatellitesChange(e.target.checked)}
          style={{ accentColor: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer' }}
        />
        Hide satellites
      </label>
    </div>
  )
}
