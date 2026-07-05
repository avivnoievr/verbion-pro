import { useEffect, useRef } from 'react'
import './TransitionBackground.css'

const WAVE_ROWS = 6
const RINGS = [
  { delay: 0,    dur: 1.5 },
  { delay: 0.12, dur: 1.65 },
]

export function TransitionBackground({ animate = false }) {
  const ringRefs = useRef([])

  useEffect(() => {
    if (!animate) return
    const rings = ringRefs.current.filter(Boolean)
    rings.forEach((el, i) => {
      const { delay, dur } = RINGS[i]
      el.style.transition = 'none'
      el.style.clipPath    = 'circle(150% at 50% 50%)'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = `clip-path ${dur}s cubic-bezier(0.76,0,0.24,1) ${delay}s`
          el.style.clipPath   = 'circle(0% at 50% 50%)'
        })
      })
    })
  }, [animate])

  return (
    <div className="trans-bg" aria-hidden="true">

      {/*
       * 6 wave rows — each is ONE wave image, no repeat.
       * wave-transparent.png has a real alpha channel so white bg is gone.
       */}
      <div className="trans-bg__waves">
        {Array.from({ length: WAVE_ROWS }).map((_, i) => (
          <div key={i} className="trans-bg__row">
            <img
              src="/images/wave-transparent.png"
              className="trans-bg__wave-img"
              alt=""
              draggable="false"
            />
          </div>
        ))}
      </div>

      {RINGS.map((_, i) => (
        <div
          key={i}
          ref={el => { ringRefs.current[i] = el }}
          className={`trans-bg__ring trans-bg__ring--${i}`}
        />
      ))}

    </div>
  )
}
