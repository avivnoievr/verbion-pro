import { Canvas } from '@react-three/fiber'
import { GrassField } from './GrassField'

export function GrassCanvas() {
  return (
    <Canvas
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '38%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
      camera={{ position: [0, 0.8, 8], fov: 58 }}
      gl={{ antialias: false, alpha: true }}
    >
      <ambientLight intensity={1.1} color="#b8deff" />
      <directionalLight position={[4, 10, 5]} intensity={1.5} color="#fff8e0" />
      <GrassField />
    </Canvas>
  )
}
