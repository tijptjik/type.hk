import { existsSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { assetKey } from './src/lib/r2-assets'

export default defineConfig({
  plugins: [
    {
      name: 'local-generated-media',
      configureServer(server) {
        const root = resolve(import.meta.dirname, '.local/site-assets')
        server.middlewares.use((req, _res, next) => {
          const url = new URL(req.url || '/', 'http://localhost')
          let pathname: string
          try { pathname = decodeURIComponent(url.pathname) } catch { return next() }
          if (assetKey(pathname)) {
            const file = resolve(root, '.' + pathname)
            if (file.startsWith(root + sep) && existsSync(file)) {
              // Vite's file middleware supplies MIME types and video byte ranges.
              req.url = '/@fs' + file + url.search
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
