import { CanvasRoot } from '../scenes/3d/CanvasRoot'
import { ScrollOrchestrator } from '../gsap/ScrollOrchestrator'
import { Navbar } from '../components/layout/Navbar'
import { ScrollProgressBar } from '../components/layout/ScrollProgressBar'
import { RouteTransition } from '../components/layout/RouteTransition'
import { GuidingCursor } from '../components/layout/GuidingCursor'
import { Hero } from '../sections/Hero/Hero'
import { Features } from '../sections/Features/Features'
import { HowItWorks } from '../sections/HowItWorks/HowItWorks'
import { CTA } from '../sections/CTA/CTA'
import { Footer } from '../sections/Footer/Footer'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useIsMobile'

function LandingPage() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  return (
    <>
      <CanvasRoot isMobile={isMobile} reducedMotion={reducedMotion} mode="landing" />
      <ScrollOrchestrator />
      <GuidingCursor />

      {/* fixed-position elements stay OUTSIDE RouteTransition — a
          transformed ancestor becomes their containing block and
          anchors them to the wrapper instead of the viewport. */}
      <ScrollProgressBar />
      <Navbar />

      <RouteTransition>
        <main className="relative z-10">
          <Hero />
          <Features />
          <HowItWorks />
          <CTA />
          <Footer />
        </main>
      </RouteTransition>
    </>
  )
}

export default LandingPage
