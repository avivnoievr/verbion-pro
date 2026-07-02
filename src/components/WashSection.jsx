import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FrameSequencePlayer } from './hero/FrameSequencePlayer'
import { textMotion, clamp01 } from '../lib/motionUtils'
import './WashSection.css'

gsap.registerPlugin(ScrollTrigger)

const CLIP4_DIR  = '/frames/clip4'
const CLIP5_DIR  = '/frames/clip5'
const FRAMES4    = 141
const FRAMES5    = 141

// Container: 500vh | Scroll travel: 400vh
// Hard cut at midpoint: clip4 covers 0→B_MID, clip5 covers B_MID→1.0
const B_MID = 0.500

export function WashSection() {
  const containerRef = useRef(null)
  const stageRef     = useRef(null)

  const c4Ref = useRef(null)
  const c5Ref = useRef(null)

  const p4 = useRef(0)
  const p5 = useRef(0)

  // Text refs
  const beatARef    = useRef(null)
  const beatAipRef  = useRef(null)
  const beatBRef    = useRef(null)

  const c5ReadyRef  = useRef(false)
  const [clip5On, setClip5On] = useState(false)

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start:   'top top',
      end:     'bottom bottom',
      pin:     stageRef.current,
      onUpdate: (self) => {
        const raw = self.progress

        const loc4 = clamp01(raw / B_MID)
        const loc5 = clamp01((raw - B_MID) / (1.0 - B_MID))
        p4.current = loc4
        p5.current = loc5

        // ── Hard cut clip4 → clip5 ───────────────────────
        if (c4Ref.current) c4Ref.current.style.opacity = raw < B_MID ? 1 : 0
        if (c5Ref.current) c5Ref.current.style.opacity = raw >= B_MID ? 1 : 0

        // ── Text overlays ─────────────────────────────────

        // Beat A: "DETACHES IN SECONDS" — clip4 range
        if (beatARef.current) {
          const { op, tx } = textMotion(loc4, 0.06, 0.16, 0.74, 0.84)
          beatARef.current.style.opacity   = op
          beatARef.current.style.transform = `translateX(${tx}px)`
        }

        // Beat A IP67 detail — lower center, appears mid-clip4
        if (beatAipRef.current) {
          const tm = textMotion(loc4, 0.32, 0.44, 0.78, 0.88)
          beatAipRef.current.style.opacity   = tm.op
          beatAipRef.current.style.transform = `translateY(${tm.tx * -0.35}px)`
        }

        // Beat B: "RECONNECTS INSTANTLY" — clip5 range
        if (beatBRef.current) {
          const { op, tx } = textMotion(loc5, 0.08, 0.18, 0.78, 0.88)
          beatBRef.current.style.opacity   = op
          beatBRef.current.style.transform = `translateX(${tx}px)`
        }

        // Fade out the VideoSection→WashSection global curtain as clip4 starts
        const vCurtain = document.getElementById('vs-curtain')
        if (vCurtain) vCurtain.style.opacity = clamp01(1 - raw / 0.05)

        // Lazy-mount clip5
        if (!c5ReadyRef.current && raw > 0.35) {
          c5ReadyRef.current = true
          setClip5On(true)
        }
      },
    })
    return () => trigger.kill()
  }, [])

  return (
    <section ref={containerRef} className="ws" id="about">
      <div ref={stageRef} className="ws__stage">

        {/* clip4 — detach */}
        <div ref={c4Ref} className="ws__canvas ws__canvas--4">
          <FrameSequencePlayer frameDir={CLIP4_DIR} frameCount={FRAMES4} scrollProgress={p4} />
        </div>

        {/* clip5 — reconnect */}
        <div ref={c5Ref} className="ws__canvas ws__canvas--5">
          {clip5On && <FrameSequencePlayer frameDir={CLIP5_DIR} frameCount={FRAMES5} scrollProgress={p5} />}
        </div>

        {/* Beat A — separation headline */}
        <div ref={beatARef} className="vtext ws__beat-a">
          <p className="vtext__eyebrow">CLEAN EVERY TIME</p>
          <h2 className="vtext__headline">
            DETACHES<br /><span className="accent">IN SECONDS.</span>
          </h2>
          <p className="vtext__sub">
            Twist to unlock. The bottle liner lifts free — hand wash, air-dry, reattach.
          </p>
          <p className="vtext__detail">
            Stainless steel liner · Hand wash only · Keep the power module dry
          </p>
        </div>

        {/* Beat A IP67 detail — lower center, explains WHY IP67 matters */}
        <div ref={beatAipRef} className="ws__ip67">
          <div className="ws__ip67-badge">
            <span className="ws__ip67-rating">IP67</span>
            <span className="ws__ip67-label">SEALED</span>
          </div>
          <p className="ws__ip67-body">
            The power module carries <strong>IP67 certification</strong> — the international
            standard for waterproofing against immersion in up to 1 metre of water for 30 minutes.
            Sweat-soaked training, rain on the trail, water splashes — your VERBION's electronics
            are fully protected. This is the engineering that lets you push harder without worrying
            about your gear. Built for athletes who train in real conditions.
          </p>
        </div>

        {/* Beat B — reconnection headline */}
        <div ref={beatBRef} className="vtext ws__beat-b">
          <p className="vtext__eyebrow">SECURE BY DESIGN</p>
          <h2 className="vtext__headline">
            RECONNECTS<br /><span className="accent">INSTANTLY.</span>
          </h2>
          <p className="vtext__sub">
            Slide back in. Full thermal contact re-established. Ready to cool.
          </p>
          <p className="vtext__detail">
            Precision fit · Sealed connection · Active cooling resumes automatically
          </p>
        </div>


      </div>
    </section>
  )
}
