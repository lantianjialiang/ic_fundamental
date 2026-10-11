import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { AndFaultFig, ExplodeFig, SourceFig, TRAN_STEPS, TransitionFig } from './ConceptFig'
import {
  FAULTS,
  N_MAX,
  QUIZ,
  SOURCES,
  S_MAX,
  TAKEAWAY,
  VECTORS,
  countText,
  secondsOf,
  sup,
  timeParts,
  type FaultId,
  type SourceId,
} from './data/content'
import './vector.css'

type Module10PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'explode' } | { kind: 'source'; id: SourceId } | { kind: 'fault'; id: FaultId } | { kind: 'tran' }

export function Module10Page({ moduleId, onModuleChange }: Module10PageProps) {
  const { t } = useLocale()
  const [n, setN] = useState(20)
  const [s, setS] = useState(10)
  const [source, setSource] = useState<SourceId>('atpg')
  const [fault, setFault] = useState<FaultId>('A0')
  const [vec, setVec] = useState('10')
  const [tried, setTried] = useState<string[]>(['10'])
  const [focus, setFocus] = useState<Focus>({ kind: 'explode' })
  const tran = useStepPlayer(TRAN_STEPS.length, 1600)

  const cur = VECTORS.find((v) => v.id === vec) ?? VECTORS[0]
  const time = (bits: number) => {
    const tp = timeParts(secondsOf(bits))
    return `${tp.value} ${t(tp.unit)}`
  }

  const aside = (() => {
    if (focus.kind === 'source') {
      const item = SOURCES.find((x) => x.id === focus.id) ?? SOURCES[0]
      return { kicker: t(ui.m10.kickerSource), title: t(item.title), text: t(item.text) }
    }
    if (focus.kind === 'fault') {
      const item = FAULTS.find((x) => x.id === focus.id) ?? FAULTS[0]
      return { kicker: t(ui.m10.kickerFault), title: t(item.label), text: t(item.text) }
    }
    if (focus.kind === 'tran') {
      return { kicker: t(ui.m10.kickerFault), title: t(ui.m10.tranTitle), text: t(ui.m10.tranAside) }
    }
    return { kicker: t(ui.m10.kickerExplode), title: t(ui.m10.explodeAsideTitle), text: t(ui.m10.explodeAside) }
  })()

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m10.title)}
      goal={t(ui.m10.goal)}
      kicker={aside.kicker}
      asideTitle={aside.title}
      asideText={aside.text}
      asideLater={t(ui.m10.asideLater)}
      nextId="scan"
      nextLabel={t(ui.m10.next)}
    >
      <Section title={t(ui.m10.introTitle)}>
        <p>{t(ui.m10.introBody)}</p>
      </Section>

      <Section title={t(ui.m10.explodeTitle)} note={t(ui.m10.explodeNote)}>
        <div className="knob-row">
          <Knob
            label={ui.m10.knobN}
            value={n}
            unit=""
            min={1}
            max={N_MAX}
            step={1}
            onChange={(v) => {
              setN(v)
              setFocus({ kind: 'explode' })
            }}
          />
          <Knob
            label={ui.m10.knobS}
            value={s}
            unit=""
            min={0}
            max={S_MAX}
            step={1}
            onChange={(v) => {
              setS(v)
              setFocus({ kind: 'explode' })
            }}
          />
        </div>
        <ExplodeFig n={n} s={s} />
        <Readout
          items={[
            { label: `2${sup(n)}`, value: countText(n) },
            { label: ui.m10.timeIn, value: time(n) },
            { label: `2${sup(n + s)}`, value: countText(n + s) },
            { label: ui.m10.timeState, value: time(n + s) },
          ]}
        />
        <Callout tone="warn">{t(ui.m10.explodeSo)}</Callout>
      </Section>

      <Section title={t(ui.m10.sourceTitle)} note={t(ui.m10.sourceNote)}>
        <Cards
          items={SOURCES}
          activeId={source}
          onPick={(item) => {
            setSource(item.id)
            setFocus({ kind: 'source', id: item.id })
          }}
        />
        <SourceFig active={source} />
      </Section>

      <Section title={t(ui.m10.faultTitle)} note={t(ui.m10.faultNote)}>
        <Seg
          options={FAULTS.map((f) => ({ id: f.id, label: f.label }))}
          value={fault}
          onChange={(id) => {
            setFault(id)
            setTried([vec])
            setFocus({ kind: 'fault', id })
          }}
        />
        <div className="row-actions">
          <span className="intro__note">{t(ui.m10.pickVec)}</span>
          <Seg
            options={VECTORS.map((v) => ({ id: v.id, label: v.id }))}
            value={vec}
            onChange={(id) => {
              setVec(id)
              setTried((list) => (list.includes(id) ? list : [...list, id]))
              setFocus({ kind: 'fault', id: fault })
            }}
          />
        </div>
        <AndFaultFig a={cur.a} b={cur.b} fault={fault} tried={tried} />

        <h3 className="m10-sub">{t(ui.m10.tranTitle)}</h3>
        <p className="intro__note">{t(ui.m10.tranNote)}</p>
        <div onClickCapture={() => setFocus({ kind: 'tran' })}>
          <StepControls player={tran} stepLabels={TRAN_STEPS} />
        </div>
        <TransitionFig step={tran.step} />
      </Section>

      <Section title={t(ui.m10.moreTitle)}>
        <Callout>
          <p>{t(ui.m10.scanNote)}</p>
          <p>{t(ui.m10.moreNote)}</p>
        </Callout>
      </Section>

      <Section title={t(ui.m10.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.m10.quizTitle)} note={t(ui.m10.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m10.yes)} no={t(ui.m10.no)} />
      </Section>
    </LessonFrame>
  )
}
