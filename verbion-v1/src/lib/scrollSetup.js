import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Drives Lenis from the GSAP ticker (instead of its own internal raf loop)
// so ScrollTrigger stays in sync with smoothed scroll position — the
// standard Lenis + GSAP ScrollTrigger integration pattern.
export function initScroll() {
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.10,
    wheelMultiplier: 1.0,
  })

  const onScroll = () => ScrollTrigger.update()
  lenis.on('scroll', onScroll)

  const onTick = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(onTick)
  gsap.ticker.lagSmoothing(0)

  function destroy() {
    gsap.ticker.remove(onTick)
    lenis.off('scroll', onScroll)
    lenis.destroy()
  }

  return { lenis, destroy }
}
