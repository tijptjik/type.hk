import type { Group } from 'three'

export function createShardScene(
  canvas: HTMLCanvasElement,
  getAbsorptionStartedAt: () => number,
) {
  let dispose = () => {}
  let disposed = false

  void import('three')
    .then(THREE => {
      if (disposed) return
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: 'low-power',
      })
      const shardField = new THREE.Group()
      const clock = new THREE.Clock()
      const shards: {
        drift: number
        mesh: Group
        speed: number
        spin: number
        x: number
        y: number
        z: number
      }[] = []
      const motionReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      let animationFrame = 0

      renderer.setClearColor(0x000000, 0)
      camera.position.z = 7.2
      scene.add(shardField)

      const random = (index: number, salt: number) => {
        const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453

        return value - Math.floor(value)
      }
      const speckCount = 240
      const speckGeometry = new THREE.BufferGeometry()
      const speckPhases = new Float32Array(speckCount)
      const speckPositions = new Float32Array(speckCount * 3)
      const speckSizes = new Float32Array(speckCount)
      for (let index = 0; index < speckCount; index++) {
        const angle = random(index, 1) * Math.PI * 2
        const radius = Math.sqrt(1.7 ** 2 + random(index, 2) * (2.48 ** 2 - 1.7 ** 2))
        const offset = index * 3

        speckPositions[offset] = Math.cos(angle) * radius
        speckPositions[offset + 1] = Math.sin(angle) * radius
        speckPositions[offset + 2] = random(index, 3) * 0.83 - 0.4
        speckPhases[index] = random(index, 4)
        speckSizes[index] = 0.024 + random(index, 5) * 0.052
      }
      speckGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(speckPositions, 3),
      )
      speckGeometry.setAttribute('aSize', new THREE.BufferAttribute(speckSizes, 1))
      speckGeometry.setAttribute('aPhase', new THREE.BufferAttribute(speckPhases, 1))
      const pointScale = { value: 1 }
      const warpTime = { value: 0 }
      const speckAbsorption = { value: 0 }
      const specks = new THREE.Points(
        speckGeometry,
        new THREE.ShaderMaterial({
          depthWrite: false,
          fragmentShader: `
            uniform vec3 uColor;
            uniform float uAbsorb;

            void main() {
              float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
              float alpha = smoothstep(0.5, 0.14, distanceFromCenter) * 0.82 * (1.0 - uAbsorb);
              gl_FragColor = vec4(uColor, alpha);
            }
          `,
          uniforms: {
            uColor: { value: new THREE.Color(0xb8a8ff) },
            uAbsorb: speckAbsorption,
            uPointScale: pointScale,
            uTime: warpTime,
          },
          transparent: true,
          vertexShader: `
            attribute float aSize;
            attribute float aPhase;
            uniform float uPointScale;
            uniform float uTime;

            void main() {
              float angle = uTime * 0.08 + aPhase * 0.16;
              vec3 warpedPosition = position;
              warpedPosition.xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * position.xy;
              warpedPosition.xy *= 1.0 - uAbsorb * 0.98;
              warpedPosition.z -= uAbsorb * 1.8;
              vec4 modelViewPosition = modelViewMatrix * vec4(warpedPosition, 1.0);
              float twinkle = 0.78 + sin(uTime * 1.4 + aPhase * 6.28318) * 0.22;
              gl_PointSize = aSize * uPointScale * twinkle / -modelViewPosition.z;
              gl_Position = projectionMatrix * modelViewPosition;
            }
          `,
        }),
      )
      shardField.add(specks)

      // A compact ring keeps the low-poly fragments visually anchored to the
      // QR code instead of scattering them around the card's perimeter.
      const shardSpecs = [
        [-1.75, 0.95, -0.35, 0.28],
        [-1.88, 0.2, 0.1, 0.18],
        [-1.65, -0.95, -0.2, 0.32],
        [-1.05, -1.65, 0.15, 0.2],
        [-0.25, -1.82, -0.1, 0.27],
        [0.82, -1.68, 0.2, 0.16],
        [1.62, -0.92, -0.15, 0.3],
        [1.82, 0.1, 0.1, 0.19],
        [1.6, 0.9, -0.25, 0.34],
        [0.82, 1.68, 0.2, 0.17],
        [-0.2, 1.84, -0.1, 0.29],
        [-0.95, 1.62, 0.1, 0.18],
      ] as const
      const debrisSpecs = Array.from({ length: 84 }, (_, index) => {
        const angle = random(index, 6) * Math.PI * 2
        const radius = Math.sqrt(1.76 ** 2 + random(index, 7) * (2.44 ** 2 - 1.76 ** 2))

        return [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          random(index, 8) * 0.71 - 0.35,
          0.025 + random(index, 9) * 0.075,
        ]
      })

      for (const [index, [x, y, z, size]] of [
        ...shardSpecs,
        ...debrisSpecs,
      ].entries()) {
        const shard = new THREE.Group()
        const shape = index % 4
        const geometry =
          shape === 0
            ? new THREE.TetrahedronGeometry(size, 0)
            : shape === 1
              ? new THREE.OctahedronGeometry(size, 0)
              : shape === 2
                ? new THREE.ConeGeometry(size * 0.42, size * 1.8, 3, 1)
                : new THREE.TetrahedronGeometry(size * 0.82, 0)
        const faceMaterial = new THREE.MeshBasicMaterial({
          color: 0x9078ff,
          depthWrite: false,
          opacity: 0.07,
          side: THREE.DoubleSide,
          transparent: true,
        })
        const faces = new THREE.Mesh(geometry, faceMaterial)
        const edgeMaterial = new THREE.LineBasicMaterial({
          color: 0xb8a8ff,
          depthWrite: false,
          opacity: 0.7,
          transparent: true,
        })
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          edgeMaterial,
        )

        shard.position.set(x, y, z)
        shard.rotation.set(y * 0.83, x * -0.57, (x + y) * 0.42)
        shard.scale.set(
          0.72 + ((index * 3) % 5) * 0.12,
          0.55 + ((index * 7) % 5) * 0.12,
          0.9 + ((index * 5) % 6) * 0.16,
        )
        shard.add(faces, edges)
        shardField.add(shard)
        shards.push({
          drift: random(index, 10),
          mesh: shard,
          speed: 0.12 + size * 0.1,
          spin: 0.72 + random(index, 11) * 0.56,
          x,
          y,
          z,
        })
      }

      const resize = () => {
        // Use the layout box rather than getBoundingClientRect(). The canvas
        // lives inside a rotating 3D card, and its transformed bounding box
        // can become extremely narrow during the flip.
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        if (!width || !height) return

        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        pointScale.value = (height * renderer.getPixelRatio()) / 2
      }
      const observer = new ResizeObserver(resize)
      observer.observe(canvas)
      resize()

      const render = () => {
        const elapsed = clock.getElapsedTime()
        const residualSpin = 0.12
        const pullProgress = THREE.MathUtils.clamp((elapsed - 10) / 30, 0, 1)
        const pull = pullProgress ** 3
        const absorptionStartedAt = getAbsorptionStartedAt()
        const absorptionProgress = absorptionStartedAt
          ? THREE.MathUtils.clamp(
              (performance.now() - absorptionStartedAt) / 3_000,
              0,
              1,
            )
          : 0
        const postArrivalElapsed = Math.max(0, elapsed - 40)
        const postArrivalRamp = THREE.MathUtils.clamp(postArrivalElapsed / 5, 0, 1)
        const vortexElapsed =
          elapsed <= 40
            ? elapsed
            : postArrivalElapsed <= 5
              ? 40 +
                postArrivalElapsed * (1 - ((1 - residualSpin) * postArrivalRamp) / 2)
              : 40 +
                (5 * (1 + residualSpin)) / 2 +
                residualSpin * (postArrivalElapsed - 5)
        const settlingSpin = (arrivalVelocity: number) => {
          if (postArrivalElapsed <= 5) {
            return (
              arrivalVelocity *
              postArrivalElapsed *
              (1 - ((1 - residualSpin) * postArrivalRamp) / 2)
            )
          }

          return (
            (arrivalVelocity * 5 * (1 + residualSpin)) / 2 +
            arrivalVelocity * residualSpin * (postArrivalElapsed - 5)
          )
        }
        warpTime.value = vortexElapsed
        speckAbsorption.value = absorptionProgress
        shardField.rotation.z =
          Math.sin(vortexElapsed * 0.08) * 0.04 +
          pullProgress ** 4 * 0.7488 +
          settlingSpin((4 * 0.7488) / 30)

        for (const shard of shards) {
          // The portal's influence begins almost imperceptibly, then its
          // attraction and angular velocity rise together as the timer runs.
          const travel = THREE.MathUtils.euclideanModulo(
            vortexElapsed * shard.speed * 0.52 + shard.drift,
            1,
          )
          const radius = 1.72 - travel * (1.15 + pull * 0.18)
          const orbitalInfluence = 34.56 + shard.drift * 34.56
          const arrivalVelocity = (4 * orbitalInfluence) / 30 + 0.2592 * shard.spin
          const angle =
            pullProgress ** 4 * orbitalInfluence +
            Math.min(elapsed, 40) * 0.2592 * shard.spin +
            settlingSpin(arrivalVelocity)
          const x = shard.x * radius
          const y = shard.y * radius

          const postArrivalSpeed = 1 - (1 - residualSpin) * postArrivalRamp
          shard.mesh.rotation.x +=
            shard.speed * (0.008 + pull * 0.032) * postArrivalSpeed
          shard.mesh.rotation.y +=
            shard.speed * (0.012 + pull * 0.048) * postArrivalSpeed
          shard.mesh.position.x = x * Math.cos(angle) - y * Math.sin(angle)
          shard.mesh.position.y = x * Math.sin(angle) + y * Math.cos(angle)
          shard.mesh.position.z = shard.z - travel * (2.7 + pull * 0.65)
        }
        renderer.render(scene, camera)
        animationFrame = requestAnimationFrame(render)
      }

      if (motionReduced) renderer.render(scene, camera)
      else render()

      dispose = () => {
        cancelAnimationFrame(animationFrame)
        observer.disconnect()
        scene.traverse(object => {
          if (
            object instanceof THREE.Mesh ||
            object instanceof THREE.LineSegments ||
            object instanceof THREE.Points
          ) {
            object.geometry.dispose()
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material]
            for (const material of materials) material.dispose()
          }
        })
        renderer.dispose()
      }
    })
    .catch(() => {
      // The QR code remains usable when WebGL is unavailable.
    })

  return () => {
    disposed = true
    dispose()
  }
}
