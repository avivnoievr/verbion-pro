import { useRef } from 'react'
import FrameScrubSection from './FrameScrubSection.jsx'
import Callout, { addCalloutBeats } from './Callout.jsx'

// Timing is phase-locked to the concatenated 386-frame sequence
// (t = frame / 385): video1 (spiral→wires) 0–0.374, video2 (dissolve)
// 0.374–0.624, video3 0.624–1.0. Inside video3: exploded stack holds
// frames ~245–288, assembled engine + cyan airflow burst ~292–340,
// macro frost close-up ~345–385. Anchors are [u, v] fractions of the
// 1920×1080 frame, verified against the footage — the dot sits on the
// part itself.
const CALLOUTS = [
  {
    // exploded stack: copper spreader / TEC sandwich, upper center
    label: 'Bi₂Te₃ Peltier Stage',
    value: '30 W · 40×40 mm · solid-state',
    anchor: [0.485, 0.27],
    mirror: true,
    at: 0.648, // frame ~250
    out: 0.72, // frame ~277, before the stack drops home
  },
  {
    // assembled engine: right-hand fan pair, blasting the cyan burst
    label: 'Dual Centrifugal Fans',
    value: '30 mm · push–pull · 1.0 W',
    anchor: [0.64, 0.575],
    mirror: false,
    at: 0.77, // frame ~296
    out: 0.858, // gone before the macro cut at ~0.894
  },
  {
    // macro frost shot: copper loop exiting the fin stack, right side
    label: 'Sintered Copper Heat Pipes',
    value: '2× Ø5 mm · design target',
    anchor: [0.845, 0.72],
    mirror: true,
    at: 0.9, // frame ~347, as the macro settles
    out: null, // rides the section fade-out
    speed: 0.7, // compressed cadence — fully legible before the fade
  },
]

export default function XRay() {
  const refs = useRef([])
  const subtitleRef = useRef(null)

  const buildTimeline = (tl) => {
    // telemetry line lives inside the AI-bridge phase (video2)
    tl.fromTo(subtitleRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.4)
      .to(subtitleRef.current, { opacity: 0, y: -12, duration: 0.05, ease: 'power1.in' }, 0.58)
    refs.current.forEach((el, i) =>
      addCalloutBeats(tl, el, CALLOUTS[i].at, CALLOUTS[i].out, CALLOUTS[i].speed),
    )
  }

  return (
    <FrameScrubSection
      id="technology"
      frameBase="/frames/xray"
      frameCount={386}
      pin="+=240%"
      scrub={1}
      poster={330}
      fadeIn
      fadeOut={0.955}
      sheet
      buildTimeline={buildTimeline}
    >
      <div className="section-eyebrow">
        Intelligent Power Dock
        <strong>The cooling engine, exposed.</strong>
      </div>
      <div className="xray-subtitle" ref={subtitleRef}>
        Live telemetry flows in — nRF52840 · BLE 5.2.
        <span>Then the dock answers, in order.</span>
      </div>
      {CALLOUTS.map((c, i) => (
        <Callout
          key={c.label}
          label={c.label}
          value={c.value}
          anchor={c.anchor}
          mirror={c.mirror}
          innerRef={(el) => { refs.current[i] = el }}
        />
      ))}
    </FrameScrubSection>
  )
}
