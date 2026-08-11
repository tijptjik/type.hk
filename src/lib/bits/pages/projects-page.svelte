<script lang="ts">
import ProjectIdentities from '$lib/bits/sections/project-identities.svelte'
import type { ProjectIdentity } from '$lib/content/site'

let {
  locale,
  projects,
  theme,
}: {
  locale: string
  projects: ProjectIdentity[]
  theme: 'dark' | 'light'
} = $props()
</script>

<main
  class="grid mx-auto w-[calc(100%-clamp(2rem,7vw,6rem))] max-w-[1920px] place-items-center py-20 pt-6 max-[560px]:w-[min(100%-24px,720px)] max-[560px]:py-0"
>
  <ProjectIdentities {locale} {projects} {theme} />
</main>
