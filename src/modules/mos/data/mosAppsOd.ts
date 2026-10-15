import { loc } from '../../../i18n/locale'
import { fmtA, fmtT, fmtVolt, type CircuitDef, type Outcome } from './mosApps'

/** 示意参数：总线电压、开漏驱动的导通电阻；I2C 的拉低能力 3 mA（VOL 0.4 V） */
export const VDD_OD = 3.3
const RDRV = 25
const ISINK_MAX = 3e-3
/** 10%–90% 上升时间 = RC·ln9 */
export const RISE_K = Math.log(9)

export const odRise = (num: Record<string, number>) => RISE_K * num.rp * 1e3 * num.cb * 1e-12

function solve(sel: Record<string, string>, num: Record<string, number>, fault: string): Outcome {
  const rp = num.rp * 1e3
  const aLow = sel.a === 'low'
  const bLow = sel.b === 'low'
  const low = aLow || bLow
  const tr = odRise(num)
  // I2C 规范按 30%–70% 量上升时间：RC·ln(0.7/0.3)
  const trI2c = (tr / RISE_K) * Math.log(0.7 / 0.3)
  const iLow = VDD_OD / (rp + RDRV)
  const vLow = iLow * RDRV
  const hot = ['pu', 'line']
  if (aLow) {
    hot.push('drA', 'gA')
  }
  if (bLow) {
    hot.push('drB', 'gB')
  }

  if (fault === 'noPullup') {
    return {
      hot: low ? hot.filter((id) => id !== 'pu') : [],
      tags: { vl: low ? fmtVolt(0) : '?', a: aLow ? '1' : '0', b: bLow ? '1' : '0' },
      reads: [
        { label: loc('线电平', 'Line level'), value: low ? fmtVolt(0) : '?', state: 'fail' },
        { label: loc('上升时间', 'Rise time'), value: '∞', state: 'fail' },
      ],
      tone: 'bad',
      title: low ? loc('缺上拉：能拉低，但松手后回不到高', 'No pull-up: can pull low but never recovers') : loc('缺上拉：线悬空，电平不确定', 'No pull-up: the line floats at an undefined level'),
      text: low
        ? loc(
            '开漏输出只会拉低，不会拉高。没有上拉电阻，驱动管一关断，线上的电容只能靠漏电慢慢爬升，总线像卡死在低电平。',
            'An open-drain output can only pull low, never high. With no pull-up, once the driver turns off the line capacitance can only creep up through leakage and the bus appears stuck low.',
          )
        : loc(
            '两个输出都释放时线上没有任何东西驱动，电压由漏电和干扰决定，接收端读到的是随机值；测试时也测不出 VOH。',
            'With both outputs released nothing drives the line, so leakage and noise decide the voltage and the receiver reads random values; VOH cannot be measured either.',
          ),
    }
  }
  const reads = [
    { label: loc('线电平', 'Line level'), value: low ? fmtVolt(vLow) : fmtVolt(VDD_OD), state: 'pass' as const },
    { label: loc('拉低时 Rp 上的电流', 'Pull-up current when low'), value: fmtA(iLow), state: iLow > ISINK_MAX ? ('fail' as const) : undefined },
    { label: loc('10–90 % 上升时间', '10–90 % rise time'), value: fmtT(tr) },
    { label: loc('I2C 30–70 % ≤ 1000 ns（标准模式）', 'I2C 30–70 % ≤ 1000 ns (standard mode)'), value: fmtT(trI2c), state: trI2c <= 1e-6 ? ('pass' as const) : ('fail' as const) },
    { label: loc('I2C 30–70 % ≤ 300 ns（快速模式）', 'I2C 30–70 % ≤ 300 ns (fast mode)'), value: fmtT(trI2c), state: trI2c <= 300e-9 ? ('pass' as const) : ('fail' as const) },
  ]
  const tags = { vl: low ? fmtVolt(vLow) : fmtVolt(VDD_OD), a: aLow ? '1' : '0', b: bLow ? '1' : '0' }
  if (!low) {
    return {
      hot,
      tags,
      reads,
      tone: trI2c <= 1e-6 ? 'ok' : 'warn',
      title: loc('A、B 都释放：上拉电阻把线拉高', 'A and B both released: the pull-up pulls the line high'),
      text: loc(
        '两个 NMOS 都关断，线上没有任何东西往下拉，Rp 给线上的电容 Cb 充电，电压按 RC 指数上升，10–90 % 上升时间 ≈ 2.2 × Rp × Cb。上升沿由电阻决定而不是由管子决定，所以开漏总线的上升沿总比下降沿慢；调大 Rp 或 Cb，上升时间立刻变长。',
        'Both NMOS devices are off, nothing pulls the line down, and Rp charges the line capacitance Cb: the voltage rises exponentially with 10–90 % rise time ≈ 2.2 × Rp × Cb. The resistor, not the transistor, sets the rising edge, so an open-drain bus always rises slower than it falls; increase Rp or Cb and the rise time lengthens at once.',
      ),
    }
  }
  const both = aLow && bLow
  return {
    hot,
    tags,
    reads,
    tone: iLow > ISINK_MAX ? 'warn' : 'ok',
    title: both ? loc('A、B 都拉低：线与，线为低', 'A and B both low: wired-AND, line is low') : loc('只有一个拉低：线就是低', 'One output pulls low: the line is low'),
    text: both
      ? loc(
          '两个管子同时导通，电流分摊，线仍然是低。这就是线与：只要有一个拉低线就是低，只有都释放才为高，相当于 A 与 B（高 = 释放）。多个器件挂在同一条线上（I2C、中断线）靠的就是这个性质；推挽输出一高一低会直接短路，开漏不会。',
          'Both transistors conduct, share the current, and the line stays low. This is wired-AND: any output pulling low makes the line low, and only when all release is it high, equal to A AND B (high = released). Several devices on one line (I2C, interrupt lines) rely on this; push-pull outputs fighting high against low would short the supply, open-drain outputs do not.',
        )
      : loc(
          '导通的 NMOS 把线拉到 VDD × Rdrv ÷ (Rp + Rdrv)，Rdrv 只有几十欧，所以低电平接近 0；下降沿由这个很小的电阻放电，很快。拉低期间 Rp 上持续流过 VDD ÷ Rp 的电流，Rp 取得太小会超过驱动的灌电流能力、抬高低电平。',
          'The conducting NMOS holds the line at VDD × Rdrv ÷ (Rp + Rdrv); Rdrv is only tens of ohms, so the low is close to 0, and the falling edge discharges through this small resistance quickly. While low, VDD ÷ Rp flows continuously in Rp; too small an Rp exceeds the driver’s sink capability and lifts the low level.',
        ),
  }
}

export const OD_CIRCUIT: CircuitDef = {
  id: 'openDrain',
  label: loc('开漏输出与上拉电阻', 'Open-drain output and pull-up'),
  short: loc('开漏线与', 'Open-drain wired-AND'),
  func: loc(
    '多个器件共用一条信号线（I2C、中断、复位）：谁都可以把线拉低，都不拉时线自己变高；也能让不同电压的器件通过改变上拉电压来对接。',
    'Let several devices share one signal line (I2C, interrupt, reset): any of them can pull it low, and when none does it goes high by itself; devices at different voltages can also interface by changing the pull-up voltage.',
  ),
  principle: loc(
    '开漏输出级只有下面一颗 NMOS：导通就把线拉到地，关断时输出是高阻，什么也不驱动。线的高电平靠外部上拉电阻 Rp 拉到 VDD。多个开漏输出可以直接并联，线为高当且仅当所有输出都释放（线与）。上升沿是 Rp 给线电容 Cb 充电，下降沿是管子放电。',
    'An open-drain output stage is just the lower NMOS: when on it pulls the line to ground, when off the output is high impedance and drives nothing. The high level comes from an external pull-up resistor Rp to VDD. Several open-drain outputs can be wired together and the line is high only when all outputs are released (wired-AND). The rising edge is Rp charging the line capacitance Cb; the falling edge is the transistor discharging it.',
  ),
  params: loc(
    '上拉电阻 Rp：太大则上升慢，太小则拉低时电流大、低电平抬高。上限由上升时间 tr ≈ 2.2·Rp·Cb 决定，下限由 (VDD − VOL) ÷ IOL 决定（I2C 取 3 mA、0.4 V，3.3 V 时最小约 1 kΩ）；Cb 是线上所有引脚和走线电容之和。',
    'Pull-up Rp: too large and the rise is slow, too small and the low-state current is large and the low level lifts. The upper limit comes from rise time tr ≈ 2.2·Rp·Cb, the lower limit from (VDD − VOL) ÷ IOL (I2C uses 3 mA at 0.4 V, about 1 kΩ minimum at 3.3 V); Cb is the sum of all pin and trace capacitance on the line.',
  ),
  pitfall: loc(
    '忘了上拉，线永远高不了，也测不出 VOH；Rp 太大，高速时波形圆成三角；Rp 太小，低电平不够低；把开漏脚当推挽用，输出 1 实际是高阻，没有上拉就悬空。给开漏脚测 VOH 要外接上拉。',
    'Forgetting the pull-up means the line never goes high and VOH cannot be measured; too large an Rp rounds the waveform into a triangle at speed; too small an Rp leaves the low level too high; treating an open-drain pin as push-pull makes output 1 a high impedance that floats without a pull-up. Measuring VOH on an open-drain pin needs an external pull-up.',
  ),
  row: {
    part: loc('开漏 NMOS + 上拉电阻 Rp', 'Open-drain NMOS + pull-up Rp'),
    param: loc('Rp 的上下限，线电容 Cb', 'Rp limits, line capacitance Cb'),
    pit: loc('忘了上拉、Rp 取值不当', 'Forgotten pull-up, wrong Rp'),
  },
  inputs: [
    {
      id: 'a',
      label: loc('输出 A', 'Output A'),
      options: [
        { id: 'release', label: loc('释放（高阻）', 'Released (Hi-Z)') },
        { id: 'low', label: loc('拉低', 'Pull low') },
      ],
    },
    {
      id: 'b',
      label: loc('输出 B', 'Output B'),
      options: [
        { id: 'release', label: loc('释放（高阻）', 'Released (Hi-Z)') },
        { id: 'low', label: loc('拉低', 'Pull low') },
      ],
    },
  ],
  knobs: [
    { id: 'rp', label: loc('上拉电阻 Rp', 'Pull-up Rp'), unit: 'kΩ', min: 1, max: 47, step: 0.1, init: 4.7 },
    { id: 'cb', label: loc('线电容 Cb', 'Line capacitance Cb'), unit: 'pF', min: 10, max: 400, step: 10, init: 100 },
  ],
  faults: [
    { id: 'none', label: loc('正常', 'Normal') },
    { id: 'noPullup', label: loc('缺上拉电阻', 'Missing pull-up') },
  ],
  solve,
}
