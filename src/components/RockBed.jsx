import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

const PLACEMENTS = [
  { p: [-5.6, -0.55, -1.6], s: 1.7, r: 0.4 },
  { p: [-3.2, -0.7, -0.4], s: 1.05, r: 2.1 },
  { p: [-1.4, -0.8, -1.9], s: 2.2, r: 4.4 },
  { p: [0.4, -0.75, -0.7], s: 0.85, r: 1.2 },
  { p: [1.9, -0.6, -1.4], s: 1.5, r: 5.3 },
  { p: [3.6, -0.8, -0.5], s: 1.0, r: 3.0 },
  { p: [5.4, -0.55, -1.7], s: 1.9, r: 0.9 },
  { p: [7.2, -0.85, -0.9], s: 1.2, r: 2.6 },
]

function Rocks() {
  const group = useRef()
  const { scene } = useGLTF('/models/rock_opt.glb')
  const rockGeo = useMemo(() => {
    let geo = null
    scene.traverse((o) => { if (!geo && o.isMesh) geo = o.geometry })
    return geo
  }, [scene])

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.03
  })

  if (!rockGeo) return null
  return (
    <group ref={group}>
      {PLACEMENTS.map((r, i) => (
        <mesh key={i} geometry={rockGeo} position={r.p} rotation={[0, r.r, 0]} scale={r.s}>
          <meshStandardMaterial color="#16181a" roughness={0.92} metalness={0.08} />
        </mesh>
      ))}
    </group>
  )
}

export default function RockBed() {
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(false)

  // Only run the WebGL loop while the bed is actually on screen —
  // an always-on render loop drags every scrub section down with it.
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '20%' },
    )
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <div className="rockbed" aria-hidden="true" ref={wrapRef}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0.4, 6.5], fov: 38 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      >
        <fog attach="fog" args={['#0A0A0A', 6, 12]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[-4, 3, 2]} intensity={0.9} color="#F4EFE8" />
        <directionalLight position={[3, 1.2, -3]} intensity={1.6} color="#00B8B8" />
        <directionalLight position={[6, 0.6, 2]} intensity={0.5} color="#F59E0B" />
        <Suspense fallback={null}>
          <Rocks />
        </Suspense>
      </Canvas>
      <div className="rockbed-fade" />
    </div>
  )
}

useGLTF.preload('/models/rock_opt.glb')
