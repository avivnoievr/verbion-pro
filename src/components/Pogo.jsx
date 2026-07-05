import { useRef } from 'react'
import FrameScrubSection from './FrameScrubSection.jsx'
import Callout, { addCalloutBeats } from './Callout.jsx'

// video5 (145 frames, t = frame / 144), white studio light — tone="light".
// Phases: separated modules wide shot ~0–45, macro push-in on the gold
// 8-pin pogo ring ~55–100, vessel seating onto the dock with the cyan
// activation ring ~105–145. The story: everything electric lives in
// the dock — lift the vessel off, rinse it, lock it back on.
const CALLOUTS = [
  {
    // wide shot: the blue vessel, free of its electronics
    label: 'Wash-Safe Vessel',
    value: 'Rinse under the tap · dock stays dry',
    anchor: [0.445, 0.22],
    mirror: true,
    at: 0.09, // frame ~13
    out: 0.3, // frame ~43, before the push-in
  },
  {
    // macro: gold spring pins on the bayonet ring
    label: '8-Pin Pogo Array',
    value: 'Power + telemetry · keyed bayonet',
    anchor: [0.475, 0.525],
    mirror: false,
    at: 0.44, // frame ~64
    out: 0.66, // frame ~95, before docking begins
  },
  {
    // docking: cyan activation ring as the halves meet
    label: 'Locked & Live',
    value: 'Seated · sealed · ready to chill',
    anchor: [0.5, 0.66],
    mirror: false,
    at: 0.78, // frame ~113
    out: null, // rides the section fade-out
  },
]

export default function Pogo() {
  const refs = useRef([])
  const subtitleRef = useRef(null)

  const buildTimeline = (tl) => {
    tl.fromTo(subtitleRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.1)
      .to(subtitleRef.current, { opacity: 0, y: -12, duration: 0.05, ease: 'power1.in' }, 0.36)
    refs.current.forEach((el, i) => addCalloutBeats(tl, el, CALLOUTS[i].at, CALLOUTS[i].out))
  }

  return (
    <FrameScrubSection
      id="dock"
      frameBase="/frames/pogo"
      frameCount={145}
      pin="+=170%"
      scrub={1}
      poster={128}
      fadeIn
      fadeOut
      sheet
      tone="light"
      buildTimeline={buildTimeline}
    >
      <div className="section-eyebrow">
        Two-Module Design
        <strong>Splits to wash. Locks to chill.</strong>
      </div>
      <div className="xray-subtitle" ref={subtitleRef}>
        Everything electric lives below the line.
        <span>The vessel above rinses clean.</span>
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
