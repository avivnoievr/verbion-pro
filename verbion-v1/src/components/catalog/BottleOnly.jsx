import { useRef, Suspense, useMemo } from 'react'
import { useGLTF, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const FLOAT_AMP  = 0.022
const FLOAT_FREQ = 0.00085

function BottleScene({ hovered }) {
  const { scene } = useGLTF('/models/verbion-bottle.glb')

  const model = useMemo(() => {
    const cloned = scene.clone(true)
    cloned.traverse((node) => {
      if (!node.isMesh) return
      if (Array.isArray(node.material)) {
        node.material = node.material.map(m => { const c = m.clone(); c.needsUpdate = true; return c })
      } else if (node.material) {
        node.material = node.material.clone()
        node.material.needsUpdate = true
      }
    })
    return cloned
  }, [scene])

  const { offset, camZ } = useMemo(() => {
    const box  = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const c    = box.getCenter(new THREE.Vector3())
    const halfFov = (45 * Math.PI) / 180 / 2
    const z = (size.y * 0.5) / Math.tan(halfFov) * 1.62
    return { offset: c.clone().negate(), camZ: Math.max(z, 0.1) }
  }, [model])

  const ref = useRef()

  useFrame((_, delta) => {
    if (!ref.current) return
    if (hovered) {
      ref.current.rotation.y += delta * 1.1
    } else {
      ref.current.rotation.y += (0 - ref.current.rotation.y) * Math.min(1, delta * 2.2)
    }
    ref.current.position.y = offset.y + Math.sin(Date.now() * FLOAT_FREQ) * FLOAT_AMP
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, camZ]} fov={45} near={camZ * 0.01} far={camZ * 6} />
      <primitive ref={ref} object={model} position={[offset.x, offset.y, offset.z]} />
    </>
  )
}

export function BottleOnly({ hovered }) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 4, 3]}  intensity={1.6} />
      <directionalLight position={[-2, 2, -2]} intensity={0.35} color="#88aaff" />
      <Suspense fallback={null}>
        <BottleScene hovered={hovered} />
      </Suspense>
    </>
  )
}

useGLTF.preload('/models/verbion-bottle.glb')
