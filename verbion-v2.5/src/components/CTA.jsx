import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import RockBed from './RockBed.jsx'

export default function CTA() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      gsap.set(q('.cta-word'), { y: 26 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          toggleActions: 'play none none none',
        },
      })
      tl.to(q('.cta-word-1'), { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0)
        .to(q('.cta-word-2'), { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.3)
        .to(q('.cta-word-3'), { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.6)
        .fromTo(
          [q('.cta-specrow'), q('.cta-buttons'), q('.cta-note')],
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' },
          0.9,
        )
    },
    { scope: sectionRef },
  )

  return (
    <section id="preorder" ref={sectionRef} className="cta-section" data-brush>
      <div className="cta-bg" />
      <div className="cta-gradient" />
      <div className="cta-vignette" />
      <RockBed />
      <div className="cta-content">
        <h2 className="cta-word cta-word-1">COLD.</h2>
        <h2 className="cta-word cta-word-2">INTELLIGENT.</h2>
        <h2 className="cta-word cta-word-3">ENGINEERED.</h2>
        <div className="cta-specrow">750 ml · 265 mm · IP67 · BLE 5.2</div>
        <div className="cta-buttons">
          <button className="cta-btn primary">PRE-ORDER 750ml</button>
          <button className="cta-btn ghost">PRE-ORDER 1.5L</button>
        </div>
        <p className="cta-note">Early access. Limited first run.</p>
      </div>
      <footer className="site-footer">
        © 2026 VERBION. Specifications reflect confirmed values from Internal Structure Rev 2.
      </footer>
    </section>
  )
}
