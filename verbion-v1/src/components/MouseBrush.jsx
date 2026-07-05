import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const BLOB_PATH =
  'M62,4 C85,8 108,28 106,54 C104,80 84,102 60,106 C36,110 10,94 4,70 C-2,46 10,18 30,8 C42,2 52,1 62,4Z'

/**
 * Organic cursor brush. Uses GSAP x/y (which include px automatically)
 * so the element stays correctly positioned regardless of CSS variable unit issues.
 */
export function MouseBrush({ containerRef, blendMode = 'difference', color = '#ffffff', size = 160 }) {
  const blobRef = useRef(null)

  useEffect(() => {
    const blob = blobRef.current
    if (!blob) return

    // GSAP x/y animate translateX/translateY directly with px units
    const xTo = gsap.quickTo(blob, 'x', { duration: 0.12, ease: 'power2.out' })
    const yTo = gsap.quickTo(blob, 'y', { duration: 0.12, ease: 'power2.out' })

    // Start far off-screen
    gsap.set(blob, { x: -9999, y: -9999 })

    const container = containerRef?.current ?? document.body

    const onMove = (e) => {
      const rect = container.getBoundingClientRect()
      xTo(e.clientX - rect.left - size / 2)
      yTo(e.clientY - rect.top - size / 2)
    }

    const onEnter = () => { blob.style.opacity = '1' }
    const onLeave = () => { blob.style.opacity = '0' }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)

    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [containerRef, size])

  return (
    <div
      ref={blobRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        pointerEvents: 'none',
        mixBlendMode: blendMode,
        zIndex: 100,
        opacity: 0,
        transition: 'opacity 0.25s ease',
        willChange: 'transform',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        style={{ display: 'block', animation: 'brush-morph 6s ease-in-out infinite' }}
      >
        <defs>
          <style>{`
            @keyframes brush-morph {
              0%,100% { d: path("${BLOB_PATH}"); }
              33%      { d: path("M55,2 C82,4 112,24 110,56 C108,88 80,108 54,110 C28,112 4,90 2,62 C0,34 16,8 38,3 C46,1 48,1 55,2Z"); }
              66%      { d: path("M66,6 C92,12 106,40 102,66 C98,92 72,108 46,106 C20,104 2,82 2,58 C2,34 18,10 44,4 C54,1 58,2 66,6Z"); }
            }
          `}</style>
        </defs>
        <path d={BLOB_PATH} fill={color} />
      </svg>
    </div>
  )
}
