<script lang="ts">
import { onMount } from 'svelte'
import { fly } from 'svelte/transition'
import { Select, Tooltip } from 'bits-ui'
import LinkIcon from '$lib/bits/components/link-icon.svelte'
import ProIcon from '$lib/bits/components/pro-icon.svelte'

type Theme = 'dark' | 'light'
type LanguageOption = { value: string; label: string }
type NavigationItem = {
  active?: boolean
  external?: boolean
  href: string
  label: string
}

let {
  theme,
  locale,
  languageOptions,
  brand = 'TYPE',
  homeHref = '/',
  navigationItems,
  pageTitle,
  compactPageTitle = pageTitle,
  languageLabel,
  menuToggleLabel,
  themeToggleLabel,
  onThemeToggle,
  onNavigate,
  onLocaleChange,
}: {
  theme: Theme
  locale: string
  languageOptions: LanguageOption[]
  brand?: string
  homeHref?: string
  navigationItems: NavigationItem[]
  pageTitle: string
  compactPageTitle?: string
  languageLabel: string
  menuToggleLabel: string
  themeToggleLabel: string
  onThemeToggle: () => void
  onNavigate: (href: string) => void
  onLocaleChange: (locale: string) => void
} = $props()

let header = $state<HTMLElement>()
let navigationMeasure = $state<HTMLDivElement>()
let menuOpen = $state(false)
let isCompact = $state(false)
let isHidden = $state(false)

function handleNavigation(event: MouseEvent, item: NavigationItem) {
  if (
    item.external ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return
  }

  event.preventDefault()
  menuOpen = false
  onNavigate(item.href)
}

onMount(() => {
  let frame = 0
  let previousScrollY = window.scrollY

  const updateScrollState = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - previousScrollY

      // Keep the navigation visible at the top, and reveal it as soon as the
      // reader changes direction. Tiny scroll changes are ignored so touchpad
      // and mobile scroll jitter does not make the header flicker.
      if (currentScrollY <= 8) {
        isHidden = false
      } else if (Math.abs(scrollDelta) > 4) {
        isHidden = scrollDelta > 0 && !menuOpen
      }

      previousScrollY = currentScrollY
    })
  }

  const updateLayout = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      // The hidden copy preserves the full navigation's intrinsic width, so
      // this comparison never needs to open or close the visible menu.
      isCompact = (navigationMeasure?.offsetWidth ?? 0) > (header?.clientWidth ?? 0)

      if (!isCompact) menuOpen = false
    })
  }

  const observer = new ResizeObserver(() => void updateLayout())
  if (header) observer.observe(header)
  window.addEventListener('scroll', updateScrollState, { passive: true })
  void updateLayout()
  void document.fonts?.ready.then(updateLayout)

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    window.removeEventListener('scroll', updateScrollState)
  }
})
</script>

<div
  aria-hidden="true"
  bind:this={navigationMeasure}
  class="pointer-events-none fixed top-0 left-0 grid w-max grid-cols-[auto_auto_auto] gap-4 invisible"
>
  <span class="font-display text-[1.15rem] font-bold tracking-[.08em] text-foreground">{brand}</span>
  <ul
    class="flex min-w-max list-none items-center justify-center gap-[.9rem] overflow-visible p-0"
  >
    {#each navigationItems as item, index}
      <li class="flex items-center gap-[.9rem]">
        {#if index > 0}
          <span aria-hidden="true" class="text-muted">·</span>
        {/if}
        <span class="text-[.9rem] text-foreground whitespace-nowrap">{item.label}</span>
        {#if item.external}
          <LinkIcon name="external" size={14} />
        {/if}
      </li>
    {/each}
  </ul>
  <div class="flex items-center gap-[.45rem]">
    <span class="size-8"></span>
    <span class="size-8"></span>
  </div>
</div>

<header
  class={`sticky top-0 w-full bg-background transition-transform duration-180 motion-reduce:transition-none ${menuOpen ? 'z-[60]' : 'z-10'} ${isHidden ? '-translate-y-full' : ''}`}
>
  <div
    bind:this={header}
    class="relative mx-auto w-[min(100%-2rem,1920px)] py-2 max-[560px]:w-[min(100%-24px,1920px)]"
  >
    <nav
      aria-label="Primary navigation"
      class={`grid items-center gap-4 max-[560px]:gap-[.6rem] ${isCompact ? 'grid-cols-[1fr_auto]' : 'grid-cols-[auto_minmax(0,1fr)_auto]'}`}
    >
      <a
        class="font-display text-[1.15rem] font-bold tracking-[.08em] text-foreground no-underline hover:text-link"
        href={homeHref}
        onclick={(event) => handleNavigation(event, { href: homeHref, label: 'Home' })}
        >{brand}</a
      >

      {#if pageTitle}
        <span
          class={`absolute left-1/2 max-w-[calc(100%-7rem)] -translate-x-1/2 overflow-hidden font-display text-[.78rem] font-semibold tracking-[.06em] text-foreground text-ellipsis text-center uppercase whitespace-nowrap ${isCompact ? 'block' : 'hidden'}`}
          >{compactPageTitle}</span
        >
      {/if}

      <ul
        class={`min-w-0 list-none items-center justify-center gap-[.9rem] overflow-hidden p-0 ${isCompact ? 'hidden' : 'flex'}`}
      >
        {#each navigationItems as item, index}
          <li class="flex items-center gap-[.9rem]">
            {#if index > 0}
              <span aria-hidden="true" class="text-muted">·</span>
            {/if}
            <a
              aria-current={item.active ? 'page' : undefined}
              class={`inline-flex items-center gap-[.2rem] text-[.9rem] text-foreground no-underline whitespace-nowrap hover:text-link ${item.active ? 'text-link' : ''}`}
              href={item.href}
              onclick={(event) => handleNavigation(event, item)}
              rel={item.external ? 'noopener noreferrer' : undefined}
              target={item.external ? '_blank' : undefined}
            >
              {item.label}
              {#if item.external}
                <LinkIcon name="external" size={14} />
                <span class="sr-only">(opens in a new tab)</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>

      <div
        class={`justify-self-end items-center gap-[.45rem] ${isCompact ? 'hidden' : 'flex'}`}
      >
        <Tooltip.Provider delayDuration={250}>
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <button
                  {...props}
                  aria-label={themeToggleLabel}
                  class="inline-grid size-8 place-items-center rounded-[.45rem] text-foreground hover:bg-surface hover:text-link"
                  onclick={onThemeToggle}
                  type="button"
                >
                  <ProIcon name={theme === 'dark' ? 'moon' : 'lightbulb'} size={20} />
                </button>
              {/snippet}
            </Tooltip.Trigger>

            <Tooltip.Portal>
              <Tooltip.Content
                class="z-10 rounded-[.45rem] border border-border bg-surface px-[.6rem] py-[.45rem] text-[.75rem] text-foreground shadow-[0_.5rem_1.5rem_rgb(0_0_0_/_0.2)]"
                side="bottom"
                sideOffset={8}
              >
                {themeToggleLabel}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Select.Root
          items={languageOptions}
          name="language"
          onValueChange={onLocaleChange}
          type="single"
          value={locale}
        >
          <Select.Trigger
            aria-label={languageLabel}
            class="inline-grid size-8 place-items-center rounded-[.45rem] p-0 text-[.83rem] text-muted hover:bg-surface hover:text-link"
          >
            <ProIcon name="globe" size={20} />
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              class="z-10 min-w-36 rounded-[.45rem] border border-border bg-surface p-[.3rem] text-foreground shadow-[0_.5rem_1.5rem_rgb(0_0_0_/_0.2)]"
              side="bottom"
              sideOffset={8}
            >
              <Select.Viewport>
                {#each languageOptions as option}
                  <Select.Item
                    class="block cursor-pointer rounded-[.25rem] px-[.65rem] py-2 text-[.85rem] outline-none data-[highlighted]:bg-neutral-500/16"
                    label={option.label}
                    value={option.value}
                  >
                    {#snippet children()}
                      <span>{option.label}</span>
                    {/snippet}
                  </Select.Item>
                {/each}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <button
        aria-controls="mobile-navigation"
        aria-expanded={menuOpen}
        aria-label={menuToggleLabel}
        class={`size-8 place-items-center rounded-[.45rem] text-foreground hover:bg-surface ${isCompact ? 'inline-grid' : 'hidden'}`}
        onclick={() => (menuOpen = !menuOpen)}
        type="button"
      >
        <ProIcon name="hamburger" size={22} />
      </button>
    </nav>

    {#if isCompact && menuOpen}
      <div
        class="absolute top-full right-0 left-0 z-5 grid gap-4 mt-[-1.2px] rounded-[.65rem] border border-border bg-surface p-[.8rem] shadow-[0_.5rem_1.5rem_rgb(0_0_0_/_0.16)]"
        id="mobile-navigation"
        transition:fly={{ y: -8, duration: 160 }}
      >
        <ul class="grid list-none gap-[.15rem] p-0">
          {#each navigationItems as item}
            <li>
              <a
                aria-current={item.active ? 'page' : undefined}
                class={`flex min-h-10 w-full items-center gap-2 rounded-[.4rem] px-[.55rem] py-[.45rem] text-left text-[.9rem] text-foreground no-underline hover:bg-background hover:text-link ${item.active ? 'text-link' : ''}`}
                href={item.href}
                onclick={(event) => handleNavigation(event, item)}
                rel={item.external ? 'noopener noreferrer' : undefined}
                target={item.external ? '_blank' : undefined}
              >
                {item.label}
                {#if item.external}
                  <LinkIcon name="external" size={14} />
                  <span class="sr-only">(opens in a new tab)</span>
                {/if}
              </a>
            </li>
          {/each}
        </ul>

        <div class="flex items-center justify-between border-t border-border pt-[.65rem]">
          <button
            class="flex min-h-10 items-center gap-2 rounded-[.4rem] px-[.55rem] py-[.45rem] text-left text-[.9rem] text-foreground hover:bg-background hover:text-link"
            onclick={onThemeToggle}
            type="button"
          >
            <ProIcon name={theme === 'dark' ? 'moon' : 'lightbulb'} size={20} />
            <span>{themeToggleLabel}</span>
          </button>

          <Select.Root
            items={languageOptions}
            name="language"
            onValueChange={onLocaleChange}
            type="single"
            value={locale}
          >
            <Select.Trigger
              aria-label={languageLabel}
              class="flex min-h-10 items-center gap-2 rounded-[.4rem] px-[.55rem] py-[.45rem] text-left text-[.9rem] text-foreground hover:bg-background hover:text-link"
            >
              <ProIcon name="globe" size={20} />
              <span>{languageLabel}</span>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content
                class="z-10 min-w-36 rounded-[.45rem] border border-border bg-surface p-[.3rem] text-foreground shadow-[0_.5rem_1.5rem_rgb(0_0_0_/_0.2)]"
                side="bottom"
                sideOffset={8}
              >
                <Select.Viewport>
                  {#each languageOptions as option}
                    <Select.Item
                      class="block cursor-pointer rounded-[.25rem] px-[.65rem] py-2 text-[.85rem] outline-none data-[highlighted]:bg-neutral-500/16"
                      label={option.label}
                      value={option.value}
                    >
                      {#snippet children()}
                        <span>{option.label}</span>
                      {/snippet}
                    </Select.Item>
                  {/each}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>
    {/if}
  </div>
</header>
