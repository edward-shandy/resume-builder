import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { MathUtils } from 'three'
import { useScrollStore } from '../../../store/scrollStore'

const MOON_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vTangent;
  varying vec3 vBitangent;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    // Sphere tangent frame (equirect parametrization) for bump mapping.
    // Degenerate only at the poles, which stay out of view.
    vec3 t = normalize(cross(vec3(0.0, 1.0, 0.0), normal));
    vTangent = normalize(mat3(modelMatrix) * t);
    vBitangent = normalize(cross(vNormal, vTangent));
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Real NASA LRO surface: albedo from the LROC color mosaic, crater
// relief bump-mapped from the LDEM elevation map (finite differences),
// so crater rims genuinely catch the light and their floors fall into
// shadow along the terminator — the photo look, not procedural noise.
const MOON_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vTangent;
  varying vec3 vBitangent;
  varying vec3 vWorldPosition;

  uniform float uOpacity;
  uniform vec3 uLightDir;
  uniform sampler2D uColorMap;
  uniform sampler2D uDispMap;

  void main() {
    vec3 geoNormal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDir);

    // -- Bump normal from the elevation map.
    float texel = 1.0 / 1024.0;
    float h = texture2D(uDispMap, vUv).r;
    float hx = texture2D(uDispMap, vUv + vec2(texel, 0.0)).r - h;
    float hy = texture2D(uDispMap, vUv + vec2(0.0, texel)).r - h;
    float bumpStrength = 14.0;
    vec3 normal = normalize(
      geoNormal - (vTangent * hx + vBitangent * hy) * bumpStrength
    );

    // -- Albedo: real surface photo, tinted warm gold like a low moon.
    vec3 albedo = texture2D(uColorMap, vUv).rgb;
    albedo = pow(albedo, vec3(0.9)); // lift mids slightly
    // Cool blue moonlight (A/B: gold vec3(1.18,0.97,0.66), silver vec3(1.08,1.09,1.12))
    vec3 warmTint = vec3(0.98, 1.08, 1.28);
    vec3 surface = albedo * warmTint;

    // -- Terminator: soft lambert falloff on the bumped normal, so
    // crater relief pops exactly along the light/shadow boundary.
    float ndotl = dot(normal, lightDir);
    float lit = smoothstep(-0.08, 0.18, ndotl);

    // -- Earthshine: the dark side stays faintly readable, cool-tinted.
    vec3 earthshine = vec3(0.5, 0.56, 0.82) * 0.12;

    float litBoost = clamp(lit * 1.3, 0.0, 1.4);
    vec3 color = surface * litBoost + earthshine * (1.0 - lit * 0.6);

    // -- Rim: a full moon's limb glows into its halo rather than
    // darkening — swap limb darkening for a faint cool rim light.
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, geoNormal), 0.0), 2.2);
    color += vec3(0.72, 0.82, 1.0) * fresnel * 0.35 * lit;

    gl_FragColor = vec4(color, uOpacity);
  }
`

// Scroll-driven phase: the moon opens FULL at the top of the page, then
// the light swings behind it as the user scrolls through the Hero — the
// moon wanes to a thin crescent before fading out.
const CRESCENT_DIR = new THREE.Vector3(0.85, 0.28, -0.38).normalize()
const FULL_DIR = new THREE.Vector3(0.25, 0.22, 0.95).normalize()
const _lightTmp = new THREE.Vector3()

function createGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    // Luminous blue halo — big soft bloom like a full moon over water
    // (A/B: gold 255,223,158 @0.34; silver 232,238,255 @0.34)
    gradient.addColorStop(0, 'rgba(214,230,255,0.6)')
    gradient.addColorStop(0.3, 'rgba(170,200,255,0.22)')
    gradient.addColorStop(0.65, 'rgba(140,175,255,0.08)')
    gradient.addColorStop(1, 'rgba(140,175,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
  }
  return new THREE.CanvasTexture(canvas)
}

/**
 * The Hero's anchor: a real-surface moon. Albedo + crater relief come
 * from NASA's CGI Moon Kit (LROC color mosaic + LDEM elevation, public
 * domain) bump-mapped in the shader, lit by a genuine lambert
 * terminator so crater rims flare and floors shadow right at the
 * light/dark boundary — reading as a bright golden crescent. The dark
 * side keeps a faint cool earthshine. Writes depth while visible so
 * stars/meteors behind it are occluded, and fades out as the page
 * scrolls past Hero.
 */
export function Moon() {
  const groupRef = useRef<THREE.Group>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
  const moonMatRef = useRef<THREE.ShaderMaterial>(null)
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null)

  const [colorMap, dispMap] = useTexture([
    '/textures/moon-color.jpg',
    '/textures/moon-displacement.jpg',
  ])

  const glowTexture = useMemo(() => createGlowTexture(), [])

  const uniforms = useMemo(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace
    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping
    dispMap.wrapS = dispMap.wrapT = THREE.RepeatWrapping
    return {
      uOpacity: { value: 1 },
      uLightDir: { value: FULL_DIR.clone() },
      uColorMap: { value: colorMap },
      uDispMap: { value: dispMap },
    }
  }, [colorMap, dispMap])

  useFrame((state) => {
    const { progress } = useScrollStore.getState()
    // Phase completes first (0 -> 0.14: crescent grows to full), THEN the
    // moon fades out (0.15 -> 0.28) — so the "aging" reads before it goes.
    const phaseT = MathUtils.smoothstep(progress, 0, 0.14)
    const visibility = 1 - MathUtils.clamp(MathUtils.mapLinear(progress, 0.15, 0.28, 0, 1), 0, 1)

    if (moonMatRef.current) {
      moonMatRef.current.uniforms.uOpacity.value = visibility
      const lightDir = moonMatRef.current.uniforms.uLightDir.value as THREE.Vector3
      _lightTmp.copy(FULL_DIR).lerp(CRESCENT_DIR, phaseT).normalize()
      lightDir.copy(_lightTmp)
      // While visible the moon writes depth so stars/trails/nebula
      // behind it are occluded; once faded it stops, so it no longer
      // punches an invisible hole in the sky.
      moonMatRef.current.depthWrite = visibility > 0.05
    }
    // Halo dims as the moon wanes — luminous at full, faint by crescent.
    if (glowMatRef.current) {
      glowMatRef.current.opacity = visibility * MathUtils.lerp(0.85, 0.4, phaseT)
    }

    // Surface rotation belongs to the SPHERE only — rotating the group
    // would turn the billboard glow plane edge-on over time.
    if (sphereRef.current) sphereRef.current.rotation.y += 0.0006
    const group = groupRef.current
    if (group) {
      group.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.025
    }
  })

  return (
    <group ref={groupRef} position={[2.6, 2.2, -6]}>
      {/* Glow halo — tight, dim, warmed to match the golden crescent.
          depthTest off so the sphere's depth (written for star occlusion)
          doesn't clip the halo into a semicircle. */}
      <mesh renderOrder={1}>
        <planeGeometry args={[6.2, 6.2]} />
        <meshBasicMaterial
          ref={glowMatRef}
          map={glowTexture}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* The moon itself */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          ref={moonMatRef}
          vertexShader={MOON_VERTEX}
          fragmentShader={MOON_FRAGMENT}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

useTexture.preload('/textures/moon-color.jpg')
useTexture.preload('/textures/moon-displacement.jpg')
