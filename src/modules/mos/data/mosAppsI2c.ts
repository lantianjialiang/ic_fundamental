import { loc } from '../../../i18n/locale'
import { fmtVolt, type CircuitDef, type Outcome } from './mosApps'

/** 示意参数：两侧电压、上拉电阻、BSS138 类小管的 Ron 和 Vth、外部开漏驱动的导通电阻、体二极管压降 */
export const V_LV = 3.3
export const V_HV = 5
const RPU = 4700
const RON = 5
const RDRV = 25
export const VTH = 1.3
const VF_BODY = 0.6

/** 一侧驱动把节点拉低时，两侧上拉电流都流进驱动。返回被拉的节点和另一侧节点电压（沟道导通时） */
function pullBoth(vOwn: number, vOther: number) {
  const g1 = 1 / RPU
  const g2 = 1 / (RPU + RON)
  const own = (RDRV * (vOwn * g1 + vOther * g2)) / (1 + RDRV * (g1 + g2))
  const iOther = (vOther - own) * g2
  return { own, other: own + iOther * RON }
}

function solve(sel: Record<string, string>, _num: Record<string, number>, fault: string): Outcome {
  const who = sel.who
  const noPuHv = fault === 'noPuHV'
  const noPuLv = fault === 'noPuLV'
  const gateFloat = fault === 'gateFloat'

  if (noPuHv || noPuLv) {
    const lowNode = who === 'none' ? '?' : '0.05 V'
    return {
      hot: who === 'lv' ? ['puL', 'lv', 'ch', 'hv', 'drL'] : who === 'hv' ? ['puH', 'hv', 'ch', 'lv', 'drH'] : [],
      tags: {
        vl: noPuLv ? (who === 'none' || who === 'hv' ? '?' : lowNode) : who === 'none' ? fmtVolt(V_LV) : lowNode,
        vh: noPuHv ? (who === 'none' || who === 'lv' ? '?' : lowNode) : who === 'none' ? fmtVolt(V_HV) : lowNode,
        vgs: who === 'none' ? '0.00 V' : '3.28 V',
      },
      reads: [
        { label: loc('缺上拉的一侧', 'Side without pull-up'), value: noPuHv ? '5 V' : '3.3 V', state: 'fail' },
        { label: loc('高电平', 'High level'), value: '?', state: 'fail' },
      ],
      tone: 'bad',
      title: noPuHv ? loc('缺 5 V 侧上拉：这一侧回不到高电平', 'No 5 V pull-up: that side never returns high') : loc('缺 3.3 V 侧上拉：这一侧回不到高电平', 'No 3.3 V pull-up: that side never returns high'),
      text: loc(
        '开漏的总线只有「拉低」一个动作，变高全靠上拉电阻给电。缺了上拉，没人拉低的时候这一侧悬空，电压不确定；拉低之后松手，也只能靠漏电慢慢回升，总线像卡死在低电平。这个电平转换电路两侧各需要一个上拉，缺哪一侧，哪一侧就出问题。',
        'An open-drain bus has only one active action, pulling low; going high depends entirely on the pull-up resistor. With the pull-up missing, that side floats at an undefined voltage when nobody pulls low, and after a pull-down is released it can only creep back up through leakage, so the bus looks stuck low. This level shifter needs one pull-up on each side; whichever is missing, that side fails.',
      ),
    }
  }
  if (who === 'none') {
    return {
      hot: [],
      tags: { vl: fmtVolt(V_LV), vh: fmtVolt(V_HV), vgs: '0.00 V' },
      reads: [
        { label: loc('3.3 V 侧', '3.3 V side'), value: fmtVolt(V_LV), state: 'pass' },
        { label: loc('5 V 侧', '5 V side'), value: fmtVolt(V_HV), state: 'pass' },
        { label: loc('Vgs', 'Vgs'), value: '0.00 V' },
      ],
      tone: gateFloat ? 'warn' : 'ok',
      title: gateFloat ? loc('现在看不出问题：两边都高时管子本来就关断', 'Looks fine now: with both sides high the transistor is off anyway') : loc('两边都高：Vgs = 0，管子关断', 'Both high: Vgs = 0, transistor off'),
      text: gateFloat
        ? loc(
            '两边都高时无论栅极在哪，管子都不导通，所以缺栅极偏置在空闲时看不出来。隐患在有一侧拉低的时候；切到「3.3 V 侧拉低」看后果。',
            'With both sides high the transistor is off wherever the gate sits, so a missing gate bias does not show when the bus is idle. The hazard appears when one side pulls low; switch to the 3.3 V side pulls low to see it.',
          )
        : loc(
            '栅极固定在 3.3 V，源极被 3.3 V 上拉到 3.3 V，Vgs = 3.3 − 3.3 = 0，小于 Vth，沟道不存在；体二极管阳极（源极 3.3 V）低于阴极（漏极 5 V），反偏。两侧互不连通，各自被自己的上拉电阻拉到自己的电压。',
            'The gate is fixed at 3.3 V and the source is pulled up to 3.3 V, so Vgs = 3.3 − 3.3 = 0, below Vth: no channel. The body diode’s anode (source, 3.3 V) is below its cathode (drain, 5 V) and is reverse biased. The two sides are isolated, each pulled to its own voltage by its own pull-up.',
          ),
    }
  }
  if (who === 'lv') {
    const r = pullBoth(V_LV, V_HV)
    if (gateFloat) {
      return {
        hot: ['puL', 'lv', 'drL'],
        tags: { vl: '0.02 V', vh: fmtVolt(V_HV), vgs: '?' },
        reads: [
          { label: loc('3.3 V 侧', '3.3 V side'), value: '0.02 V' },
          { label: loc('5 V 侧', '5 V side'), value: fmtVolt(V_HV), state: 'fail' },
        ],
        tone: 'bad',
        title: loc('栅极悬空：低电平传不过去', 'Floating gate: the low level does not cross'),
        text: loc(
          '3.3 V 侧拉低后，源极变低，但栅极没有被固定在 3.3 V，Vgs 不确定；若栅极在低电位，Vgs ≈ 0，沟道不形成，体二极管（阳极源极、阴极漏极）又是反偏的，5 V 一侧收不到低电平，通信失败。',
          'When the 3.3 V side pulls low the source goes low, but the gate is not held at 3.3 V so Vgs is undefined; if the gate sits low, Vgs ≈ 0, no channel forms, and the body diode (anode at the source, cathode at the drain) is reverse biased, so the 5 V side never sees the low and communication fails.',
        ),
      }
    }
    return {
      hot: ['puL', 'lv', 'ch', 'hv', 'puH', 'drL'],
      tags: { vl: fmtVolt(r.own), vh: fmtVolt(r.other), vgs: fmtVolt(V_LV - r.own) },
      reads: [
        { label: loc('3.3 V 侧', '3.3 V side'), value: fmtVolt(r.own), state: 'pass' },
        { label: loc('5 V 侧', '5 V side'), value: fmtVolt(r.other), state: 'pass' },
        { label: loc('Vgs', 'Vgs'), value: fmtVolt(V_LV - r.own) },
      ],
      tone: 'ok',
      title: loc('3.3 V 侧拉低：沟道导通，5 V 侧跟着变低', '3.3 V side pulls low: channel on, the 5 V side follows'),
      text: loc(
        '3.3 V 侧的驱动把源极拉到接近 0，栅极还在 3.3 V，Vgs ≈ 3.3 V 大于 Vth，沟道导通，漏极（5 V 侧）经沟道也被拉到几乎同样的低电平。5 V 侧上拉电阻的电流通过沟道流进驱动，低电平因此比纯 3.3 V 侧略高几十毫伏，仍远低于 VIL。',
        'The 3.3 V side driver pulls the source close to 0 while the gate stays at 3.3 V, so Vgs ≈ 3.3 V is above Vth and the channel conducts; the drain (5 V side) is pulled to almost the same low through it. The 5 V side pull-up current flows through the channel into the driver, so the low level is some tens of millivolts higher than on the 3.3 V side alone, still far below VIL.',
      ),
    }
  }
  // 5 V 侧拉低
  const phaseDiode = sel.phase !== 'channel'
  const r = pullBoth(V_HV, V_LV)
  // 体二极管阶段：两侧上拉电流都经驱动流到地，3.3 V 侧节点比漏极高一个二极管压降
  const drainLow = (RDRV * (V_HV + V_LV - VF_BODY)) / RPU / (1 + (2 * RDRV) / RPU)
  if (gateFloat) {
    return {
      hot: ['puH', 'hv', 'dio', 'lv', 'puL', 'drH'],
      tags: { vl: fmtVolt(drainLow + VF_BODY), vh: fmtVolt(drainLow), vgs: '?' },
      reads: [
        { label: loc('3.3 V 侧', '3.3 V side'), value: fmtVolt(drainLow + VF_BODY), state: 'fail' },
        { label: loc('5 V 侧', '5 V side'), value: fmtVolt(drainLow) },
      ],
      tone: 'bad',
      title: loc('栅极悬空：3.3 V 侧只能被拉到约 0.6 V', 'Floating gate: the 3.3 V side only reaches about 0.6 V'),
      text: loc(
        '5 V 侧拉低后只有体二极管把源极拉到约 0.6 V；栅极没固定在 3.3 V，Vgs 不够，沟道不形成，3.3 V 侧的低电平卡在 0.6 V 附近，噪声容限只剩一点点，高速或温度高时会误判。',
        'When the 5 V side pulls low only the body diode drags the source down to about 0.6 V; with the gate not fixed at 3.3 V, Vgs is too small and no channel forms, so the 3.3 V side’s low level is stuck near 0.6 V, leaving almost no noise margin and misreading at high speed or temperature.',
      ),
    }
  }
  if (phaseDiode) {
    const vl = drainLow + VF_BODY
    return {
      hot: ['puH', 'hv', 'dio', 'lv', 'puL', 'drH'],
      tags: { vl: fmtVolt(vl), vh: fmtVolt(drainLow), vgs: fmtVolt(V_LV - vl) },
      reads: [
        { label: loc('3.3 V 侧（体二极管）', '3.3 V side (body diode)'), value: fmtVolt(vl) },
        { label: loc('5 V 侧', '5 V side'), value: fmtVolt(drainLow), state: 'pass' },
        { label: loc('Vgs', 'Vgs'), value: fmtVolt(V_LV - vl) },
      ],
      tone: 'ok',
      title: loc('5 V 侧拉低（第一步）：体二极管先导通', '5 V side pulls low (step 1): the body diode conducts first'),
      text: loc(
        '5 V 侧的驱动把漏极拉低，源极此时还在 3.3 V，体二极管的阳极（源极）比阴极（漏极）高，正向导通，把源极拉到约漏极电压 + 0.6 V。管子本身这时还没有沟道，但 Vgs = 3.3 − 0.6 ≈ 2.7 V 已经超过 Vth（约 1.3 V），沟道马上就会形成。',
        'The 5 V side driver pulls the drain low while the source is still at 3.3 V, so the body diode’s anode (source) is above its cathode (drain) and it conducts, dragging the source to about the drain voltage + 0.6 V. The transistor has no channel yet, but Vgs = 3.3 − 0.6 ≈ 2.7 V is already above Vth (about 1.3 V), so the channel forms immediately.',
      ),
    }
  }
  return {
    hot: ['puH', 'hv', 'ch', 'lv', 'puL', 'drH'],
    tags: { vl: fmtVolt(r.other), vh: fmtVolt(r.own), vgs: fmtVolt(V_LV - r.other) },
    reads: [
      { label: loc('3.3 V 侧', '3.3 V side'), value: fmtVolt(r.other), state: 'pass' },
      { label: loc('5 V 侧', '5 V side'), value: fmtVolt(r.own), state: 'pass' },
      { label: loc('Vgs', 'Vgs'), value: fmtVolt(V_LV - r.other) },
    ],
    tone: 'ok',
    title: loc('5 V 侧拉低（第二步）：沟道导通，3.3 V 侧降到接近 0', '5 V side pulls low (step 2): channel on, the 3.3 V side drops to near 0'),
    text: loc(
      '源极一被拉低，Vgs 就继续增大，沟道导通，把 3.3 V 侧也拉到和漏极几乎相同的低电平，体二极管不再负责。所以这个电路在两个方向上都能传低电平：低电平从哪边来，都能传过去；高电平由各自的上拉电阻产生，不需要传输。',
      'Once the source is pulled down Vgs grows further and the channel conducts, pulling the 3.3 V side to nearly the same low level as the drain; the body diode no longer carries the load. The circuit therefore passes a low in both directions, whichever side it starts on; highs are made by each side’s own pull-up and need no transfer.',
    ),
  }
}

export const I2C_CIRCUIT: CircuitDef = {
  id: 'i2c',
  label: loc('I2C 双向电平转换', 'I2C bidirectional level shifter'),
  short: loc('单管电平转换', 'Single-transistor shifter'),
  func: loc(
    'MCU 是 3.3 V、传感器是 5 V 时，让 SDA、SCL 双向通信，不会烧坏低压一侧。每条线只用一颗 NMOS 加两个上拉电阻。',
    'When the MCU runs at 3.3 V and the sensor at 5 V, let SDA and SCL communicate in both directions without damaging the low-voltage side. Each line needs only one NMOS and two pull-up resistors.',
  ),
  principle: loc(
    'NMOS（BSS138 之类）栅极接 3.3 V，源极接 3.3 V 侧，漏极接 5 V 侧，两侧各有一个上拉。三种情况：两边都高，Vgs = 0，关断，两侧各被拉到自己的电压；3.3 V 侧拉低，源极变低，Vgs = 3.3 V，沟道导通，把 5 V 侧也拉低；5 V 侧拉低，漏极变低，体二极管（阳极源极、阴极漏极）先导通把源极拉到约 0.6 V，Vgs 增大后沟道导通，把 3.3 V 侧拉到接近 0。',
    'The NMOS (a BSS138 type) has its gate at 3.3 V, its source on the 3.3 V side and its drain on the 5 V side, with a pull-up on each side. Three cases: both sides high, Vgs = 0, off, each side pulled to its own voltage; the 3.3 V side pulls low, the source drops, Vgs = 3.3 V, the channel conducts and pulls the 5 V side low too; the 5 V side pulls low, the drain drops, the body diode (anode at the source, cathode at the drain) conducts first and pulls the source to about 0.6 V, then rising Vgs turns on the channel and brings the 3.3 V side close to 0.',
  ),
  params: loc(
    'Vth 要低于 3.3 V 减体二极管压降（约 2.7 V），BSS138 约 1.3 V 合适；Ron 越小低电平越接近 0；上拉电阻 2.2 kΩ ~ 10 kΩ，两侧各一个；总线电容 × 上拉电阻决定上升时间；低电平要低于接收端的 VIL。',
    'Vth must be below 3.3 V minus the body diode drop (about 2.7 V), and about 1.3 V for a BSS138 is fine; a smaller Ron brings the low closer to 0; pull-ups are 2.2 kΩ ~ 10 kΩ, one on each side; bus capacitance × pull-up sets the rise time; the low level must stay below the receiver’s VIL.',
  ),
  pitfall: loc(
    '少一侧上拉，那一侧回不到高电平；栅极悬空或没接 3.3 V，Vgs 不确定；源漏接反，体二极管方向相反，5 V 会倒灌进 3.3 V 侧；用在推挽信号（SPI、UART）上不合适，高电平靠上拉，速度跟不上。',
    'Omitting one pull-up leaves that side unable to return high; a floating gate or one not tied to 3.3 V makes Vgs undefined; swapped source and drain reverse the body diode and 5 V back-feeds into the 3.3 V side; it is unsuitable for push-pull signals (SPI, UART) because highs come from the pull-up and cannot keep up in speed.',
  ),
  row: {
    part: loc('NMOS（栅极 3.3 V）+ 两侧上拉', 'NMOS (gate at 3.3 V) + two pull-ups'),
    param: loc('Vth，Ron，上拉电阻和总线电容', 'Vth, Ron, pull-up and bus capacitance'),
    pit: loc('缺一侧上拉、源漏接反', 'A missing pull-up, swapped source and drain'),
  },
  inputs: [
    {
      id: 'who',
      label: loc('谁在拉低', 'Who pulls low'),
      options: [
        { id: 'none', label: loc('两边都高', 'Both high') },
        { id: 'lv', label: loc('3.3 V 侧拉低', '3.3 V side pulls low') },
        { id: 'hv', label: loc('5 V 侧拉低', '5 V side pulls low') },
      ],
    },
    {
      id: 'phase',
      label: loc('阶段', 'Phase'),
      options: [
        { id: 'diode', label: loc('第一步：体二极管', 'Step 1: body diode') },
        { id: 'channel', label: loc('第二步：沟道', 'Step 2: channel') },
      ],
      when: (sel) => sel.who === 'hv',
    },
  ],
  knobs: [],
  faults: [
    { id: 'none', label: loc('正常', 'Normal') },
    { id: 'noPuHV', label: loc('缺 5 V 侧上拉', 'No 5 V pull-up') },
    { id: 'noPuLV', label: loc('缺 3.3 V 侧上拉', 'No 3.3 V pull-up') },
    { id: 'gateFloat', label: loc('栅极悬空', 'Floating gate') },
  ],
  solve,
}
