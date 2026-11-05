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
import { PIC_META } from './meta'
import { PicModFig } from './PicModFig'
import {
  DRIFT_OPTIONS,
  FIG,
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TABS,
  TAKEAWAY,
  fill,
  taskItems,
  verdictOf,
} from './picModData'
import { DEFAULT_MOD, analyseMod, fmtEr, type ModState } from './picModModel'
import './pic.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PicModPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<ModState>(DEFAULT_MOD)
  const analysis = useMemo(() => analyseMod(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<ModState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PIC_META.picMod.title)}
      goal={t(PIC_META.picMod.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'picSweep' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(analysis)} onReset={() => setState(DEFAULT_MOD)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['picDevice', 'picUnits']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <p className="intro__note">{t(PRACTICE_NOTE)}</p>
        <PracticeSteps items={taskItems(analysis)} />

        <Callout tone="warn">
          <p>{t(S.teach)}</p>
        </Callout>
        <div className="seg pic-tabs" role="tablist" aria-label={t(S.tabAria)}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={state.tab === tab.id}
              className={state.tab === tab.id ? 'is-active' : ''}
              onClick={() => update({ tab: tab.id })}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
        {state.tab === 'mzm' ? (
          <>
            <div className="hs-controls">
              <Knob label={S.p0Label} value={state.p0} unit="mW" min={0.5} max={4} step={0.5} onChange={(p0) => update({ p0: Math.round(p0 * 2) / 2 })} />
              <Knob label={S.vpiLabel} value={state.vpi} unit="V" min={1} max={8} step={1} onChange={(vpi) => update({ vpi })} />
              <Knob label={S.phiLabel} value={state.phiDeg} unit="deg" min={-180} max={180} step={15} onChange={(phiDeg) => update({ phiDeg })} />
              <Knob label={S.vppLabel} value={state.vpp} unit="V" min={0} max={8} step={1} onChange={(vpp) => update({ vpp })} />
            </div>
            <div className="hs-grid">
              <PicModFig
                p0={state.p0}
                vpi={state.vpi}
                phi0={analysis.phi0}
                vpp={state.vpp}
                aria={t(FIG.aria)}
                summary={t(fill(FIG.sum, { v: state.vpp.toFixed(0), p1: analysis.pHigh.toFixed(3), p0: analysis.pLow.toFixed(3) }))}
                xLabel={t(FIG.x)}
                yLabel={t(FIG.y)}
                highLabel={t(FIG.pHigh)}
                lowLabel={t(FIG.pLow)}
              />
              <div className="hs-cell">
                <Readout
                  items={[
                    { label: S.rAt0, value: `${analysis.at0.toFixed(3)} mW` },
                    { label: S.rP1, value: `${analysis.pHigh.toFixed(3)} mW` },
                    { label: S.rP0, value: `${analysis.pLow.toFixed(3)} mW` },
                    { label: S.rEr, value: fmtEr(analysis.erDb) },
                    { label: S.rOma, value: `${analysis.oma.toFixed(3)} mW` },
                    { label: S.rIl, value: `${analysis.ilDb.toFixed(2)} dB` },
                  ]}
                />
                {analysis.task2 ? <p>{t(S.extinct)}</p> : null}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="hs-controls">
              <Knob label={S.dbmLabel} value={state.pdDbm} unit="dBm" min={-20} max={5} step={1} onChange={(pdDbm) => update({ pdDbm })} />
              <Knob label={S.respLabel} value={state.resp} unit="A/W" min={0.2} max={1.2} step={0.1} onChange={(resp) => update({ resp: Math.round(resp * 10) / 10 })} />
              <Knob label={S.darkLabel} value={state.darkNa} unit="nA" min={0} max={50} step={1} onChange={(darkNa) => update({ darkNa })} />
            </div>
            <Readout
              items={[
                { label: S.rPhoto, value: `${(analysis.photoA * 1e6).toFixed(2)} µA` },
                { label: S.rDark, value: `${state.darkNa.toFixed(0)} nA` },
                { label: S.rTotal, value: `${(analysis.totalA * 1e6).toFixed(2)} µA` },
              ]}
            />
          </>
        )}
        <div className="hs-field">
          <span className="hs-field__label">{t(S.driftLabel)}</span>
          <Seg options={DRIFT_OPTIONS} value={state.drift} onChange={(drift) => update({ drift })} />
        </div>
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
