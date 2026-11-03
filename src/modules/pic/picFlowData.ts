import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { ALIGN0_S, KGD_IDS, SCRAP, analyseFlow, type FlowAnalysis, type FlowId, type FlowState } from './picFlowModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const DEMO = analyseFlow({
  yAsic: 0.95,
  yEngine: 0.98,
  nEngines: 8,
  kgd: 'off',
  parallel: 1,
  alignS: ALIGN0_S,
  otherS: 20,
  enabled: { wafer: true, eic: true, kgd: true, asm: true, etest: true, asic: true, fiber: true, pkg: true },
  selected: 'wafer',
})
const YIELD_TXT = DEMO.yieldNoKgd.toFixed(3)
const UPH_TXT = DEMO.uph.toFixed(1)

export const KGD_OPTIONS = KGD_IDS.map((id) => ({
  id,
  label: id === 'off' ? loc('关', 'Off') : loc('开', 'On'),
}))

export const EN_OPTIONS = [
  { id: 'on' as const, label: loc('启用', 'Enabled') },
  { id: 'off' as const, label: loc('停用', 'Disabled') },
]

export const STEP_SHORT: Record<FlowId, LText> = {
  wafer: loc('晶圆', 'Wafer'),
  eic: loc('EIC', 'EIC'),
  kgd: loc('KGD', 'KGD'),
  asm: loc('组装', 'Asm'),
  etest: loc('引擎', 'Eng.'),
  asic: loc('ASIC', 'ASIC'),
  fiber: loc('光纤', 'Fiber'),
  pkg: loc('封装', 'Pkg'),
}

export const STEP_FULL: Record<FlowId, LText> = {
  wafer: loc('PIC 晶圆测试', 'PIC wafer test'),
  eic: loc('EIC 晶圆分选', 'EIC wafer sort'),
  kgd: loc('已知良好裸片', 'Known-good die'),
  asm: loc('光引擎组装', 'Engine assembly'),
  etest: loc('光引擎测试', 'Engine test'),
  asic: loc('与 ASIC 共封装', 'Attach to the ASIC'),
  fiber: loc('贴光纤阵列', 'Fiber attach'),
  pkg: loc('封装级终测', 'Package test'),
}

const BLURB: Record<FlowId, LText> = {
  wafer: loc(
    '当前插入点是 PIC 晶圆测试。原因：坏片在这里报废只损失晶圆（教学单位 {wafer}），比贴上 ASIC 之后便宜得多。',
    'The selected insertion is the PIC wafer test. Reason: a die scrapped here costs only the wafer (teaching unit {wafer}), which is much cheaper than a scrap after the ASIC is attached.',
  ),
  eic: loc(
    '当前插入点是 EIC 晶圆分选。原因：坏的电芯片要在和 PIC 组成光引擎之前去掉。',
    'The selected insertion is EIC wafer sort. Reason: a bad electrical die should be removed before it is built into an engine with a PIC.',
  ),
  kgd: loc(
    '当前插入点是已知良好裸片。原因：只有测过的好 PIC 才去组装，避免后面把 ASIC 一起丢掉。',
    'The selected insertion is known-good die. Reason: only a PIC that has passed test goes to assembly, so a later scrap does not throw the ASIC away with it.',
  ),
  asm: loc(
    '当前插入点是光引擎组装。原因：PIC 和 EIC 一旦装在一起，报废成本就高于裸片。',
    'The selected insertion is engine assembly. Reason: once the PIC and the EIC are built together, a scrap costs more than a bare die.',
  ),
  etest: loc(
    '当前插入点是光引擎测试。原因：打开 KGD 时，坏引擎在这里按引擎成本（教学单位 {engine}）报废，ASIC 还没贴上。',
    'The selected insertion is the engine test. Reason: with KGD on, a bad engine is scrapped here at the engine cost (teaching unit {engine}), before any ASIC is attached.',
  ),
  asic: loc(
    '当前插入点是和交换 ASIC 共封装。原因：这一步之后的报废包含 ASIC，教学单位 {late}，远高于引擎。',
    'The selected insertion is co-packaging with the switch ASIC. Reason: a scrap after this step includes the ASIC, teaching unit {late}, far above an engine.',
  ),
  fiber: loc(
    '当前插入点是贴光纤阵列。原因：光纤要对准，这一步的时间算进光学测试，不容易像电学那样多站点并行。',
    'The selected insertion is fiber-array attach. Reason: the fibers have to be aligned, so this time sits in the optical test and does not parallelize the way an electrical multi-site does.',
  ),
  pkg: loc(
    '当前插入点是封装级终测。原因：不开 KGD 时，坏引擎要拖到这里才暴露，整颗组件一起报废。',
    'The selected insertion is package test. Reason: with KGD off, a bad engine is found only here, and the whole assembly is scrapped with it.',
  ),
}

export const S = {
  kickerNow: loc('这一条流程', 'This flow'),
  introTitle: loc('从晶圆到共封装的插入点', 'Insertions from the wafer to the co-package'),
  coreTitle: loc('拨一拨：KGD、对准时间与并行度', 'Try it: KGD, align time and parallelism'),
  coreNote: loc(
    '从左到右是测试插入点。金边是启用的，灰色是停用的。点一个节点就选中它；下面的开关只改当前这个节点。报废成本按阶段变贵：晶圆便宜，贴上 ASIC 之后贵。',
    'Test insertions run from left to right. A gold outline is enabled, and grey is disabled. Click a node to select it. The switch below changes only that node. Scrap cost grows by stage: a wafer is cheap, and a scrap after the ASIC is attached is expensive.',
  ),
  teach: loc(
    '教学示意：参数来自虚拟器件 VDUT-PIC1，不对应任何代工厂工艺。',
    'Teaching illustration: values are for the virtual device VDUT-PIC1 and do not match any foundry process.',
  ),
  yAsicLabel: loc('ASIC 良率', 'ASIC yield'),
  yEngLabel: loc('单个光引擎良率', 'Yield of one engine'),
  nLabel: loc('每颗 ASIC 的光引擎数', 'Engines per ASIC'),
  kgdLabel: loc('KGD', 'KGD'),
  nParLabel: loc('光学并行度 N', 'Optical parallelism N'),
  alignLabel: loc('对准时间', 'Align time'),
  otherLabel: loc('其他测试时间', 'Other test time'),
  enLabel: loc('当前插入点', 'This insertion'),
  rYield: loc('无 KGD 的封装良率', 'Package yield with no KGD'),
  rShip: loc('当前每颗 ASIC 的出货', 'Shipped units per ASIC now'),
  rOff: loc('不开 KGD 的期望报废', 'Expected scrap with KGD off'),
  rOn: loc('打开 KGD 的期望报废', 'Expected scrap with KGD on'),
  rDelta: loc('报废差额（关 − 开）', 'Scrap delta (off − on)'),
  rUph: loc('UPH', 'UPH'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  task1: loc(
    `确认 n = 8、ASIC 良率 0.95、引擎良率 0.98、KGD 关闭时，无 KGD 的封装良率读数约为 ${YIELD_TXT}。`,
    `Confirm that with n = 8, ASIC yield 0.95, engine yield 0.98 and KGD off, the no-KGD package yield reads about ${YIELD_TXT}.`,
  ),
  task2: loc(
    '打开 KGD，并保持光引擎测试这一步启用。侧栏会比较两种报废成本。',
    'Turn KGD on and keep the engine-test step enabled. The side panel compares the two scrap costs.',
  ),
  task3: loc(
    '把对准时间调到起始值的两倍或更长，再看 UPH。',
    'Set the align time to at least twice the starting value, then read the UPH.',
  ),
  task4: loc(
    '把光学并行度调到 N = 2。侧栏会给出这时的 UPH。光纤对准使光学并行比电学多站点更难。',
    'Set the optical parallelism to N = 2. The side panel quotes the UPH. Fiber alignment makes optical parallelism harder than electrical multi-site.',
  ),
  figAria: loc('CPO 测试插入点，从左到右，可点选', 'CPO test insertions, left to right, click to select'),
  figSummary: loc(
    '选中 {step}。无 KGD 的封装良率 {y}，当前 UPH {uph}。',
    'Selected {step}. No-KGD package yield {y}, current UPH {uph}.',
  ),
}

const vNumbers = loc(
  '无 KGD 时封装良率是 {yield}，也就是 y_ASIC × y_engine^{n} = {yA} × {yE}^{n}。不开 KGD 的期望报废是 {off}，打开 KGD 且做引擎测试是 {on}，差额 {delta}。原因：坏引擎若在贴上 ASIC 之后才发现，整颗组件一起报废；测试前移是在贴装之前把坏 PIC 报废掉，ASIC 就不用跟着丢。当前 N = {npar}，UPH = {uph}。UPH = 3600 / (对准时间 / N + 其他时间)。',
  'With no KGD the package yield is {yield}, that is y_ASIC × y_engine^{n} = {yA} × {yE}^{n}. Expected scrap is {off} with KGD off and {on} with KGD on and the engine test enabled, a delta of {delta}. Reason: a bad engine found only after the ASIC is attached scraps the whole assembly. Shift-left scraps the bad PIC before attach, so the ASIC is not thrown away with it. N = {npar} and UPH = {uph}. UPH = 3600 / (align time / N + other time).',
)

const vKgdBlocked = loc(
  'KGD 开关是开的，但光引擎测试这一步是关的，所以坏引擎仍会流到后段，当前出货仍按无 KGD 的 {ship} 计算。',
  'The KGD switch is on, but the engine-test step is off, so a bad engine still flows downstream and the shipped count stays on the no-KGD value of {ship}.',
)

const vAlign = loc(
  '对准时间现在是 {align} s，已经达到起始值 {start} s 的两倍。原因：光学测试时间由对准主导，对准变慢会直接把 UPH 拉低。',
  'Align time is now {align} s, which is twice the starting value of {start} s. Reason: optical test time is dominated by alignment, so a slower align pulls UPH down directly.',
)

const vN = loc(
  '光学并行度 N = 2，UPH = {uph}。原因：UPH = 3600 / (对准时间 / N + 其他时间)。光纤要对准，光学并行比电学多站点更难。',
  'Optical parallelism is N = 2 and UPH = {uph}. Reason: UPH = 3600 / (align time / N + other time). Fibers have to be aligned, so optical parallelism is harder than electrical multi-site.',
)

export const INTRO = [
  loc(
    '一条共封装光学的路径大致是：PIC 晶圆（光学探针加电学）→ EIC 分选 → 已知良好裸片 → 光引擎组装和测试 → 与交换 ASIC 共封装 → 贴光纤 → 封装级测试。越晚发现坏片，报废里包含的 ASIC 和基板越贵。',
    'A co-packaged-optics path is roughly: PIC wafer (optical probe plus electrical test), EIC sort, known-good die, engine assembly and test, co-package with the switch ASIC, fiber attach, then package test. The later a bad die is found, the more ASIC and substrate sit inside the scrap.',
  ),
  loc(
    '良率连乘：无 KGD 时，n 个光引擎和一颗 ASIC 要同时是好的，封装良率是 y_ASIC × y_engine^n。打开 KGD 之后，坏引擎在引擎测试就报废，ASIC 不再跟着坏引擎一起丢。多站点的电学并行见 {@genMultisite}。',
    'Yields multiply. With no KGD, n engines and one ASIC all have to be good, so the package yield is y_ASIC × y_engine^n. With KGD on, a bad engine is scrapped at engine test and the ASIC is not thrown away with it. Electrical multi-site is in {@genMultisite}.',
  ),
  loc(
    '光学测试的时间主要是对准和扫描。并行度 N 把对准时间除以 N，但光纤要逐组对准，做不到电学多站点那样轻松。老化的概念见 {@relBurnIn}，这里不展开应力条件。',
    'Optical test time is mostly alignment and sweeps. Parallelism N divides the align time by N, but fibers are aligned in groups, which is harder than electrical multi-site. Burn-in as an idea is in {@relBurnIn}; the stress conditions are not developed here.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '每一步都测最安全。晚测把坏 PIC 和贵的 ASIC 绑在一起报废；早测多花的是测试时间，省下的是 ASIC。',
    'Testing every step is the safe choice. A late test scraps a bad PIC together with an expensive ASIC. An early test spends test time and saves the ASIC.',
  ),
  loc(
    '缺陷晚发现也能返修。贴上 ASIC、打上光纤之后，很多缺陷已经不能把贵的部分拆出来重用。',
    'A defect found late can still be reworked. After the ASIC is attached and the fibers are placed, many defects can no longer be separated from the expensive parts.',
  ),
  loc(
    '光学并行和电学多站点一样容易。电学多站点是多扎探针；光学每一组都要光纤对准，并行度上不去。',
    'Optical parallelism is as easy as electrical multi-site. Electrical multi-site is more probe needles. Optics has to align a fiber for each group, so the parallelism stays low.',
  ),
]

export const TAKEAWAY: LText = loc(
  '无 KGD 时封装良率是 y_ASIC × y_engine^n。测试前移是在贴 ASIC 之前找到坏 PIC，避免把 ASIC 一起报废。报废成本随阶段升高。UPH = 3600 / (对准时间 / N + 其他时间)。光纤对准使光学并行比电学多站点更难。',
  'With no KGD the package yield is y_ASIC × y_engine^n. Shift-left finds the bad PIC before it is attached to the ASIC, so the ASIC is not scrapped with it. Scrap cost grows by stage. UPH = 3600 / (align time / N + other time). Fiber alignment makes optical parallelism harder than electrical multi-site.',
)

export function taskItems(state: FlowState, analysis: FlowAnalysis): TaskItem[] {
  return [
    {
      id: 't1',
      text: S.task1,
      done:
        state.nEngines === 8 &&
        Math.abs(state.yAsic - 0.95) < 0.001 &&
        Math.abs(state.yEngine - 0.98) < 0.001 &&
        state.kgd === 'off' &&
        Math.abs(analysis.yieldNoKgd - DEMO.yieldNoKgd) < 0.001,
    },
    { id: 't2', text: S.task2, done: state.kgd === 'on' && state.enabled.etest },
    { id: 't3', text: S.task3, done: state.alignS >= 2 * ALIGN0_S - 1e-6 },
    { id: 't4', text: S.task4, done: state.parallel === 2 },
  ]
}

export function verdictOf(state: FlowState, analysis: FlowAnalysis): { title: LText; text: LText } {
  const blurb = fill(BLURB[state.selected], {
    wafer: String(SCRAP.wafer),
    engine: String(SCRAP.engine),
    late: String(SCRAP.late),
  })
  const parts: LText[] = [
    blurb,
    fill(vNumbers, {
      yield: analysis.yieldNoKgd.toFixed(3),
      yA: state.yAsic.toFixed(2),
      yE: state.yEngine.toFixed(2),
      n: String(state.nEngines),
      off: analysis.scrapOff.toFixed(2),
      on: analysis.scrapOn.toFixed(2),
      delta: analysis.scrapDelta.toFixed(2),
      npar: String(state.parallel),
      uph: analysis.uph.toFixed(1),
    }),
  ]
  if (state.kgd === 'on' && !state.enabled.etest) {
    parts.push(fill(vKgdBlocked, { ship: analysis.shippedPerAsic.toFixed(3) }))
  }
  if (state.alignS >= 2 * ALIGN0_S - 1e-6) {
    parts.push(fill(vAlign, { align: state.alignS.toFixed(0), start: String(ALIGN0_S) }))
  }
  if (state.parallel === 2) parts.push(fill(vN, { uph: analysis.uph.toFixed(1) }))
  return {
    title: STEP_FULL[state.selected],
    text: { zh: parts.map((p) => p.zh).join(''), en: parts.map((p) => p.en ?? '').join(' ') },
  }
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('测试前移在这条流程里指什么？', 'What does shift-left mean in this flow?'),
    options: [
      { id: 'a', text: loc('在坏 PIC 贴上 ASIC 之前就把它找出来，避免报废 ASIC', 'Find the bad PIC before it is attached to the ASIC, so the ASIC is not scrapped') },
      { id: 'b', text: loc('把所有测试都挪到封装完成之后', 'Move every test to after the package is finished') },
      { id: 'c', text: loc('只测最后的系统级，中间都不测', 'Test only at system level and skip everything in between') },
    ],
    answer: 'a',
    explain: loc(
      '越晚发现，报废里的 ASIC 越贵。KGD 和引擎测试就是把坏 PIC 挡在贴 ASIC 之前。',
      'The later the find, the more ASIC sits in the scrap. KGD and the engine test are how a bad PIC is stopped before the ASIC is attached.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于良率和报废，哪些说法对？(1) 无 KGD 时封装良率是 y_ASIC × y_engine^n；(2) 打开 KGD 后，坏引擎在引擎测试报废，ASIC 不必跟着丢；(3) 贴上 ASIC 之后报废更便宜；(4) 晶圆级报废比封装级报废便宜。',
      'Which statements about yield and scrap are right? (1) With no KGD the package yield is y_ASIC × y_engine^n; (2) with KGD on, a bad engine is scrapped at engine test and the ASIC need not be thrown away with it; (3) a scrap after the ASIC is attached is cheaper; (4) a wafer scrap is cheaper than a package scrap.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)', '(2), (3)') },
    ],
    answer: 'a',
    explain: loc(
      '(1)、(2)、(4) 对。(3) 反了：贴上 ASIC 之后，报废包含 ASIC 和基板，比晶圆和引擎都贵。',
      '(1), (2) and (4) are right. (3) is backwards: after the ASIC is attached, the scrap includes the ASIC and the substrate, which costs more than a wafer or an engine.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      'ASIC 良率 0.95，8 个光引擎各 0.98，没有 KGD。封装良率大约是多少？',
      'ASIC yield is 0.95 and each of 8 engines is 0.98, with no KGD. About what is the package yield?',
    ),
    options: [
      { id: 'a', text: loc('0.950', '0.950') },
      { id: 'b', text: loc(YIELD_TXT, YIELD_TXT) },
      { id: 'c', text: loc('0.980', '0.980') },
    ],
    answer: 'b',
    explain: loc(
      `0.95 × 0.98^8 = ${YIELD_TXT}。八个引擎连乘之后已经不到 0.86，再乘 ASIC 良率就是这个数。`,
      `0.95 × 0.98^8 = ${YIELD_TXT}. Eight engines multiplied together are already under 0.86, and the ASIC yield brings it to this number.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '对准时间 30 s，其他测试 20 s，光学并行度 N = 1。UPH 大约是多少？',
      'Align time is 30 s, other test time is 20 s, and optical parallelism N = 1. About what is the UPH?',
    ),
    options: [
      { id: 'a', text: loc('36', '36') },
      { id: 'b', text: loc(UPH_TXT, UPH_TXT) },
      { id: 'c', text: loc('144', '144') },
    ],
    answer: 'b',
    explain: loc(
      `UPH = 3600 / (30/1 + 20) = 3600/50 = ${UPH_TXT}。对准时间翻倍，分母变大，UPH 下降。`,
      `UPH = 3600 / (30/1 + 20) = 3600/50 = ${UPH_TXT}. Doubling the align time grows the denominator and UPH falls.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于 UPH 和并行，哪些说法对？(1) UPH = 3600 / (对准时间/N + 其他时间)；(2) N = 2 时对准时间在公式里被除以 2；(3) 光学并行和电学多站点一样容易；(4) 光纤对准是光学并行上不去的原因。',
      'Which statements about UPH and parallelism are right? (1) UPH = 3600 / (align time/N + other time); (2) at N = 2 the align time is divided by 2 in the formula; (3) optical parallelism is as easy as electrical multi-site; (4) fiber alignment is why optical parallelism stays limited.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)', '(2), (3)') },
    ],
    answer: 'a',
    explain: loc(
      '(1)、(2)、(4) 对。(3) 不对：每一组光纤都要对准，不能像多扎几根探针那样简单加倍。',
      '(1), (2) and (4) are right. (3) is wrong: each group of fibers has to be aligned, which does not double as simply as adding probe needles.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('KGD 打开、但光引擎测试这一步被关掉时，会发生什么？', 'What happens if KGD is on but the engine-test step is turned off?'),
    options: [
      { id: 'a', text: loc('坏引擎没有地方被拦下，仍会和 ASIC 一起走到后段', 'A bad engine has nowhere to be stopped, and it still travels downstream with the ASIC') },
      { id: 'b', text: loc('良率自动变成 1', 'The yield automatically becomes 1') },
      { id: 'c', text: loc('对准时间被取消', 'The align time is cancelled') },
    ],
    answer: 'a',
    explain: loc(
      'KGD 要靠引擎测试这个插入点才生效。这一步关着，坏引擎就流到贴 ASIC 之后，报废回到贵的那一档。',
      'KGD works only if the engine-test insertion is actually there. With that step off, a bad engine flows past ASIC attach and the scrap returns to the expensive tier.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('报废成本随阶段升高，主要贵在哪里？', 'Scrap cost grows by stage. What makes the later scrap expensive?'),
    options: [
      { id: 'a', text: loc('贴上 ASIC 和基板之后，坏的光引擎会把这些贵的部分一起报废', 'After the ASIC and the substrate are attached, a bad engine scraps those expensive parts with it') },
      { id: 'b', text: loc('晶圆本身比 ASIC 贵', 'The wafer itself costs more than the ASIC') },
      { id: 'c', text: loc('暗电流筛选比光学更慢', 'A dark-current screen is slower than optics') },
    ],
    answer: 'a',
    explain: loc(
      '教学单位里，晶圆和单个引擎远低于贴上 ASIC 之后的整颗组件。所以坏 PIC 要在贴装之前处理掉。',
      'In the teaching units, a wafer and a single engine cost far less than the assembly after the ASIC is attached. A bad PIC has to be caught before that attach.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('对准时间翻倍，其他条件不变。UPH 会怎样？', 'Align time doubles and nothing else changes. What happens to UPH?'),
    options: [
      { id: 'a', text: loc('UPH 下降，因为分母里的对准时间变大', 'UPH falls, because the align time in the denominator grows') },
      { id: 'b', text: loc('UPH 翻倍', 'UPH doubles') },
      { id: 'c', text: loc('UPH 不变，因为良率没变', 'UPH stays the same, because the yield did not change') },
    ],
    answer: 'a',
    explain: loc(
      'UPH 只看时间，不看良率。对准变慢，每小时测完的颗数就少。要补回来，只能提高光学并行度，而光纤对准让这件事很难。',
      'UPH looks at time, not at yield. A slower align means fewer units per hour. Raising optical parallelism is the way back, and fiber alignment makes that hard.',
    ),
  },
]
