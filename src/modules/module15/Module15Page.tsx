import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { AluFig, AluTimingFig } from './AluFig'
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
  aluWithFault,
  hex4,
  judgeItems,
  judgeTiming,
  judgeVectors,
  type FaultId,
  type ItemId,
  type VecId,
} from './data/content'

type Module15PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

const PORTS: Array<{ name: string; dir: LText; note: LText }> = [
  { name: 'A[3:0]', dir: loc('输入'), note: loc('操作数 A，4 位') },
  { name: 'B[3:0]', dir: loc('输入'), note: loc('操作数 B；移位时低 2 位是移位量') },
  { name: 'OP[2:0]', dir: loc('输入'), note: loc('000 ADD · 001 AND · 010 OR · 011 XOR · 100 SHL · 101 SHR') },
  { name: 'Y[3:0]', dir: loc('输出'), note: loc('运算结果') },
  { name: 'Carry', dir: loc('输出'), note: loc('ADD 进位或移位时移出的那一位') },
  { name: 'VDD / GND', dir: loc('电源'), note: loc('3.3 V。DC / IDD 测这里') },
]

export function Module15Page({ moduleId, onModuleChange }: Module15PageProps) {
  const { t } = useLocale()
  const [step, setStep] = useState(1)
  const [items, setItems] = useState<ItemId[]>([])
  const [vectors, setVectors] = useState<VecId[]>(BANK.map((row) => row.id))
  const [period, setPeriod] = useState(16)
  const [drive, setDrive] = useState(2)
  const [strobe, setStrobe] = useState(12)
  const [dc, setDc] = useState<string | null>(null)
  const [fault, setFault] = useState<FaultId>('none')
  const [cause, setCause] = useState<FaultId | null>(null)
  const [ran, setRan] = useState(false)

  const itemJudge = judgeItems(items)
  const vecJudge = judgeVectors(vectors)
  const timeJudge = judgeTiming(period, strobe, drive)
  const results = BANK.filter((row) => vectors.includes(row.id)).map((row) => {
    const exp = alu(row.a, row.b, row.op)
    const got = aluWithFault(row.a, row.b, row.op, fault)
    const pass = got.y === exp.y && got.carry === exp.carry
    return { row, exp, got, pass }
  })
  const fails = results.filter((item) => !item.pass)
  const causeOk = cause !== null && cause === fault && fault !== 'none'
  const settle = drive + TPD

  const aside = asideOf(step, t, {
    itemJudge,
    vecJudge,
    timeJudge,
    dc,
    ran,
    fails: fails.length,
    causeOk,
    fault,
  })

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m15.title)}
      goal={t(ui.m15.goal)}
      kicker={t(ui.m15.kickerStep)}
      asideTitle={aside.title}
      asideText={aside.text}
      asideLater={t(ui.m15.asideLater)}
      nextId="latch"
      nextLabel={t(ui.m15.next)}
    >
      <Section title={t(ui.m15.introTitle)}>
        <p>{t(ui.m15.introBody)}</p>
      </Section>

      <Section title={t(ui.m15.portTitle)} note={t(ui.m15.portNote)}>
        <AluFig t={t} />
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
            onClick={() => setStep(item.id)}
          >
            {item.id}
          </button>
        ))}
      </div>

      <Section title={`${t(ui.m15.step)} ${step} · ${t(STEPS[step - 1].title)}`} note={t(STEPS[step - 1].text)}>
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
            <div className="pick pick--2">
              {ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pick__card${items.includes(item.id) ? ' is-active' : ''}`}
                  onClick={() =>
                    setItems((prev) =>
                      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                    )
                  }
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
              const on = vectors.includes(row.id)
              return (
                <button
                  key={row.id}
                  type="button"
                  className={`vec__row${on ? ' is-active' : ''}`}
                  onClick={() =>
                    setVectors((prev) =>
                      prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id],
                    )
                  }
                >
                  {OPS[row.op].name} {hex4(row.a)} {hex4(row.b)} → Y {hex4(exp.y)} C {exp.carry}
                </button>
              )}
            )}
            <p className={vecJudge.ok ? 'is-ok' : 'is-bad'}>{t(vecJudge.text)}</p>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="meter">
            <div className="time-readout">
              <span>Period {period} ns</span>
              <span>Drive {drive} ns</span>
              <span>tpd {TPD} ns</span>
              <span>稳定 {settle} ns</span>
              <span>Strobe {strobe} ns</span>
              <span className={timeJudge.ok ? 'is-ok' : 'is-bad'}>{timeJudge.ok ? '窗口 OK' : '窗口坏'}</span>
            </div>
            <label>
              <span>Period {period} ns</span>
              <input
                type="range"
                min={8}
                max={24}
                value={period}
                onChange={(event) => {
                  const next = Number(event.target.value)
                  setPeriod(next)
                  setStrobe((s) => Math.min(s, next))
                  setDrive((d) => Math.min(d, next - 1))
                }}
              />
            </label>
            <label>
              <span>Drive {drive} ns</span>
              <input
                type="range"
                min={0}
                max={Math.max(period - TPD - 1, 0)}
                value={drive}
                onChange={(event) => setDrive(Number(event.target.value))}
              />
            </label>
            <label>
              <span>
                Strobe {strobe} ns（须 &gt; {settle}，且 &lt; {period}）
              </span>
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
        ) : null}

        {step === 6 ? (
          <div>
            <button type="button" className="lab__btn lab__btn--primary" onClick={() => setRan(true)}>
              {t(ui.m15.run)}
            </button>
            {ran ? <ResultTable results={results} empty={t(ui.m15.needVec)} /> : null}
          </div>
        ) : null}

        {step === 7 ? (
          <div>
            <p className="intro__note">{t(ui.m15.injectNote)}</p>
            <div className="pick pick--2">
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
            <ResultTable results={results} empty={t(ui.m15.needVec)} />
            <p className={fails.length === 0 ? 'is-ok' : 'is-bad'}>
              {fault === 'none'
                ? t({ zh: '无注入时应全 Pass。换一种故障，看哪些 OP / 哪些位翻红。' })
                : t({ zh: `当前失败 ${fails.length} 条。对照红行再选根因，不要猜。` })}
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
            {cause !== null ? (
              <p className={causeOk ? 'is-ok' : 'is-bad'}>
                {causeOk
                  ? t({ zh: '根因和注入一致。失败行已经说明为什么是它。' })
                  : t({ zh: '再看失败的是哪些 OP / 哪些位。' })}
              </p>
            ) : null}
          </div>
        ) : null}
      </Section>

      <Section title={t(ui.m15.takeawayTitle)}>
        <button type="button" className="takeaway">
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m15.quizTitle)} note={t(ui.m15.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m15.yes)} no={t(ui.m15.no)} />
      </Section>
    </LessonFrame>
  )
}

function ResultTable({
  results,
  empty,
}: {
  results: Array<{
    row: (typeof BANK)[number]
    exp: { y: number; carry: number }
    got: { y: number; carry: number }
    pass: boolean
  }>
  empty: string
}) {
  if (results.length === 0) return <p className="is-bad">{empty}</p>
  return (
    <div className="vec">
      {results.map((item) => (
        <p key={item.row.id} className={item.pass ? 'is-ok' : 'is-bad'}>
          {OPS[item.row.op].name} {hex4(item.row.a)} {hex4(item.row.b)} · exp {hex4(item.exp.y)}/
          {item.exp.carry} · got {hex4(item.got.y)}/{item.got.carry} · {item.pass ? 'PASS' : 'FAIL'}
        </p>
      ))}
    </div>
  )
}

function asideOf(
  step: number,
  t: (text: import('../../i18n/locale').LText | string) => string,
  state: {
    itemJudge: { ok: boolean; text: LText }
    vecJudge: { ok: boolean; text: LText }
    timeJudge: { ok: boolean; text: LText }
    dc: string | null
    ran: boolean
    fails: number
    causeOk: boolean
    fault: FaultId
  },
): { title: string; text: string } {
  const title = t(STEPS[step - 1].title)
  if (step === 2) return { title, text: t(state.itemJudge.text) }
  if (step === 3) return { title, text: t(state.vecJudge.text) }
  if (step === 4) return { title, text: t(state.timeJudge.text) }
  if (step === 5) {
    return {
      title,
      text: state.dc
        ? t({ zh: 'DC 条件已选定。量产程序里这一项要写进 Test Condition。' })
        : t({ zh: '选一项即可，但必须能说清 Force / Measure。' }),
    }
  }
  if (step === 6) {
    return {
      title,
      text: state.ran
        ? t({ zh: `跑完。失败 ${state.fails} 条。先看是哪一个 OP。` })
        : t({ zh: '先勾向量再运行。无故障时应全 Pass。' }),
    }
  }
  if (step === 7) {
    return {
      title,
      text: state.causeOk
        ? t({ zh: '分析对上了。失败行和注入是同一件事。' })
        : t({ zh: `已注入。失败 ${state.fails} 条。对照红行选根因。` }),
    }
  }
  return { title, text: t(STEPS[0].text) }
}
