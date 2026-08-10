<script module lang="ts">
import { icons as proicons } from '@iconify-json/proicons'
import { addCollection } from '@iconify/svelte/dist/offline-functions'

// Bundle Proicons with the site rather than fetching them at runtime.
addCollection(proicons)
</script>

<script lang="ts">
import Icon from '@iconify/svelte/dist/OfflineIcon.svelte'

let { name, size = 22 }: { name: string; size?: number } = $props()
</script>

<Icon aria-hidden="true" height={size} icon={`proicons:${name}`} width={size} />
