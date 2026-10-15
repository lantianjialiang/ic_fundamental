import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { SOA, powerLimit } from './mosSelectSoa'

const P_DC = Math.round(powerLimit(Infinity))
const P_1MS = Math.round(powerLimit(0.001))

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '手册写着 Vgs(th) = 0.5 / 0.8 / 1.2 V（min / typ / max，Id = 250 µA）。能由此说明 3.3 V 驱动时它已经可以导通 2 A 吗？',
      'The datasheet says Vgs(th) = 0.5 / 0.8 / 1.2 V (min / typ / max, Id = 250 µA). Does that show that 3.3 V drive already conducts 2 A?',
    ),
    options: [
      { id: 'a', text: loc('能：3.3 V 远高于 1.2 V', 'Yes: 3.3 V is far above 1.2 V') },
      { id: 'b', text: loc('不能：Vth 只是 250 µA 的起点，要看 Rds(on) 在 ≤ 3.3 V 的 Vgs 下有没有标值', 'No: Vth is only the 250 µA starting point; check whether Rds(on) is specified at a Vgs ≤ 3.3 V') },
      { id: 'c', text: loc('不能：Vth 必须不小于 3.3 V 才导通', 'No: Vth must be at least 3.3 V before it conducts') },
    ],
    answer: 'b',
    explain: loc(
      '250 µA 到 2 A 差 8000 倍，要靠 Vgs 继续往上抬；抬到多少只有 Rds(on) 的测试行能保证。Vth 过关是必要条件，不是充分条件。',
      '250 µA to 2 A is a factor of 8000 that Vgs must keep climbing to deliver, and only an Rds(on) test row guarantees how far. A good Vth is necessary, not sufficient.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('下面哪一份手册数据，最能证明这颗管子可以由 3.3 V 的 MCU 直接驱动？', 'Which datasheet data best shows that the part can be driven directly by a 3.3 V MCU?'),
    options: [
      { id: 'a', text: loc('Vgs(th) 典型 1.0 V，Rds(on) 只标了 Vgs = 10 V', 'Typical Vgs(th) 1.0 V, Rds(on) specified only at Vgs = 10 V') },
      { id: 'b', text: loc('Id = 40 A，Vds = 30 V', 'Id = 40 A, Vds = 30 V') },
      { id: 'c', text: loc('Rds(on) ≤ 14 mΩ @ Vgs = 2.5 V，Vgs(th) 最大 1.5 V', 'Rds(on) ≤ 14 mΩ at Vgs = 2.5 V, Vgs(th) max 1.5 V') },
    ],
    answer: 'c',
    explain: loc(
      'C 同时给出了不高于驱动电压的 Rds(on) 测试行和足够低的 Vth 最大值。A 只在 10 V 下有保证；B 的电压电流额定和栅极驱动无关。',
      'C gives an Rds(on) row at or below the drive voltage and a low enough Vth maximum. A is only guaranteed at 10 V; B’s voltage and current ratings say nothing about gate drive.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      `某管 SOA：Vds 最大 ${SOA.vmax} V，Id 最大 ${SOA.imax} A，直流功率限制约 ${P_DC} W，1 ms 脉冲的功率限制约 ${P_1MS} W。工作点 Vds = 20 V、Id = 5 A，持续直流，在 SOA 里吗？`,
      `A part's SOA: Vds max ${SOA.vmax} V, Id max ${SOA.imax} A, DC power limit about ${P_DC} W, power limit for a 1 ms pulse about ${P_1MS} W. The operating point Vds = 20 V, Id = 5 A is held as DC. Is it inside the SOA?`,
    ),
    options: [
      { id: 'a', text: loc(`不在：P = 100 W，超过直流功率限制；若只持续 1 ms，限制约 ${P_1MS} W，就在 SOA 里`, `No: P = 100 W exceeds the DC power limit; held for only 1 ms the limit is about ${P_1MS} W and it would be inside`) },
      { id: 'b', text: loc('在：Vds 和 Id 都没有超过各自的最大值', 'Yes: neither Vds nor Id exceeds its own maximum') },
      { id: 'c', text: loc('不在：Vds 超过了 Rds(on) 限制线', 'No: Vds exceeds the Rds(on) limit line') },
    ],
    answer: 'a',
    explain: loc(
      'SOA 同时有电压、电流、功率和 Rds(on) 四条边界，只看最大值会漏掉功率这堵墙。100 W 的热直流下只能靠 RθJC 往外散；脉冲短，热来不及扩散，限制就抬高了。',
      'The SOA has voltage, current, power and Rds(on) boundaries together; looking only at the maximums misses the power wall. Under DC, 100 W of heat leaves only through RθJC; a shorter pulse gives heat no time to spread, so the limit rises.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      'SOT-23（RθJA ≈ 250 °C/W）通过 1 A，热态 Rds(on) = 100 mΩ，环境 25 °C。结温 Tj 约为多少？',
      'A SOT-23 (RθJA ≈ 250 °C/W) carries 1 A with a hot Rds(on) of 100 mΩ at 25 °C ambient. About what is Tj?',
    ),
    options: [
      { id: 'a', text: loc('35 °C', '35 °C') },
      { id: 'b', text: loc('125 °C', '125 °C') },
      { id: 'c', text: loc('50 °C', '50 °C') },
    ],
    answer: 'c',
    explain: loc(
      'P = I² × Rds(on) = 1² × 0.1 = 0.1 W；Tj = Ta + P × RθJA = 25 + 0.1 × 250 = 50 °C。0.1 W 看着很小，但 SOT-23 每瓦升 250 °C，电流翻倍功耗就翻四倍。',
      'P = I² × Rds(on) = 1² × 0.1 = 0.1 W; Tj = Ta + P × RθJA = 25 + 0.1 × 250 = 50 °C. 0.1 W looks tiny, but a SOT-23 rises 250 °C per watt, and doubling the current quadruples the power.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '3.3 V MCU 用低边 NMOS 驱动 12 V 继电器线圈，没有加二极管，开关几次后 MOS 管漏源短路。最可能的原因和解决办法是？',
      'A 3.3 V MCU drives a 12 V relay coil through a low-side NMOS with no diode, and after a few switchings the MOSFET shorts drain to source. What is the most likely cause and fix?',
    ),
    options: [
      { id: 'a', text: loc('栅极浮空，加下拉电阻', 'A floating gate; add a pull-down resistor') },
      { id: 'b', text: loc('关断时线圈电流不能突变，漏极被顶到雪崩；在线圈两端反并联续流二极管', 'On turn-off the coil current cannot jump and the drain is driven into avalanche; put a flyback diode across the coil') },
      { id: 'c', text: loc('Vgs 太低导致发热，换更大封装', 'Vgs is too low and causes heating; use a larger package') },
    ],
    answer: 'b',
    explain: loc(
      '线圈的储能 ½·L·I² 在关断时无处可去，只能靠 MOSFET 雪崩吸收，每次都损伤管芯。续流二极管给电流一条回路，把漏极钳在电源 + 0.5 V 左右。',
      'The coil’s stored ½·L·I² has nowhere to go on turn-off except into MOSFET avalanche, damaging the die each time. A flyback diode gives the current a path and clamps the drain near the supply + 0.5 V.',
    ),
  },
]
