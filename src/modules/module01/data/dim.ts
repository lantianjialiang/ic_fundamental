import type { Material } from 'three'

/**
 * 「只看路径」与「板子半透明」的统一淡化。
 * 场景里所有部件的材质都在这里登记；每帧由 AnimationDriver 调 applyFade 统一改透明度。
 * 高亮路径用的材质不登记，所以始终不透明、写深度，不会被淡化的部件挡住或闪烁。
 */

type Entry = { base: number; transparent: boolean; depthWrite: boolean; board: boolean }

const entries = new Map<Material, Entry>()

/** 「只看路径」时其它部件的不透明度 */
export const DIM_OPACITY = 0.1

/** board=true：分解 / 剖开 / 选中通道时额外变半透明（PCB 板体），用来看到内层走线 */
export function registerDim<M extends Material>(mat: M, board = false): M {
  if (!entries.has(mat)) {
    entries.set(mat, { base: mat.opacity, transparent: mat.transparent, depthWrite: mat.depthWrite, board })
    lastKey = ''
  }
  return mat
}

let lastKey = ''

export function applyFade(boardFade: number, dim: number) {
  const key = `${boardFade.toFixed(4)}|${dim.toFixed(4)}`
  if (key === lastKey) return
  lastKey = key
  const dimK = 1 - dim * (1 - DIM_OPACITY)
  const boardK = 1 - 0.7 * boardFade
  for (const [mat, e] of entries) {
    const k = e.board ? Math.min(boardK, dimK) : dimK
    const see = k < 0.999
    const transparent = e.transparent || see
    // 半透明时不写深度：透明部件之间不互相遮挡，避免排序闪烁
    const depthWrite = see ? false : e.depthWrite
    if (mat.transparent !== transparent) {
      mat.transparent = transparent
      mat.needsUpdate = true
    }
    mat.depthWrite = depthWrite
    mat.opacity = e.base * k
  }
}
