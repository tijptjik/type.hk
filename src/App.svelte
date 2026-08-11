<script lang="ts">
import { onMount } from 'svelte'
import HomePage from '$lib/bits/pages/home-page.svelte'
import MapsPage from '$lib/bits/pages/maps-page.svelte'
import ProjectsPage from '$lib/bits/pages/projects-page.svelte'
import RosePunkPage from '$lib/bits/pages/rose-punk-page.svelte'
import WritingPage from '$lib/bits/pages/writing-page.svelte'
import AbsorptionPortal from '$lib/bits/effects/absorption-portal.svelte'
import SiteFooter from '$lib/bits/layout/site-footer.svelte'
import SiteHeader from '$lib/bits/layout/site-header.svelte'
import { mapShowcases } from '$lib/content/maps'
import { rosePunkPalette, rosePunkResources } from '$lib/content/rose-punk'
import { contactCardQrData } from '$lib/content/contact-card'
import {
  needsMoreRobotsContactCardQrData,
  needsMoreRobotsContactLinks,
} from '$lib/content/needs-more-robots'
import { contactLinks, projectIdentities, socialLinks } from '$lib/content/site'
import type { ContactLink, Link } from '$lib/content/site'
import { writingEntries } from '$lib/content/writing'
import { site_description } from './paraglide/messages.js'
import * as m from './paraglide/messages.js'
import { locales, type Locale } from './paraglide/runtime.js'

type Page = 'home' | 'maps' | 'projects' | 'rose-punk' | 'writing'
type ProfileId = 'type' | 'needsmorerobots'
type Theme = 'dark' | 'light'

type ProfileFooter =
  | {
      type: 'site'
      builtWith: string
      copyright: string
      hongKong: string
      inHongKong: string
      repositoryLabel: string
    }
  | {
      type: 'custom'
      copyright: string
      inLocation: string
      location: string
      madeWith: string
      loveLabel: string
    }

type Profile = {
  id: ProfileId
  header: {
    brand: string
    homeHref: string
    showNavigation: boolean
  }
  home: {
    alias?: string
    avatarUrl: string
    contactCardQrData: string
    contactCardUrl: string
    contactHeading: string
    contactLinks: ContactLink[]
    name: string
    qrDark?: string
    qrLight?: string
    socialLinks?: Link[]
    socialsHeading?: string
    subtitle: string
  }
  meta: {
    description: string
    homeTitle: string
  }
  footer: ProfileFooter
}

const themeStorageKey = 'type-hk-theme'
const avatarUrl = 'https://media2.giphy.com/media/3oKIP6s42nSEsz3uNi/giphy.gif'
const currentYear = new Date().getFullYear()
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh-Hant', label: '繁體中文' },
  { value: 'zh-Hans', label: '简体中文' },
]

const TYPE: Profile = {
  id: 'type',
  header: {
    brand: 'TYPE',
    homeHref: '/',
    showNavigation: true,
  },
  home: {
    avatarUrl,
    contactCardQrData,
    contactCardUrl: 'https://type.hk/contact.vcf',
    contactHeading: m.contact_heading(),
    contactLinks,
    name: m.profile_title(),
    socialLinks,
    socialsHeading: m.socials_heading(),
    subtitle: m.profile_subtitle(),
  },
  meta: {
    description: site_description(),
    homeTitle: `${m.profile_subtitle()} · ${m.profile_title()}`,
  },
  footer: {
    type: 'site',
    builtWith: m.footer_made_with(),
    copyright: m.footer_copyright({ year: currentYear }),
    hongKong: m.footer_hong_kong(),
    inHongKong: m.footer_in_hong_kong(),
    repositoryLabel: m.footer_repository_label(),
  },
}

const NEEDSMOREROBOTS: Profile = {
  id: 'needsmorerobots',
  header: {
    brand: 'NEEDSMOREROBOTS',
    homeHref: '/ben',
    showNavigation: false,
  },
  home: {
    alias: 'needsmorerobots',
    avatarUrl,
    contactCardQrData: needsMoreRobotsContactCardQrData,
    contactCardUrl: '/ben/contact.vcf',
    contactHeading: 'Contact',
    contactLinks: needsMoreRobotsContactLinks,
    name: 'Benjamin Hall',
    qrDark: '#403345',
    qrLight: '#fffbf6',
    subtitle: 'Writer & Game Designer',
  },
  meta: {
    description: 'Benjamin Hall — Writer & Game Designer',
    homeTitle: 'Benjamin Hall — NeedsMoreRobots',
  },
  footer: {
    type: 'custom',
    copyright: '© 2026 Benjamin Hall',
    inLocation: 'in',
    location: 'OXFORD',
    madeWith: 'Made with',
    loveLabel: 'love',
  },
}

const profiles: Record<ProfileId, Profile> = {
  type: TYPE,
  needsmorerobots: NEEDSMOREROBOTS,
}

const profileRoutes: Record<string, ProfileId> = {
  '/ben': 'needsmorerobots',
}

let theme = $state<Theme>(
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
)
// Paraglide's locale is persisted in its configured cookie. Reading that
// cookie here keeps document metadata and locale-sensitive content in sync
// without relying on a generated runtime accessor during Vite HMR.
let locale = $state<Locale>(getSavedLocale())
let page = $state<Page>(getPage(window.location.pathname))
let profileId = $state<ProfileId>(getProfileId(window.location.pathname))
let absorptionOrigin = $state<{ x: number; y: number }>()

const profile = $derived(profiles[profileId])
const navigationItems = $derived([
  { label: m.nav_projects(), href: '/projects', active: page === 'projects' },
  { label: m.nav_maps(), href: '/maps', active: page === 'maps' },
  { label: m.nav_writing(), href: '/writing', active: page === 'writing' },
  { label: m.nav_themes(), href: '/themes/rose-punk', active: page === 'rose-punk' },
])
const activeNavigationItems = $derived(
  profile.header.showNavigation ? navigationItems : [],
)
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
  return profile.home.subtitle
})
const compactPageTitle = $derived(
  page === 'maps'
    ? m.maps_compact_heading()
    : page === 'writing'
      ? m.writing_compact_heading()
      : pageTitle,
)

$effect(() => {
  document.documentElement.dataset.theme = theme
  document.documentElement.lang = locale
})

onMount(() => {
  const updatePage = () => {
    page = getPage(window.location.pathname)
    profileId = getProfileId(window.location.pathname)
  }

  window.addEventListener('popstate', updatePage)
  return () => window.removeEventListener('popstate', updatePage)
})

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

function getPage(pathname: string): Page {
  const path = normalizePath(pathname)
  if (path === '/maps') return 'maps'
  if (path === '/projects') return 'projects'
  if (path === '/writing') return 'writing'
  if (path === '/themes/rose-punk') return 'rose-punk'
  return 'home'
}

function getProfileId(pathname: string): ProfileId {
  return profileRoutes[normalizePath(pathname)] ?? 'type'
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

function navigate(href: string) {
  const nextUrl = new URL(href, window.location.href)

  if (nextUrl.origin !== window.location.origin) {
    window.location.assign(nextUrl)
    return
  }

  const nextLocation = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
  const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (nextLocation === currentLocation) return

  window.history.pushState({}, '', nextLocation)
  page = getPage(nextUrl.pathname)
  profileId = getProfileId(nextUrl.pathname)
  window.scrollTo({ top: 0, behavior: 'auto' })
}

function changeLocale(nextLocale: string) {
  if (!locales.includes(nextLocale as Locale)) return

  // The project resolves its locale from this cookie. Persisting it directly
  // avoids coupling application startup to Paraglide's generated runtime while
  // it is being replaced during Vite HMR.
  document.cookie = `PARAGLIDE_LOCALE=${encodeURIComponent(nextLocale)}; Path=/; Max-Age=34560000; SameSite=Lax`
  window.location.reload()
}
</script>

<svelte:head>
  <title>
    {page === 'home' ? profile.meta.homeTitle : `${pageTitle} · ${profile.home.name}`}
  </title>
  <meta name="description" content={profile.meta.description}>
</svelte:head>

<div
  class="site-shell grid min-h-dvh grid-rows-[auto_1fr_auto] bg-background font-sans text-foreground transition-[background-color,color] duration-180 motion-reduce:transition-none"
  data-locale={locale}
  data-profile={profile.id}
  data-theme={theme}
>
  <SiteHeader
    brand={profile.header.brand}
    homeHref={profile.header.homeHref}
    {languageOptions}
    {locale}
    navigationItems={activeNavigationItems}
    pageTitle={page === 'home' ? '' : pageTitle}
    compactPageTitle={page === 'home' ? '' : compactPageTitle}
    {theme}
    languageLabel={m.language_label()}
    menuToggleLabel={m.menu_toggle_label()}
    {themeToggleLabel}
    onNavigate={navigate}
    onLocaleChange={changeLocale}
    onThemeToggle={toggleTheme}
  />

  {#if page === 'maps'}
    <MapsPage heading={m.maps_heading()} showcases={mapShowcases} />
  {:else if page === 'projects'}
    <ProjectsPage {locale} projects={projectIdentities} {theme} />
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
    />
  {:else}
    <HomePage
      avatarUrl={profile.home.avatarUrl}
      contactCardQrData={profile.home.contactCardQrData}
      contactCardUrl={profile.home.contactCardUrl}
      contactHeading={profile.home.contactHeading}
      contactLinks={profile.home.contactLinks}
      alias={profile.home.alias}
      name={profile.home.name}
      qrDark={profile.home.qrDark}
      qrLight={profile.home.qrLight}
      socialLinks={profile.home.socialLinks}
      socialsHeading={profile.home.socialsHeading}
      subtitle={profile.home.subtitle}
      onAbsorb={origin => (absorptionOrigin = origin)}
    />
  {/if}

  {#if profile.footer.type === 'custom'}
    <footer
      class="mx-auto flex w-[min(100%-2rem,720px)] justify-between gap-4 py-5 text-[.75rem] text-muted max-[560px]:w-[min(100%-24px,720px)] max-[560px]:flex-col max-[560px]:items-center max-[560px]:gap-[.35rem] max-[560px]:py-[clamp(.75rem,1.5svh,1rem)] max-[560px]:text-center"
    >
      <span>{profile.footer.copyright}</span>
      <span
        class="inline-flex w-max shrink-0 items-center gap-[.3rem] whitespace-nowrap max-[560px]:w-full max-[560px]:justify-center"
      >
        <span>{profile.footer.madeWith}</span>
        <span role="img" aria-label={profile.footer.loveLabel} class="text-link"
          >♥</span
        >
        <span>{profile.footer.inLocation}</span>
        <span>{profile.footer.location}</span>
      </span>
    </footer>
  {:else}
    <SiteFooter
      builtWith={profile.footer.builtWith}
      copyright={profile.footer.copyright}
      hongKong={profile.footer.hongKong}
      inHongKong={profile.footer.inHongKong}
      repositoryLabel={profile.footer.repositoryLabel}
    />
  {/if}
  <AbsorptionPortal origin={absorptionOrigin} />
</div>
