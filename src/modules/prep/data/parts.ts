import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const S = {
  kickerPart: loc('元器件', 'Component'),
  kickerDemo: loc('特性', 'Behaviour'),
  introTitle: loc('为什么测试工程师要认识这些小零件', 'Why a test engineer needs to know these small parts'),
  galleryTitle: loc('符号和实物对照', 'Symbols next to the real parts'),
  galleryNote: loc('选一个元件：左边是原理图符号，右边是实物外形和极性标记。', 'Pick a component: the schematic symbol is on the left, the real part and its polarity marks on the right.'),
  symbol: loc('原理图符号', 'Schematic symbol'),
  real: loc('实物（示意）', 'Real part (sketch)'),
  onBoard: loc('在测试里：', 'In test: '),
  demoTitle: loc('四个元件的「脾气」', 'How four components behave'),
  demoNote: loc('选一个元件，拖动滑块看曲线上的工作点怎么走。', 'Pick a component and drag the slider to move the operating point along its curve.'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('芯片管脚上的保护二极管怎么用来做开短路测试，见 {@fOpens}；用 PMU 加电流测电压见 {@pmu}。', 'How the protection diodes on chip pins are used for opens/shorts test: {@fOpens}; forcing current and measuring voltage with the PMU: {@pmu}.'),
  next: loc('下一课：数字电路入门', 'Next: Digital basics'),
}

export const INTRO: LText[] = [
  loc(
    '测试机和芯片之间隔着一块负载板，上面全是电阻、电容、继电器；芯片每个管脚里面也藏着保护二极管和 MOS 管。不认识它们，就看不懂负载板原理图，也解释不了测出来的数。',
    'Between the tester and the chip sits a load board full of resistors, capacitors and relays, and every chip pin hides protection diodes and MOS transistors. Without knowing them you cannot read the load-board schematic or explain the numbers you measure.',
  ),
]

export type PartId = 'r' | 'c' | 'l' | 'd' | 'led' | 'npn' | 'nmos' | 'opamp'

export const PARTS: Array<{ id: PartId; title: LText; unit: LText; text: LText; mark: LText; test: LText }> = [
  {
    id: 'r',
    title: loc('电阻', 'Resistor'),
    unit: loc('单位 Ω（欧姆）', 'Unit: Ω (ohm)'),
    text: loc(
      '阻碍电流，电压和电流成正比：V = I × R。两头不分正负。上面是国标 / IEC 方框画法，下面是美标锯齿画法，意思一样。',
      'Opposes current; voltage is proportional to current: V = I × R. The two ends are interchangeable. The upper symbol is the IEC box, the lower is the US zigzag; they mean the same.',
    ),
    mark: loc(
      '插件电阻用色环读值：图中 黄-紫-红-金 = 47 × 10² Ω = 4.7 kΩ，±5%。贴片电阻印三位数：472 = 47 × 10² = 4.7 kΩ。',
      'Through-hole resistors are read from colour bands: yellow-violet-red-gold here = 47 × 10² Ω = 4.7 kΩ, ±5%. Chip resistors print three digits: 472 = 47 × 10² = 4.7 kΩ.',
    ),
    test: loc('负载板上用作上拉 / 下拉、限流和终端匹配；精密电阻用来校准电流测量。', 'On load boards they serve as pull-ups / pull-downs, current limiters and terminations; precision resistors calibrate current measurement.'),
  },
  {
    id: 'c',
    title: loc('电容', 'Capacitor'),
    unit: loc('单位 F（法拉），常用 pF、nF、µF', 'Unit: F (farad); usually pF, nF, µF'),
    text: loc(
      '两块极板中间隔着绝缘层，能存电荷。电压不能突变，所以能「稳住」电源；对直流是断开的，对高频交流像通路。',
      'Two plates separated by an insulator store charge. Its voltage cannot jump, so it steadies a supply; it blocks DC and looks like a path for high-frequency AC.',
    ),
    mark: loc(
      '陶瓷贴片电容不分极性。电解电容有极性：外壳上印白条的一侧是负极，负极引脚也更短，接反会鼓包甚至炸开。',
      'Ceramic chip capacitors have no polarity. Electrolytic capacitors do: the side with the printed stripe is negative and its lead is shorter. Reversed, they bulge or even burst.',
    ),
    test: loc('芯片电源脚旁边要放去耦电容，否则高速测试时电源噪声会让功能失败。', 'Decoupling capacitors sit next to chip supply pins; without them, supply noise during high-speed test causes functional failures.'),
  },
  {
    id: 'l',
    title: loc('电感', 'Inductor'),
    unit: loc('单位 H（亨利），常用 nH、µH', 'Unit: H (henry); usually nH, µH'),
    text: loc(
      '导线绕成的线圈，电流不能突变。和电容配合做滤波，开关电源里用来储能。',
      'A coil of wire; its current cannot jump. Paired with capacitors it filters, and switching power supplies use it to store energy.',
    ),
    mark: loc('一般不分极性。贴片功率电感常印数值，如 100 = 10 × 10⁰ µH = 10 µH。', 'Usually no polarity. Power chip inductors often print the value, e.g. 100 = 10 × 10⁰ µH = 10 µH.'),
    test: loc('测试路径上的走线、探针、Socket 针都带一点寄生电感，电流突变时会产生电压尖峰。', 'Traces, probe needles and socket pins in the test path all have a little parasitic inductance, which causes voltage spikes when current changes fast.'),
  },
  {
    id: 'd',
    title: loc('二极管', 'Diode'),
    unit: loc('正向压降约 0.6–0.7 V（硅）', 'Forward drop about 0.6–0.7 V (silicon)'),
    text: loc(
      '只让电流从阳极（A）流向阴极（K）。符号里三角形指向电流方向，竖线就是阴极。',
      'Lets current flow only from anode (A) to cathode (K). In the symbol the triangle points in the current direction and the bar is the cathode.',
    ),
    mark: loc('管身上有一圈色带的一端是阴极，对应符号里的竖线。', 'The end with a painted band is the cathode, matching the bar in the symbol.'),
    test: loc(
      '每个芯片管脚都有接到电源和地的保护二极管。开短路测试就是给管脚灌一个小电流，看二极管压降是不是 0.6 V 左右，见 {@fOpens}。',
      'Every chip pin has protection diodes to the supply and to ground. Opens/shorts test forces a small current into the pin and checks that the diode drop is about 0.6 V, see {@fOpens}.',
    ),
  },
  {
    id: 'led',
    title: loc('发光二极管 LED', 'LED'),
    unit: loc('正向压降约 1.8–3.3 V（看颜色）', 'Forward drop about 1.8–3.3 V (depends on colour)'),
    text: loc('通电时发光的二极管，同样只能单向导通。符号是二极管加两个向外的箭头。必须串电阻限流。', 'A diode that emits light when conducting, also one-way. The symbol is a diode with two outward arrows. It needs a series resistor to limit current.'),
    mark: loc('长脚是阳极；短脚、以及外壳底边被削平的那一侧是阴极。', 'The longer lead is the anode; the shorter lead, on the side where the rim is flattened, is the cathode.'),
    test: loc('测试板上常用 LED 显示通电、测试中、Pass / Fail 状态。', 'Test boards often use LEDs to show power, test running and pass / fail.'),
  },
  {
    id: 'npn',
    title: loc('三极管 NPN', 'NPN transistor'),
    unit: loc('基极小电流控制集电极大电流', 'A small base current controls a large collector current'),
    text: loc(
      '三个脚：基极 B、集电极 C、发射极 E。发射极上的箭头指向外面就是 NPN（指向里面是 PNP）。',
      'Three pins: base B, collector C, emitter E. An emitter arrow pointing outward means NPN (pointing in means PNP).',
    ),
    mark: loc('TO-92 封装平面朝自己，引脚从左到右编号 1、2、3。每个脚是 E、B 还是 C 因型号而异（2N3904 是 E-B-C），必须查数据手册。', 'With the flat face of the TO-92 toward you, pins are 1, 2, 3 from left to right. Which is E, B or C depends on the part (2N3904 is E-B-C); always check the datasheet.'),
    test: loc('负载板上常用来驱动继电器线圈：测试机的数字口电流太小，靠三极管放大。', 'Load boards often use them to drive relay coils: a tester digital pin cannot supply enough current, so the transistor amplifies it.'),
  },
  {
    id: 'nmos',
    title: loc('MOS 管 NMOS', 'NMOS transistor'),
    unit: loc('栅极电压控制，栅极几乎不取电流', 'Controlled by gate voltage; the gate draws almost no current'),
    text: loc(
      '三个脚：栅极 G、漏极 D、源极 S。栅源电压 VGS 超过阈值 Vth 才导通，像一个电压控制的开关。芯片里的逻辑门就是由成对的 NMOS 和 PMOS 组成的。',
      'Three pins: gate G, drain D, source S. It turns on only when the gate-source voltage VGS exceeds the threshold Vth, like a voltage-controlled switch. Logic gates inside chips are built from pairs of NMOS and PMOS.',
    ),
    mark: loc('SOT-23 封装常见引脚是 1 = G、2 = S、3 = D，但也有例外，以数据手册为准。符号里箭头指向沟道的是 NMOS。', 'In SOT-23 the common pinout is 1 = G, 2 = S, 3 = D, but there are exceptions; check the datasheet. In the symbol, an arrow pointing into the channel means NMOS.'),
    test: loc('芯片的输出驱动就是 MOS 管。输出电压、驱动电流、漏电流这些直流参数，测的就是它们，见 {@dc}。', 'Chip output drivers are MOS transistors. DC parameters such as output voltage, drive current and leakage measure exactly these, see {@dc}.'),
  },
  {
    id: 'opamp',
    title: loc('运算放大器', 'Op-amp'),
    unit: loc('放大两个输入之差', 'Amplifies the difference between its two inputs'),
    text: loc('一个三角形：两个输入（+ 同相、− 反相），一个输出，另外还要接正负电源。配上电阻能做放大、比较、缓冲。', 'A triangle with two inputs (+ non-inverting, − inverting) and one output, plus positive and negative supplies. With resistors it amplifies, compares or buffers.'),
    mark: loc('常见双运放（如 LM358）SOP-8：1 OUT A、2 IN− A、3 IN+ A、4 V−、8 V+。1 脚在圆点旁，逆时针数。', 'A common dual op-amp (such as LM358) in SOP-8: 1 OUT A, 2 IN− A, 3 IN+ A, 4 V−, 8 V+. Pin 1 is next to the dot; count counterclockwise.'),
    test: loc('测试机的电压源、电流测量电路里面都是运放。规格里的失调电压、带宽也是它的参数，见 {@spec}。', 'The tester’s voltage sources and current-measurement circuits are built around op-amps. Offset voltage and bandwidth in a spec are op-amp parameters, see {@spec}.'),
  },
]

export type DemoId = 'r' | 'rc' | 'd' | 'mos'

export const DEMOS: Array<{ id: DemoId; label: LText; knob: LText; text: LText }> = [
  {
    id: 'r',
    label: loc('电阻 V–I', 'Resistor V–I'),
    knob: loc('外加电压 V', 'Applied voltage V'),
    text: loc(
      '电阻的电流和电压是一条过原点的直线，斜率是 1/R。R 越大，同样的电压下电流越小，线越平。',
      'A resistor’s current versus voltage is a straight line through the origin with slope 1/R. The larger R, the smaller the current at the same voltage, so the flatter the line.',
    ),
  },
  {
    id: 'rc',
    label: loc('RC 充电', 'RC charging'),
    knob: loc('时间 t / τ', 'Time t / τ'),
    text: loc(
      '电阻给电容充电，电压按指数上升：1τ 到 63.2%，3τ 到 95.0%，5τ 到 99.3%。τ = R × C。所以测试程序在电源上电、继电器切换后要等够时间再测。',
      'Charging a capacitor through a resistor raises its voltage exponentially: 63.2% at 1τ, 95.0% at 3τ, 99.3% at 5τ, where τ = R × C. That is why a test program waits long enough after power-up or relay switching before measuring.',
    ),
  },
  {
    id: 'd',
    label: loc('二极管 I–V', 'Diode I–V'),
    knob: loc('正向电压 V', 'Forward voltage V'),
    text: loc(
      '低于约 0.5 V 几乎没有电流；过了「膝点」电流按指数暴涨，每多 60 mV 大约 ×10。所以二极管两端电压基本卡在 0.6–0.7 V。反向只有极小的漏电流。',
      'Below about 0.5 V there is almost no current; past the knee, current rises exponentially, about ×10 for every 60 mV. So a conducting diode stays at roughly 0.6–0.7 V. In reverse only a tiny leakage flows.',
    ),
  },
  {
    id: 'mos',
    label: loc('MOS 开关', 'MOS switch'),
    knob: loc('栅源电压 VGS', 'Gate-source voltage VGS'),
    text: loc(
      'VGS 低于阈值 Vth（这里取 1 V）时管子关断，几乎没有电流；超过以后电流随 (VGS − Vth)² 增大。数字电路只用两头：全关和全开。',
      'Below the threshold Vth (1 V here) the transistor is off and almost no current flows; above it, current grows with (VGS − Vth)². Digital circuits use only the two ends: fully off and fully on.',
    ),
  },
]

export const DEMO_LABEL = {
  current: loc('电流', 'Current'),
  voltage: loc('电压', 'Voltage'),
  vc: loc('电容电压', 'Capacitor voltage'),
  state: loc('状态', 'State'),
  on: loc('导通', 'On'),
  off: loc('关断', 'Off'),
  illustr: loc('示意参数：Is = 10⁻¹⁴ A；MOS 的 Vth = 1 V，ID = 1 mA/V² × (VGS − Vth)²。', 'Illustrative values: Is = 10⁻¹⁴ A; MOS Vth = 1 V, ID = 1 mA/V² × (VGS − Vth)².'),
}

export const TAKEAWAY: LText[] = [
  loc('电阻 V = IR，不分正负；电容电压不能突变，电感电流不能突变。', 'Resistor: V = IR, no polarity. A capacitor’s voltage cannot jump; an inductor’s current cannot jump.'),
  loc('二极管从 A 到 K 单向导通，带色环 / 竖线的是阴极；导通时压降约 0.6–0.7 V。', 'A diode conducts only from A to K; the band / bar is the cathode, and the drop when conducting is about 0.6–0.7 V.'),
  loc('电解电容白条是负极；LED 长脚是阳极。接反会坏。', 'An electrolytic’s stripe marks negative; an LED’s long lead is the anode. Reversed, they fail.'),
  loc('MOS 管是电压控制的开关，芯片的逻辑门和输出驱动都由它组成。', 'A MOS transistor is a voltage-controlled switch; chip logic gates and output drivers are built from it.'),
  loc('三极管和 MOS 管的引脚顺序因型号而异，一定查数据手册。', 'Transistor pinouts vary by part; always check the datasheet.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('色环 黄-紫-红-金 的电阻是多少？', 'What is a resistor with bands yellow-violet-red-gold?'),
    options: [
      { id: 'a', text: loc('472 Ω', '472 Ω') },
      { id: 'b', text: loc('4.7 kΩ ±5%', '4.7 kΩ ±5%') },
      { id: 'c', text: loc('47 kΩ', '47 kΩ') },
    ],
    answer: 'b',
    explain: loc('黄 4、紫 7、红 ×10²，金 ±5%：47 × 100 = 4700 Ω。', 'Yellow 4, violet 7, red ×10², gold ±5%: 47 × 100 = 4700 Ω.'),
  },
  {
    id: 'q2',
    prompt: loc('二极管符号里的竖线代表？', 'What does the bar in a diode symbol stand for?'),
    options: [
      { id: 'a', text: loc('阳极', 'Anode') },
      { id: 'b', text: loc('阴极', 'Cathode') },
      { id: 'c', text: loc('接地', 'Ground') },
    ],
    answer: 'b',
    explain: loc('三角形指向电流方向，电流流进竖线那一端，就是阴极；实物上对应色带。', 'The triangle points the way current flows, into the bar end, which is the cathode; on the part it matches the band.'),
  },
  {
    id: 'q3',
    prompt: loc('RC 电路充电到约 95% 需要多久？', 'How long does an RC circuit take to charge to about 95%?'),
    options: [
      { id: 'a', text: loc('1τ', '1τ') },
      { id: 'b', text: loc('3τ', '3τ') },
      { id: 'c', text: loc('10τ', '10τ') },
    ],
    answer: 'b',
    explain: loc('1 − e⁻³ ≈ 95.0%。', '1 − e⁻³ ≈ 95.0%.'),
  },
  {
    id: 'q4',
    prompt: loc('开短路测试里，往管脚灌小电流，读到约 0.6 V，说明什么？', 'In opens/shorts test, forcing a small current into a pin reads about 0.6 V. What does that mean?'),
    options: [
      { id: 'a', text: loc('管脚的保护二极管正常导通，连接是好的', 'The pin’s protection diode conducts normally, so the connection is good') },
      { id: 'b', text: loc('管脚短路到地', 'The pin is shorted to ground') },
      { id: 'c', text: loc('管脚开路', 'The pin is open') },
    ],
    answer: 'a',
    explain: loc('短路会读到接近 0 V，开路电压会冲到钳位上限；0.6 V 左右正是一个硅二极管的压降。', 'A short reads near 0 V and an open rises to the clamp limit; about 0.6 V is exactly one silicon diode drop.'),
  },
  {
    id: 'q5',
    prompt: loc('NMOS 的 VGS 低于阈值电压时？', 'What happens when an NMOS has VGS below threshold?'),
    options: [
      { id: 'a', text: loc('关断，几乎没有漏极电流', 'It is off, with almost no drain current') },
      { id: 'b', text: loc('电流最大', 'Current is at its maximum') },
      { id: 'c', text: loc('栅极电流很大', 'The gate current is large') },
    ],
    answer: 'a',
    explain: loc('没有足够的栅压就形成不了沟道；栅极本身是绝缘的，几乎不取电流。', 'Without enough gate voltage no channel forms; the gate itself is insulated and draws almost no current.'),
  },
]
