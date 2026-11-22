import { expect, test } from '@playwright/test'

test('renders the polygon scene behind the contact QR code', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (
      (message.type() === 'error' && /THREE|WebGL|shader/i.test(message.text())) ||
      message.text().includes('Unable to initialize the contact-card 3D scene')
    ) {
      errors.push(message.text())
    }
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Show contact QR code' }).click()
  const canvas = page.locator('.contact-card-shards')
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.width))
    .toBeGreaterThan(300)
  await expect
    .poll(() =>
      canvas.evaluate(
        (element: HTMLCanvasElement) =>
          new Promise<number>(resolve => {
            requestAnimationFrame(() => {
              const gl = element.getContext('webgl2')
              if (!gl) return resolve(0)
              const pixels = new Uint8Array(element.width * element.height * 4)
              gl.readPixels(
                0,
                0,
                element.width,
                element.height,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                pixels,
              )
              let visiblePixels = 0
              for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] > 0) visiblePixels++
              }
              resolve(visiblePixels)
            })
          }),
      ),
    )
    .toBeGreaterThan(100)
  // Allow the flip and initial WebGL shader compilation to complete.
  await page.waitForTimeout(1500)
  await page.screenshot({ path: testInfo.outputPath('contact-scene.png') })
  expect(errors).toEqual([])
})
