<script lang="ts">
let {
  orb = $bindable<HTMLSpanElement>(),
}: {
  orb?: HTMLSpanElement
} = $props()
</script>

<span aria-hidden="true" bind:this={orb} class="contact-card-orb"></span>

<style>
.contact-card-orb {
  position: absolute;
  z-index: 1;
  display: block;
  width: 15%;
  aspect-ratio: 1;
  border-radius: 50%;
  isolation: isolate;
  overflow: visible;
  background: radial-gradient(
    circle at center,
    #010104 0 30%,
    #070510 46%,
    transparent 68%
  );
  box-shadow:
    inset 0 0 0.45rem rgb(0 0 0 / 0.95),
    0 0 0.6rem rgb(125 102 255 / 0.28),
    0 0 1.25rem rgb(244 92 177 / 0.18);
  transition: box-shadow 180ms ease;
}
.contact-card-orb::after {
  position: absolute;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}
.contact-card-orb::after {
  z-index: 1;
  inset: 18%;
  background: radial-gradient(
    circle at 35% 30%,
    rgb(70 54 118 / 0.45),
    transparent 34%
  );
}
</style>
