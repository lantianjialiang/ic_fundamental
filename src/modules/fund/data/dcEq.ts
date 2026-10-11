import { loc, type LText } from '../../../i18n/locale'
import { type Card } from '../parts'

export type EqKind = 'res' | 'diode' | 'cap' | 'defect'

/** 芯片内部的一个等效元件。col：从左到右第几列；up 接在 VDD 和引脚之间，down 接在引脚和地之间 */
export type EqPart = { kind: EqKind; col: 0 | 1 | 2; pos: 'up' | 'down'; on: boolean; name: LText; sub: LText }

export type EqItem = Card & {
  inst: 'PMU' | 'DPS'
  pin: LText
  /** 顶上那条电源轨；没有就表示被测脚本身就是电源脚 */
  top?: LText
  /** 同名的其它电源脚（经芯片内部总线连到被测脚），画在芯片上边沿 */
  twin?: LText
  /** V：强加电流、并联电压表；A：强加电压、串联电流表 */
  mode: 'V' | 'A'
  src: string
  /** 强加电流流进芯片 */
  srcIn?: boolean
  read: LText
  parts: EqPart[]
  force: LText
  measure: LText
  limit: LText
}

const dUp = (on: boolean, sub: LText): EqPart => ({ kind: 'diode', col: 0, pos: 'up', on, name: loc('D 对 VDD', 'D to VDD'), sub })
const dDown = (on: boolean, sub: LText): EqPart => ({ kind: 'diode', col: 0, pos: 'down', on, name: loc('D 对地', 'D to GND'), sub })
const REV = loc('反偏·断开', 'reverse, open')
const V_MEAS = loc('电压', 'Voltage')
const I_MEAS = loc('电流', 'Current')

export const EQ_ITEMS: EqItem[] = [
  {
    id: 'osSig',
    title: loc('开短路 · 信号脚', 'O/S · signal pin'),
    sub: loc('二极管', 'Diode'),
    text: loc(
      '芯片不上电，所有脚和 VDD 都接 0 V。输出管栅极没有电压，两只都关；能让 100 µA 通过的只剩两只保护二极管。',
      'The chip is unpowered and every pin, VDD included, is at 0 V. The output transistors have no gate voltage, so both are off; only the two protection diodes can pass 100 µA.',
    ),
    explain: [
      loc('读约 −0.65 V：电流从地经下面那只二极管流出管脚，接触良好。', 'About −0.65 V: the current flows from ground through the lower diode and out of the pin, so contact is good.'),
      loc('撞到 −3 V 钳位：电流没有通路，开路。接近 0 V：电流没走二极管，从短路点流走了，短路。', 'Hitting the −3 V clamp: the current has no path, so it is open. Near 0 V: the current bypassed the diode through a short.'),
      loc('改打 +100 µA，上面那只二极管正偏，电流经它流进 VDD 总线，再从 VDD 脚流到 0 V，读约 +0.65 V。判读细节见 {@fOpens}。', 'Force +100 µA instead and the upper diode is forward-biased: the current flows through it into the VDD bus and out of the VDD pin to 0 V, reading about +0.65 V. See {@fOpens} for how to read the results.'),
    ],
    inst: 'PMU',
    pin: loc('被测脚', 'Pin'),
    top: loc('VDD 0 V', 'VDD 0 V'),
    mode: 'V',
    src: '−100 µA',
    read: loc('≈ −0.65 V', '≈ −0.65 V'),
    parts: [
      dUp(false, loc('反偏', 'reverse')),
      dDown(true, loc('正偏·导通', 'forward, on')),
      { kind: 'res', col: 2, pos: 'up', on: false, name: loc('PMOS', 'PMOS'), sub: loc('无栅压·关', 'no gate, off') },
      { kind: 'res', col: 2, pos: 'down', on: false, name: loc('NMOS', 'NMOS'), sub: loc('无栅压·关', 'no gate, off') },
    ],
    force: loc('−100 µA（再打 +100 µA 测上面那只）', '−100 µA (then +100 µA for the upper diode)'),
    measure: loc('电压，钳位 ±3 V', 'Voltage, ±3 V clamp'),
    limit: loc('−1.5 V ~ −0.2 V 为 Pass', 'Pass between −1.5 V and −0.2 V'),
  },
  {
    id: 'osPwr',
    title: loc('开短路 · 电源脚', 'O/S · power pin'),
    sub: loc('衬底–阱 PN 结', 'Substrate–well PN junction'),
    text: loc(
      '电源脚后面没有单独的一对保护二极管，而是整张电源网。P 衬底接 VSS、N 阱接 VDD，两者之间的 PN 结（加上电源 ESD 钳位电路里的二极管）就是 VDD 脚对地的那只“二极管”。',
      'A power pin has no dedicated pair of protection diodes behind it; it has the whole supply network. The P substrate is tied to VSS and the N wells to VDD, and the PN junction between them (plus the diode in the supply ESD clamp) is the "diode" from the VDD pin to ground.',
    ),
    explain: [
      loc(
        '读约 −0.6 V 是接触良好，接近 0 V 是 VDD 对 VSS 短路，撞到钳位是这只脚开路。为什么其它 VDD 脚要悬空、为什么只打负电流、VSS 脚怎么测，见「常见问题」。',
        'About −0.6 V means good contact, near 0 V a VDD-to-VSS short, and hitting the clamp means this pin is open. For why the other VDD pins float, why only negative current is used, and how VSS pins are tested, see the FAQ.',
      ),
    ],
    inst: 'PMU',
    pin: loc('VDD 脚', 'VDD pin'),
    twin: loc('其它 VDD 脚（悬空）', 'Other VDD pins (floating)'),
    mode: 'V',
    src: '−100 µA',
    read: loc('≈ −0.6 V', '≈ −0.6 V'),
    parts: [
      { kind: 'res', col: 1, pos: 'down', on: false, name: loc('内部电路', 'Core logic'), sub: loc('未上电', 'unpowered') },
      { kind: 'diode', col: 2, pos: 'down', on: true, name: loc('PN 结', 'PN junction'), sub: loc('VSS→VDD', 'VSS→VDD') },
    ],
    force: loc('−100 µA（只打负电流），其它 VDD 脚悬空', '−100 µA (negative only), other VDD pins floating'),
    measure: loc('电压，钳位 −3 V', 'Voltage, −3 V clamp'),
    limit: loc('−1.5 V ~ −0.2 V 为 Pass', 'Pass between −1.5 V and −0.2 V'),
  },
  {
    id: 'vol',
    title: loc('VOL', 'VOL'),
    sub: loc('下拉电阻 Rn', 'Pull-down Rn'),
    text: loc(
      '芯片上电，预处理让输出为低：下拉管导通，像一只几十欧的电阻接地；上拉管关断。引脚电压在 0 V 和 VDD 之间，两只保护二极管都反偏，等于不存在。',
      'The chip is powered and preconditioned with the output low: the pull-down is on and acts like a resistor of a few tens of ohms to ground; the pull-up is off. The pin sits between 0 V and VDD, so both protection diodes are reverse-biased and effectively absent.',
    ),
    explain: [
      loc('读数 = IOL × Rn。8 mA × 40 Ω = 0.32 V，Pass；Rn 超过 50 Ω，读数就超过 0.4 V。', 'Reading = IOL × Rn. 8 mA × 40 Ω = 0.32 V, a pass; once Rn exceeds 50 Ω the reading exceeds 0.4 V.'),
      loc('如果预处理错了、输出其实是高，PMU 灌进去的电流只能经上面那只二极管流进 VDD，读到约 VDD + 0.7 V——二极管又出现了。下面的动手实验可以试。', 'If preconditioning is wrong and the output is actually high, the current the PMU pushes in can only go through the upper diode into VDD, reading about VDD + 0.7 V - the diode is back. Try it in the hands-on lab below.'),
    ],
    inst: 'PMU',
    pin: loc('输出脚', 'Output'),
    top: loc('VDD 4.75 V', 'VDD 4.75 V'),
    mode: 'V',
    src: '+8 mA',
    srcIn: true,
    read: loc('≈ 0.32 V', '≈ 0.32 V'),
    parts: [
      dUp(false, REV),
      dDown(false, REV),
      { kind: 'res', col: 2, pos: 'up', on: false, name: loc('Rp', 'Rp'), sub: loc('OFF', 'OFF') },
      { kind: 'res', col: 2, pos: 'down', on: true, name: loc('Rn ≈ 40 Ω', 'Rn ≈ 40 Ω'), sub: loc('ON', 'ON') },
    ],
    force: loc('+8 mA（灌入）', '+8 mA (sink)'),
    measure: V_MEAS,
    limit: loc('VOL ≤ 0.4 V，即 Rn ≤ 50 Ω', 'VOL ≤ 0.4 V, i.e. Rn ≤ 50 Ω'),
  },
  {
    id: 'voh',
    title: loc('VOH', 'VOH'),
    sub: loc('上拉电阻 Rp', 'Pull-up Rp'),
    text: loc(
      '预处理让输出为高：上拉管导通，像一只几百欧的电阻接 VDD；下拉管关断，保护二极管反偏。',
      'Preconditioned with the output high: the pull-up is on and acts like a resistor of a few hundred ohms to VDD; the pull-down is off and the protection diodes are reverse-biased.',
    ),
    explain: [
      loc('读数 = VDD − |IOH| × Rp。4.75 V − 5.2 mA × 350 Ω ≈ 2.93 V。VDD 取最低的 4.75 V，因为电源越低越难达标。', 'Reading = VDD − |IOH| × Rp. 4.75 V − 5.2 mA × 350 Ω ≈ 2.93 V. VDD is at its minimum, 4.75 V, because the lower the supply the harder it is to pass.'),
      loc('状态错（输出其实是低）时，PMU 往外抽电流，引脚被拉到地以下，下面那只二极管导通，读到负电压。', 'With the wrong state (output actually low), the PMU pulls current out, the pin is dragged below ground, the lower diode conducts, and the reading is negative.'),
    ],
    inst: 'PMU',
    pin: loc('输出脚', 'Output'),
    top: loc('VDD 4.75 V', 'VDD 4.75 V'),
    mode: 'V',
    src: '−5.2 mA',
    read: loc('≈ 2.93 V', '≈ 2.93 V'),
    parts: [
      dUp(false, REV),
      dDown(false, REV),
      { kind: 'res', col: 2, pos: 'up', on: true, name: loc('Rp ≈ 350 Ω', 'Rp ≈ 350 Ω'), sub: loc('ON', 'ON') },
      { kind: 'res', col: 2, pos: 'down', on: false, name: loc('Rn', 'Rn'), sub: loc('OFF', 'OFF') },
    ],
    force: loc('−5.2 mA（抽出）', '−5.2 mA (source)'),
    measure: V_MEAS,
    limit: loc('VOH ≥ 2.4 V，即 Rp ≤ 452 Ω', 'VOH ≥ 2.4 V, i.e. Rp ≤ 452 Ω'),
  },
  {
    id: 'gross',
    title: loc('Gross IDD', 'Gross IDD'),
    sub: loc('电源到地的电阻', 'Supply-to-ground R'),
    text: loc(
      '刚上电时，整颗芯片在电源看来只是一只“电源到地的电阻”。电流太大说明这只电阻太小——多半是电源对地短路，立刻停。',
      'Right after power-up the whole chip looks to the supply like a single "supply-to-ground resistor". Too much current means this resistance is too small - most likely a supply-to-ground short, so stop at once.',
    ),
    explain: [
      loc('DPS 必须设电流限：真短路时 R → 0，没有电流限，大电流会直接烧芯片和针卡。', 'The DPS must have a current limit: in a real short R → 0, and without a limit the large current burns the chip and the probe card.'),
      loc('这只等效电阻随芯片状态变（刚上电时内部节点状态不定），所以 Gross IDD 门槛放得很宽，只拦明显的短路。', 'This equivalent resistance varies with the chip state (internal nodes are undefined right after power-up), so the gross IDD limit is very loose and only catches obvious shorts.'),
    ],
    inst: 'DPS',
    pin: loc('VDD 脚', 'VDD pin'),
    mode: 'A',
    src: '5.25 V',
    read: loc('< 45 mA', '< 45 mA'),
    parts: [
      { kind: 'defect', col: 1, pos: 'down', on: false, name: loc('短路？', 'Short?'), sub: loc('R → 0', 'R → 0') },
      { kind: 'res', col: 2, pos: 'down', on: true, name: loc('R 芯片', 'R chip'), sub: loc('≥ 117 Ω', '≥ 117 Ω') },
    ],
    force: loc('5.25 V，设电流限', '5.25 V with a current limit'),
    measure: I_MEAS,
    limit: loc('< 45 mA，即 R ≥ 117 Ω', '< 45 mA, i.e. R ≥ 117 Ω'),
  },
  {
    id: 'static',
    title: loc('Static IDD', 'Static IDD'),
    sub: loc('很大的漏电电阻', 'Large leakage R'),
    text: loc(
      'CMOS 静止时，每一级的上拉和下拉串在电源和地之间，总有一只是关的，所以没有直通电流，只剩漏电，等效成一只很大的电阻。',
      'In idle CMOS, every stage has its pull-up and pull-down in series between supply and ground, and one of them is always off, so there is no through current; only leakage remains, equivalent to a very large resistor.',
    ),
    explain: [
      loc('输入必须给到真正的 0 V 或 VDD。给在中间电平，输入级上下两只管都半开，Rp + Rn 这条串联路就导通了，电流虚高。', 'Inputs must be at true 0 V or VDD. At an intermediate level, both transistors of the input stage are half on, the Rp + Rn series path conducts, and the current reads falsely high.'),
      loc('读数 = 5.25 V ÷ R。22 µA 对应 R ≈ 239 kΩ。', 'Reading = 5.25 V ÷ R. 22 µA corresponds to R ≈ 239 kΩ.'),
    ],
    inst: 'DPS',
    pin: loc('VDD 脚', 'VDD pin'),
    mode: 'A',
    src: '5.25 V',
    read: loc('几 µA', 'a few µA'),
    parts: [
      { kind: 'res', col: 1, pos: 'down', on: false, name: loc('Rp + Rn', 'Rp + Rn'), sub: loc('总有一只关', 'one is off') },
      { kind: 'res', col: 2, pos: 'down', on: true, name: loc('R 漏电', 'R leak'), sub: loc('≥ 239 kΩ', '≥ 239 kΩ') },
    ],
    force: loc('5.25 V（VDDmax）', '5.25 V (VDDmax)'),
    measure: I_MEAS,
    limit: loc('≤ 22 µA', '≤ 22 µA'),
  },
  {
    id: 'iddq',
    title: loc('IDDQ', 'IDDQ'),
    sub: loc('漏电 + 桥接电阻', 'Leakage + bridge R'),
    text: loc(
      '良品只有漏电电阻。两根线桥接时，只有当它们被驱动成相反电平，桥接处才变成一条电源到地的电阻通路。',
      'A good part has only its leakage resistance. With two wires bridged, the bridge becomes a resistive supply-to-ground path only when the two wires are driven to opposite levels.',
    ),
    explain: [
      loc('所以要停在很多不同状态量：桥接这只电阻只在某些状态“接上”。本课例子里 V3、V6 两个状态电流从 1–2 µA 跳到 165 µA 以上。', 'That is why you stop and measure in many different states: the bridge resistor is "connected" only in some of them. In this lesson\'s example the current jumps from 1–2 µA to over 165 µA in states V3 and V6.'),
      loc('功能可能完全正确：桥接电阻比驱动管大，逻辑电平没被拉翻，但电流已经暴露了它。', 'Function may be entirely correct: the bridge resistance is larger than the drivers, so the logic levels do not flip, but the current already gives it away.'),
    ],
    inst: 'DPS',
    pin: loc('VDD 脚', 'VDD pin'),
    mode: 'A',
    src: '5.25 V',
    read: loc('V3、V6 ≈ 165 µA', 'V3, V6 ≈ 165 µA'),
    parts: [
      { kind: 'defect', col: 1, pos: 'down', on: true, name: loc('R 桥接', 'R bridge'), sub: loc('某些状态通', 'some states') },
      { kind: 'res', col: 2, pos: 'down', on: true, name: loc('R 漏电', 'R leak'), sub: loc('MΩ 级', 'MΩ range') },
    ],
    force: loc('5.25 V，每个向量停点量一次', '5.25 V, once per vector stop'),
    measure: I_MEAS,
    limit: loc('每个停点 ≤ 20 µA', '≤ 20 µA at every stop'),
  },
  {
    id: 'dynamic',
    title: loc('Dynamic IDD', 'Dynamic IDD'),
    sub: loc('电容充放电', 'Capacitor charging'),
    text: loc(
      '翻转时，电流主要用来给内部节点电容充放电：I ≈ C × V × f。等效电阻 R = 1 / (C × f)，频率越高越小。',
      'While switching, the current mostly charges and discharges internal node capacitance: I ≈ C × V × f. The equivalent resistance is R = 1 / (C × f), smaller at higher frequency.',
    ),
    explain: [
      loc('所以条件是 VDDmax + fMAX：V 和 f 都取最大，电流最大。', 'Hence the condition VDDmax + fMAX: with both V and f at their maximum, the current is largest.'),
      loc('例：5.25 V ÷ 18 mA ≈ 292 Ω。漏电电阻还在，但只占 µA，可以忽略。', 'Example: 5.25 V ÷ 18 mA ≈ 292 Ω. The leakage resistor is still there, but it contributes only µA and can be ignored.'),
    ],
    inst: 'DPS',
    pin: loc('VDD 脚', 'VDD pin'),
    mode: 'A',
    src: '5.25 V',
    read: loc('≈ 18 mA', '≈ 18 mA'),
    parts: [
      { kind: 'cap', col: 1, pos: 'down', on: true, name: loc('C 内部', 'C internal'), sub: loc('每拍充放', 'every cycle') },
      { kind: 'res', col: 2, pos: 'down', on: false, name: loc('R 漏电', 'R leak'), sub: loc('只占 µA', 'only µA') },
    ],
    force: loc('5.25 V，fMAX 循环跑向量', '5.25 V, vectors looping at fMAX'),
    measure: loc('平均电流', 'Average current'),
    limit: loc('≤ 18 mA', '≤ 18 mA'),
  },
  {
    id: 'iil',
    title: loc('IIL / IIH', 'IIL / IIH'),
    sub: loc('栅电容 + 漏电', 'Gate C + leakage'),
    text: loc(
      'CMOS 输入脚接的是 MOS 管的栅极，栅极是一只电容，直流不通。能让直流流过的只有漏电，等效成接 VDD 和接地的两只大电阻。',
      'A CMOS input pin drives MOS gates, and a gate is a capacitor that blocks DC. Only leakage passes DC, modeled as two large resistors, one to VDD and one to ground.',
    ),
    explain: [
      loc('强加 0 V 时，接 VDD 那只漏电电阻上有 5.25 V，电流从芯片流出（IIL 为负）；强加 5.25 V 时，接地那只上有电压，电流流进（IIH 为正）。', 'Forcing 0 V puts 5.25 V across the leakage resistor to VDD and current flows out of the chip (IIL is negative); forcing 5.25 V puts the voltage across the one to ground and current flows in (IIH is positive).'),
      loc('电压在 0 V 和 VDD 之间，保护二极管反偏。漏电太大，说明栅氧或保护结构有缺陷。带上拉 / 下拉的输入再并上一只约 50 kΩ 的电阻，IIL 或 IIH 天然就大。', 'With the pin between 0 V and VDD the protection diodes are reverse-biased. Excess leakage points to a defect in the gate oxide or the protection structure. An input with a pull-up / pull-down adds a resistor of about 50 kΩ in parallel, so IIL or IIH is naturally large.'),
    ],
    inst: 'PMU',
    pin: loc('输入脚', 'Input'),
    top: loc('VDD 5.25 V', 'VDD 5.25 V'),
    mode: 'A',
    src: '0 / 5.25 V',
    read: loc('< 1 µA', '< 1 µA'),
    parts: [
      dUp(false, REV),
      dDown(false, REV),
      { kind: 'res', col: 1, pos: 'up', on: true, name: loc('R 漏电', 'R leak'), sub: loc('≥ 525 kΩ', '≥ 525 kΩ') },
      { kind: 'res', col: 1, pos: 'down', on: true, name: loc('R 漏电', 'R leak'), sub: loc('≥ 525 kΩ', '≥ 525 kΩ') },
      { kind: 'cap', col: 2, pos: 'down', on: false, name: loc('C 栅极', 'C gate'), sub: loc('直流不通', 'blocks DC') },
    ],
    force: loc('0 V 量 IIL，5.25 V 量 IIH', '0 V for IIL, 5.25 V for IIH'),
    measure: I_MEAS,
    limit: loc('|I| ≤ 10 µA', '|I| ≤ 10 µA'),
  },
  {
    id: 'ioz',
    title: loc('IOZ', 'IOZ'),
    sub: loc('关断的管子 + 漏电', 'Off FETs + leakage'),
    text: loc(
      '预处理让输出关断（OE 无效）：上拉、下拉两只管都关。引脚上只剩漏电电阻，和输入脚一样测。',
      'Precondition the output off (OE inactive): both pull-up and pull-down are off. Only leakage resistance remains on the pin, and it is tested just like an input.',
    ),
    explain: [
      loc('如果预处理没做对，Rp 或 Rn 还开着，PMU 一加电压就是一条几十欧的通路，电流几乎满量程——这是预处理问题，不是漏电。', 'If preconditioning is wrong and Rp or Rn is still on, the PMU sees a path of a few tens of ohms as soon as it applies voltage, and the current is near full scale - a preconditioning problem, not leakage.'),
      loc('双向脚的漏电 = 输入漏电 + 关断输出的漏电，所以有时和 IIL / IIH 合并测。', 'A bidirectional pin\'s leakage = input leakage + disabled output leakage, so it is sometimes tested together with IIL / IIH.'),
    ],
    inst: 'PMU',
    pin: loc('三态脚', 'Tri-state'),
    top: loc('VDD 5.25 V', 'VDD 5.25 V'),
    mode: 'A',
    src: '0 / 5.25 V',
    read: loc('< 1 µA', '< 1 µA'),
    parts: [
      dUp(false, REV),
      dDown(false, REV),
      { kind: 'res', col: 1, pos: 'up', on: true, name: loc('R 漏电', 'R leak'), sub: loc('MΩ 级', 'MΩ range') },
      { kind: 'res', col: 1, pos: 'down', on: true, name: loc('R 漏电', 'R leak'), sub: loc('MΩ 级', 'MΩ range') },
      { kind: 'res', col: 2, pos: 'up', on: false, name: loc('Rp', 'Rp'), sub: loc('OFF（高阻）', 'OFF (Z)') },
      { kind: 'res', col: 2, pos: 'down', on: false, name: loc('Rn', 'Rn'), sub: loc('OFF（高阻）', 'OFF (Z)') },
    ],
    force: loc('0 V 量 IOZL，5.25 V 量 IOZH', '0 V for IOZL, 5.25 V for IOZH'),
    measure: I_MEAS,
    limit: loc('|I| ≤ 10 µA', '|I| ≤ 10 µA'),
  },
  {
    id: 'vi',
    title: loc('VI 输入钳位', 'VI input clamp'),
    sub: loc('钳位二极管', 'Clamp diode'),
    text: loc(
      'TTL 输入有一只对地的钳位二极管，专门吸收负向振铃。抽 18 mA 时它正偏导通，读到的是结压降加上体电阻上的压降。',
      'A TTL input has a clamp diode to ground to absorb negative ringing. Drawing 18 mA forward-biases it, and the reading is the junction drop plus the drop across its bulk resistance.',
    ),
    explain: [
      loc('和开短路一样是二极管，但电流大了 180 倍：18 mA 时除了约 0.7 V 的结压降，体电阻上也有压降，所以极限放到 −1.5 V。', 'It is a diode just as in opens/shorts, but with 180 times the current: at 18 mA there is the junction drop of about 0.7 V plus a drop across the bulk resistance, so the limit is set at −1.5 V.'),
      loc('读数比 −1.5 V 更负，说明钳位二极管太弱或串联电阻太大，吸收不了负向振铃。CMOS 输入一般不做这一项。', 'A reading more negative than −1.5 V means the clamp diode is too weak or its series resistance too large to absorb negative ringing. CMOS inputs usually skip this test.'),
    ],
    inst: 'PMU',
    pin: loc('输入脚', 'Input'),
    top: loc('VCC 4.75 V', 'VCC 4.75 V'),
    mode: 'V',
    src: '−18 mA',
    read: loc('≈ −0.9 V', '≈ −0.9 V'),
    parts: [{ kind: 'diode', col: 1, pos: 'down', on: true, name: loc('钳位 D', 'Clamp D'), sub: loc('正偏', 'forward') }],
    force: loc('−18 mA（抽出）', '−18 mA (drawn out)'),
    measure: V_MEAS,
    limit: loc('不比 −1.5 V 更负', 'No more negative than −1.5 V'),
  },
  {
    id: 'ios',
    title: loc('IOS', 'IOS'),
    sub: loc('上拉电阻 Rp', 'Pull-up Rp'),
    text: loc(
      '输出为高时短到 0 V，整个 VDD 都压在上拉管上：I = VDD ÷ Rp。它直接量出上拉管能输出的最大电流。',
      'Shorting a high output to 0 V puts all of VDD across the pull-up: I = VDD ÷ Rp. It directly measures the maximum current the pull-up can deliver.',
    ),
    explain: [
      loc('5.25 V ÷ 85 mA ≈ 62 Ω，5.25 V ÷ 30 mA ≈ 175 Ω。电流太小说明 Rp 太大、驱动弱；太大说明真短路时会自毁。', '5.25 V ÷ 85 mA ≈ 62 Ω and 5.25 V ÷ 30 mA ≈ 175 Ω. Too little current means Rp is too large and the drive is weak; too much means the part would destroy itself in a real short.'),
      loc('这时管子已经不在线性区，等效电阻只是近似；但用 R = V / I 估驱动强弱仍然好用。避免热切换的步骤见下面的 IOS 一节。', 'The transistor is no longer in its linear region here, so the equivalent resistance is an approximation, but R = V / I is still a handy gauge of drive strength. The steps that avoid hot switching are in the IOS section below.'),
    ],
    inst: 'PMU',
    pin: loc('输出脚', 'Output'),
    top: loc('VDD 5.25 V', 'VDD 5.25 V'),
    mode: 'A',
    src: '0 V',
    read: loc('−30 ~ −85 mA', '−30 ~ −85 mA'),
    parts: [
      dUp(false, REV),
      dDown(false, REV),
      { kind: 'res', col: 2, pos: 'up', on: true, name: loc('Rp', 'Rp'), sub: loc('62–175 Ω', '62–175 Ω') },
      { kind: 'res', col: 2, pos: 'down', on: false, name: loc('Rn', 'Rn'), sub: loc('OFF', 'OFF') },
    ],
    force: loc('0 V（按无热切换的步骤）', '0 V (following the no-hot-switch steps)'),
    measure: I_MEAS,
    limit: loc('−85 ~ −30 mA', '−85 ~ −30 mA'),
  },
]
