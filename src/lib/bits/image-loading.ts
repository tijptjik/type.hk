const preloadedImages = new Map<string, HTMLImageElement>()

export function preloadImage(src: string | undefined) {
  if (!src) return
  const preloadedImage = preloadedImages.get(src)
  if (preloadedImage) return preloadedImage

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
  return image
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

export function lazyLoadVideo(
  video: HTMLVideoElement,
  { poster, src }: { poster: string; src: string },
) {
  let observer: IntersectionObserver | undefined
  let removePosterListeners = () => {}
  let started = false

  const load = () => {
    if (started) return
    started = true
    observer?.disconnect()
    video.src = src

    const cover = preloadImage(poster)
    if (!cover) {
      video.dataset.ready = 'true'
      return
    }

    const reveal = () => {
      if (cover.complete && cover.naturalWidth > 0) {
        video.poster = poster
        video.dataset.ready = 'true'
        removePosterListeners()
      }
    }
    const revealWithoutPoster = () => {
      video.dataset.ready = 'true'
      removePosterListeners()
    }
    cover.addEventListener('load', reveal)
    cover.addEventListener('error', revealWithoutPoster)
    removePosterListeners = () => {
      cover.removeEventListener('load', reveal)
      cover.removeEventListener('error', revealWithoutPoster)
    }
    reveal()
  }

  video.dataset.ready = 'false'
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) load()
      },
      { rootMargin: '320px 0px' },
    )
    observer.observe(video)
  } else {
    load()
  }

  return {
    destroy() {
      observer?.disconnect()
      removePosterListeners()
    },
  }
}
