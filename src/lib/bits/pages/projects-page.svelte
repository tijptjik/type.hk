<script lang="ts">
import ProjectIdentities from '$lib/bits/patterns/project-identities.svelte'
import type { ProjectIdentity } from '$lib/content/site'

let {
  projects,
  theme,
}: {
  projects: ProjectIdentity[]
  theme: 'dark' | 'light'
} = $props()
</script>

<main
  class="grid mx-auto w-[calc(100%-clamp(2rem,7vw,6rem))] place-items-center py-20 pt-6 max-[560px]:w-[min(100%-24px,720px)] max-[560px]:py-0"
>
  <ProjectIdentities {projects} {theme} />
</main>
