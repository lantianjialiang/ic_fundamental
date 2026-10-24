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
import { PWR_META } from './meta'
import { GanFig, MaterialFig, PrecondFig, VthFig } from './PwrWbgFig'
import {
  APP_SEG,
  APP_TEXT,
  INTRO,
  MAT_SEG,
  MATERIAL_TEXT,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAB_SEG,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './pwrWbgData'
import { analyseWbg, DEFAULT_WBG, GAN_R0_MOHM, type WbgState } from './pwrWbgModel'
import './pwrWbg.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** 导通电阻读数：大于 1 保留一位小数，小于 1 用两位有效数字 */
const fmtRon = (x: number) => (x >= 1 ? x.toFixed(1) : x.toPrecision(2))
const fmtPct = (x: number) => `${(x * 100).toFixed(1)} %`

export function PwrWbgPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<WbgState>(DEFAULT_WBG)
  const analysis = useMemo(() => analyseWbg(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<WbgState>) => setState((prev) => ({ ...prev, ...patch }))
  const { ron, vth } = analysis
  const vthOk = vth.diff <= 0.1

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PWR_META.pwrWbg.title)}
      goal={t(PWR_META.pwrWbg.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="pwrProgram"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_WBG)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pwrSelector', 'pwrStatic', 'pwrDpt']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Seg options={TAB_SEG} value={state.tab} onChange={(tab) => update({ tab })} />

        {state.tab === 'material' ? (
          <div className="pwrw-grid">
            <div className="pwrw-stack">
              <div className="hs-controls">
                <div className="hs-field">
                  <span className="hs-field__label">{t(S.appLabel)}</span>
                  <Seg options={APP_SEG} value={state.app} onChange={(app) => update({ app })} />
                </div>
                <div className="hs-field">
                  <span className="hs-field__label">{t(S.matLabel)}</span>
                  <Seg options={MAT_SEG} value={state.material} onChange={(material) => update({ material })} />
                </div>
              </div>
              <MaterialFig bv={analysis.bv} appLabel={APP_TEXT[state.app]} />
              <p className="pwrw-note">{t(S.illus)}</p>
            </div>
            <div className="pwrw-cell">
              <Readout
                items={[
                  { label: S.rBv, value: `${analysis.bv} V` },
                  { label: MATERIAL_TEXT.si, value: fmtRon(ron.si) },
                  { label: MATERIAL_TEXT.sic, value: fmtRon(ron.sic) },
                  { label: MATERIAL_TEXT.gan, value: fmtRon(ron.gan) },
                  { label: S.rSiSic, value: (ron.si / ron.sic).toFixed(1) },
                  { label: S.rSicSi, value: fmtPct(ron[state.material] / ron.si) },
                ]}
              />
              <p className="pwrw-note">{t(S.formulaMat)}</p>
            </div>
          </div>
        ) : null}

        {state.tab === 'vth' ? (
          <div className="pwrw-grid">
            <div className="pwrw-stack">
              <div className="hs-controls">
                <Knob label={S.rateLabel} value={state.rate} unit="V/s" min={0.1} max={10} step={0.1} onChange={(rate) => update({ rate })} />
                <Knob label={S.vpreLabel} value={state.vpre} unit="V" min={0} max={20} step={1} onChange={(vpre) => update({ vpre })} />
                <Knob label={S.tpreLabel} value={state.tpre} unit="ms" min={0} max={10} step={0.1} onChange={(tpre) => update({ tpre })} />
              </div>
              <p className="pwrw-note">{t(S.stdNote)}</p>
              <VthFig res={vth} />
              <PrecondFig vpre={state.vpre} tpre={state.tpre} />
              <p className="pwrw-note">{t(S.formulaVth)}</p>
            </div>
            <div className="pwrw-cell">
              <Readout
                items={[
                  { label: S.vthFwd, value: `${vth.readFwd.toFixed(3)} V` },
                  { label: S.vthRev, value: `${vth.readRev.toFixed(3)} V` },
                  { label: S.vthDiff, value: `${vth.diff.toFixed(3)} V`, state: vthOk ? 'pass' : 'fail' },
                  { label: S.vthSweep, value: `${vth.sweepS.toFixed(1)} s` },
                  { label: S.vthTarget, value: t(vthOk ? S.vthPass : S.vthFail), state: vthOk ? 'pass' : 'fail' },
                ]}
              />
            </div>
          </div>
        ) : null}

        {state.tab === 'gan' ? (
          <div className="pwrw-grid">
            <div className="pwrw-stack">
              <div className="hs-controls">
                <Knob label={S.vsLabel} value={state.vs} unit="V" min={0} max={650} step={10} onChange={(vs) => update({ vs })} />
                <Knob label={S.tsLabel} value={state.ts} unit="ms" min={0.1} max={10} step={0.1} onChange={(ts) => update({ ts })} />
                <Knob label={S.delayLabel} value={state.delay} unit="µs" min={0.1} max={200} step={0.1} onChange={(delay) => update({ delay })} />
              </div>
              <p className="pwrw-note">{t(S.stdNote)}</p>
              <GanFig k={analysis.k} delayUs={state.delay} />
              <p className="pwrw-note">{t(S.formulaGan)}</p>
            </div>
            <div className="pwrw-cell">
              <Readout
                items={[
                  { label: S.ganR0, value: `${GAN_R0_MOHM.toFixed(1)} mΩ` },
                  { label: S.ganR1, value: `${analysis.r1.toFixed(1)} mΩ` },
                  { label: S.ganInc1, value: fmtPct(analysis.inc1) },
                  { label: S.ganR100, value: `${analysis.r100.toFixed(1)} mΩ` },
                  { label: S.ganInc100, value: fmtPct(analysis.inc100) },
                  { label: S.ganRDelay, value: `${analysis.rDelay.toFixed(1)} mΩ` },
                  { label: S.ganIncDelay, value: fmtPct(analysis.incDelay) },
                ]}
              />
            </div>
          </div>
        ) : null}
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