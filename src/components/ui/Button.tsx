import {
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useGSAP } from '@gsap/react'
import { Link } from 'react-router'
import { gsap } from '../../gsap/gsapConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface SharedProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  /** 'md' (default) matches the landing page; 'sm' is a denser wizard-scale button. */
  size?: 'md' | 'sm'
  className?: string
}

type AnchorProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & {
    /** In-page hash target ("#features"). Renders an <a> and smooth-scrolls to it. */
    href: string
  }

type ButtonElProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined
  }

type ButtonProps = AnchorProps | ButtonElProps

/**
 * Soft, starlit action element. Hover/press feedback is a small GSAP
 * timeline scoped to the root node — deliberately separate from the
 * scroll-driven ScrollOrchestrator timelines.
 *
 * Polymorphic on purpose: pass `href="#section"` for in-page navigation
 * (renders a semantic <a>, smooth-scrolls on click) or omit it for a
 * plain action button (renders a <button>, fires onClick as normal).
 */
export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className = '' } = props
  const rootRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()

  const { contextSafe } = useGSAP({ scope: rootRef })

  const onEnter = contextSafe(() => {
    if (isDisabled) return
    gsap.to(glowRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' })
    if (!reducedMotion) {
      gsap.to(rootRef.current, { y: -2, duration: 0.25, ease: 'power2.out' })
    }
  })

  const onLeave = contextSafe(() => {
    gsap.to(glowRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
    gsap.to(rootRef.current, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' })
  })

  const onDown = contextSafe(() => {
    gsap.to(rootRef.current, {
      scale: reducedMotion ? 1 : 0.96,
      duration: 0.12,
      ease: 'power2.out',
    })
  })

  const onUp = contextSafe(() => {
    gsap.to(rootRef.current, { scale: 1, duration: 0.25, ease: 'back.out(3)' })
  })

  const isDisabled = 'disabled' in props && props.disabled

  const base =
    'relative inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold tracking-[0.01em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-gold cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0'

  const sizing = size === 'sm' ? 'px-5 py-2.5 text-sm' : 'px-7 py-3.5 text-sm'

  const skin =
    variant === 'primary'
      ? 'bg-gold text-ink'
      : 'bg-transparent text-white border border-white/25'

  const glow = (
    <span
      ref={glowRef}
      className="pointer-events-none absolute inset-0 rounded-full opacity-0"
      style={{
        boxShadow:
          variant === 'primary'
            ? '0 0 26px 4px color-mix(in srgb, var(--color-gold) 65%, transparent)'
            : '0 0 20px 2px color-mix(in srgb, var(--color-white) 30%, transparent)',
      }}
      aria-hidden="true"
    />
  )

  const sharedHandlers = {
    onPointerEnter: onEnter,
    onPointerLeave: onLeave,
    onPointerDown: onDown,
    onPointerUp: onUp,
  }

  if (props.href !== undefined) {
    const { href, onClick, ...rest } = props as AnchorProps

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (href.startsWith('#')) {
        const target = document.querySelector(href)
        if (target) {
          event.preventDefault()
          target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
        }
      }
      onClick?.(event)
    }

    // In-page hash links stay plain <a> (smooth-scroll above); anything
    // else is an app route, so hand it to react-router's <Link> for
    // client-side navigation instead of a full page reload.
    if (!href.startsWith('#')) {
      return (
        <Link
          ref={rootRef as React.RefObject<HTMLAnchorElement>}
          to={href}
          className={`${base} ${sizing} ${skin} ${className}`}
          onClick={onClick as never}
          {...sharedHandlers}
          {...(rest as Record<string, unknown>)}
        >
          {glow}
          <span className="relative z-10">{children}</span>
        </Link>
      )
    }

    return (
      <a
        ref={rootRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={`${base} ${sizing} ${skin} ${className}`}
        onClick={handleClick}
        {...sharedHandlers}
        {...rest}
      >
        {glow}
        <span className="relative z-10">{children}</span>
      </a>
    )
  }

  const { type = 'button', ...rest } = props as ButtonElProps

  return (
    <button
      ref={rootRef as React.RefObject<HTMLButtonElement>}
      type={type}
      className={`${base} ${sizing} ${skin} ${className}`}
      {...sharedHandlers}
      {...rest}
    >
      {glow}
      <span className="relative z-10">{children}</span>
    </button>
  )
}
