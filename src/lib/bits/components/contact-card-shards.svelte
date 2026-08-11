<script lang="ts">
import { createShardScene } from './shard-scene'

let {
  active,
  getAbsorptionStartedAt,
}: {
  active: boolean
  getAbsorptionStartedAt: () => number
} = $props()

let canvas = $state<HTMLCanvasElement>()

$effect(() => {
  if (!active || !canvas) return

  return createShardScene(canvas, getAbsorptionStartedAt)
})
</script>

<canvas aria-hidden="true" bind:this={canvas} class="contact-card-shards"></canvas>

<style>
.contact-card-shards {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: inherit;
  filter: blur(0.2px) drop-shadow(0 0 1px rgb(109 114 255 / 0.72))
    drop-shadow(0 0 1px rgb(255 133 181 / 0.55))
    drop-shadow(0 0 4px rgb(116 107 255 / 0.4));
  opacity: 0.82;
}
</style>
