/**
 * SuprStage — the composition engine
 * Renders all enabled modules in z-order within a single Canvas.
 * Each module is a separate operator with its own params.
 * Global stage controls (camera, background, speed) live here.
 */

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { LotusField } from './LotusField'
import { FoldField } from './FoldField'
import type { LotusFieldParams, FoldFieldParams, StageParams } from './types'

function StageCamera({ stage }: { stage: StageParams }) {
  const { camera } = useThree()
  useFrame((state) => {
    const t = state.clock.elapsedTime * stage.masterSpeed * 0.3
    const drift = stage.cameraDrift
    camera.position.x = Math.sin(t * 0.5) * drift
    camera.position.y = Math.cos(t * 0.3) * drift * 0.6
    camera.lookAt(0, 0, -15)
  })
  return null
}

interface SuprStageProps {
  active: boolean
  stage: StageParams
  lotus: LotusFieldParams
  fold: FoldFieldParams
}

function SceneContent({ stage, lotus, fold }: Omit<SuprStageProps, 'active'>) {
  // Solo logic: if any module is solo'd, only render that one
  const anySolo = lotus.solo || fold.solo

  const showLotus = anySolo ? lotus.solo : lotus.enabled
  const showFold = anySolo ? fold.solo : fold.enabled

  return (
    <>
      <color attach="background" args={[stage.background]} />
      <StageCamera stage={stage} />

      {showLotus && <LotusField params={lotus} />}
      {showFold && <FoldField params={fold} />}
    </>
  )
}

export function SuprStage({ active, stage, lotus, fold }: SuprStageProps) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 5], fov: 60, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <SceneContent stage={stage} lotus={lotus} fold={fold} />
    </Canvas>
  )
}
