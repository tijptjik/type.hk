import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 590, height: 1068 },
  { width: 390, height: 844 },
]) {
  test.describe(`map expansion at ${viewport.width}px`, () => {
    test.use({ viewport })

    test('expands the initialized iframe and preserves it when closing', async ({
      page,
    }) => {
      let documentLoads = 0
      await page.route('https://romanticatlas.hype.hk/**', async route => {
        if (route.request().resourceType() !== 'document') {
          await route.fulfill({ status: 204, body: '' })
          return
        }
        documentLoads += 1
        await route.fulfill({
          contentType: 'text/html',
          body: '<!doctype html><html><body><p id="state">Fresh map</p></body></html>',
        })
      })

      await page.goto('/maps')
      const title = "A Romantic's Atlas of Hong Kong"
      const iframe = page.locator(`iframe[title="${title} preview"]`)
      const state = page
        .frameLocator(`iframe[title="${title} preview"]`)
        .locator('#state')
      await expect(iframe).toHaveAttribute('src', 'https://romanticatlas.hype.hk/')
      await expect(state).toHaveText('Fresh map')
      await state.evaluate(element => {
        element.textContent = 'Initialized map state'
      })
      const originalIframe = await iframe.elementHandle()

      await page.getByRole('button', { name: `Expand ${title}`, exact: true }).click()
      const dialog = page.getByRole('dialog', { name: title, exact: true })
      await expect(dialog).toBeVisible()
      await expect(dialog.locator('iframe')).toHaveAttribute('aria-hidden', 'false')
      await expect(state).toHaveText('Initialized map state')
      expect(
        await iframe.evaluate(
          (element, original) => element === original,
          originalIframe,
        ),
      ).toBe(true)
      expect(documentLoads).toBe(1)

      const bounds = await dialog.boundingBox()
      expect(bounds).not.toBeNull()
      if (!bounds) throw new Error('Expanded map dialog has no bounding box')
      expect(bounds.height).toBeGreaterThan(viewport.height * 0.9)
      expect(Math.abs(bounds.x - bounds.y)).toBeLessThan(2)
      expect(
        Math.abs(viewport.height - bounds.y - bounds.height - bounds.x),
      ).toBeLessThan(2)

      await page.getByRole('button', { name: `Close ${title}`, exact: true }).click()
      await expect(dialog).toHaveCount(0)
      await expect(state).toHaveText('Initialized map state')
      expect(
        await iframe.evaluate(
          (element, original) => element === original,
          originalIframe,
        ),
      ).toBe(true)
      expect(documentLoads).toBe(1)
      await originalIframe?.dispose()
    })
  })
}
