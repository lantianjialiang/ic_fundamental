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
import { ScopeView, type ScopeTrace } from './ScopeView'
import { PWR_META } from './meta'
import { fill } from './pwrDptData'
import { SoaPlot, UisCircuitFig } from './PwrUisFig'
import { PULSE_SEG, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, uisVerdictOf, soaVerdictOf, type PulseKey } from './pwrUisData'
import { SOA_BV, SOA_IDMAX, UIS_DEFAULT, simulateUis, soaBounds, soaCurves, thermalReadout, type UisState } from './pwrUisModel'
import './pwrUis.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PwrUisPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [uis, setUis] = useState<UisState>(UIS_DEFAULT)
  const [pulse, setPulse] = useState<PulseKey>(PULSE_SEG[0].id)
  const [vds, setVds] = useState(50)
  const [iop, setIop] = useState(10)
  const [tcase, setTcase] = useState(25)
  const [pw, setPw] = useState(100)
  const [tMs, setTMs] = useState(1)

  const pulseSec = (PULSE_SEG.find((item) => item.id === pulse) ?? PULSE_SEG[0]).sec
  const uisRes = useMemo(() => simulateUis(uis), [uis])
  const bounds = useMemo(() => soaBounds({ tPulse: pulseSec, vds, tcase }), [pulseSec, vds, tcase])
  const soa = soaVerdictOf(vds, iop, pulseSec, tcase)
  const curves = useMemo(() => soaCurves(pulseSec, tcase), [pulseSec, tcase])
  const thermal = thermalReadout(pw, tMs * 1e-3)

  const updateUis = (patch: Partial<UisState>) => setUis((prev) => ({ ...prev, ...patch }))

  /* 说明栏：先看 UIS 参数，UIS 通过后再看 SOA 工作点 */
  const verdict =
    !uisRes.valid || !uisRes.pass || soa.ok
      ? uisVerdictOf(uis, uisRes)
      : {
          title: S.vSoaFailT,
          text: fill(S.vSoaFailX, iop.toFixed(0), soa.allowed.toFixed(1), t(soa.binding)),
        }

  const uisScope: ScopeTrace[] = uisRes.valid
    ? [
        { id: 'id', label: S.trId, color: '#e8c45a', values: uisRes.wave.id.map((v) => v / uis.ipk) },
        { id: 'vds', label: S.trVds, color: '#58a6ff', values: uisRes.wave.vds.map((v) => v / uis.bv) },
      ]
    : []
  const uisTimeUs = uisRes.wave.t.map((x) => x * 1e6)
  const uisSummary = uisRes.valid
    ? t(
        fill(
          S.uisScopeSummary,
          (uisRes.tav * 1e6).toFixed(0),
          uis.ipk.toFixed(1),
          uis.bv.toFixed(0),
          uisRes.eas.toFixed(3),
          uis.ratedE.toFixed(2),
        ),
      )
    : ''

  const soaSummary = t(
    fill(
      S.soaSummary,
      vds.toFixed(0),
      iop.toFixed(1),
      t((PULSE_SEG.find((item) => item.id === pulse) ?? PULSE_SEG[0]).label),
      soa.allowed.toFixed(1),
      t(soa.binding),
      t(soa.ok ? S.opOk : S.opBad),
    ),
  )

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PWR_META.pwrUis.title)}
      goal={t(PWR_META.pwrUis.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="pwrWbg"
      nextLabel={t(S.next)}
      extra={
        <TaskList
          items={taskItems(uis, uisRes, pulseSec, pw, tMs)}
          onReset={() => {
            setUis(UIS_DEFAULT)
            setPulse(PULSE_SEG[0].id)
            setVds(50)
            setIop(10)
            setTcase(25)
            setPw(100)
            setTMs(1)
          }}
        />
      }
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pwrDpt', 'pwrStatic', 'pwrKelvin']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.uisTitle)} note={t(S.uisNote)}>
        <div className="hs-controls">
          <Knob label={S.kL} value={uis.lMh} unit="mH" min={0.1} max={10} step={0.1} onChange={(lMh) => updateUis({ lMh })} />
          <Knob label={S.kIpk} value={uis.ipk} unit="A" min={1} max={100} step={1} onChange={(ipk) => updateUis({ ipk })} />
          <Knob label={S.kVdd} value={uis.vdd} unit="V" min={0} max={200} step={5} onChange={(vdd) => updateUis({ vdd })} />
          <Knob label={S.kBv} value={uis.bv} unit="V" min={60} max={200} step={5} onChange={(bv) => updateUis({ bv })} />
          <Knob label={S.kRated} value={uis.ratedE} unit="J" min={0.1} max={1} step={0.05} onChange={(ratedE) => updateUis({ ratedE })} />
        </div>

        <div className="hs-grid">
          <div className="pwr-uis-figs">
            <UisCircuitFig />
            {uisRes.valid ? (
              <ScopeView
                t={uisTimeUs}
                tUnit="µs"
                traces={uisScope}
                yRange={[0, 1.05]}
                shade={{ from: 0, to: uisRes.clampEnd * 1e6, label: S.uisShade }}
                summary={uisSummary}
                ariaLabel={t(S.uisScopeAria)}
              />
            ) : (
              <p className="pwr-uis-note">{t(S.invalid)}</p>
            )}
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                {
                  label: S.rEas,
                  value: uisRes.valid ? `${uisRes.eas.toFixed(3)} J` : '—',
                },
                {
                  label: S.rTav,
                  value: uisRes.valid ? `${(uisRes.tav * 1e6).toFixed(0)} µs` : '—',
                },
                {
                  label: S.rIpkMax,
                  value: uisRes.valid ? `${uisRes.ipkMax.toFixed(2)} A` : '—',
                },
                {
                  label: S.rUisVerdict,
                  value: t(uisRes.pass ? S.pass : S.fail),
                  state: uisRes.pass ? 'pass' : 'fail',
                },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.soaTitle)} note={t(S.soaNote)}>
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.kPulse)}</span>
            <Seg options={PULSE_SEG} value={pulse} onChange={setPulse} />
          </div>
          <Knob label={S.kVds} value={vds} unit="V" min={1} max={200} step={1} onChange={setVds} />
          <Knob label={S.kIop} value={iop} unit="A" min={1} max={150} step={1} onChange={setIop} />
          <Knob label={S.kTcase} value={tcase} unit="°C" min={25} max={125} step={5} onChange={setTcase} />
        </div>

        <div className="hs-grid">
          <div className="pwr-uis-figs">
            <SoaPlot
              curves={curves}
              op={{ vds, id: iop, ok: soa.ok }}
              labels={{
                rds: S.bRds,
                max: S.bMax,
                thermal: S.bThermal,
                bv: S.bBv,
                op: S.bOp,
                okText: S.opOk,
                badText: S.opBad,
              }}
              ariaLabel={t(S.soaAria)}
              caption={soaSummary}
            />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.bRds, value: `${bounds.rds.toFixed(1)} A` },
                { label: S.bMax, value: `${SOA_IDMAX} A` },
                { label: S.bThermal, value: `${bounds.thermal.toFixed(1)} A` },
                { label: S.bBv, value: `${SOA_BV} V` },
                { label: S.soaAllowed, value: `${soa.allowed.toFixed(1)} A` },
                { label: S.soaBinding, value: t(soa.binding) },
                {
                  label: S.soaVerdict,
                  value: t(soa.ok ? S.opOk : S.opBad),
                  state: soa.ok ? 'pass' : 'fail',
                },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.thermalTitle)} note={t(S.thermalNote)}>
        <div className="hs-controls">
          <Knob label={S.kP} value={pw} unit="W" min={10} max={200} step={10} onChange={setPw} />
          <Knob label={S.kT} value={tMs} unit="ms" min={0.1} max={10} step={0.1} onChange={setTMs} />
        </div>
        <div className="hs-cell">
          <Readout
            items={[
              { label: S.rZth, value: `${thermal.zth.toFixed(4)} K/W` },
              { label: S.rDT, value: `${thermal.dT.toFixed(2)} K` },
              { label: S.rSteady, value: `${thermal.steadyDT.toFixed(1)} K` },
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
