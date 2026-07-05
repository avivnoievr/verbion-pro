import RockBed from './RockBed.jsx'
import { useWaitlist } from '../context/WaitlistContext'

// Pre-order finale content. No section, no ScrollTrigger of its own —
// this layer lives inside Macro's pinned FrameScrubSection and is
// revealed by its scrubbed timeline over the film's held last frame
// (the closing shot is the backdrop; nothing "turns a page").
export default function CTAContent() {
  const { open } = useWaitlist()
  return (
    <div className="cta-layer">
      <div className="cta-gradient" />
      <div className="slab3d cta-slab" aria-hidden="true">V 2.5</div>
      <RockBed />
      <div className="cta-content">
        <h2 className="cta-word cta-word-1">COLD.</h2>
        <h2 className="cta-word cta-word-2">INTELLIGENT.</h2>
        <h2 className="cta-word cta-word-3">ENGINEERED.</h2>
        <div className="cta-specrow">750 ml · 265 mm · IP67 · BLE 5.2</div>
        <div className="cta-buttons">
          <button className="cta-btn primary" onClick={open}>PRE-ORDER 750ml</button>
          <button className="cta-btn ghost" onClick={open}>PRE-ORDER 1.5L</button>
        </div>
        <p className="cta-note">Early access. Limited first run.</p>
      </div>
      <footer className="site-footer">
        © 2026 VERBION. Specifications reflect confirmed values from Internal Structure Rev 2.
      </footer>
    </div>
  )
}
