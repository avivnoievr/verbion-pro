import { useWaitlist } from '../context/WaitlistContext'
import './ComingSoon.css'

export function ComingSoon() {
  const { open } = useWaitlist()

  return (
    <section className="cs">
      <div className="cs__glow" aria-hidden="true" />

      <div className="cs__inner">
        <span className="cs__badge">COMING SOON</span>

        <h2 className="cs__headline">
          VERBION <span className="accent">V2.5</span>
        </h2>
        <p className="cs__lead">
          The world's first active-cooling sports bottle.<br />
          Engineered for performance. Built for every session.
        </p>

        <div className="cs__price-block">
          <p className="cs__price-label">PRE-ORDER PRICE</p>
          <p className="cs__price">₪<strong>320</strong></p>
          <p className="cs__price-note">Limited early-adopter allocation · Ships when available</p>
        </div>

        <button className="cs__btn" type="button" onClick={open}>
          RESERVE YOURS →
        </button>

        <div className="cs__features">
          <div className="cs__feat">
            <span className="cs__feat-val">10°C</span>
            <span className="cs__feat-key">TARGET TEMP</span>
          </div>
          <div className="cs__feat">
            <span className="cs__feat-val">~5 HRS</span>
            <span className="cs__feat-key">ACTIVE USE</span>
          </div>
          <div className="cs__feat">
            <span className="cs__feat-val">30W</span>
            <span className="cs__feat-key">PELTIER TEC</span>
          </div>
          <div className="cs__feat">
            <span className="cs__feat-val">IP67</span>
            <span className="cs__feat-key">FULLY SEALED</span>
          </div>
        </div>

        <p className="cs__disclaimer">
          Pre-order secures your place in the first production run.
          No charge until shipping confirmation.
        </p>
      </div>

      <footer className="cs__footer">
        <p>© VERBION 2026</p>
        <nav className="cs__footer-nav" aria-label="Footer navigation">
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
          <a href="#">Specs</a>
        </nav>
      </footer>
    </section>
  )
}
