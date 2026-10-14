import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const S = {
  kickerBits: loc('二进制', 'Binary'),
  kickerGate: loc('逻辑门', 'Logic gate'),
  kickerShift: loc('移位寄存器', 'Shift register'),
  kickerLevel: loc('电平', 'Logic level'),
  introTitle: loc('数字电路只认两种状态', 'Digital circuits know only two states'),
  bitsTitle: loc('8 个开关 = 一个字节', 'Eight switches = one byte'),
  bitsNote: loc('点每一位在 0 和 1 之间切换。最左边是最高位（权重 128），最右边是最低位（权重 1）。', 'Click a bit to toggle it between 0 and 1. The leftmost is the most significant bit (weight 128), the rightmost the least (weight 1).'),
  dec: loc('十进制', 'Decimal'),
  hex: loc('十六进制', 'Hexadecimal'),
  bin: loc('二进制', 'Binary'),
  clear: loc('清零', 'Clear'),
  gateTitle: loc('逻辑门：输入决定输出', 'Logic gates: inputs decide the output'),
  gateNote: loc('选一种门，点图里的 A、B 切换输入，或者点真值表的一行。金色线表示 1（高电平）。', 'Pick a gate and click A or B in the figure to toggle inputs, or click a row of the truth table. Gold wires mean 1 (high).'),
  adderTitle: loc('两个门拼成一个加法器', 'Two gates make an adder'),
  adderNote: loc('半加器：和 S = A 异或 B，进位 C = A 与 B。点 A、B 试 1 + 1。', 'Half adder: sum S = A XOR B, carry C = A AND B. Click A and B to try 1 + 1.'),
  shiftTitle: loc('触发器串成一串：移位寄存器', 'Flip-flops in a chain: the shift register'),
  shiftNote: loc(
    '设好输入，按「时钟」：每来一个时钟上升沿，每个触发器把左边的值存进来，数据整体右移一格。',
    'Set the input and press Clock: on each rising clock edge every flip-flop stores the value on its left, so the data shifts one place right.',
  ),
  clock: loc('时钟 ↑', 'Clock ↑'),
  reset: loc('全部清零', 'Reset all'),
  clocks: loc('已打时钟', 'Clocks applied'),
  levelTitle: loc('电压怎么变成 0 和 1', 'How a voltage becomes 0 or 1'),
  levelNote: loc('以 3.3 V LVTTL 输入为例，拖动输入电压。', 'Using a 3.3 V LVTTL input, drag the input voltage.'),
  vin: loc('输入电压', 'Input voltage'),
  reads: loc('芯片读到', 'Chip reads'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('输入输出电平怎么测：{@dc}、{@fDc}；向量和功能测试：{@vector}、{@func}。', 'Measuring input and output levels: {@dc}, {@fDc}; vectors and functional test: {@vector}, {@func}.'),
  next: loc('下一课：测量基础', 'Next: Measurement basics'),
}

export const INTRO: LText[] = [
  loc(
    '芯片里的数字电路只区分两种电压：高（记作 1）和低（记作 0）。一个 0/1 叫一位（bit），8 位叫一个字节（byte）。所有数字、指令、图片，最后都是一串 0 和 1。',
    'Digital circuits inside a chip tell apart only two voltages: high (written 1) and low (written 0). One 0/1 is a bit, and eight bits are a byte. Every number, instruction and image ends up as a string of 0s and 1s.',
  ),
  loc(
    '功能测试做的事情，就是在输入脚上按节拍送 0 和 1，再看输出脚上的 0 和 1 对不对。所以先把 0/1 和逻辑门弄清楚。数字测试的完整入门见 {@fBasics}。',
    'Functional test does exactly this: drive 0s and 1s onto the input pins in step with a clock, and check that the 0s and 1s on the outputs are right. So first get comfortable with bits and gates. The full introduction to digital test is {@fBasics}.',
  ),
]

export const BITS_TEXT = loc(
  '每一位的权重是 2 的幂：128、64、32、16、8、4、2、1。把是 1 的那些位的权重加起来就是十进制值。十六进制每 4 位写成一个符号（0–9、A–F），测试向量里常用它，因为短。',
  'Each bit has a power-of-two weight: 128, 64, 32, 16, 8, 4, 2, 1. Add the weights of the bits that are 1 to get the decimal value. Hexadecimal writes each group of 4 bits as one symbol (0–9, A–F); test vectors use it because it is short.',
)

export type GateId = 'not' | 'and' | 'or' | 'nand' | 'nor' | 'xor'

export const GATES: Array<{ id: GateId; name: string; rule: LText; text: LText }> = [
  {
    id: 'not',
    name: 'NOT',
    rule: loc('Y = 非 A', 'Y = NOT A'),
    text: loc('反相器：输出和输入相反。符号是三角形加一个小圆圈，小圆圈就表示「取反」。', 'Inverter: the output is the opposite of the input. The symbol is a triangle with a small circle; the circle means “invert”.'),
  },
  {
    id: 'and',
    name: 'AND',
    rule: loc('Y = A 与 B', 'Y = A AND B'),
    text: loc('与门：A 和 B 都是 1，输出才是 1。像两个串联的开关。', 'AND gate: output is 1 only when both A and B are 1, like two switches in series.'),
  },
  {
    id: 'or',
    name: 'OR',
    rule: loc('Y = A 或 B', 'Y = A OR B'),
    text: loc('或门：A、B 有一个是 1，输出就是 1。像两个并联的开关。', 'OR gate: output is 1 when either A or B is 1, like two switches in parallel.'),
  },
  {
    id: 'nand',
    name: 'NAND',
    rule: loc('Y = 非（A 与 B）', 'Y = NOT (A AND B)'),
    text: loc(
      '与非门：与门后面加取反。CMOS 工艺里它只要 4 个晶体管，最省，所以芯片里大量用它；任何逻辑都能只用与非门搭出来。',
      'NAND gate: AND followed by inversion. In CMOS it needs only 4 transistors, the cheapest, so chips use it heavily; any logic can be built from NAND gates alone.',
    ),
  },
  {
    id: 'nor',
    name: 'NOR',
    rule: loc('Y = 非（A 或 B）', 'Y = NOT (A OR B)'),
    text: loc('或非门：或门后面加取反。只有 A、B 都是 0 时输出 1。', 'NOR gate: OR followed by inversion. Output is 1 only when both A and B are 0.'),
  },
  {
    id: 'xor',
    name: 'XOR',
    rule: loc('Y = A 异或 B', 'Y = A XOR B'),
    text: loc('异或门：A、B 不一样时输出 1。符号是或门前面多一条弧线。它正好是一位二进制加法的「和」。', 'XOR gate: output is 1 when A and B differ. The symbol is an OR gate with an extra curve at the back. It is exactly the sum bit of one-bit binary addition.'),
  },
]

export function evalGate(id: GateId, a: number, b: number) {
  if (id === 'not') {
    return a ? 0 : 1
  }
  if (id === 'and') {
    return a & b
  }
  if (id === 'or') {
    return a | b
  }
  if (id === 'nand') {
    return (a & b) ^ 1
  }
  if (id === 'nor') {
    return (a | b) ^ 1
  }
  return a ^ b
}

export const ADDER_TEXT = loc(
  '二进制里 1 + 1 = 10：这一位写 0，向高位进 1。半加器只管一位；把很多个（全）加法器串起来就是 CPU 里的加法电路，见 {@alu}。',
  'In binary 1 + 1 = 10: write 0 in this place and carry 1 to the next. A half adder handles one bit; chain many (full) adders and you get the adder inside a CPU, see {@alu}.',
)

export const SHIFT_TEXT: LText[] = [
  loc(
    'D 触发器只在时钟上升沿那一瞬间把 D 端的值存下来，其余时间输出 Q 保持不变。这就是「时序电路」：输出不仅看现在的输入，还看过去存了什么。',
    'A D flip-flop stores the value at D only at the instant of the rising clock edge; the rest of the time its output Q holds. That is a sequential circuit: the output depends not only on the present input but on what was stored before.',
  ),
  loc(
    '芯片里的 Scan 测试就是把成千上万个触发器临时串成这样的移位寄存器：从 Scan In 一位一位移进测试数据，打一拍功能时钟，再一位一位移出来看结果，见 {@scan}、{@fScan}。',
    'Scan test in a chip temporarily chains thousands of flip-flops into exactly this kind of shift register: shift test data in bit by bit from Scan In, apply one functional clock, then shift the result out bit by bit, see {@scan}, {@fScan}.',
  ),
]

export const LEVEL = {
  vil: 0.8,
  vih: 2.0,
  vdd: 3.3,
  low: loc('低电平 → 0', 'Low → 0'),
  high: loc('高电平 → 1', 'High → 1'),
  undef: loc('不确定区', 'Undefined'),
  undefRead: loc('不确定：可能读成 0 也可能读成 1', 'Undefined: may read as 0 or as 1'),
  cap: loc('3.3 V LVTTL 输入门限：VIL 最大 0.8 V，VIH 最小 2.0 V。', '3.3 V LVTTL input thresholds: VIL max 0.8 V, VIH min 2.0 V.'),
  text: loc(
    '输入电压低于 VIL（0.8 V）一定读成 0，高于 VIH（2.0 V）一定读成 1，中间不保证。对应地，输出要保证低电平不高于 VOL（0.4 V）、高电平不低于 VOH（2.4 V），两边各留 0.4 V 抗噪余量。测这些门限就是直流测试的一部分。',
    'Below VIL (0.8 V) an input is guaranteed to read 0, above VIH (2.0 V) guaranteed 1, and in between nothing is guaranteed. Correspondingly, outputs must keep low no higher than VOL (0.4 V) and high no lower than VOH (2.4 V), leaving 0.4 V of noise margin on each side. Measuring these thresholds is part of DC test.',
  ),
}

export const TAKEAWAY: LText[] = [
  loc('1 位 = 一个 0/1；8 位 = 1 字节；十六进制一个符号 = 4 位。', '1 bit = one 0/1; 8 bits = 1 byte; one hex symbol = 4 bits.'),
  loc('与：全 1 才 1；或：有 1 就 1；非：取反；异或：不同为 1。小圆圈表示取反。', 'AND: 1 only if all are 1; OR: 1 if any is 1; NOT: invert; XOR: 1 if they differ. A small circle means invert.'),
  loc('半加器 = 一个异或（和）+ 一个与（进位）。', 'Half adder = one XOR (sum) + one AND (carry).'),
  loc('触发器在时钟沿存数；串起来是移位寄存器，也就是 Scan 链的原型。', 'Flip-flops store on the clock edge; chained, they form a shift register, the prototype of a scan chain.'),
  loc('0 和 1 是按电压门限 VIL / VIH 判出来的，中间是不确定区。', '0 and 1 are decided by the VIL / VIH voltage thresholds, with an undefined zone in between.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('二进制 1010 1010 等于十六进制多少？', 'What is binary 1010 1010 in hexadecimal?'),
    options: [
      { id: 'a', text: loc('0xAA', '0xAA') },
      { id: 'b', text: loc('0x55', '0x55') },
      { id: 'c', text: loc('0x1010', '0x1010') },
    ],
    answer: 'a',
    explain: loc('每 4 位一组：1010 = A，所以是 AA（十进制 170）。', 'Group by 4 bits: 1010 = A, so AA (decimal 170).'),
  },
  {
    id: 'q2',
    prompt: loc('与非门（NAND）在什么情况下输出 0？', 'When does a NAND gate output 0?'),
    options: [
      { id: 'a', text: loc('A、B 都是 1', 'When A and B are both 1') },
      { id: 'b', text: loc('A、B 都是 0', 'When A and B are both 0') },
      { id: 'c', text: loc('A、B 不同', 'When A and B differ') },
    ],
    answer: 'a',
    explain: loc('与门只有全 1 输出 1，取反后就只有全 1 时输出 0。', 'AND outputs 1 only when all inputs are 1; inverted, NAND outputs 0 only then.'),
  },
  {
    id: 'q3',
    prompt: loc('半加器输入 A = 1、B = 1，输出是？', 'A half adder has A = 1, B = 1. What are the outputs?'),
    options: [
      { id: 'a', text: loc('S = 1，C = 0', 'S = 1, C = 0') },
      { id: 'b', text: loc('S = 0，C = 1', 'S = 0, C = 1') },
      { id: 'c', text: loc('S = 1，C = 1', 'S = 1, C = 1') },
    ],
    answer: 'b',
    explain: loc('1 + 1 = 10：本位 0，进位 1。', '1 + 1 = 10: this place 0, carry 1.'),
  },
  {
    id: 'q4',
    prompt: loc('4 位移位寄存器全是 0，输入一直给 1，打 2 个时钟后内容是？（从左到右 FF0–FF3）', 'A 4-bit shift register holds all 0s and the input is held at 1. After 2 clocks, what does it hold? (FF0–FF3 left to right)'),
    options: [
      { id: 'a', text: loc('1100', '1100') },
      { id: 'b', text: loc('0011', '0011') },
      { id: 'c', text: loc('1111', '1111') },
    ],
    answer: 'a',
    explain: loc('每个时钟从左边移进一个 1，两拍后前两个触发器是 1。', 'Each clock shifts one 1 in from the left; after two clocks the first two flip-flops hold 1.'),
  },
  {
    id: 'q5',
    prompt: loc('3.3 V LVTTL 输入上加 1.4 V，芯片会读到？', 'A 3.3 V LVTTL input sees 1.4 V. What does the chip read?'),
    options: [
      { id: 'a', text: loc('一定是 1', 'Always 1') },
      { id: 'b', text: loc('一定是 0', 'Always 0') },
      { id: 'c', text: loc('不保证，0 和 1 都可能', 'Not guaranteed; either 0 or 1') },
    ],
    answer: 'c',
    explain: loc('1.4 V 在 VIL（0.8 V）和 VIH（2.0 V）之间，是不确定区。', '1.4 V lies between VIL (0.8 V) and VIH (2.0 V), the undefined zone.'),
  },
]
