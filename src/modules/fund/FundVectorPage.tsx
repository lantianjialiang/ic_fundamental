import { useEffect, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  CB_LEAD,
  CB_WHY,
  CHARS,
  DEPTHS,
  FILE_HEAD,
  FILE_NOTE,
  HAND_TIPS,
  MEM_LEAD,
  MICRO,
  MICRO_TEXT,
  PINS,
  PIPE_VECS,
  QUIZ,
  RULES,
  RULE_EXTRA,
  SCENE_TEXT,
  SIM_LEAD,
  SIM_PERIOD,
  SIM_SIGS,
  SIM_SPAN,
  SOURCE_LEAD,
  STAGES,
  TAKEAWAY,
  TESTERS,
  TS_TEXT,
  VEC_LEAD,
  VIOLATIONS,
  VLINES,
  analyzeLoss,
  cbRows,
  charText,
  microCycles,
  pocLines,
  posLines,
  sigSegs,
  type CbView,
  type SimLine,
  type SimScene,
} from './data/vector'
import { Callout, Cards, Explain, Knob, Readout, Seg, Steps, type Note } from './parts'
import { CheckerFig, PipeFig } from './VectorFig'
import { WaveRows } from './WaveRows'
import './vector.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('测试向量', 'Test vectors'),
  later: loc('有了向量，还要把它们和时序、电平、DC 测试组织成一个完整的测试程序——下一课。', 'With vectors in hand, they still have to be organized with timing, levels and DC tests into a complete test program: the next lesson.'),
  whatTitle: loc('向量是什么', 'What a vector is'),
  charsNote: loc('点字符看它让测试机做什么。', 'Click a character to see what it tells the tester to do.'),
  pipeTitle: loc('动手：一行向量怎么变成管脚波形', 'Try it: how a vector row becomes a pin waveform'),
  pipeNote: loc('选一行向量，单步看它经过 Time Set、格式、电平，再到 DUT 和比较器。自动播放会一行接一行跑下去。', 'Pick a vector row and step through the time set, format and levels, then the DUT and the comparator. Auto-play runs row after row.'),
  vec: loc('向量', 'Vector'),
  stuck: loc('故障芯片：OUT 卡在 1', 'Faulty device: OUT stuck at 1'),
  step: loc('单步', 'Step'),
  play: loc('自动播放', 'Auto-play'),
  pause: loc('暂停', 'Pause'),
  reset: loc('重来', 'Reset'),
  stage: loc('当前阶段', 'Stage'),
  verdict: loc('比较结果', 'Result'),
  waiting: loc('还没到比较器', 'Not at comparator yet'),
  noCmp: loc('X：不比较', 'X: no compare'),
  microTitle: loc('向量里的微码指令', 'Microcode instructions in vectors'),
  fileTitle: loc('动手：读一份向量文件', 'Try it: read a vector file'),
  fileNote: loc('点“执行”一行一行跑；点任意一个字符、Time Set 名或微码看解释，同一列会一起高亮。', 'Click "Run row" to execute line by line; click any character, time set name or microcode for an explanation, and its column is highlighted.'),
  exec: loc('执行一行', 'Run row'),
  runAll: loc('跑到底', 'Run to end'),
  line: loc('当前行', 'Row'),
  cycles: loc('已执行周期', 'Cycles run'),
  ts: loc('当前 Time Set', 'Time set'),
  micro: loc('微码', 'Microcode'),
  notStarted: loc('未开始', 'Not started'),
  halted: loc('已 Halt：向量序列结束。共 {n} 行、{c} 个周期——Repeat 25 一行就占了 25 个周期。', 'Halted: the vector sequence has ended. {n} rows, {c} cycles in total; the Repeat 25 row alone takes 25 cycles.'),
  cbTitle: loc('256 × 4 SRAM 棋盘格向量', '256 × 4 SRAM checkerboard vectors'),
  cbWrite: loc('写一遍', 'Write pass'),
  cbRead: loc('读一遍', 'Read pass'),
  cbStart: loc('从这个地址看起', 'Start address'),
  cbTotal: loc('整片：写 256 个周期 + 读 256 个周期 = 512 个周期。', 'Whole array: 256 write cycles + 256 read cycles = 512 cycles.'),
  testersTitle: loc('不同测试机，写法不同', 'Different testers, different syntax'),
  simTitle: loc('动手：仿真数据怎么采集', 'Try it: capturing simulation data'),
  scene: loc('场景', 'Scenario'),
  sceneMixed: loc('混合格式', 'Mixed formats'),
  sceneNrz: loc('全部 NRZ', 'All NRZ'),
  strobeKnob: loc('Print on Strobe 采样点（周期内）', 'Print on Strobe sample point (in cycle)'),
  posTitle: loc('Print on Strobe（按周期）', 'Print on Strobe (cycle-based)'),
  pocTitle: loc('Print on Change（按事件）', 'Print on Change (event-based)'),
  posLines: loc('Strobe 行数', 'Strobe rows'),
  pocLines: loc('Change 行数', 'Change rows'),
  intra: loc('周期中间的边沿', 'Mid-cycle edges'),
  lostPulse: loc('完全丢失的脉冲', 'Pulses lost'),
  late: loc('推迟到下一周期', 'Delayed a cycle'),
  lostList: loc('Print on Strobe 完全没记到的脉冲：', 'Pulses Print on Strobe missed completely: '),
  lateText: loc('采样点早于 OUT 的跳变（42 ns）：OUT 的新值要到下一个周期才被记下，相当于输出晚了一个周期。', 'The sample point is earlier than the OUT transition (42 ns): the new OUT value is not recorded until the next cycle, as if the output were one cycle late.'),
  noLoss: loc('所有变化都在周期起点，每周期采一次就够了：Print on Strobe 一个变化也没丢。', 'Every change is at the start of a cycle, so one sample per cycle is enough: Print on Strobe loses nothing.'),
  intraText: loc('就算脉冲被采到了，它在周期里的确切时刻（边沿位置）也丢了——Print on Strobe 只知道“这一周期是什么值”。', 'Even when a pulse is sampled, its exact time in the cycle (edge position) is lost; Print on Strobe only knows "the value in this cycle".'),
  pocText: loc('Print on Change 每个跳变都记一行，信息完整，方便后处理；代价是文件大，一个周期可能写好几行。', 'Print on Change writes a row for every transition, so the information is complete and easy to post-process; the cost is large files, with several rows per cycle.'),
  memTitle: loc('动手：向量存储深度和重载', 'Try it: vector memory depth and reloads'),
  total: loc('向量总数', 'Total vectors'),
  depth: loc('存储深度', 'Memory depth'),
  reload: loc('每次重载耗时', 'Time per reload'),
  period: loc('测试周期', 'Test period'),
  loads: loc('分几段装', 'Loads'),
  reloads: loc('重载次数', 'Reloads'),
  execT: loc('向量执行时间', 'Vector run time'),
  extraT: loc('重载多花时间', 'Reload overhead'),
  memBad: loc('重载时间是执行时间的 {r} 倍。这颗芯片在这台测试机上几乎没法经济地测。换更深的存储，或者精简向量。', 'Reload time is {r} times the run time. This device can hardly be tested economically on this tester. Use deeper memory, or trim the vectors.'),
  memOk: loc('一次就装得下，不用重载。', 'Fits in one load, no reloads needed.'),
  memMid: loc('需要重载，测试时间增加了 {p}%。', 'Reloads needed; test time increases by {p}%.'),
  handTitle: loc('手写向量与和设计工程师合作', 'Hand-written vectors and working with design'),
  rulesTitle: loc('Simulation for Test：给仿真工程师的 15 条守则', 'Simulation for Test: 15 guidelines for simulation engineers'),
  rulesNote: loc('点一条展开。这份守则可以复制给设计 / 仿真工程师。', 'Click a guideline to expand it. You can hand this list to design / simulation engineers.'),
  violTitle: loc('练习：这段仿真违反了哪条守则？', 'Exercise: which guideline does this simulation break?'),
  ruleN: loc('守则 {n}', 'Rule {n}'),
  right: loc('对！', 'Correct!'),
  wrong: loc('不对，再想想。', 'Not quite, think again.'),
  score: loc('答对', 'Correct'),
  sep: loc('，', ', '),
}

const fmtTime = (ms: number) => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)} µs`
  if (ms < 1000) return `${ms.toFixed(ms < 10 ? 2 : 0)} ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`
  return `${(ms / 60000).toFixed(1)} min`
}

function simText(names: string[], lines: SimLine[]) {
  const head = `${'time'.padStart(7)}  ${names.join(' ')}`
  const rows = lines.map((l) => `${`${l.t}ns`.padStart(7)}  ${l.vals.map((v, i) => String(v).padStart(names[i].length)).join(' ')}`)
  return [head, ...rows]
}

export function FundVectorPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: CHARS[0].title, text: CHARS[0].text })
  const [ch, setCh] = useState(CHARS[0].id)
  // 流水线
  const [pipe, setPipe] = useState({ v: 0, s: 0 })
  const [pipePlaying, setPipePlaying] = useState(false)
  const [stuck, setStuck] = useState(false)
  const [micro, setMicro] = useState(MICRO[0].id)
  // 向量文件
  const [pc, setPc] = useState(-1)
  const [filePlaying, setFilePlaying] = useState(false)
  const [sel, setSel] = useState<{ line: number; col: number } | null>(null)
  // 棋盘格
  const [cbView, setCbView] = useState<CbView>('write')
  const [cbStart, setCbStart] = useState(0)
  const [tester, setTester] = useState(TESTERS[0].id)
  // 仿真
  const [scene, setScene] = useState<SimScene>('mixed')
  const [strobe, setStrobe] = useState(50)
  // 存储
  const [totalK, setTotalK] = useState(2000)
  const [depthId, setDepthId] = useState(DEPTHS[0].id)
  const [reloadMs, setReloadMs] = useState(100)
  const [periodNs, setPeriodNs] = useState(100)
  // 守则
  const [rule, setRule] = useState(RULES[0].n)
  const [viol, setViol] = useState<Record<string, number>>({})

  const pipeEnd = pipe.v === PIPE_VECS.length - 1 && pipe.s === STAGES.length - 1
  useEffect(() => {
    if (!pipePlaying || pipeEnd) return
    const id = window.setInterval(() => {
      setPipe((p) => {
        if (p.s < STAGES.length - 1) return { v: p.v, s: p.s + 1 }
        if (p.v < PIPE_VECS.length - 1) return { v: p.v + 1, s: 0 }
        return p
      })
    }, 900)
    return () => window.clearInterval(id)
  }, [pipePlaying, pipeEnd])

  const last = VLINES.length - 1
  const fileDone = pc >= last
  useEffect(() => {
    if (!filePlaying || fileDone) return
    const id = window.setInterval(() => setPc((p) => Math.min(last, p + 1)), 700)
    return () => window.clearInterval(id)
  }, [filePlaying, fileDone, last])

  /* ---- 流水线 ---- */
  const pv = PIPE_VECS[pipe.v]
  const prevIn = pipe.v > 0 ? PIPE_VECS[pipe.v - 1].inp : 0
  const dut = (v: 0 | 1): 0 | 1 => (stuck ? 1 : v ? 0 : 1)
  const outNow = dut(pv.inp)
  const pipePass = pv.exp === 'X' ? null : (pv.exp === 'H') === (outNow === 1)
  const stageItem = STAGES[pipe.s]
  const pickStage = (s: number, v = pipe.v) => {
    setPipe({ v, s })
    setNote({ kicker: S.kicker, title: STAGES[s].name, text: STAGES[s].text })
  }

  /* ---- 向量文件 ---- */
  const cycles = VLINES.slice(0, pc + 1).reduce((acc, l) => acc + microCycles(l.micro), 0)
  const cur = pc >= 0 ? VLINES[pc] : null
  const pickChar = (line: number, col: number) => {
    const c = VLINES[line].pins[col]
    const pin = PINS[col]
    setSel({ line, col })
    setNote({ kicker: S.kicker, title: `${pin.name} = '${c}'`, text: charText(pin.kind, c) })
  }

  /* ---- 棋盘格 ---- */
  const cb = cbRows(cbView, cbStart)

  /* ---- 仿真 ---- */
  const sigs = SIM_SIGS[scene]
  const names = sigs.map((s) => s.name)
  const pos = posLines(sigs, strobe)
  const poc = pocLines(sigs)
  const loss = analyzeLoss(sigs, strobe)
  const waveRows = sigs.map((s, i) => ({
    name: s.name,
    segs: sigSegs(s),
    color: i === 2 ? 'var(--green)' : i === 3 ? 'var(--purple)' : undefined,
    labels: loss.pulses.filter((p) => p.name === s.name).map((p) => ({ t: p.a, text: '✕', bad: true })),
  }))

  /* ---- 存储 ---- */
  const depth = DEPTHS.find((d) => d.id === depthId) ?? DEPTHS[0]
  const nVec = totalK * 1000
  const loads = Math.ceil(nVec / depth.n)
  const reloads = loads - 1
  const execMs = nVec * periodNs * 1e-6
  const extraMs = reloads * reloadMs

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fVector.title)}
      goal={t(ui.fVector.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fProgram"
      nextLabel={t(ui.fund.next) + t(ui.fProgram.title)}
    >
      {/* 1. 向量是什么 */}
      <Section title={t(S.whatTitle)} note={t(S.charsNote)}>
        {VEC_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Cards
          items={CHARS}
          activeId={ch}
          onPick={(item) => {
            setCh(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={[CHARS.find((c) => c.id === ch)?.text ?? '']} />
      </Section>

      <Section title={t(S.pipeTitle)} note={t(S.pipeNote)}>
        <div className="row-actions">
          <span className="intro__note">{t(S.vec)}</span>
          <Seg
            options={PIPE_VECS.map((v, i) => ({ id: v.id, label: `#${i}  IN=${v.inp} OUT=${v.exp}` }))}
            value={pv.id}
            onChange={(id) => {
              setPipePlaying(false)
              pickStage(0, PIPE_VECS.findIndex((v) => v.id === id))
            }}
          />
        </div>
        <div className="row-actions">
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            disabled={pipe.s >= STAGES.length - 1}
            onClick={() => pickStage(Math.min(STAGES.length - 1, pipe.s + 1))}
          >
            {t(S.step)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              if (pipeEnd) setPipe({ v: 0, s: 0 })
              setPipePlaying((p) => (pipeEnd ? true : !p))
            }}
          >
            {t(pipePlaying && !pipeEnd ? S.pause : S.play)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              setPipePlaying(false)
              pickStage(0)
            }}
          >
            {t(S.reset)}
          </button>
          <Seg
            options={[
              { id: 'good', label: 'OUT = NOT IN' },
              { id: 'stuck', label: S.stuck },
            ]}
            value={stuck ? 'stuck' : 'good'}
            onChange={(id) => setStuck(id === 'stuck')}
          />
        </div>
        <PipeFig stage={pipe.s} inp={pv.inp} prevIn={prevIn} exp={pv.exp} outNow={outNow} outPrev={dut(prevIn)} />
        <Readout
          items={[
            { label: S.stage, value: `${pipe.s + 1} / ${STAGES.length} · ${t(stageItem.name)}` },
            pipe.s < STAGES.length - 1
              ? { label: S.verdict, value: t(S.waiting) }
              : pipePass === null
                ? { label: S.verdict, value: t(S.noCmp) }
                : { label: S.verdict, value: pipePass ? 'PASS' : 'FAIL', state: pipePass ? 'pass' : 'fail' },
          ]}
        />
        <Explain paras={[stageItem.text]} />

        <h4 className="vector-sub">{t(S.microTitle)}</h4>
        <Cards
          items={MICRO}
          activeId={micro}
          onPick={(item) => {
            setMicro(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={[MICRO.find((m) => m.id === micro)?.text ?? '']} />
        {SOURCE_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
      </Section>

      {/* 2. 示例向量文件 */}
      <Section title={t(S.fileTitle)} note={t(S.fileNote)}>
        <div className="row-actions">
          <button type="button" className="lab__btn lab__btn--primary" disabled={fileDone} onClick={() => setPc((p) => Math.min(last, p + 1))}>
            {t(S.exec)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              if (fileDone) setPc(-1)
              setFilePlaying((p) => (fileDone ? true : !p))
            }}
          >
            {t(filePlaying && !fileDone ? S.pause : S.play)}
          </button>
          <button
            type="button"
            className="lab__btn"
            disabled={fileDone}
            onClick={() => {
              setPc(last)
              setFilePlaying(false)
            }}
          >
            {t(S.runAll)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              setPc(-1)
              setFilePlaying(false)
            }}
          >
            {t(S.reset)}
          </button>
        </div>
        <pre className="code">
          <span className="vector-code__line">PATTERN  demo_rw</span>
          {FILE_HEAD.map((line) => (
            <span key={line.zh} className="vector-code__line vector-code__cmt">
              {t(line)}
            </span>
          ))}
          <span className="vector-code__line vector-code__cmt">{';TSET  R C W O ADDR DATA  MICRO'}</span>
          <span className="vector-code__line vector-code__cmt">{';      S S E E'}</span>
          <span className="vector-code__line vector-code__cmt">{';      T'}</span>
          {VLINES.map((line, i) => (
            <span key={i} className={`vector-code__line${i === pc ? ' is-pc' : i < pc ? ' is-done' : ''}`}>
              <span
                className="vector-code__ch"
                onClick={() => setNote({ kicker: S.kicker, title: `Time Set: ${line.ts}`, text: TS_TEXT[line.ts] })}
              >
                {line.ts.padEnd(6)}
              </span>{' '}
              {line.pins.split('').map((c, j) => {
                const isSel = sel !== null && sel.line === i && sel.col === j
                const isCol = sel !== null && sel.col === j && !isSel
                return (
                  <span key={j}>
                    <span
                      className={`vector-code__ch${isSel ? ' is-sel' : isCol ? ' is-col' : ''}`}
                      title={PINS[j].name}
                      onClick={() => pickChar(i, j)}
                    >
                      {c}
                    </span>
                    {j < 4 || j === 7 ? ' ' : ''}
                  </span>
                )
              })}
              {'  '}
              <span
                className="vector-code__ch"
                onClick={() => setNote({ kicker: S.kicker, title: line.micro, text: MICRO_TEXT[line.micro] })}
              >
                {line.micro}
              </span>
              {' '.repeat(11 - line.micro.length)}
              <span className="vector-code__cmt">{`; ${t(line.note)}`}</span>
            </span>
          ))}
        </pre>
        <Readout
          items={[
            { label: S.line, value: cur ? `${pc + 1} / ${VLINES.length}` : t(S.notStarted) },
            { label: S.cycles, value: String(cycles) },
            { label: S.ts, value: cur ? cur.ts : '—' },
            { label: S.micro, value: cur ? cur.micro : '—' },
          ]}
        />
        {fileDone ? (
          <Callout tone="ok">{t(S.halted).replace('{n}', String(VLINES.length)).replace('{c}', String(cycles))}</Callout>
        ) : null}
        <Callout>{t(FILE_NOTE)}</Callout>
      </Section>

      {/* 3. 棋盘格 */}
      <Section title={t(S.cbTitle)}>
        {CB_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Seg
          options={[
            { id: 'write' as const, label: S.cbWrite },
            { id: 'read' as const, label: S.cbRead },
          ]}
          value={cbView}
          onChange={setCbView}
        />
        <div className="knob-row">
          <Knob label={S.cbStart} value={cbStart} unit={`(${cbStart.toString(16).toUpperCase().padStart(2, '0')}h)`} min={0} max={248} step={8} onChange={setCbStart} />
        </div>
        <table className="dtable">
          <thead>
            <tr>
              <th>ADDR</th>
              <th>DIN</th>
              <th>DOUT</th>
              <th>CS1</th>
              <th>CS2</th>
              <th>WE</th>
              <th>OE</th>
              <th>Time Set</th>
            </tr>
          </thead>
          <tbody>
            {cb.map((row) => (
              <tr key={row.addr}>
                <td className="mono-cell">{row.hex}</td>
                <td className="mono-cell">{row.din}</td>
                <td className="mono-cell">{row.dout}</td>
                <td className="mono-cell">{row.cs1}</td>
                <td className="mono-cell">{row.cs2}</td>
                <td className="mono-cell">{row.we}</td>
                <td className="mono-cell">{row.oe}</td>
                <td className="mono-cell">{row.ts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <CheckerFig rows={cb} />
        <Callout>{t(CB_WHY)}</Callout>
        <p className="intro__note">{t(S.cbTotal)}</p>
        <h4 className="vector-sub">{t(S.testersTitle)}</h4>
        <Cards
          items={TESTERS}
          activeId={tester}
          onPick={(item) => {
            setTester(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={[TESTERS.find((x) => x.id === tester)?.text ?? '']} />
      </Section>

      {/* 4. 仿真数据采集 */}
      <Section title={t(S.simTitle)}>
        {SIM_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <div className="row-actions">
          <span className="intro__note">{t(S.scene)}</span>
          <Seg
            options={[
              { id: 'mixed' as const, label: S.sceneMixed },
              { id: 'nrz' as const, label: S.sceneNrz },
            ]}
            value={scene}
            onChange={(id) => {
              setScene(id)
              setNote({ kicker: S.kicker, title: id === 'mixed' ? S.sceneMixed : S.sceneNrz, text: SCENE_TEXT[id] })
            }}
          />
        </div>
        <p className="intro__note">{t(SCENE_TEXT[scene])}</p>
        <div className="knob-row">
          <Knob label={S.strobeKnob} value={strobe} unit="ns" min={0} max={SIM_PERIOD - 5} step={5} onChange={setStrobe} />
        </div>
        <figure className="term-fig">
          <WaveRows span={SIM_SPAN} period={SIM_PERIOD} strobe={strobe} rows={waveRows} ariaLabel="simulation capture" />
        </figure>
        <Readout
          items={[
            { label: S.posLines, value: String(pos.length) },
            { label: S.pocLines, value: String(poc.length) },
            { label: S.intra, value: String(loss.intra) },
            { label: S.lostPulse, value: String(loss.pulses.length), state: loss.pulses.length ? 'fail' : 'pass' },
            { label: S.late, value: String(loss.late), state: loss.late ? 'fail' : 'pass' },
          ]}
        />
        <div className="vector-cols">
          <div>
            <h4>{t(S.posTitle)}</h4>
            <pre className="code vector-out">{simText(names, pos).join('\n')}</pre>
          </div>
          <div>
            <h4>{t(S.pocTitle)}</h4>
            <pre className="code vector-out">{simText(names, poc).join('\n')}</pre>
          </div>
        </div>
        {loss.pulses.length > 0 ? (
          <Callout tone="bad">
            <p>
              {t(S.lostList)}
              <span className="vector-out__lost">{loss.pulses.map((p) => `${p.name} ${p.a}–${p.b} ns`).join(t(S.sep))}</span>
            </p>
          </Callout>
        ) : null}
        {loss.late > 0 ? <Callout tone="bad">{t(S.lateText)}</Callout> : null}
        {loss.intra === 0 ? <Callout tone="ok">{t(S.noLoss)}</Callout> : <Callout tone="warn">{t(S.intraText)}</Callout>}
        <Callout>{t(S.pocText)}</Callout>
      </Section>

      {/* 5. 存储深度 */}
      <Section title={t(S.memTitle)} note={t(MEM_LEAD)}>
        <div className="row-actions">
          <span className="intro__note">{t(S.depth)}</span>
          <Seg options={DEPTHS.map((d) => ({ id: d.id, label: d.label }))} value={depthId} onChange={setDepthId} />
        </div>
        <div className="knob-row">
          <Knob label={S.total} value={totalK} unit="K" min={1} max={4000} step={1} onChange={setTotalK} />
          <Knob label={S.reload} value={reloadMs} unit="ms" min={10} max={1000} step={10} onChange={setReloadMs} />
          <Knob label={S.period} value={periodNs} unit="ns" min={10} max={200} step={10} onChange={setPeriodNs} />
        </div>
        <Readout
          items={[
            { label: S.loads, value: String(loads) },
            { label: S.reloads, value: String(reloads), state: reloads > 0 ? 'fail' : 'pass' },
            { label: S.execT, value: fmtTime(execMs) },
            { label: S.extraT, value: fmtTime(extraMs), state: reloads > 0 ? 'fail' : 'pass' },
          ]}
        />
        {reloads === 0 ? (
          <Callout tone="ok">{t(S.memOk)}</Callout>
        ) : extraMs > execMs ? (
          <Callout tone="bad">{t(S.memBad).replace('{r}', (extraMs / execMs).toFixed(0))}</Callout>
        ) : (
          <Callout tone="warn">{t(S.memMid).replace('{p}', ((extraMs / execMs) * 100).toFixed(0))}</Callout>
        )}
        <h4 className="vector-sub">{t(S.handTitle)}</h4>
        <Steps items={HAND_TIPS} />
      </Section>

      {/* 6. Simulation for Test */}
      <Section title={t(S.rulesTitle)} note={t(S.rulesNote)}>
        <div className="vector-rules">
          {RULES.map((r) => (
            <button
              key={r.n}
              type="button"
              className={r.n === rule ? 'is-active' : ''}
              onClick={() => {
                setRule(r.n)
                setNote({ kicker: S.kicker, title: `${r.n}. ${t(r.title)}`, text: r.text })
              }}
            >
              <b>{r.n}</b>
              {t(r.title)}
            </button>
          ))}
        </div>
        <Explain paras={[RULES.find((r) => r.n === rule)?.text ?? '']} />
        <p className="intro__note">{t(RULE_EXTRA)}</p>

        <h4 className="vector-sub">{t(S.violTitle)}</h4>
        {VIOLATIONS.map((v) => {
          const picked = viol[v.id]
          return (
            <div key={v.id} className="vector-viol">
              <p>{t(v.text)}</p>
              <div className="kind">
                {v.options.map((n) => {
                  let state = ''
                  if (picked !== undefined && n === v.answer && picked === n) state = ' is-right'
                  else if (picked === n) state = ' is-wrong'
                  return (
                    <button
                      key={n}
                      type="button"
                      className={`kind__btn${state}`}
                      onClick={() => {
                        setViol((prev) => ({ ...prev, [v.id]: n }))
                        const r = RULES.find((x) => x.n === n)
                        if (r) setNote({ kicker: S.kicker, title: `${r.n}. ${t(r.title)}`, text: r.text })
                      }}
                    >
                      {t(S.ruleN).replace('{n}', String(n))}
                      {' · '}
                      {t(RULES[n - 1].title)}
                    </button>
                  )
                })}
              </div>
              {picked !== undefined ? (
                <p className="intro__note">
                  {t(picked === v.answer ? S.right : S.wrong)} {picked === v.answer ? t(v.why) : null}
                </p>
              ) : null}
            </div>
          )
        })}
        <Readout
          items={[
            {
              label: S.score,
              value: `${VIOLATIONS.filter((v) => viol[v.id] === v.answer).length} / ${VIOLATIONS.length}`,
            },
          ]}
        />
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
