import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  ACTIONS,
  BEGIN_LEAD,
  CAUSE_LABEL,
  CLUE,
  DIAG_FAIL,
  DIAG_PASS,
  FIRST_STEP,
  GARBAGE,
  HABITS,
  KIND_TEXT,
  LIMIT_UA,
  LOG_ROWS,
  ON_TESTER,
  PKG_RIGHT,
  PKG_WRONG,
  PROG_RIGHT,
  PROG_WRONG,
  QUIZ,
  SHORTEST,
  SUB_TEXT,
  SUSPECTS,
  SUSPECT_LEAD,
  TAKEAWAY,
  TOOLS,
  measureLeak,
  newGame,
  readingPass,
  type ActionId,
  type Cause,
  type FailKind,
  type Game,
  type Reading,
  type Rig,
  type SuspectId,
} from './data/debug'
import { DebugFig } from './DebugFig'
import { Callout, Cards, Explain, Readout, Seg, type Note } from './parts'
import './debug.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  kicker: loc('排错', 'Troubleshooting'),
  later: loc('排错能力也是程序验证的基础：下一课要在交付前，把程序在各种条件下都跑一遍。', 'Troubleshooting skill is also the basis for qualifying the test program: next lesson, run the program under all conditions before release.'),
  suspectTitle: loc('四个嫌疑对象', 'Four suspects'),
  kindTitle: loc('读 Datalog：限值失效还是灾难性失效', 'Reading the datalog: limit or catastrophic failure'),
  kindNote: loc('每行点一个判断，看线索解释。', 'Pick a verdict on each row to see the clue explained.'),
  colTest: loc('测试项', 'Test'),
  colPin: loc('管脚', 'Pin'),
  colVal: loc('实测值', 'Measured'),
  colLimit: loc('限值', 'Limit'),
  colYou: loc('你的判断', 'Your call'),
  limit: loc('限值失效', 'Limit failure'),
  cata: loc('灾难性失效', 'Catastrophic'),
  beginTitle: loc('从哪里开始', 'Where to begin'),
  onTester: loc('在机台上，按这个顺序试', 'At the tester, try in this order'),
  habits: loc('离开机台也要做的事', 'Habits away from the tester'),
  gameTitle: loc('动手：IIL/IIH 排错游戏', 'Hands-on: IIL/IIH troubleshooting game'),
  gameNote: loc('故障原因已经随机藏好了。点动作做实验，每个动作花不同的机台时间。觉得有把握了，就在最下面下结论。', 'The cause of the failure has been hidden at random. Click actions to run experiments; each costs a different amount of tester time. When you feel sure, give your verdict at the bottom.'),
  order: loc('工单', 'Work order'),
  orderVal: loc('产品 L17279B · 84 脚封装 · 封装测试', 'Product L17279B · 84-pin package · Final test'),
  first: loc('初始 Datalog', 'Initial datalog'),
  limitLbl: loc('限值', 'Limit'),
  reloadLbl: loc('重新加载：程序名', 'Reload: program name'),
  pkgLbl: loc('封装', 'Package'),
  pin84: loc('84 脚', '84-pin'),
  pin64: loc('64 脚', '64-pin'),
  steps: loc('已做实验', 'Experiments'),
  time: loc('机台时间', 'Tester time'),
  minUnit: loc('分钟', 'min'),
  colNo: loc('#', '#'),
  colAct: loc('动作', 'Action'),
  colRead: loc('读数', 'Reading'),
  colRes: loc('结果', 'Result'),
  colClue: loc('线索', 'Clue'),
  noLog: loc('还没做实验。先想想：哪个动作最便宜，又能告诉你最多信息？', 'No experiments yet. Think first: which action is cheapest and tells you the most?'),
  judgeTitle: loc('我判断是……', 'My verdict...'),
  right: loc('判对了！', 'Correct!'),
  wrong: loc('判错了。真正的原因是：', 'Wrong. The real cause: '),
  again: loc('再来一局', 'Play again'),
  reloaded: loc('已重新加载 {name}（{pkg} 脚）。重测一下看看效果。', 'Reloaded {name} ({pkg}-pin). Retest to see the effect.'),
  overRange: loc('（量程顶格）', ' (full scale)'),
  toolTitle: loc('调试工具', 'Debug tools'),
  toolNote: loc('点一张卡片看用法。', 'Click a card to see how it is used.'),
}

const KIND_LABEL: Record<FailKind, LText> = { limit: S.limit, cata: S.cata }
const BASE_RIG: Rig = { dut: 'bad', iface: true, tester: 'A' }

type LogEntry = { n: number; action: ActionId; reading?: Reading; pass?: boolean; text: LText; min: number }

/** 中英两版都填占位符，日志切换语言后照样跟着变 */
function fillText(text: LText, vars: Record<string, string>): LText {
  const fill = (s: string) => Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), s)
  return loc(fill(text.zh), text.en === undefined ? undefined : fill(text.en))
}

export function FundDebugPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: SUSPECTS[0].title, text: SUSPECTS[0].text })
  const [suspect, setSuspect] = useState<SuspectId>(SUSPECTS[0].id)
  const [answers, setAnswers] = useState<Record<string, FailKind>>({})
  const [begin, setBegin] = useState(ON_TESTER[0].id)
  const [habit, setHabit] = useState(HABITS[0].id)
  const [tool, setTool] = useState(TOOLS[0].id)
  // 排错游戏
  const [game, setGame] = useState<Game>(() => newGame())
  const [initial, setInitial] = useState<Reading>(() => measureLeak(game, BASE_RIG))
  const [log, setLog] = useState<LogEntry[]>([])
  const [rig, setRig] = useState<Rig>(BASE_RIG)
  const [progName, setProgName] = useState(PROG_RIGHT)
  const [pkg, setPkg] = useState(PKG_RIGHT)
  const [verdict, setVerdict] = useState<Cause | null>(null)

  const fmtRead = (r: Reading) => {
    if (r.garbage) return '—'
    if (r.over) return `≥ +100.0 µA${t(S.overRange)}`
    return `+${r.ua.toFixed(2)} µA`
  }

  const pickSuspect = (id: SuspectId) => {
    setSuspect(id)
    const item = SUSPECTS.find((s) => s.id === id)
    if (item) setNote({ kicker: S.kicker, title: item.title, text: item.text })
  }

  const restart = () => {
    const g = newGame()
    setGame(g)
    setInitial(measureLeak(g, BASE_RIG))
    setLog([])
    setRig(BASE_RIG)
    setProgName(PROG_RIGHT)
    setPkg(PKG_RIGHT)
    setVerdict(null)
  }

  const doAction = (id: ActionId) => {
    const act = ACTIONS.find((a) => a.id === id)
    if (!act || verdict) return
    let entry: LogEntry
    const n = log.length + 1
    if (id === 'reload') {
      const prog = progName === PROG_WRONG ? 'wrongName' : pkg === PKG_WRONG ? 'wrongPkg' : 'ok'
      setGame({ ...game, prog })
      setRig(BASE_RIG)
      entry = { n, action: id, text: fillText(S.reloaded, { name: progName, pkg }), min: act.min }
    } else if (id === 'diag') {
      const bad = game.cause === 'tester'
      entry = { n, action: id, pass: !bad, text: bad ? DIAG_FAIL : DIAG_PASS, min: act.min }
    } else {
      const r = act.rig ?? BASE_RIG
      const reading = measureLeak(game, r)
      const pass = readingPass(reading)
      setRig(r)
      const clue = CLUE[id]
      entry = { n, action: id, reading, pass, text: reading.garbage ? GARBAGE : pass ? clue.pass : clue.fail, min: act.min }
    }
    setLog([...log, entry])
    setNote({ kicker: S.kicker, title: act.label, text: entry.text })
  }

  const judge = (c: Cause) => {
    setVerdict(c)
    setNote({ kicker: S.kicker, title: CAUSE_LABEL[game.cause], text: SHORTEST[game.cause] })
  }

  const totalMin = log.reduce((acc, e) => acc + e.min, 0)
  const beginItem = ON_TESTER.find((c) => c.id === begin)
  const habitItem = HABITS.find((c) => c.id === habit)
  const suspectItem = SUSPECTS.find((c) => c.id === suspect)
  const toolItem = TOOLS.find((c) => c.id === tool)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.fDebug.title)}
      goal={t(ui.fDebug.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fQualify"
      nextLabel={t(ui.fund.next) + t(ui.fQualify.title)}
    >
      {/* 1. 四个嫌疑对象 */}
      <Section title={t(S.suspectTitle)}>
        {SUSPECT_LEAD.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <DebugFig active={suspect} onPick={pickSuspect} />
        <Cards items={SUSPECTS} activeId={suspect} cols={4} onPick={(item) => pickSuspect(item.id)} />
        <Explain paras={suspectItem?.explain} />
        <Callout tone="warn">{t(FIRST_STEP)}</Callout>
      </Section>

      {/* 2. 限值 vs 灾难性 */}
      <Section title={t(S.kindTitle)} note={t(S.kindNote)}>
        <Explain paras={[KIND_TEXT.limit, KIND_TEXT.cata]} />
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colTest)}</th>
              <th>{t(S.colPin)}</th>
              <th>{t(S.colVal)}</th>
              <th>{t(S.colLimit)}</th>
              <th>{t(S.colYou)}</th>
            </tr>
          </thead>
          <tbody>
            {LOG_ROWS.map((row) => {
              const picked = answers[row.id]
              return (
                <tr key={row.id}>
                  <td className="mono-cell">{row.test}</td>
                  <td className="mono-cell">{row.pin}</td>
                  <td className="mono-cell">{row.value}</td>
                  <td className="mono-cell">{row.limit}</td>
                  <td>
                    <div className="kind">
                      {(['limit', 'cata'] as FailKind[]).map((k) => {
                        let state = ''
                        if (picked && k === row.answer) state = ' is-right'
                        else if (picked === k) state = ' is-wrong'
                        return (
                          <button
                            key={k}
                            type="button"
                            className={`kind__btn${state}`}
                            onClick={() => {
                              setAnswers((prev) => ({ ...prev, [row.id]: k }))
                              setNote({ kicker: S.kicker, title: `${row.test} · ${row.pin}`, text: row.why })
                            }}
                          >
                            {t(KIND_LABEL[k])}
                          </button>
                        )
                      })}
                    </div>
                    {picked ? <p className="intro__note" style={{ margin: '6px 0 0' }}>{t(row.why)}</p> : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Section>

      {/* 3. 从哪里开始 */}
      <Section title={t(S.beginTitle)} note={t(BEGIN_LEAD)}>
        <h4 className="debug-sub">{t(S.onTester)}</h4>
        <Cards
          items={ON_TESTER.map((item, i) => ({ ...item, title: `${i + 1}. ${t(item.title)}` }))}
          activeId={begin}
          cols={4}
          onPick={(item) => {
            setBegin(item.id)
            const src = ON_TESTER.find((c) => c.id === item.id)
            if (src) setNote({ kicker: S.kicker, title: src.title, text: src.text })
          }}
        />
        {beginItem ? <Explain paras={[beginItem.text]} /> : null}
        <h4 className="debug-sub">{t(S.habits)}</h4>
        <Cards
          items={HABITS}
          activeId={habit}
          cols={3}
          onPick={(item) => {
            setHabit(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        {habitItem ? <Explain paras={[habitItem.text]} /> : null}
      </Section>

      {/* 4. 排错游戏 */}
      <Section title={t(S.gameTitle)} note={t(S.gameNote)}>
        <div className="debug-order">
          <b>{t(S.order)}</b>
          <span>{t(S.orderVal)}</span>
          <b>{t(S.first)}</b>
          <span className="is-fail">{`IIH  ${game.pin}  ${fmtRead(initial)}  FAIL`}</span>
          <b>{t(S.limitLbl)}</b>
          <span>{`|IIH| ≤ ${LIMIT_UA.toFixed(2)} µA @ VIH = VDD`}</span>
        </div>
        <DebugFig rig={rig} />
        <div className="debug-actions">
          {ACTIONS.filter((a) => a.id !== 'reload').map((a) => (
            <button key={a.id} type="button" className="kind__btn" disabled={verdict !== null} onClick={() => doAction(a.id)}>
              {t(a.label)}
              <small>{`${a.min} ${t(S.minUnit)}`}</small>
            </button>
          ))}
        </div>
        <div className="debug-reload">
          <span>{t(S.reloadLbl)}</span>
          <Seg
            options={[
              { id: PROG_RIGHT, label: PROG_RIGHT },
              { id: PROG_WRONG, label: PROG_WRONG },
            ]}
            value={progName}
            onChange={setProgName}
          />
          <span>{t(S.pkgLbl)}</span>
          <Seg
            options={[
              { id: PKG_RIGHT, label: S.pin84 },
              { id: PKG_WRONG, label: S.pin64 },
            ]}
            value={pkg}
            onChange={setPkg}
          />
          <button type="button" className="lab__btn" disabled={verdict !== null} onClick={() => doAction('reload')}>
            {`${t(ACTIONS[ACTIONS.length - 1].label)} · ${ACTIONS[ACTIONS.length - 1].min} ${t(S.minUnit)}`}
          </button>
        </div>
        <Readout
          items={[
            { label: S.steps, value: String(log.length) },
            { label: S.time, value: `${totalMin} ${t(S.minUnit)}` },
          ]}
        />
        {log.length === 0 ? (
          <p className="intro__note">{t(S.noLog)}</p>
        ) : (
          <table className="dtable debug-log">
            <thead>
              <tr>
                <th>{t(S.colNo)}</th>
                <th>{t(S.colAct)}</th>
                <th>{t(S.colRead)}</th>
                <th>{t(S.colRes)}</th>
                <th>{t(S.colClue)}</th>
              </tr>
            </thead>
            <tbody>
              {log.map((e) => {
                const act = ACTIONS.find((a) => a.id === e.action)
                const cls = e.pass === undefined ? '' : e.pass ? 'is-pass' : 'is-fail'
                return (
                  <tr key={e.n} className={cls}>
                    <td className="mono-cell">{e.n}</td>
                    <td>{act ? t(act.label) : ''}</td>
                    <td className="mono-cell">{e.reading ? fmtRead(e.reading) : '—'}</td>
                    <td className="verdict">{e.pass === undefined ? '—' : e.pass ? 'PASS' : 'FAIL'}</td>
                    <td className="clue">{t(e.text)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        <h4 className="debug-sub">{t(S.judgeTitle)}</h4>
        <div className="debug-verdict">
          {(Object.keys(CAUSE_LABEL) as Cause[]).map((c) => {
            let state = ''
            if (verdict && c === game.cause) state = ' is-right'
            else if (verdict === c) state = ' is-wrong'
            return (
              <button key={c} type="button" className={`kind__btn${state}`} disabled={verdict !== null} onClick={() => judge(c)}>
                {t(CAUSE_LABEL[c])}
              </button>
            )
          })}
        </div>
        {verdict ? (
          <>
            <Callout tone={verdict === game.cause ? 'ok' : 'bad'}>
              <p>{verdict === game.cause ? t(S.right) : `${t(S.wrong)}${t(CAUSE_LABEL[game.cause])}`}</p>
              {game.cause === 'prog' ? <p>{t(SUB_TEXT[game.sub])}</p> : null}
              <p>{t(SHORTEST[game.cause])}</p>
            </Callout>
            <div className="row-actions">
              <button type="button" className="lab__btn lab__btn--primary" onClick={restart}>
                {t(S.again)}
              </button>
            </div>
          </>
        ) : null}
      </Section>

      {/* 5. 调试工具 */}
      <Section title={t(S.toolTitle)} note={t(S.toolNote)}>
        <Cards
          items={TOOLS}
          activeId={tool}
          onPick={(item) => {
            setTool(item.id)
            setNote({ kicker: S.kicker, title: item.title, text: item.text })
          }}
        />
        {toolItem ? <Explain paras={[toolItem.text, ...(toolItem.explain ?? [])]} /> : null}
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
