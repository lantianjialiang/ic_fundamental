import { loc, type LText } from '../../../i18n/locale'

export type EsdId = 'power' | 'logic12' | 'logic8'

/** 钳位开始导通的电压 = 绝对最大值 × 该系数（示意） */
export const CLAMP_FACTOR = 1.25

export const ESD_PARTS: Array<{ id: EsdId; abs: number; label: LText; title: LText; text: LText }> = [
  {
    id: 'power',
    abs: 20,
    label: loc('功率 MOSFET（典型 ±20 V）', 'Power MOSFET (typical ±20 V)'),
    title: loc('功率 MOSFET：典型 ±20 V', 'Power MOSFET: typically ±20 V'),
    text: loc(
      '常见的 10 V 驱动功率管，栅源绝对最大值典型为 ±20 V。10 V 驱动离它还有一半余量；驱动电源直接用 12 V 或 15 V 也行，但接 24 V 就越界了。这是典型值，具体以数据手册为准。',
      'Common 10 V-drive power MOSFETs typically have a gate-source absolute maximum of ±20 V. A 10 V drive leaves half the margin; 12 V or 15 V drive is also fine, but 24 V goes beyond it. This is a typical value; follow the datasheet.',
    ),
  },
  {
    id: 'logic12',
    abs: 12,
    label: loc('逻辑电平小管（典型 ±12 V）', 'Logic-level small part (typical ±12 V)'),
    title: loc('逻辑电平小管：典型 ±12 V', 'Logic-level small part: typically ±12 V'),
    text: loc(
      '用 3.3 V / 5 V 直接驱动的小信号逻辑电平管，栅氧更薄，绝对最大值常见 ±12 V。如果拿 12 V 电源去驱动，等于贴着上限。这是典型值，具体以数据手册为准。',
      'Small-signal logic-level parts driven straight from 3.3 V / 5 V have thinner oxide and an absolute maximum commonly of ±12 V. Driving one from a 12 V rail sits right at the limit. This is a typical value; follow the datasheet.',
    ),
  },
  {
    id: 'logic8',
    abs: 8,
    label: loc('超低 Vth 小管（典型 ±8 V）', 'Ultra-low-Vth small part (typical ±8 V)'),
    title: loc('超低 Vth 小管：典型 ±8 V', 'Ultra-low-Vth small part: typically ±8 V'),
    text: loc(
      '为 1.8 V、2.5 V 甚至更低电压驱动设计的小管，栅氧最薄，绝对最大值常见只有 ±8 V，5 V 的信号还行，12 V 的电源就会击穿。这是典型值，具体以数据手册为准。',
      'Small parts designed for 1.8 V, 2.5 V or lower drive have the thinnest oxide and an absolute maximum commonly of only ±8 V: a 5 V signal is fine, but a 12 V rail would break them down. This is a typical value; follow the datasheet.',
    ),
  },
]

export type EsdState = 'safe' | 'over' | 'clamp'

export const ESD_STATES: Record<EsdState, { short: LText; title: LText; text: LText; tone: 'ok' | 'warn' | 'bad' }> = {
  safe: {
    short: loc('在绝对最大值内', 'Within the maximum'),
    title: loc('在绝对最大值以内：氧化层安全', 'Within the absolute maximum: the oxide is safe'),
    text: loc(
      '栅氧上的电场低于长期可靠的上限，钳位器件不导通。数据手册上的 Vgs(th) 和 Rds(on) 测试条件都在这个范围内。',
      'The field across the oxide is below the long-term reliability limit and the clamp is off. The Vgs(th) and Rds(on) conditions in the datasheet all lie inside this range.',
    ),
    tone: 'ok',
  },
  over: {
    short: loc('超限，未钳位', 'Over limit, not clamped'),
    title: loc('超过绝对最大值：钳位还没动，氧化层在受伤', 'Over the absolute maximum: the clamp is not on yet, the oxide is being hurt'),
    text: loc(
      '栅氧上的电场超出长期可靠的上限，薄氧在高场下会积累缺陷，寿命缩短，严重时直接击穿；而钳位器件要到更高的电压才开始导通，保护不到这一段。绝对最大值是「不要超过」，不是「超过就会钳住」。',
      'The field across the oxide exceeds the long-term reliability limit; thin oxide accumulates defects under high field, shortening life and in the worst case breaking down at once, while the clamp only starts at a higher voltage and does not protect this band. The absolute maximum means do not exceed it, not that exceeding it gets clamped.',
    ),
    tone: 'warn',
  },
  clamp: {
    short: loc('钳位导通', 'Clamp conducting'),
    title: loc('钳位导通：只能扛一次短脉冲', 'Clamp conducting: it can survive only a short pulse'),
    text: loc(
      '稳压管或 ESD 二极管已经击穿导通，把静电脉冲泄放掉，所以栅氧电压被限制住。但钳位器件很小，只能扛纳秒到微秒的静电脉冲；如果是电源持续供电，电流大、发热快，钳位器件和串联电阻会被烧毁，之后栅极就没有保护了。',
      'The Zener or ESD diode has broken down and is draining the static pulse, so the oxide voltage is limited. But the clamp is tiny and can handle only nanosecond-to-microsecond static pulses; if a supply keeps driving it, the current is large and heating fast, and the clamp and series resistor burn out, leaving the gate unprotected afterwards.',
    ),
    tone: 'bad',
  },
}

export const ESD_LABEL = {
  part: loc('器件类型', 'Device type'),
  knob: loc('施加的 Vgs', 'Applied Vgs'),
  abs: loc('Vgs 绝对最大值（典型）', 'Vgs absolute max (typical)'),
  state: loc('状态', 'State'),
  stress: loc('相对绝对最大值', 'Versus absolute max'),
  discrete: loc('分立功率管', 'Discrete power MOSFET'),
  pin: loc('芯片引脚', 'IC pin'),
  zener: loc('背靠背稳压管', 'Back-to-back Zener'),
  d1: loc('D1 到 VDD', 'D1 to VDD'),
  d2: loc('D2 到 GND', 'D2 to GND'),
  rGate: loc('串联电阻', 'Series R'),
  oxide: loc('栅氧', 'Gate oxide'),
  gate: loc('栅极 G', 'Gate G'),
  safeZone: loc('安全', 'Safe'),
  overZone: loc('超限', 'Over'),
  clampZone: loc('钳位', 'Clamp'),
  cap: loc(
    '示意图：左边是分立功率管的栅源钳位，右边是芯片引脚的两只 ESD 二极管。钳位开始导通的电压取绝对最大值的 1.25 倍，只是示意；各器件的数值以数据手册为准。',
    'Illustration: left, the gate-source clamp of a discrete power MOSFET; right, the two ESD diodes on an IC pin. The clamp starts at 1.25 times the absolute maximum, for illustration only; follow each datasheet for real values.',
  ),
}

export const ESD_TEXT: LText[] = [
  loc(
    '栅氧只有几纳米到上百纳米（电压越低的器件越薄），击穿场强在 10 MV/cm 量级，击穿电压从几伏到几十伏不等。栅极又是一个没有泄放通路的电容：人手一摸带的几千伏静电，电荷全堆在这个极小的电容上，电压瞬间冲破氧化层，形成针孔。数据手册给的 Vgs 绝对最大值比击穿电压低得多，是为了留出长期可靠性的余量。',
    'Gate oxide is only a few nanometres to a hundred or so thick (thinner for lower-voltage parts), with a breakdown field of the order of 10 MV/cm, so breakdown voltage ranges from a few volts to a few tens of volts. The gate is also a capacitor with no discharge path: the few thousand volts of static from a touch put all their charge on that tiny capacitance, and the voltage punches through the oxide and leaves a pinhole. The Vgs absolute maximum in the datasheet is well below breakdown to leave margin for long-term reliability.',
  ),
  loc(
    '三种防护：一，芯片引脚上有 ESD 二极管，D1 阳极接信号、阴极接 VDD，D2 阳极接 GND、阴极接信号，再串一个电阻。输入高过 VDD 约 0.7 V，D1 导通；低过地约 0.7 V，D2 导通，过冲被泄放。开短路测试正是利用这两只二极管（见 {@fOpens}）。二，有些分立功率管在栅源之间内置背靠背稳压管，没有的要在板上自己加。三，操作时防静电腕带，板上栅极串联电阻并加下拉电阻，不让栅极悬空（见 {@mosApps}）。',
    'Three kinds of protection. One: IC pins carry ESD diodes, D1 with anode on the signal and cathode on VDD, D2 with anode on GND and cathode on the signal, plus a series resistor. An input about 0.7 V above VDD turns D1 on; about 0.7 V below ground turns D2 on, and the overshoot is drained. The opens / shorts test uses exactly these two diodes (see {@fOpens}). Two: some discrete power MOSFETs have a back-to-back Zener between gate and source built in, and those without need one added on the board. Three: wear a wrist strap when handling, and put a series gate resistor and a pull-down on the board so the gate never floats (see {@mosApps}).',
  ),
]

export const LATCH_STEPS: Array<{ id: string; title: LText; text: LText }> = [
  {
    id: 'trigger',
    title: loc('触发：有电流被注入阱或衬底', 'Trigger: current is injected into the well or substrate'),
    text: loc(
      '平时 n 阱接 VDD、p 衬底接 GND，两个寄生三极管都关着。如果输入脚冲过 VDD、冲到地以下，或者受到电源尖峰、辐射，就会有电流被注入 n 阱或衬底。这股电流流过阱电阻 Rwell 或衬底电阻 Rsub，在电阻上产生压降，这是触发的起点。',
      'Normally the n-well is at VDD and the p-substrate at GND, so both parasitic transistors are off. If an input pin overshoots above VDD or below ground, or a supply glitch or radiation hits, current is injected into the n-well or substrate. That current flows through the well resistance Rwell or substrate resistance Rsub and creates a voltage drop across it; this is where the trigger starts.',
    ),
  },
  {
    id: 'pnp',
    title: loc('PNP 导通：Q1 先开', 'PNP turns on: Q1 goes first'),
    text: loc(
      '寄生 PNP（Q1）的发射极是 PMOS 的 p+ 源（接 VDD），基极是 n 阱，集电极是 p 衬底。注入电流在 Rwell 上的压降超过约 0.6 V，发射结（p+ 源 对 n 阱）正偏，Q1 导通：空穴从 VDD 经 p+ 源注入 n 阱，大部分穿过阱到达 p 衬底，成为 Q1 的集电极电流。',
      'The parasitic PNP (Q1) has the PMOS p+ source (at VDD) as emitter, the n-well as base and the p-substrate as collector. When the injected current makes Rwell drop more than about 0.6 V, the emitter junction (p+ source to n-well) is forward biased and Q1 turns on: holes go from VDD through the p+ source into the n-well, and most cross the well into the p-substrate as Q1’s collector current.',
    ),
  },
  {
    id: 'npn',
    title: loc('NPN 导通：Q2 跟着开', 'NPN turns on: Q2 follows'),
    text: loc(
      '寄生 NPN（Q2）的发射极是 NMOS 的 n+ 源（接 GND），基极是 p 衬底，集电极是 n 阱。Q1 的集电极电流流进 p 衬底，经过 Rsub 流向衬底接触，在 Rsub 上产生压降，超过约 0.6 V 后 Q2 的发射结（n+ 源 对 p 衬底）正偏：电子从 n+ 源注入衬底，穿过衬底到达 n 阱。',
      'The parasitic NPN (Q2) has the NMOS n+ source (at GND) as emitter, the p-substrate as base and the n-well as collector. Q1’s collector current flows into the p-substrate and through Rsub to the substrate tap, creating a drop across Rsub; once it exceeds about 0.6 V, Q2’s emitter junction (n+ source to p-substrate) is forward biased: electrons go from the n+ source into the substrate and cross it to the n-well.',
    ),
  },
  {
    id: 'regen',
    title: loc('再生：两个三极管互相喂基极电流', 'Regeneration: each transistor feeds the other’s base'),
    text: loc(
      'Q2 的集电极电流流过 Rwell，使 Q1 的基极电位更低、导通更强；Q1 的集电极电流流过 Rsub，使 Q2 导通更强。两个管子互相给对方提供基极电流，只要电流增益乘积 β1 × β2 > 1，这个正反馈环路就自己越转越强。这时触发源即使撤掉，也停不下来，所以图里的触发箭头消失了。',
      'Q2’s collector current flows through Rwell and pulls Q1’s base lower, turning it on harder; Q1’s collector current flows through Rsub and turns Q2 on harder. Each transistor supplies the other’s base current, so as long as the current-gain product β1 × β2 > 1 this positive-feedback loop strengthens itself. Even if the trigger is removed it will not stop, which is why the trigger arrow has disappeared in the figure.',
    ),
  },
  {
    id: 'large',
    title: loc('大电流：VDD 到 GND 被短路', 'Large current: VDD is shorted to GND'),
    text: loc(
      'VDD 到 GND 之间形成低阻通路，等于一个导通的可控硅（SCR），电流只受电源和寄生电阻限制，可达几百 mA 到几 A，芯片发热、金属线或键合线熔断。再去关输入信号没有用，只能把电源断掉再上电。所以测试和设计都要防它：{@latch} 讲现象，{@fLatch} 讲怎么测；设计上靠保护环、多打阱接触、缩短触点到晶体管的距离来降低 Rwell 和 Rsub。',
      'A low-resistance path forms from VDD to GND, equivalent to a conducting SCR; the current is limited only by the supply and parasitic resistance, from hundreds of mA to several A, heating the chip and fusing metal or bond wires. Removing the input does nothing; only cutting power and re-applying it clears it. So both design and test guard against it: {@latch} covers the phenomenon, {@fLatch} covers how to test it, and design lowers Rwell and Rsub with guard rings, more well taps and short tap-to-transistor distances.',
    ),
  },
]

export const LATCH_LABEL = {
  n: loc('n 阱', 'n-well'),
  sub: loc('p 衬底', 'p-substrate'),
  trigger: loc('触发注入', 'Trigger'),
  q1: loc('Q1 PNP', 'Q1 PNP'),
  q2: loc('Q2 NPN', 'Q2 NPN'),
  on: loc('开', 'ON'),
  off: loc('关', 'OFF'),
  loop: loc('β1 × β2 > 1', 'β1 × β2 > 1'),
  path: loc('VDD 到 GND', 'VDD to GND'),
  small: loc('微小', 'tiny'),
  large: loc('大电流', 'large'),
  holdOn: loc('自持', 'self-held'),
  legendQ1: loc('Q1 电流', 'Q1 current'),
  legendQ2: loc('Q2 电流', 'Q2 current'),
  cap: loc(
    '示意图：上半是反相器的剖面，下半是等效电路。Q1 为垂直 PNP（p+ 源、n 阱、p 衬底），Q2 为横向 NPN（n+ 源、p 衬底、n 阱），Rwell 和 Rsub 是阱和衬底的电阻。箭头是电流方向。',
    'Illustration: the top is an inverter cross-section, the bottom its equivalent circuit. Q1 is a vertical PNP (p+ source, n-well, p-substrate), Q2 a lateral NPN (n+ source, p-substrate, n-well), and Rwell and Rsub are the resistances of the well and substrate. Arrows show current direction.',
  ),
}
