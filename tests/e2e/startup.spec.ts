import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test.describe(`application startup at ${viewport.width}px`, () => {
    test.use({ viewport, locale: 'en-US' })

    test('mounts, responds to controls, and remounts on reload without runtime errors', async ({
      page,
    }, testInfo) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))

      await page.goto('/')
      await expect(page.locator('#profile-name')).toBeVisible()
      const shell = page.locator('.site-shell')
      const initialTheme = await shell.getAttribute('data-theme')

      if (viewport.width < 560) {
        await page.getByRole('button', { name: 'Toggle navigation menu' }).click()
      }
      await page.getByRole('button', { name: /^(Light|Dark) mode$/ }).click()
      const nextTheme = initialTheme === 'dark' ? 'light' : 'dark'
      await expect(shell).toHaveAttribute('data-theme', nextTheme)

      await page.getByRole('link', { name: 'Writing', exact: true }).click()
      await expect(page).toHaveURL(/\/writing$/)
      await expect(page.getByRole('main')).toBeVisible()

      await page.reload()
      await expect(page.getByRole('main')).toBeVisible()
      await expect(shell).toHaveAttribute('data-theme', nextTheme)
      await page.getByRole('link', { name: 'TYPE', exact: true }).click()
      await expect(page.locator('#profile-name')).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath('startup.png') })
      expect(errors).toEqual([])
    })
  })
}
