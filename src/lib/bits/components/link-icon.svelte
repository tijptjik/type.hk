<script module lang="ts">
import proicons from '$lib/content/proicons-ui-icons.json'
import simpleIcons from '$lib/content/simple-icons-ui-icons.json'
import { addCollection } from '@iconify/svelte/dist/offline-functions'

// Bundle link icons so brand marks never need a runtime network request.
addCollection(proicons)
addCollection(simpleIcons)
</script>

<script lang="ts">
import { ExternalLink } from '@lucide/svelte'
import Icon from '@iconify/svelte/offline'

let { name, size = 22 }: { name: string; size?: number } = $props()
</script>

{#if name === 'external'}
  <ExternalLink aria-hidden="true" {size} />
{:else}
  <Icon aria-hidden="true" height={size} icon={name} width={size} />
{/if}
