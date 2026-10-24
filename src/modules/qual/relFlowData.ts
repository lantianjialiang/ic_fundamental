import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { BIN, COT_BUDGET, NODE_INFO, PPM_TARGET, type BinNo, type FlowResult, type FlowState, type NodeId, type TraceKey } from './relFlowModel'

/** 占位替换：把 {name} 换成数字或文字，中英文都替换 */
export function fillText(text: LText, vars: Record<string, string>): LText {
  const apply = (s: string) => Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(v), s)
  return { zh: apply(text.zh), en: text.en === undefined ? undefined : apply(text.en) }
}

/** 两段结论拼成一段（用于右侧说明栏追加一句原因） */
function joinText(a: LText, b: LText): LText {
  return { zh: `${a.zh}${b.zh}`, en: `${a.en ?? a.zh} ${b.en ?? b.zh}` }
}

export const NODE_NAME: Record<NodeId, LText> = {
  cpRoom: loc('CP 室温（25 °C）', 'CP at room (25 °C)'),
  cpHot: loc('CP 高温（125 °C）', 'CP hot (125 °C)'),
  bi: loc('Burn-in（125 °C，老化炉）', 'Burn-in (125 °C, oven)'),
  ftCold: loc('FT 低温（−40 °C）', 'FT cold (−40 °C)'),
  ftRoom: loc('FT 室温（25 °C）', 'FT room (25 °C)'),
  ftHot: loc('FT 高温（125 °C）', 'FT hot (125 °C)'),
  pat: loc('PAT 统计后处理', 'PAT post-processing'),
  relSample: loc('可靠性监控抽检（77 颗，示例，以现行标准为准）', 'Reliability monitor sample (77 units; example, follow the current standard)'),
}

/** 节点在图中的短代码（CP / FT 是术语，两种语言都保留） */
export const NODE_CODE: Partial<Record<NodeId, string>> = {
  cpRoom: 'CP',
  cpHot: 'CP',
  ftCold: 'FT',
  ftRoom: 'FT',
  ftHot: 'FT',
}

export const BIN_NAME: Record<BinNo, LText> = {
  1: loc('PASS（出货）', 'PASS (shipped)'),
  2: loc('硬失效（功能、开短路）', 'Hard fail (function, open/short)'),
  3: loc('低温参数超限', 'Cold parameter out of limit'),
  4: loc('高温参数超限', 'Hot parameter out of limit'),
  5: loc('PAT 动态限值剔除', 'PAT dynamic-limit reject'),
  6: loc('邻近规则误杀（好 die）', 'Neighbourhood reject (good die)'),
  7: loc('Burn-in 早期失效', 'Burn-in early failure'),
}

export const TRACE_NAME: Record<TraceKey, LText> = {
  lot: loc('Lot 号写入 MIR', 'Lot ID written to MIR'),
  coords: loc('CP 写入晶圆坐标（X/Y）', 'Wafer X/Y written at CP'),
  temp: loc('每次测试记录温度（TST_TEMP）', 'Test temperature recorded (TST_TEMP)'),
  patData: loc('PAT 有坐标可用（邻近规则要用）', 'PAT has coordinates (the neighbourhood rule needs them)'),
  biRead: loc('Burn-in 前后各有一次读点', 'Read points before and after burn-in'),
}

export const S = {
  kickerNow: loc('这一次流程', 'This flow'),
  introTitle: loc('从 CP 到 FT：一颗车规芯片要过几道关', 'From CP to FT: the gates an automotive chip passes'),
  coreTitle: loc('拨一拨：排流程、开关站点、调 soak 与 Burn-in', 'Try it: order the flow, switch stations, tune soak and burn-in'),
  coreNote: loc(
    '下面的虚拟群体约 2500 颗（8 片晶圆）。每个站只能抓到它覆盖的缺陷；每次温度切换都要 soak，直接影响 UPH 与测试成本。所有数字都是教学示意值，用来比较方案。',
    'The virtual population is about 2500 devices (8 wafers). Each station only catches the defects it covers; every temperature change needs a soak, which directly affects UPH and test cost. All numbers are teaching illustrations for comparing options.',
  ),
  flowTitle: loc('流程节点（按显示顺序执行，可排序、可启用）', 'Flow nodes (run in display order; reorder or enable)'),
  flowNote: loc('温度从室温 25 °C 开始。相邻两个测试站温度不同，才需要一次 soak。', 'The temperature starts at room, 25 °C. A soak is only needed when two consecutive test stations differ in temperature.'),
  moveUp: loc('上移', 'Move up'),
  moveDown: loc('下移', 'Move down'),
  soakLabel: loc('每次温度切换的 soak 时间', 'Soak time per temperature change'),
  biLabel: loc('Burn-in 时间（125 °C，教学值）', 'Burn-in time (125 °C, teaching value)'),
  patKLabel: loc('PAT 的 k（median ± k·σ_rob）', 'PAT k (median ± k·σ_rob)'),
  patWinLabel: loc('PAT 计算窗口', 'PAT window'),
  winLot: loc('整 Lot', 'Whole lot'),
  winWafer: loc('单晶圆', 'Single wafer'),
  nbrLabel: loc('邻近规则（依附 PAT 运行）', 'Neighbourhood rule (runs with PAT)'),
  nbrOn: loc('启用邻近规则', 'Enable the neighbourhood rule'),
  nbrRLabel: loc('半径（die 间距）', 'Radius (die pitch)'),
  nbrMLabel: loc('半径内最少失效数', 'Minimum fails within radius'),
  problemTitle: loc('虚拟群体里的三类问题（比例可调，示例值）', 'Three kinds of problems in the population (adjustable, example values)'),
  hardLabel: loc('硬失效比例', 'Hard-fail rate'),
  shiftLabel: loc('温度相关参数偏移比例', 'Temperature-dependent shift rate'),
  latentLabel: loc('潜在缺陷比例（规格内）', 'Latent-defect rate (within spec)'),
  rYield: loc('良率（期望）', 'Yield (expected)'),
  rPpm: loc('出货后早期失效 ppm（期望）', 'Early-life ppm after shipping (expected)'),
  rCot: loc('测试成本 $ / 良品', 'Test cost $ / good unit'),
  rUph: loc('UPH（颗 / 小时）', 'UPH (units / hour)'),
  rTd: loc('测试机总时间 T_td', 'Total tester time T_td'),
  rChanges: loc('温度切换次数', 'Temperature changes'),
  rTrace: loc('追溯完整度', 'Traceability completeness'),
  rRel: loc('抽检命中逃逸的概率', 'Chance the monitor sample hits an escape'),
  rOff: loc('未启用', 'Not enabled'),
  tempAria: loc('测试温度随测试站顺序变化的折线图', 'Line chart of test temperature across the test stations in order'),
  tempCap: loc(
    '每个点是一个测试站，纵轴是测试温度。相邻两点温度不同时要 soak（图中标 soak）；只有对应温度的站能抓到温度相关的参数偏移。',
    'Each point is a test station; the vertical axis is the test temperature. Where neighbouring points differ, a soak is needed (marked soak). Only the station at the matching temperature can catch a temperature-dependent shift.',
  ),
  tempEmpty: loc('没有启用的测试站，温度曲线为空。', 'No test station is enabled, so the temperature profile is empty.'),
  paretoAria: loc('各 Bin 期望件数的条形图（Bin Pareto）', 'Bar chart of expected counts per bin (bin Pareto)'),
  paretoTitle: loc('Bin Pareto：期望件数（从多到少）', 'Bin Pareto: expected counts (largest first)'),
  paretoCap: loc(
    '条形越长，这一类拒收越多。潜在缺陷在规格内，所以 Burn-in 是它的主要拒收来源；温度偏移只会被对应温度的站拒掉。',
    'Longer bars mean more rejects in that class. Latent defects are within spec, so burn-in is their main reject source; a temperature shift is only rejected by the station at that temperature.',
  ),
  reportTitle: loc('批次报告', 'Batch report'),
  rLot: loc('Lot {lot}：{n} 颗，{wafers} 片晶圆', 'Lot {lot}: {n} devices, {wafers} wafers'),
  rFlow: loc('流程：{flow}', 'Flow: {flow}'),
  rFlowNone: loc('流程：没有启用的节点', 'Flow: no node enabled'),
  rYieldLine: loc('良率 {y}%，出货后早期失效 {ppm} ppm（期望）', 'Yield {y}%, early-life ppm after shipping {ppm} (expected)'),
  rTimeLine: loc('T_td = {td} s（接触 {touch} s + soak {soak} s，{changes} 次切换，{batches} 批）', 'T_td = {td} s (contact {touch} s + soak {soak} s; {changes} changes, {batches} batches)'),
  rCostLine: loc('UPH {uph}，测试成本 ${cot} / 良品（预算 ${budget}）', 'UPH {uph}, test cost ${cot} / good unit (budget ${budget})'),
  rTraceLine: loc('追溯完整度 {trace}%', 'Traceability completeness {trace}%'),
  rStdfNote: loc('导出的 STDF 是对每颗器件的 Bin 概率做一次固定 seed 的抽样，件数会与期望值有小的偏差。', 'The exported STDF draws each device’s bin once with a fixed seed, so its counts differ slightly from the expected values.'),
  exportBtn: loc('导出 STDF', 'Export STDF'),
  exported: loc('已导出：可用 GEN-01 的解析器打开，核对 MIR 的温度与 PRR 的 Lot、坐标字段。', 'Exported. Open it with the GEN-01 parser and check the temperature in MIR and the Lot and coordinate fields in PRR.'),
  exportNote: loc('默认文件名以批号开头，便于在解析器里找到。', 'The default file name starts with the Lot ID so you can find it easily in the parser.'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。多选题用组合选项。', 'Pick an answer to see right or wrong with an explanation. Multi-select questions use combination options.'),
  asideLater: loc(
    '真实产线还有测试机并行站数、handler 产能、良率爬坡和成本模型的细节；这里只用一套示意参数，数字用于比较方案，不代表任何具体产品。',
    'A real line also has parallel test sites, handler capacity, yield ramp and detailed cost models; here one illustrative set of parameters is used only to compare options, not any real product.',
  ),
  task1: fillText(
    loc('达到 ppm 目标 {ppm} 且测试成本不超过 ${budget}', 'Reach the {ppm} ppm target with test cost at or below ${budget}'),
    { ppm: PPM_TARGET.toString(), budget: COT_BUDGET.toFixed(2) },
  ),
  task2: loc('分别试 Burn-in 方案和 PAT+邻近方案，比较 ppm 与良率', 'Try the burn-in scheme and the PAT plus neighbourhood scheme; compare ppm and yield'),
  task3: loc('把 soak 的取值从小调到大（相差 120 s 以上），看 UPH 与成本怎样变', 'Move soak over a range of at least 120 s and watch how UPH and cost change'),
  task4: loc('导出 STDF，用 GEN-01 的解析器核对温度与 Lot、坐标字段', 'Export the STDF and check the temperature, Lot and coordinate fields with the GEN-01 parser'),
}

export const INTRO = [
  loc(
    '车规芯片的量产测试是一条流程，而不是一道测试：CP（晶圆测试）在封装前挑出坏 die；FT（成品测试）在封装后于三个温度下测试；中间可以插入 Burn-in 老化筛选，末端可以加 PAT 统计筛选。每一站抓到的缺陷不同，站的顺序与温度也决定了测试成本和 UPH。三温测试的意义见 {@relAuto}。',
    'Automotive production test is a flow rather than a single test: CP (wafer sort) screens bad die before packaging; FT (final test) runs at three temperatures after packaging; burn-in can be inserted between them and PAT statistical screening can be added at the end. Each station catches different defects, and the order and temperatures of the stations also set the test cost and UPH. The meaning of three-temperature testing is in {@relAuto}.',
  ),
  loc(
    '这一课把 VDUT-AUTO1 的虚拟群体（约 2500 颗）放进流程里跑一遍：硬失效、温度相关的参数偏移、规格内的潜在缺陷各占一定比例。你要在 ppm 目标与测试成本预算之间找一个可行的流程，并导出带温度与坐标的 STDF。Burn-in 的加速逻辑见 {@relBurnIn}，PAT 的限值与邻近规则见 {@relPat}。',
    'This lesson runs the VDUT-AUTO1 virtual population (about 2500 devices) through the flow. Hard fails, temperature-dependent parameter shifts and within-spec latent defects each make up a share of it. Find a flow that meets both the ppm target and the test-cost budget, then export an STDF with temperature and coordinates. The acceleration logic of burn-in is in {@relBurnIn}; PAT limits and the neighbourhood rule are in {@relPat}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '测试项越多越安全。每多一站都占测试机时间，还会增加温度切换和 soak；同一温度重复测试不会多抓到缺陷。要看的是每一站覆盖了什么缺陷。',
    'More test items are always safer. Every extra station takes tester time and can add temperature changes and soaks; repeating a test at the same temperature catches no new defects. What matters is which defects each station covers.',
  ),
  loc(
    '三温可以随意省略。温度相关的参数偏移只在对应温度超限。去掉 FT 低温站，冷端偏移的器件会全部漏出去，ppm 明显上升（见右侧读数）。',
    'The three temperatures can be skipped freely. A temperature-dependent shift only exceeds its limit at one temperature. Remove the FT cold station and the cold-shift devices all escape, so ppm rises clearly (see the readouts).',
  ),
  loc(
    '追溯是事后补记。坐标和温度要在测试时写入 STDF（MIR 的温度、PRR 的 X/Y 与 PART_ID）。事后补记既不完整也不可靠，Burn-in 的前后读点也必须当时记录。',
    'Traceability can be filled in afterwards. The temperature, X/Y coordinates and PART_ID must be written into the STDF during the test (temperature in MIR, X/Y and PART_ID in PRR). Filling them in later is neither complete nor reliable, and burn-in read points must also be recorded at the time.',
  ),
  loc(
    '邻近规则越宽越安全。半径大或最少失效数小，会误杀很多好 die，良率下降；而潜在缺陷如果是孤立分布，邻近规则几乎抓不到它。',
    'A wider neighbourhood rule is always safer. A large radius or a low minimum-fail count rejects many good die and lowers yield; if latent defects are scattered rather than clustered, the neighbourhood rule barely catches them.',
  ),
]

export const TAKEAWAY: LText = loc(
  'CP 与 FT 各站按温度覆盖缺陷：硬失效任何站都能抓，温度偏移只有对应温度的站能抓。Burn-in 用 h·AF 的等效时间把潜在缺陷的早期失效提前暴露；PAT 与邻近规则抓规格内的离群与成簇缺陷，两者互补，不能互相替代。每次温度切换的 soak 都占测试机时间，拉低 UPH、抬高测试成本；STDF 要在测试时写入温度、Lot 与坐标，才能追溯和复核。',
  'Each CP and FT station covers defects by temperature: hard fails are caught by any station, while a temperature shift is only caught at its own temperature. Burn-in brings latent defects’ early failures forward using an equivalent time of h·AF; PAT and the neighbourhood rule catch within-spec outliers and clustered defects, complementing rather than replacing each other. Each soak takes tester time, lowering UPH and raising test cost; the STDF must record temperature, Lot and coordinates at test time for traceability.',
)

/** 右侧说明栏：按当前结果给结论，并写出原因 */
export function verdictOf(state: FlowState, r: FlowResult): { title: LText; text: LText } {
  const ppmOk = r.ppm <= PPM_TARGET
  const costOk = r.cot <= COT_BUDGET
  const anyTest = r.nodes.some((x) => NODE_INFO[x.id].temp !== null)
  const vars = {
    ppm: Math.round(r.ppm).toString(),
    target: PPM_TARGET.toString(),
    cot: r.cot.toFixed(3),
    budget: COT_BUDGET.toFixed(2),
    n: r.escBy.shift.toFixed(1),
    h: r.escBy.hard.toFixed(1),
    s: r.escBy.shift.toFixed(1),
    l: r.escBy.latent.toFixed(1),
    lat: r.escBy.latent.toFixed(1),
  }

  let title: LText
  let text: LText
  if (!anyTest) {
    title = loc('没有测试站', 'No test station')
    text = loc(
      '所有器件不经测试直接出货，良率和 ppm 都没有意义。至少打开一个测试站，例如 CP 室温。',
      'Every device ships without a test, so yield and ppm are meaningless. Turn on at least one test station, for example CP at room.',
    )
  } else if (r.escBy.shift >= 0.5) {
    title = loc('温度相关的参数偏移漏出去了', 'Temperature-dependent parameter shifts escaped')
    text = fillText(
      loc(
        '期望漏出 {n} 颗。这类器件只在某一温度超限，常温测不到。低温偏移要靠 FT 低温站，高温偏移要靠 CP 高温或 FT 高温站。',
        'About {n} devices escape. These parts only exceed the limit at one temperature, so a room test misses them. Cold shifts need the FT cold station; hot shifts need CP hot or FT hot.',
      ),
      vars,
    )
  } else if (!state.on.bi && !state.on.pat && r.escBy.latent >= 0.5) {
    title = loc('潜在缺陷没有被筛掉', 'Latent defects were not screened out')
    text = fillText(
      loc(
        '潜在缺陷在规格内，常温测试抓不住。现在既没有 Burn-in，也没有统计筛选，它们几乎全部带到现场，ppm 约 {ppm}。Burn-in 用 h·AF 的等效时间把弱群体提前失效，可以在出货前拿掉一部分。',
        'Latent defects are within spec, so a room test cannot see them. With no burn-in and no statistical screen, almost all of them reach the field: about {ppm} ppm. Burn-in applies an equivalent time of h·AF, bringing the weak population’s failures forward so that some fail before shipment.',
      ),
      vars,
    )
  } else if (ppmOk && costOk) {
    title = loc('ppm 与成本都达标', 'ppm and cost both meet the targets')
    text = fillText(
      loc(
        'ppm 约 {ppm}（目标 {target}），测试成本 ${cot}（预算 ${budget}）。成本主要来自测试机时间（含 soak）和 Burn-in。可以试着缩短 soak，看 UPH 和成本怎样变。',
        'ppm is about {ppm} (target {target}) and the test cost is ${cot} (budget ${budget}). Cost comes mainly from tester time, including soak, and from burn-in. Try a shorter soak to see how UPH and cost change.',
      ),
      vars,
    )
  } else if (ppmOk) {
    title = loc('ppm 达标，但成本超预算', 'ppm meets the target, but cost is over budget')
    text = fillText(
      loc(
        '测试成本 ${cot}，超过预算 ${budget}。每次温度切换都要 soak，批数越多、soak 越长，测试机时间越长，UPH 越低；Burn-in 按件·小时计费。缩短 soak、减少温度切换或缩短 Burn-in 都能降低成本，但要留意 ppm。',
        'Test cost is ${cot}, above the budget of ${budget}. Each temperature change needs a soak; more batches and longer soaks mean more tester time and lower UPH, and burn-in is billed per part-hour. A shorter soak, fewer temperature changes or a shorter burn-in lowers cost, but watch the ppm.',
      ),
      vars,
    )
  } else if (costOk) {
    title = loc('ppm 还没达标', 'ppm is still above the target')
    text = fillText(
      loc(
        'ppm 约 {ppm}，目标 {target}。逃逸分别来自硬失效 {h}、温度偏移 {s}、潜在缺陷 {l}（期望件数）。先找出占比最大的那一类，再选对应的站：潜在缺陷多，就加长 Burn-in 或打开 PAT。',
        'ppm is about {ppm} against a target of {target}. Escapes come from hard fails {h}, temperature shifts {s} and latent defects {l} (expected counts). Find the largest class first and choose the matching station: if latent defects dominate, lengthen burn-in or enable PAT.',
      ),
      vars,
    )
  } else {
    title = loc('ppm 与成本都没达标', 'ppm and cost are both over target')
    text = fillText(
      loc(
        'ppm 约 {ppm}（目标 {target}），测试成本 ${cot}（预算 ${budget}）。先把 ppm 压到目标：Burn-in 时间与温度覆盖通常最直接，再用 soak 与节点顺序回收成本。',
        'ppm is about {ppm} (target {target}) and the test cost is ${cot} (budget ${budget}). First bring the ppm down to target: burn-in time and temperature coverage are usually the most direct levers; then recover cost with the soak and the station order.',
      ),
      vars,
    )
  }

  if (state.on.pat && state.nbrOn) {
    const nbrN = r.bins[BIN.nbr]
    const note =
      r.nbrLatentN < 0.5
        ? loc(
            '邻近规则额外拒掉 {nbr} 颗好 die（期望），其中潜在缺陷只有 {nl} 颗：这批潜在缺陷大多是孤立的，没有形成簇，所以邻近规则主要是在误杀好 die。',
            'The neighbourhood rule also rejects {nbr} good die (expected), of which only {nl} are latent defects: most latent defects here are isolated rather than clustered, so the rule mainly causes false rejects.',
          )
        : loc(
            '邻近规则额外拒掉 {nbr} 颗（期望），其中 {nl} 颗是潜在缺陷：失效聚簇附近的潜在缺陷被一起抓到。',
            'The neighbourhood rule also rejects {nbr} devices (expected), of which {nl} are latent defects: latent defects near a failure cluster are caught along with it.',
          )
    text = joinText(text, fillText(note, { nbr: nbrN.toFixed(1), nl: r.nbrLatentN.toFixed(1) }))
  }
  return { title, text }
}

/** 四张任务卡：T1 由当前结果判定，T2–T4 记录用户是否试过（与 GEN-01 的做法一致） */
export function taskItems(
  r: FlowResult,
  schemes: string[],
  soakSeen: number[],
  exported: boolean,
): TaskItem[] {
  const spread = soakSeen.length > 0 ? Math.max(...soakSeen) - Math.min(...soakSeen) : 0
  return [
    { id: 't1', text: S.task1, done: r.passN > 0 && r.ppm <= PPM_TARGET && r.cot <= COT_BUDGET },
    { id: 't2', text: S.task2, done: schemes.includes('bi') && schemes.includes('patNbr') },
    { id: 't3', text: S.task3, done: spread >= 120 },
    { id: 't4', text: S.task4, done: exported },
  ]
}

/* 小测：多选题用组合选项；数值题的计算过程写在解析里 */
export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '哪一个测试站能抓到“只在 −40 °C 才超限”的参数偏移？',
      'Which test station can catch a parameter that exceeds its limit only at −40 °C?',
    ),
    options: [
      { id: 'a', text: loc('CP 室温（25 °C）', 'CP at room (25 °C)') },
      { id: 'b', text: loc('FT 低温（−40 °C）', 'FT cold (−40 °C)') },
      { id: 'c', text: loc('CP 高温（125 °C）', 'CP hot (125 °C)') },
    ],
    answer: 'b',
    explain: loc(
      '器件只在 −40 °C 超限，室温和高温测试都看不到它。只有 FT 低温站在 −40 °C 测试，所以只有它能抓到。',
      'The device only exceeds its limit at −40 °C, so room and hot tests cannot see it. Only the FT cold station tests at −40 °C, so only it can catch it.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '下面哪两条说法都正确？A. 只开 CP 室温站时，温度相关的参数偏移会全部漏出去。B. 增大 soak 时间会降低 UPH 并抬高测试成本。C. 只要 PAT 足够严格，就能完全替代 Burn-in。D. 追溯信息可以等测试结束后再补记。',
      'Which two statements are correct? A. With only the CP room station on, all temperature-dependent parameter shifts escape. B. A longer soak lowers UPH and raises test cost. C. A strict enough PAT can fully replace burn-in. D. Traceability data can be filled in after testing ends.',
    ),
    options: [
      { id: 'a', text: loc('B 和 C', 'B and C') },
      { id: 'b', text: loc('C 和 D', 'C and D') },
      { id: 'c', text: loc('A 和 B', 'A and B') },
      { id: 'd', text: loc('A、B、D', 'A, B and D') },
    ],
    answer: 'c',
    explain: loc(
      'A 对：常温站抓不到温度偏移，只有对应温度的站才行。B 对：soak 占机时间，T_td 变长，UPH = 3600·N/T_td 下降，每颗的测试成本随之上升。C 错：PAT 按统计限值剔除偏离较大的器件，潜在缺陷的早期失效要靠 Burn-in。D 错：温度与坐标要在测试时写入 STDF。',
      'A is correct: a room station cannot see temperature shifts; only the station at that temperature can. B is correct: soak uses tester time, so T_td grows, UPH = 3600·N/T_td falls and the cost per unit rises. C is wrong: PAT rejects devices that sit far from the statistical median, while early failures of latent defects need burn-in. D is wrong: temperature and coordinates must be written during the test.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '下面哪两条说法成立？A. 去掉 FT 低温站，冷端偏移的器件会漏出去，ppm 上升。B. Burn-in 关闭时，潜在缺陷会全部带到现场，ppm 很高。C. 去掉 CP 室温站，硬失效会在 FT 室温站被抓到，ppm 不变。',
      'Which two statements hold? A. Removing the FT cold station lets cold-shift devices escape and ppm rises. B. With burn-in off, latent defects all reach the field and ppm is high. C. Removing the CP room station means hard fails are caught at FT room, so ppm does not change.',
    ),
    options: [
      { id: 'a', text: loc('A 和 C', 'A and C') },
      { id: 'b', text: loc('B 和 C', 'B and C') },
      { id: 'c', text: loc('A、B、C', 'A, B and C') },
      { id: 'd', text: loc('A 和 B', 'A and B') },
    ],
    answer: 'd',
    explain: loc(
      'A 对：只有 FT 低温站能在 −40 °C 抓到冷端偏移，去掉后模拟结果里 ppm 明显上升。B 对：潜在缺陷在规格内，只能靠 Burn-in 或统计筛选；不做就几乎全部逃逸。C 错：去掉 CP 室温后，硬失效仍会在 FT 室温站被拒，但 CP 的坐标和追溯会受影响。',
      'A is correct: only the FT cold station catches cold shifts at −40 °C, and removing it clearly raises ppm in the simulation. B is correct: latent defects are within spec, so only burn-in or statistical screening removes them; without them almost all escape. C is wrong: hard fails are still rejected at FT room, but the CP coordinates and traceability are affected.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      'Burn-in 在 125 °C 下运行 24 h（教学示例：Ea = 0.7 eV，使用温度 55 °C，AF ≈ 77.7）。它等效于多少小时的使用时间？',
      'Burn-in runs for 24 h at 125 °C (teaching example: Ea = 0.7 eV, use temperature 55 °C, AF ≈ 77.7). How many hours of use does that equal?',
    ),
    options: [
      { id: 'a', text: loc('1865 h', '1865 h') },
      { id: 'b', text: loc('24 h', '24 h') },
      { id: 'c', text: loc('77.7 h', '77.7 h') },
    ],
    answer: 'a',
    explain: loc(
      '等效使用时间 = 试验时间 × AF = 24 × 77.7 ≈ 1865 h。AF 是倍数，要乘以试验时间；直接取 24 h 或 77.7 h 都不对。',
      'Equivalent use time = test time × AF = 24 × 77.7 ≈ 1865 h. AF is a multiplier and must be multiplied by the test time; taking 24 h or 77.7 h directly is wrong.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '2000 颗器件，每批 500 颗，流程里有 4 次温度切换，每次 soak 60 s。总 soak 时间是多少？',
      '2000 devices in batches of 500, with 4 temperature changes and a 60 s soak each. What is the total soak time?',
    ),
    options: [
      { id: 'a', text: loc('240 s', '240 s') },
      { id: 'b', text: loc('480 s', '480 s') },
      { id: 'c', text: loc('960 s', '960 s') },
    ],
    answer: 'c',
    explain: loc(
      '批数 = 2000 / 500 = 4。总 soak = 4 次切换 × 4 批 × 60 s = 960 s。soak 按批计，批数越多，同样的切换次数付出的代价越大。',
      'Batches = 2000 / 500 = 4. Total soak = 4 changes × 4 batches × 60 s = 960 s. Soak is paid per batch, so more batches make the same number of changes cost more.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      'N = 1200 颗，测试机总时间 T_td = 4800 s。UPH 是多少？（UPH = 3600 × N / T_td）',
      'N = 1200 devices and total tester time T_td = 4800 s. What is UPH? (UPH = 3600 × N / T_td)',
    ),
    options: [
      { id: 'a', text: loc('900 颗/小时', '900 units/hour') },
      { id: 'b', text: loc('1200 颗/小时', '1200 units/hour') },
      { id: 'c', text: loc('4 颗/小时', '4 units/hour') },
    ],
    answer: 'a',
    explain: loc(
      'UPH = 3600 × 1200 / 4800 = 900 颗/小时。UPH 与 T_td 成反比：soak 增加，T_td 增加，UPH 下降。',
      'UPH = 3600 × 1200 / 4800 = 900 units/hour. UPH is inversely proportional to T_td: a longer soak increases T_td and lowers UPH.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('出货 100000 颗，其中 3 颗在现场失效。ppm 是多少？', '100000 units shipped, of which 3 fail in the field. What is the ppm?'),
    options: [
      { id: 'a', text: loc('30 ppm', '30 ppm') },
      { id: 'b', text: loc('300 ppm', '300 ppm') },
      { id: 'c', text: loc('3 ppm', '3 ppm') },
    ],
    answer: 'a',
    explain: loc(
      'ppm = 3 / 100000 × 10⁶ = 30。ppm 是每一百万件中的失效件数，只看比例，不看绝对件数。',
      'ppm = 3 / 100000 × 10⁶ = 30. ppm is the number of failures per million units, so only the proportion matters, not the absolute count.',
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '默认流程有 4 次温度切换（起点 25 °C，经过 125、−40、25、125）。下面哪种排序的切换最少？',
      'The default flow has 4 temperature changes (start at 25 °C, then 125, −40, 25, 125). Which ordering has the fewest changes?',
    ),
    options: [
      { id: 'a', text: loc('CP 室温、CP 高温、FT 低温、FT 室温、FT 高温（默认）', 'CP room, CP hot, FT cold, FT room, FT hot (default)') },
      { id: 'b', text: loc('CP 室温、FT 室温、CP 高温、FT 高温、FT 低温', 'CP room, FT room, CP hot, FT hot, FT cold') },
      { id: 'c', text: loc('FT 低温、CP 高温、FT 高温、CP 室温、FT 室温', 'FT cold, CP hot, FT hot, CP room, FT room') },
    ],
    answer: 'b',
    explain: loc(
      '起点是 25 °C，所以先做两个室温站不需要切换；然后连续做两个 125 °C 的站；最后做 −40 °C 站。切换只发生在 25→125 和 125→−40 两处，共 2 次。',
      'The start is 25 °C, so the two room stations need no change; then the two 125 °C stations run back to back; the −40 °C station comes last. Changes happen only at 25→125 and 125→−40, which is 2 in total.',
    ),
  },
  {
    id: 'q9',
    prompt: loc('关于 PAT 的 k（动态限值 median ± k·σ_rob），哪种说法正确？', 'Which statement about the PAT k (dynamic limit median ± k·σ_rob) is correct?'),
    options: [
      { id: 'a', text: loc('k 越小越安全，所以应取最小值', 'The smaller k is, the safer, so use the smallest value') },
      { id: 'b', text: loc('k 越小，限值越窄，拒掉的越多，良率损失也越大；要在捕获率与误杀之间折中', 'A smaller k narrows the limits and rejects more, so yield loss also grows; choose a compromise between catch rate and false rejects') },
      { id: 'c', text: loc('k 与良率无关，只影响 STDF 的文件大小', 'k has no effect on yield; it only changes the STDF file size') },
    ],
    answer: 'b',
    explain: loc(
      '动态限值是 median ± k·σ_rob。k 小，限值窄，既能抓到更多偏离大的器件，也会把正常的好器件拒掉。k 的取值要看捕获率与良率损失的折中，不能只看一头。',
      'The dynamic limit is median ± k·σ_rob. A small k narrows the limits, so it catches more outliers but also rejects good devices. Choose k by weighing catch rate against yield loss; looking at only one side is not enough.',
    ),
  },
  {
    id: 'q10',
    prompt: loc('导出的 STDF 要核对测试温度、Lot 与坐标，应该看哪些字段？', 'Which STDF fields should you check for test temperature, Lot and coordinates?'),
    options: [
      { id: 'a', text: loc('HBR 的 HBIN_NAM', 'HBIN_NAM in HBR') },
      { id: 'b', text: loc('PTR 的 RESULT', 'RESULT in PTR') },
      { id: 'c', text: loc('MIR 的 LOT_ID 与 TST_TEMP，以及 PRR 的 X_COORD、Y_COORD', 'LOT_ID and TST_TEMP in MIR, and X_COORD and Y_COORD in PRR') },
    ],
    answer: 'c',
    explain: loc(
      'Lot 号在 MIR.LOT_ID，测试温度在 MIR.TST_TEMP，晶圆坐标在 PRR 的 X_COORD、Y_COORD。HBR 只记 Bin 汇总，PTR.RESULT 是参数值，都不包含这三类信息。',
      'The Lot number is in MIR.LOT_ID, the test temperature is in MIR.TST_TEMP, and the wafer coordinates are in X_COORD and Y_COORD of PRR. HBR only holds bin totals and PTR.RESULT is a parameter value, so neither holds these three kinds of information.',
    ),
  },
]