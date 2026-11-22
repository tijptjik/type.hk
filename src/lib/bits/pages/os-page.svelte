<script lang="ts">
import { formatMapDate } from '$lib/content/maps'
import { osReadme, type OsTool } from '$lib/content/os'
import * as m from '../../../paraglide/messages.js'

let { tools }: { tools: OsTool[] } = $props()

const navigationOrder = ['bartjik', 'notjik', 'tjikup', 'runtjik']
let navigationTools = $derived(
  navigationOrder.flatMap(id => tools.filter(tool => tool.id === id)),
)
let videoControlsVisible = $state<Record<string, boolean>>({})
</script>

<main
  class="mx-auto grid w-[calc(100%-clamp(2rem,7vw,6rem))] max-w-[1920px] place-items-center py-20 pt-6 max-[560px]:w-[min(100%-24px,720px)] max-[560px]:py-0"
>
  <section aria-label={m.os_heading()} class="os-tools w-full">
    <header
      class="mb-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 max-[560px]:py-3"
    >
      <div class="flex items-center gap-3">
        {#each tools.filter(tool => tool.id === 'greetjik') as tool}
          <a
            aria-label={tool.name}
            class="focus-visible:outline-link block rounded-[.45rem] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none"
            href={`#${tool.id}`}
            title={tool.name}
          >
            <img
              alt={tool.name}
              class="size-9 object-contain"
              height="36"
              src={`/os-icons/${tool.id}.svg${tool.iconVersion ? `?v=${tool.iconVersion}` : ''}`}
              width="36"
            >
          </a>
        {/each}
        <h1
          class="font-display text-foreground m-0 text-[clamp(1.5rem,3vw,2rem)] leading-none font-bold tracking-[-.04em]"
        >
          {m.os_heading()}
        </h1>
      </div>
      <nav aria-label={m.os_heading()} class="flex items-center gap-2">
        {#each navigationTools as tool}
          <a
            aria-label={tool.name}
            class="focus-visible:outline-link block rounded-[.45rem] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none"
            href={`#${tool.id}`}
            title={tool.name}
          >
            <img
              alt={tool.name}
              class="size-9 object-contain"
              height="36"
              src={`/os-icons/${tool.id}.svg${tool.iconVersion ? `?v=${tool.iconVersion}` : ''}`}
              width="36"
            >
          </a>
        {/each}
      </nav>
    </header>
    <div
      class="grid grid-cols-2 gap-[clamp(1.5rem,3vw,4rem)] max-[1024px]:grid-cols-1 max-[1024px]:gap-8"
    >
      {#each tools as tool}
        <article
          class="min-w-0 scroll-mt-16 px-[clamp(0rem,1.15vw,1.25rem)] [&>*]:min-w-0"
          id={tool.id}
        >
          <div
            class="os-media border-border bg-surface aspect-[1200/720] w-full overflow-hidden rounded-[.55rem] border max-[560px]:mx-[calc(50%-50vw)] max-[560px]:w-screen max-[560px]:rounded-none max-[560px]:border-x-0"
          >
            {#if tool.media.videoSrc}
              <video
                aria-label={`${tool.name} — ${tool.media.title()}`}
                class="block size-full object-contain"
                controls={videoControlsVisible[tool.id] ?? true}
                muted={!tool.media.hasAudio}
                playsinline
                poster={tool.media.src}
                preload="metadata"
                src={tool.media.videoSrc}
                onclick={() => (videoControlsVisible[tool.id] = true)}
                onplay={() => (videoControlsVisible[tool.id] = false)}
                onpause={() => (videoControlsVisible[tool.id] = true)}
              ></video>
            {:else}
              <img
                alt={`${tool.name} — ${tool.media.title()}`}
                class="block size-full object-contain"
                loading="lazy"
                src={tool.media.src}
              >
            {/if}
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <h2
              class="m-0 shrink-0 [font-family:var(--font-ui)] text-[clamp(1.25rem,1.7vw,1.65rem)] leading-[1.1] font-bold tracking-[-.035em]"
            >
              <a
                class="text-project-copy hover:text-project-accent inline-flex items-center gap-2 no-underline"
                href={osReadme(tool.id)}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  alt=""
                  class="size-8 shrink-0"
                  height="32"
                  src={`/os-icons/${tool.id}.svg${tool.iconVersion ? `?v=${tool.iconVersion}` : ''}`}
                  width="32"
                >
                {tool.name}
              </a>
            </h2>
            <p
              class="text-project-detail m-0 min-w-0 flex-1 [font-family:var(--font-ui)] text-[.8rem] leading-[1.4] max-[560px]:order-last max-[560px]:basis-full"
            >
              {tool.description()}
            </p>
            <time
              class="text-project-detail ml-auto shrink-0 font-mono text-[.72rem] tracking-[.04em]"
              datetime={tool.dateTime}
              >{formatMapDate(tool.dateTime)}</time
            >
          </div>
        </article>
      {/each}
    </div>
  </section>
</main>

<style>
.os-tools {
  --font-ui:
    ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
</style>
