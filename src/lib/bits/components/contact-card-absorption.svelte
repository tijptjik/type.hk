<script lang="ts">
import ContactCardOrb from './contact-card-orb.svelte'
import ContactCardShards from './contact-card-shards.svelte'

type Origin = { x: number; y: number }

let {
  active,
  onAbsorb,
}: {
  active: boolean
  onAbsorb?: (origin: Origin) => void
} = $props()

let orb = $state<HTMLSpanElement>()
let absorbTimer = 0
let openingPulseFrame = 0
let absorptionStartedAt = 0
let hasAbsorbed = false

function getAbsorptionStartedAt() {
  return absorptionStartedAt
}

$effect(() => {
  if (!active || !orb) return

  absorptionStartedAt = 0
  hasAbsorbed = false
  clearAbsorbTimers()
  document.dispatchEvent(new Event('rolling-name-wind-start'))

  openingPulseFrame = requestAnimationFrame(() => {
    openingPulseFrame = 0
    if (!active || !orb) return

    const orbRect = orb.getBoundingClientRect()
    const nameBoard = document.getElementById('profile-name')
    const nameRect = nameBoard?.getBoundingClientRect()
    if (!nameRect) return

    document.dispatchEvent(
      new CustomEvent('absorption-pulse', {
        detail: {
          origin: {
            x: orbRect.left + orbRect.width / 2,
            y: orbRect.top + orbRect.height / 2,
          },
          target: {
            x: nameRect.left + nameRect.width / 2,
            y: nameRect.top + nameRect.height / 2,
          },
        },
      }),
    )
  })

  document.documentElement.classList.add('absorption-gathering')
  absorbTimer = window.setTimeout(() => {
    if (!active || !orb) return

    const { height, left, top, width } = orb.getBoundingClientRect()
    absorbTimer = 0
    beginAbsorption({ x: left + width / 2, y: top + height / 2 })
  }, 30_000)

  return () => {
    document.dispatchEvent(
      new CustomEvent('absorption-reset', {
        detail: { started: hasAbsorbed },
      }),
    )
    clearAbsorbTimers()
    absorptionStartedAt = 0
  }
})

function clearAbsorbTimers() {
  clearTimeout(absorbTimer)
  absorbTimer = 0
  if (openingPulseFrame) cancelAnimationFrame(openingPulseFrame)
  openingPulseFrame = 0
  document.documentElement.classList.remove('absorption-gathering')
}

function beginAbsorption(origin: Origin) {
  hasAbsorbed = true
  absorptionStartedAt = performance.now()
  onAbsorb?.(origin)
}
</script>

<ContactCardShards {active} {getAbsorptionStartedAt} />
<ContactCardOrb bind:orb />
