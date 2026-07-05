import { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { BottleModel } from './BottleModel'

export function ProductCard3D({ color }) {
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef(null)

  return (
    <div
      ref={cardRef}
      className="pc__card pc__card--3d"
      style={{ '--card-glow': color.glow }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 3D canvas inside the swatch area */}
      <div className="pc__swatch pc__swatch--3d" style={{ '--swatch-ring': color.ring }}>
        <Canvas
          camera={{ position: [0, 0.5, 2.2], fov: 42 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: true }}
        >
          <BottleModel hovered={hovered} colorHex={color.hex} />
        </Canvas>

        {/* Hover hint */}
        <div className={`pc__hover-hint ${hovered ? 'pc__hover-hint--hidden' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C8 2 4 6 4 10c0 6 8 14 8 14s8-8 8-14c0-4-4-8-8-8z"/>
            <circle cx="12" cy="10" r="2.5"/>
          </svg>
          hover to rotate
        </div>
      </div>

      {/* Color chip + name */}
      <div className="pc__label">
        <div className="pc__color-chip" style={{ background: color.hex }} />
        <span className="pc__color-name">{color.name}</span>
        <span className="pc__color-sub">{color.sub}</span>
      </div>
    </div>
  )
}
