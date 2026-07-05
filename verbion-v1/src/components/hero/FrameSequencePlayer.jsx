import { useEffect, useRef } from 'react'

/**
 * Renders a scroll-scrubbed WebP frame sequence on a <canvas>.
 *
 * Props:
 *   frameDir      — public path prefix, e.g. '/frames/clip1'
 *   frameCount    — total number of frames (0 = nothing loads, safe for shell state)
 *   scrollProgress — mutable ref whose .current tracks 0→1 scroll position
 *   style         — optional style overrides for the canvas element
 */
export function FrameSequencePlayer({ frameDir, frameCount, scrollProgress, style }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef({ frames: [], lastIdx: -1 })

  // ── Load frames ────────────────────────────────────────────────────────────
  useEffect(() => {
    const state = stateRef.current
    state.frames  = []
    state.lastIdx = -1

    if (frameCount === 0) return

    for (let i = 0; i < frameCount; i++) {
      const img = new Image()
      img.src = `${frameDir}/frame_${String(i + 1).padStart(4, '0')}.webp`
      state.frames.push(img)
    }

    return () => { state.frames = [] }
  }, [frameDir, frameCount])

  // ── Draw loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const { frames, lastIdx } = stateRef.current
      if (frames.length === 0) return

      // Index based on TOTAL frame count — never shrinks while images load
      const targetIdx = Math.min(
        Math.round(scrollProgress.current * (frames.length - 1)),
        frames.length - 1,
      )

      // Resize canvas to match CSS display size — clears the canvas
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      let needsRedraw = false
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w
        canvas.height = h
        needsRedraw   = true
      }

      // Walk back from target to find nearest already-decoded frame.
      // This prevents the "freeze on skip" when a frame isn't ready yet.
      let idx = targetIdx
      while (idx >= 0 && (!frames[idx]?.complete || !frames[idx].naturalWidth)) {
        idx--
      }
      if (idx < 0) return  // Nothing decoded yet

      if (idx === lastIdx && !needsRedraw) return
      stateRef.current.lastIdx = idx

      // Cover-fit draw (equivalent to background-size: cover)
      const img   = frames[idx]
      const iw    = img.naturalWidth
      const ih    = img.naturalHeight
      const scale = Math.max(w / iw, h / ih)
      const dw    = iw * scale
      const dh    = ih * scale
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scrollProgress])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  )
}
