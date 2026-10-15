import { loc, type LText } from '../../../i18n/locale'

export const S = {
  kickerParam: loc('数据手册', 'Datasheet'),
  kickerLogic: loc('逻辑电平', 'Logic level'),
  kickerSoa: loc('SOA', 'SOA'),
  kickerThermal: loc('热设计', 'Thermal design'),
  kickerFlow: loc('选型流程', 'Selection flow'),
  kickerCase: loc('故障复盘', 'Failure review'),
  kickerCap: loc('综合任务', 'Capstone'),
  introTitle: loc('选管子，就是读数据手册', 'Choosing a MOSFET means reading its datasheet'),
  paramTitle: loc('关键参数：每个数字都带着条件', 'Key parameters: every number comes with conditions'),
  paramNote: loc('点表里的一行，或者上面的按钮。示例器件是虚构的，数值只取同类器件的量级。', 'Click a row of the table or a button above. The part is fictional; values only follow the typical size of such devices.'),
  logicTitle: loc('Vgs(th) 不是导通电压：3.3 V 能直接驱动吗', 'Vgs(th) is not the on voltage: can 3.3 V drive it directly'),
  logicNote: loc('换器件和驱动电压，看 Rds(on) 在不在手册里有数据。', 'Change the part and drive voltage, and see whether the datasheet has Rds(on) data there.'),
  soaTitle: loc('SOA：安全工作区', 'SOA: the safe operating area'),
  soaNote: loc('先选一个场景，再点图或拖滑块，把工作点放进去看在不在 SOA 里。', 'Pick a scenario, then click the chart or drag the sliders to place an operating point and see whether it is inside the SOA.'),
  thermalTitle: loc('热设计：功耗、结温、封装', 'Thermal design: power, junction temperature, package'),
  thermalNote: loc('选封装，调电流、25 °C 下的 Rds(on) 和环境温度；Tj 和 Rds(on) 互相影响，已解成自洽值。', 'Choose a package and set the current, the 25 °C Rds(on) and the ambient; Tj and Rds(on) affect each other and are solved self-consistently.'),
  flowTitle: loc('典型选型流程', 'A typical selection flow'),
  flowNote: loc('逐步播放，或点图里的框直接跳到那一步。', 'Step through, or click a box in the figure to jump to that step.'),
  caseTitle: loc('故障复盘：现象 → 原因 → 解决', 'Failure reviews: symptom → cause → fix'),
  caseNote: loc('五个来自实际项目的典型坑，每个都带一张图证明原因。', 'Five typical pitfalls from real projects, each with a figure that shows the cause.'),
  capTitle: loc('综合任务：3.3 V MCU 控制 12 V 负载', 'Capstone: a 3.3 V MCU switching a 12 V load'),
  capNote: loc('依次选拓扑、器件、负载和环境，页面逐项给出通过或不通过的理由，最后写出完整计算过程。', 'Choose topology, part, load and ambient in turn; the page gives a pass or fail with reasons for each check and ends with the full calculation written out.'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    'Rds(on) 的损耗和低边、高边见「MOS 管作为开关」；Qg、电容和米勒平台见「动态特性」；体二极管和温漂见「非理想特性」；GPIO 驱动、软启动、负载开关见「典型应用电路」。',
    'Rds(on) loss and low-side vs high-side are in The MOSFET as a Switch; Qg, capacitances and the Miller plateau are in Dynamics; the body diode and temperature drift are in Non-ideal Behaviour; GPIO drive, soft start and load switches are in Typical Board Circuits.',
  ),
  next: loc('下一课：PCB 课程', 'Next: the PCB course'),
  // 读数
  part: loc('器件', 'Part'),
  vth: loc('Vgs(th) 最大', 'Vgs(th) max'),
  margin: loc('3.3 V 余量', 'Margin at 3.3 V'),
  rdsAt: loc('可用的 Rds(on)', 'Usable Rds(on)'),
  verdict: loc('结论', 'Verdict'),
  idHot: loc('Vgs = Vth(max) 时的 Id（估）', 'Id at Vgs as given (est.)'),
  point: loc('工作点', 'Operating point'),
  power: loc('功率 P', 'Power P'),
  limit: loc('该脉宽的功率限制', 'Power limit at this pulse'),
  inside: loc('在 SOA 内', 'Inside the SOA'),
  outside: loc('在 SOA 外', 'Outside the SOA'),
  vdsKnob: loc('Vds', 'Vds'),
  idKnob: loc('Id', 'Id'),
  pulse: loc('脉宽', 'Pulse width'),
  loadI: loc('负载电流 I', 'Load current I'),
  r25: loc('25 °C 下的 Rds(on)', 'Rds(on) at 25 °C'),
  ambient: loc('环境温度 Ta', 'Ambient Ta'),
  rHot: loc('热态 Rds(on)', 'Hot Rds(on)'),
  loss: loc('功耗 P', 'Power P'),
  tj: loc('结温 Tj', 'Junction Tj'),
  tjLeft: loc('距 125 °C 上限', 'Room to 125 °C'),
  runaway: loc('热失控', 'Thermal runaway'),
  topology: loc('1. 拓扑', '1. Topology'),
  candidate: loc('2. 候选器件（示例器件）', '2. Candidate (example part)'),
  loadKind: loc('3. 负载类型', '3. Load type'),
  diodeKind: loc('续流二极管', 'Flyback diode'),
  checks: loc('逐项检查', 'Check by check'),
  suggest: loc('栅极网络建议', 'Gate network suggestions'),
  reportTitle: loc('交上去的计算过程', 'The calculation, as handed in'),
  pass: loc('通过', 'Pass'),
  fail: loc('不通过', 'Fail'),
  skip: loc('未评估', 'Not evaluated'),
  example: loc('示例器件', 'Example part'),
  tableName: loc('器件', 'Part'),
  tablePkg: loc('封装', 'Package'),
}

export const INTRO: LText[] = [
  loc(
    '选一颗 MOS 管，本质上是读一份数据手册：每个数字后面都带着条件，Vgs 是多少、电流是多少、温度是多少。不看条件的数字是没用的。这一课把前面的内容接起来：{@mosSwitch} 里的 Rds(on) 和低边、高边，{@mosDynamic} 里的 Qg 和电容，{@mosReal} 里的体二极管和温漂，{@mosApps} 里的典型电路。',
    'Choosing a MOSFET is essentially reading a datasheet: every number carries conditions, what Vgs, what current, what temperature. A number without its conditions is useless. This lesson ties the earlier ones together: Rds(on) and low-side vs high-side from {@mosSwitch}, Qg and capacitances from {@mosDynamic}, the body diode and temperature drift from {@mosReal}, and the typical circuits in {@mosApps}.',
  ),
  loc(
    '读手册的习惯和读芯片规格书、写测试规格是一套：{@spec} 讲怎样把规格变成测试条件，{@fSpec} 讲每个参数怎样落成测试项，{@dc} 里的 VOH、VOL、IDD 也都标着测试条件。最后用一个综合任务收尾：3.3 V MCU 控制 12 V 负载，选出管子并写出计算过程。',
    'The reading habit is the same as for IC datasheets and test specs: {@spec} shows how a spec becomes test conditions, {@fSpec} shows how each parameter becomes a test item, and VOH, VOL and IDD in {@dc} all carry their test conditions too. We finish with a capstone: a 3.3 V MCU switching a 12 V load, choosing the part and writing out the calculation.',
  ),
]

export type ParamId = 'vds' | 'id' | 'rds' | 'vth' | 'vgsmax' | 'qg' | 'caps' | 'rth'

export const PARAMS: Array<{ id: ParamId; label: LText; title: LText; text: LText; detail: LText }> = [
  {
    id: 'vds',
    label: loc('Vds', 'Vds'),
    title: loc('Vds：漏源耐压', 'Vds: drain-source breakdown'),
    text: loc(
      'Vds 是漏极和源极之间能承受的最大电压，测试条件是 Vgs = 0 V 加很小的漏电流。它是上限，不是工作电压：线路电感、热插拔和关断都会产生过冲，所以要比电源高 1.5 倍以上。',
      'Vds is the highest voltage the drain-source can stand, tested with Vgs = 0 V and a tiny leakage current. It is a ceiling, not an operating voltage: wiring inductance, hot-plug and turn-off all cause overshoot, so it must be at least 1.5 times the supply.',
    ),
    detail: loc(
      '超过 Vds 管子就雪崩击穿。12 V 系统选 ≥ 20–30 V 的管子，24 V 系统选 ≥ 40 V。电感负载关断的尖峰更大，要靠续流二极管钳住；雪崩和体二极管见 {@mosReal}。',
      'Past Vds the transistor avalanches. For a 12 V system pick 20–30 V or more, for 24 V pick 40 V or more. Inductive turn-off spikes are larger and must be clamped by a flyback diode; avalanche and the body diode are in {@mosReal}.',
    ),
  },
  {
    id: 'id',
    label: loc('Id', 'Id'),
    title: loc('Id：连续漏极电流', 'Id: continuous drain current'),
    text: loc(
      'Id 是外壳保持 25 °C 时能连续通过的电流，是最好情况。实际板子散热没有那么好，所以不能拿 Id 当可用电流，要用发热算出的 Tj 来验证。',
      'Id is the current that can flow continuously while the case is held at 25 °C: the best case. A real board cools worse, so Id is not a usable current; verify with the Tj computed from the heat.',
    ),
    detail: loc(
      '手册里还有脉冲电流 Idm，通常是 Id 的几倍，只允许微秒到毫秒级。Id 同时被键合线和结温限制：SOT-23 的 Id 可能写得不小，但它自己散不掉热。选型时留 1.5 倍以上余量，再用热计算验证。',
      'The datasheet also gives a pulsed current Idm, usually several times Id and allowed only for microseconds to milliseconds. Id is limited by both the bond wires and the junction temperature: a SOT-23 may list a decent Id yet cannot shed the heat by itself. Keep at least 1.5 times margin, then verify with the thermal calculation.',
    ),
  },
  {
    id: 'rds',
    label: loc('Rds(on)', 'Rds(on)'),
    title: loc('Rds(on)：导通电阻，看清在哪个 Vgs 测的', 'Rds(on): on-resistance, check at which Vgs it was measured'),
    text: loc(
      'Rds(on) 一定要连着测试 Vgs 一起看：同一颗管子在 10 V 时 24 mΩ，在 2.5 V 时 38 mΩ，更低的 Vgs 可能干脆没有数据。手册给的是 25 °C 的值，工作到 125 °C 约变成 1.5 倍。',
      'Always read Rds(on) together with its test Vgs: the same part is 24 mΩ at 10 V and 38 mΩ at 2.5 V, and there may be no data at all at lower Vgs. The datasheet value is for 25 °C; at 125 °C it is about 1.5 times larger.',
    ),
    detail: loc(
      '手册通常把 Rds(on) 列成几行：Vgs = 10 V、4.5 V、2.5 V，逻辑电平管才有 2.5 V 或更低的行。拿你实际的栅极电压去找对应的行；没有这一行，就没有保证。导通损耗 P = I² × Rds(on)，见 {@mosSwitch}。',
      'The datasheet lists Rds(on) on several rows: Vgs = 10 V, 4.5 V, 2.5 V, and only logic-level parts have a 2.5 V or lower row. Look up the row for your real gate voltage; with no such row there is no guarantee. Conduction loss is P = I² × Rds(on), see {@mosSwitch}.',
    ),
  },
  {
    id: 'vth',
    label: loc('Vgs(th)', 'Vgs(th)'),
    title: loc('Vgs(th)：阈值电压，不是导通电压', 'Vgs(th): threshold voltage, not the on voltage'),
    text: loc(
      'Vgs(th) 的测试条件写在旁边：Vds = Vgs，Id = 250 µA。它只说电流刚刚到 250 µA，离安培级的导通还差几伏。有 min / typ / max 三个值，选型看 max。',
      'The test conditions of Vgs(th) are listed next to it: Vds = Vgs, Id = 250 µA. It only says the current has just reached 250 µA, still volts away from amps of conduction. There are min / typ / max values; selection looks at max.',
    ),
    detail: loc(
      '常见误解：Vth = 1 V，就以为 3.3 V 驱动绰绰有余。实际上 250 µA 到 2 A 差了 8000 倍，要靠 Vgs 继续往上抬，抬到多少看 Rds(on) 的测试行。Vth 还随温度下降（约 −2 mV/°C），手册里的最大值是 25 °C 的，低温时更高。',
      'A common misreading: Vth = 1 V, so 3.3 V drive must be plenty. But 250 µA to 2 A is a factor of 8000, which Vgs must keep climbing to deliver; how far depends on the Rds(on) test rows. Vth also falls with temperature (about −2 mV/°C); the datasheet maximum is at 25 °C and is higher when cold.',
    ),
  },
  {
    id: 'vgsmax',
    label: loc('±Vgs 最大值', '±Vgs max'),
    title: loc('Vgs 最大值：栅氧的上限', 'Vgs max: the gate-oxide limit'),
    text: loc(
      '栅极和沟道之间隔着只有几十纳米厚的氧化层，超过 ±Vgs 就会击穿，而且是永久损坏，不会恢复。',
      'Between gate and channel lies an oxide only tens of nanometres thick; past ±Vgs it breaks down, and the damage is permanent.',
    ),
    detail: loc(
      '常见上限是 ±8 V、±12 V、±20 V。24 V 的信号直接接栅极，或者感性负载的尖峰通过 Cgd 耦合到栅极，都会超限；用稳压管或电阻分压把栅极电压钳在额定内。见下面的故障复盘。',
      'Typical limits are ±8 V, ±12 V and ±20 V. Driving the gate straight from a 24 V signal, or inductive spikes coupling to the gate through Cgd, both exceed it; clamp the gate with a Zener or a resistor divider inside the rating. See the failure reviews below.',
    ),
  },
  {
    id: 'qg',
    label: loc('Qg', 'Qg'),
    title: loc('Qg：栅极总电荷', 'Qg: total gate charge'),
    text: loc(
      'Qg 是把栅极充到测试 Vgs 所需的总电荷。驱动电流 × 时间 = Qg，所以 Qg 决定开关速度和驱动损耗：Qg 越大，MCU 引脚要充得越久。',
      'Qg is the total charge needed to bring the gate up to the test Vgs. Drive current × time = Qg, so Qg sets switching speed and drive loss: the bigger it is, the longer the MCU pin must charge.',
    ),
    detail: loc(
      '例：Qg = 6 nC，栅极平均驱动电流 5 mA，充电约 6 nC ÷ 5 mA = 1.2 µs。要看清 Qg 是在哪个 Vgs 下测的。Qg 曲线中间平的一段是米勒平台，由 Cgd 造成，见 {@mosDynamic}。',
      'Example: Qg = 6 nC with an average gate drive current of 5 mA charges in about 6 nC ÷ 5 mA = 1.2 µs. Check which Vgs Qg was measured at. The flat middle of the Qg curve is the Miller plateau, caused by Cgd, see {@mosDynamic}.',
    ),
  },
  {
    id: 'caps',
    label: loc('Ciss / Coss / Crss', 'Ciss / Coss / Crss'),
    title: loc('Ciss / Coss / Crss：寄生电容', 'Ciss / Coss / Crss: parasitic capacitances'),
    text: loc(
      'Ciss = Cgs + Cgd，是驱动要充的；Coss = Cds + Cgd，每次开关都要充放电；Crss = Cgd，是米勒电容。它们随 Vds 变化，手册给的是某个 Vds（如 15 V）、1 MHz 下的值。',
      'Ciss = Cgs + Cgd is what the driver must charge; Coss = Cds + Cgd is charged and discharged on every switch; Crss = Cgd is the Miller capacitance. They vary with Vds; the datasheet gives them at one Vds (say 15 V) and 1 MHz.',
    ),
    detail: loc(
      '电容随 Vds 升高而下降（耗尽区变宽），Vds 很低时更大。Crss 虽然最小，却造成米勒平台，决定开关时间。下面的图把三个电容画回器件符号上。见 {@mosDynamic}。',
      'Capacitance falls as Vds rises (the depletion region widens) and is larger at low Vds. Crss is the smallest yet causes the Miller plateau and sets the switching time. The figure below draws the three capacitors back onto the device symbol. See {@mosDynamic}.',
    ),
  },
  {
    id: 'rth',
    label: loc('RθJA', 'RθJA'),
    title: loc('RθJA：结到环境的热阻', 'RθJA: junction-to-ambient thermal resistance'),
    text: loc(
      'RθJA 表示每耗散 1 W，结温比环境高多少度。它强烈依赖 PCB 铜面积和测试条件，手册里的数是典型值，只能做初估。',
      'RθJA says how many degrees the junction rises above ambient per watt dissipated. It depends strongly on PCB copper area and test conditions; the datasheet number is typical and only good for a first estimate.',
    ),
    detail: loc(
      '典型量级：SOT-23 约 250 °C/W，1 W 就升 250 °C；DPAK 焊在 1 in² 铜上约 50 °C/W；TO-220 在空气中约 62 °C/W。手册的测试板和你的板子不一样，最终仍要实测。',
      'Typical sizes: SOT-23 about 250 °C/W, so 1 W gives 250 °C of rise; DPAK on 1 in² of copper about 50 °C/W; TO-220 in free air about 62 °C/W. The datasheet test board is not your board; measure in the end.',
    ),
  },
]

export const TAKEAWAY: LText[] = [
  loc('读手册先看条件：Rds(on) 跟着 Vgs 走，Qg 跟着 Vgs 走，电容跟着 Vds 走。', 'Read conditions first: Rds(on) goes with Vgs, Qg with Vgs, capacitance with Vds.'),
  loc('Vgs(th) 是 250 µA 的起点，不是导通电压；3.3 V 能不能直驱，要看手册有没有 Rds(on) @ 2.5 V 或 3 V 以下的数，再看 3.3 V − Vth(max) 的余量。', 'Vgs(th) is the 250 µA starting point, not the on voltage; whether 3.3 V can drive it depends on whether the datasheet gives Rds(on) at 2.5 V or lower, and then on the margin 3.3 V − Vth(max).'),
  loc('Id 额定是 25 °C 壳温下的最好情况，实际用 P = I² × Rds(on,热) 和 Tj = Ta + P × RθJA 验证，Tj 留在 125 °C 以内。', 'The Id rating is the best case at a 25 °C case; verify with P = I² × Rds(on, hot) and Tj = Ta + P × RθJA and keep Tj within 125 °C.'),
  loc('SOA 有四堵墙：Rds(on) 线、电流、功率（脉宽越短越高）、电压；热插拔和线性区最容易闯进功率墙。', 'The SOA has four walls: the Rds(on) line, current, power (higher for shorter pulses) and voltage; hot-plug and linear mode most often hit the power wall.'),
  loc('感性负载必须有续流二极管，栅极必须有下拉电阻，栅极电压不许超过 ±Vgs。三条加起来只要几分钱。', 'Inductive loads need a flyback diode, the gate needs a pull-down, and gate voltage must stay inside ±Vgs. Together they cost a few cents.'),
  loc('选型流程：定负载 → 定拓扑 → 查 Vds / Id → 查 Rds(on) 与 Vth → 算热 → 看动态和 SOA → 加保护 → 实测。', 'Selection flow: define the load → choose the topology → check Vds / Id → check Rds(on) and Vth → compute heat → check dynamics and SOA → add protection → measure.'),
]
