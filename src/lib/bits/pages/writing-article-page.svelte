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
    <header class="border-border mb-12 border-b pb-8">
      <time
        class="text-muted block text-[.73rem] leading-none font-semibold tracking-[.08em] uppercase"
        datetime={entry.publishedAt}
        >{publishedDate}</time
      >
      <h1 class="font-display mt-3 text-4xl leading-[1.05] font-semibold">
        {entry.title}
      </h1>
      <ul class="mt-5 flex flex-wrap gap-1.5" aria-label="Topics">
        {#each entry.tags as tag}
          <li
            class="border-border text-muted inline-flex items-center rounded-[.2rem] border px-[.4rem] py-[.12rem] text-[.68rem] leading-none font-semibold tracking-[.06em] uppercase"
          >
            <span class="relative top-px">{tag}</span>
          </li>
        {/each}
      </ul>
    </header>

    <div class="writing-article-content">
      <Content />
    </div>
  </article>
</main>
