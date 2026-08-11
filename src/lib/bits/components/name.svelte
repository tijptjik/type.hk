<script lang="ts">
import { onMount } from 'svelte'

let { alias = 'tijptjik', name }: { alias?: string; name: string } = $props()

let activeTextIndex = $state(0)
let isRolling = $state(false)
let isShowingResult = $state(false)
let lockedSlots = $state<number[]>([])
let frozenTransforms = $state<string[]>([])
let isFrozen = $state(false)
let isWindAffected = $state(false)
let isBreaking = $state(false)
let reelElements: HTMLSpanElement[] = []

const slotCount = $derived(
  Math.max(Array.from(name).length, Array.from(alias).length) + 1,
)
const currentText = $derived(activeTextIndex === 0 ? name : alias)
const nextText = $derived(activeTextIndex === 0 ? alias : name)
const announcedText = $derived(isShowingResult ? nextText : currentText)
const currentCharacters = $derived(toCharacters(currentText, slotCount))
const nextCharacters = $derived(toCharacters(nextText, slotCount))
const reels = $derived(
  currentCharacters.map((character, index) =>
    toReel(character, nextCharacters[index] ?? '\u00a0'),
  ),
)
const reelDurations = $derived(reels.map(reel => getRollDuration(reel.length - 1)))
const settleDuration = $derived(Math.max(...reelDurations) + 50)
const rollingColors = [
  '#eb6f92',
  '#f6c177',
  '#f4b7b5',
  '#31748f',
  '#9ccfd8',
  '#7188ff',
  '#ff53a6',
]

function toCharacters(text: string, length: number) {
  const characters = Array.from(text)
  const start = Math.floor((length - characters.length) / 2)

  return Array.from({ length }, (_, index) => characters[index - start] ?? '\u00a0')
}

function toReel(current: string, next: string) {
  const characters = [
    '\u00a0',
    ...'0123456789',
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  ]
  const currentIndex = Math.max(0, characters.indexOf(current))
  const nextIndex = Math.max(0, characters.indexOf(next))
  if (currentIndex === nextIndex) {
    return [characters[currentIndex], characters[currentIndex]]
  }

  const steps = (nextIndex - currentIndex + characters.length) % characters.length

  return Array.from(
    { length: steps + 1 },
    (_, index) => characters[(currentIndex + index) % characters.length],
  )
}

function getRollDuration(steps: number) {
  return Math.max(280, steps * 58)
}

onMount(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let rollTimer = 0
  let settleTimer = 0
  let lockTimers: number[] = []
  let animationFrame = 0
  let breakTimer = 0

  function clearRollTimers() {
    clearTimeout(rollTimer)
    clearTimeout(settleTimer)
    lockTimers.forEach(timer => clearTimeout(timer))
    cancelAnimationFrame(animationFrame)
    clearTimeout(breakTimer)
    rollTimer = 0
    settleTimer = 0
    lockTimers = []
    animationFrame = 0
  }

  function freezeRollingBoard() {
    if (isFrozen) return

    isWindAffected = false
    frozenTransforms = reelElements.map(reel => window.getComputedStyle(reel).transform)
    isFrozen = true
    isBreaking = true
    clearRollTimers()
    isRolling = false
    breakTimer = window.setTimeout(() => {
      isBreaking = false
      breakTimer = 0
    }, 460)
  }

  function resumeRollingBoard() {
    isWindAffected = false
    if (!isFrozen) return

    isFrozen = false
    frozenTransforms = []
    scheduleRoll()
  }

  function scheduleRoll() {
    if (reducedMotion.matches || isFrozen) return

    rollTimer = window.setTimeout(
      () => {
        if (isShowingResult) {
          activeTextIndex = activeTextIndex === 0 ? 1 : 0
        }

        lockedSlots = []
        isShowingResult = false

        animationFrame = requestAnimationFrame(() => {
          isRolling = true
          lockTimers = reelDurations.map((duration, index) =>
            window.setTimeout(() => {
              lockedSlots = [...lockedSlots, index]
            }, duration),
          )

          settleTimer = window.setTimeout(() => {
            isRolling = false
            isShowingResult = true
            scheduleRoll()
          }, settleDuration)
        })
      },
      2200 + Math.random() * 3800,
    )
  }

  scheduleRoll()
  const startWind = () => {
    isWindAffected = true
  }
  document.addEventListener('rolling-name-freeze', freezeRollingBoard)
  document.addEventListener('rolling-name-resume', resumeRollingBoard)
  document.addEventListener('rolling-name-wind-start', startWind)

  return () => {
    clearRollTimers()
    document.removeEventListener('rolling-name-freeze', freezeRollingBoard)
    document.removeEventListener('rolling-name-resume', resumeRollingBoard)
    document.removeEventListener('rolling-name-wind-start', startWind)
  }
})
</script>

<h1
  class:breaking={isBreaking}
  class:windAffected={isWindAffected}
  class="flex justify-center font-display font-[650] leading-none tracking-[-.035em]"
  id="profile-name"
  style={`--rolling-slot-count: ${slotCount}; font-size: var(--profile-name-size)`}
>
  <span class="sr-only">{announcedText}</span>
  <span
    aria-hidden="true"
    class="inline-flex max-w-full py-[.14em] max-[40rem]:text-[.9em] max-[360px]:text-[.8em]"
  >
    {#each reels as reel, index}
      <span
        data-rolling-slot
        class="relative block h-[1em] w-[calc(.64em+6px)] shrink-0 overflow-hidden px-[3px] [contain:paint]"
      >
        <span
          bind:this={reelElements[index]}
          class:rolling={isRolling}
          class:result={isShowingResult}
          class:locked={isRolling && lockedSlots.includes(index)}
          class="rolling-board__reel block w-full transition-transform [transition-duration:var(--roll-duration)] [transition-timing-function:steps(var(--steps),end)] motion-reduce:transition-none"
          style={`--steps: ${reel.length - 1}; --roll-duration: ${reelDurations[index]}ms;${isFrozen ? `transform: ${frozenTransforms[index] ?? 'none'}; transition-duration: 0ms` : ''}`}
        >
          {#each reel as character, characterIndex}
            <span
              data-rolling-face
              class="rolling-board__face grid h-[1em] place-items-center leading-none tracking-normal text-foreground"
              style={`--rolling-color: ${rollingColors[(index + characterIndex) % rollingColors.length]}`}
              >{character}</span
            >
          {/each}
        </span>
        {#if index < reels.length - 1}
          <span
            aria-hidden="true"
            data-rolling-guide
            class="pointer-events-none absolute top-0 right-0 z-2 h-full w-px bg-[color-mix(in_srgb,var(--border)_52%,transparent)]"
          ></span>
        {/if}
      </span>
    {/each}
  </span>
</h1>

<style>
.rolling-board__reel:not(.rolling, .result) {
  transform: translateY(0);
  transition-duration: 0ms;
}

.rolling-board__reel.rolling,
.rolling-board__reel.result {
  transform: translateY(calc(var(--steps) * -1em));
}

.rolling-board__reel.result {
  transition-duration: 0ms;
}

.rolling-board__reel.rolling:not(.locked) .rolling-board__face {
  color: var(--rolling-color);
}

.windAffected {
  animation: name-wind 10s linear forwards;
  will-change: filter;
}

.breaking .rolling-board__face,
.breaking [data-rolling-guide] {
  animation: rolling-board-fritz 460ms steps(5, end) both;
}

@keyframes rolling-board-fritz {
  0%,
  100% {
    opacity: 1;
    filter: none;
  }

  18% {
    opacity: 0.45;
    filter: brightness(1.8) hue-rotate(24deg);
  }

  42% {
    opacity: 1;
    filter: brightness(0.65) hue-rotate(-18deg);
  }

  68% {
    opacity: 0.7;
    filter: brightness(1.5) hue-rotate(38deg);
  }
}

@keyframes name-wind {
  0%,
  10%,
  100% {
    filter: none;
  }

  28% {
    filter: brightness(1.04);
  }

  48% {
    filter: brightness(0.97);
  }

  68% {
    filter: brightness(1.06);
  }

  86% {
    filter: brightness(0.98);
  }
}
</style>
