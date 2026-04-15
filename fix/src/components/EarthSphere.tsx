import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'

export function EarthSphere() {
  const groupRef = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)

  const [diff, normal, spec, clouds] = useLoader(THREE.TextureLoader, [
    '/textures/8k_earth_daymap.jpg',
    '/textures/2k_earth_normal_map.jpg',
    '/textures/2k_earth_specular_map.jpg',
    '/textures/8k_earth_clouds.jpg',
  ])

  diff.colorSpace = THREE.SRGBColorSpace
  clouds.colorSpace = THREE.SRGBColorSpace
  ;[diff, normal, spec, clouds].forEach((t) => { t.anisotropy = 16 })

  const knobs = useControls('Earth', {
    scale: { value: 1.81, min: 0.5, max: 2.5, step: 0.01 },
    normalScale: { value: 0.6, min: 0, max: 5, step: 0.05 },
    displacementScale: { value: 0.008, min: 0, max: 0.2, step: 0.002 },
    displacementBias: { value: -0.004, min: -0.2, max: 0.2, step: 0.002 },
    landRoughness: { value: 0.9, min: 0, max: 1, step: 0.02 },
    waterMetalness: { value: 0.9, min: 0, max: 1, step: 0.02 },
    cloudOpacity: { value: 0.7, min: 0, max: 1, step: 0.02 },
    cloudOffset: { value: 0.005, min: 0, max: 0.05, step: 0.001 },
    rotateSpeed: { value: 0.04, min: 0, max: 1, step: 0.02 },
    cloudDrift: { value: 0.003, min: 0, max: 0.05, step: 0.001 },
    startLongitudeDeg: { value: 180, min: -180, max: 180, step: 1 },
  })

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: diff,
      normalMap: normal,
      metalnessMap: spec,
      displacementMap: diff,
      metalness: 0.9,
      roughness: 0.9,
    })
    return m
  }, [diff, normal, spec])

  const cloudsMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: clouds,
      alphaMap: clouds,
      transparent: true,
      depthWrite: false,
      opacity: 0.7,
      roughness: 1,
      metalness: 0,
    })
  }, [clouds])

  useFrame((state, delta) => {
    if (groupRef.current) {
      const startRad = (knobs.startLongitudeDeg * Math.PI) / 180
      groupRef.current.rotation.y = startRad + state.clock.elapsedTime * knobs.rotateSpeed
      groupRef.current.scale.setScalar(knobs.scale)
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * knobs.cloudDrift
      cloudsRef.current.scale.setScalar(1 + knobs.cloudOffset)
    }
    material.normalScale.set(knobs.normalScale, knobs.normalScale)
    material.displacementScale = knobs.displacementScale
    material.displacementBias = knobs.displacementBias
    material.roughness = knobs.landRoughness
    material.metalness = knobs.waterMetalness
    cloudsMaterial.opacity = knobs.cloudOpacity
  })

  return (
    <group ref={groupRef}>
      <mesh material={material} castShadow receiveShadow>
        <sphereGeometry args={[1.0, 512, 512]} />
      </mesh>
      <mesh ref={cloudsRef} material={cloudsMaterial}>
        <sphereGeometry args={[1.0, 256, 256]} />
      </mesh>
    </group>
  )
}
