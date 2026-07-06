import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// 3D chain gallery: a tilted ring of cards that unfurls out of the
// bottom-left corner (where the hero just balled up and vanished) and
// spins with scroll. Facts on the copy side come from the Internal
// Structure Rev 2 document — CONFIRMED rows only.
const CARDS = [
  { img: '/images/bento/a.webp', alt: 'VERBION bottle with live data streams' },
  { text: '10°C', sub: 'Precision target', tone: 'cyan' },
  { img: '/images/bento/c.webp', alt: 'Runner at golden hour with the bottle' },
  { img: '/images/gallery/oled-macro.webp', alt: 'OLED status screen macro' },
  { text: '30W', sub: 'Solid-state cooling', tone: 'amber' },
  { img: '/images/bento/pogo.webp', alt: 'Two-module pogo connector' },
  { img: '/images/bento/h.webp', alt: 'Bottle in a backpack on a forest trail' },
  { text: 'IP67', sub: 'Sealed power dock', tone: 'cyan' },
  { img: '/images/gallery/run-park.webp', alt: 'Morning run with the bottle in hand' },
  { img: '/images/bento/f.webp', alt: 'Bottle on a window ledge, city bokeh' },
  { text: 'BLE 5.2', sub: 'Live telemetry', tone: 'amber' },
  { img: '/images/bento/b.webp', alt: 'Bottle on a café table' },
]

// CONFIRMED-only use cases (Internal Structure Rev 2)
const USES = [
  { t: 'Cold that holds itself', d: 'Cools to 10°C, rests, re-engages at 12°C — a closed loop you never think about.' },
  { t: 'Built for the trail', d: 'IP67-sealed dock, 12 drops from 1.5 m survived, vacuum + aerogel core.' },
  { t: 'Grips when you sweat', d: 'Medical-grade silicone shroud, made to hold on wet — runs, rides, climbs.' },
  { t: 'Knows your water', d: '±5 ml level sensing at any tilt, three temperature probes, live on the OLED.' },
  { t: 'Talks to your phone', d: 'BLE 5.2 telemetry from the nRF52840 brain in the dock.' },
]

const N = CARDS.length
const RADIUS = 360

export default function RingGallery() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // feather the top edge away while sliding over the hero
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
          end: '+=260%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      if (reduced) {
        tl.to({}, { duration: 1 })
        gsap.set([q('.ring-scene'), q('.ring-copy')], { opacity: 1, x: 0, y: 0, scale: 1 })
        return
      }

      // the chain unfurls out of the corner the hero collapsed into
      tl.fromTo(
        q('.ring-scene'),
        { x: () => -0.42 * window.innerWidth, y: () => 0.4 * window.innerHeight, scale: 0.1, opacity: 0, rotate: -24 },
        { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0, duration: 0.24, ease: 'power2.out' },
        0,
      )
        // one slow full revolution across the pin, seen from above so
        // the chain reads as a true circle
        .fromTo(q('.ring'), { rotationY: -30 }, { rotationY: -390, duration: 1 }, 0)
        .fromTo(q('.ring'), { rotationX: -34 }, { rotationX: -24, duration: 1 }, 0)
        // copy column rises once the chain is out
        .fromTo(q('.ring-copy h2'), { opacity: 0, y: 30, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.08, ease: 'power2.out' }, 0.26)
      q('.ring-use').forEach((el, i) => {
        tl.fromTo(el, { opacity: 0, x: 36 }, { opacity: 1, x: 0, duration: 0.07, ease: 'power2.out' }, 0.32 + i * 0.055)
      })
      // lateral sweep out — ENGINEERED COLD answers from the right
      tl.to(
        [q('.ring-scene'), q('.ring-copy')],
        { opacity: 0.08, xPercent: -7, filter: 'blur(14px)', duration: 0.08, ease: 'power1.in' },
        0.92,
      )
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="ring-section" data-brush>
      <div className="ring-glow" />
      <div className="ring-scene" aria-hidden="true">
        <div className="ring">
          {CARDS.map((c, i) => (
            <div
              key={i}
              className={`ring-card${c.text ? ` ring-card--text card-${c.tone}` : ''}`}
              style={{ transform: `rotateY(${(360 / N) * i}deg) translateZ(${RADIUS}px)` }}
            >
              {c.img ? (
                <img src={c.img} alt="" loading="lazy" />
              ) : (
                <>
                  <div className="big">{c.text}</div>
                  <div className="small">{c.sub}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="ring-copy">
        <h2>One bottle.<br />Everywhere you go.</h2>
        {USES.map((u) => (
          <div className="ring-use" key={u.t}>
            <div className="ring-use-t">{u.t}</div>
            <div className="ring-use-d">{u.d}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
