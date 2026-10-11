import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type Card } from '../parts'

/* ---------------- 1. 寄生 SCR ---------------- */

export const SCR_LEAD: LText[] = [
  loc('CMOS 把 P 沟道和 N 沟道 MOS 做在一起，要靠 P 阱或 N 阱把两种管子隔开。阱、衬底和 MOS 的源漏叠在一起，无意中就长出了一个四层结构 PNPN——可控硅（SCR）。硅片里的结构细节见 {@latch}。', 'CMOS builds P-channel and N-channel MOS transistors together and relies on a P-well or N-well to isolate the two types. The wells, substrate, and MOS source/drain regions stack up and unintentionally form a four-layer PNPN structure: a parasitic SCR. For the structure in silicon, see {@latch}.'),
  loc('等效电路是两只横向双极管：PNP 的集电极喂 NPN 的基极，NPN 的集电极又喂 PNP 的基极。PNP 的发射极是阳极（接 VDD），NPN 的发射极是阴极（接 GND），两个基极就是两个“门”。', 'The equivalent circuit is two lateral bipolar transistors: the PNP collector feeds the NPN base, and the NPN collector feeds the PNP base. The PNP emitter is the anode (to VDD), the NPN emitter is the cathode (to GND), and the two bases are the two "gates".'),
  loc('平时两只管子都关着。一旦有电流流进衬底或阱，让其中一只导通，它的集电极电流又把另一只打开——互相喂基极，正反馈，VDD 到 GND 之间就出现一条低阻通路。这就是闩锁（Latch-up）。', 'Normally both transistors are off. Once current flows into the substrate or well and turns one on, its collector current turns the other on. Each feeds the other\'s base, positive feedback sets in, and a low-resistance path appears from VDD to GND. This is latch-up.'),
]

/* ---------------- 2. SCR 伏安特性 ---------------- */

export const VBO0 = 9
export const VBO_SLOPE = 0.35
export const VBO_MIN = 1.5
export const VON = 1.0
export const RON = 0.5
export const IH_MA = 50
export const ILIM_MA = 300

export type ScrMode = 'block' | 'on' | 'fizzle'

/** 门极电流越大，转折电压越低 */
export function vbo(igMa: number) {
  return Math.max(VBO_MIN, VBO0 - VBO_SLOPE * igMa)
}

/** 导通态电流（mA），由外部电路决定 */
export function onCurrent(vs: number, r: number, limit: boolean) {
  const i = (Math.max(0, vs - VON) / (r + RON)) * 1000
  return limit ? Math.min(i, ILIM_MA) : i
}

/** 有状态：已经闩住的保持闩住，直到电流低于 IH */
export function nextMode(prev: ScrMode, vs: number, ig: number, r: number, limit: boolean): ScrMode {
  const fire = prev === 'on' || vs >= vbo(ig)
  if (!fire) return 'block'
  return onCurrent(vs, r, limit) >= IH_MA ? 'on' : 'fizzle'
}

export const SCR_TEXT: Record<ScrMode, LText> = {
  block: loc('阻断：电压低于转折电压 VBO，SCR 只有微小的漏电流。', 'Blocking: the voltage is below the breakover voltage VBO, and the SCR passes only a tiny leakage current.'),
  on: loc('闩锁：SCR 已经导通，两端只剩约 1 V，电流完全由外部电路（电源电压、串联电阻、电源限流）决定。把门极电流拿掉也没用——只有让电流降到 IH 以下（例如掉电）才会解除。', 'Latched: the SCR is on with only about 1 V across it, and the current is set entirely by the external circuit (supply voltage, series resistance, supply current limit). Removing the gate current does nothing; only dropping the current below IH (e.g. powering down) releases it.'),
  fizzle: loc('触发了，但维持不住：外部电阻太大，导通后电流达不到维持电流 IH，SCR 自己又关断了。这就是串电阻能防止持续闩锁的原因。', 'Triggered but not sustained: the external resistance is too high, so the on-state current cannot reach the holding current IH and the SCR turns itself off again. This is why a series resistor prevents sustained latch-up.'),
}

export const SCR_NOTE = loc('试一试：VDD 放在 5 V，把门极电流慢慢加到 12 mA 左右，VBO 降到 5 V 以下就触发；再把门极电流拉回 0——还锁着。点“掉电”才解除。关掉电源限流、把串联电阻调到 1 Ω，看电流有多大。', 'Try it: set VDD to 5 V and slowly raise the gate current to about 12 mA. When VBO drops below 5 V, it fires. Pull the gate current back to 0: still latched. Only "Power down" releases it. Turn off the current limit, set the series resistance to 1 Ω, and see how large the current gets.')

/* ---------------- 3. 常见触发源 ---------------- */

export const TRIGGERS: Card[] = [
  {
    id: 'rail',
    title: loc('输入/输出超出电源轨', 'I/O beyond the supply rails'),
    sub: loc('过冲 · 欠冲', 'Overshoot · Undershoot'),
    text: loc('管脚电压高于 VDD 或低于 GND，保护二极管导通，电流直接流进阱或衬底——正好是 SCR 的门。', 'A pin above VDD or below GND turns on the protection diode, and current flows straight into the well or substrate: exactly the gate of the SCR.'),
    explain: [
      loc('测试中常见来源：测试机输入电平设得比 VDD 高、负载板走线振铃、VDD 还没上电就先给输入加电平。', 'Common sources in test: tester input levels set above VDD, ringing on load board traces, or driving inputs before VDD is powered up.'),
    ],
  },
  {
    id: 'seq',
    title: loc('多电源上电顺序错', 'Wrong power-up sequence'),
    sub: loc('VDD1 / VDD2 …', 'VDD1 / VDD2 ...'),
    text: loc('芯片有多路电源时，某一路先上，另一路还在 0 V，接口处的管脚就等于“超出电源轨”。', 'With multiple supplies, if one comes up while another is still at 0 V, pins at the interface are effectively "beyond the supply rails".'),
    explain: [loc('上电顺序要和电路设计工程师确认，程序里严格按顺序加。', 'Confirm the power-up sequence with the design engineer and follow it strictly in the program.')],
  },
  {
    id: 'ir',
    title: loc('电源轨上的 I·R 压降', 'I·R drop on the supply rails'),
    sub: loc('大输出电流', 'Large output current'),
    text: loc('很多输出同时拉大电流，芯片内部电源线和地线上有电阻，压降会让局部的 VDD/GND 偏移，局部结就可能正偏。', 'When many outputs draw large current at once, the resistance of the internal power and ground lines causes drops that shift local VDD/GND, and local junctions may become forward biased.'),
    explain: [loc('同时翻转的输出越多、负载越重，越危险。', 'The more outputs switching at once and the heavier the load, the greater the danger.')],
  },
]

export const PREVENT = loc('防住闩锁的思路：把寄生 SCR 的参数控制住，保证芯片只要在绝对最大额定值以内工作，就永远进不了导通态。所以寄生 SCR 的参数和其它电参数一样，要做充分的特性测试，验证工艺设计目标。', 'The way to prevent latch-up: control the parasitic SCR parameters so that as long as the device operates within its absolute maximum ratings, it can never enter the on state. So the parasitic SCR parameters, like any other electrical parameters, must be fully characterized to verify the process design goals.')

/* ---------------- 4. 测试参数与向量 ---------------- */

export const TEST_LEAD: LText[] = [
  loc('闩锁测试的思路是“故意点火”：想办法把寄生 SCR 推进导通态，看它进不进去。', 'The idea of latch-up testing is to "light the fuse on purpose": try to push the parasitic SCR into the on state and see whether it goes.'),
  loc('两条路：加高电压直到 VBO（过压测试，把 VDD 和所有输入抬高）；或者往阱/衬底注入门极电流（电流触发测试，往每个输入、输出脚灌电流、抽电流）。具体数值来自工艺规格，要和电路设计、工艺工程师一起定。', 'Two approaches: raise the voltage up to VBO (overvoltage test, raising VDD and all inputs), or inject gate current into the well/substrate (current trigger test, forcing current into and out of each input and output pin). The actual values come from the process spec and are set together with the design and process engineers.'),
]

export const PARAMS: Array<{ sym: string; def: LText; typ: LText | string; text: LText }> = [
  { sym: 'VDDMAX', def: loc('最大工作 VDD', 'Maximum operating VDD'), typ: '5.25 V', text: loc('测 IDD 的基准条件。两次 IDD 测量之间 VDD 不能低于它。', 'The reference condition for measuring IDD. VDD must not drop below it between the two IDD measurements.') },
  { sym: 'VDDOVR', def: loc('抬高后的 VDD', 'Raised VDD'), typ: loc('7.0 V（5 V 设计）', '7.0 V (5 V design)'), text: loc('过压测试时把 VDD 抬到这里，试探 VBO。', 'VDD is raised to this level in the overvoltage test to probe VBO.') },
  { sym: 'VIHOVR', def: loc('抬高后的正输入电压', 'Raised positive input voltage'), typ: 'VDD + 0.5 V', text: loc('比电源还高 0.5 V，让输入保护二极管导通，往阱里注入电流。', '0.5 V above the supply, turning on the input protection diode to inject current into the well.') },
  { sym: 'VILOVR', def: loc('抬高后的负输入电压', 'Raised negative input voltage'), typ: 'GND − 0.5 V', text: loc('比地还低 0.5 V，让对地保护二极管导通，从衬底抽电流。', '0.5 V below ground, turning on the protection diode to ground to pull current from the substrate.') },
  { sym: 'TRIGIH', def: loc('最大正向注入电流：灌进管脚而不闩锁', 'Max positive trigger current: forced into a pin without latch-up'), typ: '> 20 mA', text: loc('用 PMU 往输入或输出脚灌电流。芯片必须扛住这么大而不闩锁。', 'The PMU forces current into an input or output pin. The device must withstand this much without latching up.') },
  { sym: 'TRIGIL', def: loc('最大负向注入电流：从管脚抽出而不闩锁', 'Max negative trigger current: pulled from a pin without latch-up'), typ: '> 20 mA', text: loc('用 PMU 从管脚往外抽电流。', 'The PMU pulls current out of the pin.') },
  { sym: 'IDDQ', def: loc('最大静态 IDD', 'Maximum static IDD'), typ: loc('静态 IDD 规格', 'Static IDD spec'), text: loc('第一次测 IDD 的上限。超过它，说明芯片本来就不正常，测试中止。', 'The limit for the first IDD measurement. Exceeding it means the device is abnormal to begin with, and the test aborts.') },
  { sym: 'IDD1', def: loc('实测的静态 IDD', 'Measured static IDD'), typ: '—', text: loc('触发前测到的 IDD，存进程序变量，作为触发后比较的基准。', 'IDD measured before triggering, stored in a program variable as the reference for comparison after triggering.') },
  { sym: 'IDDT', def: loc('触发后 IDD 允许的最大变化', 'Maximum allowed IDD change after trigger'), typ: '< 5% × IDD1', text: loc('触发后 IDD 必须落在 IDD1 ± IDDT 之内，否则判闩锁。', 'After triggering, IDD must stay within IDD1 ± IDDT; otherwise it is judged latch-up.') },
]

export const PATTERNS: LText[] = [
  loc('Pattern 1：把芯片预置到已知状态（和静态 IDD 测试一样）。', 'Pattern 1: precondition the device to a known state (same as the static IDD test).'),
  loc('Pattern 2：所有输入在“互补背景”下逐个高低翻转——测一个脚时其余脚处在相反状态。', 'Pattern 2: toggle each input high and low against a "complementary background": while one pin is tested, the others are in the opposite state.'),
  loc('Pattern 3：所有输出翻高翻低（和 VOH/VOL 测试一样）。', 'Pattern 3: drive all outputs high and low (same as the VOH/VOL test).'),
  loc('Pattern 4：把高阻输出置为高阻态（和 IOZ 测试一样）。', 'Pattern 4: put tri-state outputs into high impedance (same as the IOZ test).'),
]

export const HW_NOTE: LText[] = [
  loc('SCR 一旦触发，电流只受外部电路限制。VDD 电源必须限流到安全值，约 300 mA；电源不能编程限流，就串一个电阻。', 'Once the SCR fires, current is limited only by the external circuit. The VDD supply must be current limited to a safe value, about 300 mA; if the supply has no programmable current limit, add a series resistor.'),
  loc('拆掉负载板上大于 20 µF 的旁路电容：大电容储能，触发时会瞬间放出很大的电流，限流也挡不住。', 'Remove bypass capacitors larger than 20 µF from the load board: large capacitors store energy and dump a huge current instantly when triggered, which the current limit cannot stop.'),
]

/* ---------------- 5. 测试流程模拟器 ---------------- */

export type TestMode = 'vbo' | 'input' | 'hiz' | 'output'
export type Pol = 'hi' | 'lo'
export type Chip = 'good' | 'latch' | 'leaky'

export const VDDMAX = 5.25
export const VDDOVR = 7.0
export const IDDQ_UA = 50
export const IDDT_PCT = 5
export const TRIG_MA = 20

const IDD_GOOD = 12
const IDD_LEAKY = 850
const IDD_LATCH = ILIM_MA * 1000

export const STEP_TITLES: LText[] = [
  loc('加 VDDMAX', 'Apply VDDMAX'),
  loc('预置到已知状态', 'Precondition'),
  loc('测 IDD，存为 IDD1', 'Measure IDD, store as IDD1'),
  loc('和 IDDQ 比', 'Compare with IDDQ'),
  loc('施加触发', 'Apply trigger'),
  loc('撤掉触发，不掉电', 'Remove trigger, keep power'),
  loc('再预置一次', 'Precondition again'),
  loc('再测 IDD', 'Measure IDD again'),
  loc('掉电', 'Power down'),
  loc('和 IDD1 ± IDDT 比', 'Compare with IDD1 ± IDDT'),
  loc('输出结果', 'Output result'),
]

export function trigName(mode: TestMode, pol: Pol) {
  if (mode === 'vbo') return 'VDDOVR / VIHOVR / VILOVR'
  return pol === 'hi' ? 'TRIGIH' : 'TRIGIL'
}

/** 每一步的具体做法 */
export function stepDetail(i: number, mode: TestMode, pol: Pol): LText {
  const pat =
    mode === 'hiz'
      ? loc('跑 Pattern 4：把被测脚置为高阻；结束时高阻脚由测试机驱动。前后用同一个结束地址。', 'Run Pattern 4: put the pin under test into high impedance; at the end, the high-Z pins are driven by the tester. Use the same end address both times.')
      : mode === 'output'
        ? pol === 'lo'
          ? loc('跑 Pattern 3 的对应地址：把被测输出预置成低态。', 'Run Pattern 3 to the matching address: precondition the output under test to low.')
          : loc('跑 Pattern 3 的对应地址：把被测输出预置成高态。', 'Run Pattern 3 to the matching address: precondition the output under test to high.')
        : loc('跑 Pattern 1：把芯片预置到已知状态。', 'Run Pattern 1: precondition the device to a known state.')
  switch (i) {
    case 0:
      return loc('VDD = VDDMAX = 5.25 V，输入电平放在电源轨上：VIH = VDDMAX，VIL = GND。', 'VDD = VDDMAX = 5.25 V, input levels at the rails: VIH = VDDMAX, VIL = GND.')
    case 1:
    case 6:
      return pat
    case 2:
      return loc('用 DC 测量系统测流进 VDD 的电流，存进程序变量 IDD1。', 'Measure the current into VDD with the DC measurement system and store it in program variable IDD1.')
    case 3:
      return loc('IDD1 > IDDQ 就输出“初始静态 IDD 失效”和 VDD、IDD 值，掉电，中止测试。', 'If IDD1 > IDDQ, output "initial static IDD failure" with the VDD and IDD values, power down, and abort the test.')
    case 4:
      if (mode === 'vbo') return loc('VDD 升到 VDDOVR = 7.0 V，VIH = VIHOVR，VIL = VILOVR；跑 Pattern 2，每个输入轮流翻高翻低，其余脚处在相反状态。', 'Raise VDD to VDDOVR = 7.0 V, VIH = VIHOVR, VIL = VILOVR; run Pattern 2, toggling each input high and low in turn with the other pins in the opposite state.')
      return pol === 'hi'
        ? loc('用 DC 测量系统往被测脚灌入 TRIGIH = +20 mA。', 'Force TRIGIH = +20 mA into the pin under test with the DC measurement system.')
        : loc('用 DC 测量系统从被测脚抽出 TRIGIL = −20 mA。', 'Pull TRIGIL = −20 mA out of the pin under test with the DC measurement system.')
    case 5:
      return mode === 'vbo'
        ? loc('输入电平先回到原值，再把 VDD 降回 VDDMAX。全程不掉电。', 'Return the input levels to their original values first, then lower VDD back to VDDMAX. Power stays on throughout.')
        : loc('撤掉注入电流，VDD 保持在 VDDMAX。全程不掉电。', 'Remove the trigger current; VDD stays at VDDMAX. Power stays on throughout.')
    case 7:
      return loc('再测一次流进 VDD 的电流。', 'Measure the current into VDD again.')
    case 8:
      return loc('掉电，为下一项测试做准备。', 'Power down to prepare for the next test.')
    case 9:
      return loc('要求 IDD1 − IDDT < IDD < IDD1 + IDDT，IDDT = 5% × IDD1。超出就是闩锁了。', 'Require IDD1 − IDDT < IDD < IDD1 + IDDT, with IDDT = 5% × IDD1. Outside this range means latch-up.')
    default:
      return loc('输出 Pass / Fail，以及 VDD、IDD、触发参数（过压测试还输出 VDDOVR；电流测试还输出管脚名）。', 'Output Pass / Fail plus VDD, IDD, and trigger parameters (VDDOVR for the overvoltage test; the pin name for current tests).')
  }
}

export type SimPoint = { vdd: number; idd: number }
export type SimResult = {
  /** 下标 0 = 开始前，1..11 = 第 1..11 步之后 */
  points: SimPoint[]
  idd1: number
  idd2: number
  /** 中止在哪一步之后（第 4 步），没中止为 0 */
  abortAt: number
  verdict: 'pass' | 'latch' | 'abort'
}

/** 芯片模型：按测试方式和芯片类型推演 VDD / IDD */
export function simulate(mode: TestMode, chip: Chip, dropPower: boolean): SimResult {
  const idd0 = chip === 'leaky' ? IDD_LEAKY : IDD_GOOD
  const pts: SimPoint[] = [{ vdd: 0, idd: 0 }]
  const on = { vdd: VDDMAX, idd: idd0 }
  pts.push(on, on, on, on)
  if (idd0 > IDDQ_UA) {
    for (let i = 5; i <= 11; i += 1) pts.push({ vdd: 0, idd: 0 })
    return { points: pts, idd1: idd0, idd2: 0, abortAt: 4, verdict: 'abort' }
  }
  let latched = chip === 'latch'
  const trigVdd = mode === 'vbo' ? VDDOVR : VDDMAX
  pts.push({ vdd: trigVdd, idd: latched ? IDD_LATCH : mode === 'vbo' ? idd0 * 1.6 : idd0 })
  // 错误做法：撤触发时掉了电，闩锁被“掉电”悄悄解除了
  if (dropPower) latched = false
  const after = latched ? IDD_LATCH : idd0 * 1.01
  pts.push(dropPower ? { vdd: 0, idd: 0 } : { vdd: VDDMAX, idd: after })
  pts.push({ vdd: VDDMAX, idd: after }, { vdd: VDDMAX, idd: after })
  pts.push({ vdd: 0, idd: 0 }, { vdd: 0, idd: 0 }, { vdd: 0, idd: 0 })
  const ok = Math.abs(after - idd0) < (idd0 * IDDT_PCT) / 100
  return { points: pts, idd1: idd0, idd2: after, abortAt: 0, verdict: ok ? 'pass' : 'latch' }
}

export function fmtIdd(ua: number) {
  if (ua >= 1000) return `${(ua / 1000).toFixed(1)} mA`
  return `${ua.toFixed(1)} µA`
}

export const VERDICT_TEXT: Record<SimResult['verdict'], LText> = {
  pass: loc('PASS：触发后 IDD 回到原值，芯片没有闩锁。', 'PASS: IDD returns to its original value after the trigger; the device did not latch up.'),
  latch: loc('FAIL：触发后 IDD 冲到电源限流值 300 mA，撤掉触发也不回落——芯片闩锁了。', 'FAIL: after the trigger, IDD jumps to the 300 mA supply current limit and stays there after the trigger is removed. The device latched up.'),
  abort: loc('中止：初始静态 IDD 就超过 IDDQ，芯片本身有问题，不做闩锁测试，掉电。', 'Aborted: the initial static IDD already exceeds IDDQ. The device itself is faulty, so no latch-up test is done; power down.'),
}

export const DROP_WARN = loc('错误做法：撤掉触发时掉了电。闩锁靠掉电解除，这样第二次 IDD 测量就看不到闩锁，会把会闩锁的芯片判成 PASS。两次 IDD 测量之间 VDD 绝不能低于 VDDMAX。', 'Wrong method: power was dropped when removing the trigger. Powering down releases latch-up, so the second IDD measurement cannot see it, and a device that latches up is judged PASS. VDD must never drop below VDDMAX between the two IDD measurements.')

export const MODE_NOTE: Record<TestMode, LText> = {
  vbo: loc('过压测试：VDD 和所有输入一起抬高，试探 VBO。', 'Overvoltage test: raise VDD and all inputs together to probe VBO.'),
  input: loc('输入脚：每个输入脚分别做 TRIGIH 和 TRIGIL 两次，所有输入脚都要做。', 'Input pins: apply TRIGIH and TRIGIL separately to every input pin.'),
  hiz: loc('高阻脚：和输入脚一样，只是用 Pattern 4 预置，保证被测脚处于高阻态。', 'High-Z pins: same as input pins, but preconditioned with Pattern 4 so the pin under test is in high impedance.'),
  output: loc('输出脚：每个脚测两种状态，每种只加一个电流——低态配 TRIGIL，高态配 TRIGIH。', 'Output pins: test each pin in two states with one current each: TRIGIL in the low state, TRIGIH in the high state.'),
}

/* ---------------- 6. 施加激励的顺序 ---------------- */

export const STIM_LEAD = loc('闩锁只有在不超过绝对最大额定值时才不会发生。额定值规定输入不能超出电源轨（例如 VDD + 10% 到 GND − 10%），所以 VDD 和输入激励的先后顺序要排好；I/O 脚也要先初始化，避免芯片和测试机互相“顶牛”产生大电流。这个顺序适用于所有 CMOS 测试。', 'Latch-up is avoided only when the absolute maximum ratings are not exceeded. The ratings forbid inputs beyond the supply rails (e.g. VDD + 10% to GND − 10%), so VDD and input stimulus must be applied in the right order, and I/O pins must be initialized first so the device and tester do not "fight" and draw large currents. This sequence applies to all CMOS testing.')

export const POWER_UP: LText[] = [
  loc('测试机把所有输入脚驱动到 0 V；I/O 脚设为不驱动，输出负载接 0 V。', 'The tester drives all input pins to 0 V; I/O pins are set to not drive, and output loads are tied to 0 V.'),
  loc('按规定顺序给各 VDD 脚加电。', 'Power up the VDD pins in the specified order.'),
  loc('设置输入电平 VIL / VIH。', 'Set input levels VIL / VIH.'),
  loc('设置输出负载的参考电压。', 'Set the output load reference voltage.'),
  loc('设置输出比较电平 VOL / VOH。', 'Set output compare levels VOL / VOH.'),
]

export const POWER_DOWN: LText[] = [
  loc('I/O 脚设为不驱动。', 'Set I/O pins to not drive.'),
  loc('输出负载参考电压设为 0 V。', 'Set the output load reference voltage to 0 V.'),
  loc('输入电平 VIL / VIH 设为 0 V。', 'Set input levels VIL / VIH to 0 V.'),
  loc('按规定顺序撤掉各 VDD 脚的电压。', 'Remove power from the VDD pins in the specified order.'),
]

/* ---------------- 收尾 ---------------- */

export const TAKEAWAY: LText[] = [
  loc('CMOS 里的阱和衬底天然组成寄生 PNPN（SCR）。触发后 VDD 到 GND 只剩约 1 V，电流只受外部电路限制。', 'The wells and substrate in CMOS naturally form a parasitic PNPN (SCR). Once triggered, only about 1 V remains from VDD to GND, and current is limited only by the external circuit.'),
  loc('触发有两条路：电压超过 VBO，或者往阱/衬底注入门极电流。门电流越大，VBO 越低。', 'There are two ways to trigger: voltage above VBO, or gate current injected into the well/substrate. The larger the gate current, the lower VBO.'),
  loc('闩住以后撤掉触发也没用，只有电流降到 IH 以下（掉电）才解除。', 'Once latched, removing the trigger does nothing; only dropping the current below IH (powering down) releases it.'),
  loc('测试流程：VDDMAX 下测 IDD1 → 施加触发 → 不掉电 → 再测 IDD，和 IDD1 ± 5% 比。', 'Test flow: measure IDD1 at VDDMAX → apply trigger → keep power on → measure IDD again and compare with IDD1 ± 5%.'),
  loc('测试硬件：VDD 限流约 300 mA（或串电阻），拆掉大于 20 µF 的大电容。', 'Test hardware: limit VDD current to about 300 mA (or add a series resistor), and remove capacitors larger than 20 µF.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('SCR 进入闩锁态后，怎样才能让它关断？', 'Once an SCR has latched, how do you turn it off?'),
    options: [
      { id: 'a', text: loc('把阳极电流降到维持电流 IH 以下，例如掉电', 'Drop the anode current below the holding current IH, e.g. by powering down') },
      { id: 'b', text: loc('撤掉门极触发电流', 'Remove the gate trigger current') },
      { id: 'c', text: loc('把输入电平拉回电源轨以内', 'Bring the input levels back within the rails') },
      { id: 'd', text: loc('等它自己恢复', 'Wait for it to recover by itself') },
    ],
    answer: 'a',
    explain: loc('两只寄生管互相喂基极，一旦导通就自我维持，和门极电流无关。只有电流低到维持不住正反馈时才会关断。', 'The two parasitic transistors feed each other\'s bases, so once on they sustain themselves regardless of gate current. They turn off only when the current is too low to sustain the positive feedback.'),
  },
  {
    id: 'q2',
    prompt: loc('往 SCR 的门极注入的电流越大，转折电压 VBO 会怎样？', 'As more current is injected into the SCR gate, what happens to the breakover voltage VBO?'),
    options: [
      { id: 'a', text: loc('越低：更低的电压就能触发', 'It drops: a lower voltage can trigger it') },
      { id: 'b', text: loc('越高', 'It rises') },
      { id: 'c', text: loc('不变', 'It stays the same') },
    ],
    answer: 'a',
    explain: loc('门极电流帮一只寄生管先导通，正反馈更容易建立。所以电流触发测试能在正常 VDD 下就把 SCR 点着。', 'Gate current helps one parasitic transistor turn on first, so positive feedback builds more easily. That is why a current trigger test can fire the SCR at normal VDD.'),
  },
  {
    id: 'q3',
    prompt: loc('闩锁测试时，为什么 VDD 电源要限流约 300 mA，并拆掉大于 20 µF 的旁路电容？', 'In latch-up testing, why limit the VDD supply to about 300 mA and remove bypass capacitors larger than 20 µF?'),
    options: [
      { id: 'a', text: loc('SCR 导通后电流只受外部电路限制，不限流会烧坏芯片；大电容储能会绕过限流瞬间放电', 'Once the SCR is on, current is limited only by the external circuit, so without a limit the device burns out; large capacitors store energy and discharge instantly, bypassing the limit') },
      { id: 'b', text: loc('为了让 IDD 测得更准', 'To measure IDD more accurately') },
      { id: 'c', text: loc('为了让 SCR 更容易触发', 'To make the SCR easier to trigger') },
    ],
    answer: 'a',
    explain: loc('导通后 SCR 两端只剩约 1 V，几乎是短路。电源限流（或串电阻）把电流卡在安全值；大电容就在电源出口，放电时限流挡不住。', 'Once on, only about 1 V remains across the SCR: nearly a short. The supply current limit (or series resistor) holds current at a safe value; a large capacitor sits right at the supply output, and the limit cannot stop its discharge.'),
  },
  {
    id: 'q4',
    prompt: loc('为什么第一次和第二次 IDD 测量之间不能掉电？', 'Why must power not be dropped between the first and second IDD measurements?'),
    options: [
      { id: 'a', text: loc('掉电会让闩锁解除，第二次测量就看不到闩锁，会把坏芯片判成 Pass', 'Powering down releases latch-up, so the second measurement cannot see it and a bad device is judged Pass') },
      { id: 'b', text: loc('掉电会损坏测试机', 'Powering down damages the tester') },
      { id: 'c', text: loc('掉电后需要重新跑开短路', 'Continuity must be rerun after powering down') },
    ],
    answer: 'a',
    explain: loc('判闩锁靠的就是“撤掉触发后 IDD 还高”。掉电等于把闩锁关掉了，测试就失去意义。', 'Latch-up is detected precisely by "IDD still high after the trigger is removed". Powering down turns the latch-up off, and the test becomes meaningless.'),
  },
  {
    id: 'q5',
    prompt: loc('第一次测得的 IDD1 已经大于 IDDQ，程序应该？', 'The first measurement IDD1 is already above IDDQ. What should the program do?'),
    options: [
      { id: 'a', text: loc('输出初始静态 IDD 失效和 VDD、IDD 值，掉电，中止测试', 'Output an initial static IDD failure with the VDD and IDD values, power down, and abort') },
      { id: 'b', text: loc('继续施加触发，看会不会更大', 'Apply the trigger anyway and see if it gets larger') },
      { id: 'c', text: loc('把 IDDQ 放宽后继续', 'Widen IDDQ and continue') },
    ],
    answer: 'a',
    explain: loc('基准都不正常，后面“和 IDD1 比”就没有意义了；芯片本身已经有问题。', 'If the reference itself is abnormal, "compare with IDD1" means nothing; the device already has a problem.'),
  },
  {
    id: 'q6',
    prompt: loc('测输出脚的闩锁时，触发电流怎么配？', 'When testing output pins for latch-up, how are trigger currents assigned?'),
    options: [
      { id: 'a', text: loc('低态配 TRIGIL，高态配 TRIGIH，每种状态只加一个电流', 'TRIGIL in the low state, TRIGIH in the high state; one current per state') },
      { id: 'b', text: loc('每种状态都加 TRIGIH 和 TRIGIL', 'Both TRIGIH and TRIGIL in each state') },
      { id: 'c', text: loc('只测高态', 'Only the high state') },
    ],
    answer: 'a',
    explain: loc('输出在低态时从管脚抽电流、在高态时往管脚灌电流，都是把管脚往电源轨外面推的方向，最容易触发。', 'Pulling current from the pin in the low state and forcing current into it in the high state both push the pin toward beyond the rails, the direction most likely to trigger.'),
  },
]
