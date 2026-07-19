import { useRef } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  id?: string
}

/**
 * Themed slide toggle (gold when on) used to enable/disable an Extras
 * sub-section. The knob position is GSAP-tweened rather than relying on
 * the CSS transition alone, so it stays in sync with height-animated
 * siblings and respects reduced motion via a shorter duration.
 */
export function ToggleSwitch({ checked, onChange, label, id }: ToggleSwitchProps) {
  const knobRef = useRef<HTMLSpanElement>(null)
  const trackRef = useRef<HTMLButtonElement>(null)

  useGSAP(
    () => {
      if (!knobRef.current || !trackRef.current) return
      gsap.to(knobRef.current, {
        x: checked ? 18 : 0,
        duration: 0.28,
        ease: 'back.out(2)',
      })
      gsap.to(trackRef.current, {
        backgroundColor: checked ? 'var(--color-gold)' : 'rgba(255,255,255,0.12)',
        duration: 0.25,
        ease: 'power2.out',
      })
    },
    { scope: trackRef, dependencies: [checked] },
  )

  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 select-none">
      <button
        ref={trackRef}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border border-white/15 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-gold"
      >
        <span
          ref={knobRef}
          className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
        />
      </button>
      <span className="font-body text-sm font-medium text-white">{label}</span>
    </label>
  )
}
