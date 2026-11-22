<script lang="ts">
import { preloadImage, revealImage } from '$lib/bits/image-loading'
import { onMount, tick } from 'svelte'
import { Maximize2, X } from '@lucide/svelte'
import FaviconLinkIcon from '$lib/bits/components/favicon-link-icon.svelte'
import { formatMapDate, type MapShowcase } from '$lib/content/maps'

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => ViewTransition
}

let {
  heading,
  showcases,
}: {
  heading: string
  showcases: MapShowcase[]
} = $props()

// Compare stable keys: $state proxies objects, so record identity is not preserved.
let activeShowcaseHref = $state<string | null>(null)
let transitioningShowcaseHref = $state<string | null>(null)
let opener = $state<HTMLButtonElement | null>(null)
let closeButton = $state<HTMLButtonElement | null>(null)
let viewportResizeFrame: number | null = null

function syncExpandedMapViewport() {
  if (!activeShowcaseHref) return

  const viewport = window.visualViewport
  const mapViewportWidth = `${viewport?.width ?? window.innerWidth}px`
  const mapViewportHeight = `${viewport?.height ?? window.innerHeight}px`

  document.querySelectorAll<HTMLElement>('.map-preview--expanded').forEach(preview => {
    preview.style.setProperty('--map-viewport-width', mapViewportWidth)
    preview.style.setProperty('--map-viewport-height', mapViewportHeight)
  })
}

function scheduleExpandedMapViewportSync() {
  if (viewportResizeFrame !== null) cancelAnimationFrame(viewportResizeFrame)

  viewportResizeFrame = requestAnimationFrame(() => {
    viewportResizeFrame = null
    syncExpandedMapViewport()
  })
}

$effect(() => {
  if (!activeShowcaseHref) return

  // Sync when the dialog is first rendered, then let the viewport events keep
  // the iframe's containing block current while the device rotates.
  syncExpandedMapViewport()
  scheduleExpandedMapViewportSync()
})

onMount(() => {
  const handleViewportResize = () => scheduleExpandedMapViewportSync()
  const visualViewport = window.visualViewport

  window.addEventListener('resize', handleViewportResize)
  window.addEventListener('orientationchange', handleViewportResize)
  visualViewport?.addEventListener('resize', handleViewportResize)

  return () => {
    window.removeEventListener('resize', handleViewportResize)
    window.removeEventListener('orientationchange', handleViewportResize)
    visualViewport?.removeEventListener('resize', handleViewportResize)
    if (viewportResizeFrame !== null) cancelAnimationFrame(viewportResizeFrame)
  }
})

async function setActiveShowcase(showcase: MapShowcase | null) {
  const transitionDocument = document as ViewTransitionDocument
  const update = async () => {
    activeShowcaseHref = showcase?.href ?? null
    await tick()
  }

  if (!transitionDocument.startViewTransition) {
    await update()
    return
  }

  // A single named element exists on either side of the update, allowing the
  // platform to interpolate the preview into the two-column map stage.
  transitioningShowcaseHref = showcase?.href ?? activeShowcaseHref
  await tick()
  const transition = transitionDocument.startViewTransition(update)
  void transition.finished.finally(() => {
    transitioningShowcaseHref = null
  })
  await transition.ready.catch(() => {})
}

async function openShowcase(showcase: MapShowcase, event: MouseEvent) {
  opener = event.currentTarget as HTMLButtonElement
  await setActiveShowcase(showcase)
  closeButton?.focus()
}

async function closeShowcase() {
  if (!activeShowcaseHref) return

  await setActiveShowcase(null)
  opener?.focus()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') void closeShowcase()
}
</script>

<svelte:window onkeydown={handleKeydown} />

<main
  class="mx-auto grid w-[calc(100%-clamp(2rem,7vw,6rem))] max-w-[1920px] place-items-center py-20 pt-6 pb-10 max-[560px]:w-full max-[560px]:py-0"
>
  <section aria-label={heading} class="map-showcase w-full">
    {#if activeShowcaseHref}
      <div aria-hidden="true" class="map-expanded__scrim"></div>
    {/if}
    <div
      class="grid grid-cols-2 gap-[clamp(1.5rem,3vw,4rem)] max-[1024px]:grid-cols-1 max-[1024px]:gap-12"
    >
      {#each showcases as showcase}
        <article class="min-w-0 px-[var(--map-card-gutter)] [&>*]:min-w-0">
          {#if showcase.embedUrl}
            <!-- biome-ignore lint/a11y/useAriaPropsSupportedByRole: The dialog role and its ARIA attributes are enabled together when expanded. -->
            <div
              aria-label={activeShowcaseHref === showcase.href
                ? showcase.title
                : undefined}
              aria-modal={activeShowcaseHref === showcase.href ? 'true' : undefined}
              class:map-preview--expanded={activeShowcaseHref === showcase.href}
              class="map-preview group border-border bg-surface relative aspect-[1200/720] overflow-hidden rounded-[.55rem] border"
              role={activeShowcaseHref === showcase.href ? 'dialog' : undefined}
              style={transitioningShowcaseHref === showcase.href
                ? 'view-transition-name: map-showcase-stage'
                : undefined}
            >
              <!-- svelte-ignore a11y_no_noninteractive_tabindex -- Inactive previews are removed from keyboard navigation; the expanded preview keeps its native iframe focus behavior. -->
              <iframe
                allow="fullscreen"
                aria-hidden={activeShowcaseHref !== showcase.href}
                class={`block size-full border-0 ${activeShowcaseHref === showcase.href ? '' : 'pointer-events-none'}`}
                loading="lazy"
                src={showcase.embedUrl}
                tabindex={activeShowcaseHref === showcase.href ? undefined : -1}
                title={`${showcase.title} preview`}
              ></iframe>
              {#if activeShowcaseHref === showcase.href}
                <button
                  aria-label={`Close ${showcase.title}`}
                  bind:this={closeButton}
                  class="map-expanded__close grid size-11 place-items-center rounded-full"
                  onclick={closeShowcase}
                  type="button"
                >
                  <X aria-hidden="true" size={24} />
                </button>
              {:else}
                <button
                  aria-label={`Expand ${showcase.title}`}
                  class="map-preview__expand absolute inset-0 cursor-zoom-in max-[1024px]:hidden"
                  onclick={event => void openShowcase(showcase, event)}
                  type="button"
                >
                  <span class="map-preview__expand-icon">
                    <Maximize2 aria-hidden="true" size={18} />
                  </span>
                </button>
              {/if}
            </div>
          {:else}
            <a
              class="map-preview border-border bg-surface block aspect-[1200/720] overflow-hidden rounded-[.55rem] border"
              href={showcase.href}
              onfocus={() => preloadImage(showcase.imageSrc)}
              onpointerenter={() => preloadImage(showcase.imageSrc)}
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                use:revealImage
                alt={`Preview of ${showcase.title}`}
                class="image-fade-in block size-full object-cover"
                loading="lazy"
                src={showcase.imageSrc}
              >
            </a>
          {/if}
          <div class="mt-3 flex items-start justify-between gap-3">
            <h2
              class="min-w-0 [font-family:var(--font-ui)] text-[clamp(1.25rem,1.7vw,1.65rem)] leading-[1.1] font-bold tracking-[-.035em]"
            >
              <a
                class="text-project-copy hover:text-project-accent inline-flex items-center gap-2.5 no-underline"
                href={showcase.href}
                onfocus={() => preloadImage(showcase.imageSrc)}
                onpointerenter={() => preloadImage(showcase.imageSrc)}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span class="pl-[2px]">
                  <FaviconLinkIcon
                    fallbackIcon="external"
                    href={showcase.href}
                    size={20}
                  />
                </span>
                <span>{showcase.title}</span>
              </a>
            </h2>
            <time
              class="text-project-detail shrink-0 font-mono text-[.72rem] tracking-[.04em]"
              datetime={showcase.dateTime}
            >
              {formatMapDate(showcase.dateTime)}
            </time>
          </div>
        </article>
      {/each}
    </div>
  </section>
</main>

<style>
.map-showcase {
  --map-card-gutter: clamp(0rem, 1.15vw, 1.25rem);
  --font-ui:
    ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --overlay-bg: rgb(16 16 24 / 0.76);
  --overlay-border: rgb(255 255 255 / 0.2);
}

@media (max-width: 560px) {
  .map-showcase {
    --map-card-gutter: 12px;
  }

  .map-preview {
    height: min(55svh, 32rem);
    min-height: 13rem;
    aspect-ratio: auto;
  }
}

.map-preview__expand {
  display: grid;
  place-items: center;
  border: 0;
  background: rgb(9 8 14 / 0);
  color: white;
  opacity: 0;
  transition:
    background-color 180ms ease,
    opacity 180ms ease;
}

.map-preview:hover .map-preview__expand,
.map-preview:focus-within .map-preview__expand {
  background: rgb(9 8 14 / 0.64);
  opacity: 1;
}

.map-preview__expand-icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid var(--overlay-border);
  border-radius: 999px;
  background: var(--overlay-bg);
  box-shadow: 0 0.3rem 1rem rgb(0 0 0 / 0.25);
  backdrop-filter: blur(0.45rem);
}

.map-preview__expand:hover .map-preview__expand-icon,
.map-preview__expand:focus-visible .map-preview__expand-icon {
  border-color: var(--project-accent);
  color: var(--project-accent);
}

.map-preview--expanded {
  --map-viewport-width: 100vw;
  --map-viewport-height: 100dvh;
  position: fixed;
  z-index: 21;
  top: 50%;
  left: 50%;
  width: calc(var(--map-viewport-width) - 2rem);
  height: calc(var(--map-viewport-height) - 2rem);
  margin: 0;
  aspect-ratio: auto;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 0.55rem;
  background: var(--surface);
  box-shadow: 0 1.4rem 4rem rgb(0 0 0 / 0.35);
  transform: translate(-50%, -50%);
}

.map-expanded__scrim {
  position: fixed;
  z-index: 20;
  inset: 0;
  background: var(--background);
}

.map-expanded__close {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  border: 1px solid rgb(255 255 255 / 0.35);
  background: rgb(24 22 34 / 0.82);
  color: white;
  box-shadow: 0 0.3rem 1rem rgb(0 0 0 / 0.3);
  backdrop-filter: blur(0.45rem);
}

.map-expanded__close:hover {
  border-color: var(--project-accent);
  color: var(--project-accent);
}

:global(::view-transition-group(map-showcase-stage)) {
  animation-duration: 360ms;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

:global(::view-transition-old(map-showcase-stage)),
:global(::view-transition-new(map-showcase-stage)) {
  animation-duration: 360ms;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .map-preview__expand,
  :global(::view-transition-group(map-showcase-stage)),
  :global(::view-transition-old(map-showcase-stage)),
  :global(::view-transition-new(map-showcase-stage)) {
    animation-duration: 1ms;
    transition-duration: 1ms;
  }
}
</style>
