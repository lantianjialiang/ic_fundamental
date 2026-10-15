import { loc } from '../../../i18n/locale'
import { fmtA, fmtVolt, fmtW, type CircuitDef, type Outcome } from './mosApps'

/** 示意参数：输入电压、栅源上拉 R1、串联电阻 R2、负载电阻、PMOS 导通电阻（Vsg ≈ 11 V 时）、体二极管压降 */
export const VIN = 12
export const R1 = 100e3
export const R2 = 10e3
const RLOAD = 6
const RDS = 0.03
const VF_BODY = 0.7

const ON_HOT = ['vin', 'ch', 'out', 'load', 'gnd', 'sig', 'gdrv', 'q2', 'q2s']

function solve(sel: Record<string, string>, _num: Record<string, number>, fault: string): Outcome {
  const gpio = sel.gpio
  const gateFloat = fault === 'gateFloat'
  const noPull = fault === 'noPullup'
  const reversed = fault === 'pmosReversed'
  const vsg = (VIN * R1) / (R1 + R2)
  const iOn = VIN / (RLOAD + RDS)
  const iGate = VIN / (R1 + R2)

  if (gpio === 'hiz' && gateFloat) {
    return {
      hot: [],
      tags: { vg: '?', vout: '?', gpio: 'Hi-Z' },
      reads: [
        { label: loc('Q2 栅极电压', 'Q2 gate voltage'), value: '?', state: 'fail' },
        { label: loc('输出电压', 'Output voltage'), value: '?', state: 'fail' },
      ],
      tone: 'bad',
      title: loc('驱动管栅极悬空：电源通断不确定', 'Floating driver gate: the power rail may switch at random'),
      text: loc(
        'GPIO 高阻且 Q2 栅极没有下拉电阻时，Q2 的栅极电压由干扰决定。Q2 稍微导通一点，就会把 PMOS 的栅极拉低，负载在上电或复位时被意外接通；负载是电机或大电容时，这个误动作会直接造成冲击。',
        'With the GPIO in high impedance and no pull-down on Q2’s gate, interference decides Q2’s gate voltage. If Q2 conducts even slightly it pulls the PMOS gate low and the load is connected by accident at power-up or reset; with a motor or a large capacitor as the load, that accident is a direct shock.',
      ),
    }
  }
  const on = gpio === 'high'
  if (reversed) {
    const voutOff = VIN - VF_BODY
    const i = voutOff / RLOAD
    const voutShown = on ? VIN - iOn * RDS : voutOff
    return {
      hot: on ? ON_HOT : ['vin', 'dio', 'out', 'load', 'gnd'],
      tags: { vg: on ? '0.00 V' : fmtVolt(VIN), vout: fmtVolt(voutShown), gpio: on ? fmtVolt(3.3) : '0.00 V' },
      reads: [
        { label: loc('输出电压', 'Output voltage'), value: fmtVolt(voutShown), state: on ? 'pass' : 'fail' },
        { label: loc('关断时体二极管耗散', 'Body diode loss when off'), value: on ? '0' : fmtW(i * VF_BODY), state: on ? 'pass' : 'fail' },
      ],
      tone: on ? 'warn' : 'bad',
      title: on ? loc('PMOS 装反：导通时看不出问题', 'PMOS reversed: fine while on') : loc('PMOS 装反：关不断', 'PMOS reversed: cannot turn off'),
      text: on
        ? loc(
            '导通时沟道里电流双向都能流，装反了照样导通，所以只测「开」的功能发现不了。关断时才暴露；把 GPIO 切到低看后果。',
            'The channel carries current in both directions, so a reversed part still conducts when on and a test of the on state alone does not reveal it. It shows up only when turned off; switch the GPIO to low to see it.',
          )
        : loc(
            '装反后，源极在负载一侧、漏极在电源一侧。PMOS 体二极管的阳极是漏极、阴极是源极，于是电流从电源经体二极管直接流向负载，Vgs 再怎么关也没用，输出始终有 Vin − 0.7 V，二极管还在发热。',
            'Mounted backwards, the source is on the load side and the drain on the supply side. The PMOS body diode has its anode at the drain and its cathode at the source, so current flows from the supply through the body diode straight to the load, and no gate voltage can stop it: the output always sits at Vin − 0.7 V while the diode heats up.',
          ),
    }
  }
  if (on) {
    const vout = VIN - iOn * RDS
    let tone: Outcome['tone'] = 'ok'
    let title = loc('GPIO 高：Q2 导通，PMOS 导通', 'GPIO high: Q2 on, PMOS on')
    let text = loc(
      'Q2 导通把 PMOS 的栅极拉到接近 0 V，此时 R1、R2 分压：Vsg = Vin × R1 ÷ (R1 + R2) ≈ 10.9 V，超过 |Vth|，PMOS 沟道导通，Vin 经沟道送到负载。分压还保证 Vsg 不会超过栅极绝对最大值 ±20 V；R1 + R2 在 Q2 导通时会持续流 110 µA，所以阻值不能取太小。',
      'Q2 turning on pulls the PMOS gate close to 0 V, and R1 and R2 divide the voltage: Vsg = Vin × R1 ÷ (R1 + R2) ≈ 10.9 V, above |Vth|, so the PMOS channel conducts and carries Vin to the load. The divider also keeps Vsg inside the ±20 V gate rating; R1 + R2 draws a steady 110 µA while Q2 is on, so the values cannot be made too small.',
    )
    if (noPull) {
      tone = 'warn'
      title = loc('缺 R1：导通时看不出问题', 'No R1: fine while on')
      text = loc(
        '导通时 Q2 把栅极直接拉低，没有 R1 也能开。问题在关断：没有 R1，栅极没人往上拉；切到「GPIO 低」看后果。',
        'While on, Q2 pulls the gate low directly, so the switch turns on without R1. The problem is turn-off: with no R1 nothing pulls the gate up; switch to GPIO low to see it.',
      )
    } else if (gateFloat) {
      tone = 'warn'
      title = loc('现在看不出问题：Q2 的下拉只在高阻时才有用', 'Looks fine now: Q2’s pull-down only matters in Hi-Z')
      text = loc(
        'GPIO 驱动 Q2 栅极时，缺下拉电阻也能工作。隐患在复位高阻期间；切到「复位高阻」看后果。',
        'While the GPIO drives Q2’s gate the circuit works without the pull-down. The hazard is during reset Hi-Z; switch to Reset Hi-Z to see it.',
      )
    }
    return {
      hot: ON_HOT,
      tags: { vg: noPull ? '0.00 V' : fmtVolt(VIN - iGate * R1), vout: fmtVolt(vout), gpio: fmtVolt(3.3) },
      reads: [
        { label: loc('|Vsg|', '|Vsg|'), value: fmtVolt(noPull ? VIN : vsg) },
        { label: loc('负载电流', 'Load current'), value: fmtA(iOn) },
        { label: loc('PMOS 耗散', 'PMOS dissipation'), value: fmtW(iOn * iOn * RDS) },
      ],
      tone,
      title,
      text,
    }
  }
  if (noPull) {
    return {
      hot: ['vin', 'ch', 'out', 'load', 'gnd'],
      tags: { vg: '~0 V', vout: `~${fmtVolt(VIN)}`, gpio: '0.00 V' },
      reads: [
        { label: loc('PMOS 栅极（悬空）', 'PMOS gate (floating)'), value: '?', state: 'fail' },
        { label: loc('输出电压', 'Output voltage'), value: `~${fmtVolt(VIN)}`, state: 'fail' },
      ],
      tone: 'bad',
      title: loc('缺 R1：PMOS 栅极悬空，关不断', 'No R1: floating PMOS gate, cannot turn off'),
      text: loc(
        'Q2 关断后，PMOS 的栅极没有任何东西往 Vin 拉，栅源电容里存着之前导通时的 −12 V 电荷，只能靠极小的漏电慢慢放掉，输出会保持几秒甚至更久，开关像「粘住」了。R1 的作用就是关断时给栅源电容放电，并保证 Vgs = 0。',
        'After Q2 turns off nothing pulls the PMOS gate up toward Vin; the gate-source capacitance still holds the −12 V charge from the on state and can only leak away very slowly, so the output stays up for seconds or longer and the switch seems stuck. R1 discharges the gate-source capacitance at turn-off and guarantees Vgs = 0.',
      ),
    }
  }
  return {
    hot: [],
    tags: { vg: fmtVolt(VIN), vout: '0.00 V', gpio: gpio === 'hiz' ? 'Hi-Z' : '0.00 V' },
    reads: [
      { label: loc('|Vsg|', '|Vsg|'), value: '0.00 V', state: 'pass' },
      { label: loc('负载电流', 'Load current'), value: fmtA(0), state: 'pass' },
    ],
    tone: 'ok',
    title: gpio === 'hiz' ? loc('复位高阻：下拉让 Q2 关断，电源保持断开', 'Reset Hi-Z: the pull-down keeps Q2 off and the rail disconnected') : loc('GPIO 低：Q2 关断，PMOS 关断', 'GPIO low: Q2 off, PMOS off'),
    text: loc(
      'Q2 关断后没有电流流过 R1，R1 把 PMOS 栅极拉到和源极同电平，Vsg = 0，沟道消失。体二极管的阳极在漏极（负载侧）、阴极在源极（Vin 侧），方向与电流相反，不会漏电。注意 Q2 关断时漏极承受 Vin，Q2 的 Vds 额定值要高于 12 V。',
      'With Q2 off no current flows through R1, which pulls the PMOS gate to the source level: Vsg = 0 and the channel disappears. The body diode has its anode at the drain (load side) and its cathode at the source (Vin side), opposing the current, so nothing leaks. Note that Q2 sees Vin across its drain when off, so its Vds rating must exceed 12 V.',
    ),
  }
}

export const LOADSW_CIRCUIT: CircuitDef = {
  id: 'loadSw',
  label: loc('负载开关与电源路径', 'Load switch and power path'),
  short: loc('PMOS 高边开关', 'PMOS high-side switch'),
  func: loc(
    '用 MCU 的 3.3 V 信号控制 12 V 电源轨的通断：关断时负载完全断电，不留漏电路径；也可以用来在多个电源之间切换（电源路径管理）。',
    'Use a 3.3 V MCU signal to connect or disconnect a 12 V supply rail: when off the load is fully unpowered with no leakage path; the same idea switches between several supplies (power-path management).',
  ),
  principle: loc(
    '高边开关放在电源和负载之间。PMOS 的源极接 Vin，栅极拉到源极电平就关断，拉到比源极低一个 Vth 以上才导通。3.3 V 的 GPIO 最高只到 3.3 V，直接接 PMOS 栅极关不断 12 V 的管子（Vsg 还有 8.7 V），所以加一个 NMOS（Q2）做电平移位：GPIO 高，Q2 导通，把 PMOS 栅极经 R2 拉低；GPIO 低，Q2 关断，R1 把栅极拉回 Vin。R1、R2 分压还限制了 Vsg。',
    'A high-side switch sits between supply and load. The PMOS source goes to Vin; pulling the gate to the source level turns it off, and pulling it more than one Vth below the source turns it on. A 3.3 V GPIO only reaches 3.3 V, so wired straight to the gate it could never turn off a 12 V PMOS (Vsg would still be 8.7 V); an NMOS (Q2) acts as a level shifter instead: GPIO high turns Q2 on and pulls the PMOS gate low through R2; GPIO low turns Q2 off and R1 pulls the gate back to Vin. R1 and R2 also divide down Vsg.',
  ),
  params: loc(
    '|Vgs| 绝对最大值要高于 Vsg（常见 ±20 V）；Rds(on) 看 Vsg ≈ 10 V 时的值；Vds 额定值高于 Vin 并留余量；Q2 的 Vds 额定值也要高于 Vin；R1 取 10 kΩ ~ 100 kΩ，R2 约为 R1 的十分之一；负载电流决定 PMOS 的耗散 I²·Rds(on)。',
    'The |Vgs| absolute maximum must exceed Vsg (typically ±20 V); read Rds(on) at Vsg ≈ 10 V; the Vds rating must exceed Vin with margin, and so must Q2’s; R1 is 10 kΩ ~ 100 kΩ and R2 about a tenth of R1; load current sets PMOS dissipation I²·Rds(on).',
  ),
  pitfall: loc(
    '缺 R1，PMOS 栅极悬空关不断；PMOS 装反（源漏颠倒），体二极管让负载永远有电；Q2 栅极没有下拉，复位时电源误通；没算 Vin 过高时 Vsg 超限；负载有大电容时开通瞬间浪涌很大，见软启动。',
    'Omitting R1 leaves the PMOS gate floating and it cannot turn off; a reversed PMOS (source and drain swapped) lets the body diode power the load forever; no pull-down on Q2’s gate switches the rail on by accident during reset; forgetting that Vsg can exceed its limit when Vin is high; a large load capacitor causes a big inrush at turn-on, see soft start.',
  ),
  row: {
    part: loc('PMOS 高边 + NMOS 电平移位 + R1、R2', 'High-side PMOS + NMOS level shifter + R1, R2'),
    param: loc('|Vgs| 最大值，Rds(on)，两颗管的 Vds 额定值', '|Vgs| maximum, Rds(on), Vds ratings of both parts'),
    pit: loc('缺 R1 关不断、PMOS 装反', 'Missing R1 cannot turn off, reversed PMOS'),
  },
  inputs: [
    {
      id: 'gpio',
      label: loc('GPIO', 'GPIO'),
      options: [
        { id: 'high', label: loc('高 3.3 V（开）', 'High 3.3 V (on)') },
        { id: 'low', label: loc('低 0 V（关）', 'Low 0 V (off)') },
        { id: 'hiz', label: loc('复位高阻', 'Reset Hi-Z') },
      ],
    },
  ],
  knobs: [],
  faults: [
    { id: 'none', label: loc('正常', 'Normal') },
    { id: 'gateFloat', label: loc('Q2 栅极悬空', 'Q2 gate floating') },
    { id: 'noPullup', label: loc('缺上拉 R1', 'Missing pull-up R1') },
    { id: 'pmosReversed', label: loc('PMOS 装反', 'PMOS reversed') },
  ],
  solve,
}
