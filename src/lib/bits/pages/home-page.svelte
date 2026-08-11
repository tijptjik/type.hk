<script lang="ts">
import Profile from '$lib/bits/patterns/profile.svelte'
import type { ContactLink, Link } from '$lib/content/site'

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
  socialsHeading,
  subtitle,
  socialLinks = [],
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
  socialsHeading?: string
  subtitle: string
  socialLinks?: Link[]
} = $props()
</script>

<main
  class="grid mx-auto min-h-[31rem] w-[min(100%-2rem,720px)] place-items-center content-center gap-16 py-16 max-[560px]:min-h-0 max-[560px]:w-[min(100%-24px,720px)] max-[560px]:items-stretch max-[560px]:gap-0 max-[560px]:py-[clamp(.75rem,2svh,1.5rem)]"
>
  <Profile
    {avatarUrl}
    {contactCardQrData}
    {contactCardUrl}
    {contactHeading}
    {contactLinks}
    {alias}
    {name}
    {onAbsorb}
    {qrDark}
    {qrLight}
    {socialLinks}
    {socialsHeading}
    {subtitle}
  />
</main>
