<script lang="ts">
import { formatMapDate } from '$lib/content/maps'
import { osReadme, type OsTool } from '$lib/content/os'
import * as m from '../../../paraglide/messages.js'

let { tools }: { tools: OsTool[] } = $props()

const navigationOrder = ['bartjik', 'notjik', 'tjikup', 'runtjik']
let navigationTools = $derived(
  navigationOrder.flatMap(id => tools.filter(tool => tool.id === id)),
)
</script>

<main
  class="grid mx-auto w-[calc(100%-clamp(2rem,7vw,6rem))] max-w-[1920px] place-items-center py-20 pt-6 max-[560px]:w-[min(100%-24px,720px)] max-[560px]:py-0"
>
  <section aria-label={m.os_heading()} class="os-tools w-full">
    <header
      class="mb-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 max-[560px]:py-3"
    >
      <div class="flex items-center gap-3">
        {#each tools.filter(tool => tool.id === 'greetjik') as tool}
          <a
            aria-label={tool.name}
            class="block rounded-[.45rem] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link motion-reduce:transition-none"
            href={`#${tool.id}`}
            title={tool.name}
          >
            <img
              alt=""
              class="size-9 object-contain"
              height="36"
              src={`/os-icons/${tool.id}.svg${tool.iconVersion ? `?v=${tool.iconVersion}` : ''}`}
              width="36"
            >
          </a>
        {/each}
        <h1
          class="m-0 font-display text-[clamp(1.5rem,3vw,2rem)] font-bold leading-none tracking-[-.04em] text-foreground"
        >
          {m.os_heading()}
        </h1>
      </div>
      <nav aria-label={m.os_heading()} class="flex items-center gap-2">
        {#each navigationTools as tool}
          <a
            aria-label={tool.name}
            class="block rounded-[.45rem] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link motion-reduce:transition-none"
            href={`#${tool.id}`}
            title={tool.name}
          >
            <img
              alt=""
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
            class="os-media aspect-[1200/720] w-full overflow-hidden rounded-[.55rem] border border-border bg-surface max-[560px]:mx-[calc(50%-50vw)] max-[560px]:w-screen max-[560px]:rounded-none max-[560px]:border-x-0"
          >
            {#if tool.media.videoSrc}
              <video
                aria-label={`${tool.name} — ${tool.media.title()}`}
                class="block size-full object-contain"
                controls
                muted={!tool.media.hasAudio}
                playsinline
                poster={tool.media.src}
                preload="metadata"
                src={tool.media.videoSrc}
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
              class="m-0 shrink-0 [font-family:var(--font-ui)] text-[clamp(1.25rem,1.7vw,1.65rem)] font-bold leading-[1.1] tracking-[-.035em]"
            >
              <a
                class="inline-flex items-center gap-2 text-project-copy no-underline hover:text-project-accent"
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
              class="m-0 min-w-0 flex-1 [font-family:var(--font-ui)] text-[.8rem] leading-[1.4] text-project-detail max-[560px]:order-last max-[560px]:basis-full"
            >
              {tool.description()}
            </p>
            <time
              class="ml-auto shrink-0 font-mono text-[.72rem] tracking-[.04em] text-project-detail"
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
