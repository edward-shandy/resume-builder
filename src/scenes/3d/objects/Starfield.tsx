import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollStore } from '../../../store/scrollStore'

const STAR_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vPhase;
  uniform float uTime;

  void main() {
    vColor = aColor;
    vPhase = aPhase;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (110.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const STAR_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vPhase;
  uniform float uTime;
  uniform float uTwinkleSpeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    // Tight bright core with a short soft skirt — reads as a pinpoint
    // star, not an out-of-focus bokeh blob.
    float falloff = smoothstep(0.5, 0.12, d);
    falloff *= falloff;
    float twinkle = 0.55 + 0.45 * sin(uTime * uTwinkleSpeed + vPhase);
    float alpha = falloff * twinkle;
    gl_FragColor = vec4(vColor, alpha);
  }
`

const PALETTE = [
  new THREE.Color('#f8f9ff'), // starlight white — majority
  new THREE.Color('#f8f9ff'),
  new THREE.Color('#cdd6ff'), // pale blue
  new THREE.Color('#ffe9c2'), // pale gold — sparse
]

interface StarLayerProps {
  count: number
  radius: number
  depth: number
  size: number
  twinkleSpeed: number
  driftSpeed: number
  parallax: number
}

function StarLayer({ count, radius, depth, size, twinkleSpeed, driftSpeed, parallax }: StarLayerProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const [positions, colors, sizes, phases] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = radius * (0.4 + Math.random() * 0.6)
      positions[i * 3] = Math.cos(theta) * r
      positions[i * 3 + 1] = (Math.random() - 0.35) * radius * 0.7
      positions[i * 3 + 2] = -depth * Math.random() - 5

      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      sizes[i] = size * (0.5 + Math.random() * 0.9)
      phases[i] = Math.random() * Math.PI * 2
    }

    return [positions, colors, sizes, phases]
  }, [count, radius, depth, size])

  useFrame((state, delta) => {
    const mat = materialRef.current
    if (mat) mat.uniforms.uTime.value = state.clock.elapsedTime

    const points = pointsRef.current
    if (!points) return
    points.rotation.y += delta * driftSpeed
    const { progress } = useScrollStore.getState()
    points.rotation.x = -0.05 + progress * parallax
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={STAR_VERTEX}
        fragmentShader={STAR_FRAGMENT}
        uniforms={{
          uTime: { value: 0 },
          uTwinkleSpeed: { value: twinkleSpeed },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

interface StarfieldProps {
  isMobile: boolean
}

/**
 * Three parallax layers of twinkling stars — near (bigger, faster
 * twinkle, fewer), mid, and far (tiny, dense, slow). Each layer drifts
 * at a different rotation speed for a subtle depth-of-field parallax,
 * and tilts slightly with scroll progress so the whole sky feels like
 * it's turning overhead as you read.
 */
export function Starfield({ isMobile }: StarfieldProps) {
  const scale = isMobile ? 0.55 : 1

  return (
    <>
      <StarLayer
        count={Math.round(180 * scale)}
        radius={9}
        depth={4}
        size={1.7}
        twinkleSpeed={1.6}
        driftSpeed={0.006}
        parallax={0.4}
      />
      <StarLayer
        count={Math.round(320 * scale)}
        radius={16}
        depth={10}
        size={1.2}
        twinkleSpeed={1.0}
        driftSpeed={0.003}
        parallax={0.2}
      />
      <StarLayer
        count={Math.round(420 * scale)}
        radius={26}
        depth={18}
        size={0.8}
        twinkleSpeed={0.6}
        driftSpeed={0.0015}
        parallax={0.08}
      />
    </>
  )
}
