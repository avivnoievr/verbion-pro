import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FrameSequencePlayer } from './hero/FrameSequencePlayer'
import { textMotion, clamp01 } from '../lib/motionUtils'
import './VideoSection.css'

gsap.registerPlugin(ScrollTrigger)

// ── Clip directories & per-clip frame counts ──────────────
const CLIP1_DIR  = '/frames/clip1'
const CLIPT_DIR  = '/frames/clipT'   // 4s transition bridge clip1→clip2
const CLIP2_DIR  = '/frames/clip2'
const CLIP3_DIR  = '/frames/clip3'

const FRAMES1 = 145
const FRAMEST = 93   // 4.04s × 24fps − 4 trimmed frames
const FRAMES2 = 145
const FRAMES3 = 141

// ── Hard-cut boundaries (no dissolves — instant switches) ─
// clip1: 0→B1  |  clipT: B1→BT  |  clip2: BT→B2  |  clip3: B2→1.0
const B1 = 0.250   // clip1 → clipT  (200 vh into 800vh travel)
const BT = 0.363   // clipT → clip2  (+90 vh for the 93-frame bridge)
const B2 = 0.750   // clip2 → clip3  (+310 vh for the X-ray clip)

export function VideoSection() {
  const containerRef = useRef(null)
  const stageRef     = useRef(null)

  // Canvas wrapper refs
  const c1Ref = useRef(null)
  const cTRef = useRef(null)
  const c2Ref = useRef(null)
  const c3Ref = useRef(null)

  // Text overlay refs
  const beat1Ref   = useRef(null)
  const beat3Ref   = useRef(null)
  const beat4Ref   = useRef(null)
  const beat5Ref   = useRef(null)

  // Split panel (X-ray section)
  const splitRef   = useRef(null)

  // Frame-progress refs — mutable, read by FrameSequencePlayer RAF loop
  const p1 = useRef(0)
  const pT = useRef(0)
  const p2 = useRef(0)
  const p3 = useRef(0)

  // Lazy-mount guards (mount clips well before their first cross-fade)
  const cTReadyRef = useRef(false)
  const c2ReadyRef = useRef(false)
  const c3ReadyRef = useRef(false)
  const [clipTOn, setClipTOn] = useState(false)
  const [clip2On, setClip2On] = useState(false)
  const [clip3On, setClip3On] = useState(false)

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end:   'bottom bottom',
      pin:   stageRef.current,
      onUpdate: (self) => {
        const raw = self.progress

        // ── Local 0→1 progress per clip (hard-cut segments) ─
        const loc1 = clamp01(raw / B1)
        const locT = clamp01((raw - B1) / (BT - B1))
        const loc2 = clamp01((raw - BT) / (B2 - BT))
        const loc3 = clamp01((raw - B2) / (1.0 - B2))

        p1.current = loc1
        pT.current = locT
        p2.current = loc2
        p3.current = loc3

        // ── Canvas visibility — instant hard cuts ─────────
        if (c1Ref.current) c1Ref.current.style.opacity = raw < B1 ? 1 : 0
        if (cTRef.current) cTRef.current.style.opacity = raw >= B1 && raw < BT ? 1 : 0
        if (c2Ref.current) c2Ref.current.style.opacity = raw >= BT && raw < B2 ? 1 : 0
        if (c3Ref.current) c3Ref.current.style.opacity = raw >= B2 ? 1 : 0

        // ── Split panel (X-ray clip2) ──────────────────────
        // Ramps 0→1 in the first 5% of clip2, back to 0 in the last 5%.
        const SP_IN_S  = BT + 0.02; const SP_IN_E  = BT + 0.07
        const SP_OUT_S = B2 - 0.07; const SP_OUT_E = B2 - 0.02
        const spIn  = clamp01((raw - SP_IN_S)  / (SP_IN_E  - SP_IN_S))
        const spOut = clamp01((raw - SP_OUT_S) / (SP_OUT_E - SP_OUT_S))
        const spAmt = Math.min(spIn, 1 - spOut)

        // Clip canvas-2 from the LEFT as panel opens (video shows right 58-100%)
        if (c2Ref.current) {
          const clipL = Math.round(spAmt * 36)
          c2Ref.current.style.clipPath = clipL > 0 ? `inset(0 0 0 ${clipL}%)` : ''
        }

        if (splitRef.current) {
          splitRef.current.style.opacity   = spAmt
          splitRef.current.style.transform = `translateX(${(spAmt - 1) * 40}px)`
        }

        // ── Text overlays ─────────────────────────────────

        // Beat 1 — wordmark, fades out during clip1
        const opBeat1 = loc1 <= 0.34 ? 1 : loc1 >= 0.44 ? 0 : 1 - (loc1 - 0.34) / 0.10
        if (beat1Ref.current) beat1Ref.current.style.opacity = opBeat1

        // Beat 3 — 4-phase logic (loc1 0.50→0.97)
        if (beat3Ref.current) {
          const { op, tx } = textMotion(loc1, 0.50, 0.59, 0.87, 0.97)
          beat3Ref.current.style.opacity   = op
          beat3Ref.current.style.transform = `translateX(${tx}px)`
        }

        // Beat 4 — X-ray headline: pushed into right video panel via paddingLeft
        // (left/translate don't work on inset:0 flex containers — paddingLeft does)
        if (beat4Ref.current) {
          const { op, tx } = textMotion(loc2, 0.07, 0.16, 0.80, 0.90)
          const padL = Math.round(spAmt * 37)
          beat4Ref.current.style.opacity     = op
          beat4Ref.current.style.paddingLeft = padL > 0 ? `${padL}%` : ''
          beat4Ref.current.style.textAlign   = spAmt > 0.5 ? 'left' : ''
          beat4Ref.current.style.transform   = `translateX(${tx}px)`
        }

        // Beat 5 — frost payoff (loc3)
        if (beat5Ref.current) {
          const { op, tx } = textMotion(loc3, 0.07, 0.16, 0.80, 0.90)
          beat5Ref.current.style.opacity   = op
          beat5Ref.current.style.transform = `translateX(${tx}px)`
        }

        // ── Exit curtain — position:fixed global overlay (see App.jsx #vs-curtain) ──
        const vCurtain = document.getElementById('vs-curtain')
        if (vCurtain) vCurtain.style.opacity = clamp01((loc3 - 0.88) / 0.12)

        // ── Lazy mounts ───────────────────────────────────
        if (!cTReadyRef.current && raw > 0.16) { cTReadyRef.current = true; setClipTOn(true) }
        if (!c2ReadyRef.current && raw > 0.30) { c2ReadyRef.current = true; setClip2On(true) }
        if (!c3ReadyRef.current && raw > 0.62) { c3ReadyRef.current = true; setClip3On(true) }
      },
    })
    return () => trigger.kill()
  }, [])

  return (
    <section ref={containerRef} className="vs">
      <div ref={stageRef} className="vs__stage">

        {/* Sky fallback until clip1 first frame renders */}
        <div className="vs__sky" aria-hidden="true" />

        {/* ── Canvas layers ── */}
        <div ref={c1Ref} className="vs__canvas vs__canvas--1">
          <FrameSequencePlayer frameDir={CLIP1_DIR} frameCount={FRAMES1} scrollProgress={p1} />
        </div>

        <div ref={cTRef} className="vs__canvas vs__canvas--T">
          {clipTOn && <FrameSequencePlayer frameDir={CLIPT_DIR} frameCount={FRAMEST} scrollProgress={pT} />}
        </div>

        <div ref={c2Ref} className="vs__canvas vs__canvas--2">
          {clip2On && <FrameSequencePlayer frameDir={CLIP2_DIR} frameCount={FRAMES2} scrollProgress={p2} />}
        </div>

        <div ref={c3Ref} className="vs__canvas vs__canvas--3">
          {clip3On && <FrameSequencePlayer frameDir={CLIP3_DIR} frameCount={FRAMES3} scrollProgress={p3} />}
        </div>

        {/* ── Beat 1 — brand hero (CSS keyframe stagger, JS fade-out) ── */}
        <div ref={beat1Ref} className="vtext vs__beat1">
          <p className="vtext__eyebrow">PRECISION THERMAL CONTROL</p>
          <h1 className="vs__wordmark">VERBION</h1>
          <p className="vtext__tagline">INTELLIGENT COOLING</p>
          <p className="vtext__sub">
            Active cooling technology. Your hydration,&nbsp;perfected.
          </p>
          <p className="vtext__detail">
            30W Peltier module · Bio-Wax PCM at 9.0°C · Dual 30mm fans at ≤28&nbsp;dBA
          </p>
        </div>

        {/* ── Beat 3 — 4-phase logic ── */}
        <div ref={beat3Ref} className="vtext vs__beat3">
          <p className="vtext__eyebrow">RESPONSIVE INTELLIGENCE</p>
          <h2 className="vtext__headline">
            <span className="accent">4-PHASE</span><br />ADAPTIVE LOGIC
          </h2>
          <p className="vtext__sub">Smart sensors. Real-time thermal decisions.</p>
          <p className="vtext__detail">
            TURBO <span className="accent">30W</span> → OFF 0W → ECO{' '}
            <span className="accent">9W</span> (30%) — automatically sequenced to reach and hold{' '}
            <span className="accent">10°C</span>
          </p>
        </div>

        {/* ── Split panel — slides in from left during clip2 X-ray ── */}
        <div ref={splitRef} className="vs__split-panel" aria-hidden="true">
          <div className="vs__split-inner">
            <p className="vs__split-eyebrow">INSIDE THE MACHINE</p>
            <h2 className="vs__split-headline">
              COOLING<br /><span className="accent">ENGINE</span>
            </h2>
            <div className="vs__split-specs">
              <div className="vs__split-row">
                <span className="vs__split-key">TEC</span>
                <span>Bi₂Te₃ · 40×40 mm · <span className="accent">30 W</span> · COP 0.50–0.62</span>
              </div>
              <div className="vs__split-row">
                <span className="vs__split-key">PCM</span>
                <span>Bio-Wax · Tc <span className="accent">9.0°C</span> · ≥190 J/g</span>
              </div>
              <div className="vs__split-row">
                <span className="vs__split-key">FANS</span>
                <span>2× 30 mm centrifugal · 8–10 CFM · ≤28 dBA</span>
              </div>
              <div className="vs__split-row">
                <span className="vs__split-key">LOGIC</span>
                <span>TURBO <span className="accent">30 W</span> → OFF ↔ ECO <span className="accent">9 W</span></span>
              </div>
              <div className="vs__split-row vs__split-row--target">
                <span className="vs__split-key">T_TARGET</span>
                <span className="accent">10.0°C</span>
              </div>
            </div>
            <p className="vs__split-detail">
              Unlike passive insulation, the Bi₂Te₃ module actively removes heat.
              TURBO phase at <span className="accent">30W</span> until{' '}
              <span className="accent">10°C</span>, then ECO cycling at{' '}
              <span className="accent">9W</span> to maintain cold all session.
            </p>
          </div>
        </div>

        {/* ── Beat 4 — X-ray headline (shifts right as split opens) ── */}
        <div ref={beat4Ref} className="vtext vs__beat4">
          <p className="vtext__eyebrow">PELTIER TECHNOLOGY</p>
          <h2 className="vtext__headline">
            <span className="accent">SOLID-STATE</span><br />COOLING
          </h2>
          <p className="vtext__sub">
            Bi₂Te₃ TEC · <span className="accent">30W</span> peak · Dual-stage heat transfer
          </p>
        </div>

        {/* ── Beat 5 — frost payoff ── */}
        <div ref={beat5Ref} className="vtext vs__beat5">
          <p className="vtext__eyebrow">THE RESULT</p>
          <h2 className="vtext__headline">
            <span className="accent">10°C.</span><br />MAINTAINED.
          </h2>
          <p className="vtext__sub">
            <span className="accent">30W</span> Turbo phase. ~48&nbsp;min from 25°C tap water.
          </p>
          <p className="vtext__detail">
            ECO cycling at just <span className="accent">9W</span> holds 10°C for your entire session
          </p>
        </div>


      </div>
    </section>
  )
}
