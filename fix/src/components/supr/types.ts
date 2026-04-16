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

export type FoldType = 'abs' | 'inversion' | 'hybrid'
export type FillMode = 'edge' | 'fill' | 'gradient' | 'stripe'
export type ColorStrategy = 'mono' | 'spectrum' | 'depth' | 'angular' | 'distance'

export interface FoldFieldParams extends ModuleBase {
  folds: number
  iters: number
  speed: number
  zoom: number
  scale: number
  foldType: FoldType
  fillMode: FillMode
  colorStrategy: ColorStrategy
  lineWidthDecay: number // per-iteration line thinning (1.0 = no decay, 0.5 = halves each iter)
  drift: number // per-iteration rotation accumulator — highest sensitivity param per Q-1010
  fillWeight: number // 0 = pure edge, 1 = pure fill — blend between modes
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
  foldType: 'abs',
  fillMode: 'edge',
  colorStrategy: 'spectrum',
  lineWidthDecay: 1.0,
  drift: 0.05,
  fillWeight: 0.0,
  colorFg: '#f4f1ff',
  colorBg: '#05010a',
}

export const STAGE_DEFAULTS: StageParams = {
  cameraDrift: 0.3,
  background: '#020104',
  masterSpeed: 1,
}
