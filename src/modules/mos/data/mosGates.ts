import { loc, type LText } from '../../../i18n/locale'
import { type GateId } from '../gatesModel'

export const S = {
  kickerGate: loc('CMOS 逻辑门', 'CMOS gates'),
  kickerDual: loc('对偶', 'Duality'),
  introTitle: loc('从反相器到逻辑门', 'From the inverter to logic gates'),
  gateTitle: loc('NAND2 与 NOR2：点输入，看哪几只管子导通', 'NAND2 and NOR2: click the inputs and see which transistors conduct'),
  gateNote: loc(
    '先选门，再点 A、B 的 0 / 1，或者直接点真值表的行。管子绿色 = 导通，灰色 = 关断；金色线是 VDD 到 OUT 的电流通路，蓝色线是 GND 到 OUT 的通路。',
    'Pick a gate, then click 0 / 1 for A and B, or click a truth-table row. Green transistor = on, grey = off; the gold line is the VDD-to-OUT current path and the blue line is the GND-to-OUT path.',
  ),
  gateCap: loc(
    '绿色管子 = 导通，灰色 = 关断；金色线 = VDD 到 OUT 的电流通路，蓝色线 = GND 到 OUT 的通路。PMOS 栅极的小圆圈表示输入为 0 时导通。NMOS 衬底接 GND、PMOS 衬底接 VDD，图中省略。',
    'Green transistor = on, grey = off; gold line = current path from VDD to OUT, blue line = path from GND to OUT. The small circle on a PMOS gate means it conducts when the input is 0. NMOS bodies go to GND and PMOS bodies to VDD, not drawn.',
  ),
  up: loc('上拉网络', 'Pull-up network'),
  down: loc('下拉网络', 'Pull-down network'),
  conduct: loc('导通', 'Conducting'),
  open: loc('断开', 'Open'),
  rowOf: loc('当前输入', 'Current inputs'),
  dualTitle: loc('串联是与，并联是或：上下两个网络为什么互为对偶', 'Series is AND, parallel is OR: why the two networks are duals'),
  dualNote: loc('选一条看解释；下面的表和图把它们落到具体的电压上。', 'Pick one to read it; the table and chart below tie it to actual voltages.'),
  tblTitle: loc('导通条件对照', 'Conduction conditions'),
  tblWire: loc('接法', 'Wiring'),
  tblN: loc('NMOS 网络导通的条件', 'NMOS network conducts when'),
  tblP: loc('PMOS 网络导通的条件', 'PMOS network conducts when'),
  tblSer: loc('串联', 'Series'),
  tblPar: loc('并联', 'Parallel'),
  tblSerN: loc('A、B 都为 1：A·B（与）', 'A and B are both 1: A·B (AND)'),
  tblSerP: loc('A、B 都为 0：¬A·¬B', 'A and B are both 0: ¬A·¬B'),
  tblParN: loc('A、B 至少一个为 1：A + B（或）', 'At least one of A, B is 1: A + B (OR)'),
  tblParP: loc('A、B 至少一个为 0：¬A + ¬B', 'At least one of A, B is 0: ¬A + ¬B'),
  tblNote: loc(
    '例：NAND 的下拉是 NMOS 串联，导通条件 A·B；上拉是 PMOS 并联，导通条件 ¬A + ¬B，按德摩根定律正好等于 ¬(A·B)，所以两个网络永远一通一断。',
    'Example: the NAND pull-down is NMOS in series, conducting when A·B; the pull-up is PMOS in parallel, conducting when ¬A + ¬B, which by De Morgan equals ¬(A·B), so exactly one of the two networks is always on.',
  ),
  next: loc('下一课：动态特性，为什么会有延时', 'Next: Dynamics, where delay comes from'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '传输门和三态门、异或和多路选择器在下面的小节；自己搭门的编辑器在最后一节；门的延时见「动态特性」一课。',
    'Transmission gates, tri-state buffers, XOR and the multiplexer are in the sections below; the build-your-own editor is in the last section; gate delay is in the Dynamics lesson.',
  ),
}

export const INTRO: LText[] = [
  loc(
    '反相器是一只 PMOS 加一只 NMOS（{@mosInverter}）。更复杂的门只是把这两个角色换成两个“网络”：下面由 NMOS 组成的下拉网络，在输出该是 0 的时候把 OUT 接到 GND；上面由 PMOS 组成的上拉网络，在输出该是 1 的时候把 OUT 接到 VDD。',
    'The inverter is one PMOS plus one NMOS ({@mosInverter}). A more complex gate just replaces those two roles with two networks: a pull-down network of NMOS below connects OUT to GND when the output should be 0, and a pull-up network of PMOS above connects OUT to VDD when the output should be 1.',
  ),
  loc(
    'NMOS 输入为 1 导通，PMOS 输入为 0 导通。{@mosSwitch} 里说过 NMOS 传好 0、PMOS 传好 1，所以下拉只能用 NMOS，上拉只能用 PMOS。串联的管子要全部导通才通，是“与”；并联的管子只要一只导通就通，是“或”。上下两个网络互为对偶，任何输入下恰好一个导通。',
    'An NMOS conducts when its input is 1 and a PMOS when its input is 0. {@mosSwitch} showed that NMOS passes a good 0 and PMOS a good 1, so the pull-down must be NMOS and the pull-up PMOS. Transistors in series conduct only if all are on, which is AND; transistors in parallel conduct if any one is on, which is OR. The two networks are duals, so for any input exactly one of them conducts.',
  ),
  loc(
    '门的真值表见 {@pDigital} 和 {@fBasics}，它也正是功能测试（{@func}）要逐行核对的东西。管子坏了，表现就是某几行真值出错；常关的管子甚至会让输出在某些组合下悬空，保持上一个值。',
    'Gate truth tables are in {@pDigital} and {@fBasics}, and they are exactly what functional test ({@func}) checks row by row. A broken transistor shows up as wrong values in some rows; a transistor stuck off can even leave the output floating for some combinations, holding the previous value.',
  ),
]

export type GateItem = {
  id: GateId
  label: LText
  title: LText
  rule: LText
  text: LText
  rows: [LText, LText, LText, LText]
  tail: LText
}

/** rows 的下标 = A × 2 + B */
export const GATES: GateItem[] = [
  {
    id: 'nand',
    label: loc('NAND2', 'NAND2'),
    title: loc('NAND2：上拉并联，下拉串联', 'NAND2: parallel pull-up, series pull-down'),
    rule: loc('Y = ¬(A·B)', 'Y = NOT (A AND B)'),
    text: loc(
      'PMOS 并联：任一输入为 0，就有一只 PMOS 把 OUT 接到 VDD。NMOS 串联：两个输入都为 1，OUT 才被接到 GND。所以只有 A、B 都是 1 才输出 0。只要 4 只管子，比 AND 门（NAND 再加反相器，6 只）还省。',
      'PMOS in parallel: if either input is 0, one PMOS ties OUT to VDD. NMOS in series: OUT reaches GND only when both inputs are 1. So the output is 0 only when A and B are both 1. It takes just 4 transistors, fewer than an AND gate (a NAND plus an inverter, 6).',
    ),
    rows: [
      loc(
        'A = 0、B = 0：两只 PMOS（并联）都导通，两只 NMOS（串联）都关断。OUT 经 PMOS 接到 VDD，Y = 1。',
        'A = 0, B = 0: both PMOS (parallel) are on and both NMOS (series) are off. OUT is tied to VDD through a PMOS, so Y = 1.',
      ),
      loc(
        'A = 0、B = 1：A 的 PMOS 导通，B 的 PMOS 关断；B 的 NMOS 导通，A 的 NMOS 关断。并联的上拉只要一只导通就通，OUT 接 VDD；串联的下拉被 A 的 NMOS 挡住，没有通路，Y = 1。',
        'A = 0, B = 1: the PMOS of A is on and that of B is off; the NMOS of B is on and that of A is off. A parallel pull-up needs only one device on, so OUT goes to VDD; the series pull-down is blocked by the off NMOS of A, so there is no path, Y = 1.',
      ),
      loc(
        'A = 1、B = 0：A 的 NMOS 导通，B 的 NMOS 关断，串联下拉被 B 的 NMOS 挡住；B 的 PMOS 导通，并联上拉通，OUT 接 VDD，Y = 1。',
        'A = 1, B = 0: the NMOS of A is on and that of B is off, so the series pull-down is blocked by the off NMOS of B; the PMOS of B is on, so the parallel pull-up conducts and OUT goes to VDD, Y = 1.',
      ),
      loc(
        'A = 1、B = 1：两只 NMOS 都导通，串联通路 GND → B 的 NMOS → A 的 NMOS → OUT 接通；两只 PMOS 都关断，上拉没有通路，Y = 0。',
        'A = 1, B = 1: both NMOS are on, so the series path GND → NMOS of B → NMOS of A → OUT is complete; both PMOS are off, so the pull-up has no path, Y = 0.',
      ),
    ],
    tail: loc('串联的两只管子分摊压降，导通电阻相加，所以 NAND 的 NMOS 常做得更宽来补偿。', 'Two series transistors add their on-resistances, so the NMOS of a NAND is often drawn wider to compensate.'),
  },
  {
    id: 'nor',
    label: loc('NOR2', 'NOR2'),
    title: loc('NOR2：上拉串联，下拉并联', 'NOR2: series pull-up, parallel pull-down'),
    rule: loc('Y = ¬(A+B)', 'Y = NOT (A OR B)'),
    text: loc(
      'NMOS 并联：任一输入为 1，就有一只 NMOS 把 OUT 接到 GND。PMOS 串联：两个输入都为 0，OUT 才被接到 VDD。所以只有 A、B 都是 0 才输出 1。NOR 串联的是两只 PMOS，而 PMOS 本来就比 NMOS 弱（迁移率低），所以同样面积下 NOR 比 NAND 慢，PMOS 要做得更宽。',
      'NMOS in parallel: if either input is 1, one NMOS ties OUT to GND. PMOS in series: OUT reaches VDD only when both inputs are 0. So the output is 1 only when A and B are both 0. A NOR puts two PMOS in series, and a PMOS is already weaker than an NMOS (lower mobility), so at equal area a NOR is slower than a NAND and its PMOS must be drawn wider.',
    ),
    rows: [
      loc(
        'A = 0、B = 0：两只 PMOS（串联）都导通，通路 VDD → A 的 PMOS → B 的 PMOS → OUT 接通；两只 NMOS（并联）都关断，Y = 1。',
        'A = 0, B = 0: both PMOS (series) are on, so the path VDD → PMOS of A → PMOS of B → OUT is complete; both NMOS (parallel) are off, Y = 1.',
      ),
      loc(
        'A = 0、B = 1：B 的 PMOS 关断，挡住串联的上拉；B 的 NMOS 导通，并联下拉只要一只导通就通，OUT 接 GND，Y = 0。',
        'A = 0, B = 1: the PMOS of B is off and blocks the series pull-up; the NMOS of B is on, and a parallel pull-down needs only one device on, so OUT goes to GND, Y = 0.',
      ),
      loc(
        'A = 1、B = 0：A 的 PMOS 关断，挡住串联的上拉；A 的 NMOS 导通，并联下拉通，OUT 接 GND，Y = 0。',
        'A = 1, B = 0: the PMOS of A is off and blocks the series pull-up; the NMOS of A is on, so the parallel pull-down conducts and OUT goes to GND, Y = 0.',
      ),
      loc(
        'A = 1、B = 1：两只 PMOS 都关断，上拉没有通路；两只 NMOS 都导通，两条并联通路一起把 OUT 接到 GND，Y = 0。',
        'A = 1, B = 1: both PMOS are off, so the pull-up has no path; both NMOS are on, and the two parallel paths together tie OUT to GND, Y = 0.',
      ),
    ],
    tail: loc('串联的 PMOS 导通电阻相加，上升沿比下降沿慢，这是电路里更常用 NAND 的原因之一。', 'Series PMOS add their on-resistances, so the rising edge is slower than the falling edge, one reason NAND is used more than NOR.'),
  },
]

export type DualId = 'logic' | 'dual' | 'inv'

export const DUAL: Array<{ id: DualId; title: LText; sub: LText; text: LText; detail: LText }> = [
  {
    id: 'logic',
    title: loc('串联 = 与，并联 = 或', 'Series = AND, parallel = OR'),
    sub: loc('电流要穿过几只管子', 'How many devices the current crosses'),
    text: loc(
      'NMOS 输入为 1 才导通。两只串联，电流要穿过两只管子，必须两个输入都是 1：下拉通路 = A·B，这是与。两只并联，电流能走任一只，只要一个输入是 1：通路 = A + B，这是或。',
      'An NMOS conducts only when its input is 1. Two in series force the current through both, so both inputs must be 1: path = A·B, which is AND. Two in parallel let the current take either, so one input at 1 is enough: path = A + B, which is OR.',
    ),
    detail: loc(
      'PMOS 输入为 0 才导通，所以反过来：串联的 PMOS 要两个输入都是 0，并联的 PMOS 只要一个是 0。看下表。',
      'A PMOS conducts when its input is 0, so it is the other way round: series PMOS need both inputs at 0, parallel PMOS need only one at 0. See the table below.',
    ),
  },
  {
    id: 'dual',
    title: loc('上拉和下拉互为对偶', 'Pull-up and pull-down are duals'),
    sub: loc('串联 ↔ 并联，NMOS ↔ PMOS', 'Series ↔ parallel, NMOS ↔ PMOS'),
    text: loc(
      '下拉网络里串联的地方，上拉网络里换成并联，并联换成串联，每个输入同时接一只 NMOS 和一只 PMOS 的栅极。这样下拉导通的条件是 f，上拉导通的条件正好是 ¬f：任何输入下恰好一个网络导通，输出总是确定的 0 或 1，电源到地也没有直流通路。',
      'Wherever the pull-down has series, the pull-up has parallel and vice versa, and each input drives the gate of one NMOS and one PMOS. The pull-down then conducts when f holds and the pull-up exactly when ¬f holds: for every input exactly one network conducts, so the output is always a definite 0 or 1 and there is no DC path from supply to ground.',
    ),
    detail: loc(
      '依据是德摩根定律：¬(A·B) = ¬A + ¬B，¬(A + B) = ¬A·¬B。这条规则就是自己搭门的方法：先写下拉网络，再把它对偶出来当上拉网络，最后一节的编辑器就是这么做的。',
      'It rests on De Morgan: ¬(A·B) = ¬A + ¬B and ¬(A + B) = ¬A·¬B. That rule is how you build your own gate: write the pull-down, dualise it for the pull-up; the editor in the last section does exactly that.',
    ),
  },
  {
    id: 'inv',
    title: loc('为什么静态 CMOS 门都是反相的', 'Why static CMOS gates are inverting'),
    sub: loc('NMOS 只能下拉，PMOS 只能上拉', 'NMOS only pulls down, PMOS only up'),
    text: loc(
      '上拉要传好 1，只能用 PMOS；下拉要传好 0，只能用 NMOS（看下图：反过来用，NMOS 上拉只到 VDD − Vtn，PMOS 下拉只到 |Vtp|）。可是输入变高时，NMOS 更通、PMOS 更断，只会把 OUT 往下拉：输入上升，输出只能下降，所以每一级都是反相的。',
      'The pull-up must pass a good 1, so it can only be PMOS; the pull-down must pass a good 0, so only NMOS (see the chart: used the other way round, an NMOS pull-up stops at VDD − Vtn and a PMOS pull-down at |Vtp|). But when an input rises, NMOS conduct more and PMOS less, which can only pull OUT down: input up means output down, so every stage inverts.',
    ),
    detail: loc(
      '要 AND、OR 就得在 NAND、NOR 后面再加一个反相器（AND = NAND + 反相器，6 只管子），更大也更慢。所以电路里大量用的是 NAND、NOR 这类反相门。',
      'To get AND or OR you must add an inverter after the NAND or NOR (AND = NAND + inverter, 6 transistors), which is bigger and slower. That is why circuits use inverting gates like NAND and NOR so heavily.',
    ),
  },
]

export const TAKEAWAY: LText[] = [
  loc('下拉网络用 NMOS（输入 1 导通），上拉网络用 PMOS（输入 0 导通）：NMOS 传好 0，PMOS 传好 1。', 'The pull-down uses NMOS (on at input 1) and the pull-up uses PMOS (on at input 0): NMOS passes a good 0 and PMOS a good 1.'),
  loc('串联 = 与，并联 = 或；上拉网络是下拉网络的对偶，任何输入下恰好一个网络导通，所以没有直流通路。', 'Series = AND, parallel = OR; the pull-up is the dual of the pull-down, so for any input exactly one network conducts and there is no DC path.'),
  loc('NAND2：PMOS 并联、NMOS 串联；NOR2：PMOS 串联、NMOS 并联；都是 4 只管子。', 'NAND2: PMOS in parallel, NMOS in series; NOR2: PMOS in series, NMOS in parallel; both use 4 transistors.'),
  loc('静态 CMOS 门天然反相：输入升高只会让 NMOS 更通、PMOS 更断。AND、OR 要在后面再加反相器。', 'Static CMOS gates are inherently inverting: a rising input only turns NMOS on more and PMOS off more. AND and OR need an inverter added after them.'),
  loc('传输门（NMOS ∥ PMOS，栅极互补）两头都传得好；三态门 EN = 0 时输出高阻。', 'A transmission gate (NMOS ∥ PMOS, complementary gates) passes both levels well; a tri-state buffer goes high-Z when EN = 0.'),
]
