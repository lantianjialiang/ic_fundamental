import { useEffect, useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { AcCalcFig, ShmooFig, type Cell } from './CharFig'
import {
  AC_DEFAULT,
  AC_INFO,
  AC_LEAD,
  AC_SPAN,
  CHECK_RANGES,
  CHECK_TRUTH,
  DATALOG_LEAD,
  DEMO_LEAD,
  DEMO_STEPS,
  FIG95_IN,
  FIG95_NOTE,
  FIG95_OUT,
  FIG96,
  FIG96_NOTE,
  HOLE_TEXT,
  LINEAR_WHEN,
  PARAMS,
  PLAN,
  QUIZ,
  RACE_LEAD,
  RACE_MAX,
  READ_QUIZ,
  RES_OPTIONS,
  SHMOO_LEAD,
  SH_VDD,
  SH_VDDMIN,
  SH_VIH_FIXED,
  TAKEAWAY,
  TOOLS,
  TOOLS_TIP,
  TRACK_TEXT,
  WHAT,
  binDone,
  binInit,
  binStep,
  linInit,
  linStep,
  shPass,
  shVil,
  type AcKind,
  type BinState,
  type LinState,
  type ResMv,
  type Test,
} from './data/char'
import { Callout, Cards, Explain, Knob, Readout, Seg, Steps, type Note } from './parts'
import './char.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('器件表征'),
  later: loc('表征需要合适的向量。下一课讲测试向量从哪里来、怎么写。'),
  whatTitle: loc('表征是什么'),
  checkTitle: loc('先检查：范围两端是不是一 Pass 一 Fail'),
  checkNote: loc('这颗芯片的 VIL 门限其实在 1.34 V。选一个搜索范围，在两端各跑一次功能测试。'),
  lowEnd: loc('下端'),
  highEnd: loc('上端'),
  canSearch: loc('能不能搜'),
  yes: loc('可以搜'),
  no: loc('范围没包住边界'),
  checkOk: loc('一端 Pass、一端 Fail：边界一定夹在中间，可以开始搜。'),
  checkBad: loc('两端结果一样：边界不在这个范围里，搜出来只会停在端点上，数据没有意义。先把范围放宽。'),
  raceTitle: loc('动手：二分 vs 线性，搜 VIL 门限'),
  res: loc('分辨率'),
  newChip: loc('换一颗'),
  step: loc('单步'),
  play: loc('自动播放'),
  pause: loc('暂停'),
  runAll: loc('跑到底'),
  reset: loc('重来'),
  bin: loc('二分搜索'),
  lin: loc('线性搜索'),
  runs: loc('已跑次数'),
  range: loc('当前范围'),
  testing: loc('下一次测'),
  result: loc('结果'),
  truth: loc('真实门限'),
  hidden: loc('？（搜完揭晓）'),
  raceDone: loc('二分 {b} 次，线性 {l} 次。共 {n} 档，log₂{n} ≈ {lg}，二分只要 ⌈{lg}⌉ = {c} 次；线性要从 0 V 一档档走到门限之上。'),
  raceTip: loc('试试把分辨率从 50 mV 调到 10 mV：档数变成 5 倍，二分只多 2 次，线性却多了好几倍。'),
  demoTitle: loc('小例子：在 1…9 里找 4'),
  next: loc('下一步'),
  colStep: loc('#'),
  colRange: loc('范围'),
  colMid: loc('中点'),
  colCmp: loc('比较'),
  colNext: loc('新范围'),
  acTitle: loc('动手：从搜索结果算 AC 参数'),
  refKnob: loc('参考沿'),
  resKnob: loc('搜索结果'),
  formula: loc('公式'),
  value: loc('结果'),
  moved: loc('移动的是：'),
  negSetupHold: loc('结果为负：数据可以在参考沿之后才到（或之前就撤走）芯片仍能工作。有些器件的规格里确实写着负的建立 / 保持时间。'),
  negTpd: loc('结果为负：Strobe 早于输入沿就 Pass，不可能是真实延迟。检查向量是不是在比较正确的那次跳变，或者搜索范围设错了。'),
  paramTitle: loc('常见表征参数'),
  paramNote: loc('点一行，右侧栏显示怎么搜。'),
  colParam: loc('参数'),
  colWhat: loc('找什么'),
  planTitle: loc('规划表征的注意事项'),
  shTitle: loc('动手：VDD vs VIL Shmoo 图'),
  cols: loc('X 轴档数'),
  start: loc('开始打点'),
  hole: loc('芯片有洞'),
  track: loc('VIH 跟踪 VDD'),
  on: loc('开'),
  off: loc('关'),
  viewCell: loc('色块'),
  viewChar: loc('字符 $ .'),
  msPer: loc('每点测试耗时'),
  tests: loc('已跑测试'),
  elapsed: loc('累计用时'),
  total: loc('整张图需要'),
  point: loc('当前格'),
  pointRes: loc('该点结果'),
  notRun: loc('未测'),
  pick: loc('悬停格子'),
  warn: loc('VIH 固定在 4.5 V：VDD 低于 4.5 V 的红色行，输入比电源还高——保护二极管正偏，有闩锁风险。打开“VIH 跟踪 VDD”。'),
  tracked: loc('VIH 跟着 VDD 一起变（VIH = VDD），任何一行都不会出现输入高于电源。'),
  shReadVddmin: loc('读图：VDD 低于约 {v} V 时整行都 Fail，这就是 VDDMIN；每一行 $ 区的左边界就是该 VDD 下的 VIL 门限，随 VDD 升高往左移（门限变高）。'),
  logTitle: loc('Datalog 与系统工具'),
  fig95: loc('输入 / 输出门限'),
  fig96: loc('dbus[7:0] 输出延迟搜索结果'),
  colTest: loc('测试项'),
  colPin: loc('管脚'),
  colPinName: loc('管脚名'),
  colTp: loc('测试机通道'),
  colMode: loc('模式'),
  colOrig: loc('原始值'),
  colBegin: loc('起点'),
  colMeas: loc('测得值'),
  colEnd: loc('终点'),
  colFail: loc('失败向量'),
  inTh: loc('输入门限'),
  outTh: loc('输出门限'),
  row96: loc('{p}：输出在 {m} ns 完成跳变，比原来设的 45 ns 快很多；搜索在 1.0–80.0 ns 范围内进行，Fail 记录在第 {f} 个向量。'),
  readQuiz: loc('读图小问题'),
  toolsTitle: loc('用好测试机自带的工具'),
}

const fmtNs = (v: number) => `${v.toFixed(1)} ns`

export function FundCharPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: WHAT[0].title, text: WHAT[0].text })
  const [what, setWhat] = useState('limit')
  const [checkId, setCheckId] = useState('good')

  // 二分 vs 线性
  const [truth, setTruth] = useState(1.287)
  const [res, setRes] = useState<ResMv>(20)
  const n = Math.round((RACE_MAX * 1000) / res)
  const resV = res / 1000
  const [bin, setBin] = useState<BinState>(() => binInit(100))
  const [lin, setLin] = useState<LinState>(() => linInit())
  const [racing, setRacing] = useState(false)
  const [demo, setDemo] = useState(0)

  // AC 计算
  const [acKind, setAcKind] = useState<AcKind>('setup')
  const [acPos, setAcPos] = useState(AC_DEFAULT)

  // 参数表
  const [param, setParam] = useState('vddmin')

  // Shmoo
  const [cols, setCols] = useState(51)
  const [hole, setHole] = useState(false)
  const [track, setTrack] = useState(true)
  const [charView, setCharView] = useState(false)
  const [msPer, setMsPer] = useState(50)
  const [filled, setFilled] = useState(0)
  const [shPlaying, setShPlaying] = useState(false)
  const [hover, setHover] = useState<Cell | null>(null)
  const [row96, setRow96] = useState<string | null>(null)

  const raceDone = binDone(bin) && lin.done
  useEffect(() => {
    if (!racing || raceDone) return
    const id = window.setInterval(() => {
      setBin((s) => binStep(s, resV, truth))
      setLin((s) => linStep(s, n, resV, truth))
    }, 90)
    return () => window.clearInterval(id)
  }, [racing, raceDone, resV, truth, n])

  const vils = useMemo(() => shVil(cols), [cols])
  const grid = useMemo(() => SH_VDD.map((vdd) => vils.map((vil) => shPass(vdd, vil, hole))), [vils, hole])
  const shTotal = SH_VDD.length * cols
  const shDone = filled >= shTotal
  useEffect(() => {
    if (!shPlaying || shDone) return
    const batch = Math.ceil(shTotal / 160)
    const id = window.setInterval(() => setFilled((f) => Math.min(shTotal, f + batch)), 30)
    return () => window.clearInterval(id)
  }, [shPlaying, shDone, shTotal])

  /* ---- 端点检查 ---- */
  const check = CHECK_RANGES.find((r) => r.id === checkId) ?? CHECK_RANGES[0]
  const loPass = check.lo <= CHECK_TRUTH
  const hiPass = check.hi <= CHECK_TRUTH
  const checkOk = loPass !== hiPass

  /* ---- 赛跑 ---- */
  const resetRace = (nextRes: ResMv = res, nextTruth = truth) => {
    setRacing(false)
    setBin(binInit(Math.round((RACE_MAX * 1000) / nextRes)))
    setLin(linInit())
    setRes(nextRes)
    setTruth(nextTruth)
  }
  const stepRace = () => {
    setBin((s) => binStep(s, resV, truth))
    setLin((s) => linStep(s, n, resV, truth))
  }
  const runAllRace = () => {
    let b = bin
    let l = lin
    for (let i = 0; i < 2 * n + 4; i += 1) {
      b = binStep(b, resV, truth)
      l = linStep(l, n, resV, truth)
    }
    setBin(b)
    setLin(l)
    setRacing(false)
  }
  const binNext = binDone(bin) ? null : Math.floor((bin.lo + bin.hi) / 2)
  const linLastPass = [...lin.tests].reverse().find((x) => x.pass)
  const linLo = linLastPass ? linLastPass.i : 0
  const linHi = lin.done ? linLo + 1 : n
  const lg = Math.log2(n)
  const fmtVolt = (i: number) => `${(i * resV).toFixed(2)} V`

  const lane = (title: typeof S.bin, tests: Test[], lo: number, hi: number, next: number | null, done: boolean, result: string) => (
    <div className={`char-race__lane${done ? ' is-done' : ''}`}>
      <h4>{t(title)}</h4>
      <div className="search-bar">
        <div className="search-bar__range" style={{ left: `${(lo / n) * 100}%`, width: `${((hi - lo) / n) * 100}%` }} />
        {tests.map((x) => (
          <i key={x.i} className={x.pass ? 'is-pass' : 'is-fail'} style={{ left: `${(x.i / n) * 100}%` }} title={fmtVolt(x.i)} />
        ))}
        {raceDone ? <b style={{ left: `${(truth / RACE_MAX) * 100}%` }} /> : null}
        <span className="search-bar__lo">0 V</span>
        <span className="search-bar__hi">2.0 V</span>
      </div>
      <Readout
        items={[
          { label: S.runs, value: String(tests.length) },
          { label: S.range, value: `${(lo * resV).toFixed(2)}–${(hi * resV).toFixed(2)}` },
          done ? { label: S.result, value: result, state: 'pass' } : { label: S.testing, value: next === null ? '—' : fmtVolt(next) },
        ]}
      />
    </div>
  )

  /* ---- AC ---- */
  const ac = acPos[acKind]
  const acInfo = AC_INFO[acKind]
  const acValue = acKind === 'setup' ? ac.ref - ac.res : ac.res - ac.ref
  const setAc = (which: 'ref' | 'res', v: number) => setAcPos((prev) => ({ ...prev, [acKind]: { ...prev[acKind], [which]: v } }))

  /* ---- 参数表 ---- */
  const paramItem = PARAMS.find((p) => p.id === param) ?? PARAMS[0]

  /* ---- Shmoo ---- */
  const warnRows = SH_VDD.map((vdd) => !track && vdd < SH_VIH_FIXED - 1e-9)
  const hoverIdx = hover ? hover.r * cols + hover.c : -1
  const testsRun = Math.min(filled, shTotal)
  const fmtSec = (ms: number) => (ms >= 60000 ? `${(ms / 60000).toFixed(1)} min` : `${(ms / 1000).toFixed(1)} s`)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fChar.title)}
      goal={t(ui.fChar.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fVector"
      nextLabel={t(ui.fund.next) + t(ui.fVector.title)}
    >
      {/* 1. 表征是什么 */}
      <Section title={t(S.whatTitle)}>
        <Cards
          items={WHAT}
          activeId={what}
          onPick={(item) => {
            setWhat(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={WHAT.find((item) => item.id === what)?.explain} />
        <h4 className="char-sub">{t(S.checkTitle)}</h4>
        <p className="intro__note">{t(S.checkNote)}</p>
        <Seg
          options={CHECK_RANGES.map((r) => ({ id: r.id, label: `${r.lo.toFixed(1)} – ${r.hi.toFixed(1)} V` }))}
          value={checkId}
          onChange={setCheckId}
        />
        <Readout
          items={[
            { label: S.lowEnd, value: `${check.lo.toFixed(1)} V → ${loPass ? 'PASS' : 'FAIL'}`, state: loPass ? 'pass' : 'fail' },
            { label: S.highEnd, value: `${check.hi.toFixed(1)} V → ${hiPass ? 'PASS' : 'FAIL'}`, state: hiPass ? 'pass' : 'fail' },
            { label: S.canSearch, value: t(checkOk ? S.yes : S.no), state: checkOk ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone={checkOk ? 'ok' : 'bad'}>{t(checkOk ? S.checkOk : S.checkBad)}</Callout>
      </Section>

      {/* 2. 二分 vs 线性 */}
      <Section title={t(S.raceTitle)}>
        {RACE_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="row-actions">
          <span className="intro__note">{t(S.res)}</span>
          <Seg
            options={RES_OPTIONS.map((r) => ({ id: String(r), label: `${r} mV` }))}
            value={String(res)}
            onChange={(id) => resetRace(Number(id) as ResMv)}
          />
          <button type="button" className="lab__btn" onClick={() => resetRace(res, Math.round((0.9 + Math.random() * 0.8) * 1000) / 1000)}>
            {t(S.newChip)}
          </button>
        </div>
        <div className="row-actions">
          <button type="button" className="lab__btn lab__btn--primary" disabled={raceDone} onClick={stepRace}>
            {t(S.step)}
          </button>
          <button type="button" className="lab__btn" disabled={raceDone} onClick={() => setRacing((p) => !p)}>
            {t(racing && !raceDone ? S.pause : S.play)}
          </button>
          <button type="button" className="lab__btn" disabled={raceDone} onClick={runAllRace}>
            {t(S.runAll)}
          </button>
          <button type="button" className="lab__btn" onClick={() => resetRace()}>
            {t(S.reset)}
          </button>
        </div>
        <div className="char-race">
          {lane(S.bin, bin.tests, bin.lo, bin.hi, binNext, binDone(bin), fmtVolt(bin.lo))}
          {lane(S.lin, lin.tests, linLo, linHi, lin.done ? null : lin.k, lin.done, fmtVolt(linLo))}
        </div>
        <Readout items={[{ label: S.truth, value: raceDone ? `${truth.toFixed(3)} V` : t(S.hidden) }]} />
        {raceDone ? (
          <Callout tone="ok">
            {t(S.raceDone)
              .replace('{b}', String(bin.tests.length))
              .replace('{l}', String(lin.tests.length))
              .replaceAll('{n}', String(n))
              .replaceAll('{lg}', lg.toFixed(1))
              .replace('{c}', String(Math.ceil(lg)))}
          </Callout>
        ) : (
          <p className="intro__note">{t(S.raceTip)}</p>
        )}
        <Callout tone="warn">
          {LINEAR_WHEN.map((para) => (
            <p key={para.zh}>{t(para)}</p>
          ))}
        </Callout>

        <h4 className="char-sub">{t(S.demoTitle)}</h4>
        <p className="intro__note">{t(DEMO_LEAD)}</p>
        <div className="row-actions">
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            disabled={demo >= DEMO_STEPS.length}
            onClick={() => setDemo((d) => Math.min(DEMO_STEPS.length, d + 1))}
          >
            {t(S.next)}
          </button>
          <button type="button" className="lab__btn" onClick={() => setDemo(0)}>
            {t(S.reset)}
          </button>
        </div>
        {demo > 0 ? (
          <table className="dtable char-demo">
            <thead>
              <tr>
                <th>{t(S.colStep)}</th>
                <th>{t(S.colRange)}</th>
                <th>{t(S.colMid)}</th>
                <th>{t(S.colCmp)}</th>
                <th>{t(S.colNext)}</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_STEPS.slice(0, demo).map((row, i) => (
                <tr key={row.range}>
                  <td className={`mono-cell${i === demo - 1 ? ' is-now' : ''}`}>{i + 1}</td>
                  <td className="mono-cell">{row.range}</td>
                  <td className="mono-cell">{row.mid}</td>
                  <td>{t(row.cmp)}</td>
                  <td className="mono-cell">{row.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Section>

      {/* 3. 从搜索结果算 AC 参数 */}
      <Section title={t(S.acTitle)} note={t(AC_LEAD)}>
        <Seg
          options={[
            { id: 'setup' as const, label: 'Setup' },
            { id: 'hold' as const, label: 'Hold' },
            { id: 'tpd' as const, label: 'tPD' },
          ]}
          value={acKind}
          onChange={(id) => {
            setAcKind(id)
            setNote({ kicker: S.kicker, title: AC_INFO[id].name, text: AC_INFO[id].text })
          }}
        />
        <div className="knob-row">
          <Knob label={S.refKnob} value={ac.ref} unit="ns" min={0} max={AC_SPAN} step={0.5} onChange={(v) => setAc('ref', v)} />
          <Knob label={S.resKnob} value={ac.res} unit="ns" min={0} max={AC_SPAN} step={0.5} onChange={(v) => setAc('res', v)} />
        </div>
        <AcCalcFig kind={acKind} refT={ac.ref} resT={ac.res} onChange={setAc} />
        <Readout
          items={[
            { label: S.formula, value: acInfo.formula },
            {
              label: S.value,
              value: `${acKind === 'setup' ? `${fmtNs(ac.ref)} − ${fmtNs(ac.res)}` : `${fmtNs(ac.res)} − ${fmtNs(ac.ref)}`} = ${fmtNs(acValue)}`,
              state: acValue < 0 ? 'fail' : 'pass',
            },
          ]}
        />
        <Callout>
          <p>
            <b>{t(S.moved)}</b>
            {t(acInfo.moved)}
          </p>
          <p>{t(acInfo.text)}</p>
        </Callout>
        {acValue < 0 ? <Callout tone="bad">{t(acKind === 'tpd' ? S.negTpd : S.negSetupHold)}</Callout> : null}
      </Section>

      {/* 4. 常见参数 */}
      <Section title={t(S.paramTitle)} note={t(S.paramNote)}>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colParam)}</th>
              <th>{t(S.colWhat)}</th>
            </tr>
          </thead>
          <tbody>
            {PARAMS.map((p) => (
              <tr
                key={p.id}
                className={`is-click${p.id === param ? ' is-active' : ''}`}
                onClick={() => {
                  setParam(p.id)
                  setNote({ kicker: S.kicker, title: p.name, text: p.how })
                }}
              >
                <td className="mono-cell">{t(p.name)}</td>
                <td>{t(p.what)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Explain paras={[paramItem.how]} />
        <h4 className="char-sub">{t(S.planTitle)}</h4>
        <Steps items={PLAN} />
      </Section>

      {/* 5. Shmoo */}
      <Section title={t(S.shTitle)}>
        {SHMOO_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="row-actions">
          <span className="intro__note">{t(S.cols)}</span>
          <Seg
            options={[
              { id: '26', label: '26' },
              { id: '51', label: '51' },
            ]}
            value={String(cols)}
            onChange={(id) => {
              setCols(Number(id))
              setFilled(0)
              setShPlaying(false)
              setHover(null)
            }}
          />
          <Seg
            options={[
              { id: 'cell', label: S.viewCell },
              { id: 'char', label: S.viewChar },
            ]}
            value={charView ? 'char' : 'cell'}
            onChange={(id) => setCharView(id === 'char')}
          />
        </div>
        <div className="row-actions">
          <span className="intro__note">{t(S.hole)}</span>
          <Seg
            options={[
              { id: 'off', label: S.off },
              { id: 'on', label: S.on },
            ]}
            value={hole ? 'on' : 'off'}
            onChange={(id) => {
              setHole(id === 'on')
              setFilled(0)
              setShPlaying(false)
              if (id === 'on') setNote({ kicker: S.kicker, title: S.hole, text: HOLE_TEXT })
            }}
          />
          <span className="intro__note">{t(S.track)}</span>
          <Seg
            options={[
              { id: 'on', label: S.on },
              { id: 'off', label: S.off },
            ]}
            value={track ? 'on' : 'off'}
            onChange={(id) => {
              setTrack(id === 'on')
              setNote({ kicker: S.kicker, title: S.track, text: TRACK_TEXT })
            }}
          />
        </div>
        <div className="knob-row">
          <Knob label={S.msPer} value={msPer} unit="ms" min={5} max={200} step={5} onChange={setMsPer} />
        </div>
        <div className="row-actions">
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            disabled={shPlaying && !shDone}
            onClick={() => {
              if (shDone) setFilled(0)
              setShPlaying(true)
            }}
          >
            {t(S.start)}
          </button>
          <button type="button" className="lab__btn" disabled={!shPlaying || shDone} onClick={() => setShPlaying(false)}>
            {t(S.pause)}
          </button>
          <button type="button" className="lab__btn" disabled={shDone} onClick={() => setFilled(shTotal)}>
            {t(S.runAll)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              setFilled(0)
              setShPlaying(false)
            }}
          >
            {t(S.reset)}
          </button>
        </div>
        <ShmooFig vdds={SH_VDD} vils={vils} grid={grid} filled={filled} charView={charView} warnRows={warnRows} hover={hover} onHover={setHover} />
        <Readout
          items={[
            { label: S.tests, value: `${testsRun} / ${shTotal}` },
            { label: S.elapsed, value: fmtSec(testsRun * msPer) },
            { label: S.total, value: fmtSec(shTotal * msPer) },
            hover
              ? { label: S.point, value: `VDD ${SH_VDD[hover.r].toFixed(1)} V · VIL ${vils[hover.c].toFixed(2)} V` }
              : { label: S.point, value: t(S.pick) },
            hover
              ? hoverIdx < filled
                ? { label: S.pointRes, value: grid[hover.r][hover.c] ? 'PASS $' : 'FAIL .', state: grid[hover.r][hover.c] ? 'pass' : 'fail' }
                : { label: S.pointRes, value: t(S.notRun) }
              : { label: S.pointRes, value: '—' },
          ]}
        />
        {track ? <Callout tone="ok">{t(S.tracked)}</Callout> : <Callout tone="bad">{t(S.warn)}</Callout>}
        {shDone ? <Callout>{t(S.shReadVddmin).replace('{v}', SH_VDDMIN.toFixed(2).replace(/0$/, ''))}</Callout> : null}
        {hole && shDone ? <Callout tone="warn">{t(HOLE_TEXT)}</Callout> : null}
      </Section>

      {/* 6. Datalog */}
      <Section title={t(S.logTitle)}>
        {DATALOG_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <h4 className="char-sub">{t(S.fig95)}</h4>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colTest)}</th>
              <th>{t(S.colPin)}</th>
              <th>VDDMIN 4.5 V</th>
              <th>VDDNOM 5.0 V</th>
              <th>VDDMAX 5.5 V</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5}>
                <b>{t(S.inTh)}</b>
              </td>
            </tr>
            {FIG95_IN.map((row) => (
              <tr key={`${row.name}${row.pin}`}>
                <td className="mono-cell">{`${row.name} THRESHOLD`}</td>
                <td className="mono-cell">{row.pin}</td>
                {row.v.map((v, i) => (
                  <td key={i} className="mono-cell">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td colSpan={5}>
                <b>{t(S.outTh)}</b>
              </td>
            </tr>
            {FIG95_OUT.map((row) => (
              <tr key={`${row.name}${row.pin}`}>
                <td className="mono-cell">{`${row.name} THRESHOLD`}</td>
                <td className="mono-cell">{row.pin}</td>
                {row.v.map((v, i) => (
                  <td key={i} className="mono-cell">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="intro__note">{t(FIG95_NOTE)}</p>

        <h4 className="char-sub">{t(S.fig96)}</h4>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colPinName)}</th>
              <th>{t(S.colTp)}</th>
              <th>{t(S.colMode)}</th>
              <th>{t(S.colOrig)}</th>
              <th>{t(S.colBegin)}</th>
              <th>{t(S.colMeas)}</th>
              <th>{t(S.colEnd)}</th>
              <th>{t(S.colFail)}</th>
            </tr>
          </thead>
          <tbody>
            {FIG96.map((row) => (
              <tr
                key={row.pin}
                className={`is-click${row96 === row.pin ? ' is-active' : ''}`}
                onClick={() => {
                  setRow96(row.pin)
                  setNote({
                    kicker: S.kicker,
                    title: row.pin,
                    text: t(S.row96).replace('{p}', row.pin).replace('{m}', row.measured.toFixed(1)).replace('{f}', String(row.fail)),
                  })
                }}
              >
                <td className="mono-cell">{row.pin}</td>
                <td className="mono-cell">{row.tp}</td>
                <td className="mono-cell">EDGE</td>
                <td className="mono-cell">45.0ns</td>
                <td className="mono-cell">1.0ns</td>
                <td className="mono-cell">{`${row.measured.toFixed(1)}ns`}</td>
                <td className="mono-cell">80.0ns</td>
                <td className="mono-cell">{row.fail}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="intro__note">{t(FIG96_NOTE)}</p>

        <h4 className="char-sub">{t(S.readQuiz)}</h4>
        <QuizList questions={READ_QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />

        <h4 className="char-sub">{t(S.toolsTitle)}</h4>
        <Cards
          items={TOOLS}
          cols={3}
          onPick={(item) => setNote({ kicker: S.kicker, title: item.title, text: item.text })}
        />
        <Callout tone="ok">{t(TOOLS_TIP)}</Callout>
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
