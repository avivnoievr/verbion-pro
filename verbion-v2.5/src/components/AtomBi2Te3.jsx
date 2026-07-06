import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Glass-like PBR materials need an environment map to read as glass —
// RoomEnvironment is generated locally, no network fetch.
function EnvLight() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = env.texture
    return () => {
      scene.environment = null
      env.texture.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

// The Bi₂Te₃ atom: starts small at the page's heart, grows and spins
// faster as you scroll, then a light burst hands the story to the
// engine film — one continuous move, no page cut. `progress` is a
// mutable ref written by the section's scrubbed GSAP timeline.
function Atom({ progress }) {
  const group = useRef()
  const { scene } = useGLTF('/models/atom_opt.glb')

  useFrame((_, delta) => {
    const p = progress.current
    if (!group.current) return
    const s = 0.6 + p * 3.1
    group.current.scale.setScalar(s)
    group.current.rotation.y += delta * (0.35 + p * p * 9)
    group.current.rotation.x = Math.sin(p * Math.PI) * 0.35
    group.current.position.y = -0.15 + Math.sin(p * 6) * 0.04
  })

  return <primitive ref={group} object={scene} />
}

export default function AtomBi2Te3({ progress }) {
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '20%' },
    )
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <div className="atom-stage" aria-hidden="true" ref={wrapRef}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 5.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <EnvLight />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={2} color="#F4EFE8" />
        <directionalLight position={[-4, -2, 2]} intensity={2.4} color="#00B8B8" />
        <pointLight position={[0, 0, 3]} intensity={2} color="#7FF7F7" />
        <Suspense fallback={null}>
          <Atom progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/atom_opt.glb')
