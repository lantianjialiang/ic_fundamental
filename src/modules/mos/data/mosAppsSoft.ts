import { loc } from '../../../i18n/locale'
import { fmtA, fmtT, fmtVolt, type CircuitDef, type Num, type Outcome } from './mosApps'
import { softStart, VIN_SOFT, type SoftRun } from './mosAppsSoftModel'

/** 电源和连接器能承受的涌入电流上限（示意） */
export const I_LIMIT = 5

export const softRunOf = (num: Num, fault: string): SoftRun => softStart(num.rg * 1e3, fault === 'noRc' ? 0 : num.cg * 1e-9, num.cl * 1e-6)

function solve(sel: Record<string, string>, num: Num, fault: string): Outcome {
  const run = softRunOf(num, fault)
  const cl = num.cl * 1e-6
  const energy = 0.5 * cl * VIN_SOFT * VIN_SOFT
  if (sel.en === 'off') {
    return {
      hot: [],
      tags: { vsg: '0.00 V', vout: '0.00 V', en: '0 V' },
      reads: [
        { label: loc('输出电压', 'Output voltage'), value: '0.00 V', state: 'pass' },
        { label: loc('涌入电流', 'Inrush current'), value: fmtA(0), state: 'pass' },
      ],
      tone: 'ok',
      title: loc('EN 关：Q2 关断，Rgs 把栅极拉回源极电平', 'EN off: Q2 off, Rgs pulls the gate back to the source level'),
      text: loc(
        'Q2 关断后没有电流经过 Rg，Rgs 把栅极和 Cg 的电压放回源极电平，Vsg = 0，PMOS 关断，输出为 0。放电要经过 Rgs，所以关断后要等一段时间 Vsg 才回零，立刻重新开启时软启动会缩短；Rgs 取值就是放电速度和待机电流的折中。',
        'With Q2 off no current flows through Rg, and Rgs returns the gate and Cg to the source level: Vsg = 0, the PMOS is off and the output is 0. Discharge goes through Rgs, so Vsg takes a while to reach zero, and turning on again at once shortens the soft start; Rgs is a compromise between discharge speed and standby current.',
      ),
    }
  }
  const over = run.ipeak > I_LIMIT
  const hot = ['vin', 'ch', 'out', 'cl', 'gdrv', 'q2', 'q2s', 'sig']
  const reads = [
    { label: loc('栅极时间常数 τ', 'Gate time constant τ'), value: fmtT(run.tau) },
    { label: loc('输出 10–90 % 爬升时间', 'Output 10–90 % ramp time'), value: fmtT(run.tRamp) },
    { label: loc('峰值涌入电流', 'Peak inrush current'), value: fmtA(run.ipeak), state: over ? ('fail' as const) : ('pass' as const) },
    { label: loc('平均电流 C·ΔV/Δt', 'Average current C·ΔV/Δt'), value: fmtA(run.iavg) },
    { label: loc('管子里耗掉的能量 ½CV²', 'Energy burnt in the FET ½CV²'), value: `${(energy * 1e3).toFixed(1)} mJ` },
  ]
  const tags = { vsg: fmtVolt(Math.min(run.vsg[run.vsg.length - 1], VIN_SOFT)), vout: fmtVolt(run.vout[run.vout.length - 1]), en: '3.3 V' }
  if (fault === 'noRc') {
    return {
      hot,
      tags,
      reads,
      tone: 'bad',
      title: loc('没有栅极 RC：Vsg 瞬间到位，涌入电流只剩 Rsrc 限制', 'No gate RC: Vsg jumps up and only Rsrc limits the inrush'),
      text: loc(
        '没有 Cg，栅极几乎立刻被拉到位，Vsg 在微秒内超过 Vth，管子满沟道导通，负载电容相当于直接接到电源上。电流只被电源、线缆和管子的串联电阻（示意约 80 mΩ）限制，峰值上百安培，比软启动大几十到上百倍，读数里的峰值就是这么算出来的。连接器会打火，电源会掉压重启，管子也有过流风险。',
        'With no Cg the gate is pulled into place almost at once, Vsg passes Vth within microseconds and the channel is fully on: the load capacitor is effectively tied straight to the supply. Only the series resistance of supply, cable and transistor (illustratively about 80 mΩ) limits the current, with peaks of hundreds of amps, tens to hundreds of times the soft-start value, as the peak reading shows. The connector sparks, the supply sags and resets, and the transistor risks overcurrent.',
      ),
    }
  }
  return {
    hot,
    tags,
    reads,
    tone: over ? 'warn' : 'ok',
    title: over ? loc('有软启动，但涌入仍超过上限', 'Soft start present, but inrush still exceeds the limit') : loc('软启动：栅极 RC 慢慢抬高 Vsg，涌入电流被限制', 'Soft start: the gate RC raises Vsg slowly and limits the inrush'),
    text: over
      ? loc(
          '栅极 τ 太小或负载电容太大：输出爬升太快，C·dV/dt 超过了上限。加大 Rg 或 Cg 让 Vsg 爬得更慢，或者减小负载电容。',
          'The gate τ is too small or the load capacitance too large: the output rises too fast and C·dV/dt exceeds the limit. Increase Rg or Cg so Vsg climbs more slowly, or reduce the load capacitance.',
        )
      : loc(
          'EN 打开后 Q2 导通，Cg 经 Rg 充电，Vsg 按 τ 指数上升。Vsg 刚过 Vth 时沟道很窄，管子只能给负载电容一点点电流；随着 Vsg 升高，电流逐渐加大，输出电压的爬升速率 dV/dt = I ÷ Cload。所以涌入电流 I = Cload × dV/dt，栅极 τ 越大，输出爬得越慢，涌入越小，代价是管子在线性区待的时间更长，要看 SOA。',
          'When EN turns on, Q2 conducts and Cg charges through Rg so Vsg rises exponentially with τ. Just above Vth the channel is narrow and the transistor can give the load capacitor only a trickle; as Vsg climbs the current grows, and the output rises at dV/dt = I ÷ Cload. So the inrush I = Cload × dV/dt, and a larger gate τ makes the output climb slower with less inrush, at the price of more time in the linear region, so check the SOA.',
        ),
  }
}

export const SOFT_CIRCUIT: CircuitDef = {
  id: 'softStart',
  label: loc('热插拔与软启动', 'Hot-swap and soft start'),
  short: loc('栅极 RC 软启动', 'Gate-RC soft start'),
  func: loc(
    '带电插拔或开关闭合时，负载上的大电容会瞬间吸走很大的充电电流，拉垮电源、让连接器打火。软启动让输出电压慢慢爬升，把涌入电流限制在安全值。',
    'At hot-plug or switch-on, a large load capacitor draws a huge charging current at once, sagging the supply and sparking the connector. Soft start lets the output voltage climb slowly and keeps the inrush within a safe value.',
  ),
  principle: loc(
    'PMOS 高边开关的栅源之间并联电容 Cg，经 Rg 充电，Vsg 按 τ = (Rg ∥ Rgs) × Cg 指数上升。Vsg 刚超过 Vth 时沟道很窄，管子只能给负载电容很小的电流，Vsg 继续升电流才加大，输出爬升速率 dV/dt = I ÷ Cload。涌入电流 I = Cload × dV/dt，栅极 RC 决定输出爬得多快。热插拔控制器则用检流电阻和反馈把电流恒定在设定值。',
    'A capacitor Cg across the PMOS gate-source charges through Rg, so Vsg rises exponentially with τ = (Rg ∥ Rgs) × Cg. Just above Vth the channel is narrow and the transistor gives the load capacitor only a small current; the current grows as Vsg climbs, and the output rises at dV/dt = I ÷ Cload. The inrush is I = Cload × dV/dt, and the gate RC decides how fast the output climbs. A hot-swap controller uses a sense resistor and feedback to hold the current at a set value instead.',
  ),
  params: loc(
    '目标涌入电流 = Cload × ΔV ÷ 爬升时间，要小于电源和连接器额定电流；Rg 和 Cg 决定爬升时间；Rgs 决定关断后栅极放电速度；Vds 大且电流不小的爬升阶段要检查 SOA；管子里会耗掉 ½·Cload·Vin² 的能量。',
    'Target inrush = Cload × ΔV ÷ ramp time, which must stay below the supply and connector ratings; Rg and Cg set the ramp time; Rgs sets how fast the gate discharges after turn-off; the ramp phase has large Vds with real current, so check the SOA; the transistor burns ½·Cload·Vin² of energy.',
  ),
  pitfall: loc(
    '没有 Cg 或 τ 太小，一开就是满电流，连接器打火、电源掉压；τ 太大，管子长时间在线性区发热，SOA 吃紧；Rgs 缺失，关断后栅极不回零，立刻再开软启动失效；把热插拔只当成开关，忘了负载电容和线缆电感引起的尖峰。',
    'No Cg or too small a τ gives full current the instant it turns on, sparking the connector and sagging the supply; too large a τ keeps the transistor in the linear region heating and stressing the SOA; a missing Rgs leaves the gate from returning to zero so an immediate re-enable defeats the soft start; treating hot-swap as a plain switch forgets the spikes from load capacitance and cable inductance.',
  ),
  row: {
    part: loc('PMOS 高边 + Rg、Cg、Rgs', 'High-side PMOS + Rg, Cg, Rgs'),
    param: loc('Cload × dV/dt，爬升时间，SOA', 'Cload × dV/dt, ramp time, SOA'),
    pit: loc('没有栅极 RC、爬升过慢烧管', 'No gate RC, ramp so slow it overheats the FET'),
  },
  inputs: [
    {
      id: 'en',
      label: loc('使能 EN', 'Enable EN'),
      options: [
        { id: 'on', label: loc('开', 'On') },
        { id: 'off', label: loc('关', 'Off') },
      ],
    },
  ],
  knobs: [
    { id: 'rg', label: loc('栅极电阻 Rg', 'Gate resistor Rg'), unit: 'kΩ', min: 10, max: 1000, step: 10, init: 330 },
    { id: 'cg', label: loc('栅源电容 Cg', 'Gate-source capacitor Cg'), unit: 'nF', min: 10, max: 1000, step: 10, init: 330 },
    { id: 'cl', label: loc('负载电容 Cload', 'Load capacitor Cload'), unit: 'µF', min: 100, max: 2200, step: 100, init: 470 },
  ],
  faults: [
    { id: 'none', label: loc('正常', 'Normal') },
    { id: 'noRc', label: loc('去掉栅极电容 Cg', 'Cg removed') },
  ],
  solve,
}
