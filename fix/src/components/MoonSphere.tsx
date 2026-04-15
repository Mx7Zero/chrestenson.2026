import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'

export function MoonSphere() {
  const groupRef = useRef<THREE.Group>(null)

  const diff = useLoader(THREE.TextureLoader, '/textures/8k_moon.jpg')

  diff.colorSpace = THREE.SRGBColorSpace
  diff.anisotropy = 16

  const knobs = useControls('Moon', {
    scale: { value: 1.81, min: 0.5, max: 2.5, step: 0.01 },
    bumpScale: { value: 0.06, min: 0, max: 1, step: 0.01 },
    displacementScale: { value: 0.012, min: 0, max: 0.3, step: 0.002 },
    displacementBias: { value: -0.006, min: -0.2, max: 0.2, step: 0.002 },
    roughness: { value: 1.0, min: 0, max: 1, step: 0.02 },
    rotateSpeed: { value: 0.04, min: 0, max: 1, step: 0.02 },
  })

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: diff,
      bumpMap: diff,
      displacementMap: diff,
      metalness: 0,
    })
    return m
  }, [diff])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * knobs.rotateSpeed
      groupRef.current.scale.setScalar(knobs.scale)
    }
    material.bumpScale = knobs.bumpScale
    material.displacementScale = knobs.displacementScale
    material.displacementBias = knobs.displacementBias
    material.roughness = knobs.roughness
  })

  return (
    <group ref={groupRef}>
      <mesh material={material} castShadow receiveShadow>
        <sphereGeometry args={[1.0, 512, 512]} />
      </mesh>
    </group>
  )
}
