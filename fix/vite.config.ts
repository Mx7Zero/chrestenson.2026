/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest picks up `*.test.ts` files under `src/`. The `e2e/`
    // directory is reserved for Playwright (chunks 7 and 12) and must
    // not be discovered by Vitest, since `@playwright/test` is a
    // separate test runner with its own globals.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})
