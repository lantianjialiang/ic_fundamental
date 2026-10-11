import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type PartId = 'pnp' | 'npn' | 'rwell' | 'rsub' | 'pnpn'

/** 剖面图上可点选的部分 */
export const PARTS: Array<{ id: PartId; title: LText; text: LText }> = [
  {
    id: 'pnpn',
    title: loc('PNPN 通路', 'PNPN path'),
    text: loc(
      'P+（接 VDD）→ N 阱 → P 衬底 → N+（接 GND）。四层交替，就是一只寄生晶闸管（SCR）。平时它关着；一旦导通，VDD 到 GND 只剩很小的电阻。',
      'P+ (at VDD) → N-well → P-substrate → N+ (at GND). Four alternating layers form a parasitic thyristor (SCR). Normally off; once on, VDD to GND sees almost no resistance.',
    ),
  },
  {
    id: 'pnp',
    title: loc('寄生 PNP', 'Parasitic PNP'),
    text: loc(
      'PMOS 的 P+ 源（发射极）/ N 阱（基极）/ P 衬底（集电极）。原理图上没有它，是 CMOS 结构自带的。',
      'PMOS P+ source (emitter) / N-well (base) / P-substrate (collector). Not in the schematic; it comes with the CMOS structure.',
    ),
  },
  {
    id: 'npn',
    title: loc('寄生 NPN', 'Parasitic NPN'),
    text: loc(
      'NMOS 的 N+ 源（发射极）/ P 衬底（基极）/ N 阱（集电极）。它的集电极就是 PNP 的基极——两只管子交叉相连。',
      'NMOS N+ source (emitter) / P-substrate (base) / N-well (collector). Its collector is the PNP\'s base: the two transistors are cross-coupled.',
    ),
  },
  {
    id: 'rwell',
    title: loc('阱电阻 Rwell', 'Well resistance Rwell'),
    text: loc(
      'N 阱不是理想导体。有电流流过时产生压降，压降约 0.7 V 就能让 PNP 的发射结正偏。',
      'The N-well is not a perfect conductor. Current through it builds a voltage; about 0.7 V forward-biases the PNP emitter junction.',
    ),
  },
  {
    id: 'rsub',
    title: loc('衬底电阻 Rsub', 'Substrate resistance Rsub'),
    text: loc(
      'P 衬底同样有电阻。衬底电流在这里产生压降，能让 NPN 的发射结正偏。',
      'The P-substrate has resistance too. Substrate current builds a voltage here that can forward-bias the NPN emitter junction.',
    ),
  },
]

/** 分步动画：0 平时 → 1 触发 → 2 正反馈 → 3 低阻通路 → 4 撤触发 → 5 掉电 */
export const PHASES: Array<{ title: LText; text: LText }> = [
  {
    title: loc('平时：两只寄生管都关', 'Normal: both parasitics off'),
    text: loc('VDD 到 GND 之间没有通路，IDD 只有微安级的静态电流。', 'There is no path from VDD to GND; IDD is only a few µA of quiescent current.'),
  },
  {
    title: loc('触发：电流注入衬底', 'Trigger: current injected into the substrate'),
    text: loc(
      'I/O 过冲 / 欠冲、上电顺序错或 ESD，把一股电流灌进衬底。它流过 Rsub，压降让 NPN 打开。',
      'An I/O overshoot or undershoot, a wrong power-up order or ESD injects current into the substrate. It flows through Rsub and the drop turns the NPN on.',
    ),
  },
  {
    title: loc('正反馈：两只管子互相喂', 'Positive feedback: each feeds the other'),
    text: loc(
      'NPN 从 N 阱抽电流 → Rwell 上有压降 → PNP 打开 → PNP 把电流灌回衬底 → NPN 开得更大。环路增益 > 1，自己越转越强。',
      'The NPN pulls current from the N-well → drop across Rwell → PNP turns on → PNP pushes current back into the substrate → NPN turns on harder. Loop gain > 1, so it builds by itself.',
    ),
  },
  {
    title: loc('低阻通路：IDD 飙升', 'Low-resistance path: IDD soars'),
    text: loc(
      'VDD → P+ → N 阱 → P 衬底 → N+ → GND 整条导通，电流只被外部电阻和电源限流挡住，可到数百 mA 甚至安培级。',
      'VDD → P+ → N-well → P-substrate → N+ → GND conducts end to end. Only external resistance and the supply current limit hold it back: hundreds of mA up to amperes.',
    ),
  },
  {
    title: loc('撤掉触发：仍然锁着', 'Trigger removed: still latched'),
    text: loc(
      '触发电流已经没了，但电源自己在供维持电流（高于 IH），环路不需要原来的触发源。改输入不能让它恢复。',
      'The trigger is gone, but the supply itself provides the holding current (above IH); the loop no longer needs the trigger. Changing inputs will not recover it.',
    ),
  },
  {
    title: loc('掉电：解除的办法', 'Power off: the way out'),
    text: loc(
      'VDD 降到 0（至少要降到维持电压以下），电流跌到维持电流 IH 以下，正反馈断掉，寄生管关断。重新上电后芯片恢复正常——前提是大电流还没把它烧坏。',
      'Take VDD to 0 (at least below the holding voltage): the current falls below the holding current IH, the feedback loop breaks and the parasitics turn off. After power-up the chip works again, provided the high current has not burned it out.',
    ),
  },
]

export const TEST_NOTE = loc(
  '测试时：IDD 突然像短路、输出被钳在异常电压、改输入回不来，都要想到 Latch-up——先靠电源限流保护芯片，再掉电。触发方法、测试步骤和参数详见 {@fLatch}。',
  'In test: IDD suddenly looks like a short, an output is clamped at an odd voltage, or changing inputs does not help — think latch-up. Protect the chip with the supply current limit, then power down. Trigger methods, test steps and parameters are in {@fLatch}.',
)

export const TAKEAWAY = loc(
  'Latch-up = CMOS 里寄生的 PNPN 被触发后，正反馈把 VDD–GND 锁成低阻通路；撤掉触发也不熄，只有掉电才解除。',
  'Latch-up: once the parasitic PNPN in CMOS is triggered, positive feedback locks VDD–GND into a low-resistance path; it stays on after the trigger is removed and only power-down clears it.',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Latch-up 是功能向量写错了吗？', 'Is latch-up caused by wrong functional vectors?'),
    options: [
      { id: 'yes', text: loc('是，改期望值就能好', 'Yes; fix the expected values') },
      { id: 'no', text: loc('不是。是寄生 PNPN 被触发后形成的电源低阻通路', 'No. It is a low-resistance supply path from a triggered parasitic PNPN') },
      { id: 'scan', text: loc('是扫描链太长', 'The scan chain is too long') },
      { id: 'bin', text: loc('是 Bin 号冲突', 'A bin number conflict') },
    ],
    answer: 'no',
    explain: loc('向量错只会让某几拍比较失败；Latch-up 是电源电流失控。', 'A wrong vector fails a few compares; latch-up is a runaway supply current.'),
  },
  {
    id: 'q2',
    prompt: loc('寄生 NPN 的集电极连到哪里？', 'Where does the parasitic NPN\'s collector connect?'),
    options: [
      { id: 'well', text: loc('N 阱，也就是 PNP 的基极', 'The N-well, which is the PNP\'s base') },
      { id: 'gnd', text: loc('直接接 GND', 'Directly to GND') },
      { id: 'gate', text: loc('NMOS 的栅极', 'The NMOS gate') },
      { id: 'io', text: loc('只连 I/O 脚', 'Only the I/O pin') },
    ],
    answer: 'well',
    explain: loc('NPN 的集电极 = PNP 的基极，PNP 的集电极 = NPN 的基极。正是这种交叉相连形成正反馈。', 'NPN collector = PNP base, PNP collector = NPN base. This cross-coupling creates positive feedback.'),
  },
  {
    id: 'q3',
    prompt: loc('触发之后撤掉触发电流，芯片会恢复吗？', 'After latch-up, does removing the trigger current recover the chip?'),
    options: [
      { id: 'yes', text: loc('会，立刻恢复', 'Yes, immediately') },
      { id: 'no', text: loc('不会。电源自己供维持电流，必须掉电', 'No. The supply sustains the holding current; power must be removed') },
      { id: 'xor', text: loc('再跑一遍向量就好', 'Rerun the vectors') },
      { id: 'cool', text: loc('等它冷却就好', 'Wait for it to cool down') },
    ],
    answer: 'no',
    explain: loc('只要电流高于维持电流 IH，环路就不灭。掉电让电流降到 IH 以下才能解除。', 'As long as current stays above the holding current IH the loop stays on. Only power-down brings it below IH.'),
  },
  {
    id: 'q4',
    prompt: loc('测试中出现哪种现象要先想到 Latch-up？', 'Which symptom in test should make you think of latch-up first?'),
    options: [
      { id: 'one', text: loc('只有某一拍比较错', 'One cycle fails a compare') },
      { id: 'ok', text: loc('IDD 突然像短路，改输入也回不来', 'IDD suddenly looks like a short and changing inputs does not help') },
      { id: 'name', text: loc('芯片丝印不清', 'The marking is unreadable') },
      { id: 'fmax', text: loc('fMAX 稍低', 'fMAX is slightly low') },
    ],
    answer: 'ok',
    explain: loc('先靠电源限流保护芯片，再掉电；完整的闩锁测试在 {@fLatch}。', 'Protect the chip with the supply current limit, then power down. The full latch-up test is in {@fLatch}.'),
  },
]
