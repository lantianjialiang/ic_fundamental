import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { PIC_META } from './meta'
import { SpectrumPlot } from './plots'
import {
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TABS,
  TAKEAWAY,
  fill,
  taskItems,
  verdictOf,
} from './picDeviceData'
import { DEFAULT_DEVICE, analyseDevice, fmtT, type DeviceState } from './picDeviceModel'
import './pic.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PicDevicePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<DeviceState>(DEFAULT_DEVICE)
  const analysis = useMemo(() => analyseDevice(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<DeviceState>) => setState((prev) => ({ ...prev, ...patch }))
  const cursor = Math.min(state.cursor, analysis.db.length - 1)
  const round1 = (value: number) => Math.round(value * 10) / 10
  const round2 = (value: number) => Math.round(value * 100) / 100

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PIC_META.picDevice.title)}
      goal={t(PIC_META.picDevice.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId={'picMod' as ModuleId}
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(analysis)} onReset={() => setState(DEFAULT_DEVICE)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['picUnits', 'picSweep', 'picMod']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
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
        <div className="hs-controls">
          <Knob label={S.neffLabel} value={state.neff} unit="" min={2} max={3} step={0.1} onChange={(neff) => update({ neff: round1(neff) })} />
          <Knob label={S.ngLabel} value={state.ng} unit="" min={3} max={5} step={0.1} onChange={(ng) => update({ ng: round1(ng) })} />
          {state.tab === 'mzi' ? (
            <Knob label={S.dlLabel} value={state.dlUm} unit="µm" min={10} max={500} step={10} onChange={(dlUm) => update({ dlUm })} />
          ) : (
            <>
              <Knob label={S.radiusLabel} value={state.radiusUm} unit="µm" min={5} max={20} step={1} onChange={(radiusUm) => update({ radiusUm })} />
              <Knob label={S.aLabel} value={state.a} unit="" min={0.5} max={0.95} step={0.01} onChange={(a) => update({ a: round2(a) })} />
              <Knob label={S.rLabel} value={state.r} unit="" min={0.5} max={0.95} step={0.01} onChange={(r) => update({ r: round2(r) })} />
              <Knob label={S.dTLabel} value={state.dT} unit="K" min={0} max={40} step={1} onChange={(dT) => update({ dT })} />
            </>
          )}
        </div>
        <div className="hs-grid">
          <SpectrumPlot
            lambdaNm={analysis.lambdaNm}
            curves={[
              {
                id: state.tab,
                legend: t(state.tab === 'mzi' ? S.legMzi : S.legRing),
                color: state.tab === 'mzi' ? '#58a6ff' : '#bc8cff',
                db: analysis.db,
              },
            ]}
            cursor={cursor}
            onCursor={(next) => update({ cursor: next })}
            aria={t(S.plotAria)}
            summary={`${t(fill(S.sum, { wl: analysis.lambdaNm[cursor].toFixed(2), db: analysis.db[cursor].toFixed(1) }))} ${t(S.plotCap)}`}
            xLabel={t(S.xLabel)}
            yLabel={t(S.yLabel)}
          />
          <div className="hs-cell">
            {state.tab === 'mzi' ? (
              <>
                <Readout
                  items={[
                    { label: S.rFsr, value: `${analysis.mziFsr.toFixed(2)} nm` },
                    { label: S.rEr, value: '∞' },
                  ]}
                />
                <p>{t(S.mziEr)}</p>
              </>
            ) : (
              <Readout
                items={[
                  { label: S.rFsr, value: `${analysis.ringFsr.toFixed(2)} nm` },
                  { label: S.rRes, value: `${analysis.resonanceNm.toFixed(2)} nm` },
                  { label: S.rFwhm, value: `${analysis.fwhmNm.toFixed(3)} nm` },
                  { label: S.rQ, value: Number.isFinite(analysis.q) ? analysis.q.toFixed(0) : '∞' },
                  { label: S.rEr, value: `${analysis.erDb.toFixed(1)} dB` },
                  { label: S.rPm, value: `${analysis.pmPerK.toFixed(1)} pm/K` },
                  { label: S.rShift, value: `${analysis.shiftNm.toFixed(2)} nm` },
                  { label: S.rT, value: fmtT(analysis.tRes) },
                  { label: S.rDiff, value: Math.abs(state.a - state.r).toFixed(3) },
                ]}
              />
            )}
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
