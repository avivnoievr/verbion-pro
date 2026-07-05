import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BLADE_COUNT = 6000
const FIELD_W = 28
const FIELD_D = 14

// Three.js automatically injects instanceMatrix for InstancedMesh — do NOT redeclare it
const vertexShader = /* glsl */ `
  uniform float uTime;
  varying float vHeight;

  void main() {
    vHeight = uv.y;
    vec3 pos = position;

    // Get instance world position from the translation column
    vec3 instancePos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);

    // Wind: only tip sways (quadratic rolloff from base)
    float sway  = uv.y * uv.y;
    float phase = uTime * 1.4 + instancePos.x * 3.8 + instancePos.z * 2.6;
    pos.x += sin(phase)        * 0.10 * sway;
    pos.z += cos(phase * 0.75) * 0.04 * sway;

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying float vHeight;

  void main() {
    vec3 base = vec3(0.03, 0.14, 0.04);
    vec3 tip  = vec3(0.20, 0.65, 0.14);
    vec3 col  = mix(base, tip, pow(vHeight, 1.3));

    // Ambient occlusion darkening at blade base
    col *= 0.48 + 0.52 * smoothstep(0.0, 0.3, vHeight);

    gl_FragColor = vec4(col, 1.0);
  }
`

export function GrassField() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.032, 0.38, 1, 4)
    geo.translate(0, 0.19, 0) // pivot at bottom edge
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uTime: { value: 0 } },
        side: THREE.DoubleSide,
      }),
    []
  )

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta
  })

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const initialized = useRef(false)

  return (
    <instancedMesh
      ref={(mesh) => {
        if (!mesh || initialized.current) return
        initialized.current = true
        for (let i = 0; i < BLADE_COUNT; i++) {
          dummy.position.set(
            (Math.random() - 0.5) * FIELD_W,
            0,
            (Math.random() - 0.5) * FIELD_D
          )
          dummy.rotation.y = Math.random() * Math.PI * 2
          dummy.scale.setScalar(0.65 + Math.random() * 0.7)
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
        }
        mesh.instanceMatrix.needsUpdate = true
      }}
      args={[geometry, material, BLADE_COUNT]}
    />
  )
}
