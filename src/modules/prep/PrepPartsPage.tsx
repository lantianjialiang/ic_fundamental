import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg, type ReadoutItem } from '../fund/parts'
import { RefParas, RefP, Related, type PrepNote } from './common'
import { DEMO_LABEL, DEMOS, INTRO, PARTS, QUIZ, S, TAKEAWAY, type DemoId, type PartId } from './data/parts'
import { DemoFig, R_SET, diodeI, fmtA, mosI, PartFig } from './PartsFigs'
import './prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const RANGE: Record<DemoId, { min: number; max: number; step: number; unit: string; start: number }> = {
  r: { min: 0, max: 5, step: 0.1, unit: 'V', start: 2.5 },
  rc: { min: 0, max: 5, step: 0.1, unit: 'τ', start: 1 },
  d: { min: 0, max: 0.8, step: 0.01, unit: 'V', start: 0.6 },
  mos: { min: 0, max: 5, step: 0.1, unit: 'V', start: 3 },
}

export function PrepPartsPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [part, setPart] = useState<PartId>(PARTS[0].id)
  const [demo, setDemo] = useState<DemoId>(DEMOS[0].id)
  const [values, setValues] = useState<Record<DemoId, number>>({ r: RANGE.r.start, rc: RANGE.rc.start, d: RANGE.d.start, mos: RANGE.mos.start })
  const [note, setNote] = useState<PrepNote | null>(null)

  const partItem = PARTS.find((p) => p.id === part) ?? PARTS[0]
  const demoItem = DEMOS.find((d) => d.id === demo) ?? DEMOS[0]
  const value = values[demo]
  const range = RANGE[demo]
  const shown: PrepNote = note ?? { kicker: S.kickerPart, title: partItem.title, text: partItem.text }

  let readout: ReadoutItem[] = []
  if (demo === 'r') {
    readout = R_SET.map((r) => ({ label: `${r} Ω`, value: fmtA(value / r) }))
  } else if (demo === 'rc') {
    readout = [{ label: DEMO_LABEL.vc, value: `${((1 - Math.exp(-value)) * 100).toFixed(1)} %` }]
  } else if (demo === 'd') {
    readout = [
      { label: DEMO_LABEL.voltage, value: `${value.toFixed(2)} V` },
      { label: DEMO_LABEL.current, value: fmtA(diodeI(value)) },
    ]
  } else {
    const on = value > 1
    readout = [
      { label: 'ID', value: fmtA(mosI(value)) },
      { label: DEMO_LABEL.state, value: t(on ? DEMO_LABEL.on : DEMO_LABEL.off), state: on ? 'pass' : 'fail' },
    ]
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.pParts.title)}
      goal={t(ui.pParts.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pDigital"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.galleryTitle)} note={t(S.galleryNote)}>
        <Cards
          cols={4}
          items={PARTS.map((p) => ({ id: p.id, title: p.title, text: p.text }))}
          activeId={part}
          onPick={(item) => {
            setPart(item.id as PartId)
            setNote(null)
          }}
        />
        <PartFig id={part} />
        <Callout>
          <p>
            <b>{t(partItem.title)}</b> · {t(partItem.unit)}
          </p>
          <p>{t(partItem.mark)}</p>
          <p>
            <b>{t(S.onBoard)}</b>
          </p>
          <RefP text={partItem.test} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['fOpens', 'pmu', 'dc', 'connection', 'mosIntro']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.demoTitle)} note={t(S.demoNote)}>
        <Seg
          options={DEMOS.map((d) => ({ id: d.id, label: d.label }))}
          value={demo}
          onChange={(id) => {
            setDemo(id)
            const item = DEMOS.find((d) => d.id === id)
            if (item) {
              setNote({ kicker: S.kickerDemo, title: item.label, text: item.text })
            }
          }}
        />
        <div className="knob-row">
          <Knob
            label={demoItem.knob}
            value={value}
            unit={range.unit}
            min={range.min}
            max={range.max}
            step={range.step}
            onChange={(v) => setValues((prev) => ({ ...prev, [demo]: v }))}
          />
        </div>
        <DemoFig id={demo} value={value} />
        <Readout items={readout} />
        <Callout tone="warn">
          <p>{t(demoItem.text)}</p>
        </Callout>
        <Related ids={['fOpens', 'pmu', 'fDc', 'spec', 'mosRegion']} onOpen={onModuleChange} />
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
