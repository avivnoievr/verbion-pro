import { useRef } from 'react'
import { GrassCanvas } from './catalog/GrassCanvas'
import { BottleCard } from './catalog/BottleCard'
import { PaintBrush } from './PaintBrush'
import './ProductCatalog.css'

// cssFilter: rotate the texture hue into the target colour.
// Bottle body hue is ~222°. Rotation = target_H - 222.
const COLORS = [
  { id: 'blue',  name: 'OCEAN',  sub: 'Royal Blue',   hex: '#1155DD', glow: 'rgba(17,85,221,0.28)',    cssFilter: 'none' },
  { id: 'red',   name: 'EMBER',  sub: 'Crimson Red',  hex: '#CC1133', glow: 'rgba(204,17,51,0.28)',    cssFilter: 'hue-rotate(126deg) saturate(1.3)' },
  { id: 'green', name: 'SUMMIT', sub: 'Forest Green', hex: '#22CC44', glow: 'rgba(34,204,68,0.28)',    cssFilter: 'hue-rotate(-92deg) saturate(1.1)' },
  { id: 'white', name: 'FROST',  sub: 'Arctic White', hex: '#E8EDF2', glow: 'rgba(200,220,255,0.18)',  cssFilter: 'saturate(0.08) brightness(1.55)' },
]

export function ProductCatalog() {
  const sectionRef = useRef(null)

  return (
    <section className="pc" ref={sectionRef} id="specs">

      {/* ── Background: grass Three.js canvas at section bottom ─── */}
      <GrassCanvas />

      {/* ── Brush cursor ──────────────────────────────────────────── */}
      <PaintBrush
        containerRef={sectionRef}
        blendMode="overlay"
        color="#00e8c0"
        blobSize={280}
        maxWidth={85}
      />

      {/* ── HTML content ──────────────────────────────────────────── */}
      <div className="pc__inner">
        <p className="pc__eyebrow">CHOOSE YOUR FINISH</p>
        <h2 className="pc__headline">
          YOUR COLOUR.<br />
          <span className="accent">YOUR VERBION.</span>
        </h2>
        <p className="pc__sub">
          Every finish. Same <span className="accent">10°C</span> performance.
          Same <span className="accent">30W</span> Peltier engine inside.
        </p>

        <div className="pc__grid">
          {COLORS.map((c) => (
            <BottleCard key={c.id} color={c} />
          ))}
        </div>
      </div>

    </section>
  )
}
