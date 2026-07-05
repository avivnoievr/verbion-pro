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
    // exploded stack: copper spreader / TEC sandwich — the dot rides
    // the plate down as the stack assembles (v 0.24 → 0.33)
    label: 'Bi₂Te₃ Peltier Stage',
    value: '30 W · 40×40 mm · solid-state',
    anchor: [0.487, 0.24],
    mirror: true,
    at: 0.632, // frame ~243, the moment the exploded stack lands
    out: 0.727, // gone just before the assembly cut at ~0.748
    speed: 0.8,
    track: { to: [0.48, 0.33], until: 0.745 },
  },
  {
    // assembled engine: right-hand fan pair, blasting the cyan burst
    label: 'Dual Centrifugal Fans',
    value: '30 mm · push–pull · 1.0 W',
    anchor: [0.635, 0.572],
    mirror: false,
    at: 0.755, // frame ~291, right as the engine assembles
    out: 0.862, // gone before the macro cut at ~0.894
    track: { to: [0.638, 0.59], until: 0.868 },
  },
  {
    // macro frost shot: copper loop exiting the fin stack — glides
    // with the slow push-in, stays to the very end
    label: 'Sintered Copper Heat Pipes',
    value: '2× Ø5 mm · design target',
    anchor: [0.83, 0.7],
    mirror: true,
    at: 0.898, // frame ~346, as the macro settles
    out: null, // rides the section fade-out
    speed: 0.7,
    track: { to: [0.85, 0.748], until: 1 },
  },
]

export default function XRay() {
  const refs = useRef([])
  const subtitleRef = useRef(null)

  const buildTimeline = (tl) => {
    // telemetry line lives inside the AI-bridge phase (video2)
    tl.fromTo(subtitleRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.4)
      .to(subtitleRef.current, { opacity: 0, y: -12, duration: 0.05, ease: 'power1.in' }, 0.58)
    refs.current.forEach((el, i) => addCalloutBeats(tl, el, CALLOUTS[i]))
  }

  return (
    <FrameScrubSection
      id="technology"
      frameBase="/frames/xray"
      frameCount={386}
      pin="+=320%"
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
