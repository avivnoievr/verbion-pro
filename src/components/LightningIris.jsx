import { forwardRef, useImperativeHandle, useRef } from 'react'

// Electric arcs that "pull the iris open": jagged cyan bolts anchored
// on the widening circle's rim, stretching outward to the screen edge.
// Driven by the section's scrubbed timeline via draw(p), p = 0..1 of
// the iris window. Canvas is cleared outside the window, so it costs
// nothing except during the transition.
const BOLTS = 9

function jaggedPath(ctx, x0, y0, x1, y1, chaos) {
  const segs = 7
  ctx.moveTo(x0, y0)
  const nx = -(y1 - y0)
  const ny = x1 - x0
  const len = Math.hypot(nx, ny) || 1
  for (let s = 1; s < segs; s++) {
    const t = s / segs
    const jitter = (Math.random() - 0.5) * chaos * (1 - Math.abs(t - 0.5) * 1.2)
    ctx.lineTo(
      x0 + (x1 - x0) * t + (nx / len) * jitter,
      y0 + (y1 - y0) * t + (ny / len) * jitter,
    )
  }
  ctx.lineTo(x1, y1)
}

const LightningIris = forwardRef(function LightningIris(_, ref) {
  const canvasRef = useRef(null)

  useImperativeHandle(ref, () => ({
    draw(p) {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      ctx.clearRect(0, 0, w, h)
      if (p <= 0.01 || p >= 0.99) return

      const cx = w * 0.5
      const cy = h * 0.52
      // matches clip-path circle(14% -> 142%): % of diagonal / sqrt(2)
      const ref50 = Math.hypot(w, h) / Math.SQRT2
      const r = (0.14 + (1.42 - 0.14) * p) * ref50
      const alpha = Math.sin(p * Math.PI) // in, peak, out

      ctx.globalCompositeOperation = 'lighter'

      // faint rim
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0, 229, 229, ${0.22 * alpha})`
      ctx.lineWidth = 1.5
      ctx.shadowColor = '#00E5E5'
      ctx.shadowBlur = 18
      ctx.stroke()

      // bolts BRIDGE the rim — outer world to inner circle, threads
      // that read as if they're hauling the iris open
      for (let i = 0; i < BOLTS; i++) {
        const a = (i / BOLTS) * Math.PI * 2 + p * 1.7 + Math.random() * 0.12
        const rIn = r * (0.62 + Math.random() * 0.12)
        const rOut = r * 1.28 + 70 + Math.random() * 140
        const x0 = cx + Math.cos(a) * rOut
        const y0 = cy + Math.sin(a) * rOut
        const x1 = cx + Math.cos(a) * rIn
        const y1 = cy + Math.sin(a) * rIn
        ctx.beginPath()
        jaggedPath(ctx, x0, y0, x1, y1, 52)
        ctx.strokeStyle = `rgba(158, 250, 250, ${(0.4 + Math.random() * 0.45) * alpha})`
        ctx.lineWidth = 1.2 + Math.random() * 1.8
        ctx.shadowColor = '#00E5E5'
        ctx.shadowBlur = 16
        ctx.stroke()
        // hot core
        ctx.beginPath()
        jaggedPath(ctx, x0, y0, x1, y1, 32)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * alpha})`
        ctx.lineWidth = 0.8
        ctx.shadowBlur = 7
        ctx.stroke()
        // bright node where the thread grips the rim
        const xr = cx + Math.cos(a) * r
        const yr = cy + Math.sin(a) * r
        ctx.beginPath()
        ctx.arc(xr, yr, 2.2 + Math.random() * 1.6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 255, 255, ${0.85 * alpha})`
        ctx.shadowBlur = 12
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.shadowBlur = 0
    },
  }))

  return <canvas ref={canvasRef} className="lightning-canvas" aria-hidden="true" />
})

export default LightningIris
