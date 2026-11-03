<script lang="ts">
import { Check, Copy, Download } from '@lucide/svelte'
import { Tooltip } from 'bits-ui'
import LinkIcon from '$lib/bits/components/link-icon.svelte'
import ThemeIcons from '$lib/bits/sections/theme-icons.svelte'
import type { PaletteColor, ThemeResource } from '$lib/content/rose-punk'

let {
  palette,
  resources,
  title,
  tagline,
  paletteHeading,
  resourcesHeading,
}: {
  palette: PaletteColor[]
  resources: ThemeResource[]
  title: string
  tagline: string
  paletteHeading: string
  resourcesHeading: string
} = $props()

let copiedHex = $state<string | null>(null)
let copiedResetTimer: ReturnType<typeof setTimeout> | undefined

async function copyHex(hex: string) {
  let copied = false

  try {
    await navigator.clipboard.writeText(hex)
    copied = true
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = hex
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    copied = document.execCommand('copy')
    textArea.remove()
  }

  if (copied) {
    copiedHex = hex
    clearTimeout(copiedResetTimer)
    copiedResetTimer = setTimeout(() => {
      copiedHex = null
    }, 1600)
  }
}

function downloadThemeJson() {
  const theme = {
    system: 'base24',
    name: 'Rosé Punk',
    slug: 'rose-punk',
    author: 'Tijptjik',
    description: tagline,
    variant: 'dark',
    palette: Object.fromEntries(palette.map(({ token, hex }) => [token, hex])),
  }
  const file = new Blob([`${JSON.stringify(theme, null, 2)}\n`], {
    type: 'application/json',
  })
  const downloadUrl = URL.createObjectURL(file)
  const downloadLink = document.createElement('a')

  downloadLink.href = downloadUrl
  downloadLink.download = 'rose-punk-base24.json'
  downloadLink.click()
  URL.revokeObjectURL(downloadUrl)
}
</script>

<main
  class="grid mx-auto w-[calc(100%-clamp(2rem,7vw,6rem))] max-w-[1920px] place-items-center py-20 pt-6 pb-10 max-[560px]:w-[min(100%-24px,720px)] max-[560px]:py-0"
>
  <section class="w-full">
    <header
      class="mb-[clamp(1.5rem,3.5vw,2.5rem)] grid grid-cols-[minmax(0,1fr)_auto] gap-8 max-[700px]:grid-cols-1 max-[560px]:gap-[.9rem]"
    >
      <div>
        <p
          class="mb-2 text-[.78rem] font-bold tracking-[.13em] text-[#ff53a6] uppercase max-[560px]:hidden"
        >
          Theme
        </p>
        <h1
          class="m-0 font-display text-[clamp(2.75rem,9vw,5.5rem)] font-[650] leading-[.95] text-foreground max-[560px]:hidden"
        >
          {title}
        </h1>
        <p
          class="mt-[1.1rem] text-[clamp(1.05rem,2.5vw,1.3rem)] text-[#eb6f92] whitespace-nowrap max-[560px]:mt-[10px] max-[560px]:text-center max-[560px]:text-[#f6c177] max-[560px]:whitespace-normal"
        >
          {tagline}
        </p>
      </div>

      <aside
        aria-labelledby="resources-heading"
        class="w-full max-w-[20rem] self-start max-[700px]:self-auto"
      >
        <h2
          class="mb-4 font-display text-[.78rem] font-semibold tracking-[.1em] text-muted uppercase max-[560px]:text-[#ff53a6]"
          id="resources-heading"
        >
          {resourcesHeading}
        </h2>
        <div class="flex flex-wrap gap-[.6rem]">
          {#each resources as resource}
            {#if resource.href}
              <a
                class="inline-flex items-center gap-[.4rem] rounded-full border border-border px-[.8rem] py-[.6rem] text-[.85rem] text-foreground no-underline hover:border-link hover:text-link"
                href={resource.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {resource.label} <LinkIcon name="external" size={17} />
              </a>
            {:else}
              <span
                class="inline-flex items-center rounded-full border border-border px-[.8rem] py-[.6rem] text-[.85rem] text-[#6e6a86]"
                >{resource.label}</span
              >
            {/if}
          {/each}
        </div>
      </aside>
    </header>

    <section aria-labelledby="palette-heading">
      <div class="mb-4 flex items-center justify-between gap-4">
        <h2
          class="m-0 font-display text-[.78rem] font-semibold tracking-[.1em] text-muted uppercase max-[560px]:text-[#ff53a6]"
          id="palette-heading"
        >
          {paletteHeading}
        </h2>
        <button
          aria-label="Download Rosé Punk Base24 theme as JSON"
          class="inline-flex items-center gap-1 border border-[#eb6f92] px-[.45rem] py-[2px] font-display text-[.62rem] font-semibold tracking-[.07em] text-[#eb6f92] uppercase hover:bg-[#eb6f92]/12"
          onclick={downloadThemeJson}
          type="button"
        >
          <Download aria-hidden="true" size={13} />
          <span class="relative top-[2px]">JSON</span>
        </button>
      </div>
      <Tooltip.Provider delayDuration={250}>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
          {#each palette as color}
            <Tooltip.Root>
              <Tooltip.Trigger
                aria-label={copiedHex === color.hex
                    ? `${color.hex} copied to clipboard`
                    : `Copy ${color.hex} (${color.token}) to clipboard`}
                class="group relative grid w-full cursor-pointer grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 rounded-[.65rem] border border-[#3b384d] bg-[#1f1d2e] p-3 text-left text-[#f5f5f7] transition-colors hover:border-[#ff53a6] focus-visible:border-[#ff53a6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff53a6] sm:grid-cols-[2.5rem_minmax(0,1fr)]"
                onclick={() => copyHex(color.hex)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none absolute top-2 right-2 grid size-4 place-items-center"
                >
                  <Copy
                    class={`absolute size-4 transition-all duration-200 ${
                        copiedHex === color.hex
                          ? 'scale-75 -rotate-45 opacity-0'
                          : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100'
                      }`}
                  />
                  <Check
                    class={`absolute size-4 text-[#9bdfeb] transition-all duration-200 ${
                        copiedHex === color.hex
                          ? 'scale-100 opacity-100'
                          : 'scale-75 rotate-45 opacity-0'
                      }`}
                  />
                </span>
                <span
                  aria-hidden="true"
                  class="h-12 rounded-[.35rem] border border-white/12"
                  style={`background: ${color.hex}`}
                ></span>
                <span>
                  <span class="block font-display text-[.85rem]">
                    {color.token}
                  </span>
                  <code class="font-mono text-[.75rem] text-[#f4b7b5]">{color.hex}</code>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  role="tooltip"
                  sideOffset={8}
                  collisionPadding={12}
                  class="z-50 max-w-[min(18rem,calc(100vw-24px))] rounded-lg border border-[#555169] bg-[#26233a] px-3 py-2 text-[.75rem] leading-relaxed text-[#9bdfeb] shadow-lg"
                >
                  {color.description}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          {/each}
        </div>
      </Tooltip.Provider>
    </section>

    <ThemeIcons />
  </section>
</main>
