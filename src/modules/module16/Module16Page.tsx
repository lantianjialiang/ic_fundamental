import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { LINKS, NODES, QUIZ, TAKEAWAY, type NodeId } from './data/content'

type Module16PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus = { kind: 'node'; id: NodeId } | { kind: 'link'; id: string } | { kind: 'takeaway' }

export function Module16Page({ moduleId, onModuleChange }: Module16PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'node', id: 'pnp' })
  const detail = resolveDetail(focus, t)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m16.title)}
      goal={t(ui.m16.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
      asideLater={t(ui.m16.asideLater)}
      nextId="alu"
      nextLabel={t(ui.m15.title)}
    >
      <Section title={t(ui.m16.introTitle)}>
        <p>{t(ui.m16.introBody)}</p>
      </Section>

      <Section title={t(ui.m16.figTitle)} note={t(ui.m16.figNote)}>
        <div className="pnpn">
          {NODES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pnpn__node pnpn__node--${item.id}${focus.kind === 'node' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'node', id: item.id })}
            >
              {t(item.title)}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m16.linkTitle)}>
        <div className="pick pick--3">
          {LINKS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pick__card${focus.kind === 'link' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => setFocus({ kind: 'link', id: item.id })}
            >
              {t(item.title)}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t(ui.m16.takeawayTitle)}>
        <button
          type="button"
          className={`takeaway${focus.kind === 'takeaway' ? ' is-active' : ''}`}
          onClick={() => setFocus({ kind: 'takeaway' })}
        >
          {t(TAKEAWAY)}
        </button>
      </Section>

      <Section title={t(ui.m16.quizTitle)} note={t(ui.m16.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.m16.yes)} no={t(ui.m16.no)} />
      </Section>
    </LessonFrame>
  )
}

function resolveDetail(focus: Focus, t: (text: import('../../i18n/locale').LText | string) => string) {
  if (focus.kind === 'takeaway') {
    return { kicker: t(ui.m16.kickerTakeaway), title: t(ui.m16.kickerOne), text: t(TAKEAWAY) }
  }
  if (focus.kind === 'link') {
    const item = LINKS.find((node) => node.id === focus.id)
    return { kicker: t(ui.m16.kickerLink), title: item ? t(item.title) : '', text: item ? t(item.text) : '' }
  }
  const item = NODES.find((node) => node.id === focus.id)
  return { kicker: t(ui.m16.kickerFig), title: item ? t(item.title) : '', text: item ? t(item.text) : '' }
}
