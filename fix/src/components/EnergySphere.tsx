import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'

const SPHERE_RADIUS = 1.0

/**
 * Force-field / energy bubble sphere.
 * Two layered spheres:
 *  - Inner: hex grid pattern + slight fresnel
 *  - Outer: bright rim glow only (additive)
 */
export function EnergySphere() {
  const groupRef = useRef<THREE.Group>(null)

  const knobs = useControls('Energy Sphere', {
    color: '#22ddff',
    rimColor: '#7af0ff',
    hexScale: { value: 18, min: 4, max: 50, step: 1 },
    hexThickness: { value: 0.05, min: 0, max: 0.2, step: 0.005 },
    rimPower: { value: 2.5, min: 0.5, max: 8, step: 0.1 },
    glowIntensity: { value: 2.5, min: 0, max: 6, step: 0.1 },
    innerOpacity: { value: 0.35, min: 0, max: 1, step: 0.02 },
    rotateSpeed: { value: 0.18, min: 0, max: 2, step: 0.02 },
  })

  const innerMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(knobs.color) },
        uRimColor: { value: new THREE.Color(knobs.rimColor) },
        uHexScale: { value: knobs.hexScale },
        uHexThickness: { value: knobs.hexThickness },
        uRimPower: { value: knobs.rimPower },
        uGlow: { value: knobs.glowIntensity },
        uOpacity: { value: knobs.innerOpacity },
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform vec3 uRimColor;
        uniform float uHexScale;
        uniform float uHexThickness;
        uniform float uRimPower;
        uniform float uGlow;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;

        // hex tile distance — returns distance to nearest hex center in [0..0.5]
        float hexDist(vec2 p) {
          p = abs(p);
          float c = dot(p, normalize(vec2(1.0, 1.7320508)));
          c = max(c, p.x);
          return c;
        }

        float hexGrid(vec2 uv, float scale) {
          uv *= scale;
          vec2 r = vec2(1.0, 1.7320508);
          vec2 h = r * 0.5;
          vec2 a = mod(uv, r) - h;
          vec2 b = mod(uv - h, r) - h;
          vec2 gv = dot(a, a) < dot(b, b) ? a : b;
          float d = 0.5 - hexDist(gv);
          return d;
        }

        void main() {
          // hex pattern (thin lines)
          float h = hexGrid(vUv, uHexScale);
          float line = 1.0 - smoothstep(uHexThickness, uHexThickness + 0.02, h);
          // shimmer the hex lines slightly
          float pulse = 0.6 + 0.4 * sin(uTime * 1.5 + h * 30.0);
          line *= pulse;

          // fresnel rim
          float ndv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
          float fres = pow(1.0 - ndv, uRimPower);

          // base body color (semi-transparent cyan)
          vec3 body = uColor * 0.6;
          // hex lines brighten the body
          vec3 hexColor = mix(body, uColor * 1.5, line);
          // fresnel rim
          vec3 rim = uRimColor * uGlow;
          vec3 col = mix(hexColor, rim, fres);
          // alpha: base body opacity + brighter at hex lines and rim
          float a = uOpacity * 0.5 + line * 0.4 + fres * 0.7;
          gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
        }
      `,
    })
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * knobs.rotateSpeed
    innerMat.uniforms.uTime.value = state.clock.getElapsedTime()
    innerMat.uniforms.uColor.value.set(knobs.color)
    innerMat.uniforms.uRimColor.value.set(knobs.rimColor)
    innerMat.uniforms.uHexScale.value = knobs.hexScale
    innerMat.uniforms.uHexThickness.value = knobs.hexThickness
    innerMat.uniforms.uRimPower.value = knobs.rimPower
    innerMat.uniforms.uGlow.value = knobs.glowIntensity
    innerMat.uniforms.uOpacity.value = knobs.innerOpacity
  })

  return (
    <group ref={groupRef}>
      <mesh material={innerMat}>
        <sphereGeometry args={[SPHERE_RADIUS, 96, 96]} />
      </mesh>
      {/* outer rim-only shell, slightly larger, additive */}
      <mesh material={innerMat}>
        <sphereGeometry args={[SPHERE_RADIUS * 1.04, 96, 96]} />
      </mesh>
    </group>
  )
}
