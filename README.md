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

The development server listens on `http://127.0.0.1:5176` and fails if that port
is occupied. The root `Caddyfile` proxies `http://type.localhost` to this server,
including Vite's HMR WebSocket. Add its site block to `/etc/caddy/Caddyfile`
alongside the other local projects, then validate and reload Caddy:

```sh
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Keep `bun run dev` running and open <http://type.localhost>.

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
