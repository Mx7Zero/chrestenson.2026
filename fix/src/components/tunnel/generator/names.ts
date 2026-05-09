import type { TabId } from '../presets'

// ─── Name generator ───────────────────────────────────────────────
// Pulls one adjective + one noun from per-genre pools. Uses the
// caller's seeded rng so the name is reproducible from the seed.
//
// Pools are intentionally evocative, never technical. Avoid
// "preset", "fast", "rainbow", numbers. Names should sound like
// VJ track titles.

type Genre = Exclude<TabId, 'myset'>

const ADJ: Record<Genre, string[]> = {
  signature: ['Slow', 'Long', 'Soft', 'Plain', 'Open', 'Honest', 'Quiet', 'Fair', 'Bright', 'Standard'],
  psychedelic: ['Liquid', 'Velvet', 'Wax', 'Marble', 'Saffron', 'Acid', 'Fractal', 'Dripped', 'Inner', 'Coral'],
  kaleido: ['Crystal', 'Stained', 'Twelve', 'Petal', 'Mandala', 'Glass', 'Quad', 'Dodec', 'Sixteen', 'Octagon'],
  cosmic: ['Deep', 'Slow', 'Outer', 'Long', 'Black', 'Void', 'Comet', 'Eclipse', 'Pearl', 'Helix'],
  rave: ['Neon', 'Hot', 'Hard', 'Strobe', 'Acid', 'Pulse', 'Mosh', 'Police', 'Chrome', 'Rainbow'],
  glitch: ['Broken', 'Drift', 'Frame', 'Channel', 'Static', 'Signal', 'Hex', 'Color', 'Chrome', 'Opal'],
  sacred: ['Gold', 'Quiet', 'Slow', 'Vesica', 'Long', 'Honey', 'Old', 'Liquid', 'Orphic', 'Sun'],
  chroma: ['Pure', 'Long', 'Slow', 'Soft', 'Cool', 'Warm', 'Deep', 'Pastel', 'Wide', 'Far'],
}

const NOUN: Record<Genre, string[]> = {
  signature: ['Sun', 'Hall', 'Helix', 'Wheel', 'Echo', 'Mirror', 'Lattice', 'Field', 'Run', 'Light'],
  psychedelic: ['Sermon', 'Bath', 'Tide', 'Bloom', 'Saints', 'Hymn', 'Eye', 'Spill', 'Drift', 'Static'],
  kaleido: ['Glass', 'Petals', 'Hex', 'Shrine', 'Cathedral', 'Mirror', 'Spin', 'Storm', 'Wheel', 'Drift', 'Lattice'],
  cosmic: ['Orbit', 'Nova', 'Lotus', 'Spiral', 'Fall', 'Drift', 'Bath', 'Tide', 'Ring', 'Pull', 'Star', 'Halo'],
  rave: ['Cathedral', 'Line', 'Fever', 'Saint', 'Sun', 'Mirror', 'Strobe', 'Hex', 'Pulse', 'Riot'],
  glitch: ['Collapse', 'Circuit', 'Channel', 'Error', 'Bleed', 'Tear', 'Storm', 'Saint', 'Skip', 'Crash'],
  sacred: ['Vesica', 'Wheel', 'Petal', 'Bloom', 'Halo', 'Sun', 'Cathedral', 'Glass', 'Drift', 'Saints'],
  chroma: ['Drift', 'Garden', 'Sermon', 'Bleed', 'Bath', 'Spectrum', 'Wash', 'Hue', 'Color', 'Tide'],
}

export function generateName(genre: Genre, rng: () => number): string {
  const adj = ADJ[genre]
  const noun = NOUN[genre]
  const a = adj[Math.floor(rng() * adj.length)]
  const n = noun[Math.floor(rng() * noun.length)]
  return `${a} ${n}`
}
