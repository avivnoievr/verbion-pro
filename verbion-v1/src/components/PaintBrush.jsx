import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Two-layer interactive cursor:
 *  1. A large, continuously-morphing SVG blob that follows the mouse
 *     — the dominant visual, like the yellow blob on award sites
 *  2. A canvas paint-trail behind it — variable-width streak (slow=thick, fast=thin)
 *
 * Together they read as: "liquid coolant dragged across the screen."
 */

// Organic blob paths — 4 keyframes the SVG d= animates between
const PATHS = [
  'M130,20 C175,10 220,45 230,90 C240,135 215,185 175,205 C135,225 80,220 50,190 C20,160 10,110 25,72 C40,34 85,30 130,20Z',
  'M120,15 C168,5 225,40 238,88 C251,136 228,192 185,210 C142,228 82,218 48,185 C14,152 8,98 28,60 C48,22 72,25 120,15Z',
  'M140,25 C182,12 228,55 235,100 C242,145 210,190 168,208 C126,226 72,215 44,180 C16,145 14,95 32,62 C50,29 98,38 140,25Z',
  'M125,18 C170,8 222,48 232,94 C242,140 218,188 176,208 C134,228 78,222 46,188 C14,154 10,106 28,68 C46,30 80,28 125,18Z',
]

const MORPH_CSS = `
@keyframes blob-morph {
  0%,100% { d: path("${PATHS[0]}"); }
  25%      { d: path("${PATHS[1]}"); }
  50%      { d: path("${PATHS[2]}"); }
  75%      { d: path("${PATHS[3]}"); }
}
`

export function PaintBrush({
  containerRef,
  color     = '#00d4ff',
  trailColor,           // defaults to same as color
  blendMode = 'overlay',
  blobSize  = 260,
  maxWidth  = 80,
}) {
  const blobRef   = useRef(null)
  const canvasRef = useRef(null)

  // ─── Blob cursor ──────────────────────────────────────────
  useEffect(() => {
    const blob      = blobRef.current
    const container = containerRef?.current
    if (!blob || !container) return

    gsap.set(blob, { x: -9999, y: -9999 })

    const xTo = gsap.quickTo(blob, 'x', { duration: 0.14, ease: 'power2.out' })
    const yTo = gsap.quickTo(blob, 'y', { duration: 0.14, ease: 'power2.out' })

    const onMove = (e) => {
      const rect = container.getBoundingClientRect()
      xTo(e.clientX - rect.left - blobSize / 2)
      yTo(e.clientY - rect.top  - blobSize / 2)
    }
    const onEnter = () => { blob.style.opacity = '1' }
    const onLeave = () => { blob.style.opacity = '0' }

    container.addEventListener('mousemove',  onMove)
    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)
    return () => {
      container.removeEventListener('mousemove',  onMove)
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [containerRef, blobSize])

  // ─── Canvas paint trail ───────────────────────────────────
  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef?.current
    if (!canvas || !container) return

    const ctx   = canvas.getContext('2d')
    const paint = trailColor ?? color

    // Resolve CSS colour → RGB once
    const tmp = document.createElement('canvas')
    tmp.width = tmp.height = 1
    const tc = tmp.getContext('2d')
    tc.fillStyle = paint; tc.fillRect(0, 0, 1, 1)
    const [r, g, b] = tc.getImageData(0, 0, 1, 1).data

    let points  = []
    let prevPos = null
    let active  = false
    let animId

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight }
    resize()

    const onMove = (e) => {
      if (!active) return
      const rect  = container.getBoundingClientRect()
      const x     = e.clientX - rect.left
      const y     = e.clientY - rect.top
      const speed = prevPos ? Math.hypot(x - prevPos.x, y - prevPos.y) : 1
      const width = maxWidth / (1 + speed * 0.12)
      points.push({ x, y, width, age: 0 })
      if (points.length > 90) points.shift()
      prevPos = { x, y }
    }
    const onEnter = () => { active = true }
    const onLeave = () => { active = false; prevPos = null }

    const MAX_AGE = 80

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      points = points.filter(p => { p.age++; return p.age < MAX_AGE })

      if (points.length >= 2) {
        for (let i = 1; i < points.length; i++) {
          const p0 = points[i - 1], p1 = points[i]
          const t  = 1 - p1.age / MAX_AGE
          const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2
          ctx.beginPath()
          ctx.moveTo(p0.x, p0.y)
          ctx.quadraticCurveTo(p0.x, p0.y, mx, my)
          ctx.lineWidth   = Math.max(1, (p0.width + p1.width) / 2 * t)
          ctx.lineCap     = 'round'
          ctx.lineJoin    = 'round'
          ctx.strokeStyle = `rgba(${r},${g},${b},${(t * 0.65).toFixed(3)})`
          ctx.stroke()
        }
        // Soft glow at brush head
        const head = points[points.length - 1]
        const ht   = 1 - head.age / MAX_AGE
        const g2   = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, head.width * 1.4)
        g2.addColorStop(0, `rgba(${r},${g},${b},${(ht * 0.45).toFixed(3)})`)
        g2.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.beginPath()
        ctx.arc(head.x, head.y, head.width * 1.4, 0, Math.PI * 2)
        ctx.fillStyle = g2
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    container.addEventListener('mousemove',  onMove)
    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', resize)
    return () => {
      container.removeEventListener('mousemove',  onMove)
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [containerRef, color, trailColor, maxWidth])

  return (
    <>
      {/* ── Style injection (blob morph keyframes) ── */}
      <style>{MORPH_CSS}</style>

      {/* ── Canvas trail (renders below blob) ── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position    : 'absolute',
          inset       : 0,
          pointerEvents: 'none',
          mixBlendMode: blendMode,
          zIndex      : 99,
        }}
      />

      {/* ── Large blob cursor ── */}
      <div
        ref={blobRef}
        aria-hidden="true"
        style={{
          position    : 'absolute',
          top         : 0,
          left        : 0,
          width       : blobSize,
          height      : blobSize,
          pointerEvents: 'none',
          mixBlendMode: blendMode,
          zIndex      : 100,
          opacity     : 0,
          transition  : 'opacity 0.3s ease',
          willChange  : 'transform',
        }}
      >
        <svg
          width={blobSize}
          height={blobSize}
          viewBox="0 0 260 260"
          style={{ display: 'block' }}
        >
          <path
            fill={color}
            fillOpacity="0.72"
            style={{ animation: 'blob-morph 7s ease-in-out infinite' }}
            d={PATHS[0]}
          />
        </svg>
      </div>
    </>
  )
}
