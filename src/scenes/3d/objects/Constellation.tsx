import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MathUtils } from 'three'
import { useScrollStore } from '../../../store/scrollStore'

// A five-point star outline, traced as one connected path — reads as
// an abstract constellation while doubling as a "you're on the right
// track" star motif for a resume-building product.
function buildStarPath(points: number, outerR: number, innerR: number) {
  const path: THREE.Vector3[] = []
  const total = points * 2
  for (let i = 0; i <= total; i++) {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    path.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0))
  }
  return path
}

/**
 * The Features anchor: a constellation that traces itself in as the
 * section scrolls into view, using BufferGeometry.setDrawRange to
 * reveal the connected path (and its star-node points) in lockstep —
 * cheap, no custom shader needed for the reveal itself.
 */
export function Constellation() {
  const groupRef = useRef<THREE.Group>(null)

  const path = useMemo(() => buildStarPath(5, 1.5, 0.62), [])
  const vertexCount = path.length

  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(path)
    geo.setDrawRange(0, 0)
    const mat = new THREE.LineBasicMaterial({
      color: '#ffd98e',
      transparent: true,
      opacity: 0,
    })
    return new THREE.Line(geo, mat)
  }, [path])

  const points = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(path)
    geo.setDrawRange(0, 0)
    const mat = new THREE.PointsMaterial({
      color: '#f8f9ff',
      size: 5,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return new THREE.Points(geo, mat)
  }, [path])

  useFrame((state) => {
    const { progress, activeSection } = useScrollStore.getState()

    // Local reveal window: traces in across the Features section.
    const t = MathUtils.clamp(MathUtils.mapLinear(progress, 0.24, 0.42, 0, 1), 0, 1)
    const count = Math.floor(t * vertexCount)
    ;(line.geometry as THREE.BufferGeometry).setDrawRange(0, count)
    ;(points.geometry as THREE.BufferGeometry).setDrawRange(0, count)

    const targetOpacity = activeSection === 'features' ? 1 : 0.35
    const lineMat = line.material as THREE.LineBasicMaterial
    lineMat.opacity = MathUtils.lerp(lineMat.opacity, targetOpacity, 0.05)

    const group = groupRef.current
    if (group) {
      group.rotation.z = Math.sin(state.clock.elapsedTime * 0.04) * 0.04
      group.rotation.y = Math.cos(state.clock.elapsedTime * 0.03) * 0.06
    }
  })

  return (
    <group ref={groupRef} position={[-2.8, 0.4, -3]}>
      <primitive object={line} />
      <primitive object={points} />
    </group>
  )
}
