import { loc } from '../../../i18n/locale'
import { fmtA, fmtT, fmtVolt, fmtW, type CircuitDef, type Outcome } from './mosApps'

/** 示意参数：负载电源、GPIO 电压、逻辑电平 NMOS 在 Vgs = 3.3 V 时的 Rds(on)、Vds 额定值、续流管压降 */
export const VCC = 5
const VGATE = 3.3
export const RDS = 0.1
export const BVDSS = 30
const VF_FLY = 0.7

export type LoadId = 'led' | 'relay' | 'buzzer'
/** r 线圈电阻或限流电阻 Ω；vf 串联 LED 压降 V；l 线圈电感 H（0 表示非感性） */
/** 栅极串联电阻、栅极下拉电阻，图上标注用 */
export const RG_GPIO = 220
export const RPD_GPIO = 100e3
export const LOADS: Record<LoadId, { r: number; vf: number; l: number }> = {
  led: { r: 330, vf: 2, l: 0 },
  relay: { r: 70, vf: 0, l: 0.2 },
  buzzer: { r: 100, vf: 0, l: 0.02 },
}

const ALL_ON = ['vcc', 'load', 'dn', 'ch', 'gnd', 'gate']

function solve(sel: Record<string, string>, _num: Record<string, number>, fault: string): Outcome {
  const ld = LOADS[sel.load as LoadId] ?? LOADS.led
  const inductive = ld.l > 0
  const i = (VCC - ld.vf) / (ld.r + RDS)
  const energy = 0.5 * ld.l * i * i
  const noFly = fault === 'noFlyback'
  const floatG = fault === 'gateFloat'
  const gpio = sel.gpio

  if (gpio === 'hiz' && floatG) {
    return {
      hot: [],
      tags: { vg: '?', vd: '?', gpio: 'Hi-Z' },
      reads: [
        { label: loc('栅极电压', 'Gate voltage'), value: '?', state: 'fail' },
        { label: loc('管子状态（不确定）', 'Transistor state (undefined)'), value: '?', state: 'fail' },
      ],
      tone: 'bad',
      title: loc('栅极悬空：管子状态不确定', 'Floating gate: state undefined'),
      text: loc(
        '复位期间 GPIO 是高阻，没有下拉电阻时栅极没有任何确定的电压。栅极和沟道之间是氧化层，几乎不漏电，所以哪怕一点点干扰或漏极通过 Cgd 耦合过来的电压，都能把栅极电荷推过 Vth，让负载在上电瞬间误动作；停在 Vth 附近时管子工作在线性区，Vds 大、电流也不小，发热很厉害。',
        'During reset the GPIO is high impedance, and with no pull-down nothing sets the gate voltage. The gate sits behind an oxide layer that barely leaks, so a little noise, or voltage coupled in from the drain through Cgd, can push the gate charge past Vth and trigger the load at power-up; parked near Vth the transistor sits in the linear region with large Vds and real current, and heats up badly.',
      ),
    }
  }
  if (gpio === 'hiz') {
    return {
      hot: [],
      tags: { vg: '0.00 V', vd: fmtVolt(VCC), gpio: 'Hi-Z' },
      reads: [
        { label: loc('栅极电压', 'Gate voltage'), value: '0.00 V', state: 'pass' },
        { label: loc('负载电流', 'Load current'), value: fmtA(0), state: 'pass' },
      ],
      tone: 'ok',
      title: loc('复位高阻：下拉电阻让管子保持关断', 'Reset Hi-Z: the pull-down keeps the transistor off'),
      text: loc(
        'GPIO 高阻时没有谁在驱动栅极，Rpd 把栅极拉到地，Vgs = 0 低于 Vth，管子关断，负载不会在上电或复位时乱动。Rpd 取 100 kΩ 时，GPIO 输出高电平只多耗 3.3 V ÷ 100 kΩ = 33 µA，可以忽略。',
        'With the GPIO in high impedance nothing drives the gate, and Rpd pulls it to ground: Vgs = 0 is below Vth, so the transistor is off and the load does not twitch at power-up or reset. With Rpd = 100 kΩ, a high GPIO wastes only 3.3 V ÷ 100 kΩ = 33 µA, which is negligible.',
      ),
    }
  }
  if (gpio === 'high') {
    const vds = i * RDS
    let tone: Outcome['tone'] = 'ok'
    let title = loc('GPIO 高：沟道导通，负载得电', 'GPIO high: channel on, load powered')
    let text = loc(
      `Vgs = 3.3 V 大于 Vth，沟道导通，电流从 +5 V 经负载、漏极、沟道流到地。管子只剩 Rds(on) 上那一点压降，自己几乎不发热，所以负载电流基本就是 (VCC − 负载压降) ÷ 负载电阻。`,
      `Vgs = 3.3 V is above Vth, so the channel conducts and current flows from +5 V through the load, drain and channel to ground. Only the small Rds(on) drop is left across the transistor, so it barely heats up and the load current is simply (VCC − load drop) ÷ load resistance.`,
    )
    if (floatG) {
      tone = 'warn'
      title = loc('现在看不出问题：下拉电阻只在高阻时才有用', 'Looks fine now: the pull-down only matters in Hi-Z')
      text = loc(
        'GPIO 在驱动栅极时，下拉电阻被它压过，缺了也照样导通，所以平时调试一切正常。坑出在 MCU 复位或还没初始化的时候；把输入切到「复位高阻」就能看到。',
        'While the GPIO drives the gate it overrides the pull-down, so the circuit conducts fine without it and everything looks normal on the bench. The trap appears during reset or before initialisation; switch the input to Reset Hi-Z to see it.',
      )
    } else if (noFly) {
      tone = 'warn'
      title = loc('现在看不出问题：续流二极管只在关断瞬间才用得上', 'Looks fine now: the flyback diode only matters at turn-off')
      text = inductive
        ? loc(
            '导通时电流是稳定的，线圈相当于一个电阻，缺了续流二极管看不出问题。危险在 GPIO 变低的那一瞬间；切到「GPIO 低」看后果。',
            'While on, the current is steady and the coil acts like a resistor, so a missing flyback diode shows nothing. The danger is the instant the GPIO goes low; switch to GPIO low to see the consequence.',
          )
        : loc(
            'LED 负载没有电感，不需要续流二极管，缺了也没有影响。换成继电器或蜂鸣器再看。',
            'An LED has no inductance and needs no flyback diode, so omitting it changes nothing here. Switch to the relay or buzzer to see why it matters.',
          )
    }
    return {
      hot: ALL_ON,
      tags: { vg: fmtVolt(VGATE), vd: fmtVolt(vds), gpio: fmtVolt(VGATE) },
      reads: [
        { label: loc('负载电流', 'Load current'), value: fmtA(i) },
        { label: loc('管子压降 Vds', 'Vds across the FET'), value: `${(vds * 1000).toFixed(1)} mV` },
        { label: loc('管子耗散', 'FET dissipation'), value: fmtW(i * i * RDS) },
      ],
      tone,
      title,
      text,
    }
  }
  // GPIO 低
  if (!inductive) {
    return {
      hot: [],
      tags: { vg: '0.00 V', vd: fmtVolt(VCC), gpio: '0.00 V' },
      reads: [
        { label: loc('栅极电压', 'Gate voltage'), value: '0.00 V', state: 'pass' },
        { label: loc('负载电流', 'Load current'), value: fmtA(0), state: 'pass' },
      ],
      tone: 'ok',
      title: loc('GPIO 低：沟道关断，LED 熄灭', 'GPIO low: channel off, LED dark'),
      text: loc(
        'Vgs = 0 低于 Vth，沟道消失，漏极和地之间断开，没有电流。LED 不是电感，电流停就停了，不需要续流二极管。',
        'Vgs = 0 is below Vth, the channel disappears and the drain is cut off from ground, so no current flows. An LED is not an inductor, so the current simply stops and no flyback diode is needed.',
      ),
    }
  }
  if (!noFly) {
    const tDecay = (ld.l / ld.r) * Math.log(1 + (i * ld.r) / VF_FLY)
    return {
      hot: ['load', 'fl'],
      tags: { vg: '0.00 V', vd: fmtVolt(VCC + VF_FLY), gpio: '0.00 V' },
      reads: [
        { label: loc('漏极被钳在', 'Drain clamped at'), value: fmtVolt(VCC + VF_FLY), state: 'pass' },
        { label: loc('续流时间', 'Freewheel time'), value: fmtT(tDecay) },
        { label: loc('线圈储能 ½LI²', 'Coil energy ½LI²'), value: `${(energy * 1e3).toFixed(2)} mJ` },
      ],
      tone: 'ok',
      title: loc('GPIO 低：续流二极管接走线圈电流', 'GPIO low: the flyback diode takes over the coil current'),
      text: loc(
        '管子一关断，线圈电流不能突变，会把漏极电压推高，直到续流二极管正向导通，电流在「线圈 → 二极管 → 线圈」里循环，漏极被钳在 +5 V 加一个二极管压降，远低于管子的 Vds 额定值。储能在线圈电阻上耗掉，所以继电器释放会慢几毫秒。',
        'The moment the transistor turns off, the coil current cannot change and pushes the drain voltage up until the flyback diode conducts; current then circulates coil → diode → coil and the drain is clamped at +5 V plus one diode drop, far below the Vds rating. The stored energy burns off in the coil resistance, so a relay releases a few milliseconds late.',
      ),
    }
  }
  return {
    hot: ['dn'],
    tags: { vg: '0.00 V', vd: `> ${BVDSS} V`, gpio: '0.00 V' },
    reads: [
      { label: loc('漏极电压', 'Drain voltage'), value: `> ${BVDSS} V`, state: 'fail' },
      { label: loc('线圈储能 ½LI²', 'Coil energy ½LI²'), value: `${(energy * 1e3).toFixed(2)} mJ`, state: 'fail' },
    ],
    tone: 'bad',
    title: loc('缺续流二极管：关断瞬间漏极冲出高压', 'No flyback diode: the drain spikes at turn-off'),
    text: loc(
      '电感上 v = L·di/dt。管子几十纳秒就关断，电流想保持不变，只能让漏极电压一路升高，直到管子雪崩击穿，或者继电器触点拉弧。线圈储存的 ½LI² 全部灌进这颗小管子。一次也许没事，反复开关几百次后管子就会击穿失效。',
      'For an inductor v = L·di/dt. The transistor turns off in tens of nanoseconds and the current insists on continuing, so the drain voltage climbs until the transistor avalanches or the relay contacts arc, and the whole ½LI² stored in the coil is dumped into this small part. One event may survive; a few hundred switching cycles later it fails.',
    ),
  }
}

export const GPIO_CIRCUIT: CircuitDef = {
  id: 'gpio',
  label: loc('GPIO 驱动 LED / 继电器 / 蜂鸣器', 'GPIO drives LED / relay / buzzer'),
  short: loc('GPIO 低边驱动', 'GPIO low-side drive'),
  func: loc(
    'MCU 的 GPIO 只能给几毫安，推不动继电器线圈或蜂鸣器。把一颗 NMOS 放在负载和地之间当低边开关，GPIO 只负责推栅极，大电流走电源、负载、沟道。',
    'An MCU GPIO can only supply a few milliamps and cannot drive a relay coil or a buzzer. An NMOS between the load and ground acts as a low-side switch: the GPIO only drives the gate, and the big current flows from the supply through the load and the channel.',
  ),
  principle: loc(
    'GPIO 高时 Vgs = 3.3 V，沟道导通；GPIO 低时 Vgs = 0，关断。栅极串联电阻 Rg 限制开关瞬间给栅极电容充放电的峰值电流并抑制振铃；栅极对地的下拉电阻 Rpd 让 MCU 复位、GPIO 高阻时栅极仍有确定的低电平。继电器和蜂鸣器是线圈，电流不能突变，关断时必须靠反向并联的续流二极管（阴极接 +5 V）接走电流。',
    'With the GPIO high, Vgs = 3.3 V and the channel conducts; with it low, Vgs = 0 and it is off. The gate series resistor Rg limits the peak current that charges and discharges the gate capacitance and damps ringing; the gate pull-down Rpd keeps a defined low level when the MCU is in reset or the GPIO is high impedance. Relays and buzzers are coils whose current cannot change instantly, so at turn-off a reverse-parallel flyback diode (cathode to +5 V) must take over the current.',
  ),
  params: loc(
    'Vth 要明显低于 3.3 V（逻辑电平管）；Rds(on) 要看 Vgs = 3.3 V 时的值；Vds 额定值要高于电源加续流压降；Rg 取 100 Ω ~ 1 kΩ，Rpd 取 10 kΩ ~ 100 kΩ；续流二极管的电流额定值不小于线圈电流；LED 的电流 I = (VCC − Vf) ÷ R。',
    'Vth must be well below 3.3 V (a logic-level part); read Rds(on) at Vgs = 3.3 V; the Vds rating must exceed the supply plus the clamp drop; Rg is 100 Ω ~ 1 kΩ and Rpd 10 kΩ ~ 100 kΩ; the flyback diode current rating must cover the coil current; LED current is I = (VCC − Vf) ÷ R.',
  ),
  pitfall: loc(
    '漏掉 Rpd，复位期间栅极悬空，继电器乱跳；续流二极管方向接反，一上电就短路；选了 Vth 2.5 V 的普通管，3.3 V 只开一半，管子发烫；把负载接在源极侧，Vgs 随负载抬升，导通不充分。',
    'Omitting Rpd leaves the gate floating during reset and the relay twitches; a reversed flyback diode shorts the supply at power-up; an ordinary part with Vth 2.5 V is only half on at 3.3 V and runs hot; putting the load on the source side makes Vgs shrink as the load voltage rises.',
  ),
  row: {
    part: loc('NMOS 低边 + Rg + Rpd + 续流管', 'Low-side NMOS + Rg + Rpd + flyback diode'),
    param: loc('3.3 V 下的 Rds(on)，Vds 额定值', 'Rds(on) at 3.3 V, Vds rating'),
    pit: loc('栅极悬空、缺续流二极管', 'Floating gate, missing flyback diode'),
  },
  inputs: [
    {
      id: 'gpio',
      label: loc('GPIO', 'GPIO'),
      options: [
        { id: 'high', label: loc('高 3.3 V', 'High 3.3 V') },
        { id: 'low', label: loc('低 0 V', 'Low 0 V') },
        { id: 'hiz', label: loc('复位高阻', 'Reset Hi-Z') },
      ],
    },
    {
      id: 'load',
      label: loc('负载', 'Load'),
      options: [
        { id: 'led', label: loc('LED', 'LED') },
        { id: 'relay', label: loc('继电器', 'Relay') },
        { id: 'buzzer', label: loc('蜂鸣器', 'Buzzer') },
      ],
    },
  ],
  knobs: [],
  faults: [
    { id: 'none', label: loc('正常', 'Normal') },
    { id: 'gateFloat', label: loc('栅极悬空（缺 Rpd）', 'Floating gate (no Rpd)') },
    { id: 'noFlyback', label: loc('缺续流二极管', 'No flyback diode') },
  ],
  solve,
}
