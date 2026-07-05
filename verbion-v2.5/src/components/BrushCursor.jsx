import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Painterly cursor: a morphing blob that follows the mouse over
// sections marked [data-brush], revealing inverted colors beneath
// it via backdrop-filter.
export default function BrushCursor() {
  const blobRef = useRef(null)

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (coarse || reduced) return undefined

    const blob = blobRef.current
    const xTo = gsap.quickTo(blob, 'x', { duration: 0.45, ease: 'power3.out' })
    const yTo = gsap.quickTo(blob, 'y', { duration: 0.45, ease: 'power3.out' })

    let lastX = 0
    let lastY = 0
    let lastT = performance.now()
    let active = false

    const onMove = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)

      const now = performance.now()
      const dt = Math.max(now - lastT, 1)
      const v = Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt
      lastX = e.clientX
      lastY = e.clientY
      lastT = now

      const over = !!e.target.closest?.('[data-brush]')
      if (over !== active) {
        active = over
        gsap.to(blob, { opacity: over ? 1 : 0, duration: 0.35, ease: 'power2.out' })
        document.body.classList.toggle('brush-active', over)
      }
      if (over) {
        gsap.to(blob, {
          scale: 1 + Math.min(v * 0.35, 0.55),
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }
    }

    const onLeave = () => {
      active = false
      gsap.to(blob, { opacity: 0, duration: 0.3 })
      document.body.classList.remove('brush-active')
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.body.classList.remove('brush-active')
    }
  }, [])

  return <div ref={blobRef} className="brush-cursor" aria-hidden="true" />
}
