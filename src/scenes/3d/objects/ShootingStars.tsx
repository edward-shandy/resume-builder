import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollStore } from '../../../store/scrollStore'

const POOL_SIZE = 7
const TRAIL_SEGMENTS = 16 // ribbon samples per trail

const TRAIL_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Tail (u=0) -> head (u=1): cool starlit blue fading in, warming through
// gold, hitting white-hot right at the head. One in ~4 meteors is
// "special": a soft pink/magenta core line runs down its middle,
// reading as a big two-tone comet the way the reference does. The head
// end terminates in a soft half-circle cap instead of a hard cut.
const TRAIL_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uOpacity;
  uniform float uSpecial;

  void main() {
    float u = vUv.x;
    vec3 cool = vec3(0.62, 0.73, 1.0);
    vec3 warm = vec3(1.0, 0.914, 0.761);
    vec3 hot = vec3(1.0, 1.0, 1.0);

    vec3 color = mix(cool, warm, smoothstep(0.0, 0.6, u));
    color = mix(color, hot, smoothstep(0.75, 1.0, u));

    float centerDist = abs(vUv.y - 0.5);
    vec3 pink = vec3(1.0, 0.5, 0.72);
    float core = (1.0 - smoothstep(0.0, 0.22, centerDist)) * smoothstep(0.08, 0.55, u);
    color = mix(color, pink, core * uSpecial * 0.85);

    float edge = 1.0 - centerDist * 2.0;
    float lengthFade = smoothstep(0.0, 0.12, u);
    float alpha = edge * lengthFade * pow(u, 0.5) * uOpacity;

    // Rounded half-circle cap at the head: past uCapStart the alpha is
    // masked by an ellipse centered on the trail axis, so the leading
    // edge is a soft semicircle rather than a straight chop.
    float capStart = 0.93;
    vec2 q = vec2(max(u - capStart, 0.0) / (1.0 - capStart), centerDist * 2.0);
    alpha *= 1.0 - smoothstep(0.8, 1.0, length(q));

    gl_FragColor = vec4(color, alpha);
  }
`

function createHeadGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.35, 'rgba(230,238,255,0.7)')
    gradient.addColorStop(1, 'rgba(210,225,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
  }
  return new THREE.CanvasTexture(canvas)
}

/**
 * Ribbon geometry for one trail: (TRAIL_SEGMENTS + 1) cross-sections of
 * two vertices each, positions rewritten every frame to follow the
 * meteor's actual bezier flight path. UVs are static: u runs 0 (tail)
 * to 1 (head), v spans the width.
 */
function createRibbonGeometry() {
  const geo = new THREE.BufferGeometry()
  const vertCount = (TRAIL_SEGMENTS + 1) * 2
  const positions = new Float32Array(vertCount * 3)
  const uvs = new Float32Array(vertCount * 2)
  const indices: number[] = []

  for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
    const u = i / TRAIL_SEGMENTS
    uvs[(i * 2) * 2] = u
    uvs[(i * 2) * 2 + 1] = 0
    uvs[(i * 2 + 1) * 2] = u
    uvs[(i * 2 + 1) * 2 + 1] = 1
    if (i < TRAIL_SEGMENTS) {
      const a = i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return geo
}

interface Meteor {
  active: boolean
  elapsed: number
  duration: number
  p0: THREE.Vector3 // bezier start
  p1: THREE.Vector3 // bezier control
  p2: THREE.Vector3 // bezier end
  pathLength: number
  length: number // trail length in world units
  flickerSeed: number
  headScale: number
  special: boolean
}

function makeMeteor(): Meteor {
  return {
    active: false,
    elapsed: 0,
    duration: 1,
    p0: new THREE.Vector3(),
    p1: new THREE.Vector3(),
    p2: new THREE.Vector3(),
    pathLength: 1,
    length: 6,
    flickerSeed: Math.random() * 100,
    headScale: 0.11,
    special: false,
  }
}

const _bezierTmp = new THREE.Vector3()
const _tangentTmp = new THREE.Vector3()
const _perpTmp = new THREE.Vector3()

function bezierAt(m: Meteor, t: number, out: THREE.Vector3) {
  const s = 1 - t
  out
    .copy(m.p0)
    .multiplyScalar(s * s)
    .addScaledVector(m.p1, 2 * s * t)
    .addScaledVector(m.p2, t * t)
  return out
}

function bezierTangentAt(m: Meteor, t: number, out: THREE.Vector3) {
  // d/dt = 2(1-t)(p1-p0) + 2t(p2-p1)
  const s = 1 - t
  out.set(
    2 * s * (m.p1.x - m.p0.x) + 2 * t * (m.p2.x - m.p1.x),
    2 * s * (m.p1.y - m.p0.y) + 2 * t * (m.p2.y - m.p1.y),
    2 * s * (m.p1.z - m.p0.z) + 2 * t * (m.p2.z - m.p1.z),
  )
  return out.normalize()
}

function spawnMeteor(m: Meteor) {
  // Each meteor falls at its own steep angle (25-55deg below horizontal)
  // and can mirror left<->right, instead of one fixed diagonal.
  const mirror = Math.random() < 0.5 ? 1 : -1
  const fallAngle = THREE.MathUtils.degToRad(25 + Math.random() * 30)
  const dir = new THREE.Vector3(
    mirror * Math.cos(fallAngle),
    -Math.sin(fallAngle),
    (Math.random() - 0.5) * 0.18,
  ).normalize()

  // Spawn near the top of the visible frustum so the long arc is
  // on-screen for most of its flight.
  const startX = mirror * (4 + Math.random() * 5)
  const startY = 3.5 + Math.random() * 2.5
  const startZ = -7 - Math.random() * 6
  m.p0.set(startX, startY, startZ)

  const travel = 14 + Math.random() * 7
  m.p2.copy(m.p0).addScaledVector(dir, travel)

  // Control point: path midpoint pushed perpendicular to the travel
  // direction — the head genuinely flies this bow, and the ribbon trail
  // retraces it, so tail curvature always matches the flight path.
  const curve = (Math.random() < 0.5 ? -1 : 1) * (1.4 + Math.random() * 1.2)
  _perpTmp.set(-dir.y, dir.x, 0).normalize()
  m.p1
    .copy(m.p0)
    .add(m.p2)
    .multiplyScalar(0.5)
    .addScaledVector(_perpTmp, curve)

  m.pathLength = travel * 1.02 // close enough for a gentle bow
  m.length = 7 + Math.random() * 5 // 7-12 units — long, frame-crossing arcs
  m.duration = 2.5 + Math.random() * 1.5
  m.elapsed = 0
  m.flickerSeed = Math.random() * 100
  m.headScale = 0.1 + Math.random() * 0.03
  m.special = Math.random() < 0.25
  m.active = true
}

function ease(t: number) {
  // Gentle ease-in: starts a touch slower, accelerates through flight.
  return Math.pow(t, 1.35)
}

interface ShootingStarsProps {
  reducedMotion: boolean
  /** Multiplies the spawn interval — 2 = roughly half as frequent. Default 1. */
  intervalMultiplier?: number
}

/**
 * A small pool of meteor streaks that fire periodically across the
 * sky, each on its own steep, gently bowed arc. The head follows a
 * quadratic bezier and the trail is a ribbon rebuilt every frame from
 * the section of that same bezier the head just travelled — so the
 * tail's curve IS the flight path, never a fake bend. Cool blue-white
 * gradient trails (one in ~4 carries a soft pink core), a small
 * flickering glow sprite at the head, frequency ramping gently with
 * scroll progress. A window click (ignoring clicks on real UI
 * controls) spawns one extra meteor.
 */
export function ShootingStars({ reducedMotion, intervalMultiplier = 1 }: ShootingStarsProps) {
  const trailRefs = useRef<(THREE.Mesh | null)[]>([])
  const headRefs = useRef<(THREE.Sprite | null)[]>([])
  const meteors = useRef<Meteor[]>(
    Array.from({ length: POOL_SIZE }, () => makeMeteor()),
  )
  const nextSpawnAt = useRef(reducedMotion ? Infinity : 2 + Math.random() * 2)
  const clock = useRef(0)
  const pendingSpawns = useRef(0)

  const ribbonGeometries = useMemo(
    () => Array.from({ length: POOL_SIZE }, () => createRibbonGeometry()),
    [],
  )
  const headTexture = useMemo(() => createHeadGlowTexture(), [])

  const trailMaterials = useMemo(
    () =>
      Array.from(
        { length: POOL_SIZE },
        () =>
          new THREE.ShaderMaterial({
            vertexShader: TRAIL_VERTEX,
            fragmentShader: TRAIL_FRAGMENT,
            uniforms: {
              uOpacity: { value: 0 },
              uSpecial: { value: 0 },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          }),
      ),
    [],
  )

  const headMaterials = useMemo(
    () =>
      Array.from(
        { length: POOL_SIZE },
        () =>
          new THREE.SpriteMaterial({
            map: headTexture,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [headTexture],
  )

  useEffect(() => {
    if (reducedMotion) return
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('a, button, input, textarea, select')) return
      pendingSpawns.current += 1
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [reducedMotion])

  useFrame((state, delta) => {
    clock.current += delta
    const { progress } = useScrollStore.getState()

    // Spawn cadence: 3-7s at rest, ramping faster as the page scrolls.
    const baseInterval = MathLerp(5.5, 2.6, Math.min(progress * 1.4, 1)) * intervalMultiplier
    if (!reducedMotion && clock.current >= nextSpawnAt.current) {
      const slot = meteors.current.find((m) => !m.active)
      if (slot) spawnMeteor(slot)
      nextSpawnAt.current = clock.current + baseInterval * (0.7 + Math.random() * 0.6)
    }

    while (pendingSpawns.current > 0) {
      const slot = meteors.current.find((m) => !m.active)
      if (slot) spawnMeteor(slot)
      pendingSpawns.current -= 1
    }

    meteors.current.forEach((m, i) => {
      const trail = trailRefs.current[i]
      const trailMat = trailMaterials[i]
      const head = headRefs.current[i]
      const headMat = headMaterials[i]
      const geo = ribbonGeometries[i]
      if (!trail || !trailMat || !head || !headMat) return

      if (!m.active) {
        trailMat.uniforms.uOpacity.value = 0
        headMat.opacity = 0
        return
      }

      m.elapsed += delta
      const t = MathClamp01(m.elapsed / m.duration)
      if (t >= 1) {
        m.active = false
        trailMat.uniforms.uOpacity.value = 0
        headMat.opacity = 0
        return
      }

      // Head parameter along the bezier; the trail spans the stretch of
      // path just travelled, clamped at the spawn point.
      const headT = ease(t)
      const spanT = m.length / m.pathLength
      const tailT = Math.max(0, headT - spanT)

      const posAttr = geo.attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let s = 0; s <= TRAIL_SEGMENTS; s++) {
        const u = s / TRAIL_SEGMENTS // 0 tail .. 1 head
        const pathT = tailT + (headT - tailT) * u
        bezierAt(m, pathT, _bezierTmp)
        bezierTangentAt(m, pathT, _tangentTmp)
        // Width perpendicular to the local direction of travel, kept in
        // the screen-ish plane (z flattened — trails are near-planar).
        _perpTmp.set(-_tangentTmp.y, _tangentTmp.x, 0).normalize()
        const halfWidth = 0.28 * Math.pow(u, 1.7) * 0.55
        const base = s * 6
        arr[base] = _bezierTmp.x + _perpTmp.x * halfWidth
        arr[base + 1] = _bezierTmp.y + _perpTmp.y * halfWidth
        arr[base + 2] = _bezierTmp.z
        arr[base + 3] = _bezierTmp.x - _perpTmp.x * halfWidth
        arr[base + 4] = _bezierTmp.y - _perpTmp.y * halfWidth
        arr[base + 5] = _bezierTmp.z
      }
      posAttr.needsUpdate = true
      geo.computeBoundingSphere()

      trailMat.uniforms.uSpecial.value = m.special ? 1 : 0

      // Head sprite rides exactly at the tip of the flight path.
      bezierAt(m, headT, _bezierTmp)
      head.position.copy(_bezierTmp)

      // Trail fades in fast, holds, and lags slightly behind the head
      // as it burns out — the tail lingers a beat after the head dies.
      const trailFadeIn = MathClamp01(t / 0.1)
      const trailFadeOut = 1 - MathClamp01((t - 0.72) / 0.32)
      trailMat.uniforms.uOpacity.value = Math.min(trailFadeIn, trailFadeOut)

      const headFadeIn = MathClamp01(t / 0.06)
      const headFadeOut = 1 - MathClamp01((t - 0.6) / 0.24)
      const flicker = 0.9 + 0.1 * Math.sin(state.clock.elapsedTime * 42 + m.flickerSeed)
      headMat.opacity = Math.min(headFadeIn, headFadeOut) * flicker
      const headScale =
        m.headScale * (0.9 + 0.1 * Math.sin(state.clock.elapsedTime * 30 + m.flickerSeed))
      head.scale.set(headScale, headScale, 1)
    })
  })

  return (
    <group>
      {trailMaterials.map((mat, i) => (
        <mesh
          key={`trail-${i}`}
          ref={(el) => {
            trailRefs.current[i] = el
          }}
          geometry={ribbonGeometries[i]}
          material={mat}
          frustumCulled={false}
        />
      ))}
      {headMaterials.map((mat, i) => (
        <sprite
          key={`head-${i}`}
          ref={(el) => {
            headRefs.current[i] = el
          }}
          material={mat}
          scale={[0.11, 0.11, 1]}
        />
      ))}
    </group>
  )
}

function MathClamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

function MathLerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
