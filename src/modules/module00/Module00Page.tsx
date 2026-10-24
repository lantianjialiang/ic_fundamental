import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, type Note } from '../fund/parts'
import { CHAIN, CHIP_TYPES, QUIZ, STDF_PARAS, STDF_RECORDS, STDF_TITLE, SYS, SYS_ORDER, TAKEAWAY, TERMS, WHAT, type ChainId, type SysId, type TermId } from './data/content'
import { GlossaryArt } from './GlossaryArt'
import { ChainFig, SysFig } from './IntroFigs'
import './module00.css'

type Module00PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
  onOpenConnection: () => void
}

export function Module00Page({ moduleId, onModuleChange, onOpenConnection }: Module00PageProps) {
  const { t } = useLocale()
  // 每组默认选中界面上的第一项；侧栏初始说明对应页面上第一组（产业链）的第一项
  const [chain, setChain] = useState<ChainId>(CHAIN[0].id)
  const [chip, setChip] = useState(CHIP_TYPES[0].id)
  const [term, setTerm] = useState<TermId>(TERMS[0].id)
  const [sys, setSys] = useState<SysId>(SYS_ORDER[0])
  const [note, setNote] = useState<Note>({ kicker: ui.m01.kickerChain, title: CHAIN[0].title, text: CHAIN[0].text })

  const termItem = TERMS.find((item) => item.id === term) ?? TERMS[0]
  const chipItem = CHIP_TYPES.find((item) => item.id === chip) ?? CHIP_TYPES[0]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m01.title)}
      goal={t(ui.m01.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      extra={
        <button type="button" className="lab__btn lab__btn--primary" onClick={onOpenConnection}>
          {t(ui.m01.next)}
        </button>
      }
    >
      <Section title={t(ui.m01.whatTitle)}>
        {WHAT.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
      </Section>

      <Section title={t(ui.m01.chainTitle)} note={t(ui.m01.chainNote)}>
        <ChainFig
          active={chain}
          onPick={(id) => {
            setChain(id)
            const step = CHAIN.find((item) => item.id === id)
            if (step) setNote({ kicker: ui.m01.kickerChain, title: step.title, text: step.text })
          }}
        />
      </Section>

      <Section title={t(ui.m01.chipsTitle)} note={t(ui.m01.chipsNote)}>
        <Cards
          items={CHIP_TYPES}
          activeId={chip}
          cols={4}
          onPick={(item) => {
            setChip(item.id)
            setNote({ kicker: ui.m01.kickerChip, title: item.title, text: item.text })
          }}
        />
        <p className="m00-params">
          <b>{t(ui.m01.chipParams)}</b>
          {chipItem.params.map((p) => t(p)).join(' · ')}
        </p>
      </Section>

      <Section title={t(ui.m01.termsTitle)} note={t(ui.m01.termsNote)}>
        <div className="m00-terms">
          {TERMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`m00-term${term === item.id ? ' is-active' : ''}`}
              onClick={() => {
                setTerm(item.id)
                setNote({ kicker: ui.m01.kickerTerm, title: `${item.name} · ${t(item.full)}`, text: item.text })
              }}
            >
              <GlossaryArt id={item.id} small />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        <figure className="term-fig m00-art">
          <GlossaryArt id={termItem.id} label={t(termItem.caption)} />
          <figcaption>
            <b>{termItem.name}</b> {t(termItem.caption)}
          </figcaption>
        </figure>
      </Section>

      <Section title={t(ui.m01.diagramTitle)} note={t(ui.m01.diagramNote)}>
        <SysFig
          active={sys}
          onPick={(id) => {
            setSys(id)
            setNote({ kicker: ui.m01.kickerDiagram, title: SYS[id].title, text: SYS[id].text })
          }}
        />
      </Section>

      <Section title={t(STDF_TITLE)}>
        {STDF_PARAS.map((para) => (
          <p key={para.zh}>{t(para)}</p>
        ))}
        <Callout>
          {STDF_RECORDS.map((rec) => (
            <p key={rec.id}>
              <b>{rec.id}</b>
              {` · ${t(rec.when)} · ${t(rec.has)}`}
            </p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.m01.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(ui.m01.quizTitle)} note={t(ui.m01.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m01.yes)} no={t(ui.m01.no)} />
      </Section>
    </LessonFrame>
  )
}
