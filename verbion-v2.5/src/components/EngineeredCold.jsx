import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function EngineeredCold() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=110%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })

      if (reduced) {
        tl.to({}, { duration: 1 })
        return
      }

      gsap.set(q('.cold-word'), { clipPath: 'inset(100% 0% 0% 0%)' })
      tl.fromTo(
        q('.cold-content'),
        { yPercent: 6, rotateX: -5, transformOrigin: '50% 100%' },
        { yPercent: 0, rotateX: 0, duration: 0.08, ease: 'power1.out' },
        0,
      )
        .fromTo(q('.cold-slab'), { rotateX: 64, opacity: 0 }, { rotateX: 44, opacity: 1, duration: 0.9, ease: 'none' }, 0.06)
        .to(q('.cold-word'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.2, stagger: 0.16 }, 0.05)
        .fromTo(q('.cold-sub'), { opacity: 0, y: 24 }, { opacity: 0.6, y: 0, duration: 0.16, ease: 'power2.out' }, 0.48)
        .fromTo(q('.cold-detail'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.62)
        .fromTo(q('.cold-chip'), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.78)
        .to(
          [q('.cold-content'), q('.cold-slab')],
          { opacity: 0.08, yPercent: -6, rotateX: 8, transformOrigin: '50% 12%', duration: 0.08, ease: 'power1.in' },
          0.92,
        )
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="cold-section" data-brush>
      <div className="slab3d cold-slab" aria-hidden="true">Bi₂Te₃</div>
      <div className="cold-content">
        <h2 className="cold-headline">
          <span className="cold-word">ENGINEERED</span>
          <span className="cold-word">COLD.</span>
        </h2>
        <p className="cold-sub">Active thermoelectric cooling.</p>
        <p className="cold-detail">
          Cools to 10°C, rests, re-engages at 12°C. A closed loop, running on its own.
        </p>
        <div className="cold-chip">30W · Bi₂Te₃ · COP 0.50–0.62</div>
      </div>
    </section>
  )
}
