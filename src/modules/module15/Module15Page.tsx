import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Readout } from '../fund/parts'
import { AluFig, AluRunFig, AluTimingFig } from './AluFig'
import {
  BANK,
  DC_CHOICES,
  FAULTS,
  ITEMS,
  OPS,
  QUIZ,
  SPECS,
  STEPS,
  TAKEAWAY,
  TPD,
  alu,
  hex4,
  judgeItems,
  judgeTiming,
  judgeVectors,
  runVectors,
  type FaultId,
  type ItemId,
  type RunRow,
  type VecId,
} from './data/content'
import './alu.css'

type Module15PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

const S = {
  input: loc('输入', 'Input'),
  output: loc('输出', 'Output'),
  power: loc('电源', 'Power'),
  settle: loc('稳定', 'Settled'),
  window: loc('窗口', 'Window'),
  winOk: loc('OK', 'OK'),
  winBad: loc('不成立', 'Invalid'),
  strobeRule: loc('须 ≥ Drive + tpd，且 < Period', 'must be ≥ Drive + tpd and < Period'),
  nextCycle: loc('下一拍', 'Next cycle'),
  late: loc(
    '第 4 步的 Strobe 落在周期之外，Timing 不合法，程序跑不起来。先回第 4 步改。',
    'The strobe from step 4 lies outside the cycle, so the timing is illegal and the program cannot run. Fix step 4 first.',
  ),
  early: loc(
    '第 4 步的 Strobe 早于输出稳定。下面每一拍都会采到上一拍的旧值，看看好芯片是怎么 Fail 的。',
    'The strobe from step 4 is earlier than the output settles. Every cycle below reads the previous value; watch a good chip fail.',
  ),
  colOp: loc('OP', 'OP'),
  colExp: loc('期望 Y / C', 'Expected Y / C'),
  colGot: loc('实际 Y / C', 'Actual Y / C'),
  colRes: loc('结果', 'Result'),
  dcPick: loc('选一项即可，但必须能说清 Force / Measure。', 'Pick one, and be able to say what is forced and measured.'),
  dcDone: loc('DC 条件已选定。量产程序里这一项要写进测试条件。', 'DC condition chosen. In a production program it goes into the test conditions.'),
  runIdle: loc('点“下一拍”逐条执行。无故障、Timing 正确时应全 Pass。', 'Press “Next cycle” to run row by row. With no fault and correct timing, all should pass.'),
  noFault: loc('无注入时应全 Pass。换一种故障，看哪些 OP、哪些位翻红。', 'With no fault all rows pass. Try a fault and watch which OPs and bits turn red.'),
  causeOk: loc('根因和注入一致。失败行的规律已经指向它。', 'Root cause matches the injected fault. The failing rows already pointed to it.'),
  causeBad: loc('再看失败的是哪些 OP、哪些位。', 'Look again at which OPs and which bits fail.'),
}

const PORTS: Array<{ name: string; dir: LText; note: LText }> = [
  { name: 'A[3:0]', dir: S.input, note: loc('操作数 A，4 位', 'Operand A, 4 bits') },
  { name: 'B[3:0]', dir: S.input, note: loc('操作数 B；移位时低 2 位是移位量', 'Operand B; for shifts its low 2 bits are the shift amount') },
  {
    name: 'OP[2:0]',
    dir: S.input,
    note: loc('000 ADD · 001 AND · 010 OR · 011 XOR · 100 SHL · 101 SHR', '000 ADD · 001 AND · 010 OR · 011 XOR · 100 SHL · 101 SHR'),
  },
  { name: 'Y[3:0]', dir: S.output, note: loc('运算结果', 'Result') },
  { name: 'Carry', dir: S.output, note: loc('ADD 的进位，或移位时移出的那一位', 'ADD carry, or the bit shifted out') },
  {
    name: 'VDD / GND',
    dir: S.power,
    note: loc('3.3 V。IDD 在电源脚上测；VIH、VOH 等 DC 项在信号脚上测', '3.3 V. IDD is measured on the supply pin; DC items such as VIH and VOH on the signal pins'),
  },
]

export function Module15Page({ moduleId, onModuleChange }: Module15PageProps) {
  const { t } = useLocale()
  const [step, setStep] = useState(1)
  const [items, setItems] = useState<ItemId[]>([])
  const [vectors, setVectors] = useState<VecId[]>(BANK.map((row) => row.id))
  const [period, setPeriod] = useState(16)
  const [drive, setDrive] = useState(2)
  const [strobe, setStrobe] = useState(12)
  const [dc, setDc] = useState<string>(DC_CHOICES[0].id)
  const [fault, setFault] = useState<FaultId>(FAULTS[0].id)
  const [cause, setCause] = useState<FaultId | null>(null)

  const itemJudge = judgeItems(items)
  const vecJudge = judgeVectors(vectors)
  const timeJudge = judgeTiming(period, strobe, drive)
  const early = timeJudge.kind === 'early'
  const runRows = runVectors(vectors, 'none', early)
  const faultRows = runVectors(vectors, fault, false)
  const fails = faultRows.filter((item) => !item.pass).length
  const causeOk = cause !== null && cause === fault && fault !== 'none'
  const settle = drive + TPD
  const cur = STEPS[step - 1]
  const dcItem = DC_CHOICES.find((item) => item.id === dc)

  const asideText = (() => {
    if (step === 2) return t(itemJudge.text)
    if (step === 3) return t(vecJudge.text)
    if (step === 4) return t(timeJudge.text)
    if (step === 5) return t(dcItem ? S.dcDone : S.dcPick)
    if (step === 6) return t(timeJudge.kind === 'late' ? S.late : early ? S.early : S.runIdle)
    if (step === 7) {
      if (fault === 'none') return t(S.noFault)
      if (causeOk) return t(S.causeOk)
      return t(
        loc(`已注入。失败 ${fails} 条，对照红行选根因。`, `Fault injected. ${fails} rows fail; choose the cause from the red rows.`),
      )
    }
    return t(cur.text)
  })()

  const toggle = <T,>(list: T[], id: T) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m15.title)}
      goal={t(ui.m15.goal)}
      kicker={t(ui.m15.kickerStep)}
      asideTitle={`${step} · ${t(cur.title)}`}
      asideText={asideText}
      asideLater={t(ui.m15.asideLater)}
      nextId="latch"
      nextLabel={t(ui.m15.next)}
    >
      <Section title={t(ui.m15.introTitle)}>
        <p>{t(ui.m15.introBody)}</p>
      </Section>

      <Section title={t(ui.m15.portTitle)} note={t(ui.m15.portNote)}>
        <AluFig />
        <div className="spec">
          {PORTS.map((row) => (
            <div key={row.name} className="spec__row">
              <strong>{row.name}</strong>
              <span>
                {t(row.dir)} · {t(row.note)}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <div className="wizard__tabs">
        {STEPS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`wizard__tab${step === item.id ? ' is-active' : ''}`}
            title={t(item.title)}
            aria-label={`${item.id} · ${t(item.title)}`}
            onClick={() => setStep(item.id)}
          >
            {item.id}
          </button>
        ))}
      </div>

      <Section title={`${t(ui.m15.step)} ${step} · ${t(cur.title)}`} note={t(cur.text)}>
        <p className="alu-ref">{t(cur.ref)}</p>

        {step === 1 ? (
          <div className="spec">
            {SPECS.map((row) => (
              <div key={row.name} className="spec__row">
                <strong>{row.name}</strong>
                <span>{t(row.limit)}</span>
              </div>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <>
            <div className="pick pick--3">
              {ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pick__card${items.includes(item.id) ? ' is-active' : ''}`}
                  onClick={() => setItems((prev) => toggle(prev, item.id))}
                >
                  {t(item.title)}
                </button>
              ))}
            </div>
            <p className={itemJudge.ok ? 'is-ok' : 'is-bad'}>{t(itemJudge.text)}</p>
          </>
        ) : null}

        {step === 3 ? (
          <div className="vec">
            {BANK.map((row) => {
              const exp = alu(row.a, row.b, row.op)
              return (
                <button
                  key={row.id}
                  type="button"
                  className={`vec__row${vectors.includes(row.id) ? ' is-active' : ''}`}
                  onClick={() => setVectors((prev) => toggle(prev, row.id))}
                >
                  {`${OPS[row.op].name} ${hex4(row.a)} ${hex4(row.b)} → Y ${hex4(exp.y)} C ${exp.carry}`}
                </button>
              )
            })}
            <p className={vecJudge.ok ? 'is-ok' : 'is-bad'}>{t(vecJudge.text)}</p>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="meter">
            <Readout
              items={[
                { label: 'Period', value: `${period} ns` },
                { label: 'Drive', value: `${drive} ns` },
                { label: 'tpd', value: `${TPD} ns` },
                { label: S.settle, value: `${settle} ns` },
                { label: 'Strobe', value: `${strobe} ns`, state: timeJudge.ok ? 'pass' : 'fail' },
                { label: S.window, value: t(timeJudge.ok ? S.winOk : S.winBad), state: timeJudge.ok ? 'pass' : 'fail' },
              ]}
            />
            <label>
              <span>{`Period ${period} ns`}</span>
              <input
                type="range"
                min={8}
                max={24}
                value={period}
                onChange={(event) => {
                  const next = Number(event.target.value)
                  setPeriod(next)
                  setStrobe((s) => Math.min(s, next))
                  setDrive((d) => Math.min(d, Math.max(next - TPD - 1, 0)))
                }}
              />
            </label>
            <label>
              <span>{`Drive ${drive} ns`}</span>
              <input
                type="range"
                min={0}
                max={Math.max(period - TPD - 1, 0)}
                value={drive}
                onChange={(event) => setDrive(Number(event.target.value))}
              />
            </label>
            <label>
              <span>{`Strobe ${strobe} ns · ${t(S.strobeRule)}`}</span>
              <input
                type="range"
                min={0}
                max={period}
                value={strobe}
                onChange={(event) => setStrobe(Number(event.target.value))}
              />
            </label>
            <AluTimingFig period={period} drive={drive} tpd={TPD} strobe={strobe} />
            <p className={timeJudge.ok ? 'is-ok' : 'is-bad'}>{t(timeJudge.text)}</p>
          </div>
        ) : null}

        {step === 5 ? (
          <>
            <div className="pick pick--2">
              {DC_CHOICES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pick__card${dc === item.id ? ' is-active' : ''}`}
                  onClick={() => setDc(item.id)}
                >
                  {t(item.title)}
                </button>
              ))}
            </div>
            {dcItem ? <Callout tone="ok">{t(dcItem.how)}</Callout> : null}
          </>
        ) : null}

        {step === 6 ? (
          timeJudge.kind === 'late' ? (
            <Callout tone="bad">{t(S.late)}</Callout>
          ) : runRows.length === 0 ? (
            <p className="is-bad">{t(ui.m15.needVec)}</p>
          ) : (
            <>
              {early ? <Callout tone="warn">{t(S.early)}</Callout> : null}
              <AluRunPlayer key={`${vectors.join(',')}|${early}`} rows={runRows} />
            </>
          )
        ) : null}

        {step === 7 ? (
          <div>
            <p className="intro__note">{t(ui.m15.injectNote)}</p>
            <div className="pick pick--3">
              {FAULTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pick__card${fault === item.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setFault(item.id)
                    setCause(null)
                  }}
                >
                  {t(item.title)}
                </button>
              ))}
            </div>
            <ResultTable rows={faultRows} empty={t(ui.m15.needVec)} />
            <p className={fails === 0 ? 'is-ok' : 'is-bad'}>
              {fault === 'none'
                ? t(S.noFault)
                : t(loc(`失败 ${fails} / ${faultRows.length} 条。`, `${fails} of ${faultRows.length} rows fail.`))}
            </p>
            <p className="intro__note">{t(ui.m15.causeNote)}</p>
            <div className="pick pick--2">
              {FAULTS.filter((item) => item.id !== 'none').map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pick__card${cause === item.id ? ' is-active' : ''}`}
                  onClick={() => setCause(item.id)}
                >
                  {t(item.title)}
                </button>
              ))}
            </div>
            {cause !== null ? <p className={causeOk ? 'is-ok' : 'is-bad'}>{t(causeOk ? S.causeOk : S.causeBad)}</p> : null}
          </div>
        ) : null}
      </Section>

      <Section title={t(ui.m15.takeawayTitle)}>
        <Callout tone="warn">{t(TAKEAWAY)}</Callout>
      </Section>

      <Section title={t(ui.m15.quizTitle)} note={t(ui.m15.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m15.yes)} no={t(ui.m15.no)} />
      </Section>
    </LessonFrame>
  )
}

/** 逐拍播放：第 0 步是准备，第 i 步执行第 i 条向量 */
function AluRunPlayer({ rows }: { rows: RunRow[] }) {
  const { t } = useLocale()
  const player = useStepPlayer(rows.length + 1, 1100)
  const done = rows.slice(0, player.step)
  const fails = done.filter((r) => !r.pass).length
  return (
    <>
      <StepControls player={player} nextLabel={S.nextCycle} />
      <AluRunFig rows={rows} cur={player.step} />
      {player.atEnd ? (
        <p className={fails === 0 ? 'is-ok' : 'is-bad'}>
          {t(
            fails === 0
              ? loc(`${rows.length} 拍全部 Pass。`, `All ${rows.length} cycles pass.`)
              : loc(`${rows.length} 拍里 ${fails} 拍 Fail。`, `${fails} of ${rows.length} cycles fail.`),
          )}
        </p>
      ) : null}
    </>
  )
}

function ResultTable({ rows, empty }: { rows: RunRow[]; empty: string }) {
  const { t } = useLocale()
  if (rows.length === 0) return <p className="is-bad">{empty}</p>
  return (
    <table className="dtable alu-table">
      <thead>
        <tr>
          <th>{t(S.colOp)}</th>
          <th>A</th>
          <th>B</th>
          <th>{t(S.colExp)}</th>
          <th>{t(S.colGot)}</th>
          <th>{t(S.colRes)}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => (
          <tr key={item.row.id} className={item.pass ? '' : 'alu-table__fail'}>
            <td className="mono-cell">{OPS[item.row.op].name}</td>
            <td className="mono-cell">{hex4(item.row.a)}</td>
            <td className="mono-cell">{hex4(item.row.b)}</td>
            <td className="mono-cell">{`${hex4(item.exp.y)} / ${item.exp.carry}`}</td>
            <td className="mono-cell">{`${hex4(item.got.y)} / ${item.got.carry}`}</td>
            <td className={item.pass ? 'is-ok' : 'is-bad'}>{item.pass ? 'PASS' : 'FAIL'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
