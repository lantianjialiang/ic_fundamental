import { loc, type LText } from '../../../i18n/locale'
import { VDD } from '../model'
import { BOARD, CHIP_RON, passTarget, rdsOn, type PassDev, type PassInput } from './mosSwitchModel'

export const S = {
  kickerPass: loc('传输管', 'Pass transistor'),
  kickerRds: loc('导通损耗', 'Conduction loss'),
  kickerLed: loc('低边 / 高边', 'Low-side / high-side'),
  kickerNeed: loc('高边栅压', 'High-side gate drive'),
  kickerBoot: loc('抬高栅压', 'Raising the gate'),
  introTitle: loc('把 MOS 管当开关用', 'Using a MOSFET as a switch'),
  passTitle: loc('NMOS 传好 0、传差 1；PMOS 反过来', 'NMOS passes a good 0 and a weak 1; PMOS the opposite'),
  passNote: loc(
    '选管子和输入电平，输出接一个负载电容，看输出怎么爬（或落）。曲线用共用的 MOS 模型积分算出，忽略体效应。',
    'Pick the device and the input level; the output drives a load capacitor. The curve is integrated from the shared MOS model, ignoring the body effect.',
  ),
  rdsTitle: loc('导通电阻 Rds(on) 与导通损耗', 'On-resistance Rds(on) and conduction loss'),
  rdsNote: loc(
    '拖电流和 Vgs：Rds(on) = 1 / (k·(Vgs − Vth))，损耗 P = I²·Rds(on)。板级示意管，不对应具体型号。',
    'Drag the current and Vgs: Rds(on) = 1 / (k·(Vgs − Vth)), loss P = I²·Rds(on). An illustrative board-level part, not a real model.',
  ),
  ledTitle: loc('低边开关与高边开关：点开关控制 LED', 'Low-side and high-side switches: click the switch to drive an LED'),
  ledNote: loc(
    '点左边的 GPIO 开关（或下面的按钮），让 GPIO 在高、低之间切换，对比三种接法的栅极电平、Vgs、电流路径和 LED。',
    'Click the GPIO switch on the left (or the buttons below) to toggle the GPIO between high and low, and compare the gate level, Vgs, current path and LED of the three wirings.',
  ),
  needTitle: loc('NMOS 高边为什么要更高的栅压', 'Why an NMOS high-side switch needs a higher gate voltage'),
  needNote: loc(
    '拖负载电压，看栅极至少要多高。绿 = 够，红 = 不够。',
    'Drag the load voltage and see how high the gate must be. Green = enough, red = not enough.',
  ),
  bootTitle: loc('自举、电荷泵、PMOS：三种办法', 'Bootstrap, charge pump, PMOS: three ways out'),
  bootNote: loc(
    '切换半桥的两个阶段，看自举电容怎么把栅压抬到母线之上；下面的卡片比较三种办法。',
    'Switch between the two half-bridge phases to see how the bootstrap capacitor lifts the gate above the bus; the cards below compare the three approaches.',
  ),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    'NMOS 和 PMOS 配对成反相器见下一课；用传输门解决传差 1，见「由 MOS 管搭逻辑门」；板级驱动电路和防反接见「典型应用电路」；Rds(on) 随温度变化见「非理想特性」。',
    'Pairing NMOS and PMOS into an inverter is the next lesson; fixing the weak 1 with a transmission gate is in Logic Gates from MOSFETs; board-level drivers and reverse-polarity protection are in Typical Application Circuits; Rds(on) versus temperature is in Non-ideal Behaviour.',
  ),
  next: loc('下一课：CMOS 反相器', 'Next: The CMOS Inverter'),
}

export const INTRO: LText[] = [
  loc(
    '前面几课把 MOS 管当成「栅压控制的开关」。这一课认真用它：开关传信号时，NMOS 和 PMOS 各擅长传哪个电平；开关接电源时，导通电阻怎么变成发热；开关放在负载上面还是下面，驱动方式完全不同。',
    'Earlier lessons treated the MOSFET as a switch controlled by gate voltage. This lesson uses it seriously: which level NMOS and PMOS each pass well when they switch a signal; how on-resistance turns into heat when they switch power; and why a switch above the load needs a completely different drive than one below it.',
  ),
  loc(
    '先要熟悉沟道和阈值（{@mosChannel}）以及区域判断（{@mosRegion}）。后面接 {@mosInverter}（把 NMOS 和 PMOS 配成对）、{@mosApps}（板级应用）和 {@mosSelect}（选型）；LED 和 GPIO 的电平、电流在测试里怎么量，见 {@dc}。',
    'You should know the channel and threshold ({@mosChannel}) and region checks ({@mosRegion}). It leads into {@mosInverter} (pairing NMOS with PMOS), {@mosApps} (board-level circuits) and {@mosSelect} (selection); how LED and GPIO levels and currents are measured in test is in {@dc}.',
  ),
]

export const PASS_DEVS: Array<{ id: PassDev; label: LText }> = [
  { id: 'n', label: loc('NMOS（栅极接 VDD）', 'NMOS (gate at VDD)') },
  { id: 'p', label: loc('PMOS（栅极接地）', 'PMOS (gate at ground)') },
]

export const PASS_INPUTS: Array<{ id: PassInput; label: LText }> = [
  { id: 'high', label: loc('输入 1（VDD）', 'Input 1 (VDD)') },
  { id: 'low', label: loc('输入 0（0 V）', 'Input 0 (0 V)') },
]

export const PASS_LABEL = {
  cKnob: loc('负载电容 C', 'Load capacitance C'),
  input: loc('输入电平', 'Input level'),
  out: loc('输出最终电平', 'Final output'),
  loss: loc('比输入差多少', 'Shortfall vs input'),
  vgs: loc('传完后的 |Vgs|', '|Vgs| when done'),
  settle: loc('到位时间（±50 mV）', 'Settling time (±50 mV)'),
  good: loc('传好', 'good'),
  weak: loc('传差', 'weak'),
  vout: loc('输出 Vout (V)', 'Output Vout (V)'),
  time: loc('时间 (ns)', 'Time (ns)'),
  vin: loc('输入', 'Input'),
  cap: loc(
    '示意：输出接电容 C 到地，先放到与输入相反的电平，再开关导通。虚线是输入电平，点线是理论终点。传输管是对称的，电位较低的一端对 NMOS 是源极，较高的一端对 PMOS 是源极。',
    'Illustration: the output has a capacitor C to ground, starts at the opposite level, then the switch conducts. The dashed line is the input level, the dotted line the theoretical end point. A pass transistor is symmetric: the lower-potential end is the NMOS source, the higher-potential end is the PMOS source.',
  ),
  gateVdd: loc('栅极 = VDD', 'Gate = VDD'),
  gateGnd: loc('栅极 = 0 V', 'Gate = 0 V'),
  outNode: loc('输出', 'Out'),
  settled: loc('到位', 'Settled'),
}

const f2 = (x: number) => x.toFixed(2)

type PassCase = { title: LText; text: LText; detail: LText; tone?: 'ok' | 'warn' }

/** 四种组合的说明：每条结论都带原因，数字由模型常数算出 */
export function passCase(dev: PassDev, input: PassInput): PassCase {
  const end = f2(passTarget(dev, input))
  const rc = f2(CHIP_RON)
  if (dev === 'n' && input === 'high') {
    const text = loc(
      `栅极接 VDD。输出端是 NMOS 的源极，输出越高，Vgs = VDD − Vout 越小。输出升到 VDD − Vth = ${end} V 时 Vgs 只剩 Vth，沟道消失、电流为 0，所以输出停在这里，到不了 ${f2(VDD)} V。`,
      `The gate is at VDD. The output is the NMOS source, so the higher it rises the smaller Vgs = VDD − Vout becomes. At VDD − Vth = ${end} V, Vgs is down to Vth, the channel vanishes and the current is 0, so the output stops there and never reaches ${f2(VDD)} V.`,
    )
    return {
      title: loc('NMOS 传 1：传差，停在 VDD − Vth', 'NMOS passing a 1: weak, stops at VDD − Vth'),
      text,
      tone: 'warn',
      detail: loc(
        `${text.zh}越接近终点，过驱动越小，电流按 Vov² 缩小，所以末段爬得很慢。这里忽略体效应；真实电路里源极抬高会让 Vth 变大，停得比这个值更低。要把 1 完整传过去，就并联一个 PMOS，见 {@mosGates} 的传输门。`,
        `${text.en} The closer it gets, the smaller the overdrive and the current (which scales with Vov²), so the last stretch is very slow. The body effect is ignored here; in a real circuit a raised source increases Vth, so it stops even lower. To pass a full 1, add a PMOS in parallel: the transmission gate in {@mosGates}.`,
      ),
    }
  }
  if (dev === 'n') {
    const text = loc(
      `输入端是 0 V，它就是 NMOS 的源极，栅极接 VDD，所以 Vgs = ${f2(VDD)} V 全程不变，沟道一直强导通。输出像 RC 放电一样落到 0 V，时间常数 τ = Rds(on)·C，这里片上示意管 Rds(on) ≈ ${rc} Ω。`,
      `The input at 0 V is the NMOS source and the gate is at VDD, so Vgs = ${f2(VDD)} V throughout and the channel stays strongly on. The output falls to 0 V like an RC discharge with τ = Rds(on)·C; here the on-chip teaching device has Rds(on) ≈ ${rc} Ω.`,
    )
    return {
      title: loc('NMOS 传 0：传好，落到 0 V', 'NMOS passing a 0: good, falls to 0 V'),
      text,
      tone: 'ok',
      detail: loc(
        `${text.zh}所以 NMOS 适合把节点往下拉，下拉网络都用 NMOS。`,
        `${text.en} That is why NMOS suits pulling a node down, and pull-down networks use NMOS.`,
      ),
    }
  }
  if (input === 'high') {
    const text = loc(
      `栅极接地，输入端 VDD 是 PMOS 的源极，所以 Vsg = ${f2(VDD)} V 全程不变，沟道一直强导通，输出一路充到 VDD。`,
      `The gate is grounded and the input at VDD is the PMOS source, so Vsg = ${f2(VDD)} V throughout and the channel stays strongly on: the output charges all the way to VDD.`,
    )
    return {
      title: loc('PMOS 传 1：传好，升到 VDD', 'PMOS passing a 1: good, rises to VDD'),
      text,
      tone: 'ok',
      detail: loc(
        `${text.zh}所以 PMOS 适合把节点往上拉，上拉网络都用 PMOS。`,
        `${text.en} That is why PMOS suits pulling a node up, and pull-up networks use PMOS.`,
      ),
    }
  }
  const text = loc(
    `输出端电位较高，它是 PMOS 的源极，栅极接地，Vsg = Vout。输出落下来，Vsg 跟着变小；落到 |Vtp| = ${end} V 时沟道消失，所以输出停在这里，到不了 0 V。`,
    `The output is the higher-potential end, so it is the PMOS source, and the gate is grounded so Vsg = Vout. As the output falls Vsg shrinks too; at |Vtp| = ${end} V the channel vanishes, so the output stops there and never reaches 0 V.`,
  )
  return {
    title: loc('PMOS 传 0：传差，停在 |Vtp|', 'PMOS passing a 0: weak, stops at |Vtp|'),
    text,
    tone: 'warn',
    detail: loc(
      `${text.zh}忽略体效应。和 NMOS 传 1 完全对称：谁的源极跟着输出走，谁就传差。`,
      `${text.en} The body effect is ignored. This mirrors the NMOS passing a 1 exactly: whichever device has its source following the output passes the weak level.`,
    ),
  }
}

/* ---------- Rds(on) 计算器 ---------- */

export const RDS_LABEL = {
  idKnob: loc('负载电流 Id', 'Load current Id'),
  vgsKnob: loc('栅源电压 Vgs', 'Gate-source voltage Vgs'),
  rds: loc('Rds(on)', 'Rds(on)'),
  drop: loc('管上压降 I·Rds', 'Drop across the switch I·Rds'),
  loss: loc('导通损耗 P = I²·Rds(on)', 'Conduction loss P = I²·Rds(on)'),
  chip: loc('片上示意管 Rds(on)（VDD 驱动）', 'On-chip teaching device Rds(on) (at VDD)'),
  cutoff: loc('Vgs 不够，管子没导通', 'Vgs too low, the device is not on'),
  power: loc('损耗 P (W)', 'Loss P (W)'),
  current: loc('电流 Id (A)', 'Current Id (A)'),
  cap: loc(
    `示意参数：Vth = ${BOARD.vth} V，k = ${BOARD.k} A/V²（逻辑电平功率管，不对应具体型号）。曲线是 Vgs 取 3.3 V / 5 V / 10 V 三种驱动下的 P = I²·Rds(on)，粗线是当前 Vgs。`,
    `Illustrative values: Vth = ${BOARD.vth} V, k = ${BOARD.k} A/V² (a logic-level power MOSFET, not a real part). The curves are P = I²·Rds(on) for Vgs = 3.3 V / 5 V / 10 V; the thick one is the current Vgs.`,
  ),
}

export const RDS_VGS_CURVES = [3.3, 5, 10]

const R33 = (rdsOn(3.3) * 1000).toFixed(0)
const R10 = (rdsOn(10) * 1000).toFixed(0)

export const RDS_NOTE: LText = loc(
  `Rds(on) 不是常数：Vgs 越高，过驱动 Vov 越大，沟道越厚，电阻越小。同一颗管子 Vgs = 3.3 V 时约 ${R33} mΩ，Vgs = 10 V 时只有约 ${R10} mΩ，所以数据手册要分别给出不同 Vgs 下的值，3.3 V 驱动就看 3.3 V 那一行。损耗和电流的平方成正比：电流翻倍，发热变 4 倍。`,
  `Rds(on) is not a constant: the higher Vgs, the larger the overdrive Vov, the thicker the channel and the lower the resistance. The same part is about ${R33} mΩ at Vgs = 3.3 V and only about ${R10} mΩ at 10 V, which is why datasheets list several Vgs values; for 3.3 V drive read the 3.3 V row. Loss scales with the square of the current: double the current and the heat quadruples.`,
)

export const RDS_TEXT2 = loc(
  `上一节的片上示意管在 VDD 下 Rds(on) 约 ${f2(CHIP_RON)} Ω：它只负责传信号，不是拿来带安培级电流的。损耗变成热，温升 = P × 热阻，温度升高 Rds(on) 还会变大，见 {@mosReal}；选型时怎么留余量，见 {@mosSelect}。`,
  `The on-chip teaching device from the previous section has Rds(on) of about ${f2(CHIP_RON)} Ω at VDD: it only carries signals, not amps. The loss becomes heat, with temperature rise = P × thermal resistance, and Rds(on) grows as the part warms up ({@mosReal}); how to leave margin in selection is in {@mosSelect}.`,
)

export const TAKEAWAY: LText[] = [
  loc(
    'NMOS 传好 0、传差 1：源极跟着输出走，输出升到 VDD − Vth 时 Vgs 只剩 Vth，管子关断。PMOS 正好反过来，传好 1、传差 0，停在 |Vtp|。',
    'NMOS passes a good 0 and a weak 1: its source follows the output, and when the output reaches VDD − Vth, Vgs is down to Vth and the device shuts off. PMOS is the mirror image: good 1, weak 0, stopping at |Vtp|.',
  ),
  loc(
    'Rds(on) 随 Vgs 变化，损耗 P = I²·Rds(on)，所以大电流要选毫欧级管子并给足 Vgs，因为电流翻倍发热变 4 倍。',
    'Rds(on) depends on Vgs and the loss is P = I²·Rds(on), so large currents call for milliohm parts with full Vgs, since doubling the current quadruples the heat.',
  ),
  loc(
    '低边开关用 NMOS，源极接地，Vgs = 栅压，MCU 直接驱动；高边开关的 NMOS 源极是负载端，要 Vg > Vload + Vth，需要自举或电荷泵；PMOS 高边不需要高于电源的电压，但栅极高电平必须接近电源才关得死。',
    'A low-side switch uses an NMOS with its source at ground, so Vgs = gate voltage and the MCU can drive it directly. In a high-side NMOS the source is the load end, so Vg > Vload + Vth is needed, via a bootstrap or charge pump. A high-side PMOS needs no voltage above the supply, but its gate high level must be close to the supply to turn it off.',
  ),
]
