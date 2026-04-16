/** SUPR Visual System — shared types for the composition engine */

export type BlendMode = 'normal' | 'additive' | 'screen'

/** Every visual module shares this base */
export interface ModuleBase {
  enabled: boolean
  solo: boolean
  opacity: number
  blendMode: BlendMode
  zDepth: number
}

export interface LotusFieldParams extends ModuleBase {
  pattern: 'seedOfLife' | 'flowerOfLife' | 'metatron' | 'sriYantra' | 'hexGrid' | 'concentricRings'
  folds: number
  speed: number
  zoom: number
  lineWidth: number
  glow: number
  colorFg: string
  colorBg: string
}

export interface FoldFieldParams extends ModuleBase {
  folds: number
  iters: number
  speed: number
  zoom: number
  scale: number
  colorMode: 'mono' | 'spectrum'
  colorFg: string
  colorBg: string
}

export interface StageParams {
  cameraDrift: number
  background: string
  masterSpeed: number
}

export const LOTUS_DEFAULTS: LotusFieldParams = {
  enabled: true,
  solo: false,
  opacity: 1,
  blendMode: 'additive',
  zDepth: -20,
  pattern: 'flowerOfLife',
  folds: 0,
  speed: 0.1,
  zoom: 2.5,
  lineWidth: 2,
  glow: 0.3,
  colorFg: '#ffd700',
  colorBg: '#000000',
}

export const FOLD_DEFAULTS: FoldFieldParams = {
  enabled: true,
  solo: false,
  opacity: 0.7,
  blendMode: 'screen',
  zDepth: -10,
  folds: 6,
  iters: 8,
  speed: 0.12,
  zoom: 2.15,
  scale: 1.82,
  colorMode: 'spectrum',
  colorFg: '#f4f1ff',
  colorBg: '#05010a',
}

export const STAGE_DEFAULTS: StageParams = {
  cameraDrift: 0.3,
  background: '#020104',
  masterSpeed: 1,
}
