<script lang="ts">
import { onMount } from 'svelte'
import ContactCardAbsorption from './contact-card-absorption.svelte'
import QRCode from 'qrcode'

let {
  avatarUrl,
  contactCardQrData,
  contactCardUrl,
  name,
  onAbsorb,
  qrDark = '#e56ea1',
  qrLight = '#191724',
}: {
  avatarUrl: string
  contactCardQrData: string
  contactCardUrl: string
  name: string
  onAbsorb?: (origin: { x: number; y: number }) => void
  qrDark?: string
  qrLight?: string
} = $props()

let isFlipped = $state(false)
let qrCodeUrl = $state('')
let isQrCodeVisible = $state(true)

onMount(() => {
  void QRCode.toDataURL(contactCardQrData, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 480,
    color: { dark: qrDark, light: qrLight },
  }).then(url => {
    qrCodeUrl = url
  })
})

function openCard() {
  isQrCodeVisible = true
  isFlipped = true
}

function closeCard() {
  isFlipped = false
  isQrCodeVisible = true
}

function toggleCard() {
  if (isFlipped) closeCard()
  else openCard()
}

function closeCardOutsideQr(event: PointerEvent) {
  if (!isFlipped || !(event.target instanceof Element)) return
  if (event.target.closest('.contact-card-qr-link')) return

  closeCard()
}

function closeCardWithEscape(event: KeyboardEvent) {
  if (isFlipped && event.key === 'Escape') {
    closeCard()
  }
}

function revealAnimation(event: MouseEvent) {
  if (!event.altKey) return

  event.preventDefault()
  isQrCodeVisible = false
}
</script>

<svelte:window onkeydown={closeCardWithEscape} onpointerdown={closeCardOutsideQr} />

<div class="contact-card">
  <div class:flipped={isFlipped} class="contact-card-button">
    <span class="contact-card-inner">
      <button
        aria-label="Show contact QR code"
        aria-pressed={isFlipped}
        class="contact-card-face contact-card-front"
        onclick={toggleCard}
        type="button"
      >
        <img
          alt={name}
          class="contact-card-avatar"
          height="704"
          src={avatarUrl}
          width="704"
        >
      </button>
      <span class="contact-card-face contact-card-back">
        <ContactCardAbsorption active={isFlipped} {onAbsorb} />
        {#if qrCodeUrl && isQrCodeVisible}
          <a
            aria-label={`Download ${name}'s contact card`}
            class="contact-card-qr-link"
            href={contactCardUrl}
            onclick={revealAnimation}
          >
            <img alt="" class="contact-card-qr" src={qrCodeUrl}>
          </a>
        {/if}
      </span>
    </span>
  </div>
</div>

<style>
.contact-card {
  position: relative;
  z-index: 51;
  display: grid;
  justify-items: center;
  perspective: 1000px;
}
.contact-card-button {
  width: clamp(14rem, 48vw, 22rem);
  aspect-ratio: 1;
  border-radius: 9999px;
}
.contact-card-inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 560ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
  transform-style: preserve-3d;
}
.flipped .contact-card-inner {
  transform: rotateY(180deg);
}
.contact-card-face {
  position: absolute;
  display: grid;
  width: 100%;
  height: 100%;
  overflow: hidden;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  place-items: center;
  border: 1px solid #302d43;
  border-radius: 9999px;
  box-shadow:
    0 0 0 5px var(--background),
    0 0 0 7px #2b293a,
    0 0 2.5rem rgb(43 41 58 / 0.2);
}
.contact-card-front {
  padding: 0;
  cursor: pointer;
  pointer-events: auto;
  background: var(--surface);
  transform: rotateY(0deg);
  transition: opacity 1ms 280ms;
}
.contact-card-back {
  isolation: isolate;
  padding: 18%;
  opacity: 0;
  pointer-events: none;
  background: var(--background);
  transform: rotateY(180deg);
  transition: opacity 1ms 280ms;
}
.flipped .contact-card-front {
  opacity: 0;
  pointer-events: none;
}
.flipped .contact-card-back {
  opacity: 1;
  pointer-events: auto;
}
.contact-card-back::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  content: "";
  background-image:
    radial-gradient(
      circle at center,
      transparent 0 50%,
      rgb(156 207 216 / 0.13) 50.3% 50.7%,
      transparent 51% 100%
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0 15px,
      rgb(255 83 166 / 0.06) 15px 16px
    ),
    repeating-linear-gradient(
      90deg,
      transparent 0 15px,
      rgb(255 83 166 / 0.06) 15px 16px
    );
}
.contact-card-avatar,
.contact-card-qr {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.contact-card-qr-link {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;
}
.contact-card-qr {
  object-fit: contain;
  image-rendering: pixelated;
}
.contact-card-front:focus-visible,
.contact-card-qr-link:focus-visible {
  outline: 3px solid var(--link);
  outline-offset: 8px;
}
@media (max-width: 560px) {
  .contact-card-button {
    width: min(calc(100vw - 64px), 37svh, 22rem);
  }
}
@media (prefers-reduced-motion: reduce) {
  .contact-card-inner {
    transition-duration: 1ms;
  }
}
</style>
