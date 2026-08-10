<script lang="ts">
import LinkIcon from '$lib/bits/components/link-icon.svelte'

let {
  fallbackIcon,
  href,
  size = 18,
}: { fallbackIcon: string; href: string; size?: number } = $props()

let faviconAvailable = $state(true)
let faviconHref = $derived.by(() => {
  try {
    return new URL('/favicon.ico', href).href
  } catch {
    return ''
  }
})
</script>

{#if faviconAvailable && faviconHref}
  <img
    alt=""
    aria-hidden="true"
    class="block max-h-full max-w-full object-contain"
    height={size}
    onerror={() => (faviconAvailable = false)}
    referrerpolicy="no-referrer"
    src={faviconHref}
    width={size}
  >
{:else}
  <LinkIcon name={fallbackIcon} {size} />
{/if}
