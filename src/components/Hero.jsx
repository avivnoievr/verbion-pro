import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import FrameScrubSection from './FrameScrubSection.jsx'

const LETTERS = 'VERBION'.split('')

export default function Hero() {
  const titleRef = useRef(null)
  const cueRef = useRef(null)

  useGSAP(() => {
    gsap.from(titleRef.current.querySelectorAll('.hero-letter'), {
      x: -40,
      opacity: 0,
      filter: 'blur(8px)',
      stagger: 0.08,
      duration: 1.05,
      delay: 0.15,
      ease: 'power3.out',
    })
  })

  const buildTimeline = (tl) => {
    tl.to(titleRef.current, { opacity: 0, y: -36, duration: 0.22, ease: 'power1.in' }, 0.06)
    tl.to(cueRef.current, { opacity: 0, duration: 0.1 }, 0.02)
  }

  return (
    <FrameScrubSection
      id="top"
      frameBase="/frames/orbit"
      frameCount={72}
      pin="+=160%"
      scrub={1}
      fadeOut
      exitFx="push"
      brush
      buildTimeline={buildTimeline}
    >
      <div className="hero-title-block" ref={titleRef}>
        <h1 className="hero-word" aria-label="VERBION">
          {LETTERS.map((l, i) => (
            <span className="hero-letter" key={i} aria-hidden="true">{l}</span>
          ))}
        </h1>
        <div className="hero-version">V 2.5</div>
        <div className="hero-tag">Active Cooling System</div>
      </div>
      <div className="hero-scrollcue" ref={cueRef}>SCROLL TO DISCOVER ↓</div>
    </FrameScrubSection>
  )
}
