import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function Bento() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)
      const card = (k) => q(`.card-${k}`)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=180%',
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
        },
      })

      if (reduced) {
        tl.to({}, { duration: 1 })
        return
      }

      tl.fromTo([card('a'), card('b')], { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18 }, 0.05)
        .fromTo([card('c'), card('d')], { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.18 }, 0.27)
        .fromTo(
          [card('e'), card('f')],
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.18, stagger: 0.06 },
          0.49,
        )
        .fromTo([card('g'), card('h')], { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18 }, 0.7)
        .fromTo(q('.bento-caption'), { opacity: 0, y: 18 }, { opacity: 0.6, y: 0, duration: 0.1 }, 0.82)
        .to([q('.bento-inner'), q('.bento-video')], { opacity: 0, duration: 0.06, ease: 'none' }, 0.94)
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="bento-section">
      <div className="bento-glow" />
      <video className="bento-video" src="/videos/ambient2.mp4" autoPlay muted loop playsInline />
      <div className="bento-inner">
        <div className="bento-grid">
          <div className="bento-card card-a">
            <img src="/images/bento/a.webp" alt="VERBION bottle with live data streams and glowing OLED display" />
          </div>
          <div className="bento-card card-b">
            <img src="/images/bento/b.webp" alt="VERBION bottle on a café table beside a mug and open book" />
          </div>
          <div className="bento-card card-c">
            <img src="/images/bento/c.webp" alt="Runner in a park at golden hour carrying the VERBION bottle" />
          </div>
          <div className="bento-card card-d text-card card-amber">
            <div className="big">30W</div>
            <div className="small">Solid-State Cooling</div>
          </div>
          <div className="bento-card card-e">
            <img src="/images/bento/pogo.webp" alt="VERBION two-module design showing the 8-pin gold pogo connector" />
          </div>
          <div className="bento-card card-f">
            <img src="/images/bento/f.webp" alt="VERBION bottle on a window ledge with city bokeh behind" />
          </div>
          <div className="bento-card card-g text-card card-cyan">
            <div className="big">10°C</div>
            <div className="small">Precision Target</div>
          </div>
          <div className="bento-card card-h">
            <img src="/images/bento/h.webp" alt="VERBION bottle in a backpack side pocket on a forest trail" />
          </div>
        </div>
        <p className="bento-caption">A product built for real life.</p>
      </div>
    </section>
  )
}
