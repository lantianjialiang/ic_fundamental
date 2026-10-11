import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  BIN_LEAD,
  BIN_MASK,
  BIN_TESTS,
  BIN_WHO,
  COMPARE_ROWS,
  CONCERNS,
  COST_BAD,
  COST_HINT,
  COST_OK,
  DIAG_FAULTS,
  LB_FAULTS,
  MENU_LEAD,
  MENU_LOG,
  MODES,
  MODE_TEXT,
  PROGRAMS,
  QUIZ,
  SEQ_LEAD,
  SEQ_MSG,
  SEQ_POOL,
  SEQ_RIGHT,
  SEQ_STEPS,
  TAKEAWAY,
  TEMPS,
  VERSIONS,
  VDD_ON,
  VIH_ON,
  buildStates,
  sampleAt,
  type SeqMode,
  type StepId,
  type TestMode,
} from './data/program'
import { Callout, Cards, Explain, Knob, Readout, Seg, type Note } from './parts'
import { PowerSeqFig } from './ProgramFig'
import './program.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('程序开发', 'Program development'),
  later: loc('想清楚这些以后，下一课从规格书开始，真正动手写程序。', 'With these points settled, the next lesson starts from the spec and actually writes the program.'),
  typeTitle: loc('三种程序：目的不同，写法就不同', 'Three kinds of program: different purposes, different styles'),
  typeNote: loc('点卡片看每种程序的要求；表格里高亮的就是当前选中的那一列。', 'Click a card to see what each program requires; the highlighted table column is the selected one.'),
  colItem: loc('对比项', 'Aspect'),
  concernTitle: loc('动手之前要想清楚的事', 'Things to settle before you start'),
  calcTitle: loc('产能和成本计算器', 'Throughput and cost calculator'),
  calcNote: loc('拖动参数，看每小时能测多少颗（UPH），每颗测试要花多少钱。这里假设并测时测试时间不变。', 'Drag the parameters to see units per hour (UPH) and test cost per device. Test time is assumed unchanged with parallel sites.'),
  testTime: loc('单颗测试时间', 'Test time'),
  indexTime: loc('分选机换料时间', 'Handler index time'),
  sites: loc('并测数', 'Sites'),
  rate: loc('每小时机时费', 'Tester cost per hour'),
  price: loc('芯片售价', 'Device price'),
  cycle: loc('每次插入用时', 'Time per insertion'),
  uph: loc('UPH（颗/小时）', 'UPH (units/hour)'),
  perDay: loc('每天（20 小时）', 'Per day (20 h)'),
  costEach: loc('每颗测试成本', 'Test cost per device'),
  costPct: loc('占售价', 'Share of price'),
  menuTitle: loc('程序开头的操作员菜单', 'Operator menu at program start'),
  menuNote: loc('选好选项、填好信息，再试着点“开始测试”。负载板测试和诊断偶尔会失败——失败了就重跑。', 'Choose the options, fill in the info, then try "Start test". The load board test and diagnostics fail now and then; if they do, rerun them.'),
  mType: loc('测试类型', 'Test type'),
  mTemp: loc('温度', 'Temperature'),
  mVer: loc('器件版本', 'Device revision'),
  mInfo: loc('记录信息', 'Log info'),
  lot: loc('Lot 号', 'Lot'),
  op: loc('操作员', 'Operator'),
  tester: loc('机台号', 'Tester'),
  runLb: loc('运行负载板测试', 'Run load board test'),
  runDiag: loc('运行诊断', 'Run diagnostics'),
  start: loc('开始测试', 'Start test'),
  swap: loc('换了负载板（清除状态）', 'Load board changed (clear status)'),
  lbState: loc('负载板', 'Load board'),
  diagState: loc('诊断', 'Diagnostics'),
  notRun: loc('未运行', 'Not run'),
  seqTitle: loc('动手：排上电 / 下电顺序', 'Try it: order the power-up / power-down sequence'),
  seqNote: loc('从左边按你认为的顺序依次点选步骤，再点“播放”。图上实时画出 VDD、输入、输出三条电压；任何时刻输入或输出高于 VDD + 0.5 V，就会标红。', 'Click the steps on the left in the order you think is right, then click "Play". The plot draws VDD, input and output voltages in real time; whenever an input or output is above VDD + 0.5 V, it turns red.'),
  up: loc('上电', 'Power-up'),
  down: loc('下电', 'Power-down'),
  pool: loc('可选步骤（点击加入）', 'Available steps (click to add)'),
  yours: loc('你的顺序', 'Your sequence'),
  emptyOrder: loc('还没选。', 'Nothing selected yet.'),
  play: loc('播放', 'Play'),
  pause: loc('暂停', 'Pause'),
  undo: loc('撤销一步', 'Undo'),
  clear: loc('清空', 'Clear'),
  fillRight: loc('填入正确顺序', 'Fill in correct order'),
  initUp: loc('起点：VDD = 0 V，驱动器关闭（输入悬空），负载未接。', 'Start: VDD = 0 V, drivers off (inputs floating), load not connected.'),
  initDown: loc('起点：VDD = 5 V，输入 VIH = 4 V，负载接着（上拉到 5 V）。', 'Start: VDD = 5 V, input VIH = 4 V, load connected (pulled up to 5 V).'),
  outNow: loc('输出脚', 'Output pin'),
  latchNow: loc('可能闩锁', 'Possible latch-up'),
  binTitle: loc('动手：分 Bin 与测试汇总', 'Try it: binning and the test summary'),
  binNote: loc('点“跑 100 颗”，每颗芯片按流程从上往下测，第一项 Fail 就停并进对应的 Bin。选一项测试调它的失效率，看汇总怎么变。', 'Click "Run 100": each device is tested top to bottom, stopping at the first Fail and going to that bin. Pick a test, adjust its fail rate, and watch the summary change.'),
  pickTest: loc('调哪一项的失效率', 'Test whose fail rate to adjust'),
  failRate: loc('失效率', 'Fail rate'),
  run100: loc('跑 100 颗', 'Run 100'),
  run1000: loc('跑 1000 颗', 'Run 1000'),
  reset: loc('清零', 'Reset'),
  colBin: loc('Bin', 'Bin'),
  colTest: loc('测试项（第一项 Fail）', 'Test (first Fail)'),
  colCount: loc('数量', 'Count'),
  colPct: loc('占比', 'Share'),
  passBin: loc('全部 Pass（好片）', 'All Pass (good)'),
  total: loc('已测', 'Tested'),
  yieldL: loc('良率', 'Yield'),
  topFail: loc('最大损失项', 'Top loss'),
  distTitle: loc('按测试项的 Fail 分布', 'Fail distribution by test'),
}

type LogLine = { msg: LText; arg?: string; tone?: 'ok' | 'bad' }

const pickOne = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

export function FundProgramPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: PROGRAMS[0].title, text: PROGRAMS[0].text })
  // 1. 三种程序
  const [prog, setProg] = useState(PROGRAMS[0].id)
  const [concern, setConcern] = useState(CONCERNS[0].id)
  // 2. 计算器
  const [testMs, setTestMs] = useState(800)
  const [indexMs, setIndexMs] = useState(400)
  const [sites, setSites] = useState(4)
  const [rate, setRate] = useState(120)
  const [price, setPrice] = useState(1.5)
  // 3. 菜单
  const [mode, setMode] = useState<TestMode>(MODES[0].id)
  const [temp, setTemp] = useState<string>(TEMPS[0])
  const [ver, setVer] = useState<string>(VERSIONS[0])
  const [lot, setLot] = useState('')
  const [op, setOp] = useState('')
  const [tester, setTester] = useState('')
  const [lbOk, setLbOk] = useState<boolean | null>(null)
  const [diagOk, setDiagOk] = useState<boolean | null>(null)
  const [log, setLog] = useState<LogLine[]>([])
  // 4. 上下电
  const [seqMode, setSeqMode] = useState<SeqMode>('up')
  const [order, setOrder] = useState<StepId[]>([])
  const [play, setPlay] = useState(0)
  const [playing, setPlaying] = useState(false)
  // 5. 分 Bin
  const [rates, setRates] = useState<Record<string, number>>(() => Object.fromEntries(BIN_TESTS.map((x) => [x.id, x.rate])))
  const [rateTest, setRateTest] = useState(BIN_TESTS[0].id)
  const [bins, setBins] = useState<Record<number, number>>({})

  /* ---- 上下电动画 ---- */
  const states = buildStates(seqMode, order)
  const total = states.length
  const atEnd = play >= total
  useEffect(() => {
    if (!playing || atEnd) return
    const id = window.setInterval(() => setPlay((v) => Math.min(total, v + 0.05)), 40)
    return () => window.clearInterval(id)
  }, [playing, atEnd, total])

  const full = Array.from({ length: Math.round(total / 0.02) }, (_, i) => sampleAt(states, i * 0.02))
  const anyLatch = full.some((s) => s.latch)
  const anyFloat = full.some((s) => s.float)
  const latchStep = (k: number) => full.some((s) => s.latch && Math.floor(s.t) === k)
  const cur = sampleAt(states, Math.min(play, total - 1e-6))
  const fin = states[states.length - 1]
  const target = seqMode === 'up' ? { drv: true, vdd: VDD_ON, vin: VIH_ON, load: true } : { drv: false, vdd: 0, vin: 0, load: false }
  const endOk = fin.drv === target.drv && fin.vdd === target.vdd && fin.vin === target.vin && fin.load === target.load
  const isRight = order.join() === SEQ_RIGHT[seqMode].join()
  const complete = order.length === SEQ_POOL[seqMode].length

  const resetSeq = (next: StepId[]) => {
    setOrder(next)
    setPlay(0)
    setPlaying(false)
  }

  /* ---- 计算器 ---- */
  const cycleS = (testMs + indexMs) / 1000
  const uph = (3600 / cycleS) * sites
  const costEach = rate / uph
  const ratio = costEach / price
  const costTone = ratio < COST_OK ? 'ok' : ratio < COST_BAD ? 'warn' : 'bad'

  /* ---- 菜单 ---- */
  const infoOk = lot.trim() !== '' && op.trim() !== '' && tester.trim() !== ''
  const canStart = lbOk === true && diagOk === true && infoOk
  const addLog = (line: LogLine) => setLog((prev) => [...prev.slice(-11), line])
  const runLb = () => {
    const ok = Math.random() > 0.25
    setLbOk(ok)
    if (!ok) setDiagOk(null)
    addLog(ok ? { msg: MENU_LOG.lbPass, tone: 'ok' } : { msg: MENU_LOG.lbFail, arg: t(pickOne(LB_FAULTS)), tone: 'bad' })
  }
  const runDiag = () => {
    const ok = Math.random() > 0.2
    setDiagOk(ok)
    addLog(ok ? { msg: MENU_LOG.diagPass, tone: 'ok' } : { msg: MENU_LOG.diagFail, arg: t(pickOne(DIAG_FAULTS)), tone: 'bad' })
  }
  const modeLabel = MODES.find((m) => m.id === mode)?.label ?? MODES[0].label
  const startTest = () => {
    addLog({ msg: MENU_LOG.start, arg: `${t(modeLabel)} · ${temp} °C · ${ver} · LOT ${lot} · OP ${op} · TESTER ${tester}`, tone: 'ok' })
  }
  const blockMsg = lbOk !== true ? MENU_LOG.needLb : diagOk !== true ? MENU_LOG.needDiag : !infoOk ? MENU_LOG.needInfo : null

  /* ---- 分 Bin ---- */
  const runN = (n: number) => {
    const next: Record<number, number> = { ...bins }
    for (let i = 0; i < n; i += 1) {
      const failed = BIN_TESTS.find((test) => Math.random() * 100 < rates[test.id])
      const bin = failed ? failed.bin : 1
      next[bin] = (next[bin] ?? 0) + 1
    }
    setBins(next)
  }
  const tested = Object.values(bins).reduce((a, b) => a + b, 0)
  const good = bins[1] ?? 0
  const failMax = Math.max(1, ...BIN_TESTS.map((test) => bins[test.bin] ?? 0))
  const worst = BIN_TESTS.reduce((acc, test) => ((bins[test.bin] ?? 0) > (bins[acc.bin] ?? 0) ? test : acc), BIN_TESTS[0])
  const rateItem = BIN_TESTS.find((x) => x.id === rateTest) ?? BIN_TESTS[0]
  const pct = (n: number) => (tested ? `${((n / tested) * 100).toFixed(1)}%` : '—')

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fProgram.title)}
      goal={t(ui.fProgram.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fCreate"
      nextLabel={t(ui.fund.next) + t(ui.fCreate.title)}
    >
      {/* 1. 三种程序 */}
      <Section title={t(S.typeTitle)} note={t(S.typeNote)}>
        <Cards
          items={PROGRAMS}
          activeId={prog}
          onPick={(item) => {
            setProg(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={PROGRAMS.find((item) => item.id === prog)?.explain} />
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colItem)}</th>
              {PROGRAMS.map((p) => (
                <th key={p.id} className={`prog-col${p.id === prog ? ' is-active' : ''}`}>
                  {t(p.title)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.id}>
                <td>{t(row.label)}</td>
                {row.cells.map((cell, i) => (
                  <td key={PROGRAMS[i].id} className={`prog-col${PROGRAMS[i].id === prog ? ' is-active' : ''}`}>
                    {t(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* 2. 开发前要想清楚的事 */}
      <Section title={t(S.concernTitle)}>
        <Cards
          items={CONCERNS}
          activeId={concern}
          cols={4}
          onPick={(item) => {
            setConcern(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={CONCERNS.find((item) => item.id === concern)?.explain} />
        <h4 className="prog-sub">{t(S.calcTitle)}</h4>
        <p className="intro__note">{t(S.calcNote)}</p>
        <div className="knob-row">
          <Knob label={S.testTime} value={testMs} unit="ms" min={50} max={3000} step={10} onChange={setTestMs} />
          <Knob label={S.indexTime} value={indexMs} unit="ms" min={100} max={1500} step={50} onChange={setIndexMs} />
          <Knob label={S.sites} value={sites} unit="site" min={1} max={16} step={1} onChange={setSites} />
          <Knob label={S.rate} value={rate} unit="$/h" min={20} max={400} step={10} onChange={setRate} />
          <Knob label={S.price} value={price} unit="$" min={0.1} max={20} step={0.1} onChange={(v) => setPrice(Math.round(v * 10) / 10)} />
        </div>
        <Readout
          items={[
            { label: S.cycle, value: `${cycleS.toFixed(2)} s` },
            { label: S.uph, value: Math.round(uph).toLocaleString('en-US') },
            { label: S.perDay, value: Math.round(uph * 20).toLocaleString('en-US') },
            { label: S.costEach, value: `$${costEach < 0.01 ? costEach.toFixed(4) : costEach.toFixed(3)}` },
            { label: S.costPct, value: `${(ratio * 100).toFixed(2)}%`, state: costTone === 'bad' ? 'fail' : costTone === 'ok' ? 'pass' : undefined },
          ]}
        />
        <p className="intro__note">{`UPH = 3600 / ((${testMs} + ${indexMs}) / 1000) × ${sites};  ${t(S.costEach)} = ${rate} / UPH`}</p>
        <Callout tone={costTone === 'ok' ? 'ok' : costTone === 'warn' ? 'warn' : 'bad'}>{t(COST_HINT[costTone])}</Callout>
      </Section>

      {/* 3. 开头菜单 */}
      <Section title={t(S.menuTitle)} note={t(S.menuNote)}>
        {MENU_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="prog-menu">
          <p className="prog-menu__title">== TEST PROGRAM MENU ==</p>
          <div className="prog-menu__row">
            <span>{t(S.mType)}</span>
            <Seg
              options={MODES}
              value={mode}
              onChange={(id) => {
                setMode(id)
                const m = MODES.find((x) => x.id === id)
                if (m) setNote({ kicker: S.kicker, title: m.label, text: MODE_TEXT[id] })
              }}
            />
          </div>
          <div className="prog-menu__row">
            <span>{t(S.mTemp)}</span>
            <Seg options={TEMPS.map((x) => ({ id: x, label: `${x} °C` }))} value={temp} onChange={setTemp} />
          </div>
          <div className="prog-menu__row">
            <span>{t(S.mVer)}</span>
            <Seg options={VERSIONS.map((x) => ({ id: x, label: x }))} value={ver} onChange={setVer} />
          </div>
          <div className="prog-menu__row">
            <span>{t(S.mInfo)}</span>
            <div className="prog-menu__fields">
              <label>
                {t(S.lot)}
                <input value={lot} onChange={(e) => setLot(e.target.value)} placeholder="L2410A" />
              </label>
              <label>
                {t(S.op)}
                <input value={op} onChange={(e) => setOp(e.target.value)} placeholder="OP-07" />
              </label>
              <label>
                {t(S.tester)}
                <input value={tester} onChange={(e) => setTester(e.target.value)} placeholder="T05" />
              </label>
            </div>
          </div>
          <div className="row-actions">
            <button type="button" className="lab__btn" onClick={runLb}>
              {t(S.runLb)}
            </button>
            <button type="button" className="lab__btn" disabled={lbOk !== true} onClick={runDiag}>
              {t(S.runDiag)}
            </button>
            <button type="button" className="lab__btn lab__btn--primary" disabled={!canStart} onClick={startTest}>
              {t(S.start)}
            </button>
            <button
              type="button"
              className="lab__btn"
              onClick={() => {
                setLbOk(null)
                setDiagOk(null)
              }}
            >
              {t(S.swap)}
            </button>
          </div>
          <div className="row-actions">
            <span className={`prog-status${lbOk === true ? ' is-pass' : lbOk === false ? ' is-fail' : ''}`}>
              {`${t(S.lbState)}: ${lbOk === null ? t(S.notRun) : lbOk ? 'PASS' : 'FAIL'}`}
            </span>
            <span className={`prog-status${diagOk === true ? ' is-pass' : diagOk === false ? ' is-fail' : ''}`}>
              {`${t(S.diagState)}: ${diagOk === null ? t(S.notRun) : diagOk ? 'PASS' : 'FAIL'}`}
            </span>
            {blockMsg ? <span className="intro__note">{t(blockMsg)}</span> : null}
          </div>
          <div className="prog-log">
            {log.map((line, i) => (
              <p key={i} className={line.tone ? `is-${line.tone}` : ''}>
                {`> ${t(line.msg).replace('{x}', line.arg ?? '')}`}
              </p>
            ))}
          </div>
        </div>
      </Section>

      {/* 4. 上电 / 下电 */}
      <Section title={t(S.seqTitle)} note={t(S.seqNote)}>
        {SEQ_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Seg
          options={[
            { id: 'up' as const, label: S.up },
            { id: 'down' as const, label: S.down },
          ]}
          value={seqMode}
          onChange={(id) => {
            setSeqMode(id)
            resetSeq([])
          }}
        />
        <p className="intro__note">{t(seqMode === 'up' ? S.initUp : S.initDown)}</p>
        <div className="prog-seq">
          <div className="prog-seq__box">
            <h4>{t(S.pool)}</h4>
            {SEQ_POOL[seqMode].map((id) => (
              <button
                key={id}
                type="button"
                className="lab__btn"
                disabled={order.includes(id)}
                onClick={() => {
                  resetSeq([...order, id])
                  setNote({ kicker: S.kicker, title: SEQ_STEPS[id].label, text: SEQ_STEPS[id].text })
                }}
              >
                {t(SEQ_STEPS[id].label)}
              </button>
            ))}
          </div>
          <div className="prog-seq__box">
            <h4>{t(S.yours)}</h4>
            {order.length === 0 ? (
              <p className="prog-seq__empty">{t(S.emptyOrder)}</p>
            ) : (
              <ol>
                {order.map((id, i) => (
                  <li key={id} className={atEnd && latchStep(i + 1) ? 'is-bad' : ''}>
                    {t(SEQ_STEPS[id].label)}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <div className="row-actions">
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            disabled={order.length === 0}
            onClick={() => {
              if (atEnd) setPlay(0)
              setPlaying((p) => (atEnd ? true : !p))
            }}
          >
            {t(playing && !atEnd ? S.pause : S.play)}
          </button>
          <button type="button" className="lab__btn" disabled={order.length === 0} onClick={() => resetSeq(order.slice(0, -1))}>
            {t(S.undo)}
          </button>
          <button type="button" className="lab__btn" onClick={() => resetSeq([])}>
            {t(S.clear)}
          </button>
          <button type="button" className="lab__btn" onClick={() => resetSeq(SEQ_RIGHT[seqMode])}>
            {t(S.fillRight)}
          </button>
        </div>
        <figure className="term-fig">
          <PowerSeqFig states={states} play={play} />
        </figure>
        {atEnd && order.length > 0 ? (
          <>
            {anyLatch ? <Callout tone="bad">{t(SEQ_MSG.latch)}</Callout> : null}
            {anyFloat ? <Callout tone="warn">{t(SEQ_MSG.float)}</Callout> : null}
            {complete && !endOk ? <Callout tone="warn">{t(SEQ_MSG.wrongEnd)}</Callout> : null}
            {complete && !anyLatch && !isRight && endOk ? <Callout tone="warn">{t(SEQ_MSG.order)}</Callout> : null}
            {isRight && !anyLatch ? <Callout tone="ok">{t(SEQ_MSG.ok)}</Callout> : null}
          </>
        ) : null}
        <Readout
          items={[
            { label: 'VDD', value: `${cur.vdd.toFixed(2)} V` },
            { label: 'VIH', value: cur.vin === null ? 'Z' : `${cur.vin.toFixed(2)} V` },
            { label: S.outNow, value: `${cur.out.toFixed(2)} V` },
            { label: 'VDD + 0.5 V', value: `${(cur.vdd + 0.5).toFixed(2)} V` },
            { label: 'Latch-up', value: cur.latch ? t(S.latchNow) : 'OK', state: cur.latch ? 'fail' : 'pass' },
          ]}
        />
        <p className="intro__note">{`${t(S.up)}: ${SEQ_RIGHT.up.map((id) => t(SEQ_STEPS[id].label)).join(' → ')}`}</p>
        <p className="intro__note">{`${t(S.down)}: ${SEQ_RIGHT.down.map((id) => t(SEQ_STEPS[id].label)).join(' → ')}`}</p>
      </Section>

      {/* 5. 分 Bin */}
      <Section title={t(S.binTitle)} note={t(S.binNote)}>
        {BIN_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <p className="intro__note">{t(S.pickTest)}</p>
        <Seg options={BIN_TESTS.map((x) => ({ id: x.id, label: x.name }))} value={rateTest} onChange={setRateTest} />
        <div className="knob-row">
          <Knob
            label={rateItem.name}
            value={rates[rateItem.id]}
            unit="%"
            min={0}
            max={30}
            step={0.5}
            onChange={(v) => setRates((prev) => ({ ...prev, [rateItem.id]: v }))}
          />
        </div>
        <div className="row-actions">
          <button type="button" className="lab__btn lab__btn--primary" onClick={() => runN(100)}>
            {t(S.run100)}
          </button>
          <button type="button" className="lab__btn" onClick={() => runN(1000)}>
            {t(S.run1000)}
          </button>
          <button type="button" className="lab__btn" onClick={() => setBins({})}>
            {t(S.reset)}
          </button>
        </div>
        <Readout
          items={[
            { label: S.total, value: String(tested) },
            { label: S.yieldL, value: pct(good), state: tested ? (good / tested >= 0.85 ? 'pass' : 'fail') : undefined },
            { label: S.topFail, value: tested && (bins[worst.bin] ?? 0) > 0 ? `${t(worst.name)} · Bin ${worst.bin}` : '—' },
          ]}
        />
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colBin)}</th>
              <th>{t(S.colTest)}</th>
              <th>{t(S.failRate)}</th>
              <th>{t(S.colCount)}</th>
              <th>{t(S.colPct)}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="is-pass">
              <td className="mono-cell">1</td>
              <td className="verdict">{t(S.passBin)}</td>
              <td className="mono-cell">—</td>
              <td className="mono-cell">{good}</td>
              <td className="mono-cell">{pct(good)}</td>
            </tr>
            {BIN_TESTS.map((test) => (
              <tr
                key={test.id}
                className={`is-fail is-click${test.id === rateTest ? ' is-active' : ''}`}
                onClick={() => setRateTest(test.id)}
              >
                <td className="mono-cell">{test.bin}</td>
                <td className="verdict">{t(test.name)}</td>
                <td className="mono-cell">{`${rates[test.id]}%`}</td>
                <td className="mono-cell">{bins[test.bin] ?? 0}</td>
                <td className="mono-cell">{pct(bins[test.bin] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4 className="prog-sub">{t(S.distTitle)}</h4>
        <div className="bars">
          {BIN_TESTS.map((test) => {
            const n = bins[test.bin] ?? 0
            return (
              <div key={test.id} className="bars__col">
                <div className="bars__fill is-bad" style={{ height: `${(n / failMax) * 100}%` }} />
                <span>{t(test.name)}</span>
                <em>{n}</em>
              </div>
            )
          })}
        </div>
        <Callout tone="warn">{t(BIN_MASK)}</Callout>
        {BIN_WHO.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
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
