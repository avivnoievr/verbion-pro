import { useEffect, useState } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a className="nav-wordmark" href="#top">VERBION</a>
      <nav className="nav-right">
        <a className="nav-link" href="#technology">Technology</a>
        <a className="nav-link" href="#specs">Specs</a>
        <a className="nav-link" href="#preorder">Pre-Order</a>
        <a href="#preorder"><button className="nav-cta">PRE-ORDER NOW</button></a>
      </nav>
    </header>
  )
}
