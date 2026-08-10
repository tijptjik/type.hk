/** @type {import('svelte').Config} */
const config = {
  compilerOptions: {
    experimental: {
      async: true,
    },
    // Match Atlas: app code always uses the Svelte 5 runes API.
    runes: ({ filename }) =>
      filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
  },
}

export default config
