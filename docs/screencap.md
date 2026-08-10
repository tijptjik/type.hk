# Site preview screenshots

Capture a site locally with Playwright. The tool opens a local Chromium browser,
uses a 1200×720 viewport, and saves a preview image.

Install Chromium once:

```sh
bunx playwright install chromium
```

Capture a preview:

```sh
bun run capture-preview https://example.com preview.webp
```

The output path is optional and defaults to `preview.jpg`. Use a `.webp` suffix
to create a WebP image instead. Add `--hide-nav` to hide the page's `<header>`
before capturing. Use `--color-scheme dark` or `--color-scheme light` to emulate
the visitor's preferred scheme. `--scroll-steps <count>` captures a sequence,
scrolling one viewport height between images, for example:

```sh
bun run capture-preview https://saanseoi.hk public/project-previews/saanseoi-dark.webp \
  --color-scheme dark --hide-nav --scroll-steps 4
```

Use `--scroll-all` to capture every viewport from the top of a page to its end.
Use `--scroll-offset <pixels>` to begin a capture sequence at an exact vertical position.

Use `--click` once for each button action that should happen after navigation.
The value must be the button's exact accessible label:

```sh
bun run capture-preview 'http://localhost:5173/?panel=prisms' filtered-map.webp \
  --click 'Add HK Ghost Signs project prism' --click 'Close panel'
```

For interactive apps that maintain live network connections, pass
`--wait-until domcontentloaded` instead of waiting for network idle.

For a local map app with cross-origin tiles, add `--disable-web-security`.
Use `--settle <milliseconds>` when the visual state needs time to finish animating
or load after an interaction.

For a signed-in page, create a Playwright storage-state file locally, keep it
out of version control, then pass it to the capture command:

```sh
bun run capture-preview https://hype.hk/admin admin-preview.webp \
  --storage-state hype-auth.json
```
