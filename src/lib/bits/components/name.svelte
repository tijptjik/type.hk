<script lang="ts">
import { onMount } from 'svelte'

let { alias = 'tijptjik', name }: { alias?: string; name: string } = $props()

let activeTextIndex = $state(0)
let isRolling = $state(false)
let isShowingResult = $state(false)
let lockedSlots = $state<number[]>([])

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

  function scheduleRoll() {
    if (reducedMotion.matches) return

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

  return () => {
    clearTimeout(rollTimer)
    clearTimeout(settleTimer)
    lockTimers.forEach(timer => {
      clearTimeout(timer)
    })
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<h1
  class="flex justify-center font-display text-[var(--profile-name-size)] font-[650] leading-none tracking-[-.035em]"
  id="profile-name"
  style={`--rolling-slot-count: ${slotCount}`}
>
  <span class="sr-only">{announcedText}</span>
  <span
    aria-hidden="true"
    class="inline-flex max-w-full py-[.14em] max-[40rem]:text-[.9em]"
  >
    {#each reels as reel, index}
      <span
        class="relative block h-[1em] w-[calc(.64em+6px)] shrink-0 overflow-hidden px-[3px] [contain:paint] after:pointer-events-none after:absolute after:top-0 after:right-0 after:z-2 after:h-full after:w-px after:bg-[color-mix(in_srgb,var(--border)_52%,transparent)] after:content-[''] last:after:hidden"
      >
        <span
          class:rolling={isRolling}
          class:result={isShowingResult}
          class:locked={isRolling && lockedSlots.includes(index)}
          class="rolling-board__reel block w-full transition-transform [transition-duration:var(--roll-duration)] [transition-timing-function:steps(var(--steps),end)] motion-reduce:transition-none"
          style={`--steps: ${reel.length - 1}; --roll-duration: ${reelDurations[index]}ms`}
        >
          {#each reel as character, characterIndex}
            <span
              class="rolling-board__face grid h-[1em] place-items-center leading-none tracking-normal text-foreground"
              style={`--rolling-color: ${rollingColors[(index + characterIndex) % rollingColors.length]}`}
              >{character}</span
            >
          {/each}
        </span>
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
</style>
