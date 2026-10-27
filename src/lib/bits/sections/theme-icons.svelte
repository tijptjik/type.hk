<script lang="ts">
import { onDestroy } from 'svelte'
import allIcons from '$lib/content/rose-punk-icons.json'
import * as m from '../../../paraglide/messages.js'

// Launcher controls are not application icons, including in older release lists.
const icons = allIcons.filter(icon => !icon.id.startsWith('runtjik-'))

let query = $state('')
let copyStates = $state<Record<string, 'copying' | 'copied'>>({})
let copyFeedback = $state('')
const svgCache = new Map<string, Promise<string>>()
const resetTimers = new Map<string, ReturnType<typeof setTimeout>>()
let destroyed = false

function svgText(src: string) {
  let pending = svgCache.get(src)
  if (!pending) {
    pending = fetch(src)
      .then(response => {
        if (!response.ok) throw new Error('Could not load icon')
        return response.text()
      })
      .catch(error => {
        svgCache.delete(src)
        throw error
      })
    svgCache.set(src, pending)
  }
  return pending
}

async function writeSvg(svg: Promise<string>) {
  try {
    // Promise-backed clipboard data preserves the click's user activation
    // while a first-time SVG fetch finishes, including in Safari.
    if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': svg.then(text => new Blob([text], { type: 'text/plain' })),
        }),
      ])
    } else {
      await navigator.clipboard.writeText(await svg)
    }
  } catch {
    const text = await svg
    const focused = document.activeElement
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    try {
      textArea.select()
      if (!document.execCommand('copy')) throw new Error('Clipboard copy failed')
    } finally {
      textArea.remove()
      if (focused instanceof HTMLElement && focused.isConnected)
        focused.focus({ preventScroll: true })
    }
  }
}

async function copyIcon(icon: (typeof icons)[number]) {
  if (copyStates[icon.id] === 'copying') return
  clearTimeout(resetTimers.get(icon.id))
  copyStates[icon.id] = 'copying'
  copyFeedback = ''
  try {
    await writeSvg(svgText(icon.src))
    if (destroyed) return
    copyStates[icon.id] = 'copied'
    copyFeedback = m.rose_punk_icons_copied({ name: icon.name })
    resetTimers.set(
      icon.id,
      setTimeout(() => {
        delete copyStates[icon.id]
        resetTimers.delete(icon.id)
      }, 1800),
    )
  } catch {
    if (destroyed) return
    delete copyStates[icon.id]
    copyFeedback = m.rose_punk_icons_copy_failed({ name: icon.name })
  }
}

onDestroy(() => {
  destroyed = true
  for (const timer of resetTimers.values()) clearTimeout(timer)
})
const filteredIcons = $derived(
  icons.filter(icon =>
    `${icon.name} ${icon.id}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  ),
)
</script>

<section
  aria-labelledby="icons-heading"
  class="mt-12 scroll-mt-16 border-t border-border pt-8"
  id="icons"
>
  <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2
        class="m-0 font-display text-[.78rem] font-semibold tracking-[.1em] text-muted uppercase max-[560px]:text-[#ff53a6]"
        id="icons-heading"
      >
        {m.rose_punk_icons_heading()}
      </h2>
      <p class="mt-2 text-[.85rem] leading-relaxed text-project-detail">
        {m.rose_punk_icons_description()}
      </p>
    </div>
    <div class="grid w-full gap-2 sm:w-72">
      <label class="sr-only" for="icon-search">{m.rose_punk_icons_search()}</label>
      <input
        bind:value={query}
        class="w-full rounded-[.45rem] border border-border bg-surface px-3 py-2 text-[.85rem] text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
        id="icon-search"
        placeholder={m.rose_punk_icons_search()}
        type="search"
      >
      <p aria-live="polite" aria-atomic="true" class="text-[.7rem] text-muted">
        {m.rose_punk_icons_count({ visible: filteredIcons.length, total: icons.length })}
      </p>
    </div>
  </div>
  <ul
    class="grid list-none grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-3 p-0 max-[560px]:grid-cols-3 max-[360px]:grid-cols-2"
  >
    {#each filteredIcons as icon (icon.id)}
      <li class="min-w-0">
        <button
          aria-busy={copyStates[icon.id] === 'copying'}
          aria-label={copyStates[icon.id] === 'copied' ? m.rose_punk_icons_copied({ name: icon.name }) : m.rose_punk_icons_copy({ name: icon.name })}
          class="icon-copy flex h-full min-h-36 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[.65rem] border border-border bg-surface px-2 py-4 text-center text-foreground transition-colors hover:border-link hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
          data-copied={copyStates[icon.id] === 'copied'}
          onclick={() => copyIcon(icon)}
          title={copyStates[icon.id] === 'copied' ? m.rose_punk_icons_copied({ name: icon.name }) : m.rose_punk_icons_copy({ name: icon.name })}
          type="button"
        >
          <span aria-hidden="true" class="icon-art relative block size-16 shrink-0">
            <img
              alt=""
              class="block size-full object-contain"
              decoding="async"
              height="64"
              loading="lazy"
              src={icon.src}
              width="64"
            >
            <svg
              aria-hidden="true"
              class="icon-check absolute inset-0 size-full text-link"
              fill="none"
              viewBox="0 0 64 64"
            >
              <path
                d="M14 33 27 46 51 19"
                pathLength="1"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="6"
              />
            </svg>
          </span>
          <span class="max-w-full break-words text-[.72rem] leading-snug"
            >{icon.name}</span
          >
        </button>
      </li>
    {/each}
  </ul>
  <p aria-live="polite" aria-atomic="true" class="sr-only">{copyFeedback}</p>
  {#if filteredIcons.length === 0}
    <p class="py-10 text-center text-[.9rem] text-muted">{m.rose_punk_icons_empty()}</p>
  {/if}
</section>

<style>
.icon-art img {
  transition:
    opacity 200ms ease,
    transform 260ms ease,
    filter 200ms ease;
}

.icon-copy:hover:not([data-copied="true"]) .icon-art img {
  transform: scale(1.08);
}

.icon-check {
  opacity: 0;
  transform: scale(0.65) rotate(-12deg);
  transition:
    opacity 180ms ease,
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.icon-check path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 280ms ease;
}

.icon-copy[data-copied="true"] {
  border-color: var(--link);
}

.icon-copy[data-copied="true"] .icon-art img {
  opacity: 0;
  transform: scale(0.65) rotate(12deg);
  filter: blur(5px);
}

.icon-copy[data-copied="true"] .icon-check {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.icon-copy[data-copied="true"] .icon-check path {
  stroke-dashoffset: 0;
  transition-delay: 80ms;
}

@media (prefers-reduced-motion: reduce) {
  .icon-art img,
  .icon-check,
  .icon-check path {
    transition: none;
  }
}
</style>
