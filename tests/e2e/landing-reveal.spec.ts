import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test.describe(`landing reveal at ${viewport.width}px`, () => {
    test.use({ viewport, reducedMotion: 'no-preference' })

    test('reveals the page independently and fades in loaded artwork', async ({
      page,
    }, testInfo) => {
      let releaseImage = () => {}
      const imageGate = new Promise<void>(resolve => {
        releaseImage = resolve
      })
      await page.route('**/run-particles.webp', async route => {
        await imageGate
        await route.continue()
      })

      try {
        await page.goto('/', { waitUntil: 'domcontentloaded' })
        const shell = page.locator('.site-shell')
        const avatar = page.locator('.contact-card-avatar')
        await expect(shell).toHaveCSS('animation-name', 'page-reveal')
        await expect(shell).toHaveCSS('animation-duration', '0.6s')
        await expect(shell).toHaveCSS('opacity', '1')
        await expect(avatar).toHaveCSS('opacity', '0')
        expect(await avatar.evaluate((image: HTMLImageElement) => image.complete)).toBe(
          false,
        )
        await page.screenshot({ path: testInfo.outputPath('waiting-for-artwork.png') })

        releaseImage()
        await expect(avatar).toHaveAttribute('data-ready', 'true')
        const opacity = await avatar.evaluate(element => {
          const animation = element.getAnimations()[0]
          if (!animation) throw new Error('Artwork did not start its reveal animation')
          animation.pause()
          animation.currentTime = 350
          return Number(getComputedStyle(element).opacity)
        })
        expect(opacity).toBeGreaterThan(0)
        expect(opacity).toBeLessThan(1)
        await page.screenshot({ path: testInfo.outputPath('artwork-fading.png') })
        await avatar.evaluate(element => element.getAnimations()[0]?.finish())
        await expect(avatar).toHaveCSS('opacity', '1')
        await page.screenshot({ path: testInfo.outputPath('artwork-ready.png') })
      } finally {
        releaseImage()
      }
    })
  })
}

test('failed artwork stays hidden and reduced motion skips the page fade', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/run-particles.webp', route => route.abort())
  await page.goto('/')
  await expect(page.locator('.site-shell')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.site-shell')).toHaveCSS('opacity', '1')
  await expect(page.locator('.contact-card-avatar')).toHaveCSS('opacity', '0')
  await expect(page.locator('.contact-card-avatar')).not.toHaveAttribute(
    'data-ready',
    'true',
  )

  await page.unroute('**/run-particles.webp')
  await page.reload()
  await expect(page.locator('.contact-card-avatar')).toHaveAttribute(
    'data-ready',
    'true',
  )
  await expect(page.locator('.contact-card-avatar')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.contact-card-avatar')).toHaveCSS('opacity', '1')
})

for (const decodeBehavior of ['reject', 'pending'] as const) {
  test(`loaded artwork remains visible when decode is ${decodeBehavior}`, async ({
    page,
  }) => {
    await page.addInitScript(behavior => {
      HTMLImageElement.prototype.decode = () =>
        behavior === 'reject'
          ? Promise.reject(new DOMException('Unable to decode', 'EncodingError'))
          : new Promise<void>(() => {})
    }, decodeBehavior)
    await page.goto('/')
    const avatar = page.locator('.contact-card-avatar')
    await expect
      .poll(() =>
        avatar.evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
      )
      .toBe(true)
    await expect(avatar).toHaveCSS('opacity', '1')

    // Remount the cached image as well as testing the first network load.
    await page.goto('/writing')
    await page.getByRole('link', { name: 'TYPE', exact: true }).click()
    await expect(avatar).toHaveCSS('opacity', '1')
  })
}
