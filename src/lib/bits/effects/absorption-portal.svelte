<script lang="ts">
import { onMount } from 'svelte'

type Origin = { x: number; y: number }
type PulseDetail = { origin: Origin; target: Origin }
type PulseTarget = {
  distance: number
  element: HTMLElement
  hit: boolean
}
type Motion = {
  depth: number
  pitch: number
  rotation: number
  skew: number
  x: number
  y: number
  yaw: number
}
type AbsorptionParticle = {
  delay: number
  duration: number
  element: HTMLElement
  jitterRate: number
  jitterSeed: number
  startX: number
  startY: number
  source: HTMLElement
  turns: number
}

let { origin }: { origin?: Origin } = $props()

const gatheringDuration = 30_000
const releaseWindow = 7_000
const vortexDuration = 3_000
const pulseDelay = 9_300
const pulseDuration = 5_100
const pulseDamping = 1.8
const containedPulseWaves = [
  { delay: 0, duration: 5_500, offset: 20, peakOpacity: 0.22, contract: false },
  { delay: 2_600, duration: 4_800, offset: 34, peakOpacity: 0.3, contract: false },
  { delay: 5_000, duration: 4_000, offset: 48, peakOpacity: 0.42, contract: false },
  { delay: 6_500, duration: 3_600, offset: 64, peakOpacity: 0.52, contract: true },
  { delay: 7_700, duration: 3_200, offset: 78, peakOpacity: 0.62, contract: false },
]

let absorptionLayer: HTMLDivElement
let animationFrame = 0
let gatheringStartedAt = 0
let isAbsorbing = false
let isGathering = false
let hasPreparedParticles = false
let particles: AbsorptionParticle[] = []
let pulseFrame = 0
let pulseGeneration = 0
let pulseHitTimers: number[] = []
let breakElapsed = Number.POSITIVE_INFINITY
let gatheringSources: HTMLElement[] = []
let vortexOrigin: Origin | null = null
const sourceImpactElapsed = new Map<HTMLElement, number>()
const originalColors = new Map<HTMLElement, string>()
const originalGuideOpacities = new Map<HTMLElement, string>()

$effect(() => {
  if (origin) absorbPage(origin)
})

onMount(() => {
  const observer = new MutationObserver(() => {
    if (document.documentElement.classList.contains('absorption-gathering')) {
      startGathering()
    } else if (!isAbsorbing) {
      stopGathering()
    }
  })

  observer.observe(document.documentElement, {
    attributeFilter: ['class'],
    attributes: true,
  })
  if (document.documentElement.classList.contains('absorption-gathering'))
    startGathering()
  const handlePulse = (event: Event) => {
    if (!(event instanceof CustomEvent)) return

    const detail = event.detail as PulseDetail
    if (!detail?.origin || !detail.target) return
    createPulse(detail)
  }
  document.addEventListener('absorption-pulse', handlePulse)

  return () => {
    observer.disconnect()
    document.removeEventListener('absorption-pulse', handlePulse)
    stopGathering()
  }
})

function createPulse({ origin, target }: PulseDetail) {
  cancelPulse()
  vortexOrigin = origin

  const pulse = document.createElement('span')
  const targets = getPulseTargets(origin)
  const targetDistance = Math.hypot(target.x - origin.x, target.y - origin.y)
  const farthestTarget = Math.max(targetDistance, ...targets.map(item => item.distance))
  const finalRadius = Math.max(
    farthestTarget * 1.25,
    Math.hypot(window.innerWidth, window.innerHeight) * 1.1,
  )
  const generation = ++pulseGeneration

  pulse.className = 'absorption-pulse'
  pulse.style.left = `${origin.x}px`
  pulse.style.top = `${origin.y}px`
  absorptionLayer.appendChild(pulse)
  const cardWidth = document
    .querySelector<HTMLElement>('.contact-card-button')
    ?.getBoundingClientRect().width
  const containedRadius = Math.max(42, (cardWidth ?? 84) / 2)
  const containedPulses = containedPulseWaves.map(wave => {
    const containedPulse = document.createElement('span')

    containedPulse.className = 'absorption-pulse absorption-pulse--contained'
    containedPulse.style.left = `${origin.x}px`
    containedPulse.style.top = `${origin.y}px`
    absorptionLayer.appendChild(containedPulse)

    return { element: containedPulse, radius: containedRadius + wave.offset, ...wave }
  })

  const startedAt = performance.now()
  const animatePulse = (now: number) => {
    if (generation !== pulseGeneration) return

    const elapsed = now - startedAt
    const travelProgress = Math.min(1, Math.max(0, (elapsed - pulseDelay) / pulseDuration))
    // This exponential response launches the wave briskly, then lets its
    // velocity decay continuously instead of introducing a visible slow-down.
    const propagation =
      (1 - Math.exp(-pulseDamping * travelProgress)) /
      (1 - Math.exp(-pulseDamping))
    const radius = finalRadius * propagation

    pulse.style.width = `${Math.max(1, radius * 2)}px`
    pulse.style.height = `${Math.max(1, radius * 2)}px`
    pulse.style.opacity = `${
      travelProgress === 0 ? 0 : 0.94 * (1 - travelProgress) ** 1.45
    }`

    for (const containedPulse of containedPulses) {
      const progress = Math.min(
        1,
        Math.max(0, (elapsed - containedPulse.delay) / containedPulse.duration),
      )
      // These are visual pressure ripples only. Their radius remains inside
      // the card, so they cannot cause a component impact or a board break.
      const pulseProgress = containedPulse.contract
        ? smootherstep(Math.min(progress * 2, 1)) *
          (1 - smootherstep(Math.max((progress - 0.5) * 2, 0)))
        : smootherstep(progress)
      const radius = containedPulse.radius * pulseProgress
      const rise = smootherstep(progress / 0.22)
      const fade = containedPulse.contract
        ? 1 - smootherstep((progress - 0.78) / 0.22)
        : 1 - smootherstep((progress - 0.48) / 0.52)

      containedPulse.element.style.width = `${Math.max(1, radius * 2)}px`
      containedPulse.element.style.height = `${Math.max(1, radius * 2)}px`
      containedPulse.element.style.opacity = `${containedPulse.peakOpacity * rise * fade}`
    }

    for (const pulseTarget of targets) {
      if (!pulseTarget.hit && radius >= pulseTarget.distance) {
        pulseTarget.hit = true
        handlePulseImpact(pulseTarget.element)
      }
    }

    if (travelProgress < 1) {
      pulseFrame = requestAnimationFrame(animatePulse)
      return
    }

    pulse.style.opacity = '0'
    pulseHitTimers.push(
      window.setTimeout(() => {
        if (generation === pulseGeneration) pulse.remove()
      }, 220),
    )
    pulseFrame = 0
  }

  pulseFrame = requestAnimationFrame(animatePulse)
}

function getGatheringSources() {
  return [
    ...new Set([
      ...document.querySelectorAll<HTMLElement>(
        'header a, header button, header li > span[aria-hidden="true"], main h1, main p, main h2, main a, footer > span:first-child, footer > span > span, footer > span > a',
      ),
    ]),
  ].filter(source => !source.closest('.contact-card'))
}

function getPulseTargets(origin: Origin): PulseTarget[] {
  return getGatheringSources()
    .map(element => {
      const rect = element.getBoundingClientRect()
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }

      return {
        distance: Math.hypot(center.x - origin.x, center.y - origin.y),
        element,
        hit: false,
      }
    })
    .filter(target => target.element.getBoundingClientRect().width > 0)
}

function handlePulseImpact(element: HTMLElement) {
  element.classList.remove('absorption-pulse-hit')
  // Restart the brief electrical flicker if a nested target is crossed in the
  // same frame as its parent.
  void element.offsetWidth
  element.classList.add('absorption-pulse-hit')
  pulseHitTimers.push(
    window.setTimeout(() => element.classList.remove('absorption-pulse-hit'), 460),
  )

  sourceImpactElapsed.set(
    element,
    Math.max(0, performance.now() - gatheringStartedAt),
  )

  if (element.id !== 'profile-name') return

  breakElapsed = sourceImpactElapsed.get(element) ?? 0
  document.dispatchEvent(new Event('rolling-name-freeze'))
}

function cancelPulse() {
  pulseGeneration += 1
  cancelAnimationFrame(pulseFrame)
  pulseFrame = 0
  pulseHitTimers.forEach(timer => clearTimeout(timer))
  pulseHitTimers = []
  absorptionLayer?.querySelectorAll('.absorption-pulse').forEach(pulse => pulse.remove())
  document.querySelectorAll<HTMLElement>('.absorption-pulse-hit').forEach(element => {
    element.classList.remove('absorption-pulse-hit')
  })
}

function smoothstep(value: number) {
  const progress = Math.min(1, Math.max(0, value))
  return progress * progress * (3 - 2 * progress)
}

function smootherstep(value: number) {
  const progress = Math.min(1, Math.max(0, value))
  return progress ** 3 * (progress * (progress * 6 - 15) + 10)
}

function randomAt(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function preludeMotion(particle: AbsorptionParticle, elapsed: number): Motion {
  // The two wind stages intentionally overlap: the low-frequency movement
  // has time to settle in before the more erratic pull starts to show.
  const gentlePull = smootherstep((elapsed - 9_800) / 12_000)
  const violentPull = smootherstep((elapsed - 17_500) / 13_000)
  const sourceImpact = sourceImpactElapsed.get(particle.source) ?? Number.POSITIVE_INFINITY
  const breakPull =
    elapsed < sourceImpact ? 0 : 1 - smoothstep((elapsed - sourceImpact) / 460)
  // Each glyph begins to yield toward the orb shortly before its own release.
  // The tension reaches its maximum with zero velocity, making the handoff to
  // the accelerating vortex continuous rather than a hard state change.
  const tension = smootherstep(
    (elapsed - (gatheringDuration + particle.delay - 1_500)) / 1_500,
  )
  const toVortexX = vortexOrigin ? vortexOrigin.x - particle.startX : 0
  const toVortexY = vortexOrigin ? vortexOrigin.y - particle.startY : 0
  const vortexDistance = Math.max(1, Math.hypot(toVortexX, toVortexY))
  const tensionDistance = Math.min(3.2, vortexDistance * 0.007) * tension
  const phase = particle.jitterSeed
  const gentleX = Math.sin(elapsed * 0.0037 + phase) * gentlePull * 0.55
  const gentleY = Math.cos(elapsed * 0.0049 + phase * 0.7) * gentlePull * 0.32
  const violentX =
    (Math.sin(elapsed * 0.019 + phase * 1.3) * 2.5 +
      Math.sin(elapsed * 0.047 + phase) * 0.95) *
    violentPull
  const violentY =
    (Math.cos(elapsed * 0.023 + phase * 0.6) * 1.55 +
      Math.sin(elapsed * 0.057 + phase * 1.8) * 0.65) *
    violentPull

  return {
    depth:
      gentlePull * Math.sin(elapsed * 0.0041 + phase * 0.5) * 2.5 +
      violentPull * Math.sin(elapsed * 0.029 + phase * 1.4) * 10 +
      breakPull * Math.sin(elapsed * 0.18 + phase) * 7 - tension * 3.5,
    pitch:
      gentlePull * Math.cos(elapsed * 0.0047 + phase) * 1.1 +
      violentPull * Math.cos(elapsed * 0.027 + phase * 1.6) * 5 +
      breakPull * Math.cos(elapsed * 0.16 + phase * 0.7) * 3.5,
    rotation:
      gentlePull * Math.sin(elapsed * 0.0033 + phase) * 0.28 +
      violentPull * Math.sin(elapsed * 0.031 + phase * 0.9) * 1.9 +
      breakPull * Math.sin(elapsed * 0.21 + phase * 1.8) * 2,
    skew:
      gentlePull * Math.sin(elapsed * 0.0044 + phase * 1.5) * 0.35 +
      violentPull * Math.sin(elapsed * 0.035 + phase * 0.3) * 1.55 +
      breakPull * Math.cos(elapsed * 0.2 + phase * 0.8) * 1.4,
    x:
      (gentleX + violentX) * 0.14 +
      breakPull * Math.sin(elapsed * 0.24 + phase) * 0.8 +
      (toVortexX / vortexDistance) * tensionDistance,
    y:
      (gentleY + violentY) * 0.11 +
      breakPull * Math.cos(elapsed * 0.19 + phase * 1.2) * 0.45 +
      (toVortexY / vortexDistance) * tensionDistance,
    yaw:
      gentlePull * Math.sin(elapsed * 0.0053 + phase * 1.2) * 1.2 +
      violentPull * Math.sin(elapsed * 0.033 + phase * 0.4) * 5.5 +
      breakPull * Math.cos(elapsed * 0.17 + phase * 0.4) * 4,
  }
}

function setParticleTransform(particle: AbsorptionParticle, motion: Motion) {
  particle.element.style.transform = `translate3d(${motion.x}px, ${motion.y}px, ${motion.depth}px) rotateX(${motion.pitch}deg) rotateY(${motion.yaw}deg) rotateZ(${motion.rotation}deg) skewX(${motion.skew}deg)`
}

function hideSource(source: HTMLElement) {
  const textTargets =
    source.id === 'profile-name'
      ? [...source.querySelectorAll<HTMLElement>('.rolling-board__face')]
      : [source]

  for (const target of textTargets) {
    if (originalColors.has(target)) continue

    originalColors.set(target, target.style.color)
    target.style.color = 'transparent'
  }

  for (const guide of source.querySelectorAll<HTMLElement>('[data-rolling-guide]')) {
    if (originalGuideOpacities.has(guide)) continue

    originalGuideOpacities.set(guide, guide.style.opacity)
    guide.style.opacity = '0'
  }
}

function restoreSources() {
  for (const [source, color] of originalColors) source.style.color = color
  originalColors.clear()
  for (const [guide, opacity] of originalGuideOpacities) guide.style.opacity = opacity
  originalGuideOpacities.clear()
}

function createParticle(
  source: HTMLElement,
  x: number,
  y: number,
  content: string | Element,
  width?: number,
) {
  if (particles.length >= 260) return

  const style = window.getComputedStyle(source)
  const particle = document.createElement('span')
  const jitterSeed = Math.random() * 10_000
  const pivotSide = 24 + randomAt(jitterSeed) * 52

  particle.className = 'absorption-particle'
  particle.style.color = style.color
  particle.style.font = style.font
  particle.style.letterSpacing = style.letterSpacing
  particle.style.lineHeight = style.lineHeight
  particle.style.left = `${x}px`
  particle.style.top = `${y}px`
  particle.style.opacity = '0'
  // A varied point on the base acts as the glyph's grounded wind hinge.
  particle.style.transformOrigin = `${pivotSide}% 100%`
  particle.style.transformStyle = 'preserve-3d'
  if (width) particle.style.width = `${width}px`
  if (typeof content === 'string') particle.textContent = content
  else particle.appendChild(content)
  absorptionLayer.appendChild(particle)

  particles.push({
    delay: Math.random() * releaseWindow,
    duration: 0,
    element: particle,
    jitterRate: 45 + Math.random() * 110,
    jitterSeed,
    startX: x,
    startY: y,
    source,
    turns: 0.8 + Math.random() * 1.15,
  })
}

function prepareParticles() {
  hasPreparedParticles = true
  const textMeasure = document.createElement('canvas').getContext('2d')
  const sources = getGatheringSources()

  for (const source of sources) {
    const rect = source.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) continue

    if (source.id === 'profile-name') {
      const hasProfileParticles = createProfileParticles(source)
      createProfileGuideParticles(source)
      if (hasProfileParticles) continue
    }

    const style = window.getComputedStyle(source)
    const text = source.querySelector('svg') ? '' : source.innerText.trim()

    if (text && textMeasure) {
      textMeasure.font = style.font
      const letterSpacing = Number.parseFloat(style.letterSpacing) || 0
      const widths = [...text].map(
        character => textMeasure.measureText(character).width + letterSpacing,
      )
      const totalWidth = widths.reduce((total, width) => total + width, 0)
      const isHeaderText = Boolean(source.closest('header'))
      // Header links are intrinsically sized and left-anchored by the nav
      // grid. Centering their measured text can shift the TYPE clone when it
      // replaces the original link during the pulse impact.
      let x = isHeaderText
        ? rect.left
        : rect.left + Math.max(0, (rect.width - totalWidth) / 2)
      const y = isHeaderText
        ? rect.top
        : rect.top + (rect.height - Number.parseFloat(style.fontSize)) / 2

      for (const [index, character] of [...text].entries()) {
        const width = widths[index] ?? 0
        if (character.trim()) createParticle(source, x, y, character, width)
        x += width
      }
    }
  }

  for (const icon of document.querySelectorAll<SVGElement>(
    'header svg, main svg, footer svg',
  )) {
    if (icon.closest('.contact-card')) continue
    const rect = icon.getBoundingClientRect()
    const source = icon.closest<HTMLElement>('a, button') ?? icon.parentElement
    if (!source || rect.width === 0 || rect.height === 0) continue

    createParticle(
      source,
      rect.left,
      rect.top,
      icon.cloneNode(true) as SVGElement,
      rect.width,
    )
  }

  gatheringSources = sources
}

function createProfileParticles(source: HTMLElement) {
  let hasParticles = false

  for (const slot of source.querySelectorAll<HTMLElement>('[data-rolling-slot]')) {
    const slotRect = slot.getBoundingClientRect()
    const visibleFace = [...slot.querySelectorAll<HTMLElement>('[data-rolling-face]')]
      .map(face => ({
        face,
        rect: face.getBoundingClientRect(),
      }))
      .filter(({ rect }) => rect.bottom > slotRect.top && rect.top < slotRect.bottom)
      .sort(
        (left, right) =>
          Math.min(right.rect.bottom, slotRect.bottom) -
          Math.max(right.rect.top, slotRect.top) -
          (Math.min(left.rect.bottom, slotRect.bottom) -
            Math.max(left.rect.top, slotRect.top)),
      )[0]

    const character = visibleFace?.face.textContent?.trim()
    if (!visibleFace || !character) continue

    createParticle(
      source,
      visibleFace.rect.left,
      visibleFace.rect.top,
      character,
      visibleFace.rect.width,
    )
    hasParticles = true
  }

  return hasParticles
}

function createProfileGuideParticles(source: HTMLElement) {
  for (const guide of source.querySelectorAll<HTMLElement>('[data-rolling-guide]')) {
    const rect = guide.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) continue

    const style = window.getComputedStyle(guide)
    const clone = document.createElement('span')
    clone.style.display = 'block'
    clone.style.width = `${rect.width}px`
    clone.style.height = `${rect.height}px`
    clone.style.background = style.background
    clone.style.opacity = style.opacity

    createParticle(source, rect.left, rect.top, clone, rect.width)
  }
}

function startGathering() {
  if (
    isGathering ||
    isAbsorbing ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return
  }

  isGathering = true
  gatheringStartedAt = performance.now()
  animateGathering(gatheringStartedAt)
}

function animateGathering(now: number) {
  if (!isGathering || isAbsorbing) return

  const elapsed = now - gatheringStartedAt
  if (elapsed >= breakElapsed && !hasPreparedParticles) prepareParticles()
  for (const source of gatheringSources) {
    if (sourceImpactElapsed.has(source)) hideSource(source)
  }

  for (const particle of particles) {
    const impactedAt = sourceImpactElapsed.get(particle.source)
    particle.element.style.opacity =
      impactedAt !== undefined && elapsed >= impactedAt ? '1' : '0'
    setParticleTransform(particle, preludeMotion(particle, elapsed))
  }

  animationFrame = requestAnimationFrame(animateGathering)
}

function stopGathering() {
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
  isGathering = false
  particles = []
  gatheringSources = []
  hasPreparedParticles = false
  breakElapsed = Number.POSITIVE_INFINITY
  vortexOrigin = null
  sourceImpactElapsed.clear()
  cancelPulse()
  absorptionLayer?.replaceChildren()
  restoreSources()
}

function absorbPage(portalOrigin: Origin) {
  if (isAbsorbing || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return
  vortexOrigin = portalOrigin
  if (!isGathering) startGathering()
  if (!hasPreparedParticles) prepareParticles()
  if (particles.length === 0) return

  isAbsorbing = true
  cancelAnimationFrame(animationFrame)
  for (const source of gatheringSources) hideSource(source)
  const preludeElapsed = Math.min(
    gatheringDuration,
    performance.now() - gatheringStartedAt,
  )

  for (const particle of particles) particle.duration = vortexDuration

  const startedAt = performance.now()
  const animate = (now: number) => {
    const elapsed = now - startedAt
    const allArrivedAt = releaseWindow + vortexDuration

    for (const particle of particles) {
      const rawProgress = (elapsed - particle.delay) / particle.duration
      if (rawProgress < 0) {
        setParticleTransform(
          particle,
          preludeMotion(particle, preludeElapsed + elapsed),
        )
        continue
      }

      const progress = Math.min(1, rawProgress)
      // The first sixth of the flight accelerates from rest, then merges into
      // the continuously accelerating stream without a velocity discontinuity.
      const basePull = (progress + progress ** 3 * 0.8) / 1.8
      const launchDuration = 0.24
      const pull =
        progress >= launchDuration
          ? basePull
          : (() => {
              const targetPull = (launchDuration + launchDuration ** 3 * 0.8) / 1.8
              const targetVelocity = (1 + 2.4 * launchDuration ** 2) / 1.8
              const launchProgress = progress / launchDuration

              return (
                (3 * launchProgress ** 2 - 2 * launchProgress ** 3) * targetPull +
                (launchProgress ** 3 - launchProgress ** 2) *
                  launchDuration *
                  targetVelocity
              )
            })()
      const releaseMotion = preludeMotion(particle, preludeElapsed + particle.delay)
      const releaseX = particle.startX + releaseMotion.x
      const releaseY = particle.startY + releaseMotion.y
      const distanceX = releaseX - portalOrigin.x
      const distanceY = releaseY - portalOrigin.y
      const distance = Math.max(1, Math.hypot(distanceX, distanceY))
      const angle =
        Math.atan2(distanceY, distanceX) - pull * particle.turns * Math.PI * 2
      const radius = distance * (1 - pull * 0.97)
      const x = portalOrigin.x + Math.cos(angle) * radius
      const y = portalOrigin.y + Math.sin(angle) * radius
      const jitter = pull * (1 - pull)
      const flickerStep = Math.floor(elapsed / particle.jitterRate)
      const flickerX =
        (randomAt(particle.jitterSeed + flickerStep * 3) - 0.5) * 4 * jitter
      const flickerY =
        (randomAt(particle.jitterSeed + flickerStep * 7) - 0.5) * 1.2 * jitter
      const flickerRotation =
        (randomAt(particle.jitterSeed + flickerStep * 11) - 0.5) * 12 * jitter

      particle.element.style.opacity = `${1 - pull}`
      setParticleTransform(particle, {
        depth: releaseMotion.depth * (1 - pull) - pull * 120,
        pitch: releaseMotion.pitch * (1 - pull),
        rotation:
          releaseMotion.rotation - pull * particle.turns * 360 + flickerRotation,
        skew: releaseMotion.skew * (1 - pull),
        x: releaseMotion.x + x - releaseX + flickerX,
        y: releaseMotion.y + y - releaseY + flickerY,
        yaw: releaseMotion.yaw * (1 - pull),
      })
    }

    if (elapsed < allArrivedAt) {
      animationFrame = requestAnimationFrame(animate)
      return
    }

    window.setTimeout(() => {
      absorptionLayer.replaceChildren()
      document.documentElement.classList.remove('absorption-gathering')
    }, 340)
  }

  animationFrame = requestAnimationFrame(animate)
}
</script>

<div aria-hidden="true" bind:this={absorptionLayer} class="absorption-layer"></div>

<style>
.absorption-layer {
  position: fixed;
  z-index: 50;
  inset: 0;
  overflow: hidden;
  perspective: 900px;
  perspective-origin: 50% 50%;
  pointer-events: none;
}

:global(.absorption-particle) {
  position: fixed;
  display: block;
  transform-origin: 50% 100%;
  white-space: pre;
  pointer-events: none;
  will-change: transform, opacity;
}

:global(.absorption-particle svg) {
  display: block;
  width: 100%;
  height: auto;
}

:global(.absorption-pulse) {
  position: fixed;
  display: block;
  width: 1px;
  height: 1px;
  border: 0.5px solid rgb(240 219 255 / 0.85);
  border-radius: 50%;
  box-shadow:
    0 0 0.5px rgb(255 255 255 / 0.95),
    0 0 2px rgb(236 194 255 / 0.82),
    0 0 5px rgb(116 107 255 / 0.34);
  opacity: 0;
  pointer-events: none;
  transform: translate3d(-50%, -50%, 0);
  transform-origin: 50% 50%;
  will-change: width, height, opacity;
}

:global(.absorption-pulse--contained) {
  border-color: rgb(248 218 255 / 0.92);
  box-shadow:
    0 0 0.5px rgb(255 255 255 / 0.95),
    0 0 3px rgb(236 194 255 / 0.76),
    0 0 7px rgb(116 107 255 / 0.34);
}

:global(.absorption-pulse-hit:not(#profile-name)) {
  animation: absorption-component-fritz 460ms steps(5, end) both;
  will-change: filter, opacity;
}

@keyframes absorption-component-fritz {
  0%,
  100% {
    filter: none;
    opacity: 1;
  }

  18% {
    filter: brightness(1.7) hue-rotate(18deg);
    opacity: 0.54;
  }

  46% {
    filter: brightness(0.76) hue-rotate(-14deg);
    opacity: 1;
  }

  72% {
    filter: brightness(1.35) hue-rotate(26deg);
    opacity: 0.76;
  }
}
</style>
