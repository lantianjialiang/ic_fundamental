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
import { fmtFixed, fmtNum } from './rfFormat'
import { RF_META } from './meta'
import { RfSparamFig } from './RfSparamFig'
import { FORMULAS, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './rfSparamData'
import { DEFAULT_SPARAM, LOAD_OPTIONS, analyseSparam, applyPreset, setLoadValue, type LoadId, type SparamState } from './rfSparamModel'
import './rfSparam.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** 复数 Γ 的显示：实部 ± j 虚部，接近 0 的值显示为 0 */
function fmtGamma(re: number, im: number): string {
  const r = Math.abs(re) < 0.0005 ? 0 : re
  const i = Math.abs(im) < 0.0005 ? 0 : im
  const sign = i < 0 ? '−' : '+'
  return `${fmtNum(r, 3)} ${sign} j${fmtNum(Math.abs(i), 3)}`
}

export function RfSparamPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<SparamState>(DEFAULT_SPARAM)
  const analysis = useMemo(() => analyseSparam(state), [state])
  const verdict = verdictOf(state, analysis)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfSparam.title)}
      goal={t(RF_META.rfSparam.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={`${t(verdict.text)} ${t(verdict.note)}`}
      asideLater={t(S.asideLater)}
      nextId="rfGain"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_SPARAM)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={S.introParas} onOpen={onModuleChange} />
        <Related ids={['rfDb', 'hsChannel']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.loadLabel)}</span>
            <Seg<LoadId>
              options={LOAD_OPTIONS}
              value={state.preset}
              onChange={(id) => setState((prev) => applyPreset(prev, id))}
            />
          </div>
        </div>
        <div className="hs-controls">
          <Knob
            label={S.rLabel}
            value={state.rOhm}
            unit="Ω"
            min={0}
            max={200}
            step={1}
            onChange={(rOhm) => setState((prev) => setLoadValue(prev, { rOhm }))}
          />
          <Knob
            label={S.xLabel}
            value={state.xOhm}
            unit="Ω"
            min={-200}
            max={200}
            step={1}
            onChange={(xOhm) => setState((prev) => setLoadValue(prev, { xOhm }))}
          />
        </div>

        <div className="hs-grid">
          <RfSparamFig state={state} analysis={analysis} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rGamma, value: fmtNum(analysis.gammaMag, 3) },
                { label: S.rRl, value: fmtFixed(analysis.rlDb, 2, 'dB') },
                { label: S.rVswr, value: fmtNum(analysis.vswr, 2), state: analysis.pass ? 'pass' : 'fail' },
                { label: S.rMismatch, value: fmtFixed(analysis.mismatchDb, 2, 'dB') },
                { label: S.rReflected, value: fmtFixed(analysis.reflectedPct, 1, '%') },
                { label: S.rVerdict, value: t(analysis.pass ? S.passWord : S.failWord), state: analysis.pass ? 'pass' : 'fail' },
              ]}
            />
            <p className="intro__note">{`Γ = ${fmtGamma(analysis.gamma.re, analysis.gamma.im)}`}</p>
          </div>
        </div>

        <Callout>
          <p>{t(S.formulaTitle)}</p>
          {FORMULAS.map((line) => (
            <p key={line}>{line}</p>
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
