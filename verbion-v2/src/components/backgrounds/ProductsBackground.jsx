import './ProductsBackground.css'

/**
 * Page 3 — Products background
 * Deep warm charcoal (#1f1c1b). A bold organic divider at the top
 * signals the section boundary — no tech / electrical feel.
 */
export function ProductsBackground() {
  return (
    <div className="products-bg" aria-hidden="true">
      <div className="products-bg__divider">
        <svg
          className="products-bg__divider-svg"
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bold organic brush-stroke rule — warm, irregular, not digital */}
          <path
            d="M0,24 C120,8 280,38 480,22 C620,12 720,36 900,20 C1060,6 1200,34 1440,24"
            stroke="rgba(255,248,240,0.13)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M0,28 C180,42 340,14 560,30 C740,44 860,10 1080,28 C1240,42 1360,18 1440,28"
            stroke="rgba(255,248,240,0.07)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Thick bold center stroke */}
          <path
            d="M0,24 C200,16 400,32 720,24 C1040,16 1240,32 1440,24"
            stroke="rgba(255,248,240,0.22)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Subtle warm vignette — corners darker than center */}
      <div className="products-bg__vignette" />
    </div>
  )
}
