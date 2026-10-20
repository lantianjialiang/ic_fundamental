import { useState } from 'react'
import { LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Cards } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { INTRO, LEVELS, QUIZ, ROLES, S, TAKEAWAY, TYPES } from './data/pcbIntro'
import { PCB_META } from './meta'
import { RoleFig } from './IntroFigs'
import { LevelFig } from './IntroFigs2'
import { TypeFig } from './IntroFigs3'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }
type Focus = 'role' | 'level' | 'type'

function Line({ label, text, onOpen }: { label: LText; text: LText; onOpen: (id: ModuleId) => void }) {
  const { t } = useLocale()
  return (
    <p>
      <b>{t(label)}</b>
      <LessonRefText text={text} onOpenLesson={onOpen} />
    </p>
  )
}

export function PcbIntroPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>('role')
  const [roleId, setRoleId] = useState(ROLES[0].id)
  const [levelId, setLevelId] = useState(LEVELS[0].id)
  const [typeId, setTypeId] = useState(TYPES[0].id)

  const role = ROLES.find((r) => r.id === roleId) ?? ROLES[0]
  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0]
  const type = TYPES.find((x) => x.id === typeId) ?? TYPES[0]

  const notes: Record<Focus, PrepNote> = {
    role: { kicker: S.kickerRole, title: role.title, text: role.text },
    level: { kicker: S.kickerLevel, title: level.title, text: level.text },
    type: { kicker: S.kickerType, title: type.title, text: type.text },
  }
  const shown = notes[focus]

  const pickRole = (id: typeof roleId) => {
    setRoleId(id)
    setFocus('role')
  }
  const pickLevel = (id: typeof levelId) => {
    setLevelId(id)
    setFocus('level')
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PCB_META.pcbIntro.title)}
      goal={t(PCB_META.pcbIntro.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pcbMaterial"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.roleTitle)} note={t(S.roleNote)}>
        <Cards items={ROLES} activeId={roleId} cols={4} onPick={(item) => pickRole(item.id)} />
        <RoleFig active={roleId} onPick={pickRole} />
        <Callout>
          <p>
            <b>{`${t(role.title)} · ${t(role.sub)}`}</b>
          </p>
          <RefP text={role.text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pcbStack', 'pcbLayout']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.levelTitle)} note={t(S.levelNote)}>
        <LevelFig active={levelId} onPick={pickLevel} />
        <Callout>
          <p>
            <b>{`${t(level.title)} · ${t(level.example)}`}</b>
          </p>
          <RefP text={level.text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pPackage', 'pcbFlow', 'pcbLayout']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.typeTitle)} note={t(S.typeNote)}>
        <Cards
          items={TYPES}
          activeId={typeId}
          cols={3}
          onPick={(item) => {
            setTypeId(item.id)
            setFocus('type')
          }}
        />
        <TypeFig active={typeId} />
        <Callout>
          <p>
            <b>{`${t(type.title)} · ${t(type.sub)}`}</b>
          </p>
          <RefP text={type.text} onOpen={onModuleChange} />
          <Line label={S.typeWhere} text={type.where} onOpen={onModuleChange} />
          <Line label={S.typeWhy} text={type.why} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pcbMaterial', 'pcbStack', 'connection']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.en}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
