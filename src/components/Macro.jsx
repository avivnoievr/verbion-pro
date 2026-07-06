import { useRef } from 'react'
import gsap from 'gsap'
import FrameScrubSection from './FrameScrubSection.jsx'
import CTAContent from './CTA.jsx'

const SPECS = [
  { label: 'Ceramic SiO₂ Inner Wall', value: '150 nm PVD · Al 6061-T6 core', side: 'left' },
  { label: 'Bio-Wax PCM Buffer', value: '9.0°C transition · ≈190 J/g', side: 'right' },
  { label: 'Vacuum + Aerogel Shield', value: '10⁻⁵ Torr · R ≈ 4.5 K·m²/W', side: 'left' },
  { label: 'Medical Silicone Grip', value: 'Shore A60 · 4.0 mm', side: 'right' },
  { label: 'PCM-Insulated Cap', value: '≈0.15 W heat leak · dual wall', side: 'left' },
]

// The film parks on its final frame at 62% of the pin (filmEnd) and the
// pre-order content fades in over that exact frame — no page turn, the
// closing shot IS the backdrop. The section stays pinned to the end of
// the document.
export default function Macro() {
  const refs = useRef([])

  const buildTimeline = (tl) => {
    const q = gsap.utils.selector(tl.scrollTrigger.trigger)
    const step = 0.108
    refs.current.forEach((el, i) => {
      if (!el) return
      const at = 0.06 + i * step
      tl.fromTo(
        el,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.07, ease: 'power2.out' },
        at,
      )
      tl.to(el, { opacity: 0, y: -18, duration: 0.06, ease: 'power1.in' }, at + step - 0.012)
    })
    tl.to(q('.section-eyebrow'), { opacity: 0, duration: 0.05, ease: 'power1.in' }, 0.6)

    // ---- finale: everything rises out of the held closing frame ----
    tl.fromTo(q('.cta-gradient'), { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'none' }, 0.6)
      .fromTo(q('.rockbed'), { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'none' }, 0.64)
      .fromTo(q('.cta-slab'), { opacity: 0 }, { opacity: 1, duration: 0.14, ease: 'none' }, 0.66)
      .fromTo(q('.cta-word-1'), { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.07, ease: 'power2.out' }, 0.7)
      .fromTo(q('.cta-word-2'), { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.07, ease: 'power2.out' }, 0.755)
      .fromTo(q('.cta-word-3'), { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.07, ease: 'power2.out' }, 0.81)
      .fromTo(
        [q('.cta-specrow'), q('.cta-buttons'), q('.cta-note')],
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.055, stagger: 0.03, ease: 'power2.out' },
        0.86,
      )
      .fromTo(q('.site-footer'), { opacity: 0 }, { opacity: 1, duration: 0.05, ease: 'none' }, 0.94)
  }

  return (
    <FrameScrubSection
      id="specs"
      frameBase="/frames/macro"
      frameCount={88}
      pin="+=400%"
      scrub={1}
      poster={84}
      filmEnd={0.62}
      fadeIn="rise"
      sheet
      brush
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
      <CTAContent />
    </FrameScrubSection>
  )
}
