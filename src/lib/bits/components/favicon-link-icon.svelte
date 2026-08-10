<script lang="ts">
import LinkIcon from '$lib/bits/components/link-icon.svelte'

let {
  fallbackIcon,
  href,
  size = 18,
}: { fallbackIcon: string; href: string; size?: number } = $props()

const faviconPaths = ['/favicon.svg', '/favicon.png', '/favicon.ico']
let faviconAvailable = $state(true)
let faviconPathIndex = $state(0)
let faviconHref = $derived.by(() => {
  try {
    return new URL(faviconPaths[faviconPathIndex] ?? '/favicon.ico', href).href
  } catch {
    return ''
  }
})

function tryNextFavicon() {
  if (faviconPathIndex < faviconPaths.length - 1) {
    faviconPathIndex += 1
    return
  }

  faviconAvailable = false
}
</script>

{#if faviconAvailable && faviconHref}
  <img
    alt=""
    aria-hidden="true"
    class={`block max-h-full max-w-full object-contain ${faviconPathIndex === 0 ? 'scale-125' : ''}`}
    height={size}
    onerror={tryNextFavicon}
    referrerpolicy="no-referrer"
    src={faviconHref}
    width={size}
  >
{:else}
  <LinkIcon name={fallbackIcon} {size} />
{/if}
