import { loc, type LText } from '../../../i18n/locale'
import { buildReport, flybackCheck } from './mosSelectReport'
import { cat, e12Up, f1, fP, solveTj, type Check, type Input } from './mosSelectMath'
import {
  GPIO_MA,
  ID_MARGIN,
  RPD_K,
  SUPPLY,
  TJ_LIMIT,
  TJ_MAX,
  VDRIVE,
  VDS_MARGIN,
  VPL_OFFSET,
  VTH_MARGIN,
  rdsAt,
  type TopologyId,
} from './mosSelectParts'

export type Result = {
  checks: Check[]
  report: LText[]
  pass: boolean
  margin: number
  rHot: number
  p: number
  tj: number
  rg: number
  rpd: number
  tCharge: number | null
  needDiode: boolean
}

const SKIP = loc('未评估：拓扑不成立，后面的数字没有意义。', 'Not evaluated: the topology does not work, so the numbers below would mean nothing.')

function topologyCheck(topology: TopologyId): Check {
  const label = loc('拓扑', 'Topology')
  if (topology === 'low') {
    return {
      id: 'topo',
      label,
      value: 'N-ch low-side',
      state: 'pass',
      reason: loc(
        `N 沟道低边：源极接地，MCU 直接给出 Vgs = ${VDRIVE} V；负载接在 ${SUPPLY} V 和漏极之间，导通时漏极被拉到接近 0 V，Vgs 不会被负载抬走。`,
        `N-channel low-side: the source is at ground, so the MCU gives Vgs = ${VDRIVE} V directly; the load sits between ${SUPPLY} V and the drain, and when on the drain falls to near 0 V so the load cannot lift Vgs away.`,
      ),
    }
  }
  if (topology === 'highN') {
    const vgs = VDRIVE - SUPPLY
    return {
      id: 'topo',
      label,
      value: `Vgs = ${f1(vgs)} V`,
      state: 'fail',
      reason: loc(
        `高边 NMOS 直驱：导通后源极被拉到约 ${SUPPLY} V，Vgs = ${VDRIVE} − ${SUPPLY} = ${f1(vgs)} V，管子自己把自己关断。栅极至少要比源极高 Vth，也就是约 ${SUPPLY} V + Vth，需要自举或驱动芯片（见 {@mosSwitch}）；或者改用低边。`,
        `High-side NMOS, direct drive: once on, the source is pulled to about ${SUPPLY} V, so Vgs = ${VDRIVE} − ${SUPPLY} = ${f1(vgs)} V and the transistor switches itself off. The gate must sit at least Vth above the source, about ${SUPPLY} V + Vth, which needs a bootstrap or a driver IC (see {@mosSwitch}); or go low-side.`,
      ),
    }
  }
  const vsg = SUPPLY - VDRIVE
  return {
    id: 'topo',
    label,
    value: `Vsg = ${f1(vsg)} V`,
    state: 'fail',
    reason: loc(
      `高边 PMOS 直驱：MCU 输出高电平 ${VDRIVE} V 时 Vsg = ${SUPPLY} − ${VDRIVE} = ${f1(vsg)} V，管子仍然导通，关不掉；输出低电平时 Vsg = ${SUPPLY} V，还可能超过 Vgs 上限。需要 NPN / NMOS 做电平转换（见 {@mosApps}）。`,
      `High-side PMOS, direct drive: when the MCU outputs ${VDRIVE} V, Vsg = ${SUPPLY} − ${VDRIVE} = ${f1(vsg)} V, so the transistor stays on and cannot be turned off; when it outputs low, Vsg = ${SUPPLY} V, which may exceed the Vgs limit. It needs an NPN / NMOS level shifter (see {@mosApps}).`,
    ),
  }
}

function skipChecks(): Check[] {
  const ids: Array<[string, LText]> = [
    ['vds', loc('Vds 余量', 'Vds margin')],
    ['id', loc('Id 余量', 'Id margin')],
    ['vgsmax', loc('Vgs 上限', 'Vgs limit')],
    ['vth', loc('Vgs(th) 余量', 'Vgs(th) margin')],
    ['rds', loc('Rds(on) 有数据', 'Rds(on) specified')],
    ['tj', loc('结温', 'Junction temperature')],
    ['fly', loc('续流二极管', 'Flyback diode')],
  ]
  return ids.map(([id, label]) => ({ id, label, value: '-', state: 'skip' as const, reason: SKIP }))
}

export function evaluate(inp: Input): Result {
  const { topology, part, load, diode, current: i, ambient: ta } = inp
  const topo = topologyCheck(topology)
  const rd = rdsAt(part, VDRIVE)
  const th = solveTj(i, rd.spec.mohm, part.theta, ta)
  const margin = VDRIVE - part.vth.max
  const rg = e12Up(VDRIVE / (GPIO_MA / 1000))
  const rpd = RPD_K
  const vpl = part.vth.typ + VPL_OFFSET
  const vOver = VDRIVE - vpl
  const tCharge = vOver > 0.05 ? (part.qg * rg) / vOver / 1000 : null
  const needDiode = load === 'ind'
  const base = { margin, rHot: th.rHot, p: th.p, tj: th.tj, rg, rpd, tCharge, needDiode }

  if (topology !== 'low') {
    return {
      ...base,
      checks: [topo, ...skipChecks()],
      pass: false,
      report: [
        loc(`结论：不通过。拓扑不成立：${topo.reason.zh}`, `Verdict: fail. The topology does not work: ${topo.reason.en ?? ''}`),
      ],
    }
  }

  const vdsNeed = VDS_MARGIN * SUPPLY
  const idNeed = ID_MARGIN * i
  const vdsOk = part.vds >= vdsNeed
  const idOk = part.idA >= idNeed
  const vgsOk = VDRIVE <= part.vgsMax
  const vthOk = margin >= VTH_MARGIN
  const tjOk = !th.runaway && th.tj <= TJ_LIMIT
  const vthMax = part.vth.max

  const checks: Check[] = [
    topo,
    {
      id: 'vds',
      label: loc('Vds 余量', 'Vds margin'),
      value: `${part.vds} V / ${vdsNeed} V`,
      state: vdsOk ? 'pass' : 'fail',
      reason: vdsOk
        ? loc(
            `Vds 额定 ${part.vds} V ≥ ${VDS_MARGIN} × ${SUPPLY} = ${vdsNeed} V：留出线路电感和热插拔带来的过冲。`,
            `Vds rating ${part.vds} V ≥ ${VDS_MARGIN} × ${SUPPLY} = ${vdsNeed} V: room for overshoot from wiring inductance and hot-plug.`,
          )
        : loc(
            `Vds 额定 ${part.vds} V 不到 ${VDS_MARGIN} × ${SUPPLY} = ${vdsNeed} V：电源上的尖峰会直接超过额定，选 Vds 更高的管子。`,
            `Vds rating ${part.vds} V is below ${VDS_MARGIN} × ${SUPPLY} = ${vdsNeed} V: spikes on the supply go straight past the rating; pick a higher-Vds part.`,
          ),
    },
    {
      id: 'id',
      label: loc('Id 余量', 'Id margin'),
      value: `${part.idA} A / ${f1(idNeed)} A`,
      state: idOk ? 'pass' : 'fail',
      reason: idOk
        ? loc(
            `Id 额定 ${part.idA} A ≥ ${ID_MARGIN} × ${i} = ${f1(idNeed)} A。Id 额定是壳温 25 °C 的最好情况，实际散不了那么多热，所以不能满额用。`,
            `Id rating ${part.idA} A ≥ ${ID_MARGIN} × ${i} = ${f1(idNeed)} A. The Id rating is the best case at a 25 °C case temperature; real cooling cannot reach it, so never use it fully.`,
          )
        : loc(
            `Id 额定 ${part.idA} A 不到 ${ID_MARGIN} × ${i} = ${f1(idNeed)} A：额定值是 25 °C 壳温下的最好情况，没有余量就是在极限上工作。`,
            `Id rating ${part.idA} A is below ${ID_MARGIN} × ${i} = ${f1(idNeed)} A: the rating is the best case at 25 °C case temperature, with no margin you run at the limit.`,
          ),
    },
    {
      id: 'vgsmax',
      label: loc('Vgs 上限', 'Vgs limit'),
      value: `${VDRIVE} V / ±${part.vgsMax} V`,
      state: vgsOk ? 'pass' : 'fail',
      reason: vgsOk
        ? loc(`栅极电压 ${VDRIVE} V 在 ±${part.vgsMax} V 以内，栅氧不会被击穿。`, `Gate voltage ${VDRIVE} V is within ±${part.vgsMax} V, so the gate oxide is safe.`)
        : loc(`栅极电压 ${VDRIVE} V 超过 ±${part.vgsMax} V，栅氧会被击穿。`, `Gate voltage ${VDRIVE} V exceeds ±${part.vgsMax} V and would break down the gate oxide.`),
    },
    {
      id: 'vth',
      label: loc('Vgs(th) 余量', 'Vgs(th) margin'),
      value: `${f1(margin)} V`,
      state: vthOk ? 'pass' : 'fail',
      reason: vthOk
        ? loc(
            `Vgs(th) 最大 ${vthMax} V 是在 250 µA 下测的，只是「开始导通」，不是导通电压；${VDRIVE} V 比它高出 ${f1(margin)} V（≥ ${VTH_MARGIN} V），最差的一批也能拉开沟道。`,
            `Vgs(th) max ${vthMax} V is measured at 250 µA and only means “starting to conduct”, not the on voltage; ${VDRIVE} V is ${f1(margin)} V above it (≥ ${VTH_MARGIN} V), so even the worst batch opens the channel.`,
          )
        : loc(
            `Vgs(th) 最大 ${vthMax} V，${VDRIVE} V 只高出 ${f1(margin)} V（要求 ≥ ${VTH_MARGIN} V）：最差的一批在 ${VDRIVE} V 下连像样的电流都拉不起来，管子基本不导通。`,
            `Vgs(th) max is ${vthMax} V and ${VDRIVE} V is only ${f1(margin)} V above it (need ≥ ${VTH_MARGIN} V): the worst batch cannot pull any real current at ${VDRIVE} V, so the transistor barely conducts.`,
          ),
    },
    {
      id: 'rds',
      label: loc('Rds(on) 有数据', 'Rds(on) specified'),
      value: `${rd.spec.mohm} mΩ @ ${rd.spec.vgs} V`,
      state: rd.ok ? 'pass' : 'fail',
      reason: rd.ok
        ? loc(
            `手册在 Vgs = ${rd.spec.vgs} V 给出 Rds(on) ≤ ${rd.spec.mohm} mΩ；${VDRIVE} V 比这个测试点高，直接取它当保守值。`,
            `The datasheet gives Rds(on) ≤ ${rd.spec.mohm} mΩ at Vgs = ${rd.spec.vgs} V; ${VDRIVE} V is above that test point, so use it as the conservative value.`,
          )
        : loc(
            `手册最低只在 Vgs = ${rd.spec.vgs} V 给出 Rds(on)（${rd.spec.mohm} mΩ），${VDRIVE} V 下的阻值没有保证。Vgs(th) 看起来够用也代替不了这一条：Vth 是 250 µA 的起点，导通电阻要看 Rds(on) 的测试条件。`,
            `The datasheet only gives Rds(on) from Vgs = ${rd.spec.vgs} V (${rd.spec.mohm} mΩ); nothing is guaranteed at ${VDRIVE} V. A passable Vgs(th) cannot replace this: Vth is the 250 µA starting point, the on-resistance is whatever Rds(on) is specified at.`,
          ),
    },
    {
      id: 'tj',
      label: loc('结温', 'Junction temperature'),
      value: th.runaway ? '> 175 °C' : `${Math.round(th.tj)} °C`,
      state: tjOk ? 'pass' : 'fail',
      reason: th.runaway
        ? loc(
            `Rds(on) 随温度升高，发热又让温度更高，算不出稳定的 Tj（热失控）；换 Rds(on) 小得多的管子或散热好的封装。`,
            `Rds(on) rises with temperature and the extra heat raises it again, so no stable Tj exists (thermal runaway); use a much lower Rds(on) or a better-cooled package.`,
          )
        : cat(
            loc(`Tj = Ta + P × RθJA = ${ta} + ${fP(th.p)} × ${part.theta} = ${Math.round(th.tj)} °C，`, `Tj = Ta + P × RθJA = ${ta} + ${fP(th.p)} × ${part.theta} = ${Math.round(th.tj)} °C, `),
            tjOk
              ? loc(`低于设计上限 ${TJ_LIMIT} °C（绝对最大 ${TJ_MAX} °C）。`, `below the ${TJ_LIMIT} °C design limit (absolute max ${TJ_MAX} °C).`)
              : loc(
                  `超过设计上限 ${TJ_LIMIT} °C：发热超过封装能散掉的量；换 Rds(on) 更小的管子，或换 RθJA 更小的封装、加大铜面积。`,
                  `above the ${TJ_LIMIT} °C design limit: the heat exceeds what the package can shed; use a lower Rds(on), or a package with lower RθJA and more copper.`,
                ),
            rd.ok ? '' : loc('（只是乐观估计：真实 Rds(on) 更大。）', ' (Only an optimistic estimate: the real Rds(on) is higher.)'),
          ),
    },
    flybackCheck(load, diode, i, part),
  ]

  const failed = checks.filter((c) => c.state === 'fail')
  const report = buildReport({ inp, rd, th, vdsNeed, idNeed, margin, rg, vpl, tCharge, checks })
  return { ...base, checks, pass: failed.length === 0, report }
}
