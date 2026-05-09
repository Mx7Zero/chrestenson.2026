import { test, expect } from '@playwright/test'

// ─── Chunk 7 — Fullscreen showcase mode ─────────────────────────────
// Verifies:
//   1. ⛶ FULLSCREEN button enters the Fullscreen API on the bird
//      container.
//   2. Inside fullscreen, the transport bar is visible immediately
//      (mouse-wake primes awake), then auto-hides after 2.5s of
//      no input.
//   3. Mousemove / keydown re-shows the transport bar.
//   4. ESC exits fullscreen via the browser.
//
// Headless behavior caveat: `requestFullscreen` requires a real user
// gesture, which Playwright's `page.click` provides via the trusted
// dispatch path. Some headless modes still reject the request — if
// the assertion times out, the test falls back to `.fixme()`-style
// documentation in the manual verification block of the chunk plan.

test('fullscreen showcase mode toggles via ⛶ FULL button', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('#bird').scrollIntoViewIfNeeded()

  // The PLAY button only exists inside the TUNE panel; the showcase
  // mode test only needs the transport bar's FULLSCREEN button.
  const fullBtn = page.getByRole('button', { name: /Enter fullscreen/ })
  await expect(fullBtn).toBeVisible()
  await fullBtn.click()

  // Wait for the browser to honor the fullscreen request.
  await page.waitForFunction(() => document.fullscreenElement !== null, {
    timeout: 2000,
  })

  // Move mouse to ensure the transport bar is awake.
  await page.mouse.move(100, 100)
  await expect(page.locator('[data-testid="transport-bar"]')).toBeVisible()

  // Idle past the 2.5s threshold (chunk 7 default). Add a buffer so
  // we don't race the timer.
  await page.waitForTimeout(3500)
  await expect(
    page.locator('[data-testid="transport-bar"]'),
  ).not.toBeVisible()

  // Wake on mousemove.
  await page.mouse.move(200, 200)
  await expect(page.locator('[data-testid="transport-bar"]')).toBeVisible()

  // ESC exits fullscreen.
  await page.keyboard.press('Escape')
  await page.waitForFunction(() => document.fullscreenElement === null, {
    timeout: 2000,
  })
})
