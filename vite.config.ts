import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: {
      $lib: resolve(import.meta.dirname, 'src/lib'),
    },
  },
})
