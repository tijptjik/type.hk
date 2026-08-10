<script lang="ts">
import { onMount } from 'svelte'
import HomePage from '$lib/bits/pages/home-page.svelte'
import MapsPage from '$lib/bits/pages/maps-page.svelte'
import ProjectsPage from '$lib/bits/pages/projects-page.svelte'
import RosePunkPage from '$lib/bits/pages/rose-punk-page.svelte'
import WritingPage from '$lib/bits/pages/writing-page.svelte'
import SiteFooter from '$lib/bits/patterns/site-footer.svelte'
import SiteHeader from '$lib/bits/patterns/site-header.svelte'
import { mapShowcases } from '$lib/content/maps'
import { rosePunkPalette, rosePunkResources } from '$lib/content/rose-punk'
import { contactLinks, projectIdentities, socialLinks } from '$lib/content/site'
import { writingEntries } from '$lib/content/writing'
import * as m from './paraglide/messages.js'
import { locales, setLocale, type Locale } from './paraglide/runtime.js'

type Page = 'home' | 'maps' | 'projects' | 'rose-punk' | 'writing'
type Theme = 'dark' | 'light'

const themeStorageKey = 'type-hk-theme'
const avatarUrl = 'https://media2.giphy.com/media/3oKIP6s42nSEsz3uNi/giphy.gif'
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh-Hant', label: '繁體中文' },
  { value: 'zh-Hans', label: '简体中文' },
]

let theme = $state<Theme>(
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
)
// Paraglide's locale is persisted in its configured cookie. Reading that
// cookie here keeps document metadata and locale-sensitive content in sync
// without relying on a generated runtime accessor during Vite HMR.
let locale = $state<Locale>(getSavedLocale())
let page = $state<Page>(getPage(window.location.pathname))

const navigationItems = $derived([
  { label: m.nav_projects(), href: '/projects', active: page === 'projects' },
  { label: m.nav_maps(), href: '/maps', active: page === 'maps' },
  { label: m.nav_writing(), href: '/writing', active: page === 'writing' },
  { label: m.nav_themes(), href: '/themes/rose-punk', active: page === 'rose-punk' },
])
const themeToggleLabel = $derived(
  m.theme_toggle_label({
    theme: theme === 'dark' ? m.theme_light() : m.theme_dark(),
  }),
)
const pageTitle = $derived.by(() => {
  if (page === 'maps') return m.maps_heading()
  if (page === 'projects') return m.project_identities_heading()
  if (page === 'writing') return m.writing_heading()
  if (page === 'rose-punk') return m.rose_punk_title()
  return m.profile_subtitle()
})

$effect(() => {
  document.documentElement.dataset.theme = theme
  document.documentElement.lang = locale
})

onMount(() => {
  const updatePage = () => {
    page = getPage(window.location.pathname)
  }

  window.addEventListener('popstate', updatePage)
  return () => window.removeEventListener('popstate', updatePage)
})

function getPage(pathname: string): Page {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/maps') return 'maps'
  if (path === '/projects') return 'projects'
  if (path === '/writing') return 'writing'
  if (path === '/themes/rose-punk') return 'rose-punk'
  return 'home'
}

function getSavedLocale(): Locale {
  const match = document.cookie.match(/(?:^|;\s*)PARAGLIDE_LOCALE=([^;]*)/)
  if (!match) return 'en'

  const savedLocale = decodeURIComponent(match[1] ?? '') as Locale
  return locales.includes(savedLocale) ? savedLocale : 'en'
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark'
  localStorage.setItem(themeStorageKey, theme)
}

function changeLocale(nextLocale: string) {
  if (!locales.includes(nextLocale as Locale)) return

  // Paraglide's default behavior reloads after persisting the selection. Its
  // `reload: false` mode intentionally does not update rendered messages.
  void setLocale(nextLocale as Locale)
}
</script>

<svelte:head>
  <title>{pageTitle} · {m.profile_title()}</title>
  <meta name="description" content={m.site_description()}>
</svelte:head>

<div
  class="site-shell grid min-h-screen grid-rows-[auto_1fr_auto] bg-background font-sans text-foreground transition-[background-color,color] duration-180 motion-reduce:transition-none"
  data-locale={locale}
  data-theme={theme}
>
  <SiteHeader
    {languageOptions}
    {locale}
    {navigationItems}
    {pageTitle}
    {theme}
    languageLabel={m.language_label()}
    menuToggleLabel={m.menu_toggle_label()}
    {themeToggleLabel}
    onLocaleChange={changeLocale}
    onThemeToggle={toggleTheme}
  />

  {#if page === 'maps'}
    <MapsPage heading={m.maps_heading()} showcases={mapShowcases} />
  {:else if page === 'projects'}
    <ProjectsPage projects={projectIdentities} {theme} />
  {:else if page === 'writing'}
    <WritingPage entries={writingEntries} heading={m.writing_heading()} {locale} />
  {:else if page === 'rose-punk'}
    <RosePunkPage
      palette={rosePunkPalette}
      resources={rosePunkResources}
      title={m.rose_punk_title()}
      tagline={m.rose_punk_tagline()}
      paletteHeading={m.rose_punk_palette_heading()}
      resourcesHeading={m.rose_punk_resources_heading()}
      unavailableLabel={m.rose_punk_unavailable()}
    />
  {:else}
    <HomePage
      {avatarUrl}
      {contactLinks}
      contactHeading={m.contact_heading()}
      name={m.profile_title()}
      {socialLinks}
      socialsHeading={m.socials_heading()}
      subtitle={m.profile_subtitle()}
    />
  {/if}

  <SiteFooter
    builtWith={m.footer_made_with()}
    copyright={m.footer_copyright({ year: new Date().getFullYear() })}
    hongKong={m.footer_hong_kong()}
    inHongKong={m.footer_in_hong_kong()}
    repositoryLabel={m.footer_repository_label()}
  />
</div>
