import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import AtomBi2Te3 from './AtomBi2Te3.jsx'

// Copy beats live in the first half of the pin; the Bi₂Te₃ atom owns
// the second half — grows and spins itself into a light burst that
// opens the engine film (whose iris + lightning pick it up beneath).
export default function EngineeredCold() {
  const sectionRef = useRef(null)
  const atomProgress = useRef(0)

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // feather the top edge away while sliding over the gallery
      gsap.fromTo(
        sectionRef.current,
        { '--feather': '48vh' },
        {
          '--feather': '0vh',
          ease: 'none',
          immediateRender: true,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 99.9%', end: 'top top', scrub: true },
        },
      )

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=200%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      if (reduced) {
        tl.to({}, { duration: 1 })
        return
      }

      // horizontal wipe matches the lateral pan from the gallery
      gsap.set(q('.cold-word'), { clipPath: 'inset(0% 100% 0% 0%)' })
      // answers the gallery's leftward sweep: content glides in from the right
      tl.fromTo(
        q('.cold-content'),
        { xPercent: 10, rotateY: -9, filter: 'blur(14px)', transformOrigin: '100% 50%' },
        { xPercent: 0, rotateY: 0, filter: 'blur(0px)', duration: 0.07, ease: 'power1.out' },
        0,
      )
        .fromTo(q('.cold-slab'), { rotateX: 64, opacity: 0 }, { rotateX: 44, opacity: 1, duration: 0.55, ease: 'none' }, 0.04)
        .to(q('.cold-word'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.12, stagger: 0.1 }, 0.04)
        .fromTo(q('.cold-sub'), { opacity: 0, y: 24 }, { opacity: 0.6, y: 0, duration: 0.1, ease: 'power2.out' }, 0.28)
        .fromTo(q('.cold-detail'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.09, ease: 'power2.out' }, 0.36)
        .fromTo(q('.cold-chip'), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.44)
        // small Bi₂Te₃ formulas drift up while the atom takes the stage
        .fromTo(q('.cold-float'), { opacity: 0, y: 40 }, { opacity: 0.7, y: -30, duration: 0.5, stagger: 0.08 }, 0.3)
        // atom: small heart of the page -> spinning giant
        .fromTo(q('.atom-stage'), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.1, ease: 'power2.out' }, 0.22)
        .to(atomProgress, { current: 1, duration: 0.68, ease: 'none' }, 0.28)
        // copy retreats as the atom overwhelms the page
        .to(q('.cold-content'), { opacity: 0.12, filter: 'blur(10px)', scale: 0.96, duration: 0.14, ease: 'power1.in' }, 0.68)
        .to([q('.cold-slab'), q('.cold-float')], { opacity: 0, duration: 0.1 }, 0.8)
        // light burst — carries you into the engine film with no page cut
        .fromTo(
          q('.atom-flash'),
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 3.4, duration: 0.12, ease: 'power2.in' },
          0.88,
        )
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="cold-section" data-brush>
      <div className="slab3d cold-slab" aria-hidden="true">Bi₂Te₃</div>
      <div className="slab3d cold-float cold-float-1" aria-hidden="true">Bi₂Te₃</div>
      <div className="slab3d cold-float cold-float-2" aria-hidden="true">Bi₂Te₃</div>
      <AtomBi2Te3 progress={atomProgress} />
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
      <div className="atom-flash" aria-hidden="true" />
    </section>
  )
}
