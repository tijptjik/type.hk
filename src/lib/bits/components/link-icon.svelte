<script module lang="ts">
import { icons as proicons } from '@iconify-json/proicons'
import { icons as selfhst } from '@iconify-json/selfhst'
import { icons as simpleIcons } from '@iconify-json/simple-icons'
import { addCollection } from '@iconify/svelte/dist/offline-functions'

// Bundle link icons so brand marks never need a runtime network request.
addCollection(proicons)
addCollection(selfhst)
addCollection(simpleIcons)
</script>

<script lang="ts">
import { ExternalLink } from '@lucide/svelte'
import Icon from '@iconify/svelte/dist/OfflineIcon.svelte'

let { name, size = 22 }: { name: string; size?: number } = $props()
</script>

{#if name === 'external'}
  <ExternalLink aria-hidden="true" {size} />
{:else}
  <Icon aria-hidden="true" height={size} icon={name} width={size} />
{/if}
