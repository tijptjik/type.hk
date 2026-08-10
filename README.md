# type.hk

Personal site for tijptjik, built as a small Svelte single-page app and
deployed to Cloudflare Workers.

## Setup

### Prerequisites

- [Bun](https://bun.sh/)
- A Cloudflare account and Wrangler authentication only when deploying

Install dependencies and start the development server:

```sh
bun install
bun run dev
```

Build and check the project:

```sh
bun run build
bun run check
```

Run the production build through the local Cloudflare Worker runtime:

```sh
bun run preview:worker
```

Deploy with:

```sh
bun run deploy
```

## Tech stack

- Svelte 5 and TypeScript for the UI
- Vite for development and production builds
- Tailwind CSS 4 and Bits UI for styling and components
- Paraglide JS for English, Traditional Chinese, and Simplified Chinese content
- Cloudflare Workers and Wrangler for hosting
- Biome for formatting and linting

## Useful commands

```sh
bun run lint      # check formatting and lint rules
bun run format    # apply formatting
```

See [the screenshot-capture guide](docs/screencap.md) for generating site previews.
