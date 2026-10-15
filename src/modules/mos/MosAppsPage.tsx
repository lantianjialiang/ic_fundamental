import { useState, type ReactElement } from 'react'
import { LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related, type PrepNote } from '../prep/common'
import { type FigProps } from './AppsFigs'
import { GpioFig, LoadSwFig } from './AppsFigs2'
import { I2cFig, RevPolFig } from './AppsFigs3'
import { OdFig } from './AppsFigs4'
import { HBridgeFig } from './AppsFigs5'
import { SoftFig, SoftWaveFig } from './AppsFigs6'
import { defaultNum, defaultSel, INTRO, S, TAKEAWAY, type CircuitDef, type CircuitId } from './data/mosApps'
import { CIRCUITS } from './data/mosAppsList'
import { QUIZ } from './data/mosAppsQuiz'
import { MOS_META } from './meta'
import './mosApps.css'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const FIGS: Record<CircuitId, (p: FigProps) => ReactElement> = {
  gpio: GpioFig,
  loadSw: LoadSwFig,
  revPol: RevPolFig,
  i2c: I2cFig,
  openDrain: OdFig,
  hBridge: HBridgeFig,
  softStart: SoftFig,
}

const pickDef = (id: CircuitId): CircuitDef => CIRCUITS.find((c) => c.id === id) ?? CIRCUITS[0]

export function MosAppsPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [circuit, setCircuit] = useState<CircuitId>(CIRCUITS[0].id)
  const [sel, setSel] = useState(() => defaultSel(CIRCUITS[0]))
  const [num, setNum] = useState(() => defaultNum(CIRCUITS[0]))
  const [fault, setFault] = useState(CIRCUITS[0].faults[0].id)
  const [touched, setTouched] = useState(false)

  const def = pickDef(circuit)
  const out = def.solve(sel, num, fault)
  const Fig = FIGS[def.id]
  const shown: PrepNote = touched ? { kicker: S.kickerResult, title: out.title, text: out.text } : { kicker: S.kickerCircuit, title: def.label, text: def.func }

  const choose = (id: CircuitId) => {
    const next = pickDef(id)
    setCircuit(next.id)
    setSel(defaultSel(next))
    setNum(defaultNum(next))
    setFault(next.faults[0].id)
    setTouched(false)
  }

  const jump = (id: CircuitId) => {
    choose(id)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('mosApps-sim')?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
  }

  const parts = [
    { label: S.fFunc, text: def.func },
    { label: S.fPrinciple, text: def.principle },
    { label: S.fParams, text: def.params },
    { label: S.fPitfall, text: def.pitfall },
  ]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosApps.title)}
      goal={t(MOS_META.mosApps.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="mosReal"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['mosSwitch', 'mosReal', 'pParts', 'dc', 'connection', 'fProgram']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.pickTitle)} note={t(S.pickNote)}>
        <Cards
          items={CIRCUITS.map((c) => ({ id: c.id, title: c.label, sub: c.short, text: c.func }))}
          activeId={circuit}
          cols={4}
          onPick={(item) => choose(item.id as CircuitId)}
        />
        <Callout>
          {parts.map((part) => (
            <p key={part.label.zh} className="mosApps-part">
              <b>{t(part.label)}</b>
              <LessonRefText text={part.text} onOpenLesson={onModuleChange} />
            </p>
          ))}
        </Callout>
      </Section>

      <div id="mosApps-sim">
        <Section title={t(S.simTitle)} note={t(S.simNote)}>
          {def.inputs
            .filter((input) => !input.when || input.when(sel))
            .map((input) => (
              <div key={input.id} className="mosApps-row">
                <b>{t(input.label)}</b>
                <Seg
                  options={input.options}
                  value={sel[input.id]}
                  onChange={(id) => {
                    setSel({ ...sel, [input.id]: id })
                    setTouched(true)
                  }}
                />
              </div>
            ))}
          {def.knobs.length > 0 ? (
            <div className="knob-row">
              {def.knobs.map((k) => (
                <Knob
                  key={k.id}
                  label={k.label}
                  value={num[k.id]}
                  unit={k.unit}
                  min={k.min}
                  max={k.max}
                  step={k.step}
                  onChange={(v) => {
                    setNum({ ...num, [k.id]: v })
                    setTouched(true)
                  }}
                />
              ))}
            </div>
          ) : null}
          <div className="mosApps-row mosApps-row--fault">
            <b>{t(S.faultLabel)}</b>
            <Seg
              options={def.faults}
              value={fault}
              onChange={(id) => {
                setFault(id)
                setTouched(true)
              }}
            />
          </div>
          <Fig sel={sel} num={num} fault={fault} out={out} />
          {def.id === 'softStart' ? <SoftWaveFig num={num} fault={fault} /> : null}
          <Readout items={out.reads} />
          <Callout tone={out.tone}>
            <p>
              <b>{t(out.title)}</b>
            </p>
            <p>{t(out.text)}</p>
          </Callout>
          <Related ids={['mosSwitch', 'mosReal', 'pParts']} onOpen={onModuleChange} />
        </Section>
      </div>

      <Section title={t(S.tableTitle)} note={t(S.tableNote)}>
        <div className="prep-table-wrap">
          <table className="prep-table">
            <thead>
              <tr>
                <th>{t(S.thCircuit)}</th>
                <th>{t(S.thPart)}</th>
                <th>{t(S.thParam)}</th>
                <th>{t(S.thPit)}</th>
              </tr>
            </thead>
            <tbody>
              {CIRCUITS.map((c) => (
                <tr key={c.id}>
                  <td>
                    <button type="button" className="mosApps-link" onClick={() => jump(c.id)}>
                      {c.id === circuit ? <b>{t(c.short)}</b> : t(c.short)}
                    </button>
                  </td>
                  <td>{t(c.row.part)}</td>
                  <td>{t(c.row.param)}</td>
                  <td>{t(c.row.pit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Related ids={['dc', 'connection', 'fProgram']} onOpen={onModuleChange} />
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
