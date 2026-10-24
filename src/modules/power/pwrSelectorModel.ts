/**
 * PWR-01 器件选型的教学模型（DeviceSelectorLab）。
 * 器件数值全部是虚构的教学示意值，不对应任何真实型号；导通与开关损耗都是教学简化估算。
 * 导通损耗直接调用 core/power.ts 的 conductionLoss（P = I²R）。
 */
import { conductionLoss } from './core/power'

export type DeviceType = 'si-mos' | 'igbt' | 'sic-mos' | 'gan-hemt'

/** 器件类型，显示顺序即数组顺序；默认取 [0] */
export const DEVICE_TYPES: DeviceType[] = ['si-mos', 'igbt', 'sic-mos', 'gan-hemt']

/** 额定耐压档位（V），显示顺序即数组顺序；默认取 [0] */
export const RATINGS: number[] = [20, 30, 60, 100, 200, 650, 1200]

/** 教学示意：Rds(on)（mΩ），与 RATINGS 一一对齐；null 表示教学表里没有这一档。IGBT 不用 Rds(on)，整行为 null。 */
export const RDS_MOHM: Record<DeviceType, Array<number | null>> = {
  'si-mos': [1.0, 1.5, 4.0, 5.0, 25, 150, null],
  igbt: [null, null, null, null, null, null, null],
  'sic-mos': [null, null, null, null, null, 45, 60],
  'gan-hemt': [null, null, 8, 10, 35, 50, null],
}

/** 教学示意：IGBT 的饱和压降 Vce(sat)（V），与 RATINGS 对齐；其它类型为 null */
export const VCE_SAT_V: Array<number | null> = [null, null, null, null, null, 1.6, 2.0]

/** 教学示意：开关时间 t_sw（ns）。IGBT 的 t_sw 包含关断拖尾，所以最长 */
export const T_SW_NS: Record<DeviceType, number> = {
  'si-mos': 20,
  igbt: 300,
  'sic-mos': 30,
  'gan-hemt': 10,
}

/** 合适的耐压：额定耐压 / 母线电压 落在 [MIN, MAX] 之内（教学经验） */
export const RATIO_MIN = 1.5
export const RATIO_MAX = 2

export type AppId = 'dcdc12' | 'pfc400' | 'auto800' | 'charger400'

export type AppSpec = {
  id: AppId
  /** 母线电压（V） */
  busV: number
  /** 导通电流（A），教学取值 */
  currentA: number
  /** 开关频率（Hz），教学取值 */
  fswHz: number
}

/** 四个应用，显示顺序即数组顺序；默认取 [0] */
export const APPS: AppSpec[] = [
  { id: 'dcdc12', busV: 12, currentA: 10, fswHz: 500e3 },
  { id: 'pfc400', busV: 400, currentA: 5, fswHz: 65e3 },
  { id: 'auto800', busV: 800, currentA: 50, fswHz: 10e3 },
  { id: 'charger400', busV: 400, currentA: 2, fswHz: 100e3 },
]

/** 某个应用上所选的器件类型与额定耐压 */
export type DevicePick = { type: DeviceType; rating: number }

export const DEFAULT_PICK: DevicePick = { type: DEVICE_TYPES[0], rating: RATINGS[0] }

export type SelectorState = {
  /** 当前应用 */
  appId: AppId
  /** 每个应用各自的选择（切换应用不丢失） */
  picks: Record<AppId, DevicePick>
  /** 导通损耗小计算器：电流（A）与 Rds(on)（mΩ） */
  calcI: number
  calcR: number
}

export function defaultSelector(): SelectorState {
  const picks = Object.fromEntries(APPS.map((app) => [app.id, { ...DEFAULT_PICK }])) as Record<AppId, DevicePick>
  return { appId: APPS[0].id, picks, calcI: 20, calcR: 5 }
}

export function appOf(id: AppId): AppSpec {
  const found = APPS.find((app) => app.id === id)
  return found ?? APPS[0]
}

export type RatingFit = 'ok' | 'low' | 'high'

/** 耐压判断：额定 / 母线 在 [1.5, 2] 之内为 ok，低于为 low，高于为 high */
export function ratingFit(app: AppSpec, rating: number): RatingFit {
  const ratio = rating / app.busV
  if (ratio < RATIO_MIN) {
    return 'low'
  }
  if (ratio > RATIO_MAX) {
    return 'high'
  }
  return 'ok'
}

export type Loss = {
  /** 教学表里是否有这一档器件 */
  offered: boolean
  /** 导通损耗（W） */
  conduction: number
  /** 开关损耗（W），教学简化公式 ½·V·I·t_sw·f */
  switching: number
  /** 合计（W） */
  total: number
}

const NOT_OFFERED: Loss = { offered: false, conduction: 0, switching: 0, total: 0 }

/** 某应用、某器件、某耐压下的粗估损耗（教学简化估算） */
export function lossOf(app: AppSpec, pick: DevicePick): Loss {
  const idx = RATINGS.indexOf(pick.rating)
  let conduction: number | null = null
  if (pick.type === 'igbt') {
    const vce = VCE_SAT_V[idx]
    conduction = vce === null || vce === undefined ? null : vce * app.currentA
  } else {
    const rMohm = RDS_MOHM[pick.type][idx]
    conduction = rMohm === null || rMohm === undefined ? null : conductionLoss(app.currentA, rMohm / 1000)
  }
  if (conduction === null) {
    return NOT_OFFERED
  }
  const switching = 0.5 * app.busV * app.currentA * (T_SW_NS[pick.type] * 1e-9) * app.fswHz
  return { offered: true, conduction, switching, total: conduction + switching }
}

/** 参数分类：静态 / 动态 / 极限 / 热 */
export type ParamClass = 'static' | 'dynamic' | 'limit' | 'thermal'

export type ParamId =
  | 'bvdss'
  | 'rdson'
  | 'vth'
  | 'qg'
  | 'coss'
  | 'qrr'
  | 'eas'
  | 'soa'
  | 'tsc'
  | 'rthjc'
  | 'rthja'
  | 'zth'

/** 12 个参数的分类，每类 3 个；每个参数只出现一次 */
export const PARAM_GROUPS: Array<{ cls: ParamClass; params: ParamId[] }> = [
  { cls: 'static', params: ['bvdss', 'rdson', 'vth'] },
  { cls: 'dynamic', params: ['qg', 'coss', 'qrr'] },
  { cls: 'limit', params: ['eas', 'soa', 'tsc'] },
  { cls: 'thermal', params: ['rthjc', 'rthja', 'zth'] },
]

/** 所有参数，按分类组的顺序排列 */
export const PARAM_IDS: ParamId[] = PARAM_GROUPS.flatMap((group) => group.params)

/** 参数所属的类（正确答案）；找不到时返回 undefined */
export function classOf(id: ParamId): ParamClass | undefined {
  const group = PARAM_GROUPS.find((item) => item.params.includes(id))
  return group?.cls
}
