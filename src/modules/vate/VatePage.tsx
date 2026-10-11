import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { QUIZ, S, TAKEAWAY } from './data/content'
import { IddqLab } from './IddqLab'
import { OsLab } from './OsLab'
import { type Note } from './parts'
import './vate.css'

type VatePageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Tab = 'iddq' | 'os'

const TABS: Array<{ id: Tab; label: LText; code: string }> = [
  { id: 'iddq', label: S.tabIddq, code: 'T100' },
  { id: 'os', label: S.tabOs, code: 'T200' },
]

const START_NOTE: Record<Tab, Note> = {
  iddq: { kicker: S.kickerIddq, title: S.asideIntroTitle, text: S.asideIntroText },
  os: { kicker: S.kickerOs, title: S.asideOsTitle, text: S.asideOsText },
}

export function VatePage({ moduleId, onModuleChange }: VatePageProps) {
  const { t } = useLocale()
  const [tab, setTab] = useState<Tab>(TABS[0].id)
  const [notes, setNotes] = useState<Record<Tab, Note>>(START_NOTE)
  const [quizFocus, setQuizFocus] = useState(false)

  const note: Note = quizFocus ? { kicker: S.kickerQuiz, title: S.quizTitle, text: S.quizNote } : notes[tab]
  const setNote = (id: Tab) => (n: Note) => {
    setNotes((prev) => ({ ...prev, [id]: n }))
    setQuizFocus(false)
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.vate.title)}
      goal={t(ui.vate.goal)}
      kicker={t(note.kicker)}
      asideTitle={t(note.title)}
      asideText={t(note.text)}
      asideLater={t(S.later)}
    >
      <Section title={t(S.introTitle)}>
        <p>{t(S.introBody)}</p>
        <Callout tone="warn">{t(S.disclaimer)}</Callout>
      </Section>

      <Section title={t(S.wsTitle)}>
        <div className="vws">
          <div className="vws__bar">
            <b>VATE</b>
            <span>{t(S.wsBar)}</span>
          </div>
          <div className="vws__body">
            <nav className="vws__tree">
              <p className="vws__tree-head">{t(S.tree)}</p>
              <div role="tablist" aria-label={t(S.treeAria)} aria-orientation="vertical" className="vws__tabs">
                {TABS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    id={`vate-tab-${item.id}`}
                    aria-selected={tab === item.id}
                    aria-controls={`vate-panel-${item.id}`}
                    className={`vws__tab${tab === item.id ? ' is-active' : ''}`}
                    onClick={() => {
                      setTab(item.id)
                      setQuizFocus(false)
                    }}
                  >
                    <span className="vws__code">{item.code}</span>
                    {t(item.label)}
                  </button>
                ))}
              </div>
            </nav>
            <div className="vws__main">
              {/* 两个实验台都保持挂载，切换测试项不丢 Datalog */}
              <div role="tabpanel" id="vate-panel-iddq" aria-labelledby="vate-tab-iddq" hidden={tab !== 'iddq'}>
                <IddqLab onNote={setNote('iddq')} />
              </div>
              <div role="tabpanel" id="vate-panel-os" aria-labelledby="vate-tab-os" hidden={tab !== 'os'}>
                <OsLab onNote={setNote('os')} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <div onClick={() => setQuizFocus(true)}>
          <QuizList questions={QUIZ} yes={t(S.yes)} no={t(S.no)} />
        </div>
      </Section>
    </LessonFrame>
  )
}
