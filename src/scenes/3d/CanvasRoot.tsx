import { lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

const Scene = lazy(() => import('./Scene'))

interface CanvasRootProps {
  isMobile: boolean
  reducedMotion: boolean
  mode?: 'landing' | 'builder'
}

/**
 * Single, fixed, full-viewport <Canvas>. Sits behind all page content
 * (negative z-index) and never intercepts pointer events, so the DOM
 * layer above it stays fully interactive. The Scene (three.js + fiber
 * objects) is code-split and lazily loaded; while that chunk loads —
 * or on Suspense re-entry — a CSS gradient stands in so there's never
 * a blank flash.
 */
export function CanvasRoot({ isMobile, reducedMotion, mode = 'landing' }: CanvasRootProps) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <Suspense
        fallback={
          <div
            className="h-full w-full"
            style={{
              background:
                'radial-gradient(ellipse 90% 70% at 60% 30%, var(--color-navy) 0%, var(--color-ink) 65%)',
            }}
          />
        }
      >
        <Canvas
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0.5, 0.6, 5.0], fov: 45, near: 0.1, far: 80 }}
        >
          {/* Slight magenta undertone in the void — blue-violet night, not pure blue */}
          <color attach="background" args={['#0d0e26']} />
          <fog attach="fog" args={['#0d0e26', 10, 30]} />
          <Scene isMobile={isMobile} reducedMotion={reducedMotion} mode={mode} />
        </Canvas>
      </Suspense>
    </div>
  )
}
