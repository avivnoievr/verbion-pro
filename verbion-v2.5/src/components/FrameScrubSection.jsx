import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// ---------------------------------------------------------------------------
// Shared prioritized fetch queue (module scope, all sections).
// Frames download as Blobs in section order — ladder frames (every 6th)
// first so every clip gets coarse coverage fast, then the gaps. The
// active (pinned) section jumps the whole line via inst.boost.
// ---------------------------------------------------------------------------
let sectionSeq = 0
const fetchQueue = []
let fetchActive = 0
const FETCH_MAX = 10

function pumpFetch() {
  if (!fetchQueue.length || fetchActive >= FETCH_MAX) return
  fetchQueue.sort((a, b) => a.prio() - b.prio())
  while (fetchActive < FETCH_MAX && fetchQueue.length) {
    const task = fetchQueue.shift()
    if (task.dead()) continue
    fetchActive++
    task
      .run()
      .catch(() => {})
      .finally(() => {
        fetchActive--
        pumpFetch()
      })
  }
}

const LADDER = 6 // low-res keyframe cadence
const LOW_W = 480 // low-res ladder decode width

// Each boundary between sections gets its own motion language so the
// scroll reads as one continuous journey, not page changes.
const ENTER_FX = {
  // soft defocus rise (the original)
  blur: [
    { opacity: 0.15, scale: 0.94, yPercent: 8, rotateX: -7, filter: 'blur(16px) brightness(0.7)', transformOrigin: '50% 100%' },
    { opacity: 1, scale: 1, yPercent: 0, rotateX: 0, filter: 'blur(0px) brightness(1)' },
  ],
  // iris reveal — entering the machine through a widening circle,
  // opening hot to receive the atom's light burst
  iris: [
    { opacity: 0.35, scale: 1.08, clipPath: 'circle(14% at 50% 52%)', filter: 'blur(8px) brightness(1.6)' },
    { opacity: 1, scale: 1, clipPath: 'circle(142% at 50% 52%)', filter: 'blur(0px) brightness(1)' },
  ],
  // over-exposed settle — lights coming up into the white studio
  bloom: [
    { opacity: 0.45, scale: 1.06, filter: 'blur(18px) brightness(2.2)' },
    { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)' },
  ],
  // frost rising from the bottom edge
  rise: [
    { opacity: 0.5, yPercent: 3, clipPath: 'inset(70% 0% 0% 0%)', filter: 'blur(10px) brightness(0.8)' },
    { opacity: 1, yPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px) brightness(1)' },
  ],
}
const EXIT_FX = {
  // defocus retreat (the original)
  blur: { opacity: 0.1, scale: 0.92, yPercent: -6, rotateX: 8, filter: 'blur(16px) brightness(0.6)', transformOrigin: '50% 12%' },
  // camera pushes THROUGH the subject into the next scene
  push: { opacity: 0.12, scale: 1.16, filter: 'blur(18px) brightness(0.85)', transformOrigin: '50% 45%' },
  // exposure white-out into a bright scene
  whiteout: { opacity: 0.3, scale: 1.05, filter: 'blur(20px) brightness(2.4)' },
  // dusk dip into a dark scene
  dusk: { opacity: 0.08, scale: 0.94, yPercent: -4, filter: 'blur(14px) brightness(0.35)', transformOrigin: '50% 12%' },
  // the page balls up and vanishes into the bottom-left corner —
  // the gallery chain unfurls from that same corner
  warp: {
    opacity: 0.25,
    scale: 0.1,
    xPercent: -40,
    yPercent: 34,
    borderRadius: '50%',
    filter: 'blur(10px) brightness(0.8)',
    transformOrigin: '50% 50%',
  },
}

// Pinned full-viewport section whose canvas scrubs a WebP frame
// sequence with scroll. Frames decode into a sliding window of
// ImageBitmaps around the playhead (GPU-cheap to draw), backed by a
// persistent quarter-res ladder so fast flicks never hit a black
// frame. Overlay tweens join the same scrubbed timeline via
// buildTimeline(tl) using positions 0..1. `filmEnd` < 1 parks the
// footage on its last frame for the remainder of the pin (used by the
// finale to fade content in over the closing frame).
export default function FrameScrubSection({
  id,
  frameBase,
  frameCount,
  pin = '+=150%',
  scrub = 1,
  poster = 0,
  filmEnd = 1,
  fadeIn = false, // false | true ('blur') | ENTER_FX variant name
  fadeOut = false, // false | true | fade-out start position 0..1
  exitFx = 'blur', // EXIT_FX variant name
  brush = false,
  sheet = false,
  tone,
  children,
  buildTimeline,
}) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const mediaRef = useRef(null)
  const overlayRef = useRef(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d', { alpha: false })
      const staticMode =
        window.matchMedia('(max-width: 767px)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const url = (i) => `${frameBase}/frame_${String(i).padStart(4, '0')}.webp`
      const state = { frame: staticMode ? poster : 0 }
      const inst = { order: sectionSeq++, boost: false, disposed: false }

      const blobs = new Array(frameCount).fill(null)
      const full = new Map() // frame -> full-res ImageBitmap (sliding window)
      const low = new Map() // frame -> ladder ImageBitmap (persistent)
      const pending = new Set()
      let decodeActive = 0
      let aspect = 0
      let natW = 0
      let dir = 1
      let lastF = -1
      let lastKey = ''

      // --- cover-fit rect of the footage, published for image-space overlays
      const updateImgSpace = () => {
        if (!aspect) return
        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        const h = Math.max(ch, cw / aspect)
        const w = h * aspect
        section.style.setProperty('--img-x', `${(cw - w) / 2}px`)
        section.style.setProperty('--img-y', `${(ch - h) / 2}px`)
        section.style.setProperty('--img-w', `${w}px`)
        section.style.setProperty('--img-h', `${h}px`)
      }

      const pick = (f) => {
        const exact = full.get(f)
        if (exact) return [exact, `f${f}`]
        let best = null
        let bestK = -1
        let bestD = Infinity
        for (const [k, bm] of full) {
          const d = Math.abs(k - f)
          if (d < bestD) {
            bestD = d
            best = bm
            bestK = k
          }
        }
        if (best && bestD <= 4) return [best, `f${bestK}`]
        let bl = null
        let blK = -1
        let blD = Infinity
        for (const [k, bm] of low) {
          const d = Math.abs(k - f)
          if (d < blD) {
            blD = d
            bl = bm
            blK = k
          }
        }
        if (bl && blD < bestD) return [bl, `l${blK}`]
        if (best) return [best, `f${bestK}`]
        return [null, '']
      }

      const draw = (force = false) => {
        const f = Math.round(state.frame)
        const [bm, key] = pick(f)
        if (!bm || (!force && key === lastKey)) return
        lastKey = key
        const cw = canvas.width
        const ch = canvas.height
        const scale = Math.max(cw / bm.width, ch / bm.height)
        const w = bm.width * scale
        const h = bm.height * scale
        ctx.drawImage(bm, (cw - w) / 2, (ch - h) / 2, w, h)
      }

      // --- decode scheduling: nearest-first inside a directional window
      const wantRange = () => {
        const f = Math.round(state.frame)
        const ahead = inst.boost ? 36 : 6
        const behind = inst.boost ? 12 : 2
        return dir >= 0 ? [f - behind, f + ahead] : [f - ahead, f + behind]
      }

      const scheduleDecodes = () => {
        if (inst.disposed) return
        const [lo, hi] = wantRange()
        for (const [k, bm] of full) {
          if (k < lo - 10 || k > hi + 20) {
            bm.close()
            full.delete(k)
          }
        }
        const f = Math.round(state.frame)
        const cands = []
        for (let i = Math.max(0, lo); i <= Math.min(frameCount - 1, hi); i++) {
          if (!full.has(i) && !pending.has(i) && blobs[i]) cands.push(i)
        }
        cands.sort((a, b) => Math.abs(a - f) - Math.abs(b - f))
        for (const i of cands) {
          if (decodeActive >= 4) break
          pending.add(i)
          decodeActive++
          const opts =
            natW && canvas.width && canvas.width < natW
              ? { resizeWidth: canvas.width, resizeQuality: 'high' }
              : undefined
          createImageBitmap(blobs[i], opts)
            .then((bm) => {
              if (inst.disposed) {
                bm.close()
                return
              }
              full.set(i, bm)
              if (!aspect) {
                aspect = bm.width / bm.height
                natW = bm.width
                updateImgSpace()
              }
              if (Math.abs(i - Math.round(state.frame)) <= 2) draw()
            })
            .catch(() => {})
            .finally(() => {
              pending.delete(i)
              decodeActive--
              if (!inst.disposed) scheduleDecodes()
            })
        }
      }

      const decodeLow = (i) => {
        if (low.has(i)) return
        createImageBitmap(blobs[i], { resizeWidth: LOW_W })
          .then((bm) => {
            if (inst.disposed) {
              bm.close()
              return
            }
            low.set(i, bm)
            if (!aspect) {
              aspect = bm.width / bm.height
              updateImgSpace()
            }
            if (Math.abs(i - Math.round(state.frame)) <= LADDER) draw()
          })
          .catch(() => {})
      }

      const enqueue = (i, ladder) => {
        fetchQueue.push({
          prio: () => (inst.boost ? -1000 : 0) + inst.order * 20 + (ladder ? 0 : 10) + i / 1e5,
          dead: () => inst.disposed || blobs[i] !== null,
          run: () =>
            fetch(url(i))
              .then((r) => r.blob())
              .then((b) => {
                if (inst.disposed) return
                blobs[i] = b
                if (ladder) decodeLow(i)
                const [lo, hi] = wantRange()
                if (i >= lo && i <= hi) scheduleDecodes()
              }),
        })
      }

      if (staticMode) {
        enqueue(poster, true)
        inst.boost = true
      } else {
        enqueue(poster, true)
        for (let i = 0; i < frameCount; i += LADDER) if (i !== poster) enqueue(i, true)
        for (let i = 0; i < frameCount; i++) if (i % LADDER !== 0 && i !== poster) enqueue(i, false)
      }
      pumpFetch()

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
        canvas.width = Math.round(canvas.clientWidth * dpr)
        canvas.height = Math.round(canvas.clientHeight * dpr)
        updateImgSpace()
        draw(true)
      }
      resize()
      window.addEventListener('resize', resize)

      const onFrame = () => {
        const f = Math.round(state.frame)
        if (f === lastF) return
        dir = f >= lastF ? 1 : -1
        lastF = f
        draw()
        scheduleDecodes()
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: pin,
          scrub,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            inst.boost = staticMode || self.isActive
            if (self.isActive) {
              pumpFetch()
              scheduleDecodes()
            }
          },
        },
      })
      if (staticMode) {
        tl.to({}, { duration: 1 }, 0)
      } else {
        tl.to(
          state,
          { frame: frameCount - 1, duration: filmEnd, snap: 'frame', onUpdate: onFrame },
          0,
        )
        if (filmEnd < 1) tl.to({}, { duration: 1 - filmEnd }, filmEnd)
      }
      if (fadeIn && !staticMode) {
        const [from, to] = ENTER_FX[typeof fadeIn === 'string' ? fadeIn : 'blur']
        tl.fromTo(
          [mediaRef.current, overlayRef.current],
          from,
          { ...to, duration: 0.09, ease: 'power1.out' },
          0,
        )
      }
      if (fadeOut && !staticMode) {
        const outAt = typeof fadeOut === 'number' ? fadeOut : 0.93
        tl.to(
          [mediaRef.current, overlayRef.current],
          { ...EXIT_FX[exitFx], duration: 1 - outAt, ease: 'power1.in' },
          outAt,
        )
      }
      buildTimeline?.(tl)

      return () => {
        inst.disposed = true
        window.removeEventListener('resize', resize)
        for (const bm of full.values()) bm.close()
        for (const bm of low.values()) bm.close()
        full.clear()
        low.clear()
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`scrub-section${sheet ? ' page-sheet' : ''}${tone ? ` tone-${tone}` : ''}`}
      data-brush={brush || undefined}
    >
      <div ref={mediaRef} className="scrub-media">
        <canvas ref={canvasRef} className="scrub-canvas" />
        <div className="scrub-vignette" />
      </div>
      <div ref={overlayRef} className="scrub-overlay">{children}</div>
    </section>
  )
}
