import { motion } from 'framer-motion'
import './SiteHeader.css'

const NAV_LINKS = [
  { label: 'Home',  href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Specs', href: '#specs' },
]

const pill = {
  whileHover: { scale: 1.05, y: -1 },
  whileTap:   { scale: 0.95 },
  transition: { type: 'spring', stiffness: 380, damping: 22 },
}

export function SiteHeader() {
  return (
    <header className="site-header">
      {/* Brand */}
      <div className="site-header__brand">
        <svg
          className="site-header__logo"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="18" r="5"  fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 28c4-3 8-3 12 0s8 3 12 0s4-3 4-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 33c4-3 8-3 12 0s8 3 12 0s4-3 4-3" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
        </svg>
        <span className="site-header__wordmark">VERBION</span>
      </div>

      {/* Nav with individual glass chips */}
      <nav className="site-header__nav">
        {NAV_LINKS.map(({ label, href }) => (
          <motion.a
            key={label}
            href={href}
            className="sh-pill"
            {...pill}
          >
            {label}
          </motion.a>
        ))}

        {/* Accent CTA chip */}
        <motion.a
          href="#buy"
          className="sh-pill sh-pill--cta"
          {...pill}
        >
          Pre-Order&nbsp;₪320
        </motion.a>
      </nav>
    </header>
  )
}
