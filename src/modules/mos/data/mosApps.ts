import { loc, type LText } from '../../../i18n/locale'
import { type ReadoutItem } from '../../fund/parts'

export type CircuitId = 'gpio' | 'loadSw' | 'revPol' | 'i2c' | 'openDrain' | 'hBridge' | 'softStart'
export type Tone = 'ok' | 'warn' | 'bad'
/** 每个输入的当前选项 id */
export type Sel = Record<string, string>
/** 旋钮的当前数值 */
export type Num = Record<string, number>

/** 一个电路在某组输入 + 某个故障下的结果：图上高亮哪些导线、标哪些电压、读数和结论 */
export type Outcome = {
  hot: string[]
  tags: Record<string, string>
  reads: ReadoutItem[]
  tone: Tone
  title: LText
  text: LText
}

export type InputDef = {
  id: string
  label: LText
  options: Array<{ id: string; label: LText }>
  /** 只在满足条件时显示（例如只有「高边拉低」才区分两步） */
  when?: (sel: Sel) => boolean
}

export type KnobDef = { id: string; label: LText; unit: string; min: number; max: number; step: number; init: number }
export type FaultDef = { id: string; label: LText }

export type CircuitDef = {
  id: CircuitId
  label: LText
  short: LText
  func: LText
  principle: LText
  params: LText
  pitfall: LText
  row: { part: LText; param: LText; pit: LText }
  inputs: InputDef[]
  knobs: KnobDef[]
  faults: FaultDef[]
  solve: (sel: Sel, num: Num, fault: string) => Outcome
}

/** 默认选项：每个输入的第一项 */
export const defaultSel = (def: CircuitDef): Sel => Object.fromEntries(def.inputs.map((i) => [i.id, i.options[0].id]))
export const defaultNum = (def: CircuitDef): Num => Object.fromEntries(def.knobs.map((k) => [k.id, k.init]))

export function fmtA(i: number) {
  const a = Math.abs(i)
  if (a >= 1) {
    return `${i.toFixed(2)} A`
  }
  if (a >= 1e-3) {
    return `${(i * 1e3).toFixed(a >= 0.1 ? 0 : 1)} mA`
  }
  if (a >= 1e-6) {
    return `${(i * 1e6).toFixed(1)} µA`
  }
  return `${(i * 1e9).toFixed(1)} nA`
}

export function fmtW(p: number) {
  if (p >= 1) {
    return `${p.toFixed(2)} W`
  }
  if (p >= 1e-3) {
    return `${(p * 1e3).toFixed(1)} mW`
  }
  return `${(p * 1e6).toFixed(1)} µW`
}

export function fmtT(sec: number) {
  if (sec >= 1) {
    return `${sec.toFixed(2)} s`
  }
  if (sec >= 1e-3) {
    return `${(sec * 1e3).toFixed(1)} ms`
  }
  if (sec >= 1e-6) {
    return `${(sec * 1e6).toFixed(1)} µs`
  }
  return `${(sec * 1e9).toFixed(0)} ns`
}

export const fmtVolt = (v: number) => `${v.toFixed(2)} V`

export const S = {
  kickerCircuit: loc('典型电路', 'Typical circuit'),
  kickerResult: loc('当前结果', 'Current result'),
  introTitle: loc('从符号到板子：七个常见电路', 'From symbol to board: seven common circuits'),
  pickTitle: loc('先选一个电路', 'Pick a circuit'),
  pickNote: loc('每个电路都按「功能 → 原理 → 关键参数 → 常见坑」讲。', 'Each circuit is explained as function → principle → key parameters → common pitfalls.'),
  fFunc: loc('功能', 'Function'),
  fPrinciple: loc('原理', 'Principle'),
  fParams: loc('关键参数', 'Key parameters'),
  fPitfall: loc('常见坑', 'Common pitfalls'),
  simTitle: loc('小仿真：切输入，看电流走哪条路', 'Mini simulation: toggle inputs and follow the current'),
  simNote: loc('金色粗线是当前的电流路径，蓝色线是信号。点图下面的选项切换输入；数值按示意参数现算。', 'The thick gold line is the current path and blue is the signal. Use the options below the figure to change inputs; numbers are computed from illustrative parameters.'),
  faultLabel: loc('故障注入', 'Fault injection'),
  inputLabel: loc('输入', 'Inputs'),
  caption: loc('示意图，参数为示意值，不对应具体型号。', 'Illustration; parameters are illustrative, not a specific part number.'),
  tableTitle: loc('七个电路速查', 'Seven circuits at a glance'),
  tableNote: loc('点表里的电路名可以跳回上面的小仿真。', 'Click a circuit name to jump back to its simulation above.'),
  thCircuit: loc('电路', 'Circuit'),
  thPart: loc('核心器件', 'Core part'),
  thParam: loc('关键参数', 'Key parameter'),
  thPit: loc('最常见的坑', 'Most common pitfall'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('这些电路用到的开关原理见 {@mosSwitch}；体二极管、栅极 ESD 等非理想因素见 {@mosReal}；怎么挑一颗合适的管子见「读数据手册与选型」。', 'The switching principles behind these circuits are in {@mosSwitch}; body diode, gate ESD and other non-idealities are in {@mosReal}; choosing a suitable part is in the datasheet and selection lesson.'),
  next: loc('下一课：非理想特性与可靠性', 'Next: Non-ideal behaviour and reliability'),
}

export const INTRO: LText[] = [
  loc(
    '前面几课讲的是管子本身，这一课把它放到板子上：一颗 NMOS 或 PMOS，加几个电阻、一颗二极管，就能做成驱动、保护、电平转换和电机控制。七个电路里的管子都在做同一件事：用栅极电压决定源漏之间通还是不通，区别只在放在哪一边、周围配了什么元件。',
    'The earlier lessons covered the transistor itself; this one puts it on a board: one NMOS or PMOS plus a few resistors and a diode makes drivers, protection, level shifters and motor control. In all seven circuits the transistor does the same job, letting gate voltage decide whether source and drain connect; what differs is which side it sits on and what surrounds it.',
  ),
  loc(
    '低边、高边的区别见 {@mosSwitch}；符号和二极管见 {@pParts}。这些电路在测试里也天天遇到：负载板上用继电器切换信号通路（{@connection}），被测芯片的开漏输出要靠上拉电阻才能测出 VOH（{@dc}），负载板自检里要检查这些驱动和上拉有没有焊对（{@fProgram}）。',
    'Low-side versus high-side is covered in {@mosSwitch}; symbols and diodes in {@pParts}. These circuits show up in test every day: load boards switch signal paths with relays ({@connection}), a DUT’s open-drain output needs a pull-up before VOH can be measured ({@dc}), and load-board self-checks verify that these drivers and pull-ups are fitted correctly ({@fProgram}).',
  ),
]

export const TAKEAWAY: LText[] = [
  loc('低边开关用 NMOS，栅极串小电阻、对地加下拉；感性负载（继电器、蜂鸣器、电机）必须并续流二极管，否则关断瞬间 L·di/dt 会击穿管子。', 'Use an NMOS for a low-side switch with a small gate resistor and a pull-down to ground; inductive loads (relays, buzzers, motors) need a flyback diode, or L·di/dt at turn-off breaks down the transistor.'),
  loc('高边开关用 PMOS：栅极拉到源极电平就关断，拉低才导通；MCU 电平不够时，加一个 NMOS 做电平移位。', 'Use a PMOS for a high-side switch: pull the gate to the source level to turn it off and pull it low to turn it on; when the MCU level is too low, add an NMOS as a level shifter.'),
  loc('PMOS 防反接：漏极接电池正、源极接负载、栅极经电阻接地；先靠体二极管通电，再靠沟道把压降降到毫伏级。方向装反，体二极管就变成了通路。', 'PMOS reverse-polarity protection: drain to battery plus, source to load, gate to ground through a resistor; the body diode conducts first, then the channel brings the drop down to millivolts. Mounted backwards, the body diode becomes a conducting path.'),
  loc('单管 I2C 电平转换靠 Vgs = 3.3 V 和体二极管工作，两侧各需要一个上拉；开漏线靠上拉才能变高，上升时间 ≈ 2.2·R·C。', 'The single-transistor I2C level shifter works through Vgs = 3.3 V and the body diode and needs one pull-up on each side; an open-drain line only goes high through its pull-up, with rise time ≈ 2.2·R·C.'),
  loc('H 桥同一桥臂的上下管不能同时导通（直通）；软启动靠栅极 RC 放慢 Vgs 上升，把涌入电流限制在 C·dV/dt。', 'Never turn on the high and low transistors of one H-bridge leg together (shoot-through); soft start uses a gate RC to slow the rise of Vgs and limit inrush to C·dV/dt.'),
]
