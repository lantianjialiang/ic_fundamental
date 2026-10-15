// 本课所有数值都从这里的公式算出来，页面和图只读结果（示意参数）
import { microstripZ0 } from './pcbBasicsModel'

/* ---------- 去耦电容回路 ---------- */

export const MM_PX = 12 // 图上 1 mm 画多少像素
export const ESL_NH = 0.5 // 0402 电容自身
export const VIA_NH = 0.4 // 每个过孔
export const TRACE_NH_PER_MM = 0.8 // 参考平面上方的走线
export const LOOP_VIAS = 2 // 电容地端一个，芯片地脚一个
export const STEP_A = 0.05
export const STEP_S = 1e-9
export const CHECK_HZ = 100e6

export type DecapId = 'far' | 'mid' | 'near'

export const DECAP_DIST_MM: Record<DecapId, number> = { far: 12, mid: 5, near: 1.5 }

export function loopNh(distMm: number) {
  return ESL_NH + VIA_NH * LOOP_VIAS + TRACE_NH_PER_MM * distMm
}

export function impedanceOhm(nh: number, hz: number) {
  return 2 * Math.PI * hz * nh * 1e-9
}

export function dipVolt(nh: number) {
  return (nh * 1e-9 * STEP_A) / STEP_S
}

/* ---------- 差分对阻抗 ---------- */

export const DIFF_ER = 4.3
export const DIFF_H = 0.2 // mm，外层到参考平面
export const USB_ZDIFF = 90
export const USB_TOL = 0.15

/** 微带边沿耦合差分阻抗的常用近似：Zdiff = 2·Z0·(1 − 0.48·exp(−0.96·s/h)) */
export function diffZ(w: number, s: number) {
  const z0 = microstripZ0(DIFF_ER, DIFF_H, w)
  return 2 * z0 * (1 - 0.48 * Math.exp((-0.96 * s) / DIFF_H))
}

export function diffInSpec(z: number) {
  return Math.abs(z - USB_ZDIFF) <= USB_ZDIFF * USB_TOL
}

/* ---------- 散热过孔 ---------- */

export const CU_K = 385 // W/(m·K)
export const BOARD_MM = 1.6
export const DRILL_MM = 0.3
export const PLATE_UM = 25

/** 一个镀铜过孔筒的热阻（K/W）：L / (k·A)，A 为铜环截面积 */
export function viaTheta() {
  const ri = DRILL_MM / 2
  const ro = ri + PLATE_UM / 1000
  const area = Math.PI * (ro * ro - ri * ri) * 1e-6
  return (BOARD_MM * 1e-3) / (CU_K * area)
}

export function viaArrayTheta(count: number) {
  return viaTheta() / Math.max(1, count)
}
