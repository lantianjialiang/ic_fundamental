import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import {
  DATALOG,
  FAULTS,
  HOW,
  QUIZ,
  RES_NOTE,
  TAKEAWAY,
  VERDICT_TEXT,
  WHY,
  judge,
  measure,
  type Fault,
  type Verdict,
} from './data/opens'
import { OpensFig } from './OpensFig'
import { Callout, Knob, Readout, Seg, Steps, fmtV, type Note } from './parts'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const S = {
  whyTitle: loc('为什么第一项永远是开短路', 'Why opens/shorts always comes first'),
  howTitle: loc('怎么测：PMU + 保护二极管', 'How: PMU + protection diodes'),
  howNote: loc('每个管脚内部都有两只保护二极管：一只接 VDD，一只接 VSS。开短路测试就是借它们来判断接触。', 'Every pin has two internal protection diodes: one to VDD and one to VSS. The opens/shorts test uses them to judge contact.'),
  simTitle: loc('自己测一个管脚', 'Test a pin yourself'),
  simNote: loc('选故障、选电流方向和大小，看读数落在哪个区间。', 'Pick a fault, current direction and magnitude, and see which region the reading falls in.'),
  polarity: loc('电流方向', 'Current direction'),
  neg: loc('−I：测对地二极管', '−I: diode to GND'),
  pos: loc('+I：测对 VDD 二极管', '+I: diode to VDD'),
  current: loc('测试电流', 'Test current'),
  read: loc('读数', 'Reading'),
  window: loc('Pass 窗口', 'Pass window'),
  verdict: loc('判定', 'Verdict'),
  logTitle: loc('读 Datalog：你来判', 'Read the datalog: you judge'),
  logNote: loc('−100 µA 下 9 个管脚的读数。每行点一个判断，看对不对。', 'Readings of 9 pins at −100 µA. Pick a verdict for each row and see if you are right.'),
  colPin: loc('管脚', 'Pin'),
  colV: loc('读数', 'Reading'),
  colYou: loc('你的判断', 'Your verdict'),
  vPass: loc('正常', 'Pass'),
  vOpen: loc('开路', 'Open'),
  vShort: loc('短路', 'Short'),
  kicker: loc('开短路', 'Opens/shorts'),
  later: loc('确认接触以后，才能上电做 DC 测试（下一课）。', 'Only after contact is confirmed can you power up for DC tests (next lesson).'),
}

const VERDICT_LABEL: Record<Verdict, typeof S.vPass> = { pass: S.vPass, open: S.vOpen, short: S.vShort }

export function FundOpensPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [fault, setFault] = useState<Fault>(FAULTS[0].id)
  const [pol, setPol] = useState<'neg' | 'pos'>('neg')
  const [amp, setAmp] = useState(100)
  const [answers, setAnswers] = useState<Record<string, Verdict>>({})
  const [note, setNote] = useState<Note>({ kicker: S.kicker, title: FAULTS[0].label, text: FAULTS[0].text })

  const pos = pol === 'pos'
  const volt = measure(fault, pos, amp)
  const verdict = judge(volt)
  const win = pos ? '+0.20 ~ +1.50 V' : '−1.50 ~ −0.20 V'

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m19.title)}
      goal={t(ui.m19.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
      nextId="fDc"
      nextLabel={t(ui.fund.next) + t(ui.m20.title)}
    >
      <Section title={t(S.whyTitle)}>
        {WHY.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
      </Section>

      <Section title={t(S.howTitle)} note={t(S.howNote)}>
        <Steps items={HOW} />
      </Section>

      <Section title={t(S.simTitle)} note={t(S.simNote)}>
        <Seg
          options={FAULTS.map((item) => ({ id: item.id, label: item.label }))}
          value={fault}
          onChange={(id) => {
            setFault(id)
            const item = FAULTS.find((f) => f.id === id)
            if (item) setNote({ kicker: S.kicker, title: item.label, text: item.text })
          }}
        />
        <div className="knob-row">
          <div>
            <p className="intro__note">{t(S.polarity)}</p>
            <Seg
              options={[
                { id: 'neg' as const, label: S.neg },
                { id: 'pos' as const, label: S.pos },
              ]}
              value={pol}
              onChange={setPol}
            />
          </div>
          <Knob label={S.current} value={amp} unit="µA" min={100} max={500} step={50} onChange={setAmp} />
        </div>
        <OpensFig fault={fault} pos={pos} volt={volt} />
        <Readout
          items={[
            { label: S.read, value: fmtV(volt), state: verdict === 'pass' ? 'pass' : 'fail' },
            { label: S.window, value: win },
            { label: S.verdict, value: t(VERDICT_LABEL[verdict]), state: verdict === 'pass' ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone={verdict === 'pass' ? 'ok' : 'bad'}>{t(VERDICT_TEXT[verdict])}</Callout>
        {fault === 'res' ? <Callout tone="warn">{t(RES_NOTE)}</Callout> : null}
      </Section>

      <Section title={t(S.logTitle)} note={t(S.logNote)}>
        <table className="dtable">
          <thead>
            <tr>
              <th>{t(S.colPin)}</th>
              <th>{t(S.colV)}</th>
              <th>{t(S.colYou)}</th>
            </tr>
          </thead>
          <tbody>
            {DATALOG.map((row) => {
              const picked = answers[row.pin]
              return (
                <tr key={row.pin}>
                  <td className="mono-cell">{row.pin}</td>
                  <td className="mono-cell">{row.volt.toFixed(3)} V</td>
                  <td>
                    <div className="kind">
                      {(['pass', 'open', 'short'] as Verdict[]).map((v) => {
                        let state = ''
                        if (picked && v === row.answer) state = ' is-right'
                        else if (picked === v) state = ' is-wrong'
                        return (
                          <button
                            key={v}
                            type="button"
                            className={`kind__btn${state}`}
                            onClick={() => {
                              setAnswers((prev) => ({ ...prev, [row.pin]: v }))
                              setNote({ kicker: S.kicker, title: row.pin, text: row.why })
                            }}
                          >
                            {t(VERDICT_LABEL[v])}
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
