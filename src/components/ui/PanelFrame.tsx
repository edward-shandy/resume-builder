import type { ReactNode } from 'react'

interface PanelFrameProps {
  children: ReactNode
  className?: string
}

/**
 * Soft glassmorphism backing for text that needs to stay readable over
 * the night-sky scene: a translucent navy tint, a hairline white
 * border, and a heavy backdrop blur. This is where WCAG contrast is
 * enforced — everything important sits inside one of these.
 */
export function PanelFrame({ children, className = '' }: PanelFrameProps) {
  return <div className={`glass-panel relative ${className}`}>{children}</div>
}
