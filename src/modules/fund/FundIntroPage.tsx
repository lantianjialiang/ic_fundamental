import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  ARCH_TEXT,
  BINS,
  BIN_LEAD,
  BIN_TEXT,
  BLOCKS,
  BUDGET_RATIO,
  CLAMP_TEXT,
  CMP_TEXT,
  CONFLICT_TEXT,
  COST_NOTE,
  DUT_LEAD,
  FACTORS,
  FORCE_RANGES,
  GLITCH_TEXT,
  KELVIN_LEAD,
  KELVIN_V,
  LIMIT_TEXT,
  LOAD_TEXT,
  MEAS_RANGES,
  PE_LEAD,
  PE_MODES,
  PE_PARTS,
  PHILO_TEXT,
  PIN_TYPES,
  PMU_LEAD,
  PMU_PRESETS,
  PPPMU_TEXT,
  PROG_LEAD,
  PROG_MORE,
  PROG_PARTS,
  PURPOSES,
  QUIZ,
  RANGE_LEAD,
  RANGE_LOAD,
  RIGHT_LEAD,
  RULES,
  RULES_LEAD,
  RULE_CASES,
  SYS_LEAD,
  TAKEAWAY,
  TESTER_ROWS,
  TEST_ITEMS,
  USES,
  VEC_KINDS,
  HIZ_OFFSET,
  binOf,
  bridge,
  compare,
  fmtMoney,
  makeLot,
  peSwitch,
  peTransit,
  pmuSolve,
  type ArchId,
  type BinId,
  type BlockId,
  type PeMode,
  type PinKind,
  type PmuMode,
  type PmuPreset,
  type RuleAns,
  type TestItemId,
  type UseId,
} from './data/intro'
import { ArchFig, BinFig, PinSymbol, SystemFig } from './IntroFig'
import { LoadCode, PinElecFig } from './IntroPeFig'
import { KelvinFig, PmuFig, RangeFig, fmtMa } from './IntroPmuFig'
import { Callout, Cards, Explain, Knob, Readout, Seg, Steps, fmtOhm, type Note } from './parts'
import './intro.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('测试入门', 'Getting started'),
  later: loc(
    '认识了测试系统，下一课学怎么读规格书：每一项测试的条件和极限都从那里来。',
    'Now that you know the test system, the next lesson covers reading a specification: the conditions and limits of every test come from there.',
  ),
  dutTitle: loc('DUT 和它的管脚', 'The DUT and its pins'),
  dutNote: loc('点一种管脚，看它的作用和测试时怎么对待它。', 'Click a pin type to see what it does and how it is treated during test.'),
  progTitle: loc('测试程序做什么', 'What a test program does'),
  binTitle: loc('动手：分 Bin', 'Try it: binning'),
  fmax: loc('这颗芯片的最高工作频率', 'Max operating frequency'),
  thisBin: loc('落在', 'Lands in'),
  lotBtn: loc('测一批 200 颗', 'Test a lot of 200'),
  colBin: loc('Bin', 'Bin'),
  colCount: loc('数量', 'Count'),
  colPct: loc('占比', 'Share'),
  yieldL: loc('良率（Bin 1 + Bin 2）', 'Yield (Bin 1 + Bin 2)'),
  listSep: loc('、', ', '),
  rightTitle: loc('什么是“正确”的测法？', 'What is the "right" way to test?'),
  purposeSub: loc('因素一：测试目的', 'Factor 1: test purpose'),
  testerSub: loc('因素二：测试机能力（点一行看影响）', 'Factor 2: tester capability (click a row for its impact)'),
  colItem: loc('项目', 'Item'),
  colHigh: loc('高端测试机', 'High-end tester'),
  colLow: loc('低成本测试机', 'Low-cost tester'),
  costSub: loc('因素三：成本', 'Factor 3: cost'),
  costNote: loc(
    '同一颗芯片，两种用途。点表格里的测试项目把它加进 / 移出测试清单，看预算够不够。',
    'One chip, two applications. Click a test item in the table to add it to / remove it from the test list, and see whether the budget holds.',
  ),
  colTest: loc('测试项目', 'Test item'),
  colCost: loc('每颗成本（示意）', 'Cost per part (illustrative)'),
  colIn: loc('选上', 'Selected'),
  price: loc('售价', 'Price'),
  budget: loc('测试预算', 'Test budget'),
  spent: loc('已选成本', 'Selected cost'),
  recBtn: loc('看推荐方案', 'Show recommended'),
  over: loc(
    '超预算了：测试花的钱已经超过这颗芯片能承受的。低价芯片只能做最基本的测试。',
    'Over budget: test now costs more than this chip can bear. A low-priced chip can only get the most basic tests.',
  ),
  missing: loc('预算还够，但少了这些：', 'Within budget, but missing: '),
  satMiss: loc('卫星上的芯片坏一颗，代价是整颗卫星——这些钱值得花。', 'One failed chip in a satellite can cost the whole satellite; this money is worth spending.'),
  toyMiss: loc('再便宜，开短路和功能测试也不能省。', 'No matter how cheap, opens/shorts and functional test cannot be skipped.'),
  philoSub: loc('因素四：公司测试哲学', 'Factor 4: company test philosophy'),
  sysTitle: loc('测试系统里有什么', "What's inside a test system"),
  archSub: loc('共享资源 vs Tester per pin', 'Shared resources vs tester per pin'),
  shared: loc('共享资源', 'Shared resources'),
  perpin: 'Tester per pin',
  vecSub: loc('两种测试向量', 'Two kinds of test vectors'),
  pmuTitle: loc('动手：PMU 模拟器', 'Try it: PMU simulator'),
  pmuNote: loc(
    '先点教材的例子，再自己调参数。试试把钳位设到 Fail 限以内会怎样。',
    'Click the textbook examples first, then adjust the parameters yourself. Try setting the clamp inside the fail limit and see what happens.',
  ),
  fvmi: loc('加压测流 FVMI', 'Force V, measure I (FVMI)'),
  fimv: loc('加流测压 FIMV', 'Force I, measure V (FIMV)'),
  forceV: loc('施加电压', 'Force voltage'),
  forceI: loc('施加电流', 'Force current'),
  rLoad: loc('负载电阻 RL', 'Load resistance RL'),
  short: loc('短路 10 Ω', 'Short 10 Ω'),
  open: loc('开路', 'Open'),
  clampI: loc('电流钳位', 'Current clamp'),
  clampV: loc('电压钳位', 'Voltage clamp'),
  upper: loc('上限 Fail GT', 'High limit Fail GT'),
  lower: loc('下限 Fail LT', 'Low limit Fail LT'),
  on: loc('开', 'On'),
  off: loc('关', 'Off'),
  enable: loc('启用：', 'Enable: '),
  vOut: loc('DUT 上的电压', 'Voltage at DUT'),
  iOut: loc('流过的电流', 'Current'),
  reading: loc('PMU 读数', 'PMU reading'),
  clampSt: loc('钳位', 'Clamp'),
  hit: loc('撞到了', 'Hit'),
  notHit: loc('没撞到', 'Not hit'),
  noClamp: loc('没设', 'Not set'),
  verdict: loc('判定', 'Verdict'),
  clampIn: loc(
    '钳位设在 Fail 限以内：读数最多只能到钳位值，永远超不过上限——这条测试永远不会 Fail！',
    'The clamp is inside the fail limit: the reading can only reach the clamp value and never exceeds the high limit, so this test can never fail!',
  ),
  noClampWarn: loc(
    '没有设钳位！遇到坏品时，PMU 会输出它能给的最大电流或电压。',
    'No clamp set! With a bad part, the PMU will output the maximum current or voltage it can deliver.',
  ),
  hwNote: loc(
    'PMU 已经顶到了自己硬件的极限（本模拟设为 500 mA / 30 V）。',
    'The PMU has hit its own hardware limit (set to 500 mA / 30 V in this simulation).',
  ),
  limitSub: loc('上下限：Fail Greater Than / Fail Less Than', 'Limits: Fail Greater Than / Fail Less Than'),
  clampSub: loc('钳位为什么必不可少', 'Why a clamp is essential'),
  kelvinTitle: loc('动手：Force / Sense 与 Kelvin 连接', 'Try it: Force / Sense and the Kelvin connection'),
  kelvinNote: loc(
    'PMU 要在 DUT 上加 5 V。拖动导线电阻和电流，对比两线制和四线制。',
    'The PMU must put 5 V on the DUT. Drag the wire resistance and current to compare two-wire and four-wire connections.',
  ),
  two: loc('两线制', 'Two-wire'),
  four: loc('四线制（Kelvin）', 'Four-wire (Kelvin)'),
  rw: loc('每根 Force 线的电阻', 'Resistance per Force line'),
  iDut: loc('DUT 电流', 'DUT current'),
  pmuOut: loc('PMU 输出端', 'PMU output'),
  dropAll: loc('导线压降合计', 'Total wire drop'),
  dutV: loc('DUT 上实际电压', 'Actual DUT voltage'),
  err: loc('误差', 'Error'),
  twoBad: loc(
    '两线制：PMU 出口确实是 5 V，但电流在两根 Force 线上各掉一截，DUT 实际拿到的更少。电流越大、导线越长，误差越大。',
    'Two-wire: the PMU output really is 5 V, but the current drops some voltage on each Force line, so the DUT actually gets less. The higher the current and the longer the wires, the larger the error.',
  ),
  fourOk: loc(
    '四线制：Sense 线量的是 DUT 上的电压，PMU 自动把输出抬高，补上导线压降，DUT 上正好 5 V。',
    'Four-wire: the Sense lines measure the voltage at the DUT, and the PMU automatically raises its output to make up for the wire drop, so the DUT gets exactly 5 V.',
  ),
  rangeTitle: loc('动手：量程', 'Try it: ranges'),
  rangeNote: loc(
    'PMU 加压到 1 kΩ 负载上。分别选施加量程和测量量程，再试试“接着 DUT 换量程”。',
    'The PMU forces voltage into a 1 kΩ load. Choose the force and measure ranges, then try "changing range while connected to the DUT".',
  ),
  fRange: loc('施加量程', 'Force range'),
  mRange: loc('测量量程', 'Measure range'),
  setV: loc('程序设定电压', 'Programmed voltage'),
  conn: loc('PMU 接在 DUT 上', 'PMU connected'),
  disc: loc('PMU 已断开', 'PMU disconnected'),
  forced: loc('实际施加', 'Actually forced'),
  realI: loc('实际电流', 'Actual current'),
  readI: loc('读数', 'Reading'),
  clipF: loc(
    '施加量程不够：设了更高的电压，PMU 最多只能加到量程上限。',
    'Force range too small: a higher voltage was set, but the PMU can only force up to the range limit.',
  ),
  clipM: loc('超出测量量程：实际电流更大，但读数最多只到量程上限。', 'Over the measure range: the actual current is higher, but the reading stops at the range limit.'),
  coarse: loc(
    '量程选得太大：值只占量程的一小部分，分辨率差。换小一档更准。',
    'Range too large: the value is only a small fraction of the range, so resolution is poor. One range lower is more accurate.',
  ),
  rangeOk: loc('量程合适：施加和测量都在量程内。', 'Ranges are right: both force and measure are within range.'),
  peTitle: loc('动手：管脚电子', 'Try it: pin electronics'),
  peNote: loc(
    '切换通道的工作状态，看哪些开关闭合、信号走哪条路。注意继电器“先断后合”。',
    'Switch the channel mode and see which switches close and which path the signal takes. Note the relays "break before make".',
  ),
  fdata: 'FDATA',
  dutDrive: loc('DUT 此刻也在输出', 'DUT is also driving'),
  outSub: loc('输出状态下：比较器和电流负载', 'In output mode: comparators and current load'),
  vDut: loc('DUT 输出电压', 'DUT output voltage'),
  vref: 'VREF',
  cmpRead: loc('比较器判定', 'Comparator result'),
  loadI: loc('负载电流（正 = 流入 DUT）', 'Load current (+ = into DUT)'),
  l0: loc('逻辑 0', 'Logic 0'),
  l1: loc('逻辑 1', 'Logic 1'),
  lx: loc('中间（三态 / 坏）', 'Between (tri-state / bad)'),
  iolFlow: loc(
    '输出低于 VREF：D1、D3 导通，IOL 流进 DUT，DUT 在吸电流（这就是 VOL @ IOL 的测试条件）。',
    'Output below VREF: D1 and D3 conduct, IOL flows into the DUT and the DUT is sinking current (the VOL @ IOL test condition).',
  ),
  iohFlow: loc(
    '输出高于 VREF：D2、D4 导通，IOH 从 DUT 抽出，DUT 在送电流（这就是 VOH @ IOH 的测试条件）。',
    'Output above VREF: D2 and D4 conduct, IOH is pulled out of the DUT and the DUT is sourcing current (the VOH @ IOH test condition).',
  ),
  iZero: loc(
    '输出在 VREF ±0.1 V 以内：四只二极管都部分导通，IOL、IOH 两边分流，净电流在 +IOL 和 −IOH 之间。正好等于 VREF 时两边各一半，因为 IOL ≠ IOH，净电流并不是 0。',
    'Output within VREF ±0.1 V: all four diodes partly conduct and IOL and IOH are split, so the net current is between +IOL and −IOH. Exactly at VREF each splits in half; since IOL ≠ IOH, the net current is not zero.',
  ),
  vPin: loc('引脚电压', 'Pin voltage'),
  diodes: loc('各二极管电流', 'Diode currents'),
  hizBtn: loc('DUT 输出高阻（三态）', 'DUT output high-Z (tri-state)'),
  hizNote: loc(
    'DUT 不驱动，引脚上只剩电流负载：桥把电压拉到净电流为 0 的点，比 VREF 高几十 mV。VREF 在 VOL 和 VOH 之间，比较器读到“中间”，三态测试就是靠这个判出高阻。',
    'The DUT is not driving, so only the current load acts on the pin: the bridge pulls it to the point of zero net current, a few tens of mV above VREF. With VREF between VOL and VOH, the comparators read "between", which is how a tri-state test detects high impedance.',
  ),
  loadHint: loc(
    '电流负载只在“输出（比较 + 负载）”状态下经 F2、K1 接到 DUT；切到那个状态，图里的二极管桥和下面的代码才会跟着走。',
    'The current load reaches the DUT through F2 and K1 only in the "Output (compare + load)" state; switch to it to see the diode bridge and the code below follow along.',
  ),
  rulesTitle: loc('动手：测试工程守则', 'Try it: test engineering rules'),
  rulesNote: loc('每个场景点一下：可以，还是违规？', 'For each scenario, click: OK, or a violation?'),
  colCase: loc('场景', 'Scenario'),
  colYou: loc('你的判断', 'Your call'),
  ok: loc('可以', 'OK'),
  bad: loc('违规', 'Violation'),
  done: loc('已答', 'Answered'),
  right: loc('答对', 'Correct'),
  rulesAll: loc('原文 7 条守则：', 'The 7 original rules:'),
  rulesHint: loc('全部答完后，这里会列出原文的 7 条守则。', 'After you answer them all, the 7 original rules will be listed here.'),
}

const ZERO_PICK: Record<TestItemId, boolean> = {
  opens: true,
  func: false,
  dc: false,
  ac: false,
  vdd: false,
  temp: false,
  burn: false,
  doc: false,
}

export function FundIntroPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: PIN_TYPES[0].title, text: PIN_TYPES[0].text })
  const pickNote = (title: Note['title'], text: Note['text']) => setNote({ kicker: S.kicker, title, text })

  // 1–3
  const [pin, setPin] = useState<PinKind>(PIN_TYPES[0].id)
  const [part, setPart] = useState(PROG_PARTS[0].id)
  const [fmax, setFmax] = useState(160)
  const [lot, setLot] = useState<BinId[] | null>(null)
  const [factor, setFactor] = useState(FACTORS[0].id)
  const [purpose, setPurpose] = useState(PURPOSES[0].id)
  const [testerRow, setTesterRow] = useState<string | null>(null)
  const [use, setUse] = useState<UseId>(USES[0].id)
  const [chosen, setChosen] = useState<Record<TestItemId, boolean>>(ZERO_PICK)
  // 4
  const [block, setBlock] = useState<BlockId>('cpu')
  const [arch, setArch] = useState<ArchId>('shared')
  const [vecKind, setVecKind] = useState(VEC_KINDS[0].id)
  // 5 PMU
  const [mode, setMode] = useState<PmuMode>('fvmi')
  const [force, setForce] = useState(5)
  const [r, setR] = useState(250)
  const [clampOn, setClampOn] = useState(true)
  const [clamp, setClamp] = useState(30)
  const [hiOn, setHiOn] = useState(true)
  const [hi, setHi] = useState(25)
  const [loOn, setLoOn] = useState(false)
  const [lo, setLo] = useState(0)
  const [preset, setPreset] = useState<string | null>(PMU_PRESETS[0].id)
  // 6 Kelvin
  const [four, setFour] = useState(false)
  const [rw, setRw] = useState(0.5)
  const [iDut, setIDut] = useState(200)
  // 7 量程
  const [fRange, setFRange] = useState(2)
  const [mRange, setMRange] = useState(1)
  const [setV, setSetV] = useState(5)
  const [connected, setConnected] = useState(true)
  const [glitch, setGlitch] = useState(false)
  // 8 管脚电子
  const [peMode, setPeMode] = useState<PeMode>(PE_MODES[0].id)
  const [pePrev, setPePrev] = useState<PeMode>(PE_MODES[0].id)
  const [switching, setSwitching] = useState(false)
  const [fdata, setFdata] = useState<0 | 1>(0)
  const [conflict, setConflict] = useState(false)
  const [vout, setVout] = useState(0.2)
  const [vref, setVref] = useState(1.5)
  const [hiz, setHiz] = useState(false)
  // 9 守则
  const [ruleAns, setRuleAns] = useState<Record<string, RuleAns>>({})

  useEffect(() => {
    if (!switching) return
    const id = window.setTimeout(() => setSwitching(false), 900)
    return () => window.clearTimeout(id)
  }, [switching])

  /* ---- 分 Bin ---- */
  const bin = binOf(fmax)
  const binItem = BINS.find((b) => b.id === bin) ?? BINS[0]
  const lotCount = (id: BinId) => (lot ? lot.filter((b) => b === id).length : 0)

  /* ---- 成本 ---- */
  const useItem = USES.find((u) => u.id === use) ?? USES[0]
  const budget = useItem.price * BUDGET_RATIO
  const spent = TEST_ITEMS.filter((it) => chosen[it.id]).reduce((s, it) => s + it.cost, 0)
  const overBudget = spent > budget + 1e-9
  const missing = TEST_ITEMS.filter((it) => it[use] && !chosen[it.id])

  /* ---- PMU ---- */
  const fv = mode === 'fvmi'
  const out = pmuSolve({ mode, force, r, clampOn, clamp })
  const meas = fv ? out.i : out.v
  const unit = fv ? 'mA' : 'V'
  const fail = (hiOn && meas > hi) || (loOn && meas < lo)
  const clampInside = clampOn && hiOn && clamp <= hi
  const presetItem = PMU_PRESETS.find((p) => p.id === preset)
  const open = !Number.isFinite(r)
  const fmtMeas = (x: number) => (fv ? fmtMa(x) : `${x.toFixed(2)} V`)

  const applyPreset = (p: PmuPreset) => {
    setMode(p.mode)
    setForce(p.force)
    setR(p.r)
    setClampOn(p.clampOn)
    setClamp(p.clamp)
    setHiOn(true)
    setHi(p.hi)
    setLoOn(false)
    setLo(0)
    setPreset(p.id)
    pickNote(p.label, p.text)
  }
  const manual = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPreset(null)
  }

  /* ---- Kelvin ---- */
  const drop1 = (iDut / 1000) * rw
  const kOut = four ? KELVIN_V + 2 * drop1 : KELVIN_V
  const kDut = four ? KELVIN_V : KELVIN_V - 2 * drop1

  /* ---- 量程 ---- */
  const forced = Math.min(setV, fRange)
  const realI = (forced / RANGE_LOAD) * 1000
  const readI = Math.min(realI, mRange)
  const clipF = setV > fRange
  const clipM = realI > mRange
  const coarse = !clipM && realI > 0 && realI < mRange / 10
  const changeRange = (fn: () => void) => {
    fn()
    setGlitch(connected)
    if (connected) pickNote(S.rangeTitle, GLITCH_TEXT)
  }

  /* ---- 管脚电子 ---- */
  const sw = switching ? peTransit(pePrev, peMode) : peSwitch(peMode)
  const peItem = PE_MODES.find((m) => m.id === peMode) ?? PE_MODES[0]
  /* DUT 高阻时引脚电压不由 DUT 决定，而是被电流负载拉到净电流为 0 的点 */
  const vPin = hiz ? vref + HIZ_OFFSET : vout
  const read = compare(vPin)
  const br = bridge(vPin, vref)

  /* ---- 守则 ---- */
  const answered = RULE_CASES.filter((c) => ruleAns[c.id]).length
  const correct = RULE_CASES.filter((c) => ruleAns[c.id] === c.answer).length

  const onOff = (value: boolean, set: (v: boolean) => void) => (
    <div className="kind">
      <button type="button" className={`kind__btn${value ? ' is-right' : ''}`} onClick={() => set(true)}>
        {t(S.on)}
      </button>
      <button type="button" className={`kind__btn${!value ? ' is-wrong' : ''}`} onClick={() => set(false)}>
        {t(S.off)}
      </button>
    </div>
  )

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fIntro.title)}
      goal={t(ui.fIntro.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fSpec"
      nextLabel={t(ui.fund.next) + t(ui.m18.title)}
    >
      {/* 1. DUT 与管脚 */}
      <Section title={t(S.dutTitle)} note={t(S.dutNote)}>
        {DUT_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="intro-pins">
          {PIN_TYPES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pick__card${pin === item.id ? ' is-active' : ''}`}
              onClick={() => {
                setPin(item.id)
                pickNote(item.title, item.text)
              }}
            >
              <PinSymbol kind={item.id} active={pin === item.id} />
              {t(item.title)}
              <span>{t(item.sub)}</span>
            </button>
          ))}
        </div>
        {(() => {
          const item = PIN_TYPES.find((p) => p.id === pin) ?? PIN_TYPES[0]
          return <Explain paras={[item.text, ...item.explain]} />
        })()}
      </Section>

      {/* 2. 测试程序 */}
      <Section title={t(S.progTitle)}>
        {PROG_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Cards
          items={PROG_PARTS}
          activeId={part}
          onPick={(item) => {
            setPart(item.id)
            pickNote(item.title, item.text)
          }}
        />
        <Explain paras={PROG_PARTS.find((p) => p.id === part)?.explain} />

        <h4 className="intro-sub">{t(S.binTitle)}</h4>
        <p>{t(BIN_LEAD)}</p>
        <div className="knob-row">
          <Knob label={S.fmax} value={fmax} unit="MHz" min={50} max={200} step={1} onChange={setFmax} />
        </div>
        <BinFig fmax={fmax} />
        <Readout
          items={[
            { label: S.fmax, value: `${fmax} MHz` },
            { label: S.thisBin, value: t(binItem.label), state: binItem.good ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone={binItem.good ? 'ok' : 'bad'}>{t(BIN_TEXT[bin])}</Callout>
        <div className="row-actions">
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            onClick={() => {
              setLot(makeLot(200))
              pickNote(S.lotBtn, PROG_MORE[1])
            }}
          >
            {t(S.lotBtn)}
          </button>
        </div>
        {lot ? (
          <>
            <table className="dtable">
              <thead>
                <tr>
                  <th>{t(S.colBin)}</th>
                  <th>{t(S.colCount)}</th>
                  <th>{t(S.colPct)}</th>
                </tr>
              </thead>
              <tbody>
                {BINS.map((b) => (
                  <tr key={b.id} className={b.good ? 'is-pass' : 'is-fail'}>
                    <td className="verdict">{t(b.label)}</td>
                    <td className="mono-cell">{lotCount(b.id)}</td>
                    <td className="mono-cell">{`${((lotCount(b.id) / lot.length) * 100).toFixed(1)}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Readout
              items={[
                {
                  label: S.yieldL,
                  value: `${(((lotCount('bin1') + lotCount('bin2')) / lot.length) * 100).toFixed(1)}%`,
                  state: 'pass',
                },
              ]}
            />
          </>
        ) : null}
        <Explain paras={PROG_MORE} />
      </Section>

      {/* 3. 没有唯一正确的测法 */}
      <Section title={t(S.rightTitle)} note={t(RIGHT_LEAD)}>
        <Cards
          items={FACTORS}
          activeId={factor}
          cols={4}
          onPick={(item) => {
            setFactor(item.id)
            pickNote(item.title, item.text)
          }}
        />
        <Explain paras={[FACTORS.find((f) => f.id === factor)?.text ?? '']} />

        <h4 className="intro-sub">{t(S.purposeSub)}</h4>
        <Cards
          items={PURPOSES}
          activeId={purpose}
          onPick={(item) => {
            setPurpose(item.id)
            pickNote(item.title, item.text)
          }}
        />
        <Explain paras={[PURPOSES.find((p) => p.id === purpose)?.text ?? '']} />

        <h4 className="intro-sub">{t(S.testerSub)}</h4>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colItem)}</th>
              <th>{t(S.colHigh)}</th>
              <th>{t(S.colLow)}</th>
            </tr>
          </thead>
          <tbody>
            {TESTER_ROWS.map((row) => (
              <tr
                key={row.id}
                className={`is-click${testerRow === row.id ? ' is-active' : ''}`}
                onClick={() => {
                  setTesterRow(row.id)
                  pickNote(row.item, row.impact)
                }}
              >
                <td>{t(row.item)}</td>
                <td>{t(row.high)}</td>
                <td>{t(row.low)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {testerRow ? <Explain paras={[TESTER_ROWS.find((row) => row.id === testerRow)?.impact ?? '']} /> : null}

        <h4 className="intro-sub">{t(S.costSub)}</h4>
        <p className="intro__note">{t(S.costNote)}</p>
        <Seg
          options={USES.map((u) => ({ id: u.id, label: u.label }))}
          value={use}
          onChange={(id) => {
            setUse(id)
            setChosen(ZERO_PICK)
            const u = USES.find((item) => item.id === id)
            if (u) pickNote(u.label, u.text)
          }}
        />
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colTest)}</th>
              <th>{t(S.colCost)}</th>
              <th>{t(S.colIn)}</th>
            </tr>
          </thead>
          <tbody>
            {TEST_ITEMS.map((it) => (
              <tr
                key={it.id}
                className={`is-click${chosen[it.id] ? ' is-active' : ''}`}
                onClick={() => setChosen((prev) => ({ ...prev, [it.id]: !prev[it.id] }))}
              >
                <td>{t(it.label)}</td>
                <td className="mono-cell">{fmtMoney(it.cost)}</td>
                <td className="mono-cell">{chosen[it.id] ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row-actions">
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              const next = { ...ZERO_PICK }
              TEST_ITEMS.forEach((it) => {
                next[it.id] = it[use]
              })
              setChosen(next)
            }}
          >
            {t(S.recBtn)}
          </button>
        </div>
        <Readout
          items={[
            { label: S.price, value: fmtMoney(useItem.price) },
            { label: S.budget, value: fmtMoney(budget) },
            { label: S.spent, value: fmtMoney(spent), state: overBudget ? 'fail' : 'pass' },
          ]}
        />
        {overBudget ? (
          <Callout tone="bad">{t(S.over)}</Callout>
        ) : missing.length ? (
          <Callout tone="warn">
            <p>
              {t(S.missing)}
              {missing.map((it) => t(it.label)).join(t(S.listSep))}
            </p>
            <p>{t(use === 'sat' ? S.satMiss : S.toyMiss)}</p>
          </Callout>
        ) : (
          <Callout tone="ok">{t(useItem.text)}</Callout>
        )}
        <p className="intro__note">{t(COST_NOTE)}</p>

        <h4 className="intro-sub">{t(S.philoSub)}</h4>
        <p>{t(FACTORS[3].text)}</p>
        <Callout tone="warn">{t(PHILO_TEXT)}</Callout>
      </Section>

      {/* 4. 测试系统 */}
      <Section title={t(S.sysTitle)}>
        {SYS_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <SystemFig
          active={block}
          onPick={(id) => {
            setBlock(id)
            pickNote(BLOCKS[id].title, BLOCKS[id].text)
          }}
        />
        <Explain paras={[BLOCKS[block].text]} />

        <h4 className="intro-sub">{t(S.archSub)}</h4>
        <Seg
          options={[
            { id: 'shared' as const, label: S.shared },
            { id: 'perpin' as const, label: S.perpin },
          ]}
          value={arch}
          onChange={(id) => {
            setArch(id)
            pickNote(id === 'shared' ? S.shared : S.perpin, ARCH_TEXT[id])
          }}
        />
        <ArchFig mode={arch} />
        <Explain paras={[ARCH_TEXT[arch]]} />

        <h4 className="intro-sub">{t(S.vecSub)}</h4>
        <Cards
          items={VEC_KINDS}
          activeId={vecKind}
          cols={2}
          onPick={(item) => {
            setVecKind(item.id)
            pickNote(item.title, item.text)
          }}
        />
        <Explain paras={[VEC_KINDS.find((v) => v.id === vecKind)?.text ?? '']} />
      </Section>

      {/* 5. PMU */}
      <Section title={t(S.pmuTitle)} note={t(S.pmuNote)}>
        {PMU_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Seg
          options={[
            { id: 'fvmi' as const, label: S.fvmi },
            { id: 'fimv' as const, label: S.fimv },
          ]}
          value={mode}
          onChange={(id) => {
            const p = PMU_PRESETS.find((item) => item.id === (id === 'fvmi' ? 'fv-good' : 'fi-good'))
            if (p) applyPreset(p)
          }}
        />
        <div className="row-actions">
          {PMU_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`lab__btn${preset === p.id ? ' lab__btn--primary' : ''}`}
              onClick={() => applyPreset(p)}
            >
              {t(p.label)}
            </button>
          ))}
        </div>
        <div className="knob-row">
          {fv ? (
            <Knob label={S.forceV} value={force} unit="V" min={0} max={10} step={0.1} onChange={manual(setForce)} />
          ) : (
            <Knob label={S.forceI} value={force} unit="mA" min={0} max={20} step={0.5} onChange={manual(setForce)} />
          )}
          <label>
            <span>
              {t(S.rLoad)} <b>{open ? t(S.open) : fmtOhm(r)}</b>
            </span>
            <input
              type="range"
              min={1}
              max={6}
              step={0.01}
              value={open ? 6 : Math.log10(r)}
              onChange={(event) => {
                setR(Number((10 ** Number(event.target.value)).toPrecision(2)))
                setPreset(null)
              }}
            />
          </label>
        </div>
        <div className="row-actions">
          {[
            { id: 'short', label: S.short, value: 10 },
            { id: '250', label: '250 Ω', value: 250 },
            { id: '500', label: '500 Ω', value: 500 },
            { id: '5k', label: '5 kΩ', value: 5000 },
            { id: 'open', label: S.open, value: Infinity },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              className={`lab__btn${r === b.value ? ' lab__btn--primary' : ''}`}
              onClick={() => {
                setR(b.value)
                setPreset(null)
              }}
            >
              {t(b.label)}
            </button>
          ))}
        </div>
        <div className="knob-row">
          <div>
            {fv ? (
              <Knob label={S.clampI} value={clamp} unit="mA" min={1} max={100} step={1} onChange={manual(setClamp)} />
            ) : (
              <Knob label={S.clampV} value={clamp} unit="V" min={0.5} max={20} step={0.25} onChange={manual(setClamp)} />
            )}
            <div className="intro-toggle">
              {t(S.enable)}
              {onOff(clampOn, manual(setClampOn))}
            </div>
          </div>
          <div>
            {fv ? (
              <Knob label={S.upper} value={hi} unit="mA" min={0} max={100} step={0.5} onChange={manual(setHi)} />
            ) : (
              <Knob label={S.upper} value={hi} unit="V" min={0} max={20} step={0.05} onChange={manual(setHi)} />
            )}
            <div className="intro-toggle">
              {t(S.enable)}
              {onOff(hiOn, manual(setHiOn))}
            </div>
          </div>
          <div>
            {fv ? (
              <Knob label={S.lower} value={lo} unit="mA" min={0} max={100} step={0.5} onChange={manual(setLo)} />
            ) : (
              <Knob label={S.lower} value={lo} unit="V" min={0} max={20} step={0.05} onChange={manual(setLo)} />
            )}
            <div className="intro-toggle">
              {t(S.enable)}
              {onOff(loOn, manual(setLoOn))}
            </div>
          </div>
        </div>
        <PmuFig
          mode={mode}
          force={force}
          r={r}
          out={out}
          clampOn={clampOn}
          clamp={clamp}
          hiOn={hiOn}
          hi={hi}
          loOn={loOn}
          lo={lo}
          fail={fail}
        />
        <Readout
          items={[
            { label: S.vOut, value: `${out.v.toFixed(2)} V` },
            { label: S.iOut, value: fmtMa(out.i) },
            { label: S.reading, value: fmtMeas(meas), state: fail ? 'fail' : 'pass' },
            {
              label: S.clampSt,
              value: t(clampOn ? (out.clamped ? S.hit : S.notHit) : S.noClamp),
              state: clampOn ? undefined : 'fail',
            },
            { label: S.verdict, value: fail ? 'FAIL' : 'PASS', state: fail ? 'fail' : 'pass' },
          ]}
        />
        {clampInside ? (
          <Callout tone="bad">
            {t(S.clampIn)}
            {` (${clamp} ${unit} ≤ ${hi} ${unit})`}
          </Callout>
        ) : null}
        {!clampOn ? <Callout tone="bad">{t(S.noClampWarn)}</Callout> : null}
        {out.hw ? <Callout tone="warn">{t(S.hwNote)}</Callout> : null}
        {presetItem ? <Callout tone={fail ? 'warn' : 'ok'}>{t(presetItem.text)}</Callout> : null}

        <h4 className="intro-sub">{t(S.limitSub)}</h4>
        <Explain paras={LIMIT_TEXT} />
        <h4 className="intro-sub">{t(S.clampSub)}</h4>
        <Explain paras={CLAMP_TEXT} />
      </Section>

      {/* 6. Kelvin */}
      <Section title={t(S.kelvinTitle)} note={t(S.kelvinNote)}>
        {KELVIN_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Seg
          options={[
            { id: 'two' as const, label: S.two },
            { id: 'four' as const, label: S.four },
          ]}
          value={four ? 'four' : 'two'}
          onChange={(id) => {
            setFour(id === 'four')
            pickNote(id === 'four' ? S.four : S.two, id === 'four' ? S.fourOk : S.twoBad)
          }}
        />
        <div className="knob-row">
          <Knob label={S.rw} value={rw} unit="Ω" min={0} max={5} step={0.1} onChange={setRw} />
          <Knob label={S.iDut} value={iDut} unit="mA" min={0} max={500} step={10} onChange={setIDut} />
        </div>
        <KelvinFig four={four} rw={rw} iMa={iDut} vOut={kOut} vDut={kDut} />
        <Readout
          items={[
            { label: S.pmuOut, value: `${kOut.toFixed(3)} V` },
            { label: S.dropAll, value: `${(2 * drop1).toFixed(3)} V` },
            { label: S.dutV, value: `${kDut.toFixed(3)} V`, state: Math.abs(kDut - KELVIN_V) > 0.005 ? 'fail' : 'pass' },
            { label: S.err, value: `${(kDut - KELVIN_V).toFixed(3)} V` },
          ]}
        />
        <Callout tone={four ? 'ok' : 'warn'}>{t(four ? S.fourOk : S.twoBad)}</Callout>
      </Section>

      {/* 7. 量程 */}
      <Section title={t(S.rangeTitle)} note={t(S.rangeNote)}>
        {RANGE_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="row-actions">
          <Seg
            options={[
              { id: 'conn' as const, label: S.conn },
              { id: 'disc' as const, label: S.disc },
            ]}
            value={connected ? 'conn' : 'disc'}
            onChange={(id) => {
              setConnected(id === 'conn')
              setGlitch(false)
            }}
          />
        </div>
        <div className="knob-row">
          <div>
            <p className="intro__note">{t(S.fRange)}</p>
            <Seg
              options={FORCE_RANGES.map((v) => ({ id: String(v), label: `${v} V` }))}
              value={String(fRange)}
              onChange={(id) => changeRange(() => setFRange(Number(id)))}
            />
          </div>
          <div>
            <p className="intro__note">{t(S.mRange)}</p>
            <Seg
              options={MEAS_RANGES.map((v) => ({ id: String(v), label: `${v} mA` }))}
              value={String(mRange)}
              onChange={(id) => changeRange(() => setMRange(Number(id)))}
            />
          </div>
          <Knob label={S.setV} value={setV} unit="V" min={0} max={10} step={0.5} onChange={setSetV} />
        </div>
        <RangeFig volt={connected ? forced : 0} glitch={glitch} />
        <Readout
          items={[
            { label: S.setV, value: `${setV.toFixed(1)} V` },
            { label: S.forced, value: `${forced.toFixed(1)} V`, state: clipF ? 'fail' : 'pass' },
            { label: S.realI, value: fmtMa(realI) },
            { label: S.readI, value: fmtMa(readI), state: clipM ? 'fail' : 'pass' },
          ]}
        />
        {glitch ? <Callout tone="bad">{t(GLITCH_TEXT)}</Callout> : null}
        {clipF ? <Callout tone="warn">{t(S.clipF)}</Callout> : null}
        {clipM ? <Callout tone="warn">{t(S.clipM)}</Callout> : null}
        {coarse ? <Callout tone="warn">{t(S.coarse)}</Callout> : null}
        {!clipF && !clipM && !coarse && !glitch ? <Callout tone="ok">{t(S.rangeOk)}</Callout> : null}
      </Section>

      {/* 8. 管脚电子 */}
      <Section title={t(S.peTitle)} note={t(S.peNote)}>
        {PE_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="row-actions">
          <Seg
            options={PE_MODES.map((m) => ({ id: m.id, label: m.label }))}
            value={peMode}
            onChange={(id) => {
              if (id === peMode) return
              setPePrev(peMode)
              setPeMode(id)
              setSwitching(true)
              const m = PE_MODES.find((item) => item.id === id)
              if (m) pickNote(m.label, m.text)
            }}
          />
        </div>
        {peMode === 'drive' ? (
          <div className="row-actions">
            <span className="intro-toggle">{S.fdata}</span>
            <div className="kind">
              {([0, 1] as const).map((v) => (
                <button key={v} type="button" className={`kind__btn${fdata === v ? ' is-right' : ''}`} onClick={() => setFdata(v)}>
                  {String(v)}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`kind__btn${conflict ? ' is-wrong' : ''}`}
              onClick={() => {
                setConflict((c) => !c)
                if (!conflict) pickNote(S.dutDrive, CONFLICT_TEXT)
              }}
            >
              {t(S.dutDrive)}
            </button>
          </div>
        ) : null}
        <PinElecFig mode={peMode} sw={sw} switching={switching} fdata={fdata} vout={vPin} vref={vref} conflict={conflict} />
        <Explain paras={[peItem.text]} />
        {peMode === 'drive' && conflict ? <Callout tone="bad">{t(CONFLICT_TEXT)}</Callout> : null}
        <Explain paras={PE_PARTS} />

        <h4 className="intro-sub">{t(S.outSub)}</h4>
        {peMode !== 'compare' ? <p className="intro__note">{t(S.loadHint)}</p> : null}
        <div className="row-actions">
          <button
            type="button"
            className={`kind__btn${hiz ? ' is-wrong' : ''}`}
            aria-pressed={hiz}
            onClick={() => {
              setHiz((h) => !h)
              if (!hiz) pickNote(S.hizBtn, S.hizNote)
            }}
          >
            {t(S.hizBtn)}
          </button>
        </div>
        <div className="knob-row">
          {hiz ? null : <Knob label={S.vDut} value={vout} unit="V" min={0} max={5} step={0.1} onChange={setVout} />}
          <Knob label={S.vref} value={vref} unit="V" min={0} max={3} step={0.1} onChange={setVref} />
        </div>
        <Readout
          items={[
            { label: S.vPin, value: `${vPin.toFixed(2)} V` },
            { label: S.cmpRead, value: t(read === 'low' ? S.l0 : read === 'high' ? S.l1 : S.lx), state: read === 'mid' ? 'fail' : 'pass' },
            { label: S.loadI, value: Math.abs(br.iDut) < 0.005 ? '0.00 mA' : `${br.iDut > 0 ? '+' : '−'}${Math.abs(br.iDut).toFixed(2)} mA` },
            { label: S.diodes, value: `D1 ${br.d1.toFixed(2)} · D2 ${br.d2.toFixed(2)} · D3 ${br.d3.toFixed(2)} · D4 ${br.d4.toFixed(2)} mA` },
          ]}
        />
        <Callout tone={read === 'mid' && !hiz ? 'bad' : 'ok'}>{t(hiz ? S.hizNote : CMP_TEXT[read])}</Callout>
        <Callout>{t(br.branch === 'iol' ? S.iolFlow : br.branch === 'ioh' ? S.iohFlow : S.iZero)}</Callout>
        <LoadCode vref={vref} branch={br.branch} active={peMode === 'compare'} />
        <Explain paras={LOAD_TEXT} />
        <Explain paras={[CONFLICT_TEXT, PPPMU_TEXT]} />
      </Section>

      {/* 9. 守则 */}
      <Section title={t(S.rulesTitle)} note={t(S.rulesNote)}>
        <p>{t(RULES_LEAD)}</p>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colCase)}</th>
              <th>{t(S.colYou)}</th>
            </tr>
          </thead>
          <tbody>
            {RULE_CASES.map((c) => {
              const picked = ruleAns[c.id]
              return (
                <tr key={c.id}>
                  <td>
                    {t(c.text)}
                    {picked ? <p className="intro-case">{t(c.why)}</p> : null}
                  </td>
                  <td>
                    <div className="kind">
                      {(['ok', 'bad'] as RuleAns[]).map((v) => {
                        let state = ''
                        if (picked && v === c.answer) state = ' is-right'
                        else if (picked === v) state = ' is-wrong'
                        return (
                          <button
                            key={v}
                            type="button"
                            className={`kind__btn${state}`}
                            onClick={() => {
                              setRuleAns((prev) => ({ ...prev, [c.id]: v }))
                              pickNote(c.text, c.why)
                            }}
                          >
                            {t(v === 'ok' ? S.ok : S.bad)}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Readout
          items={[
            { label: S.done, value: `${answered} / ${RULE_CASES.length}` },
            { label: S.right, value: String(correct), state: answered ? (correct === answered ? 'pass' : 'fail') : undefined },
          ]}
        />
        {answered === RULE_CASES.length ? (
          <>
            <p className="intro__note">{t(S.rulesAll)}</p>
            <Steps items={RULES} />
          </>
        ) : (
          <p className="intro__note">{t(S.rulesHint)}</p>
        )}
      </Section>

      <Section title={t(ui.fund.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.fund.quizTitle)} note={t(ui.fund.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
