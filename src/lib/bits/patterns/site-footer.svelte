<script lang="ts">
import { Heart } from '@lucide/svelte'

let {
  copyright,
  builtWith,
  inHongKong,
  hongKong,
  repositoryLabel,
}: {
  copyright: string
  builtWith: string
  inHongKong: string
  hongKong: string
  repositoryLabel: string
} = $props()
</script>

<footer
  class="mx-auto flex w-[min(100%-2rem,720px)] justify-between gap-4 py-5 text-[.75rem] text-muted max-[560px]:w-[min(100%-24px,720px)] max-[560px]:flex-col max-[560px]:items-center max-[560px]:gap-[.35rem] max-[560px]:py-[clamp(.75rem,1.5svh,1rem)] max-[560px]:text-center"
>
  <span class="max-[560px]:order-2">{copyright}</span>
  <span
    class="inline-flex w-max shrink-0 items-center gap-[.3rem] whitespace-nowrap max-[560px]:order-1 max-[560px]:w-full max-[560px]:justify-center"
  >
    <span>{builtWith}</span>
    <a
      aria-label={repositoryLabel}
      href="https://github.com/tijptjik/type.hk"
      rel="noopener noreferrer"
      target="_blank"
      class="text-link no-underline hover:text-link"
      ><Heart aria-hidden="true" fill="currentColor" size={15} /></a
    >
    <span>{inHongKong}</span>
    <a
      class="text-muted no-underline hover:text-link"
      href="https://viewer.saanseoi.hk/?region=hk&version=latest&theme=midnight&locale=en&features=roads%2Cbuildings%2Clanduse%2Cpois%2Cboundaries&labels=places%2Croads%2Cwater&diagnostics=false&lng=114.15986&lat=22.37066&z=9.99&bearing=0&pitch=0"
      rel="noopener noreferrer"
      target="_blank"
    >
      {hongKong}
    </a>
  </span>
</footer>
