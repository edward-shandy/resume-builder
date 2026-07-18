import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MathUtils } from 'three'
import { useScrollStore } from '../../../store/scrollStore'

const NEBULA_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const NEBULA_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 st) {
    float value = 0.0;
    float amp = 0.55;
    for (int i = 0; i < 4; i++) {
      value += amp * noise(st);
      st *= 2.0;
      amp *= 0.55;
    }
    return value;
  }

  void main() {
    vec2 st = vUv * 3.0;
    float drift = uTime * 0.03;
    float n1 = fbm(st + vec2(drift, -drift * 0.6));
    float n2 = fbm(st * 1.4 - vec2(drift * 0.4, drift));

    vec3 color = mix(uColorA, uColorB, n1);
    color = mix(color, uColorC, n2 * 0.5);

    float dist = distance(vUv, vec2(0.5));
    float radial = smoothstep(0.55, 0.0, dist);
    float alpha = radial * (n1 * 0.6 + n2 * 0.4) * uOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`

/**
 * The CTA anchor: a soft procedural aurora/nebula cloud, faded in only
 * while the CTA panel is active — the page's one moment of color
 * bloom, echoing "launch" without breaking the calm night palette.
 */
export function Nebula() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uColorA: { value: new THREE.Color('#1b2a5e') },
      uColorB: { value: new THREE.Color('#7c6fe8') },
      uColorC: { value: new THREE.Color('#4fd1c5') },
    }),
    [],
  )

  useFrame((state) => {
    const mat = materialRef.current
    if (!mat) return
    mat.uniforms.uTime.value = state.clock.elapsedTime

    const { activeSection } = useScrollStore.getState()
    const target = activeSection === 'cta' ? 1 : 0
    mat.uniforms.uOpacity.value = MathUtils.lerp(mat.uniforms.uOpacity.value, target, 0.03)
  })

  return (
    <mesh position={[0, 0.4, -9]}>
      <planeGeometry args={[16, 12]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={NEBULA_VERTEX}
        fragmentShader={NEBULA_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
