import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { BottleOnly } from './BottleOnly'

export function BottleCard({ color }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`pc__card${hovered ? ' pc__card--active' : ''}`}
      style={{ '--card-glow': color.glow }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="pc__swatch">
        {/* CSS hue-rotate shifts the texture hue — simpler than modifying GLB materials */}
        <div style={{ position: 'absolute', inset: 0, filter: color.cssFilter }}>
          <Canvas
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
            frameloop="always"
          >
            <BottleOnly hovered={hovered} />
          </Canvas>
        </div>
      </div>

      <div className="pc__label">
        <div className="pc__color-chip" style={{ background: color.hex }} />
        <span className="pc__color-name">{color.name}</span>
        <span className="pc__color-sub">{color.sub}</span>
      </div>
    </div>
  )
}
