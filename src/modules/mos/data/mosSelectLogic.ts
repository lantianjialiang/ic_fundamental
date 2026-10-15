import { loc, type LText } from '../../../i18n/locale'
import { cat, f1 } from './mosSelectMath'
import { VTH_MARGIN, rdsAt, type Part } from './mosSelectParts'

export type LogicVerdict = { ok: boolean; title: LText; text: LText }

/** 逻辑电平三条：有不高于驱动电压的 Rds(on) 行、Vth 最大值留出余量、不超过 ±Vgs */
export function logicVerdict(part: Part, vdrive: number): LogicVerdict {
  const rd = rdsAt(part, vdrive)
  const margin = vdrive - part.vth.max
  const reasons: LText[] = []
  if (!rd.ok) {
    reasons.push(
      loc(
        `手册里没有 Vgs ≤ ${vdrive} V 的 Rds(on) 行，最低只在 Vgs = ${rd.spec.vgs} V 给出（${rd.spec.mohm} mΩ），${vdrive} V 下的阻值没有保证`,
        `the datasheet has no Rds(on) row at Vgs ≤ ${vdrive} V; the lowest is at Vgs = ${rd.spec.vgs} V (${rd.spec.mohm} mΩ), so the resistance at ${vdrive} V is not guaranteed`,
      ),
    )
  }
  if (margin < VTH_MARGIN) {
    reasons.push(
      loc(
        `Vgs(th) 最大 ${part.vth.max} V，${vdrive} V 只高出 ${f1(margin)} V（要求 ≥ ${VTH_MARGIN} V），最差的一批拉不起像样的电流`,
        `Vgs(th) max is ${part.vth.max} V and ${vdrive} V is only ${f1(margin)} V above it (need ≥ ${VTH_MARGIN} V), so the worst batch cannot pull a decent current`,
      ),
    )
  }
  if (vdrive > part.vgsMax) {
    reasons.push(
      loc(
        `${vdrive} V 超过栅极上限 ±${part.vgsMax} V，栅氧会被击穿`,
        `${vdrive} V exceeds the gate limit ±${part.vgsMax} V and the gate oxide would break down`,
      ),
    )
  }
  if (reasons.length === 0) {
    return {
      ok: true,
      title: loc(`${vdrive} V 可以直接驱动`, `${vdrive} V can drive it directly`),
      text: loc(
        `手册在 Vgs = ${rd.spec.vgs} V 给出 Rds(on) ≤ ${rd.spec.mohm} mΩ，驱动电压不低于它；Vgs(th) 最大 ${part.vth.max} V，余量 ${f1(margin)} V ≥ ${VTH_MARGIN} V；Vgs 上限 ±${part.vgsMax} V 高于驱动电压。三条同时满足，才能叫「逻辑电平」。`,
        `The datasheet gives Rds(on) ≤ ${rd.spec.mohm} mΩ at Vgs = ${rd.spec.vgs} V and the drive voltage is not below it; Vgs(th) max is ${part.vth.max} V, a margin of ${f1(margin)} V ≥ ${VTH_MARGIN} V; the ±${part.vgsMax} V gate limit is above the drive voltage. All three together are what “logic-level” means.`,
      ),
    }
  }
  return {
    ok: false,
    title: loc(`${vdrive} V 不能直接驱动`, `${vdrive} V cannot drive it directly`),
    text: cat(loc('不满足的条件：', 'Conditions not met: '), ...reasons.flatMap((r, n) => (n === 0 ? [r] : [loc('；', '; '), r])), loc('。', '.')),
  }
}

export const fmtCurrent = (a: number) => {
  if (a >= 1) {
    return `${a.toFixed(1)} A`
  }
  if (a >= 1e-3) {
    return `${(a * 1e3).toFixed(1)} mA`
  }
  if (a >= 1e-6) {
    return `${(a * 1e6).toFixed(0)} µA`
  }
  return '< 1 µA'
}
