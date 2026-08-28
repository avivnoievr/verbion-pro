import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// The one element that crosses the ENTIRE page (one-page method §3.4):
// a single cold cyan wire, fixed to the viewport, three screens tall.
// Across the whole document it draws itself in while drifting upward,
// meandering through the heart of every scene — bottle, ring corner,
// atom, engine, dock ring, finale slab. One element, one owner, never
// recreated per section.
export default function ColdThread() {
  const wrapRef = useRef(null)
  const pathRef = useRef(null)

  useGSAP(() => {
    const path = pathRef.current
    const len = path.getTotalLength()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set(path, { strokeDasharray: 'none' })
      return
    }
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    })
      .to(path, { strokeDashoffset: 0, duration: 1 }, 0)
      .to(wrapRef.current, { yPercent: -66.7, duration: 1 }, 0)
  })

  return (
    <div className="cold-thread" ref={wrapRef} aria-hidden="true">
      <svg viewBox="0 0 100 300" preserveAspectRatio="none">
        <path
          ref={pathRef}
          d="M58,-2
             C55,14 42,22 40,34
             C38,46 24,54 21,66
             C18,78 40,90 50,102
             C60,114 66,128 64,142
             C62,156 52,166 50,178
             C48,190 42,204 44,218
             C46,232 52,244 50,258
             C48,272 50,286 50,302"
        />
      </svg>
    </div>
  )
}
