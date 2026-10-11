import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type Bit = 0 | 1

/* ---------------- 四步动画的模型 ---------------- */

/** 链上的一位数据。key 稳定，用来让同一位在画面上平移，而不是凭空换值。 */
export type Tok = { key: string; v: Bit | null; kind: 'x' | 'stim' | 'cap' | 'next' }

export type Phase = 'plain' | 'scanify' | 'load' | 'shiftIn' | 'capPrep' | 'capture' | 'shiftOut' | 'compare'

export type Frame = {
  phase: Phase
  /** 0：普通 FF，没有 MUX；1：已经换成 Scan FF */
  scan: boolean
  se: 0 | 1
  chain: Tok[]
  /** 等在 SI 上、下一拍要进链的位 */
  si: Tok | null
  /** 这一拍从 SO 出去的位 */
  so: Tok | null
  /** 已经从 SO 读到、拿去比较的位 */
  outs: Bit[]
  /** Capture 用到的 Q1–Q4（时钟沿之前的值）；只在 Capture 两帧里有 */
  q: Bit[] | null
  /** D1–D4 线上的实际值（有故障时已含故障）；只在 Capture 两帧里有 */
  d: Bit[] | null
  caption: LText
}

export type FaultId = 'none' | 'd2sa0'

export const N = 4

/** 想让 Q1–Q4 变成的值 */
export const STIM: Bit[] = [1, 0, 1, 1]
/** 移出时顺手移入的下一条 Pattern（Q1–Q4） */
const NEXT: Bit[] = [0, 1, 1, 0]

/** 组合逻辑：每个 D 由哪几个 Q 算出来。ins 是用到的 Q 下标，图里据此画 Q → D 的连线 */
export type Eq = { name: string; expr: string; ins: number[]; fn: (q: Bit[]) => Bit; sub: (q: Bit[]) => string }

export const EQS: Eq[] = [
  { name: 'D1', expr: 'Q1 · Q2', ins: [0, 1], fn: (q) => (q[0] & q[1]) as Bit, sub: (q) => `${q[0]} · ${q[1]}` },
  { name: 'D2', expr: 'Q2 + Q3', ins: [1, 2], fn: (q) => (q[1] | q[2]) as Bit, sub: (q) => `${q[1]} + ${q[2]}` },
  { name: 'D3', expr: '¬Q4', ins: [3], fn: (q) => (q[3] ? 0 : 1), sub: (q) => `¬${q[3]}` },
  { name: 'D4', expr: 'Q1 ⊕ Q3', ins: [0, 2], fn: (q) => (q[0] ^ q[2]) as Bit, sub: (q) => `${q[0]} ⊕ ${q[2]}` },
]

/** 故障 d2sa0 落在 D2 这根线上 */
export const FAULT_AT = 1

export function logicGood(q: Bit[]): Bit[] {
  return EQS.map((e) => e.fn(q))
}

export function logic(q: Bit[], fault: FaultId): Bit[] {
  const d = logicGood(q)
  if (fault === 'd2sa0') d[FAULT_AT] = 0
  return d
}

/** 好芯片的期望：捕获后从 SO 依次出来的是 FF4、FF3、FF2、FF1 */
export const EXPECTED: Bit[] = [...logicGood(STIM)].reverse()

/** 第 k 次从 SO 读到的位来自哪个 FF */
export const OUT_FROM = ['FF4', 'FF3', 'FF2', 'FF1']

const bits = (list: Array<Bit | null>) => list.map((v) => (v === null ? 'X' : String(v))).join(' ')

const C = {
  plain: loc(
    '普通电路：4 个 FF 存着状态，D 来自组合逻辑，Q 又回到组合逻辑。外部 Pin 既设不了 Q，也读不到 Q。',
    'Plain circuit: four FFs hold the state. D comes from the combinational logic and Q feeds back into it. No external pin can set or read Q.',
  ),
  scanify: loc(
    '换成 Scan FF：每个 FF 前加一个二选一 MUX。于是每个 Scan FF 有 D（功能输入，来自组合逻辑）、SI（扫描输入，接前一个 FF 的 Q；FF1 的 SI 接 SI 管脚）、SE（选择）和 Q（输出）。SE=1 时 FF 存 SI（移位），SE=0 时存 D（捕获）。4 个 FF 串成一条链：SI → FF1 → … → FF4 → SO。',
    'Swap in scan FFs: a 2-to-1 MUX goes in front of each FF. Each scan FF now has D (functional input, from the logic), SI (scan input, from the previous FF’s Q; FF1’s SI comes from the SI pin), SE (select) and Q (output). With SE=1 the FF stores SI (shift); with SE=0 it stores D (capture). The four FFs form a chain: SI → FF1 → … → FF4 → SO.',
  ),
  load: loc(
    'Shift 准备：SE=1，链现在是一个移位寄存器。里面的值未知（X）。要让 Q1–Q4 = 1 0 1 1，最远的 Q4 要最先送进去，所以 SI 上依次送 1、1、0、1（Q4、Q3、Q2、Q1）。',
    'Ready to shift: SE=1, so the chain is a shift register. Its contents are unknown (X). To get Q1–Q4 = 1 0 1 1, the bit for Q4 (the far end) goes in first, so SI receives 1, 1, 0, 1 (for Q4, Q3, Q2, Q1).',
  ),
}

function shiftInCap(k: number, v: Bit, chain: Tok[]): LText {
  const now = bits(chain.map((tok) => tok.v))
  if (k === N - 1) {
    return loc(
      `Shift 第 ${k + 1} 拍：FF1 收下最后一位 ${v}，最先送进去的那位已经走到 FF4。现在 Q1–Q4 = ${now}，激励放好了。下一步切到 Capture。`,
      `Shift clock ${k + 1}: FF1 takes the last bit, ${v}, and the first bit sent in has reached FF4. Now Q1–Q4 = ${now}; the stimulus is in place. Next comes capture.`,
    )
  }
  return loc(
    `Shift 第 ${k + 1} 拍：SE=1，每个 FF 存自己 SI 端的值。FF1 的 SI 接 SI 管脚，收下 ${v}（这一位最终要停在 FF${N - k}）；FF2–FF4 各收下前一个 FF 原来的 Q；FF4 原来的 X 从 SO 出去，不比较。现在 Q1–Q4 = ${now}。`,
    `Shift clock ${k + 1}: SE=1, so every FF stores the value on its SI. FF1’s SI is the SI pin, so it takes ${v} (this bit will end up in FF${N - k}); FF2–FF4 each take the previous FF’s old Q; FF4’s old X leaves through SO and is not compared. Now Q1–Q4 = ${now}.`,
  )
}

/** 动态拼句子用的片段：分隔符、故障提示、比对结果 */
const W = {
  sep: loc('，', '; '),
  badNote: loc('D2 这根线粘在 0：逻辑算出 1，线上却是 0。', ' The D2 wire is stuck at 0: the logic computes 1, but the wire stays 0.'),
  match: loc('一致', 'matches'),
  mismatch: loc('不一致', 'does not match'),
}

const joinL = (parts: LText[], sep: LText): LText =>
  loc(parts.map((p) => p.zh).join(sep.zh), parts.map((p) => p.en ?? p.zh).join(sep.en ?? sep.zh))

function capPrepCap(q: Bit[], fault: FaultId): LText {
  const list = EQS.map((e) => `${e.name} = ${e.expr} = ${e.sub(q)} = ${e.fn(q)}`)
  const bad = fault === 'd2sa0'
  return loc(
    `Capture 准备：SE 切到 0，每个 MUX 改选 D 端（来自组合逻辑），不再选 SI。时钟还没打，Q1–Q4 仍是 ${bits(q)}。组合逻辑以这 4 个 Q 为输入，已经算好：${list.join(W.sep.zh)}。${bad ? W.badNote.zh : ''}（本例只画 FF 之间的逻辑；真实电路还有主输入，由测试机在这一拍之前从 Pin 给好。）`,
    `Capture setup: SE goes to 0, so every MUX now selects its D input (from the logic) instead of SI. No clock yet, so Q1–Q4 is still ${bits(q)}. With these four Qs as inputs, the logic has already computed: ${list.join('; ')}.${bad ? W.badNote.en : ''} (Only the logic between FFs is drawn here; a real circuit also has primary inputs, which the tester applies from the pins before this clock.)`,
  )
}

function captureCap(q: Bit[], d: Bit[], fault: FaultId): LText {
  const good = logicGood(q)
  const items = d.map((v, i) =>
    fault === 'd2sa0' && i === FAULT_AT
      ? loc(
          `Q${i + 1}：${q[i]}→${v}（D${i + 1} 粘在 0，好芯片这里应变成 ${good[i]}）`,
          `Q${i + 1}: ${q[i]}→${v} (D${i + 1} is stuck at 0; a good chip would give ${good[i]})`,
        )
      : loc(`Q${i + 1}：${q[i]}→${v}（存 D${i + 1} = ${v}）`, `Q${i + 1}: ${q[i]}→${v} (stores D${i + 1} = ${v})`),
  )
  const changes = joinL(items, W.sep)
  return loc(
    `Capture 时钟沿：只打这一拍功能时钟，FF1–FF4 在同一个沿同时存下各自的 D。${changes.zh}。所有 FF 用的都是沿前的旧 Q（${bits(q)}），所以算式里代入的仍是旧值。现在 Q1–Q4 = ${bits(d)}，这就是组合逻辑对激励的响应；被测的就是这一拍。`,
    `Capture edge: one functional clock, and FF1–FF4 all store their own D on the same edge. ${changes.en}. Every FF uses the old Q from before the edge (${bits(q)}), so the equations still use the old values. Now Q1–Q4 = ${bits(d)}: the logic’s response to the stimulus. This one clock is what tests the logic.`,
  )
}

function shiftOutCap(k: number, v: Bit): LText {
  const e = EXPECTED[k]
  const src = N - k
  const res = v === e ? W.match : W.mismatch
  return loc(
    `Shift 移出第 ${k + 1} 位：SE=1。先 Strobe SO（就是 FF4 的 Q），读到 ${v}——它是 FF${src} 在 Capture 时存下的 D${src}，期望 ${e}，${res.zh}。再打一拍时钟，链往右挪一格，下一条 Pattern 的一位从 SI 进 FF1。`,
    `Shift out bit ${k + 1}: SE=1. First strobe SO (the Q of FF4) and read ${v}: this is the D${src} that FF${src} captured; expected ${e}, so it ${res.en}. Then one clock moves the chain one place right, and a bit of the next pattern enters FF1 from SI.`,
  )
}

function compareCap(outs: Bit[]): LText {
  const m = outs.findIndex((v, i) => v !== EXPECTED[i])
  if (m < 0) {
    return loc(
      `Compare：读出顺序是 FF4、FF3、FF2、FF1，读到 ${bits(outs)}，和期望 ${bits(EXPECTED)} 4 位都一致，这条 Pattern Pass。`,
      `Compare: bits come out FF4, FF3, FF2, FF1. Read ${bits(outs)}, expected ${bits(EXPECTED)}: all 4 match, so this pattern passes.`,
    )
  }
  const ff = OUT_FROM[m]
  const dn = `D${N - m}`
  return loc(
    `Compare：读出顺序是 FF4、FF3、FF2、FF1，读到 ${bits(outs)}，期望 ${bits(EXPECTED)}。第 ${m + 1} 位期望 ${EXPECTED[m]}、读到 ${outs[m]}，它来自 ${ff}，所以问题出在算 ${dn} 的那部分逻辑（或 ${dn} 这根线）。Fail 落在链上的某一位，就能反查是哪个 FF。`,
    `Compare: bits come out FF4, FF3, FF2, FF1. Read ${bits(outs)}, expected ${bits(EXPECTED)}. Bit ${m + 1} should be ${EXPECTED[m]} but is ${outs[m]}; it came from ${ff}, so the fault is in the logic that drives ${dn} (or the ${dn} wire itself). A scan failure points to one bit in the chain, so you can trace it to one FF.`,
  )
}

/** 按「普通 → Scan FF → Shift → Capture 准备 → Capture 沿 → Shift → Compare」生成每一帧 */
export function buildFrames(fault: FaultId): Frame[] {
  const frames: Frame[] = []
  const stimOrder = [...STIM].reverse()
  const nextOrder = [...NEXT].reverse()
  const stimToks: Tok[] = stimOrder.map((v, i) => ({ key: `s${i}`, v, kind: 'stim' }))
  const nextToks: Tok[] = nextOrder.map((v, i) => ({ key: `n${i}`, v, kind: 'next' }))
  let chain: Tok[] = Array.from({ length: N }, (_, i) => ({ key: `x${i}`, v: null, kind: 'x' }))
  const base = { outs: [] as Bit[], q: null, d: null }

  frames.push({ ...base, phase: 'plain', scan: false, se: 0, chain, si: null, so: null, caption: C.plain })
  frames.push({ ...base, phase: 'scanify', scan: true, se: 1, chain, si: null, so: null, caption: C.scanify })
  frames.push({ ...base, phase: 'load', scan: true, se: 1, chain, si: stimToks[0], so: null, caption: C.load })

  for (let k = 0; k < N; k += 1) {
    const so = chain[N - 1]
    chain = [stimToks[k], ...chain.slice(0, N - 1)]
    frames.push({
      ...base,
      phase: 'shiftIn',
      scan: true,
      se: 1,
      chain,
      si: stimToks[k + 1] ?? null,
      so,
      caption: shiftInCap(k, stimToks[k].v as Bit, chain),
    })
  }

  const q = chain.map((tok) => tok.v as Bit)
  const d = logic(q, fault)
  frames.push({ ...base, phase: 'capPrep', scan: true, se: 0, chain, si: null, so: null, q, d, caption: capPrepCap(q, fault) })
  chain = d.map((v, i) => ({ key: `c${i}`, v, kind: 'cap' }))
  frames.push({ ...base, phase: 'capture', scan: true, se: 0, chain, si: null, so: null, q, d, caption: captureCap(q, d, fault) })

  const outs: Bit[] = []
  for (let k = 0; k < N; k += 1) {
    const so = chain[N - 1]
    outs.push(so.v as Bit)
    chain = [nextToks[k], ...chain.slice(0, N - 1)]
    frames.push({
      ...base,
      phase: 'shiftOut',
      scan: true,
      se: 1,
      chain,
      si: nextToks[k + 1] ?? null,
      so,
      outs: [...outs],
      caption: shiftOutCap(k, so.v as Bit),
    })
  }

  frames.push({ ...base, phase: 'compare', scan: true, se: 1, chain, si: null, so: null, outs: [...outs], caption: compareCap(outs) })
  return frames
}

export const PHASE_LABEL: Record<Phase, LText> = {
  plain: loc('普通 FF', 'Plain FF'),
  scanify: loc('换成 Scan FF', 'To scan FF'),
  load: loc('准备 Shift', 'Ready'),
  shiftIn: loc('Shift 移入', 'Shift in'),
  capPrep: loc('Capture 准备（SE=0）', 'Capture setup (SE=0)'),
  capture: loc('Capture 时钟沿', 'Capture edge'),
  shiftOut: loc('Shift 移出', 'Shift out'),
  compare: loc('Compare', 'Compare'),
}

/** 页面上那四个大步骤，以及每步对应的帧 */
export const BIG_STEPS: Array<{ id: string; label: LText; phases: Phase[] }> = [
  { id: 'shift1', label: loc('1. Shift 移入激励', '1. Shift in stimulus'), phases: ['load', 'shiftIn'] },
  { id: 'capture', label: loc('2. Capture 捕获一拍', '2. Capture one clock'), phases: ['capPrep', 'capture'] },
  { id: 'shift2', label: loc('3. Shift 移出响应', '3. Shift out response'), phases: ['shiftOut'] },
  { id: 'compare', label: loc('4. Compare 比较', '4. Compare'), phases: ['compare'] },
]

export const FAULTS: Array<{ id: FaultId; label: LText }> = [
  { id: 'none', label: loc('好芯片', 'Good chip') },
  { id: 'd2sa0', label: loc('D2 固定为 0（stuck-at-0）', 'D2 stuck-at-0') },
]

/* ---------------- 文字 ---------------- */

export const L = {
  introTitle: loc('外部 Pin 够不到内部的状态', 'External pins cannot reach the internal state'),
  introBody: loc(
    '芯片的状态存在成千上万个 FF 里，FF 之间隔着组合逻辑。功能向量只能从外部 Pin 进出，想把某个深处的 FF 设成 1、再读回来，往往要绕很多拍，甚至做不到。Scan 的办法是：测试时把所有 FF 串成一条移位寄存器，直接把状态移进去、移出来。',
    'A chip keeps its state in thousands of FFs, with combinational logic between them. Functional vectors only enter and leave through external pins, so setting a deep FF to 1 and reading it back can take many clocks, or be impossible. Scan solves this: in test mode all FFs are chained into one shift register, so state can be shifted straight in and out.',
  ),
  ffTitle: loc('先认识 FF', 'First, the flip-flop'),
  ffNote: loc(
    'FF（Flip-Flop，触发器）是边沿触发的 1 位存储：只在 CLK 上升沿把 D 抄到 Q，其余时间 Q 不变。它不是组合门，也和 {@latch} 讲的闩锁（Latch-up）无关。',
    'An FF (flip-flop) is a 1-bit edge-triggered store: on the rising CLK edge it copies D to Q, and Q holds at all other times. It is not a logic gate, and it has nothing to do with latch-up in {@latch}.',
  ),
  playTitle: loc('四步：Shift → Capture → Shift → Compare', 'Four steps: Shift → Capture → Shift → Compare'),
  playNote: loc(
    '先看普通 FF 怎么变成 Scan FF，再一拍一拍地走完一条 Scan Pattern。Capture 分两帧：先看组合逻辑怎样用 Q 算出 D，再看时钟沿把 D 打进 FF。可以换成有故障的芯片再走一遍。',
    'First see a plain FF become a scan FF, then run one scan pattern clock by clock. Capture takes two frames: first how the logic computes D from Q, then how the clock edge stores D in the FFs. Switch to the faulty chip and run it again.',
  ),
  advTitle: loc('实际芯片还会加什么', 'What real chips add'),
  advNote: loc(
    '四步不变，下面这些只是为了更快、更省脚或覆盖更多缺陷。现在认得名字就够了。',
    'The four steps stay the same. These additions make scan faster, use fewer pins or catch more defects. Knowing the names is enough for now.',
  ),
  colName: loc('名字', 'Name'),
  colWhat: loc('解决什么', 'What it solves'),
  advMore: loc(
    'Flush / Shift 测试（先验证链本身）、LSSD 等另一种扫描结构、Scan 专用测试机，详见 {@fScan}。',
    'Flush and shift tests (checking the chain itself), other scan styles such as LSSD, and scan testers are covered in {@fScan}.',
  ),
  takeawayTitle: loc('本课要点', 'Key points'),
  quizTitle: loc('复习题', 'Review'),
  quizNote: loc('选完立刻出对错和解释。', 'You get the answer and explanation right away.'),
  yes: loc('对。', 'Correct. '),
  no: loc('不对。', 'Not quite. '),
  kicker: loc('Scan', 'Scan'),
  // 动画图里的文字
  comb: loc('组合逻辑', 'Combinational logic'),
  combSub: loc('输入 Q1–Q4，输出 D1–D4', 'In: Q1–Q4 · Out: D1–D4'),
  hidden: loc('外部 Pin 碰不到', 'Not reachable from pins'),
  legQ: loc('Q 旧值', 'Q old'),
  legD: loc('D 新值', 'D new'),
  exp: loc('期望', 'Expected'),
  act: loc('读到', 'Read'),
  from: loc('来自', 'From'),
  figCap: loc(
    '金色方块：移入的激励；绿色方块：捕获的结果；灰色方块：下一条 Pattern。金色线是这一拍起作用的路径。Capture 两帧里，蓝色实线是 Q（FF 现在存的旧值，送进组合逻辑），橙色虚线是 D（逻辑算出的新值，等时钟沿存进 FF）。组合逻辑里每格是一个 D 的算式，Capture 时代入当前 Q 的值；FF 下方的「1→0」是 Capture 沿上 Q 的变化。',
    'Gold squares: stimulus shifted in. Green: captured result. Grey: next pattern. Gold lines are the paths active on this clock. In the two capture frames, solid blue lines are Q (the old value each FF holds, fed into the logic) and dashed orange lines are D (the new value the logic computes, stored on the clock edge). Each cell in the logic is the equation for one D; during capture it shows the current Q values plugged in. The “1→0” under each FF is how its Q changes on the capture edge.',
  ),
}

export const FF_FIG = {
  aria: loc(
    'FF 符号与波形：CLK 上升沿时 Q 变成 D，其余时间 Q 保持',
    'FF symbol and waveforms: Q takes D on the rising CLK edge and holds otherwise',
  ),
  edge: loc('上升沿采样', 'Sample on rising edge'),
  hold: loc('D 变了，Q 不跟', 'D changes, Q holds'),
  cap: loc(
    '只在 CLK 上升沿（虚线）Q 才跟上 D。两个沿之间 D 怎么变，Q 都不动：红框里 D 的窄脉冲夹在两个沿之间，没有被采到。',
    'Q follows D only on a rising CLK edge (dashed). Between edges Q ignores D: the narrow D pulse in the red box falls between two edges and is never sampled.',
  ),
}

export const ADVANCED: Array<{ id: string; name: LText; what: LText }> = [
  {
    id: 'multi',
    name: loc('多条扫描链', 'Multiple chains'),
    what: loc('一条长链 Shift 太久，切成许多短链并行移位。', 'One long chain shifts too slowly; many short chains shift in parallel.'),
  },
  {
    id: 'comp',
    name: loc('Scan 压缩', 'Scan compression'),
    what: loc('外部只用几个 SI/SO，片内解压成很多短链，再压缩回来。', 'A few external SI/SO pins feed many internal chains through a decompressor and compactor.'),
  },
  {
    id: 'speed',
    name: loc('At-speed Scan', 'At-speed scan'),
    what: loc('Capture 用接近工作频率的时钟，抓「来不及」的慢路径。', 'Capture at near-functional speed to catch slow paths.'),
  },
  {
    id: 'xmask',
    name: loc('X 屏蔽', 'X-masking'),
    what: loc('结果不确定的位（X）不参与比较，免得误判好芯片。', 'Unknown (X) bits are left out of the compare so good chips are not failed.'),
  },
  {
    id: 'bscan',
    name: loc('Boundary Scan（JTAG）', 'Boundary scan (JTAG)'),
    what: loc('管脚旁边一圈扫描单元，测板级连线，不是测片内逻辑。', 'A ring of scan cells at the pins tests board connections, not internal logic.'),
  },
  {
    id: 'lbist',
    name: loc('Logic BIST', 'Logic BIST'),
    what: loc('芯片自己产生向量、压缩结果，ATE 只比最后的签名。', 'The chip generates its own patterns and compacts results; the ATE checks only the final signature.'),
  },
]

export const TAKEAWAY: LText[] = [
  loc('FF 存状态。外部 Pin 够不到它们，所以测试时把 FF 串成扫描链。', 'FFs hold the state. Pins cannot reach them, so in test mode the FFs are chained into a scan chain.'),
  loc(
    'Scan FF = 普通 FF + 二选一 MUX，端口有 D、SI、SE、Q。SE=1 存 SI（移位），SE=0 存 D（捕获 / 正常工作）。',
    'Scan FF = plain FF + 2-to-1 MUX, with ports D, SI, SE and Q. SE=1 stores SI (shift); SE=0 stores D (capture / normal operation).',
  ),
  loc(
    'Shift 移入激励 → Capture 一拍 → Shift 移出 → Compare。Capture 时组合逻辑以刚移进去的 Q 算出 D，所有 FF 在同一个沿把 D 存下；被测的就是这一拍里的组合逻辑。',
    'Shift in the stimulus → capture one clock → shift out → compare. On capture the logic computes D from the Q just shifted in, and every FF stores its D on the same edge; that clock is what tests the logic.',
  ),
  loc('离 SO 最近的 FF 最先出来。哪一位比错，就能反查是哪个 FF 前面的逻辑有问题。', 'The FF nearest SO comes out first. The failing bit position tells you which FF, and so which logic, is at fault.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('FF 是什么？', 'What is an FF?'),
    options: [
      { id: 'gate', text: loc('和 AND 一样的组合门', 'A logic gate like AND') },
      { id: 'reg', text: loc('边沿触发的 1 位存储，芯片的状态存在这里', 'A 1-bit edge-triggered store that holds chip state') },
      { id: 'lock', text: loc('就是闩锁效应（Latch-up）', 'The same as latch-up') },
      { id: 'pin', text: loc('ATE 的一根电源脚', 'An ATE power pin') },
    ],
    answer: 'reg',
    explain: loc('Flip-Flop：CLK 上升沿把 D 抄到 Q，平时 Q 保持。', 'Flip-flop: the rising CLK edge copies D to Q; otherwise Q holds.'),
  },
  {
    id: 'q2',
    prompt: loc('为什么需要 Scan？', 'Why do we need scan?'),
    options: [
      { id: 'pretty', text: loc('让版图更好看', 'To make the layout look nicer') },
      { id: 'reach', text: loc('外部 Pin 设不了、也读不到内部 FF 的状态', 'Pins cannot set or read internal FFs') },
      { id: 'voh', text: loc('用来测 VOH', 'To measure VOH') },
      { id: 'bin', text: loc('用来印 Bin 标签', 'To print bin labels') },
    ],
    answer: 'reach',
    explain: loc('组合逻辑挡在中间。串成链才能直接移进激励、移出响应。', 'Logic sits in the way. A chain lets you shift stimulus in and response out directly.'),
  },
  {
    id: 'q3',
    prompt: loc('Scan FF 比普通 FF 多了什么？', 'What does a scan FF add to a plain FF?'),
    options: [
      { id: 'mux', text: loc('D 前一个二选一 MUX，由 SE 选择功能 D 或上一级 Q', 'A 2-to-1 MUX before D; SE picks functional D or the previous Q') },
      { id: 'pmu', text: loc('一个 PMU', 'A PMU') },
      { id: 'clk', text: loc('第二个电源', 'A second power supply') },
      { id: 'none', text: loc('什么都没加，只是改了名字', 'Nothing, only the name') },
    ],
    answer: 'mux',
    explain: loc('SE=1 时 MUX 选 SI（上一级 Q），FF 们就连成了移位寄存器；SE=0 时选 D，FF 照常工作。', 'With SE=1 the MUX picks SI (the previous Q), so the FFs form a shift register; with SE=0 it picks D and the FF works normally.'),
  },
  {
    id: 'q4',
    prompt: loc('Capture 那一拍在做什么？', 'What happens on the capture clock?'),
    options: [
      { id: 'shift', text: loc('继续移位', 'More shifting') },
      { id: 'func', text: loc('SE=0，FF 存下组合逻辑算出的 D', 'SE=0; each FF stores the D from the logic') },
      { id: 'power', text: loc('关掉电源', 'Power off') },
      { id: 'bin', text: loc('写 Bin', 'Write the bin') },
    ],
    answer: 'func',
    explain: loc('没有 Capture，移进移出的只是同一串数据，测不到组合逻辑。', 'Without capture you only shift the same data through and never test the logic.'),
  },
  {
    id: 'q4b',
    prompt: loc(
      'Capture 前 Q1–Q4 = 1 0 1 1，D2 = Q2 + Q3。Capture 时钟沿之后 Q2 是多少？',
      'Before capture Q1–Q4 = 1 0 1 1 and D2 = Q2 + Q3. What is Q2 after the capture edge?',
    ),
    options: [
      { id: '1', text: loc('1', '1') },
      { id: '0', text: loc('0，Q2 原来是 0，保持不变', '0; Q2 was 0 and stays 0') },
      { id: 'x', text: loc('X，不确定', 'X, unknown') },
      { id: 'si', text: loc('等于 FF1 的 Q（SI 端的值）', 'Equal to FF1’s Q (the SI value)') },
    ],
    answer: '1',
    explain: loc(
      'SE=0 时 FF2 存的是 D2，不是 SI。D2 = Q2 + Q3 = 0 + 1 = 1，所以沿后 Q2 从 0 变成 1。算式里用的是沿前的旧 Q。',
      'With SE=0, FF2 stores D2, not SI. D2 = Q2 + Q3 = 0 + 1 = 1, so Q2 goes from 0 to 1 on the edge. The equation uses the old Q from before the edge.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('4 位链移出时，第 3 个读出的位不对。最该怀疑哪里？', 'In a 4-bit chain, the 3rd bit shifted out is wrong. Where do you look first?'),
    options: [
      { id: 'ff2', text: loc('FF2 前面的逻辑（读出顺序是 FF4、FF3、FF2、FF1）', 'The logic before FF2 (bits come out FF4, FF3, FF2, FF1)') },
      { id: 'ff3', text: loc('一定是 FF3', 'It must be FF3') },
      { id: 'all', text: loc('整颗芯片全坏', 'The whole chip is dead') },
      { id: 'ate', text: loc('一定是 ATE 电源', 'It must be the ATE supply') },
    ],
    answer: 'ff2',
    explain: loc('离 SO 最近的 FF4 最先出来。按顺序数回去，第 3 位来自 FF2。', 'FF4, nearest SO, comes out first. Counting back, the 3rd bit came from FF2.'),
  },
  {
    id: 'q6',
    prompt: loc('Boundary Scan 和内部 Scan 的区别？', 'How does boundary scan differ from internal scan?'),
    options: [
      { id: 'same', text: loc('完全一样，只是名字不同', 'Same thing, different name') },
      { id: 'board', text: loc('Boundary Scan 测板级连线；内部 Scan 测片内逻辑', 'Boundary scan tests board connections; internal scan tests on-chip logic') },
      { id: 'fast', text: loc('Boundary Scan 就是 At-speed', 'Boundary scan is at-speed scan') },
      { id: 'pmu', text: loc('Boundary Scan 是 PMU', 'Boundary scan is a PMU') },
    ],
    answer: 'board',
    explain: loc('JTAG 的单元围在管脚旁，用来查焊接和走线。', 'JTAG cells sit next to the pins and check solder joints and traces.'),
  },
]
