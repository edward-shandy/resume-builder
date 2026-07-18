import { SceneLights } from './lights/SceneLights'
import { ScrollCameraRig } from './camera/ScrollCameraRig'
import { Starfield } from './objects/Starfield'
import { ShootingStars } from './objects/ShootingStars'
import { Moon } from './objects/Moon'
import { Constellation } from './objects/Constellation'
import { Nebula } from './objects/Nebula'
import { HorizonGradient } from './objects/HorizonGradient'

interface SceneProps {
  isMobile: boolean
  reducedMotion: boolean
  mode?: 'landing' | 'builder'
}

/**
 * Everything that lives inside the Canvas. Lazy-loaded as a unit by
 * CanvasRoot so the three.js/@react-three chunk doesn't block first
 * paint. A calm night sky: layered starfield, periodic shooting stars,
 * and one anchor element per section (moon / constellation / nebula)
 * that the camera drifts past as the page scrolls.
 *
 * In "builder" mode the sky becomes quiet ambient background rather
 * than a scroll-driven scene: no camera rig (static frame), no moon /
 * nebula / horizon anchors, a sparser starfield, and shooting stars at
 * roughly half the frequency — so it doesn't compete with the form and
 * live preview panes.
 */
export default function Scene({ isMobile, reducedMotion, mode = 'landing' }: SceneProps) {
  const isBuilder = mode === 'builder'

  return (
    <>
      <SceneLights />
      {!isBuilder && <ScrollCameraRig reducedMotion={reducedMotion} />}
      {!isBuilder && <HorizonGradient />}
      <Starfield isMobile={isMobile || isBuilder} />
      <ShootingStars reducedMotion={reducedMotion} intervalMultiplier={isBuilder ? 2 : 1} />
      {!isBuilder && <Moon />}
      {!isBuilder && <Constellation />}
      {!isBuilder && <Nebula />}
    </>
  )
}
