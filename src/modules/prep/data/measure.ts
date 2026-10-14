import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const S = {
  kickerOhm: loc('欧姆定律', 'Ohm’s law'),
  kickerHook: loc('仪表接法', 'Meter hookup'),
  kickerLoad: loc('负载效应', 'Loading'),
  kickerKelvin: loc('四线法', 'Four-wire'),
  kickerScope: loc('示波器', 'Oscilloscope'),
  introTitle: loc('测量就是「加一个量，读一个量」', 'Measuring means “apply one quantity, read another”'),
  ohmTitle: loc('V = I × R：一个最小的电路', 'V = I × R: the smallest circuit'),
  ohmNote: loc('拖动电源电压和电阻，看电流表、电压表和功率怎么变。电阻按常见的 1/4 W 规格算。', 'Drag the supply voltage and resistance and watch the ammeter, voltmeter and power. The resistor is a common 1/4 W part.'),
  vs: loc('电源电压', 'Supply voltage'),
  r: loc('电阻', 'Resistance'),
  current: loc('电流', 'Current'),
  power: loc('功率', 'Power'),
  powerOk: loc('功率在 0.25 W 以内，电阻安全。', 'Power is within 0.25 W; the resistor is safe.'),
  powerBad: loc(
    '功率超过 0.25 W：1/4 W 电阻会发烫、变色甚至烧断。因为 P = V × I = V² / R，电压翻倍功率变 4 倍。',
    'Power exceeds 0.25 W: a 1/4 W resistor overheats, discolours or even burns open, because P = V × I = V² / R; double the voltage and power rises fourfold.',
  ),
  hookTitle: loc('电压表并联，电流表串联', 'Voltmeters in parallel, ammeters in series'),
  hookNote: loc('选一种接法看读数和后果。右边是万用表：黑表笔永远插 COM，红表笔插哪个孔决定测什么。', 'Pick a hookup to see the reading and what happens. On the right is the multimeter: the black lead always goes in COM, and the jack for the red lead decides what is measured.'),
  reading: loc('读数', 'Reading'),
  loadTitle: loc('仪表也会改变被测电路', 'The meter changes the circuit too'),
  loadNote: loc('两个 10 kΩ 分压，理想输出 5 V。换不同输入电阻的表，看读数偏多少。', 'Two 10 kΩ resistors divide 10 V, ideally 5 V. Switch to meters with different input resistance and see how far the reading moves.'),
  ideal: loc('理想值', 'Ideal'),
  measured: loc('表上读到', 'Meter reads'),
  error: loc('误差', 'Error'),
  kelvinTitle: loc('测小电阻：两线法 vs 四线法', 'Measuring small resistance: two-wire vs four-wire'),
  kelvinNote: loc('被测电阻 0.1 Ω，每根引线 0.2 Ω，加 1 A 电流。切换两种接法。', 'The DUT is 0.1 Ω, each lead is 0.2 Ω, and 1 A is forced. Switch between the two hookups.'),
  two: loc('两线法', 'Two-wire'),
  four: loc('四线法（Kelvin）', 'Four-wire (Kelvin)'),
  scopeTitle: loc('示波器：看电压随时间变化', 'Oscilloscope: voltage over time'),
  scopeNote: loc(
    '输入是 1 kHz、0–3.3 V 的方波。屏幕横 10 格、竖 8 格，触发在屏幕正中的上升沿。改时基和每格电压，看波形怎么缩放。',
    'The input is a 1 kHz, 0–3.3 V square wave. The screen is 10 divisions wide and 8 high, triggered on a rising edge at the centre. Change the timebase and volts per division and watch the waveform scale.',
  ),
  tdiv: loc('时基 / 格', 'Time / div'),
  vdiv: loc('电压 / 格', 'Volts / div'),
  periodDiv: loc('一个周期占', 'One period spans'),
  highDiv: loc('高电平占', 'High level spans'),
  divs: loc('格', 'div'),
  benchTitle: loc('台式仪器和 ATE 里的对应物', 'Bench instruments and their ATE counterparts'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('ATE 里的 PMU 就是自动化的「加电流测电压 / 加电压测电流」，见 {@pmu}；时序和交流测量见 {@timing}、{@fAc}。', 'The ATE PMU is an automated “force current, measure voltage / force voltage, measure current”, see {@pmu}; timing and AC measurement: {@timing}, {@fAc}.'),
  next: loc('继续：进入 ATE 主线第一课', 'Continue: first lesson of the ATE track'),
}

export const INTRO: LText[] = [
  loc(
    '任何电学测量都是同一个套路：给被测对象加一个已知的量（电压或电流），读另一个量，再用欧姆定律换算。万用表、电源、示波器是台面上的工具；ATE 把它们缩小、复制几百份、交给程序控制。',
    'Every electrical measurement follows one pattern: apply a known quantity (voltage or current) to the device, read the other one, and convert with Ohm’s law. Multimeters, supplies and oscilloscopes are the bench tools; ATE shrinks them, copies them hundreds of times and puts a program in charge.',
  ),
  loc(
    '这一课的几个坑——表接错、表本身影响电路、引线电阻、示波器读格子——到了 ATE 上一个不少，只是换了名字。',
    'The pitfalls in this lesson (wrong hookup, the meter disturbing the circuit, lead resistance, reading scope divisions) all reappear on ATE under different names.',
  ),
]

export const R_VALUES = [10, 47, 100, 220, 470, 1000, 2200, 4700, 10000]

export type HookId = 'vOk' | 'vSeries' | 'aOk' | 'aShort' | 'ohmLive'

export const HOOKS: Array<{ id: HookId; label: LText; jack: 'v' | 'a'; tone: 'ok' | 'warn' | 'bad'; reading: LText; text: LText }> = [
  {
    id: 'vOk',
    label: loc('电压表并在电阻上', 'Voltmeter across R'),
    jack: 'v',
    tone: 'ok',
    reading: loc('5.00 V', '5.00 V'),
    text: loc(
      '正确。电压是两点之间的差，所以表要跨在电阻两端。电压表内阻约 10 MΩ，比 1 kΩ 大一万倍，几乎不分走电流，电路照常工作。',
      'Correct. Voltage is a difference between two points, so the meter goes across the resistor. Its input resistance of about 10 MΩ is ten thousand times the 1 kΩ, so it draws almost no current and the circuit works as before.',
    ),
  },
  {
    id: 'vSeries',
    label: loc('电压表串进回路', 'Voltmeter in series'),
    jack: 'v',
    tone: 'warn',
    reading: loc('≈ 5.00 V，但电流只剩 0.5 µA', '≈ 5.00 V, but only 0.5 µA flows'),
    text: loc(
      '错误。10 MΩ 串进回路，电流变成 5 V / 10 MΩ ≈ 0.5 µA，电路等于断开。表上显示的约 5 V 是电源电压，不是电阻上的电压。不会烧表，但读数没有意义。',
      'Wrong. With 10 MΩ in series the current drops to 5 V / 10 MΩ ≈ 0.5 µA, so the circuit is effectively open. The ~5 V shown is the supply voltage, not the voltage across the resistor. Nothing burns, but the reading means nothing.',
    ),
  },
  {
    id: 'aOk',
    label: loc('电流表串进回路', 'Ammeter in series'),
    jack: 'a',
    tone: 'ok',
    reading: loc('5.00 mA', '5.00 mA'),
    text: loc(
      '正确。电流要流过表才能被测到，所以把回路断开、把表串进去。电流表内阻很小（零点几欧到几欧），对 1 kΩ 回路几乎没影响。',
      'Correct. Current must flow through the meter to be measured, so the loop is broken and the meter inserted. Its resistance is tiny (a fraction of an ohm to a few ohms), so the 1 kΩ loop is barely affected.',
    ),
  },
  {
    id: 'aShort',
    label: loc('电流表并在电源上', 'Ammeter across the supply'),
    jack: 'a',
    tone: 'bad',
    reading: loc('保险丝熔断', 'Fuse blows'),
    text: loc(
      '危险。电流表内阻只有零点几欧，并在电源两端就是把电源短路：电流只受电源能力限制，可能上安培，表里的保险丝熔断，没有保险丝就烧表。',
      'Dangerous. The ammeter is a fraction of an ohm, so across the supply it is a short circuit: current is limited only by the supply and can reach amps, blowing the meter’s fuse, or the meter itself if there is no fuse.',
    ),
  },
  {
    id: 'ohmLive',
    label: loc('通电时测电阻', 'Ohmmeter on a live circuit'),
    jack: 'v',
    tone: 'bad',
    reading: loc('读数错乱', 'Garbage reading'),
    text: loc(
      '错误。欧姆档是表自己送出一个小电流再测电压来算电阻；电路通着电时外部电压叠加进来，读数完全不对，电压大了还会损坏表。测电阻前必须断电，最好把元件一端断开。',
      'Wrong. The ohms range works by sending its own small current and measuring the voltage; with the circuit powered, the external voltage adds in and the reading is meaningless, and a large voltage can damage the meter. Power off before measuring resistance, ideally with one end of the part lifted.',
    ),
  },
]

export const METERS = [
  { id: 'm10M', label: loc('10 MΩ（数字万用表）', '10 MΩ (digital multimeter)'), rin: 10e6 },
  { id: 'm1M', label: loc('1 MΩ（示波器探头 ×1）', '1 MΩ (scope probe ×1)'), rin: 1e6 },
  { id: 'm10k', label: loc('10 kΩ（廉价指针表）', '10 kΩ (cheap analogue meter)'), rin: 10e3 },
] as const

export type MeterId = (typeof METERS)[number]['id']

export const LOAD_TEXT = loc(
  '表的输入电阻 Rin 和下面那个 10 kΩ 并联，把它「变小」了，所以分到的电压变低。Rin 比被测电阻大 1000 倍，误差约 0.05%；两者相当时误差可达三分之一。ATE 测电压时也一样要考虑测量单元的输入阻抗。',
  'The meter’s input resistance Rin sits in parallel with the lower 10 kΩ and makes it smaller, so the divided voltage drops. With Rin 1000 times the resistor, the error is about 0.05%; when they are comparable the error can reach a third. ATE voltage measurement has to account for the measuring unit’s input impedance in the same way.',
)

export type KelvinId = 'two' | 'four'

export const KELVIN_TEXT: Record<KelvinId, LText> = {
  two: loc(
    '两线法：电压表在仪器这头测，1 A 电流流过两根引线，引线上的压降 2 × 0.2 Ω × 1 A = 0.4 V 也被算进去，读成 0.5 Ω，是真值的 5 倍。',
    'Two-wire: the voltmeter reads at the instrument end, and the 1 A current flows through both leads, so their drop of 2 × 0.2 Ω × 1 A = 0.4 V is included and the reading is 0.5 Ω, five times the true value.',
  ),
  four: loc(
    '四线法：一对线只管送电流（Force），另一对线直接接在电阻两端只管测电压（Sense）。电压表输入电阻极大，Sense 线上几乎没有电流，引线电阻上没有压降，读数就是真值 0.1 Ω。ATE 的 PMU 和电源都用 Force / Sense 这种接法，见 {@pmu}。',
    'Four-wire: one pair only carries current (force), the other pair connects right at the resistor and only senses voltage. The voltmeter’s input resistance is huge, so almost no current flows in the sense leads, their resistance drops no voltage, and the reading is the true 0.1 Ω. ATE PMUs and supplies use this force / sense connection, see {@pmu}.',
  ),
}

export const KELVIN_LABEL = {
  force: loc('Force 送电流', 'Force (current)'),
  sense: loc('Sense 测电压', 'Sense (voltage)'),
  lead: loc('引线 0.2 Ω', 'Lead 0.2 Ω'),
  dut: loc('被测 0.1 Ω', 'DUT 0.1 Ω'),
  cap: loc('黄色箭头是 1 A 电流的路径。电压表读的是它两根表笔之间的电压。', 'The yellow arrows are the 1 A current path. The voltmeter reads the voltage between its own two leads.'),
}

export const T_DIVS = [0.1, 0.2, 0.5, 1, 2]
export const V_DIVS = [0.5, 1, 2]

export const SCOPE_TEXT = loc(
  '读周期：数一个周期占几格，乘以时基。比如 0.2 ms/格 时一个周期占 5 格，5 × 0.2 ms = 1 ms，所以频率是 1 kHz。读幅度同理：高电平占几格 × 每格电压。时基太大，波形挤成一团；太小，一屏装不下一个周期。',
  'Reading period: count how many divisions one period spans and multiply by the timebase. At 0.2 ms/div one period is 5 divisions: 5 × 0.2 ms = 1 ms, so the frequency is 1 kHz. Amplitude works the same way: divisions of the high level × volts per division. Too slow a timebase crams the waveform together; too fast and one period does not fit on the screen.',
)

export const BENCH: Array<{ bench: LText; does: LText; ate: LText }> = [
  { bench: loc('直流电源', 'DC power supply'), does: loc('给芯片供电，限流保护', 'Powers the chip, with current limit'), ate: loc('DPS 器件电源', 'DPS (device power supply)') },
  { bench: loc('万用表', 'Multimeter'), does: loc('加电流测电压、加电压测电流', 'Force current / measure voltage, and vice versa'), ate: loc('PMU 参数测量单元', 'PMU (parametric measurement unit)') },
  { bench: loc('信号 / 码型发生器', 'Signal / pattern generator'), does: loc('在输入脚上送 0 / 1 波形', 'Drives 0 / 1 waveforms onto inputs'), ate: loc('数字通道驱动器 + 向量', 'Digital channel drivers + vectors') },
  { bench: loc('示波器 / 逻辑分析仪', 'Scope / logic analyser'), does: loc('在某个时刻看输出是高还是低', 'Checks whether an output is high or low at a given time'), ate: loc('比较器 + 选通（Strobe）', 'Comparators + strobe') },
  { bench: loc('人眼读数、记录', 'A person reads and records'), does: loc('判断合格与否', 'Decides pass or fail'), ate: loc('测试程序自动判 Pass / Fail、分 Bin', 'The test program judges pass / fail and bins automatically') },
]

export const BENCH_HEAD = {
  bench: loc('台式仪器', 'Bench instrument'),
  does: loc('做什么', 'What it does'),
  ate: loc('ATE 里叫', 'On ATE'),
}

export const BENCH_TEXT = loc(
  'ATE 把这些仪器每个管脚配一套、并行工作，一颗芯片几百项测试在几百毫秒内跑完，结果可重复。原理和这一课一模一样，所以先在台面上弄懂。ATE 的结构见 {@ate}、{@fIntro}。',
  'ATE gives every pin its own set of these instruments working in parallel, so hundreds of tests on one chip finish in a few hundred milliseconds, repeatably. The principles are exactly this lesson’s, which is why you learn them on the bench first. ATE architecture: {@ate}, {@fIntro}.',
)

export const TAKEAWAY: LText[] = [
  loc('V = I × R，P = V × I；电阻、导线都有功率上限。', 'V = I × R and P = V × I; resistors and wires all have power limits.'),
  loc('电压表并联、电流表串联；电流表并到电源上就是短路。测电阻先断电。', 'Voltmeters go in parallel, ammeters in series; an ammeter across a supply is a short. Power off before measuring resistance.'),
  loc('表的输入电阻要远大于被测电阻，否则表会把电压「拉低」。', 'A meter’s input resistance must be far larger than the circuit resistance, or it pulls the voltage down.'),
  loc('测小电阻用四线法：Force 送电流，Sense 测电压，引线电阻不进结果。', 'Measure small resistances four-wire: force carries current, sense reads voltage, and lead resistance drops out.'),
  loc('示波器：格数 × 每格的值 = 实际值。', 'Oscilloscope: divisions × value per division = actual value.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('5 V 加在 100 Ω 上，电阻功率多少？1/4 W 电阻行不行？', '5 V across 100 Ω: what is the power, and is a 1/4 W resistor OK?'),
    options: [
      { id: 'a', text: loc('0.05 W，可以', '0.05 W, fine') },
      { id: 'b', text: loc('0.25 W，刚好到上限，不留余量', '0.25 W, exactly at the limit with no margin') },
      { id: 'c', text: loc('2.5 W，会烧', '2.5 W, it burns') },
    ],
    answer: 'b',
    explain: loc('P = V² / R = 25 / 100 = 0.25 W。正好在额定值，实际设计要留余量，应选 1/2 W 以上。', 'P = V² / R = 25 / 100 = 0.25 W, right at the rating; real designs need margin, so pick 1/2 W or more.'),
  },
  {
    id: 'q2',
    prompt: loc('把电流表直接并在 5 V 电源两端会怎样？', 'What happens if an ammeter is placed directly across a 5 V supply?'),
    options: [
      { id: 'a', text: loc('读到 5 V', 'It reads 5 V') },
      { id: 'b', text: loc('相当于短路，保险丝熔断或烧表', 'It is a short circuit; the fuse blows or the meter burns') },
      { id: 'c', text: loc('读到 0 mA', 'It reads 0 mA') },
    ],
    answer: 'b',
    explain: loc('电流表内阻很小，电流只受电源能力限制。', 'An ammeter has very low resistance, so current is limited only by the supply.'),
  },
  {
    id: 'q3',
    prompt: loc('用 10 kΩ 内阻的表测 10 kΩ + 10 kΩ 分压的中点（10 V 输入），读到？', 'A meter with 10 kΩ input resistance measures the midpoint of a 10 kΩ + 10 kΩ divider from 10 V. What does it read?'),
    options: [
      { id: 'a', text: loc('5.00 V', '5.00 V') },
      { id: 'b', text: loc('约 3.33 V', 'About 3.33 V') },
      { id: 'c', text: loc('10 V', '10 V') },
    ],
    answer: 'b',
    explain: loc('下面变成 10 kΩ ∥ 10 kΩ = 5 kΩ，10 V × 5 / 15 ≈ 3.33 V。', 'The lower leg becomes 10 kΩ ∥ 10 kΩ = 5 kΩ, so 10 V × 5 / 15 ≈ 3.33 V.'),
  },
  {
    id: 'q4',
    prompt: loc('四线法为什么能消除引线电阻？', 'Why does four-wire measurement remove lead resistance?'),
    options: [
      { id: 'a', text: loc('Sense 线几乎没有电流，引线上没有压降', 'Almost no current flows in the sense leads, so they drop no voltage') },
      { id: 'b', text: loc('四根线电阻互相抵消', 'The four leads cancel each other') },
      { id: 'c', text: loc('四线法用的电流更小', 'Four-wire uses less current') },
    ],
    answer: 'a',
    explain: loc('压降 = 电流 × 电阻，Sense 线电流约为 0，压降就约为 0。', 'Drop = current × resistance; with ~0 current in the sense leads, the drop is ~0.'),
  },
  {
    id: 'q5',
    prompt: loc('示波器 0.5 ms/格，一个周期占 4 格，信号频率是？', 'At 0.5 ms/div one period spans 4 divisions. What is the frequency?'),
    options: [
      { id: 'a', text: loc('500 Hz', '500 Hz') },
      { id: 'b', text: loc('2 kHz', '2 kHz') },
      { id: 'c', text: loc('4 kHz', '4 kHz') },
    ],
    answer: 'a',
    explain: loc('周期 = 4 × 0.5 ms = 2 ms，频率 = 1 / 2 ms = 500 Hz。', 'Period = 4 × 0.5 ms = 2 ms; frequency = 1 / 2 ms = 500 Hz.'),
  },
]
