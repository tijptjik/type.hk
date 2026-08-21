<script lang="ts">
import { onMount } from 'svelte'
import { ChevronLeft, ChevronRight } from '@lucide/svelte'
import type { ProjectPreview } from '$lib/content/site'

type LocalizedProjectPreview = Omit<ProjectPreview, 'copy'> & {
  alt: string
  title: string
}

let {
  slides,
  heading,
  nextLabel,
  previousLabel,
  slideLabel,
  roleDescription,
  slideRoleDescription,
  carouselId,
  autoplayDelay = 5000,
  autoplayStartDelay = 0,
}: {
  slides: LocalizedProjectPreview[]
  heading: string
  nextLabel: string
  previousLabel: string
  slideLabel: (inputs: { current: number; total: number }) => string
  roleDescription: string
  slideRoleDescription: string
  carouselId: string
  autoplayDelay?: number
  autoplayStartDelay?: number
} = $props()

let activeSlide = $state(0)
let carousel = $state<HTMLElement>()
let autoplayTimer: ReturnType<typeof setInterval> | undefined
let autoplayStartTimer: ReturnType<typeof setTimeout> | undefined
let autoplayEnabled = false
let autoplayPaused = false
let dragPointerId: number | undefined
let dragStartScrollLeft = 0
let dragStartSlide = 0
let dragStartX = 0

function showSlide(index: number) {
  if (!carousel || slides.length === 0) return

  activeSlide = (index + slides.length) % slides.length
  const slide = carousel.children.item(activeSlide) as HTMLElement | null

  // Scrolling the carousel itself keeps autoplay from also moving the page.
  carousel.scrollTo({
    behavior: 'smooth',
    left: slide?.offsetLeft ?? 0,
  })
}

function updateActiveSlide() {
  if (!carousel) return

  const centre = carousel.scrollLeft + carousel.clientWidth / 2
  let closestIndex = activeSlide
  let closestDistance = Number.POSITIVE_INFINITY

  Array.from(carousel.children).forEach((slide, index) => {
    const element = slide as HTMLElement
    const distance = Math.abs(element.offsetLeft + element.clientWidth / 2 - centre)
    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = index
    }
  })

  activeSlide = closestIndex
}

function clearAutoplay() {
  if (autoplayStartTimer) clearTimeout(autoplayStartTimer)
  if (autoplayTimer) clearInterval(autoplayTimer)

  autoplayStartTimer = undefined
  autoplayTimer = undefined
}

function startAutoplay() {
  clearAutoplay()
  if (!autoplayEnabled || autoplayPaused) return

  autoplayStartTimer = setTimeout(() => {
    autoplayTimer = setInterval(() => showSlide(activeSlide + 1), autoplayDelay)
  }, autoplayStartDelay)
}

function pauseAutoplay() {
  autoplayPaused = true
  clearAutoplay()
}

function resumeAutoplay() {
  autoplayPaused = false
  startAutoplay()
}

function startDrag(event: PointerEvent) {
  if (!carousel || (event.pointerType === 'mouse' && event.button !== 0)) return

  dragPointerId = event.pointerId
  dragStartScrollLeft = carousel.scrollLeft
  dragStartSlide = activeSlide
  dragStartX = event.clientX
  carousel.setPointerCapture(event.pointerId)
  pauseAutoplay()
}

function moveDrag(event: PointerEvent) {
  if (!carousel || dragPointerId !== event.pointerId) return

  carousel.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX)
}

function finishDrag(event: PointerEvent) {
  if (!carousel || dragPointerId !== event.pointerId) return

  const distance = event.clientX - dragStartX
  const threshold = Math.min(56, Math.max(32, carousel.clientWidth * 0.12))

  if (Math.abs(distance) >= threshold) {
    showSlide(dragStartSlide + (distance > 0 ? -1 : 1))
  } else {
    showSlide(dragStartSlide)
  }

  if (carousel.hasPointerCapture(event.pointerId)) {
    carousel.releasePointerCapture(event.pointerId)
  }

  dragPointerId = undefined
  resumeAutoplay()
}

function cancelDrag(event: PointerEvent) {
  if (!carousel || dragPointerId !== event.pointerId) return

  showSlide(dragStartSlide)
  dragPointerId = undefined
  resumeAutoplay()
}

onMount(() => {
  autoplayEnabled =
    slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  startAutoplay()

  return clearAutoplay
})
</script>

{#if slides.length > 0}
  <section
    aria-labelledby={carouselId}
    class="project-carousel relative m-0 w-full max-[560px]:w-screen max-[560px]:mx-[calc(50%-50vw)]"
    onfocusin={pauseAutoplay}
    onfocusout={resumeAutoplay}
    onpointerenter={pauseAutoplay}
    onpointerleave={resumeAutoplay}
  >
    <div class="absolute top-3 right-3 z-1 max-[560px]:hidden">
      <h2 class="sr-only" id={carouselId}>{heading}</h2>
      {#if slides.length > 1}
        <div class="flex gap-[.3rem]">
          <button
            aria-label={previousLabel}
            class="grid size-8 place-items-center rounded-full border border-[var(--overlay-border)] bg-[var(--overlay-bg)] text-muted backdrop-blur-[.45rem] hover:border-project-accent hover:bg-[color-mix(in_srgb,var(--overlay-bg)_85%,black)] hover:text-project-accent"
            onclick={() => showSlide(activeSlide - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={20} />
          </button>
          <button
            aria-label={nextLabel}
            class="grid size-8 place-items-center rounded-full border border-[var(--overlay-border)] bg-[var(--overlay-bg)] text-muted backdrop-blur-[.45rem] hover:border-project-accent hover:bg-[color-mix(in_srgb,var(--overlay-bg)_85%,black)] hover:text-project-accent"
            onclick={() => showSlide(activeSlide + 1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" size={20} />
          </button>
        </div>
      {/if}
    </div>

    <section
      aria-labelledby={carouselId}
      aria-roledescription={roleDescription}
      bind:this={carousel}
      class="flex touch-pan-y touch-pinch-zoom snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[.55rem] border border-border bg-surface [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[560px]:rounded-none max-[560px]:border-x-0"
      ondragstart={event => event.preventDefault()}
      onpointercancel={cancelDrag}
      onpointerdown={startDrag}
      onpointermove={moveDrag}
      onpointerup={finishDrag}
      onscroll={updateActiveSlide}
    >
      {#each slides as slide, index}
        <article
          aria-label={slideLabel({ current: index + 1, total: slides.length })}
          aria-roledescription={slideRoleDescription}
          class="relative aspect-[1200/720] shrink-0 basis-full snap-start snap-always"
        >
          <a
            class="relative block size-full text-foreground"
            href={slide.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt={slide.alt}
              class="block size-full select-none object-cover"
              draggable="false"
              src={slide.src}
            >
          </a>
          <span
            class="pointer-events-none absolute bottom-3 left-3 rounded-none border border-[var(--overlay-border)] bg-[var(--overlay-bg)] px-[.55rem] py-[2px] [font-family:var(--font-ui)] text-[.7rem] font-[650] tracking-[.04em] text-white backdrop-blur-[.45rem]"
            >{slide.title}</span
          >
        </article>
      {/each}
    </section>

    {#if slides.length > 1}
      <nav aria-label={heading} class="mt-[.7rem] flex justify-center gap-[.45rem]">
        {#each slides as slide, index}
          <button
            aria-label={slideLabel({ current: index + 1, total: slides.length })}
            aria-current={index === activeSlide ? 'true' : undefined}
            class={`size-[.55rem] rounded-full bg-border p-0 hover:bg-project-accent ${index === activeSlide ? 'bg-project-accent' : ''}`}
            onclick={() => showSlide(index)}
            type="button"
          ></button>
        {/each}
      </nav>
    {/if}
  </section>
{/if}

<style>
.project-carousel {
  --font-ui:
    ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --overlay-bg: rgb(16 16 24 / 0.76);
  --overlay-border: rgb(255 255 255 / 0.2);
}
</style>
