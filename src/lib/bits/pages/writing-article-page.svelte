<script lang="ts">
import type { Component } from 'svelte'
import type { WritingEntry } from '$lib/content/writing'

let {
  content: Content,
  entry,
  locale,
}: {
  content: Component
  entry: WritingEntry
  locale: string
} = $props()

function formatPublicationDate(publishedAt: string) {
  const date = new Date(`${publishedAt}T00:00:00`)
  const formatPart = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, options).format(date)

  return `${formatPart({ day: 'numeric' })} ${formatPart({ month: 'long' })} ${formatPart({ year: 'numeric' })}`
}

const publishedDate = $derived(formatPublicationDate(entry.publishedAt))
</script>

<main
  class="mx-auto w-[min(100%-2rem,760px)] py-12 max-[560px]:w-[min(100%-24px,760px)] max-[560px]:py-8"
>
  <article class="writing-article">
    <header class="mb-12 border-b border-border pb-8">
      <time
        class="block text-[.73rem] font-semibold leading-none tracking-[.08em] text-muted uppercase"
        datetime={entry.publishedAt}
        >{publishedDate}</time
      >
      <h1 class="mt-3 font-display text-4xl font-semibold leading-[1.05]">
        {entry.title}
      </h1>
      <ul class="mt-5 flex flex-wrap gap-1.5" aria-label="Topics">
        {#each entry.tags as tag}
          <li
            class="rounded-[.2rem] border border-border px-[.4rem] py-[.12rem] text-[.68rem] font-semibold tracking-[.06em] text-muted uppercase"
          >
            {tag}
          </li>
        {/each}
      </ul>
    </header>

    <Content />
  </article>
</main>
