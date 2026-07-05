import { useRef } from 'react'
import gsap from 'gsap'
import FrameScrubSection from './FrameScrubSection.jsx'

const CALLOUTS = [
  {
    label: 'Bi₂Te₃ Peltier',
    value: '30W · 40×40 mm · solid-state',
    style: { left: '7%', top: '24%' },
    mirror: false,
    at: 0.3,
  },
  {
    label: 'Sintered Copper Heat Pipes',
    value: '2× Ø5 mm · design target',
    style: { right: '7%', top: '32%' },
    mirror: true,
    at: 0.54,
  },
  {
    label: 'Dual Centrifugal Fans',
    value: '30 mm · push-pull · 1.0 W',
    style: { left: '9%', bottom: '20%' },
    mirror: false,
    at: 0.78,
  },
]

export default function XRay() {
  const refs = useRef([])

  const buildTimeline = (tl) => {
    refs.current.forEach((el, i) => {
      if (!el) return
      const line = el.querySelector('.callout-line')
      const dot = el.querySelector('.callout-dot')
      const text = el.querySelectorAll('.callout-label, .callout-value')
      const len = line.getTotalLength()
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })
      const at = CALLOUTS[i].at
      tl.to(el, { opacity: 1, duration: 0.04 }, at)
        .to(line, { strokeDashoffset: 0, duration: 0.09, ease: 'power1.out' }, at)
        .fromTo(dot, { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: 0.04 }, at + 0.07)
        .fromTo(text, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.07, ease: 'power2.out' }, at + 0.05)
    })
  }

  return (
    <FrameScrubSection
      id="technology"
      frameBase="/frames/xray"
      frameCount={144}
      pin="+=160%"
      scrub={1}
      poster={100}
      fadeIn
      fadeOut
      buildTimeline={buildTimeline}
    >
      <div className="section-eyebrow">
        Intelligent Power Dock
        <strong>The cooling engine, exposed.</strong>
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
