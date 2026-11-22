const preloadedImages = new Map<string, HTMLImageElement>()

export function preloadImage(src: string | undefined) {
  if (!src || preloadedImages.has(src)) return

  const image = new Image()
  image.fetchPriority = 'high'
  image.addEventListener(
    'error',
    () => {
      preloadedImages.delete(src)
    },
    { once: true },
  )
  preloadedImages.set(src, image)
  image.src = src
}

export function revealImage(image: HTMLImageElement) {
  const reveal = () => {
    if (image.complete && image.naturalWidth > 0) {
      image.dataset.ready = 'true'
    }
  }

  image.dataset.ready = 'false'
  image.addEventListener('load', reveal)
  if (image.complete) reveal()

  return {
    destroy() {
      image.removeEventListener('load', reveal)
    },
  }
}
