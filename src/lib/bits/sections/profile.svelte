<script lang="ts">
import { onMount } from 'svelte'
import ContactCard from '$lib/bits/components/contact-card.svelte'
import Name from '$lib/bits/components/name.svelte'
import LinkIcon from '$lib/bits/components/link-icon.svelte'
import type { ContactLink, Link } from '$lib/content/site'

let emailLinksReady = $state(false)

let {
  avatarUrl,
  contactCardQrData,
  contactCardUrl,
  contactHeading,
  contactLinks,
  alias,
  name,
  onAbsorb,
  qrDark,
  qrLight,
  subtitle,
  socialLinks = [],
  socialsHeading,
}: {
  avatarUrl: string
  contactCardQrData: string
  contactCardUrl: string
  contactHeading: string
  contactLinks: ContactLink[]
  alias?: string
  name: string
  onAbsorb?: (origin: { x: number; y: number }) => void
  qrDark?: string
  qrLight?: string
  subtitle: string
  socialLinks?: Link[]
  socialsHeading?: string
} = $props()

const rollingSlotCount = $derived(
  Math.max(Array.from(name).length, Array.from(alias ?? '').length) + 1,
)

function isEmailLink(
  contact: ContactLink,
): contact is Extract<ContactLink, { email: unknown }> {
  return 'email' in contact
}

function getContactHref(contact: ContactLink) {
  if (!isEmailLink(contact)) return contact.href
  if (!emailLinksReady) return undefined

  const [localPart, domain] = contact.email.map(value => atob(value))
  return `mailto:${localPart}@${domain}`
}

function isExternalLink(contact: ContactLink) {
  return 'href' in contact && /^https?:\/\//.test(contact.href)
}

onMount(() => {
  emailLinksReady = true
})
</script>

<section
  aria-labelledby="profile-name"
  class="flex w-full max-w-3xl flex-col items-center text-center max-[560px]:h-full"
  style={`--rolling-slot-count: ${rollingSlotCount}; --profile-name-size: clamp(1rem, 7.5vw, 3rem)`}
>
  <div class="mb-6 max-[560px]:mb-[clamp(1rem,2svh,1.5rem)]">
    <ContactCard
      {avatarUrl}
      {contactCardQrData}
      {contactCardUrl}
      {name}
      {onAbsorb}
      {qrDark}
      {qrLight}
    />
  </div>
  <Name {alias} {name} />
  <p
    class="mt-[.6rem] mb-12 text-[calc(var(--profile-name-size)*.55)] text-muted max-[560px]:mt-[clamp(.25rem,.8svh,.5rem)] max-[560px]:mb-[clamp(1.5rem,4svh,2.25rem)]"
  >
    {subtitle}
  </p>

  <div
    class="flex w-full flex-wrap items-start justify-center gap-x-16 gap-y-4 max-[560px]:my-auto max-[560px]:flex-col max-[560px]:flex-nowrap max-[560px]:items-center max-[560px]:gap-x-6 max-[560px]:gap-y-3"
  >
    {#if socialLinks.length && socialsHeading}
      <section
      class="grid w-max justify-items-center gap-[.4rem] max-[560px]:gap-1"
      aria-labelledby="contact-links-heading"
    >
      <h2
        class="m-0 font-display text-[.72rem] font-semibold tracking-[.12em] text-muted uppercase max-[560px]:text-[.68rem]"
        id="contact-links-heading"
      >
        {contactHeading}
      </h2>
      <nav
        aria-label={contactHeading}
        class="flex flex-wrap justify-center gap-[.35rem] max-[560px]:-mt-[4px]"
      >
        {#each contactLinks as contact}
          <a
            aria-disabled={isEmailLink(contact) && !emailLinksReady}
            class="grid size-[2.7rem] place-items-center rounded-full text-foreground hover:bg-surface hover:text-link max-[560px]:size-[clamp(2.2rem,5.5svh,2.7rem)]"
            href={getContactHref(contact)}
            rel={isExternalLink(contact) ? 'noopener' : undefined}
            target={isExternalLink(contact) ? '_blank' : undefined}
            title={contact.label}
          >
            <LinkIcon name={contact.icon} />
            <span class="sr-only">{contact.label}</span>
          </a>
        {/each}
      </nav>
      </section>
    {/if}

    <section
      class="grid w-max justify-items-center gap-[.4rem] max-[560px]:gap-1"
      aria-labelledby="social-links-heading"
    >
      <h2
        class="m-0 font-display text-[.72rem] font-semibold tracking-[.12em] text-muted uppercase max-[560px]:text-[.68rem]"
        id="social-links-heading"
      >
        {socialsHeading}
      </h2>
      <nav
        aria-label={socialsHeading}
        class="flex flex-wrap justify-center gap-[.35rem] max-[560px]:-mt-[4px]"
      >
        {#each socialLinks as social}
          <a
            class="grid size-[2.7rem] place-items-center rounded-full text-foreground hover:bg-surface hover:text-link max-[560px]:size-[clamp(2.2rem,5.5svh,2.7rem)]"
            href={social.href}
            rel="me noopener"
            target="_blank"
            title={social.label}
          >
            <LinkIcon name={social.icon} />
            <span class="sr-only">{social.label}</span>
          </a>
        {/each}
      </nav>
    </section>
  </div>
</section>

<style>
</style>
