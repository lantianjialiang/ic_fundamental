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
import { RF_META } from './meta'
import { RfSystemFig } from './RfSystemFig'
import { MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './rfSystemData'
import { PRESETS, DEFAULT_SYSTEM, analyseLink, partsOf, type PresetId, type RfSystemState } from './rfSystemModel'
import { fmtFixed, formatSi } from './rfFormat'
import { dbmToWatt } from './core/units'
import './rfSystem.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function RfSystemPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<RfSystemState>(DEFAULT_SYSTEM)
  const analysis = useMemo(() => analyseLink(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<RfSystemState>) => setState((prev) => ({ ...prev, ...patch }))
  // 连错的链路读数不可信：只要有错误，就不显示 DUT 功率与分析仪读数
  const valid = analysis.error === null && analysis.dutDbm !== null && analysis.saDbm !== null
  const dutText = valid && analysis.dutDbm !== null ? fmtFixed(analysis.dutDbm, 2, 'dBm') : '—'
  const dutWattText = valid && analysis.dutDbm !== null ? formatSi(dbmToWatt(analysis.dutDbm), 'W') : '—'
  const saText = valid && analysis.saDbm !== null ? fmtFixed(analysis.saDbm, 2, 'dBm') : '—'
  const dutState = !valid ? undefined : analysis.overLimit ? 'fail' : 'pass'

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfSystem.title)}
      goal={t(RF_META.rfSystem.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={`${t(verdict.text)} ${t(verdict.note)}`}
      asideLater={t(S.asideLater)}
      nextId="rfSparam"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_SYSTEM)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={S.introParas} onOpen={onModuleChange} />
        <Related ids={['rfDb', 'hsAteLimit']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.presetLabel)}</span>
            <Seg<PresetId>
              options={PRESETS.map((preset) => ({ id: preset.id, label: preset.label }))}
              value={state.preset}
              onChange={(preset) => update({ preset })}
            />
          </div>
        </div>
        <div className="hs-controls">
          <Knob label={S.sgLabel} value={state.sgDbm} unit="dBm" min={-20} max={20} step={1} onChange={(sgDbm) => update({ sgDbm })} />
          <Knob label={S.cableLabel} value={state.cableDb} unit="dB" min={0} max={10} step={0.5} onChange={(cableDb) => update({ cableDb })} />
          <Knob label={S.fixtureLabel} value={state.fixtureDb} unit="dB" min={0} max={10} step={0.5} onChange={(fixtureDb) => update({ fixtureDb })} />
        </div>

        <div className="hs-grid">
          <RfSystemFig parts={partsOf(state)} analysis={analysis} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rDut, value: dutText, state: dutState },
                { label: S.rDutWatt, value: dutWattText },
                { label: S.rSa, value: saText },
                {
                  label: S.rLink,
                  value: analysis.error === null ? t(S.linkOk) : t(S.linkBad),
                  state: analysis.error === null ? 'pass' : 'fail',
                },
              ]}
            />
          </div>
        </div>
        <Callout tone="warn">
          <p>{t(S.rulesTitle)}</p>
          {S.rules.map((rule, index) => (
            <p key={index}>{t(rule)}</p>
          ))}
        </Callout>
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
