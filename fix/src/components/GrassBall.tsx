import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'

const SPHERE_RADIUS = 1.0
const INSTANCES_PER_CLUSTER = 2500

// per-cluster density weight
function clusterWeight(name: string): number {
  if (name.includes('seedling')) return 0.25
  if (name.includes('medium')) return 1.4
  if (name.includes('small')) return 2.2
  return 1.0
}

// seedlings get thin+tall non-uniform scale, others uniform
function clusterScale(name: string, rand: () => number): THREE.Vector3 {
  if (name.includes('seedling')) {
    const y = 1.8 + rand() * 0.8
    const xz = 0.4 + rand() * 0.25
    return new THREE.Vector3(xz, y, xz)
  }
  const s = 1.7 + rand() * 1.0
  return new THREE.Vector3(s, s, s)
}

useGLTF.preload('/textures/grass_clusters.glb')

function fibonacciSphere(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const phi = Math.PI * (Math.sqrt(5) - 1)
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = phi * i
    pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r))
  }
  return pts
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type ClusterMesh = {
  name: string
  geometry: THREE.BufferGeometry
  bladeHeight: number
}

function useClusterMeshes(): ClusterMesh[] {
  const gltf = useGLTF('/textures/grass_clusters.glb') as any
  return useMemo(() => {
    const out: ClusterMesh[] = []
    gltf.scene.updateMatrixWorld(true)
    gltf.scene.traverse((obj: any) => {
      // skip single-blade spikes — they look like CGI cones
      if (obj.name && obj.name.includes('single')) return
      if (obj.isMesh && obj.geometry) {
        const geo = obj.geometry.clone() as THREE.BufferGeometry
        // bake world transform (including export_yup root rotation) into verts
        geo.applyMatrix4(obj.matrixWorld)
        // find the longest axis to figure out which way is "up" in this cluster
        geo.computeBoundingBox()
        const bb = geo.boundingBox!
        const dx = bb.max.x - bb.min.x
        const dy = bb.max.y - bb.min.y
        const dz = bb.max.z - bb.min.z
        // if cluster's long axis is Z or X, rotate so long axis becomes Y
        if (dz > dy && dz > dx) {
          const m = new THREE.Matrix4().makeRotationX(-Math.PI / 2)
          geo.applyMatrix4(m)
        } else if (dx > dy && dx > dz) {
          const m = new THREE.Matrix4().makeRotationZ(Math.PI / 2)
          geo.applyMatrix4(m)
        }
        // recentre so base is at origin
        geo.computeBoundingBox()
        const bb2 = geo.boundingBox!
        const cx = (bb2.min.x + bb2.max.x) / 2
        const cz = (bb2.min.z + bb2.max.z) / 2
        geo.translate(-cx, -bb2.min.y, -cz)
        geo.computeBoundingBox()
        const h = geo.boundingBox!.max.y - geo.boundingBox!.min.y
        out.push({ name: obj.name, geometry: geo, bladeHeight: h })
      }
    })
    return out
  }, [gltf])
}

/**
 * Builds one merged InstancedMesh per cluster variant.
 * Distributes instances over the sphere with Fibonacci points,
 * each instance oriented along the sphere normal.
 */
function BladeInstances({
  clusters,
  colorMap,
  alphaMap,
}: {
  clusters: ClusterMesh[]
  colorMap: THREE.Texture
  alphaMap: THREE.Texture
}) {
  const groupData = useMemo(() => {
    const rand = mulberry32(42)
    const total = INSTANCES_PER_CLUSTER * clusters.length
    const points = fibonacciSphere(total)
    // shuffle so we don't place all of one cluster type in a stripe
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[points[i], points[j]] = [points[j], points[i]]
    }

    let cursor = 0
    return clusters.map((c) => {
      const count = Math.round(INSTANCES_PER_CLUSTER * clusterWeight(c.name))
      const matrices: THREE.Matrix4[] = []
      const tmpM = new THREE.Matrix4()
      const tmpQ = new THREE.Quaternion()
      const up = new THREE.Vector3(0, 1, 0)
      for (let i = 0; i < count; i++) {
        const p = points[(cursor + i) % points.length]
        const pos = p.clone().multiplyScalar(SPHERE_RADIUS)
        // orient +Y (blade up in local space) to p (sphere normal)
        tmpQ.setFromUnitVectors(up, p)
        // random twist around blade axis
        const twist = new THREE.Quaternion().setFromAxisAngle(p, rand() * Math.PI * 2)
        tmpQ.premultiply(twist)
        // scale — tall/thin for seedlings, uniform for the rest
        const scale = clusterScale(c.name, rand)
        tmpM.compose(pos, tmpQ, scale)
        matrices.push(tmpM.clone())
      }
      cursor += count
      return { cluster: c, matrices }
    })
  }, [clusters])

  const knobs = useControls('Grass v2', {
    alphaTest: { value: 0.4, min: 0, max: 1, step: 0.01 },
    roughness: { value: 0.85, min: 0, max: 1, step: 0.01 },
    transmission: { value: 0.25, min: 0, max: 1, step: 0.01 },
    thickness: { value: 0.3, min: 0, max: 2, step: 0.05 },
    ior: { value: 1.3, min: 1, max: 2.33, step: 0.01 },
    colorTint: '#9bd06a',
    envIntensity: { value: 0.08, min: 0, max: 3, step: 0.02 },
  })

  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: colorMap,
      alphaMap,
      transparent: true,
      side: THREE.DoubleSide,
      metalness: 0,
    })
  }, [colorMap, alphaMap])

  useEffect(() => {
    material.alphaTest = knobs.alphaTest
    material.roughness = knobs.roughness
    material.transmission = knobs.transmission
    material.thickness = knobs.thickness
    material.ior = knobs.ior
    material.color = new THREE.Color(knobs.colorTint)
    material.envMapIntensity = knobs.envIntensity
    material.needsUpdate = true
  }, [material, knobs])

  return (
    <>
      {groupData.map(({ cluster, matrices }, idx) => (
        <InstancedBladeGroup
          key={cluster.name + idx}
          geometry={cluster.geometry}
          material={material}
          matrices={matrices}
        />
      ))}
    </>
  )
}

function InstancedBladeGroup({
  geometry,
  material,
  matrices,
}: {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  matrices: THREE.Matrix4[]
}) {
  return (
    <instancedMesh
      ref={(el) => {
        if (!el) return
        matrices.forEach((m, i) => el.setMatrixAt(i, m))
        el.instanceMatrix.needsUpdate = true
      }}
      args={[geometry, material, matrices.length]}
      castShadow
      receiveShadow
    />
  )
}

export function GrassBall() {
  const groupRef = useRef<THREE.Group>(null)
  const [diff, alpha] = useLoader(THREE.TextureLoader, [
    '/textures/grass_diff_2k.jpg',
    '/textures/grass_alpha_2k.png',
  ])
  diff.wrapS = diff.wrapT = THREE.RepeatWrapping
  diff.anisotropy = 8
  diff.colorSpace = THREE.SRGBColorSpace
  alpha.wrapS = alpha.wrapT = THREE.RepeatWrapping

  const clusters = useClusterMeshes()

  // rotation now driven by scroll in GrassBallScene; no idle spin
  void useFrame

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[SPHERE_RADIUS * 0.96, 96, 96]} />
        <meshStandardMaterial color="#5a6b30" roughness={1} metalness={0} envMapIntensity={0.08} />
      </mesh>
      <BladeInstances clusters={clusters} colorMap={diff} alphaMap={alpha} />
    </group>
  )
}
