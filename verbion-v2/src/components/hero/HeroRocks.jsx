import { useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import './HeroRocks.css'

const ROCK_COUNT  = 22
const FIELD_W     = 36   // match actual hFOV at this camera angle (~35 units wide)
const FIELD_D     = 3    // depth rows (z axis)
const ROCK_HALF_H = 0.347

const ROCK_PLACEMENTS = Array.from({ length: ROCK_COUNT }, (_, i) => {
  const spacing = FIELD_W / ROCK_COUNT
  const x    = -FIELD_W / 2 + spacing * i + spacing * 0.5 + (Math.random() - 0.5) * spacing * 0.35
  const z    = (Math.random() - 0.5) * FIELD_D
  const rotY = Math.random() * Math.PI * 2
  const rotX = (Math.random() - 0.5) * 0.10
  const scale = 1.6 + Math.random() * 1.4   // 1.6 – 3.0
  return { x, z, rotY, rotX, scale }
})

function Rock({ placement }) {
  const { scene } = useGLTF('/models/rock.glb')
  const clone = useMemo(() => scene.clone(true), [scene])

  // Place rock so its bottom (y = -ROCK_HALF_H * scale) sits at y = 0
  const groundY = ROCK_HALF_H * placement.scale

  return (
    <primitive
      object={clone}
      position={[placement.x, groundY, placement.z]}
      rotation={[placement.rotX, placement.rotY, 0]}
      scale={placement.scale}
    />
  )
}

useGLTF.preload('/models/rock.glb')

function Scene() {
  return (
    <>
      <ambientLight color="#7adbd3" intensity={0.7} />
      <directionalLight color="#d8f9f6" position={[0, 6, 4]} intensity={1.6} />
      <pointLight color="#1dc2b1" position={[-8, 3, 2]} intensity={0.6} distance={20} />
      <pointLight color="#adf0e8" position={[8, 1, -1]} intensity={0.3} distance={18} />

      <Suspense fallback={null}>
        {ROCK_PLACEMENTS.map((p, i) => (
          <Rock key={i} placement={p} />
        ))}
      </Suspense>
    </>
  )
}

export function HeroRocks({ visible = true }) {
  return (
    <div
      className="hero-rocks"
      aria-hidden="true"
      style={{ visibility: visible ? 'visible' : 'hidden', pointerEvents: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 1.8, 5], fov: 65 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
