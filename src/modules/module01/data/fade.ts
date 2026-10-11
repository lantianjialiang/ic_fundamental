import type { Material } from 'three'

/**
 * PCB 板体（Load Board / Probe Card 的绿油、板边、丝印）的半透明。
 * 只有登记在这里的材质会变淡，其它部件始终正常显示；每帧由 AnimationDriver 调 applyBoardFade。
 */

type Entry = { base: number; transparent: boolean; depthWrite: boolean }

const entries = new Map<Material, Entry>()

export function registerBoardFade<M extends Material>(mat: M): M {
  if (!entries.has(mat)) {
    entries.set(mat, { base: mat.opacity, transparent: mat.transparent, depthWrite: mat.depthWrite })
    lastFade = -1
  }
  return mat
}

let lastFade = -1

/** fade 0..1：板体不透明度从 1 降到 0.3 */
export function applyBoardFade(fade: number) {
  if (Math.abs(fade - lastFade) < 1e-4) return
  lastFade = fade
  const k = 1 - 0.7 * fade
  const see = k < 0.999
  for (const [mat, e] of entries) {
    const transparent = e.transparent || see
    if (mat.transparent !== transparent) {
      mat.transparent = transparent
      mat.needsUpdate = true
    }
    // 半透明时不写深度：透明板体不会挡住板内的走线和过孔
    mat.depthWrite = see ? false : e.depthWrite
    mat.opacity = e.base * k
  }
}
