import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { LatchupFig } from './LatchupFig'
import { LINKS, NODES, QUIZ, TAKEAWAY, WORDS, type NodeId, type WordId } from './data/content'

type Module16PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Focus =
  | { kind: 'word'; id: WordId }
  | { kind: 'node'; id: NodeId }
  | { kind: 'link'; id: string }
  | { kind: 'takeaway' }

export function Module16Page({ moduleId, onModuleChange }: Module16PageProps) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>({ kind: 'word', id: 'pnpn' })
  const [wordId, setWordId] = useState<WordId>('pnpn')
  const word = WORDS.find((item) => item.id === wordId)
  const node = focus.kind === 'node' ? NODES.find((item) => item.id === focus.id) : null
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
      nextId="bench"
      nextLabel={t(ui.m17.title)}
    >
      <Section title={t(ui.m16.introTitle)}>
        <p>{t(ui.m16.introBody)}</p>
      </Section>

      <Section title={t(ui.m16.wordTitle)} note={t(ui.m16.wordNote)}>
        <div className="pick pick--3">
          {WORDS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pick__card${focus.kind === 'word' && focus.id === item.id ? ' is-active' : ''}`}
              onClick={() => {
                setWordId(item.id)
                setFocus({ kind: 'word', id: item.id })
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
        <LatchupFig word={wordId} t={t} />
        {word ? (
          <div className="term-explain">
            {word.explain.map((para) => (
              <p key={para.zh}>{t(para)}</p>
            ))}
          </div>
        ) : null}
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
        {node ? (
          <div className="term-explain">
            {node.explain.map((para) => (
              <p key={para.zh}>{t(para)}</p>
            ))}
          </div>
        ) : null}
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
  if (focus.kind === 'node') {
    const item = NODES.find((node) => node.id === focus.id)
    return { kicker: t(ui.m16.kickerFig), title: item ? t(item.title) : '', text: item ? t(item.text) : '' }
  }
  const item = WORDS.find((node) => node.id === focus.id)
  return { kicker: t(ui.m16.kickerWord), title: item?.title ?? '', text: item ? t(item.text) : '' }
}
