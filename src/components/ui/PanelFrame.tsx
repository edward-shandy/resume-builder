import type { ReactNode, Ref } from 'react'

interface PanelFrameProps {
  children: ReactNode
  className?: string
  /** Optional ref onto the root panel node — used when a consumer (e.g. FeatureCard) needs to animate the panel itself separately from an inner tilt wrapper. */
  panelRef?: Ref<HTMLDivElement>
}

/**
 * Soft glassmorphism backing for text that needs to stay readable over
 * the night-sky scene: a translucent navy tint, a hairline white
 * border, and a heavy backdrop blur. This is where WCAG contrast is
 * enforced — everything important sits inside one of these.
 */
export function PanelFrame({ children, className = '', panelRef }: PanelFrameProps) {
  return (
    <div ref={panelRef} className={`glass-panel relative ${className}`}>
      {children}
    </div>
  )
}
