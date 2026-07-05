import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// Pinned full-viewport section whose canvas scrubs a WebP frame
// sequence with scroll. Overlay tweens join the same scrubbed
// timeline via buildTimeline(tl) using positions 0..1.
export default function FrameScrubSection({
  id,
  frameBase,
  frameCount,
  pin = '+=150%',
  scrub = 1,
  poster = 0,
  fadeIn = false,
  fadeOut = false,
  brush = false,
  children,
  buildTimeline,
}) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const mediaRef = useRef(null)

  useGSAP(
    () => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const staticMode =
        window.matchMedia('(max-width: 767px)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const url = (i) => `${frameBase}/frame_${String(i).padStart(4, '0')}.webp`
      const images = new Array(frameCount).fill(null)
      const state = { frame: staticMode ? poster : 0 }

      const nearestLoaded = (i) => {
        if (images[i] && images[i].complete && images[i].naturalWidth) return images[i]
        for (let d = 1; d < frameCount; d++) {
          const lo = images[i - d]
          if (lo && lo.complete && lo.naturalWidth) return lo
          const hi = images[i + d]
          if (hi && hi.complete && hi.naturalWidth) return hi
        }
        return null
      }

      const draw = () => {
        const img = nearestLoaded(Math.round(state.frame))
        if (!img) return
        const cw = canvas.width
        const ch = canvas.height
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
        const w = img.naturalWidth * scale
        const h = img.naturalHeight * scale
        ctx.clearRect(0, 0, cw, ch)
        ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
      }

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
        canvas.width = Math.round(canvas.clientWidth * dpr)
        canvas.height = Math.round(canvas.clientHeight * dpr)
        draw()
      }
      resize()
      window.addEventListener('resize', resize)

      const load = (i) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => {
          if (Math.abs(i - Math.round(state.frame)) < 2 || i === poster) draw()
        }
        img.src = url(i)
        images[i] = img
      }
      if (staticMode) {
        load(poster)
      } else {
        for (let i = 0; i < frameCount; i++) load(i)
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: pin,
          scrub,
          pin: true,
          anticipatePin: 1,
        },
      })
      if (staticMode) {
        tl.to({}, { duration: 1 }, 0)
      } else {
        tl.to(
          state,
          { frame: frameCount - 1, duration: 1, snap: 'frame', onUpdate: draw },
          0,
        )
      }
      if (fadeIn && !staticMode) {
        tl.fromTo(mediaRef.current, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0)
      }
      if (fadeOut && !staticMode) {
        tl.to(mediaRef.current, { opacity: 0, duration: 0.06 }, 0.94)
      }
      buildTimeline?.(tl)

      return () => window.removeEventListener('resize', resize)
    },
    { scope: sectionRef },
  )

  return (
    <section id={id} ref={sectionRef} className="scrub-section" data-brush={brush || undefined}>
      <div ref={mediaRef} className="scrub-media">
        <canvas ref={canvasRef} className="scrub-canvas" />
        <div className="scrub-vignette" />
      </div>
      <div className="scrub-overlay">{children}</div>
    </section>
  )
}
