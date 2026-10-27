import { existsSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { assetKey } from './src/lib/r2-assets'

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5176,
    strictPort: true,
  },
  plugins: [
    {
      name: 'local-generated-media',
      configureServer(server) {
        const root = resolve(import.meta.dirname, '.local/site-assets')
        const releases = resolve(import.meta.dirname, '.local/rose-punk-releases')
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url || '/', 'http://localhost')
          let pathname: string
          try { pathname = decodeURIComponent(url.pathname) } catch { return next() }
          if (assetKey(pathname)) {
            const candidates: [string, string][] = [[root, pathname]]
            if (pathname.startsWith('/rose-punk-releases/')) {
              // Release registration keeps its verified snapshot separate from
              // the mutable media exports prepared for R2 upload.
              candidates.push([releases, pathname.slice('/rose-punk-releases'.length)])
            }
            const file = candidates.map(([directory, path]) => {
              const candidate = resolve(directory, '.' + path)
              return candidate.startsWith(directory + sep) && existsSync(candidate) ? candidate : null
            }).find(Boolean)
            if (file) {
              // Vite's file middleware supplies MIME types and video byte ranges.
              req.url = '/@fs' + file + url.search
            } else {
              // A missing SVG must not fall through to the SPA's HTML response.
              res.statusCode = 404
              res.setHeader('Content-Type', 'text/plain; charset=utf-8')
              res.end('Local asset not found; prepare media in .local/site-assets or register the icon release')
              return
            }
          }
          next()
        })
      },
    },
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      emitTsDeclarations: true,
    }),
    tailwindcss(),
    svelte({ extensions: ['.svelte', '.svx'] }),
  ],
  resolve: {
    alias: {
      $lib: resolve(import.meta.dirname, 'src/lib'),
    },
  },
})
