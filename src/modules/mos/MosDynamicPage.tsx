import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { CAPS, DS, INTRO, MILLER, PHASES, QG_LABEL, S, type DsId } from './data/mosDynamic'
import { CMOS_EDGES, CMOS_LABEL, CMOS_TEXT, CMOS_WIDTHS, DRIVE_LABEL, DRIVERS, EDGES, RG_LABEL, RG_PRESETS, SCOPE_LABEL, TAKEAWAY, type CmosEdge, type DriverId, type RgId } from './data/mosDynamicScope'
import { QUIZ } from './data/mosDynamicQuiz'
import { calcEdge, CGD, CGS, CDS, edgeEnergy, gateCurrent, ILOAD, lossEstimate, QGD, QGS, qgTotal, VDD_P, VDRIVE0, type DynParams, type Edge } from './dynamicModel'
import { CapFig, DS_VALUE, fmtEnergy, fmtPf, fmtPower, fmtTime, TurnOnFig } from './DynamicFigs'
import { CmosFig, QgFig, ScopeFig } from './DynamicFigs2'
import { MOS_META } from './meta'
import { rOn, VDD } from './model'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const RG_FIXED = { cx: 100e-12, vdrive: 10 }

export function MosDynamicPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [ds, setDs] = useState<DsId>(DS[0].id)
  const phases = useStepPlayer(PHASES.length, 2400)
  const [qgV, setQgV] = useState(VDRIVE0)
  const [edge, setEdge] = useState<Edge>(EDGES[0].id)
  const [rg, setRg] = useState(10)
  const [cxPf, setCxPf] = useState(100)
  const [vdrive, setVdrive] = useState(VDRIVE0)
  const [freqK, setFreqK] = useState(100)
  const [driver, setDriver] = useState<DriverId>(DRIVERS[0].id)
  const [rgPick, setRgPick] = useState<RgId>(RG_PRESETS[0].id)
  const [cmosEdge, setCmosEdge] = useState<CmosEdge>(CMOS_EDGES[0].id)
  const [width, setWidth] = useState(CMOS_WIDTHS[0].id)
  const [clPf, setClPf] = useState(10)
  const [note, setNote] = useState<PrepNote | null>(null)

  const dsItem = DS.find((d) => d.id === ds) ?? DS[0]
  const shown: PrepNote = note ?? { kicker: S.kickerCap, title: dsItem.title, text: dsItem.text }

  const phasePlayer = {
    ...phases,
    next: () => {
      const i = Math.min(phases.step + 1, PHASES.length - 1)
      setNote({ kicker: S.kickerMiller, title: PHASES[i].title, text: PHASES[i].text })
      phases.next()
    },
    goTo: (i: number) => {
      setNote({ kicker: S.kickerMiller, title: PHASES[i].title, text: PHASES[i].text })
      phases.goTo(i)
    },
    toggle: () => {
      setNote(null)
      phases.toggle()
    },
  }
  const phase = PHASES[phases.step]

  const params: DynParams = { rg, cx: cxPf * 1e-12, vdrive }
  const on = calcEdge(params, 'on')
  const off = calcEdge(params, 'off')
  const cur = edge === 'on' ? on : off
  const edgeItem = EDGES.find((e) => e.id === edge) ?? EDGES[0]
  const eOn = edgeEnergy(on)
  const eOff = edgeEnergy(off)
  const freq = freqK * 1e3
  const pInt = (eOn + eOff) * freq
  const qgSum = qgTotal(qgV)

  const driverItem = DRIVERS.find((d) => d.id === driver) ?? DRIVERS[0]
  const igRaw = driverItem.vdrive / rg
  const ig = gateCurrent(driverItem.vdrive, rg, driverItem.limit)
  const qgDrv = qgTotal(driverItem.vdrive)

  const rgItem = RG_PRESETS.find((r) => r.id === rgPick) ?? RG_PRESETS[0]
  const rgRows = RG_PRESETS.map((r) => {
    const p: DynParams = { rg: r.rg, ...RG_FIXED }
    const a = calcEdge(p, 'on')
    const b = calcEdge(p, 'off')
    const slewV = a.slew * 1e-9
    return { r, a, slewV, didt: (ILOAD / (a.marks[1] - a.marks[0])) * 1e-9, esw: edgeEnergy(a) + edgeEnergy(b), ring: slewV > 5 ? RG_LABEL.high : slewV > 1 ? RG_LABEL.mid : RG_LABEL.low }
  })

  const widthItem = CMOS_WIDTHS.find((w) => w.id === width) ?? CMOS_WIDTHS[0]
  const ron = rOn(VDD) / widthItem.mult
  const tau = ron * clPf * 1e-12
  const cmosItem = CMOS_EDGES.find((e) => e.id === cmosEdge) ?? CMOS_EDGES[0]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosDynamic.title)}
      goal={t(MOS_META.mosDynamic.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="mosApps"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.capTitle)} note={t(S.capNote)}>
        <CapFig
          active={ds}
          onPick={(id) => {
            setDs(id)
            const item = DS.find((d) => d.id === id) ?? DS[0]
            setNote({ kicker: S.kickerCap, title: item.title, text: item.text })
          }}
        />
        <Readout
          items={[
            { label: 'Cgs', value: fmtPf(CGS) },
            { label: 'Cgd', value: fmtPf(CGD) },
            { label: 'Cds', value: fmtPf(CDS) },
            { label: dsItem.name, value: fmtPf(DS_VALUE[dsItem.id]) },
          ]}
        />
        <Callout>
          <p>
            <b>{t(dsItem.title)}</b>
          </p>
          <p>{t(dsItem.text)}</p>
          {CAPS.filter((c) => dsItem.caps.includes(c.id)).map((c) => (
            <p key={c.id}>
              <b>{`${c.name}: `}</b>
              {t(c.title)}
            </p>
          ))}
        </Callout>
        <p className="lab__hint">{t(S.illusCap)}</p>
        <Related ids={['mosChannel', 'mosSelect', 'mosInverter']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.milTitle)} note={t(S.milNote)}>
        <TurnOnFig step={phases.step} />
        <StepControls player={phasePlayer} stepLabels={PHASES.map((p) => p.title)} />
        <Callout>
          <p>
            <b>{`${phases.step + 1}. ${t(phase.title)}`}</b>
          </p>
          <p>{t(phase.text)}</p>
        </Callout>
        <div className="knob-row">
          <Knob label={QG_LABEL.vdrive} value={qgV} unit="V" min={4} max={12} step={0.5} onChange={setQgV} />
        </div>
        <QgFig vdrive={qgV} />
        <Readout
          items={[
            { label: 'Qgs', value: `${(QGS * 1e9).toFixed(1)} nC` },
            { label: 'Qgd', value: `${(QGD * 1e9).toFixed(1)} nC` },
            { label: QG_LABEL.rest, value: `${((qgSum - QGS - QGD) * 1e9).toFixed(1)} nC` },
            { label: QG_LABEL.total, value: `${(qgSum * 1e9).toFixed(1)} nC` },
          ]}
        />
        <Callout tone="warn">
          <RefParas paras={MILLER} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['mosRegion', 'mosSelect', 'mosSwitch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.scopeTitle)} note={t(S.scopeNote)}>
        <Seg
          options={EDGES.map((e) => ({ id: e.id, label: e.label }))}
          value={edge}
          onChange={(id) => {
            setEdge(id)
            const item = EDGES.find((e) => e.id === id) ?? EDGES[0]
            setNote({ kicker: S.kickerScope, title: item.title, text: item.text })
          }}
        />
        <div className="knob-row">
          <Knob label={SCOPE_LABEL.rg} value={rg} unit="Ω" min={2} max={100} step={1} onChange={setRg} />
          <Knob label={SCOPE_LABEL.cx} value={cxPf} unit="pF" min={0} max={500} step={10} onChange={setCxPf} />
          <Knob label={SCOPE_LABEL.vdrive} value={vdrive} unit="V" min={4} max={12} step={0.5} onChange={setVdrive} />
          <Knob label={SCOPE_LABEL.freq} value={freqK} unit="kHz" min={10} max={500} step={10} onChange={setFreqK} />
        </div>
        <ScopeFig params={params} edge={edge} />
        <Readout
          items={[
            { label: SCOPE_LABEL.plateau, value: fmtTime(cur.tPlat) },
            { label: SCOPE_LABEL.tr, value: fmtTime(on.tCross) },
            { label: SCOPE_LABEL.tf, value: fmtTime(off.tCross) },
            { label: SCOPE_LABEL.tpd, value: fmtTime(cur.tpd) },
          ]}
        />
        <Readout
          items={[
            { label: SCOPE_LABEL.slew, value: `${(cur.slew * 1e-9).toFixed(2)} V/ns` },
            { label: SCOPE_LABEL.ig, value: `${(vdrive / rg).toFixed(2)} A` },
            { label: SCOPE_LABEL.eOn, value: fmtEnergy(eOn) },
            { label: SCOPE_LABEL.eOff, value: fmtEnergy(eOff) },
          ]}
        />
        <Readout
          items={[
            { label: SCOPE_LABEL.pEst, value: fmtPower(lossEstimate(on, off, freq)) },
            { label: SCOPE_LABEL.pInt, value: fmtPower(pInt) },
          ]}
        />
        <Callout tone="warn">
          <p>
            <b>{t(edgeItem.title)}</b>
          </p>
          <p>{t(edgeItem.text)}</p>
          <p>{t(edgeItem.note)}</p>
          <p className="lab__hint">{`${t(S.illus)}: Qgs 2 nC, Qgd 3 nC, Vpl 2.5 V, Vth 1.5 V, VDD ${VDD_P} V, ${ILOAD} A`}</p>
        </Callout>
        <Related ids={['timing', 'fAc', 'pMeasure']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.driveTitle)} note={t(S.driveNote)}>
        <Seg
          options={DRIVERS.map((d) => ({ id: d.id, label: d.name }))}
          value={driver}
          onChange={(id) => {
            setDriver(id)
            const item = DRIVERS.find((d) => d.id === id) ?? DRIVERS[0]
            setNote({ kicker: S.kickerDrive, title: item.name, text: item.text })
          }}
        />
        <Readout
          items={[
            { label: DRIVE_LABEL.vdrive, value: `${driverItem.vdrive} V` },
            { label: DRIVE_LABEL.rg, value: `${rg} Ω` },
            { label: DRIVE_LABEL.ig, value: ig >= 1 ? `${ig.toFixed(2)} A` : `${(ig * 1000).toFixed(0)} mA` },
            { label: DRIVE_LABEL.limitedBy, value: t(igRaw > driverItem.limit ? DRIVE_LABEL.byDriver : DRIVE_LABEL.byRg) },
            { label: DRIVE_LABEL.qg, value: `${(qgDrv * 1e9).toFixed(1)} nC` },
            { label: DRIVE_LABEL.tq, value: fmtTime(qgDrv / ig) },
          ]}
        />
        <Callout>
          <p>
            <b>{t(driverItem.name)}</b>
          </p>
          <RefP text={driverItem.text} onOpen={onModuleChange} />
        </Callout>
        <Seg
          options={RG_PRESETS.map((r) => ({ id: r.id, label: r.label }))}
          value={rgPick}
          onChange={(id) => {
            setRgPick(id)
            const item = RG_PRESETS.find((r) => r.id === id) ?? RG_PRESETS[0]
            setNote({ kicker: S.kickerDrive, title: item.label, text: item.text })
          }}
        />
        <div className="prep-table-wrap">
          <table className="prep-table">
            <thead>
              <tr>
                <th>Rg</th>
                <th>{t(RG_LABEL.tpd)}</th>
                <th>{t(RG_LABEL.cross)}</th>
                <th>{t(RG_LABEL.slew)}</th>
                <th>{t(RG_LABEL.didt)}</th>
                <th>{t(RG_LABEL.esw)}</th>
                <th>{t(RG_LABEL.ring)}</th>
              </tr>
            </thead>
            <tbody>
              {rgRows.map((row) => {
                const sel = row.r.id === rgPick
                const cell = (text: string) => (sel ? <b>{text}</b> : text)
                return (
                  <tr key={row.r.id}>
                    <td>{cell(`${row.r.rg} Ω`)}</td>
                    <td>{cell(fmtTime(row.a.tpd))}</td>
                    <td>{cell(fmtTime(row.a.tCross))}</td>
                    <td>{cell(`${row.slewV.toFixed(1)} V/ns`)}</td>
                    <td>{cell(`${row.didt.toFixed(1)} A/ns`)}</td>
                    <td>{cell(fmtEnergy(row.esw))}</td>
                    <td>{cell(t(row.ring))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="lab__hint">{t(RG_LABEL.unitNote)}</p>
        <Callout tone="warn">
          <p>
            <b>{t(rgItem.label)}</b>
          </p>
          <p>{t(rgItem.text)}</p>
        </Callout>
        <Related ids={['mosSelect', 'mosApps', 'mosSwitch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.cmosTitle)} note={t(S.cmosNote)}>
        <Seg
          options={CMOS_EDGES}
          value={cmosEdge}
          onChange={(id) => {
            setCmosEdge(id)
            const item = CMOS_EDGES.find((e) => e.id === id) ?? CMOS_EDGES[0]
            setNote({ kicker: S.kickerCmos, title: item.label, text: CMOS_TEXT.why })
          }}
        />
        <Seg options={CMOS_WIDTHS} value={width} onChange={setWidth} />
        <div className="knob-row">
          <Knob label={CMOS_LABEL.cl} value={clPf} unit="pF" min={1} max={100} step={1} onChange={setClPf} />
        </div>
        <CmosFig edge={cmosEdge} tau={tau} />
        <Readout
          items={[
            { label: CMOS_LABEL.ron, value: `${ron.toFixed(0)} Ω` },
            { label: CMOS_LABEL.tau, value: fmtTime(tau) },
            { label: CMOS_LABEL.tpd, value: fmtTime(Math.LN2 * tau) },
            { label: CMOS_LABEL.tr, value: fmtTime(2.2 * tau) },
            { label: CMOS_LABEL.energy, value: `${(clPf * 1e-12 * VDD * VDD * 1e12).toFixed(0)} pJ` },
          ]}
        />
        <Callout>
          <p>
            <b>{t(cmosItem.label)}</b>
          </p>
          <RefP text={CMOS_TEXT.why} onOpen={onModuleChange} />
          <RefP text={CMOS_TEXT.energy} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['mosInverter', 'timing', 'fAc', 'mosGates']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
