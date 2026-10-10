import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { LoadboardFig } from './CreateFig'
import {
  CHECKLIST,
  CLK_EDGE,
  DEV_ORDER,
  DIAG_CARDS,
  FN_LABEL,
  HW_ADVICE,
  LB_CHAIN,
  LB_FAULTS,
  LB_NODES,
  OUT_BITS,
  PINS,
  PIN_ERR_TEXT,
  PIN_LEAD,
  PIN_OK_TEXT,
  PLAN_LEAD,
  QUIZ,
  RUN_DONE,
  RUN_STEPS,
  TAKEAWAY,
  TIMING_LEAD,
  TIMING_MSG,
  TIMING_STEPS,
  buildGroups,
  clkSegs,
  outSegs,
  sampleOut,
  signalOf,
  type LbNodeId,
  type PinErr,
} from './data/create'
import { Callout, Cards, Explain, Knob, Readout, Seg, Steps, type Note } from './parts'
import { WaveRows } from './WaveRows'
import './create.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('编写程序'),
  later: loc('程序第一次跑起来以后，下一课专门讲排错：Fail 了先怀疑谁、怎么逐个排除。'),
  planTitle: loc('从规格书到测试计划'),
  planNote: loc('读规格书时逐条勾选。点一行看为什么要注意它。'),
  planDone: loc('已勾选'),
  planAll: loc('清单全部过完。这些笔记会直接决定负载板怎么设计、程序怎么写。'),
  timeTitle: loc('功能测试的时序策略'),
  timeNote: loc('调周期、输出延迟 tPD 和 Strobe 位置。时钟在每个周期 10 ns 处上升，输入在这个沿被锁存，输出在沿后 tPD 才有效。'),
  period: loc('周期'),
  tpd: loc('输出延迟 tPD'),
  strobe: loc('Strobe 位置'),
  valid: loc('输出有效时刻'),
  margin: loc('Strobe 余量'),
  result: loc('比较结果'),
  waveCap: loc('黄线是 Strobe。OUT 上方的字母是每个周期期望的输出，红色表示比较 Fail。'),
  hwTitle: loc('设计测试硬件'),
  pinTitle: loc('动手：管脚映射与分组（256×4 SRAM）'),
  pinNote: loc('这张映射表里藏了 2 个错误。点你认为有问题的那一行。找到后表格会自动改正，下面的管脚组也会跟着更新。'),
  colPin: loc('器件脚'),
  colName: loc('信号名'),
  colSig: loc('含义'),
  colFn: loc('功能'),
  colCh: loc('测试机通道'),
  found: loc('已找到错误'),
  groupTitle: loc('按功能自动生成的管脚组'),
  pinAll: loc('两个错误都找到了。映射表是整个程序的地基，输完一定要再核对一遍。'),
  orderTitle: loc('先写哪些测试'),
  lbTitle: loc('负载板测试流程'),
  lbNote: loc('选一种负载板状态，点“单步”沿流程走一遍；点任何方框看它在检查什么。'),
  step: loc('单步'),
  reset: loc('重来'),
  diagTitle: loc('测试机快速诊断'),
  runTitle: loc('动手：第一次跑程序'),
  runNote: loc('每一步给你一段模拟的 Datalog，选你认为正确的下一步动作。选对了才能继续。'),
  stepOf: loc('第 {n} / {m} 步'),
  next: loc('下一步'),
  restart: loc('从头再来'),
  tryAgain: loc('再想想：'),
  right: loc('正确：'),
}

type FaultId = (typeof LB_FAULTS)[number]['id']

export function FundCreatePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: S.planTitle, text: PLAN_LEAD[0] })
  // 1. 清单
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [checkId, setCheckId] = useState(CHECKLIST[0].id)
  // 2. 时序
  const [period, setPeriod] = useState(50)
  const [tpd, setTpd] = useState(22)
  const [strobe, setStrobe] = useState(40)
  // 3. 管脚
  const [found, setFound] = useState<PinErr[]>([])
  const [pinClick, setPinClick] = useState<number | null>(null)
  // 4. 负载板
  const [fault, setFault] = useState<FaultId>('none')
  const [lbStep, setLbStep] = useState(0)
  const [lbNode, setLbNode] = useState<LbNodeId>('start')
  const [diag, setDiag] = useState('dc')
  // 5. 第一次跑
  const [runIdx, setRunIdx] = useState(0)
  const [runPick, setRunPick] = useState<Record<string, string>>({})

  /* ---- 清单 ---- */
  const doneCount = CHECKLIST.filter((c) => checks[c.id]).length
  const groups = CHECKLIST.reduce<Array<{ key: string; items: typeof CHECKLIST }>>((acc, item) => {
    const last = acc[acc.length - 1]
    if (last && last.key === item.group.zh) last.items.push(item)
    else acc.push({ key: item.group.zh, items: [item] })
    return acc
  }, [])

  /* ---- 时序 ---- */
  const cycles = OUT_BITS.length
  const strobeAt = Math.min(strobe, period - 1)
  const validAt = CLK_EDGE + tpd
  const cross = validAt >= period
  const early = !cross && strobeAt < validAt
  const sMargin = strobeAt - validAt
  const tight = !cross && !early && sMargin < 3
  const sampled = OUT_BITS.map((_, k) => sampleOut(period, tpd, k, strobeAt))
  const allPass = sampled.every((v, k) => v === OUT_BITS[k])
  const timeTone = cross || early ? 'bad' : tight ? 'warn' : 'ok'
  const timeMsg = cross ? TIMING_MSG.cross : early ? TIMING_MSG.early : tight ? TIMING_MSG.tight : TIMING_MSG.ok

  /* ---- 管脚 ---- */
  const rows = PINS.map((r) => (r.err && found.includes(r.err) ? { ...r, fn: r.fixFn ?? r.fn, ch: r.fixCh ?? r.ch } : r))
  const pinGroups = buildGroups(rows)
  const clickedRow = PINS.find((r) => r.pin === pinClick)
  const badNames = PINS.filter((r) => r.err && !found.includes(r.err)).map((r) => r.name)

  /* ---- 负载板流程 ---- */
  const visited: LbNodeId[] = []
  for (let i = 0; i <= Math.min(lbStep, LB_CHAIN.length - 1); i += 1) {
    const id = LB_CHAIN[i]
    visited.push(id)
    if (id === fault) {
      visited.push('stop')
      break
    }
  }
  const lbEnd = visited.includes('stop') || visited.includes('ok')
  const lbItem = LB_NODES.find((n) => n.id === lbNode) ?? LB_NODES[0]
  const pickLb = (id: LbNodeId) => {
    setLbNode(id)
    const n = LB_NODES.find((x) => x.id === id)
    if (n) setNote({ kicker: S.kicker, title: n.label, text: n.text })
  }

  /* ---- 第一次跑 ---- */
  const finished = runIdx >= RUN_STEPS.length
  const cur = RUN_STEPS[Math.min(runIdx, RUN_STEPS.length - 1)]
  const curPick = runPick[cur.id]
  const curOpt = cur.options.find((o) => o.id === curPick)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fCreate.title)}
      goal={t(ui.fCreate.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fDebug"
      nextLabel={t(ui.fund.next) + t(ui.fDebug.title)}
    >
      {/* 1. 测试计划 */}
      <Section title={t(S.planTitle)} note={t(S.planNote)}>
        {PLAN_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Readout items={[{ label: S.planDone, value: `${doneCount} / ${CHECKLIST.length}`, state: doneCount === CHECKLIST.length ? 'pass' : undefined }]} />
        <div className="create-progress">
          <div style={{ width: `${(doneCount / CHECKLIST.length) * 100}%` }} />
        </div>
        <div className="create-check">
          {groups.map((g) => (
            <div key={g.key}>
              <p className="create-check__group">{t(g.items[0].group)}</p>
              {g.items.map((item) => (
                <label
                  key={item.id}
                  className={`create-check__item${item.id === checkId ? ' is-active' : ''}${checks[item.id] ? ' is-done' : ''}`}
                  onClick={() => {
                    setCheckId(item.id)
                    setNote({ kicker: S.kicker, title: item.group, text: item.why })
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checks[item.id])}
                    onChange={(e) => setChecks((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                  />
                  <span>{t(item.label)}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
        <Explain paras={[CHECKLIST.find((c) => c.id === checkId)?.why ?? '']} />
        {doneCount === CHECKLIST.length ? <Callout tone="ok">{t(S.planAll)}</Callout> : null}
      </Section>

      {/* 2. 时序策略 */}
      <Section title={t(S.timeTitle)} note={t(S.timeNote)}>
        {TIMING_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Steps items={TIMING_STEPS} />
        <div className="knob-row">
          <Knob
            label={S.period}
            value={period}
            unit="ns"
            min={20}
            max={100}
            step={5}
            onChange={(v) => {
              setPeriod(v)
              setStrobe((s) => Math.min(s, v - 1))
            }}
          />
          <Knob label={S.tpd} value={tpd} unit="ns" min={5} max={80} step={1} onChange={setTpd} />
          <Knob label={S.strobe} value={strobeAt} unit="ns" min={5} max={period - 1} step={1} onChange={setStrobe} />
        </div>
        <figure className="term-fig">
          <WaveRows
            span={period * cycles}
            period={period}
            strobe={strobeAt}
            edges={[CLK_EDGE]}
            rows={[
              { name: 'CLK', segs: clkSegs(period, cycles) },
              {
                name: 'OUT',
                segs: outSegs(period, tpd, cycles),
                color: 'var(--green)',
                labels: OUT_BITS.map((bit, k) => ({ t: k * period + 1, text: bit ? 'H' : 'L', bad: sampled[k] !== bit })),
              },
            ]}
            ariaLabel="timing"
          />
          <figcaption>{t(S.waveCap)}</figcaption>
        </figure>
        <Readout
          items={[
            { label: S.valid, value: `${CLK_EDGE} + ${tpd} = ${validAt} ns`, state: cross ? 'fail' : undefined },
            { label: S.margin, value: `${sMargin >= 0 ? '+' : ''}${sMargin} ns`, state: sMargin < 0 || cross ? 'fail' : sMargin < 3 ? undefined : 'pass' },
            { label: S.result, value: allPass ? 'PASS' : 'FAIL', state: allPass ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone={timeTone}>{t(timeMsg)}</Callout>
        <h4 className="create-sub">{t(S.hwTitle)}</h4>
        {HW_ADVICE.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
      </Section>

      {/* 3. 管脚映射 */}
      <Section title={t(S.pinTitle)} note={t(S.pinNote)}>
        {PIN_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Readout items={[{ label: S.found, value: `${found.length} / 2`, state: found.length === 2 ? 'pass' : undefined }]} />
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colPin)}</th>
              <th>{t(S.colName)}</th>
              <th>{t(S.colSig)}</th>
              <th>{t(S.colFn)}</th>
              <th>{t(S.colCh)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isFound = r.err !== undefined && found.includes(r.err)
              const wrongClick = pinClick === r.pin && !r.err
              return (
                <tr
                  key={r.pin}
                  className={`is-click${isFound ? ' create-pin--found' : ''}${wrongClick ? ' create-pin--wrong' : ''}`}
                  onClick={() => {
                    setPinClick(r.pin)
                    if (r.err) {
                      const err = r.err
                      setFound((prev) => (prev.includes(err) ? prev : [...prev, err]))
                      setNote({ kicker: S.kicker, title: r.name, text: PIN_ERR_TEXT[err] })
                    } else {
                      setNote({ kicker: S.kicker, title: r.name, text: PIN_OK_TEXT })
                    }
                  }}
                >
                  <td className="mono-cell">{r.pin}</td>
                  <td className="mono-cell">{r.name}</td>
                  <td>{t(signalOf(r.name))}</td>
                  <td>{t(FN_LABEL[r.fn])}</td>
                  <td className="mono-cell">{r.ch}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {clickedRow ? (
          <Callout tone={clickedRow.err ? 'ok' : 'warn'}>{t(clickedRow.err ? PIN_ERR_TEXT[clickedRow.err] : PIN_OK_TEXT)}</Callout>
        ) : null}
        <h4 className="create-sub">{t(S.groupTitle)}</h4>
        <div className="create-groups">
          {pinGroups.map((g) => (
            <div key={g.id} className="create-groups__box">
              <b>{g.name}</b>
              <span>{t(g.label)}</span>
              <div className="create-groups__pins">
                {g.pins.map((p) => (
                  <i key={p} className={badNames.includes(p) ? 'is-bad' : ''}>
                    {p}
                  </i>
                ))}
              </div>
            </div>
          ))}
        </div>
        {found.length === 2 ? <Callout tone="ok">{t(S.pinAll)}</Callout> : null}
      </Section>

      {/* 4. 开发顺序与负载板 */}
      <Section title={t(S.orderTitle)}>
        <Steps items={DEV_ORDER} />
        <h4 className="create-sub">{t(S.lbTitle)}</h4>
        <p className="intro__note">{t(S.lbNote)}</p>
        <Seg
          options={LB_FAULTS.map((f) => ({ id: f.id, label: f.label }))}
          value={fault}
          onChange={(id) => {
            setFault(id)
            setLbStep(0)
          }}
        />
        <div className="row-actions">
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            disabled={lbEnd}
            onClick={() => {
              const nextStep = lbStep + 1
              setLbStep(nextStep)
              const id = LB_CHAIN[Math.min(nextStep, LB_CHAIN.length - 1)]
              pickLb(id === fault ? 'stop' : id)
            }}
          >
            {t(S.step)}
          </button>
          <button
            type="button"
            className="lab__btn"
            onClick={() => {
              setLbStep(0)
              pickLb('start')
            }}
          >
            {t(S.reset)}
          </button>
        </div>
        <figure className="term-fig">
          <LoadboardFig active={lbNode} visited={visited} failAt={fault === 'none' ? null : fault} onPick={pickLb} />
        </figure>
        <Explain paras={[lbItem.text]} />
        <h4 className="create-sub">{t(S.diagTitle)}</h4>
        <Cards
          items={DIAG_CARDS}
          activeId={diag}
          cols={2}
          onPick={(item) => {
            setDiag(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        <Explain paras={DIAG_CARDS.find((c) => c.id === diag)?.explain} />
      </Section>

      {/* 5. 第一次跑程序 */}
      <Section title={t(S.runTitle)} note={t(S.runNote)}>
        <div className="create-trail">
          {RUN_STEPS.map((s, i) => (
            <span key={s.id} className={i < runIdx ? 'is-done' : i === runIdx ? 'is-now' : ''}>
              {t(s.title)}
            </span>
          ))}
        </div>
        {finished ? (
          <>
            <Callout tone="ok">{t(RUN_DONE)}</Callout>
            <div className="row-actions">
              <button
                type="button"
                className="lab__btn"
                onClick={() => {
                  setRunIdx(0)
                  setRunPick({})
                }}
              >
                {t(S.restart)}
              </button>
            </div>
          </>
        ) : (
          <div className="create-run">
            <div className="create-run__head">
              <b>{t(cur.title)}</b>
              <span>{t(S.stepOf).replace('{n}', String(runIdx + 1)).replace('{m}', String(RUN_STEPS.length))}</span>
            </div>
            <pre className="code">{cur.log.map((line) => t(line)).join('\n')}</pre>
            <p className="create-run__ask">{t(cur.ask)}</p>
            <div className="create-run__opts">
              {cur.options.map((o) => {
                let state = ''
                if (curPick === o.id) state = o.ok ? ' is-right' : ' is-wrong'
                return (
                  <button
                    key={o.id}
                    type="button"
                    className={`kind__btn${state}`}
                    disabled={curOpt?.ok === true}
                    onClick={() => {
                      setRunPick((prev) => ({ ...prev, [cur.id]: o.id }))
                      setNote({ kicker: S.kicker, title: cur.title, text: o.reply })
                    }}
                  >
                    {t(o.text)}
                  </button>
                )
              })}
            </div>
            {curOpt ? (
              <Callout tone={curOpt.ok ? 'ok' : 'bad'}>
                <b>{t(curOpt.ok ? S.right : S.tryAgain)}</b>
                {t(curOpt.reply)}
              </Callout>
            ) : null}
            <div className="row-actions">
              <button type="button" className="lab__btn lab__btn--primary" disabled={curOpt?.ok !== true} onClick={() => setRunIdx((i) => i + 1)}>
                {t(S.next)}
              </button>
              <button
                type="button"
                className="lab__btn"
                onClick={() => {
                  setRunIdx(0)
                  setRunPick({})
                }}
              >
                {t(S.restart)}
              </button>
            </div>
          </div>
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
