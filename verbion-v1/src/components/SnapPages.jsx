import { useRef, useState, useEffect, Children, cloneElement } from 'react'
import gsap from 'gsap'
import './SnapPages.css'

/**
 * Full-viewport page-snap container for post-hero sections.
 *
 * - Each child fills 100 vh and is stacked behind the active one.
 * - Wheel / arrow-key events trigger a GSAP slide transition.
 * - On page 0 + scroll-up the event is NOT consumed — Lenis carries
 *   the user back into the hero naturally.
 * - Dot indicators are fixed to the right edge.
 */
export function SnapPages({ children }) {
  const containerRef = useRef(null)
  const pageRefs     = useRef([])
  const currentRef   = useRef(0)
  const animating    = useRef(false)
  const [currentIdx, setCurrentIdx] = useState(0)

  const pages = Children.toArray(children)
  const total = pages.length

  // ── Initial stack positioning ────────────────────────────
  useEffect(() => {
    pageRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { yPercent: i === 0 ? 0 : 100, immediateRender: true })
    })
  }, [total])

  // ── Slide logic ──────────────────────────────────────────
  const goTo = (nextIdx, dir) => {
    if (animating.current) return false
    if (nextIdx < 0 || nextIdx >= total) return false

    animating.current = true
    const fromEl = pageRefs.current[currentRef.current]
    const toEl   = pageRefs.current[nextIdx]

    gsap.set(toEl, { yPercent: dir * 100 })

    gsap.timeline({
      defaults: { duration: 0.85, ease: 'power3.inOut' },
      onComplete: () => {
        animating.current = false
        currentRef.current = nextIdx
        setCurrentIdx(nextIdx)
      },
    })
      .to(fromEl, { yPercent: -dir * 100 })
      .to(toEl,   { yPercent: 0 }, 0)

    return true
  }

  // ── Wheel handler ────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onWheel = (e) => {
      const goingUp   = e.deltaY < 0
      const onFirst   = currentRef.current === 0

      // Let Lenis scroll back into the hero when on first page + scrolling up
      if (onFirst && goingUp) return

      e.preventDefault()
      e.stopPropagation()

      if (e.deltaY > 0) goTo(currentRef.current + 1,  1)
      else               goTo(currentRef.current - 1, -1)
    }

    // Arrow-key navigation (document-level)
    const onKey = (e) => {
      const inSnap = !!containerRef.current?.getBoundingClientRect().top === false ||
        window.scrollY >= (containerRef.current?.offsetTop ?? Infinity) - 10

      if (!inSnap) return
      if (e.key === 'ArrowDown') { e.preventDefault(); goTo(currentRef.current + 1,  1) }
      if (e.key === 'ArrowUp'  ) { e.preventDefault(); goTo(currentRef.current - 1, -1) }
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    document.addEventListener('keydown', onKey)
    return () => {
      container.removeEventListener('wheel', onWheel)
      document.removeEventListener('keydown', onKey)
    }
  }, [total])

  // ── Touch swipe ─────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let startY = 0
    const onTouchStart = (e) => { startY = e.touches[0].clientY }
    const onTouchEnd   = (e) => {
      const dy = startY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 40) return
      if (dy > 0) goTo(currentRef.current + 1,  1)
      else        goTo(currentRef.current - 1, -1)
    }
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend',   onTouchEnd)
    }
  }, [total])

  return (
    <div className="snap-pages" ref={containerRef}>

      {/* Pages stack */}
      {pages.map((page, i) => (
        <div
          key={i}
          className="snap-page"
          ref={(el) => { pageRefs.current[i] = el }}
        >
          {page}
        </div>
      ))}

      {/* Dot navigation */}
      <nav className="snap-dots" aria-label="Page navigation">
        {pages.map((_, i) => (
          <button
            key={i}
            className={`snap-dot${i === currentIdx ? ' snap-dot--active' : ''}`}
            onClick={() => goTo(i, i > currentRef.current ? 1 : -1)}
            aria-label={`Page ${i + 1}`}
          />
        ))}
      </nav>

    </div>
  )
}
