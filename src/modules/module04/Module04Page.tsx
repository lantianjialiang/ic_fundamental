import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg, type Note } from '../fund/parts'
import {
  FAULTS,
  FORCE_UA,
  INTRO,
  MODES,
  OPENS_SETUP,
  PMU_MORE,
  QUIZ,
  SIDES,
  TAKEAWAY,
  VERDICT,
  VMAX,
  judge,
  zoneOf,
  type Fault,
  type PinSide,
  type PmuMode,
} from './data/content'
import { LevelFig, OpensMiniFig, PmuModeFig } from './Module04Figs'
import './module04.css'

type Module04PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

export function Module04Page({ moduleId, onModuleChange }: Module04PageProps) {
  const { t } = useLocale()
  const [side, setSide] = useState<PinSide>('input')
  const [volts, setVolts] = useState(1.2)
  const [mode, setMode] = useState<PmuMode>('fimv')
  const [fault, setFault] = useState<Fault>('good')
  const [note, setNote] = useState<Note>({ kicker: ui.m04.kickerScale, title: SIDES.input.label, text: SIDES.input.text })

  const s = SIDES[side]
  const zone = zoneOf(side, volts)
  const zoneText = zone === 'mid' ? (side === 'input' ? ui.m04.midIn : ui.m04.midOut) : null
  const faultItem = FAULTS.find((f) => f.id === fault) ?? FAULTS[0]
  const verdict = judge(faultItem.volt)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m04.title)}
      goal={t(ui.m04.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      nextId="spec"
      nextLabel={t(ui.m04.next)}
    >
      <Section title={t(ui.m04.introTitle)}>
        <p>{t(INTRO)}</p>
      </Section>

      <Section title={t(ui.m04.scaleTitle)} note={t(ui.m04.scaleNote)}>
        <Seg
          options={(['input', 'output'] as PinSide[]).map((id) => ({ id, label: SIDES[id].label }))}
          value={side}
          onChange={(id) => {
            setSide(id)
            setNote({ kicker: ui.m04.kickerScale, title: SIDES[id].label, text: SIDES[id].text })
          }}
        />
        <LevelFig side={side} volts={volts} />
        <div className="knob-row">
          <Knob label={ui.m04.pinVolt} value={Number(volts.toFixed(2))} unit="V" min={0} max={VMAX} step={0.05} onChange={setVolts} />
        </div>
        <Callout tone={zone === 'mid' ? 'bad' : 'ok'}>
          {zoneText
            ? t(zoneText)
            : `${t(ui.m04.reads)} ${zone === 'lo' ? s.sym[0] : s.sym[1]} (${zone === 'lo' ? `≤ ${s.loName} ${s.lo} V` : `≥ ${s.hiName} ${s.hi} V`})`}
        </Callout>
      </Section>

      <Section title={t(ui.m04.pmuTitle)} note={t(ui.m04.pmuNote)}>
        <Cards
          items={MODES}
          activeId={mode}
          cols={2}
          onPick={(item) => {
            setMode(item.id)
            setNote({ kicker: ui.m04.kickerPmu, title: item.title, text: item.text })
          }}
        />
        <PmuModeFig mode={mode} />
        <p className="intro__note">{t(PMU_MORE)}</p>
      </Section>

      <Section title={t(ui.m04.opensTitle)} note={t(ui.m04.opensNote)}>
        <Seg
          options={FAULTS.map((f) => ({ id: f.id, label: f.label }))}
          value={fault}
          onChange={(id) => {
            setFault(id)
            const f = FAULTS.find((item) => item.id === id)
            if (f) setNote({ kicker: ui.m04.kickerOpens, title: f.label, text: f.text })
          }}
        />
        <OpensMiniFig fault={fault} volt={faultItem.volt} />
        <Readout
          items={[
            { label: ui.m04.forced, value: `${FORCE_UA} µA` },
            { label: ui.m04.read, value: `${faultItem.volt.toFixed(3)} V`, state: verdict === 'pass' ? 'pass' : 'fail' },
            { label: ui.m04.verdict, value: verdict === 'pass' ? 'PASS' : 'FAIL', state: verdict === 'pass' ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone={verdict === 'pass' ? 'ok' : 'bad'}>{t(VERDICT[verdict])}</Callout>
        <p className="intro__note">{t(OPENS_SETUP)}</p>
      </Section>

      <Section title={t(ui.m04.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.m04.quizTitle)} note={t(ui.m04.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m04.yes)} no={t(ui.m04.no)} />
      </Section>
    </LessonFrame>
  )
}
