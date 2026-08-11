<script lang="ts">
import FaviconLinkIcon from '$lib/bits/components/favicon-link-icon.svelte'
import LinkIcon from '$lib/bits/components/link-icon.svelte'
import ProjectCarousel from '$lib/bits/patterns/project-carousel.svelte'
import type { ProjectIdentity, ProjectPreview } from '$lib/content/site'
import * as m from '../../../paraglide/messages.js'

let {
  locale,
  projects,
  theme,
}: {
  locale: string
  projects: ProjectIdentity[]
  theme: 'dark' | 'light'
} = $props()

function previewsForTheme(previews: ProjectPreview[]) {
  return previews.filter(preview => preview.colorScheme === theme)
}

function mobileProjectName(project: ProjectIdentity) {
  if (project.id !== 'saanseoi') return project.name()
  return locale === 'en' ? 'SaanSeoi' : '山水'
}
</script>

<section aria-label={m.project_identities_heading()} class="project-identities w-full">
  <div
    class="grid grid-cols-2 gap-[clamp(1.5rem,3vw,4rem)] max-[1024px]:grid-cols-1 max-[1024px]:gap-8"
  >
    {#each projects as project, index}
      <article class="min-w-0 px-[clamp(0rem,1.15vw,1.25rem)] [&>*]:min-w-0">
        <ProjectCarousel
          autoplayStartDelay={index % 2 === 1 ? 300 : 0}
          carouselId={`project-${project.id}-carousel-heading`}
          heading={m.project_carousel_label({ project: project.name(), heading: m.project_carousel_heading() })}
          nextLabel={m.project_carousel_next()}
          previousLabel={m.project_carousel_previous()}
          roleDescription={m.project_carousel_role_description()}
          slideLabel={({ current, total }) => m.project_carousel_slide({ current, total })}
          slideRoleDescription={m.project_carousel_slide_role_description()}
          slides={previewsForTheme(project.previews).map(({ copy, ...preview }) => ({
            ...preview,
            ...copy(),
          }))}
        />

        <div class="mt-6 flex items-center justify-between gap-3">
          <h3
            class="m-0 [font-family:var(--font-ui)] text-[clamp(1.25rem,1.7vw,1.65rem)] font-bold leading-[1.1] tracking-[-.035em]"
          >
            <a
              class="inline-flex items-center gap-2 text-project-copy no-underline hover:text-project-accent"
              href={project.href}
              rel="noopener"
              target="_blank"
            >
              <FaviconLinkIcon fallbackIcon="external" href={project.href} size={22} />
              <span class="max-[560px]:hidden">{project.name()}</span>
              <span class="hidden max-[560px]:inline"
                >{mobileProjectName(project)}</span
              >
            </a>
          </h3>
          <nav
            aria-label={m.project_links_label({ project: project.name() })}
            class="relative -top-px flex shrink-0 gap-1"
          >
            {#each project.links as link}
              <a
                class="grid size-8 place-items-center rounded-[.4rem] text-project-detail hover:bg-project-hover hover:text-project-accent"
                href={link.href}
                rel="noopener"
                target="_blank"
                title={link.label()}
              >
                <LinkIcon name={link.icon} size={18} />
                <span class="sr-only">{link.label()}</span>
              </a>
            {/each}
          </nav>
        </div>
        <p
          class="mt-[.7rem] max-w-full break-words [font-family:var(--font-ui)] text-[.9rem] leading-[1.55] tracking-[.005em] text-project-detail"
        >
          {project.description()}
        </p>

        <section
          aria-label={m.project_subprojects_label({ project: project.name() })}
          class="mt-[1.6rem]"
        >
          <h4
            class="mb-[.85rem] flex items-center gap-[.7rem] font-display text-[.72rem] font-semibold tracking-[.12em] text-project-detail uppercase before:h-px before:flex-1 before:bg-project-divider before:content-[''] after:h-px after:flex-1 after:bg-project-divider after:content-[''] max-[560px]:mb-4 max-[560px]:text-[.76rem]"
          >
            {m.project_subprojects_heading()}
          </h4>
          <ul class="grid list-none gap-5 p-0 max-[560px]:gap-6">
            {#each project.highlights as highlight}
              <li class="grid min-w-0 gap-[.35rem]">
                <div class="flex flex-wrap items-center gap-[.45rem]">
                  {#if highlight.href}
                    <a
                      class="inline-flex min-h-4 items-center gap-[.4rem] [font-family:var(--font-ui)] text-[.92rem] leading-none font-semibold text-project-copy no-underline hover:text-project-accent [&_svg]:block max-[560px]:text-[1rem]"
                      href={highlight.href}
                      rel="noopener"
                      target="_blank"
                    >
                      <LinkIcon name={highlight.icon ?? 'external'} size={16} />
                      <span>{highlight.name()}</span>
                    </a>
                  {:else}
                    <span
                      class="[font-family:var(--font-ui)] text-[.92rem] font-semibold text-project-copy max-[560px]:text-[1rem]"
                      >{highlight.name()}</span
                    >
                  {/if}
                  {#if highlight.comingSoon}
                    <span
                      class="inline-block rounded-[.2rem] border border-project-badge-border bg-project-badge-background px-[.28rem] py-[.06rem] [font-family:var(--font-ui)] text-[.62em] leading-[1.2] font-bold tracking-[.05em] text-project-badge-copy uppercase"
                      >{m.project_coming_soon()}</span
                    >
                  {/if}
                </div>
                <p
                  class="m-0 [font-family:var(--font-ui)] text-[.9rem] leading-[1.55] tracking-[.005em] text-project-detail [&_a]:text-project-accent [&_a:hover]:text-project-accent max-[560px]:text-[.94rem] max-[560px]:leading-[1.6]"
                >
                  {#each highlight.description() as part}
                    {#if part.type === 'link'}
                      <a href={part.href} rel="noopener" target="_blank"
                        >{part.value}</a
                      >
                    {:else}
                      {part.value}
                    {/if}
                  {/each}
                </p>
              </li>
            {/each}
          </ul>
        </section>
      </article>
    {/each}
  </div>
</section>

<style>
.project-identities {
  --font-ui:
    ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
</style>
