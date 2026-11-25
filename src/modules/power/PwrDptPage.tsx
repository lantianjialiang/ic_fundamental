import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { ScopeView, type ScopeTrace } from './ScopeView'
import { PWR_META } from './meta'
import { DptCircuitFig } from './PwrDptFig'
import { DPT_DEFAULT, VDRIVE, energy, simulateDpt, type DptState, type WinKey } from './pwrDptModel'
import { fill, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, WIN_SEG, taskItems, verdictOf } from './pwrDptData'
import './pwrDpt.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }
type DptStage = WinKey | 'recovery'
const RECOVERY = loc('反向恢复区间', 'Reverse recovery window')
const STAGES = [...WIN_SEG, { id: 'recovery' as const, label: RECOVERY }]

export function PwrDptPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<DptState>(DPT_DEFAULT)
  const [selectedStage, setStage] = useState<DptStage>(WIN_SEG[0].id)
  const result = useMemo(() => simulateDpt(state), [state])
  const verdict = verdictOf(state, result)
  const update = (patch: Partial<DptState>) => setState((prev) => ({ ...prev, ...patch }))
  const k = result.timing
  const stage = selectedStage === 'recovery' && k.tRr === 0 ? 'on' : selectedStage
  const win: WinKey = stage === 'off' ? 'off' : 'on'

  /* 三路归一化到各自满量程，才能放在同一坐标上 */
  const tNs = useMemo(() => result.wave.t.map((x) => x * 1e9), [result])
  const traces: ScopeTrace[] = [
    { id: 'vds', label: S.trVds, color: '#58a6ff', values: result.wave.vds.map((v) => v / state.vdc) },
    { id: 'id', label: S.trId, color: '#e8c45a', values: result.wave.id.map((v) => v / k.current) },
    { id: 'vgs', label: S.trVgs, color: '#3fb950', values: result.wave.vgs.map((v) => v / VDRIVE) },
  ]
  const [winFrom, winTo] = result.windows[win]
  const winEnergy = win === 'off' ? result.eoff : result.eon
  const recoveryFrom = result.windows.on[0] + k.tRi
  const recoveryTo = recoveryFrom + k.tRr
  const recoveryBand = win === 'on' ? { from: recoveryFrom * 1e9, to: recoveryTo * 1e9, label: RECOVERY } : undefined
  const shade = { from: winFrom * 1e9, to: winTo * 1e9, label: win === 'off' ? S.winOffLabel : S.winOnLabel }
  const power = result.wave.vds.map((voltage, index) => voltage * result.wave.id[index] / 1e3)
  const area = stage === 'recovery' && recoveryBand ? recoveryBand : shade
  const areaEnergy = stage === 'recovery' ? energy(result.wave, [recoveryFrom, recoveryTo]) : winEnergy
  const areaHint = stage === 'recovery'
    ? loc('这段面积已包含在 Eon 内，其中还包含负载电流的功耗。', 'Eon already includes this area, which also contains power due to load current.')
    : loc('时窗外的功率不计入这一读数。', 'Power outside the window is excluded.')
  const scopeSummary = t(
    fill(
      S.scopeSummary,
      result.vdsPeak.toFixed(0),
      state.vdc.toFixed(0),
      result.idPeak.toFixed(1),
      k.current.toFixed(1),
      t(WIN_SEG.find((item) => item.id === win)?.label ?? WIN_SEG[0].label),
      ((winTo - winFrom) * 1e9).toFixed(1),
      (winEnergy * 1e6).toFixed(1),
    ),
  )

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PWR_META.pwrDpt.title)}
      goal={t(PWR_META.pwrDpt.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="pwrUis"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, result)} onReset={() => setState(DPT_DEFAULT)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pwrGate', 'pwrKelvin', 'pwrUis']} onOpen={onModuleChange} />
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
        <PracticeSteps items={taskItems(state, result)} />

        <div className="hs-controls">
          <Knob label={S.kVdc} value={state.vdc} unit="V" min={50} max={800} step={10} onChange={(vdc) => update({ vdc })} />
          <Knob label={S.kL} value={state.lUh} unit="µH" min={10} max={500} step={10} onChange={(lUh) => update({ lUh })} />
          <Knob label={S.kT1} value={state.t1Us} unit="µs" min={1} max={15} step={0.5} onChange={(t1Us) => update({ t1Us })} />
          <Knob label={S.kRg} value={state.rg} unit="Ω" min={1} max={50} step={1} onChange={(rg) => update({ rg })} />
          <Knob label={S.kLs} value={state.lstrayNh} unit="nH" min={1} max={50} step={1} onChange={(lstrayNh) => update({ lstrayNh })} />
          <Knob label={S.kQrr} value={state.qrrNc} unit="nC" min={0} max={500} step={10} onChange={(qrrNc) => update({ qrrNc })} />
          <Knob label={S.kBw} value={state.bwMhz} unit="MHz" min={100} max={1000} step={50} onChange={(bwMhz) => update({ bwMhz })} />
          <Knob label={S.kDeskew} value={state.deskewNs} unit="ns" min={0} max={10} step={0.5} onChange={(deskewNs) => update({ deskewNs })} />
        </div>

        <div className="hs-grid">
          <div className="pwr-dpt-figs">
            <Seg options={k.tRr > 0 ? STAGES : WIN_SEG} value={stage} onChange={setStage} />
            <DptCircuitFig stage={stage} />
            <ScopeView
              t={tNs}
              tUnit="ns"
              traces={traces}
              shade={shade}
              band={recoveryBand}
              summary={scopeSummary}
              ariaLabel={t(S.scopeAria)}
            />
            <ScopeView
              t={tNs}
              tUnit="ns"
              yUnit="kW"
              traces={[{ id: 'power', label: loc('瞬时功率 VDS × ID', 'Instantaneous power VDS × ID'), color: '#ed766e', values: power }]}
              shade={shade}
              band={recoveryBand}
              area={{ traceId: 'power', from: area.from, to: area.to }}
              ariaLabel={t(loc('双脉冲开关功率与积分面积', 'Double-pulse switching power and integration area'))}
              summary={`${t(loc('填色部分的能量', 'Energy in the filled area'))} ∫ VDS × ID dt ≈ ${(areaEnergy * 1e6).toFixed(1)} µJ. ${t(areaHint)}`}
            />
            <p className="pwr-dpt-note">{t(S.scopeNote)}</p>
            <p className="pwr-dpt-note">{t(win === 'on'
              ? loc(`理想模型中，恢复期间母线功率包含负载项 Vdc × I × trr ≈ ${(state.vdc * k.current * k.tRr * 1e6).toFixed(1)} µJ 和超额恢复项 Vdc × Qrr ≈ ${(state.vdc * k.qrr * 1e6).toFixed(1)} µJ。右侧开通简式包含超额恢复项。`,
                `In the ideal model, the recovery interval includes the load term Vdc × I × trr ≈ ${(state.vdc * k.current * k.tRr * 1e6).toFixed(1)} µJ and the excess recovery term Vdc × Qrr ≈ ${(state.vdc * k.qrr * 1e6).toFixed(1)} µJ. The simplified turn-on formula includes the excess term.`)
              : loc(`关断简式只算额定母线电压下的重叠面积。理想过冲另外贡献 ΔV × I × tfi / 3 ≈ ${((result.eoffAnalytic - result.eoffFormula) * 1e6).toFixed(1)} µJ。`,
                `The simplified turn-off formula uses the nominal bus voltage. Ideal overshoot adds ΔV × I × tfi / 3 ≈ ${((result.eoffAnalytic - result.eoffFormula) * 1e6).toFixed(1)} µJ.`))}</p>
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rCurrent, value: `${k.current.toFixed(1)} A` },
                { label: S.rDiDt, value: `${(k.diDt / 1e9).toFixed(2)} A/ns` },
                { label: S.rDvDt, value: `${(k.dvDt / 1e9).toFixed(2)} V/ns` },
                { label: S.rOvershoot, value: `${k.overshoot.toFixed(1)} V` },
                { label: S.rEon, value: `${(result.eon * 1e6).toFixed(1)} µJ` },
                { label: S.rEoff, value: `${(result.eoff * 1e6).toFixed(1)} µJ` },
                { label: S.rEonErr, value: `${result.eonErrPct.toFixed(1)} %` },
                { label: S.rEoffErr, value: `${result.eoffErrPct.toFixed(1)} %` },
                { label: S.rEonFormula, value: `${(result.eonFormula * 1e6).toFixed(1)} µJ` },
                { label: S.rEoffFormula, value: `${(result.eoffFormula * 1e6).toFixed(1)} µJ` },
              ]}
            />
            <p className="pwr-dpt-note">{t(S.formulaNote)}</p>
            <p className="pwr-dpt-note">{t(S.errNote)}</p>
          </div>
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
