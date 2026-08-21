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
  class="grid mx-auto w-[calc(100%-clamp(2rem,7vw,6rem))] max-w-[1920px] place-items-center py-20 pt-6 max-[560px]:w-[min(100%-24px,720px)] max-[560px]:py-0"
>
  <section aria-label={heading} class="w-full max-[560px]:pt-3">
    <div
      class="grid grid-cols-2 gap-x-[clamp(1.5rem,3vw,4rem)] gap-y-10 max-[1024px]:grid-cols-1 max-[1024px]:gap-8"
    >
      {#each sortedEntries as entry}
        <article class="min-w-0 px-[clamp(0rem,1.15vw,1.25rem)]">
          <time
            class="block text-[.73rem] font-semibold leading-none tracking-[.08em] text-muted uppercase"
            datetime={entry.publishedAt}
            >{formatPublicationDate(entry.publishedAt)}</time
          >
          <h2 class="mt-2 font-display text-xl font-semibold leading-[1.15]">
            {#if entry.href}
              <a
                class="inline-flex items-center gap-[.35rem] text-foreground no-underline hover:text-link [&_svg]:shrink-0"
                href={entry.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {entry.title} <LinkIcon name="external" size={17} />
              </a>
            {:else if entry.slug}
              <a
                class="text-foreground no-underline hover:text-link"
                href={`/writing/${entry.slug}`}
              >
                {entry.title}
              </a>
            {:else}
              {entry.title}
            {/if}
          </h2>
          <ul class="mt-2 flex flex-wrap gap-1.5" aria-label="Topics">
            {#each entry.tags as tag}
              <li
                class="inline-flex items-center rounded-[.2rem] border border-border px-[.4rem] py-[.12rem] text-[.68rem] leading-none font-semibold tracking-[.06em] text-muted uppercase"
              >
                <span class="relative top-px">{tag}</span>
              </li>
            {/each}
          </ul>
          <p class="mt-4 leading-[1.5]">
            {#if entry.href}
              <a
                class="text-muted no-underline hover:text-link"
                href={entry.href}
                rel="noopener noreferrer"
                target="_blank"
                >{@html entry.excerpt}</a
              >
            {:else if entry.slug}
              <a
                class="text-muted no-underline hover:text-link"
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
