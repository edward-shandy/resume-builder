import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CatmullRomCurve3, Vector3 } from 'three'
import { useScrollStore } from '../../../store/scrollStore'

interface ScrollCameraRigProps {
  reducedMotion: boolean
}

// One keyframe per section (Hero, Features, How It Works, CTA, Footer).
// Approximate — sections aren't exactly equal height, but this reads as
// a continuous cinematic drift through the night sky rather than a
// literal per-section snap. Each position/look pair roughly frames that
// section's anchor element (moon, constellation, wide starfield, nebula).
const POSITION_KEYFRAMES = [
  new Vector3(0.5, 0.6, 5.0), // Hero — wide, drifting toward the moon
  new Vector3(-1.6, 0.9, 3.2), // Features — drift left toward the constellation
  new Vector3(0, 1.8, 6.5), // How It Works — pull back, wide starfield view
  new Vector3(1.8, 0.7, 4.0), // CTA — angled toward the nebula bloom
  new Vector3(0, 0.9, 8.5), // Footer — settle back, calm
]

const LOOK_KEYFRAMES = [
  new Vector3(1.4, 1.3, -3),
  new Vector3(-2.0, 0.5, -2.5),
  new Vector3(0, 0.3, -5),
  new Vector3(0, 0.4, -7),
  new Vector3(0, 0.2, -2),
]

const DAMP = 4 // higher = snappier follow, lower = more trailing "cinematic" lag

export function ScrollCameraRig({ reducedMotion }: ScrollCameraRigProps) {
  const { camera } = useThree()

  const positionCurve = useMemo(
    () => new CatmullRomCurve3(POSITION_KEYFRAMES, false, 'catmullrom', 0.5),
    [],
  )
  const lookCurve = useMemo(
    () => new CatmullRomCurve3(LOOK_KEYFRAMES, false, 'catmullrom', 0.5),
    [],
  )

  const targetPos = useMemo(() => new Vector3(), [])
  const targetLook = useMemo(() => new Vector3(), [])
  const currentLook = useMemo(() => LOOK_KEYFRAMES[0].clone(), [])

  useFrame((_, delta) => {
    const t = reducedMotion ? 0 : useScrollStore.getState().progress

    positionCurve.getPoint(t, targetPos)
    lookCurve.getPoint(t, targetLook)

    const lerpFactor = reducedMotion ? 1 : 1 - Math.exp(-DAMP * delta)
    camera.position.lerp(targetPos, lerpFactor)
    currentLook.lerp(targetLook, lerpFactor)
    camera.lookAt(currentLook)
  })

  return null
}
