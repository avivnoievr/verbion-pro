import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// One fixed "room": atmosphere layers spread over the whole viewport
// that never move — only their opacity rides the scroll (one-page
// method §3.3). The veil dips dark across every scene boundary, so a
// transition reads as the room's light changing, never as a new page.
// THIS FILE IS THE ONLY OWNER of .atmo-veil opacity.
export default function Atmosphere() {
  const veilRef = useRef(null)

  useGSAP(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const sections = gsap.utils.toArray('main .scene > section').slice(1)
    sections.forEach((sec) => {
      gsap.timeline({
        scrollTrigger: { trigger: sec, start: 'top 99.9%', end: 'top top', scrub: true },
      })
        .fromTo(veilRef.current, { opacity: 0 }, { opacity: 0.32, duration: 0.45, ease: 'none', immediateRender: false }, 0)
        .to(veilRef.current, { opacity: 0, duration: 0.55, ease: 'none' }, 0.45)
    })
  })

  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmo-glow" />
      <div className="atmo-veil" ref={veilRef} />
    </div>
  )
}
