import { useRef } from 'react'
import gsap from 'gsap'
import FrameScrubSection from './FrameScrubSection.jsx'

// Timing is phase-locked to the concatenated sequence:
// video1 (spiral→wires) 0–0.374, video2 (dissolve) 0.374–0.624,
// video3 (airflow→assembled engine) 0.624–1.0.
const CALLOUTS = [
  {
    label: 'Bi₂Te₃ Peltier',
    value: '30W · 40×40 mm · solid-state',
    style: { left: '7%', top: '24%' },
    mirror: false,
    at: 0.64,
    out: 0.76,
  },
  {
    label: 'Sintered Copper Heat Pipes',
    value: '2× Ø5 mm · design target',
    style: { right: '7%', top: '46%' },
    mirror: true,
    at: 0.77,
    out: 0.87,
  },
  {
    label: 'Dual Centrifugal Fans',
    value: '30 mm · push-pull · 1.0 W',
    style: { left: '9%', bottom: '20%' },
    mirror: false,
    at: 0.88,
    out: null,
  },
]

export default function XRay() {
  const refs = useRef([])

  const subtitleRef = useRef(null)

  const buildTimeline = (tl) => {
    tl.fromTo(subtitleRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.3)
      .to(subtitleRef.current, { opacity: 0, y: -12, duration: 0.05, ease: 'power1.in' }, 0.53)
    refs.current.forEach((el, i) => {
      if (!el) return
      const line = el.querySelector('.callout-line')
      const dot = el.querySelector('.callout-dot')
      const text = el.querySelectorAll('.callout-label, .callout-value')
      const len = line.getTotalLength()
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })
      const { at, out } = CALLOUTS[i]
      tl.to(el, { opacity: 1, duration: 0.03 }, at)
        .to(line, { strokeDashoffset: 0, duration: 0.06, ease: 'power1.out' }, at)
        .fromTo(dot, { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: 0.03 }, at + 0.05)
        .fromTo(text, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.05, ease: 'power2.out' }, at + 0.03)
      if (out) tl.to(el, { opacity: 0, y: -14, duration: 0.04, ease: 'power1.in' }, out)
    })
  }

  return (
    <FrameScrubSection
      id="technology"
      frameBase="/frames/xray"
      frameCount={386}
      pin="+=240%"
      scrub={1}
      poster={330}
      fadeIn
      fadeOut
      sheet
      buildTimeline={buildTimeline}
    >
      <div className="section-eyebrow">
        Intelligent Power Dock
        <strong>The cooling engine, exposed.</strong>
      </div>
      <div className="xray-subtitle" ref={subtitleRef}>
        Live telemetry flows in — nRF52840 · BLE 5.2.
        <span>Then the dock answers, in order.</span>
      </div>
      {CALLOUTS.map((c, i) => (
        <div
          key={c.label}
          className="callout"
          style={c.style}
          ref={(el) => { refs.current[i] = el }}
        >
          <svg width="200" height="52" viewBox="0 0 200 52">
            {c.mirror ? (
              <>
                <path className="callout-line" d="M2,48 L128,48 L166,10" />
                <circle className="callout-dot" cx="170" cy="6" r="4" />
              </>
            ) : (
              <>
                <path className="callout-line" d="M198,48 L72,48 L34,10" />
                <circle className="callout-dot" cx="30" cy="6" r="4" />
              </>
            )}
          </svg>
          <div className="callout-label">{c.label}</div>
          <div className="callout-value">{c.value}</div>
        </div>
      ))}
    </FrameScrubSection>
  )
}
