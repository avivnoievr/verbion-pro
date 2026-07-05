import { useRef, Suspense } from 'react'
import { useGLTF, Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

function Model({ hovered, colorHex }) {
  const { scene } = useGLTF('/models/verbion-bottle.glb')
  const ref = useRef()
  const targetY = useRef(0)

  useFrame((_, delta) => {
    if (!ref.current) return
    if (hovered) {
      ref.current.rotation.y += delta * 1.1
    } else {
      // Smoothly return to rest
      ref.current.rotation.y += (0 - ref.current.rotation.y) * 0.05
    }
    // Gentle float
    ref.current.position.y = Math.sin(Date.now() * 0.001) * 0.03
  })

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={0.55}
      position={[0, -0.4, 0]}
    />
  )
}

export function BottleModel({ hovered, colorHex }) {
  return (
    <Suspense fallback={null}>
      <Environment preset="city" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 6, 4]} intensity={1.4} />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#88ccff" />
      <Model hovered={hovered} colorHex={colorHex} />
    </Suspense>
  )
}

// Preload so all cards share the same cached parse
useGLTF.preload('/models/verbion-bottle.glb')
