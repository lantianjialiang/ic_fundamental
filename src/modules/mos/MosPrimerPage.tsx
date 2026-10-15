import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { INTRO, JUNCTION, JUNCTION_LABEL, JUNCTION_SHORT, LATTICE, LATTICE_LABEL, NI, RC_LABEL, RC_MODES, S, TAKEAWAY, type LatticeId, type RcMode } from './data/mosPrimer'
import { QUIZ } from './data/mosPrimerQuiz'
import { MOS_META } from './meta'
import { PrimerCheck } from './PrimerCheck'
import { depletionScale, diodeCurrent, fmtI, fmtSci, junctionState, JunctionFig, LatticeFig, VBI } from './PrimerFigs'
import { RcFig, rcVoltage } from './PrimerFigs2'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MosPrimerPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [lattice, setLattice] = useState<LatticeId>(LATTICE[0].id)
  const [bias, setBias] = useState(0)
  const [rc, setRc] = useState<RcMode>(RC_MODES[0].id)
  const [rK, setRK] = useState(4.7)
  const [cU, setCU] = useState(10)
  const [note, setNote] = useState<PrepNote | null>(null)

  const latticeItem = LATTICE.find((l) => l.id === lattice) ?? LATTICE[0]
  const shown: PrepNote = note ?? { kicker: S.kickerLattice, title: latticeItem.title, text: latticeItem.text }

  // n × p = ni²，掺杂远大于 ni 时多子 ≈ 掺杂浓度
  const nConc = latticeItem.nd > 0 ? latticeItem.nd : latticeItem.na > 0 ? (NI * NI) / latticeItem.na : NI
  const pConc = (NI * NI) / nConc

  const jState = junctionState(bias)
  const jItem = JUNCTION[jState]
  const current = diodeCurrent(bias)

  const rcItem = RC_MODES.find((m) => m.id === rc) ?? RC_MODES[0]
  // kΩ × µF = ms
  const tau = rK * cU
  const v1 = rcVoltage(rc, tau, tau)
  const t99 = tau * Math.log(100)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosPrimer.title)}
      goal={t(MOS_META.mosPrimer.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="mosIntro"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.checkTitle)} note={t(S.checkNote)}>
        <PrimerCheck onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.latticeTitle)} note={t(S.latticeNote)}>
        <Seg
          options={LATTICE.map((l) => ({ id: l.id, label: l.label }))}
          value={lattice}
          onChange={(id) => {
            setLattice(id)
            setNote(null)
          }}
        />
        <LatticeFig id={lattice} />
        <Readout
          items={[
            { label: LATTICE_LABEL.nConc, value: `${fmtSci(nConc)} cm⁻³` },
            { label: LATTICE_LABEL.pConc, value: `${fmtSci(pConc)} cm⁻³` },
            { label: 'n × p', value: `${fmtSci(nConc * pConc)} cm⁻⁶` },
          ]}
        />
        <Callout>
          <p>
            <b>{t(latticeItem.title)}</b>
          </p>
          <p>{t(latticeItem.detail)}</p>
        </Callout>
        <Related ids={['pSilicon', 'mosChannel', 'mosIntro']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.junctionTitle)} note={t(S.junctionNote)}>
        <div className="knob-row">
          <Knob
            label={S.bias}
            value={bias}
            unit="V"
            min={-3}
            max={VBI}
            step={0.05}
            onChange={(v) => {
              const next = Math.round(v * 100) / 100
              setBias(next)
              const item = JUNCTION[junctionState(next)]
              setNote({ kicker: S.kickerJunction, title: item.title, text: item.text })
            }}
          />
        </div>
        <JunctionFig v={bias} />
        <Readout
          items={[
            { label: JUNCTION_LABEL.barrier, value: `${Math.max(VBI - bias, 0).toFixed(2)} V` },
            { label: JUNCTION_LABEL.width, value: `× ${depletionScale(bias).toFixed(2)}` },
            { label: JUNCTION_LABEL.current, value: fmtI(current) },
            { label: JUNCTION_LABEL.state, value: t(JUNCTION_SHORT[jState]), state: jState === 'fwdOn' ? 'pass' : jState === 'rev' ? 'fail' : undefined },
          ]}
        />
        <Callout tone={jItem.tone}>
          <p>
            <b>{t(jItem.title)}</b>
          </p>
          <p>{t(jItem.text)}</p>
        </Callout>
        <Related ids={['pParts', 'fOpens', 'mosReal', 'fLatch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.rcTitle)} note={t(S.rcNote)}>
        <Seg
          options={RC_MODES.map((m) => ({ id: m.id, label: m.label }))}
          value={rc}
          onChange={(id) => {
            setRc(id)
            const item = RC_MODES.find((m) => m.id === id)
            if (item) {
              setNote({ kicker: S.kickerRc, title: item.title, text: item.text })
            }
          }}
        />
        <div className="knob-row">
          <Knob label={S.rKnob} value={rK} unit="kΩ" min={1} max={10} step={0.1} onChange={setRK} />
          <Knob label={S.cKnob} value={cU} unit="µF" min={1} max={20} step={1} onChange={setCU} />
        </div>
        <RcFig mode={rc} tau={tau} />
        <Readout
          items={[
            { label: RC_LABEL.tau, value: `${tau.toFixed(1)} ms` },
            { label: RC_LABEL.at1, value: `${v1.toFixed(2)} V` },
            { label: RC_LABEL.t99, value: `${t99.toFixed(0)} ms` },
          ]}
        />
        <Callout tone="warn">
          <p>
            <b>{t(rcItem.title)}</b>
          </p>
          <RefP text={rcItem.text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pParts', 'pMeasure', 'mosDynamic', 'timing']} onOpen={onModuleChange} />
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
