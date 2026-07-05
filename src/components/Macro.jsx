import { useRef } from 'react'
import gsap from 'gsap'
import FrameScrubSection from './FrameScrubSection.jsx'

const SPECS = [
  { label: 'Ceramic SiO₂ Inner Wall', value: '150 nm PVD · Al 6061-T6 core', side: 'left' },
  { label: 'Bio-Wax PCM Buffer', value: '9.0°C transition · ≈190 J/g', side: 'right' },
  { label: 'Vacuum + Aerogel Shield', value: '10⁻⁵ Torr · R ≈ 4.5 K·m²/W', side: 'left' },
  { label: 'Medical Silicone Grip', value: 'Shore A60 · 4.0 mm', side: 'right' },
  { label: 'PCM-Insulated Cap', value: '≈0.15 W heat leak · dual wall', side: 'left' },
]

export default function Macro() {
  const refs = useRef([])

  const buildTimeline = (tl) => {
    const step = 0.8 / SPECS.length
    refs.current.forEach((el, i) => {
      if (!el) return
      const at = 0.1 + i * step
      const isLast = i === SPECS.length - 1
      tl.fromTo(
        el,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.07, ease: 'power2.out' },
        at,
      )
      if (!isLast) tl.to(el, { opacity: 0, y: -18, duration: 0.06, ease: 'power1.in' }, at + step - 0.06)
    })
  }

  return (
    <FrameScrubSection
      id="specs"
      frameBase="/frames/macro"
      frameCount={88}
      pin="+=170%"
      scrub={1}
      poster={84}
      fadeIn
      fadeOut
      sheet
      buildTimeline={buildTimeline}
    >
      <div className="section-eyebrow">
        Vacuum Fluid Core
        <strong>Five layers deep.</strong>
      </div>
      {SPECS.map((s, i) => (
        <div
          key={s.label}
          className="spec-chip"
          style={s.side === 'left' ? { left: '6%', bottom: '18%' } : { right: '6%', bottom: '26%' }}
          ref={(el) => { refs.current[i] = el }}
        >
          <div className="callout-label">{s.label}</div>
          <div className="callout-value">{s.value}</div>
        </div>
      ))}
    </FrameScrubSection>
  )
}
