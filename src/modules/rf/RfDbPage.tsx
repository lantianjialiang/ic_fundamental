import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg, Steps } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { RF_META } from './meta'
import { RfDbFig } from './RfDbFig'
import { ANCHORS, INTRO_UNITS_NOTE, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './rfDbData'
import { DEFAULT_DB, UNIT_OPTIONS, analyseDb, switchUnit, type DbState } from './rfDbModel'
import { fmtFixed, formatSi } from './rfFormat'
import './rfDb.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfDbPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<DbState>(DEFAULT_DB)
  const analysis = useMemo(() => analyseDb(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<DbState>) => setState((prev) => ({ ...prev, ...patch }))
  const input = analysis.input

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfDb.title)}
      goal={t(RF_META.rfDb.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note === null ? t(verdict.text) : `${t(verdict.text)} ${t(verdict.note)}`}
      asideLater={t(S.asideLater)}
      nextId="rfSystem"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_DB)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={S.introParas} onOpen={onModuleChange} />
        <Callout>
          <p>{t(S.quickTitle)}</p>
          <Steps items={ANCHORS} />
        </Callout>
        <Related ids={['rfOverview', 'anaFft']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.unitLabel)}</span>
            <Seg options={UNIT_OPTIONS.map((unit) => ({ id: unit, label: unit }))} value={state.unit} onChange={(unit) => setState((prev) => switchUnit(prev, unit))} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.valueLabel)}</span>
            <input
              className="rf-input"
              type="text"
              inputMode="decimal"
              value={state.text}
              aria-label={t(S.valueLabel)}
              onChange={(event) => update({ text: event.target.value })}
            />
          </div>
        </div>
        {input === null ? (
          <Callout tone="bad">
            <p>{t(S.invalid)}</p>
          </Callout>
        ) : null}
        <div className="hs-cell">
          <Readout
            items={[
              { label: S.rDbm, value: input === null ? '—' : fmtFixed(input.dbm, 2, 'dBm') },
              { label: S.rWatt, value: input === null ? '—' : formatSi(input.watt, 'W') },
            ]}
          />
        </div>
      </Section>

      <Section title={t(S.cascadeTitle)} note={t(S.cascadeNote)}>
        <div className="hs-controls">
          <Knob label={S.srcLabel} value={state.srcDbm} unit="dBm" min={-20} max={10} step={1} onChange={(srcDbm) => update({ srcDbm })} />
          <Knob label={S.cableLabel} value={state.cableDb} unit="dB" min={-5} max={0} step={0.5} onChange={(cableDb) => update({ cableDb })} />
          <Knob label={S.ampLabel} value={state.ampDb} unit="dB" min={0} max={20} step={0.5} onChange={(ampDb) => update({ ampDb })} />
          <Knob label={S.attLabel} value={state.attDb} unit="dB" min={-20} max={0} step={0.5} onChange={(attDb) => update({ attDb })} />
        </div>
        <div className="hs-grid">
          <RfDbFig levels={analysis.levels} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rTotal, value: fmtFixed(analysis.totalDb, 1, 'dB') },
                { label: S.rLinear, value: `×${analysis.linearGain.toFixed(2)}` },
                { label: S.rOut, value: fmtFixed(analysis.outDbm, 2, 'dBm'), state: analysis.overLimit ? 'fail' : 'pass' },
                { label: S.rOutWatt, value: formatSi(analysis.outMw / 1000, 'W') },
              ]}
            />
          </div>
        </div>
        <p className="intro__note">{t(INTRO_UNITS_NOTE)}</p>
      </Section>

      <Section title={t(S.dbcTitle)} note={t(S.dbcNote)}>
        <div className="hs-controls">
          <Knob label={S.carrierLabel} value={state.carrierDbm} unit="dBm" min={-20} max={20} step={1} onChange={(carrierDbm) => update({ carrierDbm })} />
          <Knob label={S.spurLabel} value={state.spurDbc} unit="dBc" min={-80} max={0} step={1} onChange={(spurDbc) => update({ spurDbc })} />
        </div>
        <div className="hs-cell">
          <Readout
            items={[
              { label: S.rSpurDbm, value: fmtFixed(analysis.spurDbm, 2, 'dBm') },
              { label: S.rSpurWatt, value: formatSi(analysis.spurWatt, 'W') },
            ]}
          />
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
