// ─── Deterministic RNG (mulberry32) ───────────────────────────────
// Same seed → same sequence. Used by `generateLook` so a URL like
// `#g=sacred&s=8273&v=1` reproduces the exact same params on any
// machine. Math.random is reserved for the case where the user asks
// for a "fresh" generate — we mint a 32-bit seed and feed it in.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Mint a fresh 32-bit seed from Math.random for "user clicks GENERATE".
export function freshSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0
}
