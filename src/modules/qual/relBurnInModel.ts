/**
 * REL-05 Burn-in 与早期失效筛选的教学模型（纯函数，无 UI）。
 *
 * 群体 N 件，其中一部分带潜在缺陷（缺陷子群，比例 p）。缺陷的寿命用 Weibull(β_d, η_d) 描述，
 * η_d 按使用条件下的小时数计。Burn-in 持续 h 小时、加速因子 AF，等效现场小时 = h·AF。
 *   残余缺陷 = p·[1 − F_d(h·AF)]（core 中的 burnInResidual），剔除 = p − 残余。
 *   现场失效（出货后 T_field 内）= p·[F_d(h·AF + T_field) − F_d(h·AF)]，ppm 以出货件数为分母。
 * 统计筛选（PAT，见 REL-07）只作示意：抓到一部分缺陷，同时误剔少量好件。
 * 成本为“每件”的教学示例值；BI 温度、电压与 AF 的数值为教学示例，以现行标准为准。
 */
import { arrheniusAF, burnInResidual, voltageAF, weibullCdf } from './core/reliability'

/** 群体规模（件），用于把“每件成本”换算成总成本 */
export const POPULATION = 100000
/** 缺陷的激活能 Ea，eV（教学默认值，实际由数据确定） */
export const EA_EV = 0.7
/** 使用环境温度，°C */
export const T_USE_C = 55
/** 使用电压，V */
export const V_USE = 5
/** 电压加速系数 γ，1/V（教学示意） */
export const GAMMA = 1
/** 参考 BI 温度，°C（示例，以现行标准为准） */
export const REF_T_BI = 125
/** BI 时间的上限，h */
export const BI_MAX_H = 168
/** 现场 ppm 目标（教学示例） */
export const TARGET_PPM = 100
/** PAT 能抓到的缺陷比例（教学示意） */
export const PAT_CAPTURE = 0.6
/** PAT 误剔的好件比例（教学示意） */
export const PAT_YIELD_LOSS = 0.003

export const SCREEN_IDS = ['none', 'pat'] as const
export type ScreenId = (typeof SCREEN_IDS)[number]

export type BiState = {
  /** 缺陷子群比例，%（滑条单位） */
  pDefectPct: number
  /** 缺陷 Weibull 形状参数 β_d */
  betaD: number
  /** 缺陷 Weibull 尺度参数 η_d，使用条件下的 h */
  etaD: number
  /** BI 温度，°C */
  tBiC: number
  /** BI 电压，V */
  vBi: number
  /** BI 时间，h */
  biHours: number
  /** BI 成本，每件每小时 */
  cBi: number
  /** 失效品报废成本，每件 */
  cScrap: number
  /** 现场失效成本，每件 */
  cField: number
  /** 现场窗口 T_field，h */
  tFieldH: number
  /** 统计筛选：none 不做，pat 做 PAT */
  screen: ScreenId
}

/** 默认值：BI 24 h，125 °C；缺陷 β_d = 0.6（教学值）；不做统计筛选（列表第一项） */
export const DEFAULT_BI: BiState = {
  pDefectPct: 0.5,
  betaD: 0.6,
  etaD: 1000,
  tBiC: REF_T_BI,
  vBi: V_USE,
  biHours: 24,
  cBi: 0.002,
  cScrap: 0.5,
  cField: 20,
  tFieldH: 8760,
  screen: SCREEN_IDS[0],
}

/** BI 的加速因子：温度用 Arrhenius，电压用指数模型，两者相乘 */
export function biAf(tBiC: number, vBi: number): number {
  return arrheniusAF(EA_EV, T_USE_C, tBiC) * voltageAF(GAMMA, V_USE, vBi)
}

/** 把缺陷子群在 BI 中拆成剔除与残余两部分：剔除 + 残余 = 初始 p */
export function splitBurnIn(
  p: number,
  beta: number,
  eta: number,
  biHours: number,
  af: number,
): { removed: number; residual: number } {
  const residual = burnInResidual(p, beta, eta, biHours, af)
  return { removed: p - residual, residual }
}

export type BiAnalysis = {
  /** BI 加速因子 AF */
  af: number
  /** 等效现场小时 h·AF */
  useHours: number
  /** 进入 BI 之前的缺陷比例（PAT 之后），占群体 */
  pEff: number
  /** 统计筛选剔除的比例（缺陷 + 误剔好件），占群体 */
  patRemoved: number
  /** BI 剔除的缺陷比例，占群体 */
  biRemoved: number
  /** BI 后残余缺陷比例，占群体 */
  residual: number
  /** 出货后 T_field 内失效的比例，占群体 */
  fieldFrac: number
  /** 出货比例，占群体 */
  shipped: number
  /** 出货后 T_field 内失效，ppm（以出货件数为分母） */
  fieldPpm: number
  /** BI 成本，每件 */
  costBi: number
  /** 报废 + 现场失效成本，每件 */
  costRest: number
  /** 总成本，每件 */
  cost: number
}

export function analyseBi(state: BiState): BiAnalysis {
  const p = state.pDefectPct / 100
  const pat = state.screen === 'pat'
  const patRemoved = pat ? p * PAT_CAPTURE + (1 - p) * PAT_YIELD_LOSS : 0
  const pEff = pat ? p * (1 - PAT_CAPTURE) : p
  const af = biAf(state.tBiC, state.vBi)
  const useHours = state.biHours * af
  const { removed, residual } = splitBurnIn(pEff, state.betaD, state.etaD, state.biHours, af)
  const fieldFrac =
    pEff *
    (weibullCdf(state.betaD, state.etaD, useHours + state.tFieldH) - weibullCdf(state.betaD, state.etaD, useHours))
  const shipped = 1 - patRemoved - removed
  const fieldPpm = (fieldFrac / shipped) * 1e6
  const costBi = state.cBi * state.biHours * (1 - patRemoved)
  const costRest = state.cScrap * (patRemoved + removed) + state.cField * fieldFrac
  return {
    af,
    useHours,
    pEff,
    patRemoved,
    biRemoved: removed,
    residual,
    fieldFrac,
    shipped,
    fieldPpm,
    costBi,
    costRest,
    cost: costBi + costRest,
  }
}

export type BiCurvePoint = {
  h: number
  costBi: number
  costRest: number
  cost: number
  ppm: number
}

/** 把 BI 时间从 0 扫到 BI_MAX_H，得到成本与现场 ppm 曲线（其余参数保持不变） */
export function costCurve(state: BiState): BiCurvePoint[] {
  const points: BiCurvePoint[] = []
  for (let h = 0; h <= BI_MAX_H; h += 1) {
    const a = analyseBi({ ...state, biHours: h })
    points.push({ h, costBi: a.costBi, costRest: a.costRest, cost: a.cost, ppm: a.fieldPpm })
  }
  return points
}

/** 无约束的最低成本点（不管 ppm） */
export function bestUnconstrained(curve: BiCurvePoint[]): BiCurvePoint {
  let best = curve[0]
  for (const point of curve) {
    if (point.cost < best.cost) {
      best = point
    }
  }
  return best
}

/** 满足 ppm 目标的点里成本最低的一个；没有可行点时返回 null */
export function bestFeasible(curve: BiCurvePoint[], target: number): BiCurvePoint | null {
  let best: BiCurvePoint | null = null
  for (const point of curve) {
    if (point.ppm <= target && (best === null || point.cost < best.cost)) {
      best = point
    }
  }
  return best
}

/** 达到 ppm 目标的最短 BI 时间（h）；168 h 内达不到时返回 null */
export function minHForTarget(curve: BiCurvePoint[], target: number): number | null {
  for (const point of curve) {
    if (point.ppm <= target) {
      return point.h
    }
  }
  return null
}
