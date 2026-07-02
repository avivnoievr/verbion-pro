import { useEffect } from 'react'
import { initScroll } from './lib/scrollSetup'
import { SiteHeader } from './components/layout/SiteHeader'
import { VideoSection } from './components/VideoSection'
import { ProductCatalog } from './components/ProductCatalog'
import { WashSection } from './components/WashSection'
import { ComingSoon } from './components/ComingSoon'

function App() {
  useEffect(() => {
    const { destroy } = initScroll()
    return destroy
  }, [])

  return (
    <>
      <div
        id="vs-curtain"
        style={{ position: 'fixed', inset: 0, background: '#0a0a0c', zIndex: 9999, pointerEvents: 'none', opacity: 0, willChange: 'opacity' }}
      />
      <SiteHeader />
      <VideoSection />
      <WashSection />
      <ProductCatalog />
      <ComingSoon />
    </>
  )
}

export default App
