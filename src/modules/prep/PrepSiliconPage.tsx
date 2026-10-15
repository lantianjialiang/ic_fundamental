import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefParas, Related, type PrepNote } from './common'
import { CP_BODY, DIE_SIZES, INTRO, LITHO, MAKE, MAP_TEXT, QUIZ, S, STACK, TAKEAWAY, type DieSizeId, type StackId } from './data/silicon'
import { DIES, LithoFig, StackFig, WaferMakeFig, WaferMapFig, firstDie, type Die } from './SiliconFigs'
import './prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PrepSiliconPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const make = useStepPlayer(MAKE.length, 2200)
  const litho = useStepPlayer(LITHO.length, 2000)
  const [size, setSize] = useState<DieSizeId>(DIE_SIZES[0].id)
  const [die, setDie] = useState<Die>(firstDie(DIE_SIZES[0].id))
  const [layer, setLayer] = useState<StackId>(STACK[0].id)
  const [note, setNote] = useState<PrepNote | null>(null)

  const makeItem = MAKE[make.step]
  const lithoItem = LITHO[litho.step]
  const layerItem = STACK.find((s) => s.id === layer) ?? STACK[0]
  const whole = DIES[size].dies.filter((d) => d.status !== 'edge')
  const good = whole.filter((d) => d.status === 'good').length
  const dieText = die.status === 'good' ? MAP_TEXT.good : die.status === 'bad' ? MAP_TEXT.bad : MAP_TEXT.edge
  const shown: PrepNote = note ?? { kicker: S.kickerWafer, title: makeItem.title, text: makeItem.text }

  const withClear = (player: typeof make) => ({
    ...player,
    next: () => {
      setNote(null)
      player.next()
    },
    toggle: () => {
      setNote(null)
      player.toggle()
    },
  })

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.pSilicon.title)}
      goal={t(ui.pSilicon.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pPackage"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.makeTitle)} note={t(S.makeNote)}>
        <WaferMakeFig
          step={make.step}
          onPick={(i) => {
            make.goTo(i)
            setNote(null)
          }}
        />
        <StepControls player={withClear(make)} stepLabels={MAKE.map((m) => m.title)} />
        <Callout>
          <p>{t(makeItem.text)}</p>
        </Callout>
      </Section>

      <Section title={t(S.mapTitle)} note={t(S.mapNote)}>
        <Seg
          options={DIE_SIZES.map((d) => ({ id: d.id, label: d.label }))}
          value={size}
          onChange={(id) => {
            setSize(id)
            setDie(firstDie(id))
          }}
        />
        <WaferMapFig
          size={size}
          active={die.id}
          onPick={(d) => {
            setDie(d)
            setNote({ kicker: S.kickerMap, title: d.status === 'good' ? S.goodDie : S.badDie, text: d.status === 'good' ? MAP_TEXT.good : MAP_TEXT.bad })
          }}
        />
        <Readout
          items={[
            { label: S.gross, value: String(whole.length) },
            { label: S.good, value: String(good) },
            { label: S.yieldLabel, value: `${((good / whole.length) * 100).toFixed(1)} %` },
          ]}
        />
        <Callout tone={die.status === 'good' ? 'ok' : 'bad'}>
          <p>
            <b>{`Die (${die.col}, ${die.row})`}</b>
          </p>
          <p>{t(dieText)}</p>
        </Callout>
        <Callout tone="warn">
          <p>{t(MAP_TEXT.why)}</p>
          <p>{t(MAP_TEXT.edge)}</p>
        </Callout>
        <p className="prep-muted">{t(MAP_TEXT.terms)}</p>
      </Section>

      <Section title={t(S.lithoTitle)} note={t(S.lithoNote)}>
        <LithoFig step={litho.step} />
        <StepControls player={withClear(litho)} stepLabels={LITHO.map((l) => l.title)} />
        <Callout>
          <p>
            <b>{`${litho.step + 1}. ${t(lithoItem.title)}`}</b>
          </p>
          <p>{t(lithoItem.text)}</p>
        </Callout>
      </Section>

      <Section title={t(S.stackTitle)} note={t(S.stackNote)}>
        <StackFig
          active={layer}
          onPick={(id) => {
            setLayer(id)
            const item = STACK.find((s) => s.id === id)
            if (item) {
              setNote({ kicker: S.kickerStack, title: item.title, text: item.text })
            }
          }}
        />
        <Callout tone="warn">
          <p>
            <b>{t(layerItem.title)}</b>
          </p>
          <p>{t(layerItem.text)}</p>
          <p>
            <b>{t(S.fails)}</b>
            {t(layerItem.fault)}
          </p>
        </Callout>
        <Related ids={['scan', 'fScan', 'fOpens', 'fDc', 'mosChannel']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.cpTitle)}>
        <RefParas paras={CP_BODY} onOpen={onModuleChange} />
        <Related ids={['intro', 'connection', 'fAte', 'pPackage']} onOpen={onModuleChange} />
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
