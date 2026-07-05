import gsap from 'gsap'

// Leader-line callout anchored in IMAGE space, not viewport space.
// FrameScrubSection publishes --img-x/y/w/h (the cover-fit rect of the
// footage), so anchor [u, v] — fractions of the frame — lands the dot
// on the same pixel of the footage at any viewport size.
// Normal: dot at svg (30,6), text grows right. Mirror: dot at (170,6),
// text grows left. left/top offsets solve for the dot position.
export default function Callout({ label, value, anchor, mirror = false, innerRef }) {
  const dx = mirror ? 170 : 30
  const style = {
    left: `calc(var(--img-x, 0px) + var(--img-w, 100vw) * ${anchor[0]} - ${dx}px)`,
    top: `calc(var(--img-y, 0px) + var(--img-h, 100vh) * ${anchor[1]} - 6px)`,
  }
  return (
    <div className="callout" style={style} ref={innerRef}>
      <svg width="200" height="52" viewBox="0 0 200 52">
        {mirror ? (
          <>
            <path className="callout-line" d="M2,48 L128,48 L166,10" />
            <circle className="callout-dot" cx="170" cy="6" r="4" />
          </>
        ) : (
          <>
            <path className="callout-line" d="M198,48 L72,48 L34,10" />
            <circle className="callout-dot" cx="30" cy="6" r="4" />
          </>
        )}
      </svg>
      <div className="callout-text">
        <div className="callout-label">{label}</div>
        <div className="callout-value">{value}</div>
      </div>
    </div>
  )
}

// Standard reveal beats on a scrubbed 0..1 timeline: dot pops, line
// draws toward the text, text rises. `out` optional — omit to let the
// section's own fade-out carry it away. `speed` < 1 compresses the
// cadence for beats that live near the end of a pin.
export function addCalloutBeats(tl, el, at, out, speed = 1) {
  if (!el) return
  const line = el.querySelector('.callout-line')
  const dot = el.querySelector('.callout-dot')
  const text = el.querySelector('.callout-text')
  const len = line.getTotalLength()
  gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })
  const s = (v) => v * speed
  tl.to(el, { opacity: 1, duration: s(0.02) }, at)
    .fromTo(dot, { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: s(0.025) }, at)
    .to(line, { strokeDashoffset: 0, duration: s(0.05), ease: 'power1.out' }, at + s(0.015))
    .fromTo(text, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: s(0.045), ease: 'power2.out' }, at + s(0.04))
  if (out) tl.to(el, { opacity: 0, y: -14, duration: 0.035, ease: 'power1.in' }, out)
}
