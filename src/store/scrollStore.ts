import { create } from 'zustand'

export type SectionId = 'hero' | 'features' | 'how-it-works' | 'cta' | 'footer'

interface ScrollState {
  /** 0..1 progress of the full page scroll (master ScrollTrigger). */
  progress: number
  /** Which section is currently considered "active" for 3D reactions. */
  activeSection: SectionId
}

/**
 * Plain zustand store — deliberately NOT subscribed to inside useFrame().
 * ScrollOrchestrator (DOM/GSAP side) writes to it via setState on every
 * scroll tick. R3F objects read scrollStore.getState() inside useFrame
 * so we never trigger a React re-render per animation frame.
 */
export const useScrollStore = create<ScrollState>(() => ({
  progress: 0,
  activeSection: 'hero',
}))
