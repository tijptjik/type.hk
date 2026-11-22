<script lang="ts">
import LinkIcon from '$lib/bits/components/link-icon.svelte'
import type { WritingEntry } from '$lib/content/writing'

let {
  entries,
  heading,
  locale,
}: {
  entries: WritingEntry[]
  heading: string
  locale: string
} = $props()

let sortedEntries = $derived(
  [...entries].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
)

function formatPublicationDate(publishedAt: string) {
  const date = new Date(`${publishedAt}T00:00:00`)
  const formatPart = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, options).format(date)

  return `${formatPart({ day: 'numeric' })} ${formatPart({ month: 'long' })} ${formatPart({ year: 'numeric' })}`
}
</script>

<main
  class="mx-auto grid w-[calc(100%-clamp(2rem,7vw,6rem))] max-w-[1920px] place-items-center py-20 pt-6 max-[560px]:w-[min(100%-24px,720px)] max-[560px]:py-0"
>
  <section aria-label={heading} class="w-full max-[560px]:pt-3">
    <div
      class="grid grid-cols-2 gap-x-[clamp(1.5rem,3vw,4rem)] gap-y-10 max-[1024px]:grid-cols-1 max-[1024px]:gap-8"
    >
      {#each sortedEntries as entry}
        <article class="min-w-0 px-[clamp(0rem,1.15vw,1.25rem)]">
          <time
            class="text-muted block text-[.73rem] leading-none font-semibold tracking-[.08em] uppercase"
            datetime={entry.publishedAt}
            >{formatPublicationDate(entry.publishedAt)}</time
          >
          <h2 class="font-display mt-2 text-xl leading-[1.15] font-semibold">
            {#if entry.href}
              <a
                class="text-foreground hover:text-link no-underline [&_svg]:ml-[.2em] [&_svg]:inline [&_svg]:align-[-.12em]"
                href={entry.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {entry.title} <LinkIcon name="external" size={17} />
              </a>
            {:else if entry.slug}
              <a
                class="text-foreground hover:text-link no-underline"
                href={`/writing/${entry.slug}`}
              >
                {entry.title}
              </a>
            {:else}
              {entry.title}
            {/if}
          </h2>
          <ul class="mt-2 flex flex-wrap gap-1.5" aria-label="Topics and source">
            {#if entry.source === 'third-party'}
              <li
                class="inline-flex h-[1.125rem] items-center rounded-[.2rem] border border-[#ef4444]/60 bg-[#ef4444]/10 px-[.4rem] py-[.12rem] text-[.68rem] leading-none font-semibold tracking-[.06em] uppercase"
              >
                <span class="relative top-px text-[#f87171]">Coverage</span>
              </li>
            {/if}
            {#each entry.tags as tag}
              <li
                class="border-border text-muted inline-flex h-[1.125rem] items-center rounded-[.2rem] border px-[.4rem] py-[.12rem] text-[.68rem] leading-none font-semibold tracking-[.06em] uppercase"
              >
                <span class="relative top-px">{tag}</span>
              </li>
            {/each}
          </ul>
          <p class="mt-4 leading-[1.5]">
            {#if entry.href}
              <a
                class="text-muted hover:text-link no-underline"
                href={entry.href}
                rel="noopener noreferrer"
                target="_blank"
                >{@html entry.excerpt}</a
              >
            {:else if entry.slug}
              <a
                class="text-muted hover:text-link no-underline"
                href={`/writing/${entry.slug}`}
              >
                {@html entry.excerpt}
              </a>
            {:else}
              {@html entry.excerpt}
            {/if}
          </p>
        </article>
      {/each}
    </div>
  </section>
</main>
