import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { ANA_META } from './meta'
import { INTRO, MISCONCEPTIONS, OUT_OPTIONS, QUIZ, REF_OPTIONS, S, TAKEAWAY, taskItems, verdictOf } from './pllData'
import { PllFig } from './PllFig'
import { BW_MAX_KHZ, BW_MIN_KHZ, DEFAULT_PLL, REF_JITTER_MAX_PS, REF_PPM_MAX, analyzePll, type LockStatus, type PllState } from './pllModel'
import './ana.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const STATUS_TEXT: Record<LockStatus, LText> = {
  ok: S.statusOk,
  slow: S.statusSlow,
  'no-lock': S.statusNone,
  unstable: S.statusUnstable,
}

export function AnaPllPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<PllState>(DEFAULT_PLL)
  const result = analyzePll(state)
  const verdict = verdictOf(state, result)
  const update = (patch: Partial<PllState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => setState(DEFAULT_PLL)
  const lockText = result.stable ? `${result.lockUs.toFixed(1)} µs` : '—'
  const hzSign = result.outErrHz >= 0 ? '+' : ''

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaPll.title)}
      goal={t(ANA_META.anaPll.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaTrim"
      nextLabel={`${t(S.nextPrefix)}${t(ANA_META.anaTrim.title)}`}
      extra={<TaskList items={taskItems(result)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaDynamic', 'anaFft']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-controls">
          <div className="ana-field">
            <span className="ana-field__label">{t(S.fRefLabel)}</span>
            <Seg options={REF_OPTIONS} value={String(state.fRefMhz)} onChange={(id) => update({ fRefMhz: Number(id) })} />
          </div>
          <div className="ana-field">
            <span className="ana-field__label">{t(S.fOutLabel)}</span>
            <Seg options={OUT_OPTIONS} value={String(state.fOutMhz)} onChange={(id) => update({ fOutMhz: Number(id) })} />
          </div>
          <Knob label={S.bwLabel} value={state.bwKhz} unit="kHz" min={BW_MIN_KHZ} max={BW_MAX_KHZ} step={10} onChange={(bwKhz) => update({ bwKhz })} />
          <Knob label={S.refPpmLabel} value={state.refPpm} unit="ppm" min={-REF_PPM_MAX} max={REF_PPM_MAX} step={1} onChange={(refPpm) => update({ refPpm })} />
          <Knob label={S.refJitterLabel} value={state.refJitterPs} unit="ps" min={0} max={REF_JITTER_MAX_PS} step={0.1} onChange={(refJitterPs) => update({ refJitterPs })} />
          <Knob label={S.seedLabel} value={state.seed} unit="" min={1} max={99} step={1} onChange={(seed) => update({ seed })} />
        </div>

        <PllFig bwKhz={state.bwKhz} result={result} />

        <div className="ana-cell">
          <Readout
            items={[
              { label: S.rDivider, value: `${result.divider}` },
              { label: S.rTau, value: `${result.tauUs.toFixed(2)} µs` },
              { label: S.rStatus, value: t(STATUS_TEXT[result.lockStatus]), state: result.lockStatus === 'ok' ? 'pass' : 'fail' },
              { label: S.rLock, value: lockText, state: result.lockStatus === 'ok' ? 'pass' : 'fail' },
              { label: S.rPpm, value: `${result.outPpm.toFixed(1)} ppm`, state: result.ppmOk ? 'pass' : 'fail' },
              { label: S.rHz, value: `${hzSign}${result.outErrHz.toFixed(0)} Hz` },
              { label: S.rJitter, value: `${result.jitterPs.toFixed(2)} ps`, state: result.jitterOk ? 'pass' : 'fail' },
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
