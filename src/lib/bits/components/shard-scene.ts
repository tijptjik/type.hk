export function createShardScene(
  canvas: HTMLCanvasElement,
  getAbsorptionStartedAt: () => number,
) {
  let dispose = () => {}
  let disposed = false

  void import('./shard-scene-runtime')
    .then(({ createShardSceneRuntime }) => {
      if (disposed) return
      dispose = createShardSceneRuntime(canvas, getAbsorptionStartedAt)
    })
    .catch(error => {
      // The QR code remains usable when WebGL is unavailable.
      console.warn('Unable to initialize the contact-card 3D scene', error)
    })

  return () => {
    disposed = true
    dispose()
  }
}
