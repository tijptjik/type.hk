import { chromium } from 'playwright'

const previewWidth = 1200
const previewHeight = 720
const args = process.argv.slice(2)
let colorScheme: 'dark' | 'light' | undefined
let hideNav = false
let scrollAll = false
let scrollSteps = 1
let scrollOffset = 0
let storageState: string | undefined
let waitUntil: 'domcontentloaded' | 'networkidle' = 'networkidle'
let disableWebSecurity = false
let settleDelay = 0
const clickLabels: string[] = []
const positionalArgs: string[] = []

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index]

  if (arg === '--hide-nav') {
    hideNav = true
    continue
  }

  if (arg === '--scroll-all') {
    scrollAll = true
    continue
  }

  if (arg === '--color-scheme') {
    const value = args[index + 1]
    if (value !== 'dark' && value !== 'light') {
      throw new Error('--color-scheme must be either "dark" or "light".')
    }
    colorScheme = value
    index += 1
    continue
  }

  if (arg === '--scroll-steps') {
    const value = Number(args[index + 1])
    if (!Number.isInteger(value) || value < 1) {
      throw new Error('--scroll-steps must be a positive integer.')
    }
    scrollSteps = value
    index += 1
    continue
  }

  if (arg === '--scroll-offset') {
    const value = Number(args[index + 1])
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('--scroll-offset must be a non-negative number of pixels.')
    }
    scrollOffset = value
    index += 1
    continue
  }

  if (arg === '--storage-state') {
    const value = args[index + 1]
    if (!value) {
      throw new Error(
        '--storage-state requires the path to a Playwright storage-state file.',
      )
    }
    storageState = value
    index += 1
    continue
  }

  if (arg === '--click') {
    const value = args[index + 1]
    if (!value) {
      throw new Error('--click requires the exact accessible label of a button.')
    }
    clickLabels.push(value)
    index += 1
    continue
  }

  if (arg === '--wait-until') {
    const value = args[index + 1]
    if (value !== 'domcontentloaded' && value !== 'networkidle') {
      throw new Error(
        '--wait-until must be either "domcontentloaded" or "networkidle".',
      )
    }
    waitUntil = value
    index += 1
    continue
  }

  if (arg === '--disable-web-security') {
    disableWebSecurity = true
    continue
  }

  if (arg === '--settle') {
    const value = Number(args[index + 1])
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('--settle must be a non-negative number of milliseconds.')
    }
    settleDelay = value
    index += 1
    continue
  }

  positionalArgs.push(arg)
}

const [target, output = 'preview.jpg'] = positionalArgs

if (!target) {
  throw new Error(
    'Usage: bun run capture-preview <url> [output.jpg] [--color-scheme dark|light] [--hide-nav] [--scroll-steps <count>|--scroll-all] [--scroll-offset <pixels>] [--storage-state <path>] [--click <button-label>] [--wait-until domcontentloaded|networkidle] [--disable-web-security] [--settle <milliseconds>]',
  )
}

if (scrollAll && scrollSteps !== 1) {
  throw new Error('Use either --scroll-steps or --scroll-all, not both.')
}

const url = new URL(target)
if (!['http:', 'https:'].includes(url.protocol)) {
  throw new Error('The URL must use http or https.')
}

const imageType = output.toLowerCase().endsWith('.webp')
  ? 'webp'
  : /\.jpe?g$/i.test(output)
    ? 'jpeg'
    : null

if (!imageType) {
  throw new Error('The output file must use a .jpg, .jpeg, or .webp extension.')
}

function outputPathForStep(step: number, imageCount: number) {
  if (imageCount === 1) return output

  const extensionIndex = output.lastIndexOf('.')
  return `${output.slice(0, extensionIndex)}-${step + 1}${output.slice(extensionIndex)}`
}

const browser = await chromium.launch(
  disableWebSecurity ? { args: ['--disable-web-security'] } : undefined,
)

try {
  const context = await browser.newContext({
    colorScheme,
    storageState,
    viewport: { width: previewWidth, height: previewHeight },
  })
  const page = await context.newPage()
  await page.goto(url.href, { waitUntil, timeout: 30_000 })
  console.log(`Loaded ${page.url()}`)
  for (const label of clickLabels) {
    await page.getByRole('button', { exact: true, name: label }).click()
    await page.waitForTimeout(300)
  }
  if (hideNav) {
    await page.addStyleTag({ content: 'header { display: none !important; }' })
  }
  if (settleDelay > 0) await page.waitForTimeout(settleDelay)
  const scrollPositions = scrollAll
    ? await page.evaluate(height => {
        const maxScroll = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight,
        )
        const positions: number[] = []

        for (let position = 0; position < maxScroll; position += height) {
          positions.push(position)
        }
        positions.push(maxScroll)
        return [...new Set(positions)]
      }, previewHeight)
    : Array.from(
        { length: scrollSteps },
        (_, step) => scrollOffset + step * previewHeight,
      )

  for (const [step, scrollPosition] of scrollPositions.entries()) {
    if (scrollPosition > 0) {
      await page.evaluate(position => window.scrollTo(0, position), scrollPosition)
      await page.waitForTimeout(250)
    }

    const screenshotPath = outputPathForStep(step, scrollPositions.length)
    await page.screenshot({ path: screenshotPath, quality: 82, type: imageType })
    console.log(`Saved ${screenshotPath} from ${url.href}`)
  }
} finally {
  await browser.close()
}
