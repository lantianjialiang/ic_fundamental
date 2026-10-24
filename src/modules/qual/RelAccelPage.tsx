import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { REL_META } from './meta'
import { ArrFig, FactorFig } from './RelAccelFig'
import { INTRO, MECHANISMS, MECH_SEG, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './relAccelData'
import { DEFAULT_ACCEL, MECH_FACTORS, analyseAccel, type AccelState } from './relAccelModel'
import './relAccel.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** 滑块的浮点误差去掉：保留两位小数 */
const round2 = (value: number) => Math.round(value * 100) / 100

export function RelAccelPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<AccelState>(DEFAULT_ACCEL)
  const analysis = useMemo(() => analyseAccel(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<AccelState>) => setState((prev) => ({ ...prev, ...patch }))
  const flags = MECH_FACTORS[state.mech]
  const notCounted = (counted: boolean) => (counted ? '' : ` · ${t(S.notCounted)}`)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(REL_META.relAccel.title)}
      goal={t(REL_META.relAccel.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="relStress"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state)} onReset={() => setState(DEFAULT_ACCEL)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={[S.introNote]} onOpen={onModuleChange} />
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['relBathtub', 'latch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.tableTitle)} note={t(S.tableNote)}>
        <div className="prep-table-wrap">
          <table className="prep-table">
            <thead>
              <tr>
                <th>{t(S.colMech)}</th>
                <th>{t(S.colCause)}</th>
                <th>{t(S.colSymptom)}</th>
                <th>{t(S.colTest)}</th>
                <th>{t(S.colModel)}</th>
              </tr>
            </thead>
            <tbody>
              {MECHANISMS.map((m) => (
                <tr key={m.id}>
                  <td>
                    <b>{t(m.name)}</b>
                  </td>
                  <td>{t(m.cause)}</td>
                  <td>{t(m.symptom)}</td>
                  <td>{t(m.test)}</td>
                  <td>{t(m.model)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.mechLabel)}</span>
            <Seg options={MECH_SEG} value={state.mech} onChange={(mech) => update({ mech })} />
          </div>
        </div>
        <div className="hs-controls">
          <Knob label={S.tUseLabel} value={state.tUse} unit="°C" min={25} max={85} step={5} onChange={(v) => update({ tUse: v })} />
          <Knob label={S.tStressLabel} value={state.tStress} unit="°C" min={70} max={150} step={5} onChange={(v) => update({ tStress: v })} />
          <Knob label={S.eaLabel} value={state.ea} unit="eV" min={0.3} max={1.2} step={0.05} onChange={(v) => update({ ea: round2(v) })} />
          <Knob label={S.hoursLabel} value={state.hours} unit="h" min={100} max={2000} step={100} onChange={(v) => update({ hours: v })} />
        </div>
        <div className="hs-controls">
          <Knob label={S.gammaLabel} value={state.gamma} unit="/V" min={0} max={8} step={0.5} onChange={(v) => update({ gamma: v })} />
          <Knob label={S.vUseLabel} value={state.vUse} unit="V" min={0.8} max={1.6} step={0.05} onChange={(v) => update({ vUse: round2(v) })} />
          <Knob label={S.vStressLabel} value={state.vStress} unit="V" min={0.8} max={1.6} step={0.05} onChange={(v) => update({ vStress: round2(v) })} />
        </div>
        <div className="hs-controls">
          <Knob label={S.dtUseLabel} value={state.dtUse} unit="°C" min={20} max={100} step={5} onChange={(v) => update({ dtUse: v })} />
          <Knob label={S.dtStressLabel} value={state.dtStress} unit="°C" min={50} max={250} step={5} onChange={(v) => update({ dtStress: v })} />
          <Knob label={S.nLabel} value={state.n} unit="" min={1} max={4} step={0.5} onChange={(v) => update({ n: v })} />
          <Knob label={S.jLabel} value={state.j} unit="" min={0.5} max={4} step={0.5} onChange={(v) => update({ j: v })} />
        </div>

        <div className="hs-grid">
          <div className="rel-acc-figs">
            <ArrFig state={state} />
            <FactorFig analysis={analysis} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rAfT, value: `${analysis.afT.toFixed(2)}${notCounted(flags.temp)}` },
                { label: S.rAfV, value: `${analysis.afV.toFixed(2)}${notCounted(flags.volt)}` },
                { label: S.rAfCm, value: `${analysis.afCm.toFixed(2)}${notCounted(flags.cycle)}` },
                { label: S.rAfJ, value: `${analysis.afJ.toFixed(2)}${notCounted(flags.current)}` },
                { label: S.rTotal, value: analysis.total.toFixed(2) },
                { label: S.rUseH, value: `${analysis.useHours.toFixed(0)} h` },
                { label: S.rUseY, value: `${analysis.useYears.toFixed(1)} ${t(S.unitYear)}` },
                { label: S.rEaRange, value: `${analysis.eaLow.toFixed(1)} – ${analysis.eaHigh.toFixed(1)}` },
                { label: S.rBlack, value: analysis.blackRatio.toFixed(2) },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="ok">
          <p>{t(TAKEAWAY)}</p>
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
