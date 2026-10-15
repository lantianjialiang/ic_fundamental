import { loc, type LText } from '../../../i18n/locale'
import { cat, f1, fP, mark, type Check, type Input, type Thermal } from './mosSelectMath'
import {
  GPIO_MA,
  ID_MARGIN,
  IGSS_NA,
  L_LOAD_MH,
  RPD_K,
  SUPPLY,
  TEMPCO,
  TJ_LIMIT,
  VDRIVE,
  VDS_MARGIN,
  VF_DIODE,
  VTH_MARGIN,
  type DiodeId,
  type LoadId,
  type Part,
  type RdsSpec,
} from './mosSelectParts'

/** 电感储能 ½·L·I²，单位 mJ */
const energyMj = (i: number) => 0.5 * L_LOAD_MH * i * i

export function flybackCheck(load: LoadId, diode: DiodeId, i: number, part: Part): Check {
  const label = loc('续流二极管', 'Flyback diode')
  if (load === 'res') {
    return {
      id: 'fly',
      label,
      value: '-',
      state: 'pass',
      reason: loc('阻性负载没有储能电感，关断时电流立刻消失，不需要续流二极管。', 'A resistive load stores no inductive energy, so the current stops at once on turn-off and no flyback diode is needed.'),
    }
  }
  if (diode === 'with') {
    return {
      id: 'fly',
      label,
      value: `${f1(SUPPLY + VF_DIODE)} V`,
      state: 'pass',
      reason: loc(
        `二极管反并联在负载两端（阴极接 ${SUPPLY} V，阳极接漏极）：关断时电感电流 ${i} A 经二极管续流，漏极只被钳在 ${SUPPLY} + ${VF_DIODE} = ${f1(SUPPLY + VF_DIODE)} V。选反向耐压 ≥ ${VDS_MARGIN * SUPPLY} V、正向电流 ≥ ${i} A 的肖特基。`,
        `The diode sits across the load (cathode to ${SUPPLY} V, anode to the drain): on turn-off the inductor current of ${i} A circulates through it and the drain is clamped at only ${SUPPLY} + ${VF_DIODE} = ${f1(SUPPLY + VF_DIODE)} V. Choose a Schottky with reverse voltage ≥ ${VDS_MARGIN * SUPPLY} V and forward current ≥ ${i} A.`,
      ),
    }
  }
  return {
    id: 'fly',
    label,
    value: `> ${part.vds} V`,
    state: 'fail',
    reason: loc(
      `感性负载关断时电流不能突变，电感把漏极电压顶高，直到 MOSFET 雪崩击穿（约 ${part.vds} V），储能 ½·L·I² = ½ × ${L_LOAD_MH} mH × ${i}² = ${f1(energyMj(i))} mJ 全落在管子里，远超这类器件的雪崩能量额定。在负载两端反并联续流二极管。`,
      `When an inductive load turns off its current cannot jump, so the inductor drives the drain up until the MOSFET avalanches (about ${part.vds} V), and the stored ½·L·I² = ½ × ${L_LOAD_MH} mH × ${i}² = ${f1(energyMj(i))} mJ lands in the transistor, far beyond this class of device’s avalanche energy rating. Put a flyback diode across the load.`,
    ),
  }
}

export type Ctx = {
  inp: Input
  rd: { spec: RdsSpec; ok: boolean }
  th: Thermal
  vdsNeed: number
  idNeed: number
  margin: number
  rg: number
  vpl: number
  tCharge: number | null
  checks: Check[]
}

/** 交上去的计算过程：每一行都由同一组数字生成 */
export function buildReport(c: Ctx): LText[] {
  const { inp, rd, th, vdsNeed, idNeed, margin, rg, vpl, tCharge, checks } = c
  const { part, load, current: i, ambient: ta } = inp
  const byId = (id: string) => checks.find((k) => k.id === id)?.state === 'pass'
  const vOn = (VDRIVE * RPD_K * 1000) / (RPD_K * 1000 + rg)
  const leakMv = (IGSS_NA * 1e-9 * RPD_K * 1000) * 1000

  const given = cat(
    loc('已知：3.3 V MCU 控制 ', 'Given: a 3.3 V MCU switches a '),
    SUPPLY,
    loc(' V、', ' V, '),
    i,
    loc(' A 的', ' A '),
    load === 'res' ? loc('阻性负载', 'resistive load') : loc('感性负载', 'inductive load'),
    loc('，环境温度 ', ', ambient '),
    ta,
    ' °C',
    loc('。', '.'),
  )
  const ratings = loc(
    `3) 额定：Vds ${part.vds} V ≥ ${VDS_MARGIN} × ${SUPPLY} = ${vdsNeed} V ${mark(byId('vds'))}；Id ${part.idA} A ≥ ${ID_MARGIN} × ${i} = ${f1(idNeed)} A ${mark(byId('id'))}。`,
    `3) Ratings: Vds ${part.vds} V ≥ ${VDS_MARGIN} × ${SUPPLY} = ${vdsNeed} V ${mark(byId('vds'))}; Id ${part.idA} A ≥ ${ID_MARGIN} × ${i} = ${f1(idNeed)} A ${mark(byId('id'))}.`,
  )
  const drive = loc(
    `4) 驱动：Vgs(th) 最大 ${part.vth.max} V（250 µA 下测得，不是导通电压），余量 ${VDRIVE} − ${part.vth.max} = ${f1(margin)} V，要求 ≥ ${VTH_MARGIN} V ${mark(byId('vth'))}；Vgs 上限 ±${part.vgsMax} V ≥ ${VDRIVE} V ${mark(byId('vgsmax'))}。`,
    `4) Drive: Vgs(th) max ${part.vth.max} V (measured at 250 µA, not the on voltage); margin ${VDRIVE} − ${part.vth.max} = ${f1(margin)} V, need ≥ ${VTH_MARGIN} V ${mark(byId('vth'))}; Vgs limit ±${part.vgsMax} V ≥ ${VDRIVE} V ${mark(byId('vgsmax'))}.`,
  )
  const rdsLine = rd.ok
    ? loc(
        `5) Rds(on)：手册在 Vgs = ${rd.spec.vgs} V 给出 ≤ ${rd.spec.mohm} mΩ（25 °C 最大值），${VDRIVE} V 不低于该点，取它当保守值 ✓。`,
        `5) Rds(on): the datasheet gives ≤ ${rd.spec.mohm} mΩ at Vgs = ${rd.spec.vgs} V (25 °C max); ${VDRIVE} V is not below that point, so use it as the conservative value ✓.`,
      )
    : loc(
        `5) Rds(on)：手册没有 ≤ ${VDRIVE} V 的数据，最低只有 Vgs = ${rd.spec.vgs} V 的 ${rd.spec.mohm} mΩ，只能当乐观估计（真实更大）✗。`,
        `5) Rds(on): the datasheet has nothing at or below ${VDRIVE} V; the lowest point is ${rd.spec.mohm} mΩ at Vgs = ${rd.spec.vgs} V, which is only an optimistic estimate (the real value is higher) ✗.`,
      )
  const thermal = th.runaway
    ? loc('6) 热：Rds(on) 随温度升高，发热又让温度更高，没有稳定解（热失控）✗。', '6) Thermal: Rds(on) rises with temperature and the heat raises it again, so there is no stable solution (thermal runaway) ✗.')
    : loc(
        `6) 热（Tj 和 Rds(on) 互相影响，解出自洽值）：热态 Rds(on) = ${rd.spec.mohm} × (1 + ${TEMPCO} × (${Math.round(th.tj)} − 25)) = ${Math.round(th.rHot)} mΩ；P = I² × Rds(on) = ${i}² × ${(th.rHot / 1000).toFixed(3)} = ${fP(th.p)} W；Tj = Ta + P × RθJA = ${ta} + ${fP(th.p)} × ${part.theta} = ${Math.round(th.tj)} °C，上限 ${TJ_LIMIT} °C ${mark(byId('tj'))}。`,
        `6) Thermal (Tj and Rds(on) depend on each other; solved self-consistently): hot Rds(on) = ${rd.spec.mohm} × (1 + ${TEMPCO} × (${Math.round(th.tj)} − 25)) = ${Math.round(th.rHot)} mΩ; P = I² × Rds(on) = ${i}² × ${(th.rHot / 1000).toFixed(3)} = ${fP(th.p)} W; Tj = Ta + P × RθJA = ${ta} + ${fP(th.p)} × ${part.theta} = ${Math.round(th.tj)} °C, limit ${TJ_LIMIT} °C ${mark(byId('tj'))}.`,
      )
  const timePart =
    tCharge === null
      ? loc(`Vpl ≈ ${f1(vpl)} V 已不低于驱动电压，栅极到不了米勒平台，开不透`, `Vpl ≈ ${f1(vpl)} V is not below the drive voltage, so the gate never reaches the Miller plateau and cannot turn on fully`)
      : loc(
          `充电时间 ≈ Qg × Rg ÷ (Vdrive − Vpl) = ${part.qg} nC × ${rg} Ω ÷ ${f1(VDRIVE - vpl)} V ≈ ${tCharge.toFixed(1)} µs`,
          `charge time ≈ Qg × Rg ÷ (Vdrive − Vpl) = ${part.qg} nC × ${rg} Ω ÷ ${f1(VDRIVE - vpl)} V ≈ ${tCharge.toFixed(1)} µs`,
        )
  const gate = cat(
    loc(
      `7) 栅极：Rg ≥ ${VDRIVE} V ÷ ${GPIO_MA} mA = ${Math.round((VDRIVE / GPIO_MA) * 1000)} Ω，取 E12 值 ${rg} Ω；`,
      `7) Gate: Rg ≥ ${VDRIVE} V ÷ ${GPIO_MA} mA = ${Math.round((VDRIVE / GPIO_MA) * 1000)} Ω, take the E12 value ${rg} Ω; `,
    ),
    timePart,
    loc(
      `；下拉 ${RPD_K} kΩ：浮空时 ${IGSS_NA} nA × ${RPD_K} kΩ = ${leakMv.toFixed(0)} mV ≪ Vgs(th) 最小 ${part.vth.min} V，导通时分压后 Vgs = ${vOn.toFixed(2)} V。`,
      `; pull-down ${RPD_K} kΩ: when floating ${IGSS_NA} nA × ${RPD_K} kΩ = ${leakMv.toFixed(0)} mV ≪ Vgs(th) min ${part.vth.min} V, and when on the divider leaves Vgs = ${vOn.toFixed(2)} V.`,
    ),
  )
  const fly = flybackCheck(inp.load, inp.diode, i, part)
  const flyLine = cat(loc('8) 续流：', '8) Flyback: '), fly.reason, ' ', mark(fly.state === 'pass'))
  const failed = checks.filter((k) => k.state === 'fail')
  const verdict: LText =
    failed.length === 0
      ? loc(`结论：通过。${part.name}（${part.pkg}）在 ${VDRIVE} V 驱动下满足全部检查，示例器件仅作演算。`, `Verdict: pass. ${part.name} (${part.pkg}) meets every check at ${VDRIVE} V drive; an example part, for the exercise only.`)
      : cat(loc('结论：不通过，未过项：', 'Verdict: fail. Failed: '), ...failed.flatMap((k, n) => (n === 0 ? [k.label] : [', ', k.label])), '.')
  return [
    given,
    loc('1) 拓扑：N 沟道低边，源极接地，Vgs = 3.3 V ✓。', '1) Topology: N-channel low-side, source at ground, Vgs = 3.3 V ✓.'),
    cat(loc('2) 选型：', '2) Part: '), part.name, ' (', part.pkg, ')'),
    ratings,
    drive,
    rdsLine,
    thermal,
    gate,
    flyLine,
    verdict,
  ]
}
