import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'

const SPHERE_RADIUS = 1.0

export function ConcreteSphere() {
  const groupRef = useRef<THREE.Group>(null)

  const [diff, normal, rough, disp] = useLoader(THREE.TextureLoader, [
    '/textures/concrete_diff_2k.jpg',
    '/textures/concrete_normal_2k.jpg',
    '/textures/concrete_rough_2k.jpg',
    '/textures/concrete_disp_2k.png',
  ])

  diff.colorSpace = THREE.SRGBColorSpace
  diff.anisotropy = 8
  ;[diff, normal, rough, disp].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
  })

  const knobs = useControls('Concrete', {
    displacementScale: { value: 0.5, min: 0, max: 1, step: 0.01 },
    displacementBias: { value: 0.3, min: -0.5, max: 0.5, step: 0.01 },
    normalScale: { value: 3.0, min: 0, max: 5, step: 0.05 },
    roughness: { value: 1.0, min: 0, max: 1, step: 0.02 },
    tiling: { value: 3, min: 1, max: 6, step: 1 },
    rotateSpeed: { value: 0.04, min: 0, max: 1, step: 0.02 },
  })

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: diff,
      normalMap: normal,
      roughnessMap: rough,
      displacementMap: disp,
      metalness: 0,
    })
    return m
  }, [diff, normal, rough, disp])

  useMemo(() => {
    diff.repeat.set(knobs.tiling, knobs.tiling)
    normal.repeat.set(knobs.tiling, knobs.tiling)
    rough.repeat.set(knobs.tiling, knobs.tiling)
    disp.repeat.set(knobs.tiling, knobs.tiling)
  }, [diff, normal, rough, disp, knobs.tiling])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * knobs.rotateSpeed
    material.displacementScale = knobs.displacementScale
    material.displacementBias = knobs.displacementBias
    material.normalScale.set(knobs.normalScale, knobs.normalScale)
    material.roughness = knobs.roughness
  })

  return (
    <group ref={groupRef}>
      <mesh material={material} castShadow receiveShadow>
        <sphereGeometry args={[SPHERE_RADIUS, 256, 256]} />
      </mesh>
    </group>
  )
}
