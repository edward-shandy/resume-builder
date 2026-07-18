import { useMemo } from 'react'
import * as THREE from 'three'

function createHorizonTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 256, 0, 0)
    gradient.addColorStop(0, 'rgba(27,42,94,0.55)')
    gradient.addColorStop(0.35, 'rgba(17,26,61,0.28)')
    gradient.addColorStop(1, 'rgba(10,14,31,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 8, 256)
  }
  return new THREE.CanvasTexture(canvas)
}

/**
 * A quiet navy glow low in the frame so the void doesn't read as pure
 * black — a hint of horizon under the stars, always present, never
 * competing with the section anchors above it.
 */
export function HorizonGradient() {
  const texture = useMemo(() => createHorizonTexture(), [])

  return (
    <mesh position={[0, -3.4, -10]} rotation={[0, 0, 0]}>
      <planeGeometry args={[30, 10]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}
