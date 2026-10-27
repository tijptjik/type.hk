# Site preview screenshots

Capture a site locally with Playwright. The tool opens installed Google Chrome Stable headlessly,
uses a 1200×720 viewport, and saves a preview image.

Install Google Chrome Stable through your operating system's package manager.
Local captures share that installation and do not need `playwright install`.
Set `PLAYWRIGHT_CHROMIUM_CHANNEL` to select another installed channel when needed.

CI uses Playwright's bundled browser by default; provision it with:

```sh
bunx playwright install chromium
```

Capture a preview:

```sh
bun run capture-preview https://example.com .local/captures/preview.webp
```

The output path is optional and defaults to `.local/captures/preview.jpg`. Use a `.webp` suffix
to create a WebP image instead. Add `--hide-nav` to hide the page's `<header>`
before capturing. Use `--color-scheme dark` or `--color-scheme light` to emulate
the visitor's preferred scheme. `--scroll-steps <count>` captures a sequence,
scrolling one viewport height between images, for example:

```sh
bun run capture-preview https://saanseoi.hk .local/site-assets/project-previews/saanseoi-dark.webp \
  --color-scheme dark --hide-nav --scroll-steps 4
```

Use `--scroll-all` to capture every viewport from the top of a page to its end.
Use `--scroll-offset <pixels>` to begin a capture sequence at an exact vertical position.

Use `--click` once for each button action that should happen after navigation.
The value must be the button's exact accessible label:

```sh
bun run capture-preview 'http://localhost:5173/?panel=prisms' .local/captures/filtered-map.webp \
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
bun run capture-preview https://hype.hk/admin .local/captures/admin-preview.webp \
  --storage-state hype-auth.json
```

Site preview exports are generated assets. Keep them in `.local/site-assets/project-previews/`,
run `bun run assets:upload` to upload and SHA-256 verify them in
`tjikos-assets/typehk/project-previews/`, then deploy any updated presentation
metadata. Public `/project-previews/` URLs are served by the site Worker from R2.
