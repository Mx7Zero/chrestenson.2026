import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  readPersistedBoolean,
  writePersistedBoolean,
} from '../usePersistedBoolean'

// `usePersistedBoolean` itself is a thin React wrapper around
// `readPersistedBoolean` + `writePersistedBoolean`. The hook layer is
// exercised by the bird section render path; here we cover the
// storage round-trip with `localStorage` stubbed via `vi.stubGlobal`.

type StoreShape = Record<string, string>

function createMockLocalStorage(initial: StoreShape = {}) {
  const store: StoreShape = { ...initial }
  return {
    getItem: vi.fn((k: string) => (k in store ? store[k] : null)),
    setItem: vi.fn((k: string, v: string) => {
      store[k] = v
    }),
    removeItem: vi.fn((k: string) => {
      delete store[k]
    }),
    clear: vi.fn(() => {
      for (const k of Object.keys(store)) delete store[k]
    }),
    key: vi.fn((_i: number) => null),
    get length() {
      return Object.keys(store).length
    },
    _store: store,
  }
}

describe('usePersistedBoolean (storage helpers)', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: createMockLocalStorage() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the default value when the key is absent', () => {
    expect(readPersistedBoolean('chrestenson.tunnel.presetsOpen', true)).toBe(
      true,
    )
    expect(readPersistedBoolean('chrestenson.tunnel.presetsOpen', false)).toBe(
      false,
    )
  })

  it('returns the stored value when the key is present', () => {
    vi.stubGlobal('window', {
      localStorage: createMockLocalStorage({
        'chrestenson.tunnel.presetsOpen': '1',
        'chrestenson.tunnel.tuneOpen': '0',
      }),
    })
    expect(readPersistedBoolean('chrestenson.tunnel.presetsOpen', false)).toBe(
      true,
    )
    expect(readPersistedBoolean('chrestenson.tunnel.tuneOpen', true)).toBe(
      false,
    )
  })

  it('writes "1"/"0" through to storage on update', () => {
    const mock = createMockLocalStorage()
    vi.stubGlobal('window', { localStorage: mock })

    writePersistedBoolean('chrestenson.tunnel.presetsOpen', true)
    expect(mock.setItem).toHaveBeenCalledWith(
      'chrestenson.tunnel.presetsOpen',
      '1',
    )

    writePersistedBoolean('chrestenson.tunnel.presetsOpen', false)
    expect(mock.setItem).toHaveBeenCalledWith(
      'chrestenson.tunnel.presetsOpen',
      '0',
    )
  })
})
