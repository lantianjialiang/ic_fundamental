import { loc, type LText } from '../../../i18n/locale'

export const S2 = {
  kickerTg: loc('传输门与三态', 'Pass gate and tri-state'),
  kickerCombo: loc('组合逻辑', 'Combinational logic'),
  tgTitle: loc('传输门与三态门', 'Transmission gate and tri-state buffer'),
  tgNote: loc(
    '选一个电路。传输门：切换 C，拖 Vin 看哪只管子在导通、导通电阻怎么变。三态门：点 EN 和 A，看输出什么时候变成高阻。',
    'Pick a circuit. Transmission gate: switch C and drag Vin to see which transistor conducts and how the on-resistance changes. Tri-state: click EN and A to see when the output becomes high-Z.',
  ),
  vin: loc('输入电压 Vin', 'Input voltage Vin'),
  ctrl: loc('控制', 'Control'),
  ctrlOn: loc('C = 1（传输）', 'C = 1 (pass)'),
  ctrlOff: loc('C = 0（断开）', 'C = 0 (open)'),
  nState: loc('NMOS', 'NMOS'),
  pState: loc('PMOS', 'PMOS'),
  ron: loc('通路电阻 Ron', 'Path resistance Ron'),
  vout: loc('输出 OUT', 'Output OUT'),
  on: loc('导通', 'On'),
  off: loc('关断', 'Off'),
  hiz: loc('高阻 Z（浮空）', 'High-Z (floating)'),
  comboTitle: loc('用传输门搭异或和 2:1 多路选择器', 'XOR and a 2:1 multiplexer from transmission gates'),
  comboNote: loc(
    '切换电路，再点输入。每次只有一个传输门导通；导通那一路的线按电平着色（金 = 1，蓝 = 0）。',
    'Switch the circuit, then click the inputs. Only one transmission gate conducts at a time; the conducting path is coloured by its level (gold = 1, blue = 0).',
  ),
  gateOn: loc('导通的传输门', 'Conducting TG'),
  none: loc('无', 'none'),
  chartTitle: loc('通路电阻 Ron（Ω）', 'Path resistance Ron (Ω)'),
  legendN: loc('NMOS', 'NMOS'),
  legendP: loc('PMOS', 'PMOS'),
  legendT: loc('并联合计', 'Parallel total'),
  nBand: loc('NMOS 能导通', 'NMOS can conduct'),
  pBand: loc('PMOS 能导通', 'PMOS can conduct'),
}

export type TgKind = 'tg' | 'tri'

export const TG_ITEMS: Array<{ id: TgKind; label: LText; title: LText; text: LText; detail: LText }> = [
  {
    id: 'tg',
    label: loc('传输门', 'Transmission gate'),
    title: loc('传输门：NMOS 与 PMOS 并联，栅极互补', 'Transmission gate: NMOS and PMOS in parallel, complementary gates'),
    text: loc(
      'NMOS 和 PMOS 并联，栅极接互补的 C 和 ¬C。C = 1 时两只管子都具备导通条件，OUT 跟随 IN；C = 0 时两只都关断，OUT 与 IN 断开。它是双向的，IN 和 OUT 可以互换。',
      'An NMOS and a PMOS in parallel, with gates on complementary C and ¬C. With C = 1 both transistors can conduct and OUT follows IN; with C = 0 both are off and OUT is disconnected from IN. It is bidirectional: IN and OUT can swap roles.',
    ),
    detail: loc(
      '为什么传好 0 也传好 1：NMOS 传 1 时 Vgs = VDD − Vout 越来越小，到 Vout = VDD − Vtn 就关断，只能传到 2.6 V；PMOS 传 0 时 Vsg = Vout 越来越小，到 |Vtp| 就关断，只能传到 0.7 V。并联后，低端由 NMOS 传、高端由 PMOS 传，0.7 V 到 2.6 V 之间两只一起导通，整个 0 到 VDD 都有通路。代价是要 C 和 ¬C 两根控制线（¬C 要一个反相器），面积比单管大；教学模型忽略体效应，真实器件中间段电阻会比图里更高。关断时 OUT 浮空，只靠负载电容暂时保持电压。',
      'Why it passes both a good 0 and a good 1: when an NMOS passes a 1, Vgs = VDD − Vout keeps shrinking and it turns off at Vout = VDD − Vtn, so it only reaches 2.6 V; when a PMOS passes a 0, Vsg = Vout keeps shrinking and it turns off at |Vtp|, so it only reaches 0.7 V. In parallel, the NMOS carries the low end and the PMOS the high end, and between 0.7 V and 2.6 V both conduct, so the whole range 0 to VDD has a path. The cost is two control lines, C and ¬C (¬C needs an inverter), so it is bigger than a single device; the teaching model ignores the body effect, and in a real device the middle of the range has a higher resistance than the chart shows. When off, OUT floats and only the load capacitance briefly holds the voltage.',
    ),
  },
  {
    id: 'tri',
    label: loc('三态门', 'Tri-state'),
    title: loc('三态门：EN = 0 时输出高阻', 'Tri-state: high-Z when EN = 0'),
    text: loc(
      'EN = 1 时 ¬EN = 0，靠近电源和地的两只使能管都导通，电路就是一个反相器：Y = ¬A。EN = 0 时，上拉里的 PMOS（栅极 ¬EN）和下拉里的 NMOS（栅极 EN）都关断，OUT 既不通 VDD 也不通 GND，浮空，称为高阻 Z。',
      'With EN = 1, ¬EN = 0 and the two enable transistors next to the rails both conduct, so the circuit is an inverter: Y = ¬A. With EN = 0 the PMOS in the pull-up (gate ¬EN) and the NMOS in the pull-down (gate EN) are both off, so OUT connects to neither VDD nor GND: it floats, called high-Z.',
    ),
    detail: loc(
      '高阻让多个输出并到同一根总线，每次只让一个 EN = 1；两个驱动同时使能且输出相反，就是总线冲突，VDD 经两个驱动直通 GND，电流很大。图中是反相型三态门，在 A 前面加一个反相器就是同相的三态缓冲器。测试时高阻态的漏电用 IOZ 测（{@fDc}），三态输出的期望值要写成“高阻”向量（{@func}）。',
      'High-Z lets several outputs share one bus, with only one EN = 1 at a time; two drivers enabled with opposite outputs is bus contention, a heavy current from VDD through both drivers to GND. The figure shows an inverting tri-state gate; an inverter in front of A makes it a non-inverting tri-state buffer. In test the leakage in the high-Z state is measured as IOZ ({@fDc}), and the expected value of a tri-state output is written as a high-Z vector ({@func}).',
    ),
  },
]

export const TG_REASON = {
  open: loc(
    'C = 0：NMOS 栅极为 0、PMOS 栅极为 VDD，两只都没有沟道，OUT 与 IN 之间没有通路，OUT 浮空（高阻）。',
    'C = 0: the NMOS gate is at 0 and the PMOS gate at VDD, so neither has a channel and there is no path between IN and OUT: OUT floats (high-Z).',
  ),
  low: loc(
    'Vin 低于 |Vtp|：PMOS 的 Vsg = Vin 不够，关断；NMOS 的 Vgs = VDD − Vin 很大，导通。低电平靠 NMOS 传，一直能传到 0 V。',
    'Vin below |Vtp|: the PMOS has Vsg = Vin, too small, so it is off; the NMOS has a large Vgs = VDD − Vin and conducts. The low level is carried by the NMOS, all the way to 0 V.',
  ),
  high: loc(
    'Vin 高于 VDD − Vtn：NMOS 的 Vgs = VDD − Vin 不够，关断；PMOS 的 Vsg = Vin 很大，导通。高电平靠 PMOS 传，一直能传到 VDD。',
    'Vin above VDD − Vtn: the NMOS has Vgs = VDD − Vin, too small, so it is off; the PMOS has a large Vsg = Vin and conducts. The high level is carried by the PMOS, all the way to VDD.',
  ),
  mid: loc(
    'Vin 在 |Vtp| 和 VDD − Vtn 之间：两只管子都导通，电导相加（Ron 是两个电阻并联），整段电压都有通路。',
    'Vin between |Vtp| and VDD − Vtn: both transistors conduct and their conductances add (Ron is the two resistances in parallel), so the whole voltage range has a path.',
  ),
}

export type ComboKind = 'mux' | 'xor'

export const COMBO_ITEMS: Array<{ id: ComboKind; label: LText; title: LText; text: LText; detail: LText }> = [
  {
    id: 'mux',
    label: loc('2:1 多路选择器', '2:1 multiplexer'),
    title: loc('2:1 多路选择器：两个传输门，一个选择端', '2:1 multiplexer: two transmission gates, one select'),
    text: loc(
      'S = 0 时 TG0 导通、TG1 断开，Y = A；S = 1 时 TG1 导通、TG0 断开，Y = B。两个传输门的控制刚好互补，每次只有一个导通，Y 不会同时被 A 和 B 驱动。',
      'With S = 0, TG0 conducts and TG1 is open, so Y = A; with S = 1, TG1 conducts and TG0 is open, so Y = B. The two controls are exactly complementary, so only one gate conducts and Y is never driven by A and B at once.',
    ),
    detail: loc(
      '管子数：2 个传输门 4 只，加一个产生 ¬S 的反相器 2 只，共 6 只，比用与门、或门搭要少。Y 是 A 或 B 经传输门直接传过来的，驱动能力来自它们的前级，所以常在 Y 后面再接一个反相器隔离。',
      'Transistor count: 2 transmission gates take 4, plus 2 for the inverter making ¬S, 6 in all, fewer than building it from AND and OR gates. Y is passed straight through from A or B, so its drive strength comes from their driver stages; an inverter is often added after Y to isolate it.',
    ),
  },
  {
    id: 'xor',
    label: loc('异或 XOR', 'XOR'),
    title: loc('异或：用 A 当选择端的多路选择器', 'XOR: a multiplexer with A as the select'),
    text: loc(
      'A = 0 时 TG0 导通，Y = B；A = 1 时 TG1 导通，Y = ¬B。A 为 0 时输出等于 B，A 为 1 时输出是 B 的反，这正是 A ⊕ B：两个输入不同时输出 1。',
      'With A = 0, TG0 conducts and Y = B; with A = 1, TG1 conducts and Y = ¬B. When A is 0 the output equals B and when A is 1 it is the inverse of B, which is exactly A ⊕ B: the output is 1 when the inputs differ.',
    ),
    detail: loc(
      '管子数：2 个传输门 4 只，加 2 个反相器（产生 ¬A 和 ¬B）4 只，共 8 只。用 NAND 搭 XOR 要 4 个 NAND2，共 16 只，传输门版省一半。真值表见 {@pDigital}。',
      'Transistor count: 2 transmission gates take 4, plus 2 inverters (making ¬A and ¬B) for 4 more, 8 in all. Building XOR from NAND needs four NAND2 gates, 16 transistors, so the transmission-gate version halves it. The truth table is in {@pDigital}.',
    ),
  },
]
